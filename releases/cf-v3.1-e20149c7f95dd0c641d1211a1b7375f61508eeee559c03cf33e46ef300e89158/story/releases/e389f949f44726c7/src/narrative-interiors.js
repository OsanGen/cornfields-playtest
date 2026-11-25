// Material dressing for existing room shells. Geometry, collision, camera and
// shared palette resources stay with their existing owners.
const freezePreset=preset=>Object.freeze(Object.fromEntries(Object.entries(preset).map(([key,value])=>[key,value&&typeof value==='object'?Object.freeze(value):value])));
const HOUSE_LIGHT=freezePreset({
 id:'house-daylight',hemisphere:{skyColor:0xfff4dc,groundColor:0x65625b,intensity:1.5},
 windowFill:{color:0xe3ead1,intensity:3.5},room:{color:0xffe3b3,intensity:8},
});
const HISTORICAL_LIGHT=freezePreset({
 id:'historical-warm-daylight',hemisphere:{skyColor:0xffedcf,groundColor:0x776650,intensity:1.8},
 windowFill:{color:0xffedcf,intensity:4},room:{color:0xffdfb0,intensity:5.5},
});

const painted=new Set(['wall','ceiling','door side wall','door header']);
const furnishings=new Set(['table','chair seat','chair back','counter','store counter','shelf','side cabinet','cabinet drawer','window frame','period radio']);
const cloth=new Set(['interview rug','sofa seat','sofa back','sofa arm','window curtain']);
const extent=(mesh,axis,fallback=1)=>{
 const value=mesh.geometry?.parameters?.[axis];return Number.isFinite(value)&&value>0?value:fallback;
};
const repeat=(x,y)=>[Math.max(.25,Math.min(8,x)),Math.max(.25,Math.min(8,y))];

function surface(mesh,historical){
 const name=mesh.name,w=extent(mesh,'width'),h=extent(mesh,'height'),d=extent(mesh,'depth');
 if(name==='floor')return {kind:'wood',repeat:repeat(w/1.8,d/1.8),wet:false,color:historical?0xc5b28e:0xb6aa90,roughness:.94};
 if(painted.has(name))return {kind:'paint',repeat:repeat(w/2,Math.max(h,d)/2),wet:false,color:name==='ceiling'?0xe3dccb:historical?0xdfd2b5:0xd8d1bc,roughness:.96};
 if(furnishings.has(name)){
  const vertical=name==='chair back'||name==='window frame',drawer=name==='cabinet drawer';
  return {kind:drawer?'wood':'cleanWood',repeat:repeat((vertical?Math.max(w,h):w)/1.1,(vertical?Math.max(d,w):d)/.85),wet:false,color:name==='period radio'?0x9f8c6c:drawer?0x9b876b:0xc5b08a,roughness:.89};
 }
 if(cloth.has(name))return {kind:'cloth',repeat:repeat(w/.9,Math.max(h,d)/.9),wet:false,color:name==='window curtain'?0xbdb095:name==='interview rug'?0x95816a:0x939175,roughness:.98};
 return null;
}

export function dressNarrativeInterior({group,setId,palette}={}){
 const historical=typeof setId==='string'&&setId.startsWith('HISTORICAL_');
 if(setId!=='FARM_INTERIOR'&&!historical)return Object.freeze({dispose(){},requirements:Object.freeze([]),lightingPreset:null});
 if(!Array.isArray(group?.children)||typeof palette?.material!=='function')throw new TypeError('Existing room group and ready environment palette required');
 const prepared=[],cache=new Map();
 // Static shell/furniture meshes are direct children. Do not descend into cast,
 // photographs or any other owned presentation root, even when names coincide.
 for(const mesh of group.children){
  if(!mesh.isMesh)continue;
  const spec=surface(mesh,historical);if(!spec)continue;
  const {kind,...options}=spec,key=JSON.stringify(spec);
  if(!cache.has(key))cache.set(key,palette.material(kind,options));
  const material=cache.get(key);if(!material?.isMaterial)throw new TypeError('Environment palette must return a material');
  prepared.push({mesh,previous:mesh.material,material,kind});
 }
 // Allocate all palette views before attaching any, so a failed palette request
 // cannot leave a half-dressed room. The palette still owns failed allocations.
 for(const {mesh,material}of prepared)mesh.material=material;
 const names=kind=>Object.freeze(prepared.filter(item=>item.kind===kind).map(item=>item.mesh.name));
 const wooden=Object.freeze(prepared.filter(item=>item.kind==='wood'||item.kind==='cleanWood').map(item=>item.mesh.name));
 const wallNames=names('paint'),floorNames=Object.freeze(prepared.filter(item=>item.mesh.name==='floor').map(item=>item.mesh.name));
 const furnitureNames=Object.freeze(wooden.filter(name=>name!=='floor')),clothNames=names('cloth');
 const requirements=Object.freeze([
  Object.freeze({id:'interior-floor',kind:'wood',required:true,meshes:floorNames,present:floorNames.length>0}),
  Object.freeze({id:'interior-painted-shell',kind:'paint',required:true,meshes:wallNames,present:wallNames.includes('wall')&&wallNames.includes('ceiling')}),
  Object.freeze({id:'interior-wood-furnishings',kind:'wood',required:true,meshes:furnitureNames,present:furnitureNames.length>0}),
  Object.freeze({id:'interior-cloth',kind:'cloth',required:false,meshes:clothNames,present:clothNames.length>0}),
 ]);
 let disposed=false;
 return Object.freeze({requirements,lightingPreset:historical?HISTORICAL_LIGHT:HOUSE_LIGHT,
  dispose(){if(disposed)return;disposed=true;for(const {mesh,previous,material}of prepared)if(mesh.material===material)mesh.material=previous;prepared.length=0;cache.clear();},
 });
}
