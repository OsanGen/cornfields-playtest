import * as THREE from 'three';
import {applyPS2Materials} from '../../story/releases/e389f949f44726c7/src/ps2-style.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone as cloneSkeleton} from 'three/addons/utils/SkeletonUtils.js';
import {createZombieAnimation} from './zombie-animation.js';
import {optionalAsset,stripRootTravel} from './asset-safety.js';
import {createZombiePoses} from './zombie-poses.js';
import {collectVisualResources,createVisualResourceDisposer} from '../../shared/runtime/visual-resources.js';
import {runCleanups} from '../../shared/runtime/resource-scope.js';
export function disposeModelResources(roots){const resources=new Set();for(const root of roots)root.traverse(o=>{if(o.geometry)resources.add(o.geometry);if(o.skeleton)resources.add(o.skeleton);for(const m of [o.material].flat().filter(Boolean)){resources.add(m);for(const v of Object.values(m))if(v?.isTexture)resources.add(v);}});for(const r of resources)r.dispose();}
export function normalizeModel(model,height){model.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3());if(!Number.isFinite(size.y)||size.y<=0)throw new Error('Invalid enemy model bounds');model.scale.multiplyScalar(height/size.y);model.updateMatrixWorld(true);const normalized=new THREE.Box3().setFromObject(model);model.position.y-=normalized.min.y;model.updateMatrixWorld(true);return new THREE.Box3().setFromObject(model);}
export function createEnemyViews(scene,enemies,{loader=new GLTFLoader()}={}){
 const roots=[],records=[],stats={status:'loading',models:0};let disposed=false;
 const releaseResource=createVisualResourceDisposer();
 function releaseModels(models){runCleanups([...collectVisualResources(models)].map(resource=>()=>releaseResource(resource)));}
 function releaseOwned(){
  const retired=records.splice(0),models=roots.splice(0);
  runCleanups([...retired.flatMap(r=>[()=>r.mixer?.stopAllAction(),()=>r.mixer?.uncacheRoot(r.model),()=>r.root.removeFromParent()]),()=>releaseModels(models)]);
 }
 const load=async url=>{const gltf=await optionalAsset(loader.loadAsync(url),8000,asset=>releaseModels([asset.scene]));if(disposed){releaseModels([gltf.scene]);throw new Error('Enemy views disposed');}roots.push(gltf.scene);return gltf;};
 const ready=Promise.all([enemies.some(e=>e.kind==='zombie')?load(new URL('../../story/releases/e389f949f44726c7/assets/field/zombie.glb',import.meta.url).href):Promise.resolve(null),load(new URL('../assets/rabbit-r1.glb',import.meta.url).href)]).then(([zombie,rabbit])=>{
  if(disposed)return;for(const enemy of enemies){const source=enemy.kind==='rabbit'?rabbit:zombie,model=cloneSkeleton(source.scene),root=new THREE.Group(),wrapper=new THREE.Group();roots.push(model);
   const record={enemy,root,model,animation:null,poses:null,mixer:null,actions:null,action:null,x:enemy.x,z:enemy.z,walkTime:0};records.push(record);
   root.name=enemy.id;root.add(wrapper);wrapper.add(model);normalizeModel(model,enemy.kind==='rabbit'?1.9:2.32);if(enemy.kind==='zombie')wrapper.rotation.y=Math.PI/2;scene.add(root);model.traverse(o=>{if(o.isMesh)o.frustumCulled=false;});
   applyPS2Materials(model,{profile:'character'});
   if(enemy.kind==='zombie'){record.animation=createZombieAnimation(model,source.animations);record.poses=createZombiePoses(model,root);}else{record.mixer=new THREE.AnimationMixer(model);record.actions=new Map(source.animations.map(c=>{const clip=c.clone();stripRootTravel(clip,['root']);return [clip.name,record.mixer.clipAction(clip)];}));if(!record.actions.has('Idle')||!record.actions.has('Slow Walk'))throw new Error('Rabbit animation clips unavailable');}
   stats.models++;
  }stats.status='ready';
 }).catch(error=>{const cancelled=disposed;disposed=true;runCleanups([releaseOwned]);if(!cancelled)stats.status='failed';throw error;});
 return {ready,stats,update(time,dt){if(disposed||stats.status!=='ready')return;for(const r of records){const e=r.enemy,travelled=Math.hypot(e.x-r.x,e.z-r.z);r.x=e.x;r.z=e.z;r.walkTime+=travelled/2;r.root.position.set(e.x,0,e.z);r.root.rotation.y=e.yaw+Math.PI;r.root.visible=!e.foldTarget;if(r.animation){r.poses.resetCycle();r.animation.update({state:e,game:{},time,walkTime:r.walkTime,travelled,dt});r.poses.update(e,time,{},travelled);}else{const name=travelled>.0001?'Slow Walk':'Idle';if(name!==r.action){r.actions.get(r.action)?.stop();r.actions.get(name).reset().play();r.action=name;}r.mixer.update(dt);}r.root.updateMatrixWorld(true);}},dispose(){if(disposed)return;disposed=true;stats.status='disposed';releaseOwned();}};
}
