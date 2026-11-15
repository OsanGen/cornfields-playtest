import * as THREE from 'three';
import {EMPTY_ASSET_VARIANTS,resolveV31Asset} from './cf-v31-asset-variants.js';
import {applyEnvironmentSurface,createPoreNormal} from './environment-materials.js';
import {optionalAsset} from './asset-safety.js';
import {createDecodedAssetStore} from '../../../../shared/runtime/decoded-asset-store.js';
import {runCleanups} from '../../../../shared/runtime/resource-scope.js';

const MAPS=Object.freeze({
 mud:['brown_mud_diff_1k.jpg','brown_mud_nor_gl_1k.jpg','brown_mud_rough_1k.jpg'],
 wood:['wood_planks_dirt_diff_1k.jpg','wood_planks_dirt_nor_gl_1k.jpg','wood_planks_dirt_rough_1k.jpg'],
 cleanWood:['wood_planks_diff_1k.jpg','wood_planks_nor_gl_1k.jpg','wood_planks_rough_1k.jpg'],
 cloth:['hessian_380_diff_1k.jpg','hessian_380_nor_gl_1k.jpg'],
});

/** Shared decoded maps, with scene-owned texture transforms and material uniforms. */
export function createEnvironmentAssets({assetBindings=EMPTY_ASSET_VARIANTS,textureLoader=new THREE.TextureLoader(),deadlineMs=15000,limit=18,maxBytes=64*1024*1024}={}){
 let closed=false,pore=null;
 const store=createDecodedAssetStore({limit,maxBytes,
  load:async key=>{const [url,color]=JSON.parse(key);const texture=await optionalAsset(textureLoader.loadAsync(url),deadlineMs,t=>t.dispose());texture.colorSpace=color?THREE.SRGBColorSpace:THREE.NoColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.anisotropy=4;return texture;},
  measure:t=>(t.image?.width||0)*(t.image?.height||0)*4,
  dispose:t=>t.dispose(),
 });
 const acquire=(name,color=false)=>{
  if(closed)throw Error('Environment assets disposed');
  const url=new URL('../assets/'+resolveV31Asset('field/'+name,assetBindings),import.meta.url).href;
  return store.acquire(JSON.stringify([url,!!color]));
 };
 async function palette({isCurrent=()=>true,kinds=Object.keys(MAPS)}={}){
  const leases=[],sources=new Map(),materials=new Map(),textures=new Set();let disposed=false;
  const dispose=()=>{if(disposed)return;disposed=true;runCleanups([...materials.values()].map(m=>()=>m.dispose()).concat([...textures].map(t=>()=>t.dispose()),leases.map(l=>()=>l.release())));};
  try{
   if(!Array.isArray(kinds)||!kinds.every(kind=>Object.hasOwn(MAPS,kind)||kind==='paint'))throw Error('Unknown palette material selection');
   await Promise.all(kinds.filter(kind=>kind!=='paint').flatMap(kind=>MAPS[kind].map((name,index)=>{
    if(sources.has(name))return null;
    const lease=acquire(name,index===0);leases.push(lease);sources.set(name,null);
    return lease.ready.then(texture=>{sources.set(name,texture);});
   })));
   if(closed||!isCurrent())throw Error('Environment palette owner expired');
  }catch(error){dispose();throw error;}
  function material(kind,{repeat=[1,1],wet=false,color,roughness=1}={}){
   if(disposed||closed)throw Error('Environment palette disposed');
   if(!Object.hasOwn(MAPS,kind)&&kind!=='paint')throw Error('Unknown environment material '+kind);
   if(!Array.isArray(repeat)||repeat.length!==2||!repeat.every(n=>Number.isFinite(n)&&n>0))throw Error('Invalid environment UV scale');
   const key=JSON.stringify([kind,repeat,wet,color,roughness]);if(materials.has(key))return materials.get(key);
   if(MAPS[kind]?.some(name=>!sources.get(name)))throw Error('Environment material was not acquired: '+kind);
   const clone=source=>{const t=source.clone();t.repeat.set(...repeat);t.needsUpdate=true;textures.add(t);return t;};
   const maps=MAPS[kind],base={color:color??(kind==='mud'?0xaaa38c:kind==='paint'?0xd8d1bc:0xaba38d),roughness};
   if(maps){base.map=clone(sources.get(maps[0]));base.normalMap=clone(sources.get(maps[1]));base.normalScale=new THREE.Vector2(kind==='mud'?.6:.45,kind==='mud'?.6:.45);if(maps[2])base.roughnessMap=clone(sources.get(maps[2]));}
   else{pore??=createPoreNormal();base.normalMap=clone(pore);base.normalScale=new THREE.Vector2(.24,.24);}
   const m=new THREE.MeshStandardMaterial(base);m.name='Shared environment '+kind;
   if(kind!=='cloth')applyEnvironmentSurface(m,{kind:kind==='cleanWood'?'wood':kind,wet});
   m.userData.environmentPalette={kind,repeat:[...repeat],wet};materials.set(key,m);return m;
  }
  return {material,dispose,diagnostics:()=>({materials:materials.size,textures:textures.size,disposed,shared:true})};
 }
 return {acquire,palette,diagnostics:()=>store.diagnostics(),dispose(){if(closed)return;closed=true;store.dispose();pore?.dispose();}};
}
