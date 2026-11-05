import * as THREE from 'three';
import {runCleanups} from '../../../../shared/runtime/resource-scope.js';

const TRAIL=[[19,7],[24,7],[27,10],[30,10]];
const OUTDOOR_SETS=new Set(['CHILDHOOD_POCKET','FARM_YARD','SEARCH_TRAIL','CREATURE_REVEAL']);
const noise=n=>{const value=Math.sin(n*12.9898+78.233)*43758.5453;return value-Math.floor(value);};
const segmentDistance=(x,z,a,b)=>{
 const dx=b[0]-a[0],dz=b[1]-a[1],length=dx*dx+dz*dz;
 const t=length?Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/length)):0;
 return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);
};
const trailDistance=(x,z)=>Math.min(...TRAIL.slice(1).map((end,i)=>segmentDistance(x,z,TRAIL[i],end)));

/** Decorative instances borrow loaded geometry/textures. Call dispose before
 * generic scene cleanup: only instance buffers and cloned materials belong here.
 * Scene bounds, interaction targets, ground, weather and lights remain external.
 */
export function decorateNarrativeOutdoors({group,setId,asset,foliage,heightAt=()=>0}={}){
 let disposed=false;
 const ownedMaterials=new Set(),batches=[],requirements=[];
 const root=new THREE.Group();root.name='Narrative outdoors '+setId;
 const dispose=()=>{
  if(disposed)return;disposed=true;
  const retiredBatches=batches.splice(0),retiredMaterials=[...ownedMaterials];ownedMaterials.clear();
  runCleanups([()=>root.removeFromParent(),...retiredBatches.flatMap(mesh=>[()=>mesh.removeFromParent(),()=>mesh.dispose()]),...retiredMaterials.map(material=>()=>material.dispose())]);
 };
 const handle={requirements,update(time,player,reduced){if(!disposed&&batches.some(mesh=>mesh.userData.narrativeMotion))foliage?.update?.(Number.isFinite(time)?time:0,player,reduced);},dispose};
 if(!OUTDOOR_SETS.has(setId))return handle;
 if(!group?.isObject3D)throw new Error('Narrative outdoors requires a scene group');
 const scene=asset?.scene||asset;
 if(!scene?.isObject3D)throw new Error('Narrative outdoors requires an already loaded asset');
 scene.updateMatrixWorld(true);
 const floor=(x,z)=>{const value=heightAt(x,z);return Number.isFinite(value)?value:0;};
 function sourcePart(mesh,parent,{grounded=false}={}){
  const relative=new THREE.Matrix4().copy(parent.matrixWorld).invert().multiply(mesh.matrixWorld);
  const box=new THREE.Box3().setFromBufferAttribute(mesh.geometry.attributes.position).applyMatrix4(relative);
  if(grounded)relative.premultiply(new THREE.Matrix4().makeTranslation(0,-box.min.y,0));
  const radius=Math.max(Math.hypot(box.min.x,box.min.z),Math.hypot(box.min.x,box.max.z),Math.hypot(box.max.x,box.min.z),Math.hypot(box.max.x,box.max.z));
  return {mesh,relative,radius,height:box.max.y-box.min.y};
 }
 function ownMaterial(source,motion){
  const make=entry=>{
   const clone=motion&&foliage?.material?foliage.material(entry):entry.clone();
   if(clone===entry)throw new Error('Foliage motion must return an owned material clone');
   ownedMaterials.add(clone);return clone;
  };
  return Array.isArray(source)?source.map(make):make(source);
 }
 function batch(part,placements,kind,{motion=false}={}){
  if(!placements.length)return;
  const mesh=new THREE.InstancedMesh(part.mesh.geometry,ownMaterial(part.mesh.material,motion),placements.length);
  mesh.name='Narrative '+kind+' '+part.mesh.name;mesh.userData.narrativeKind=kind;mesh.userData.narrativeMotion=motion;
  mesh.castShadow=false;mesh.receiveShadow=true;
  const matrix=new THREE.Matrix4(),position=new THREE.Vector3(),rotation=new THREE.Quaternion(),scale=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
  for(const [i,p] of placements.entries()){
   position.set(p.x,floor(p.x,p.z)+(p.y||0),p.z);rotation.setFromAxisAngle(up,p.yaw||0);scale.set(p.scale,p.scaleY??p.scale,p.scale);
   matrix.compose(position,rotation,scale).multiply(part.relative);mesh.setMatrixAt(i,matrix);
  }
  mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();root.add(mesh);batches.push(mesh);
 }
 try{
  if(setId==='CHILDHOOD_POCKET'){
   const variants=[0,1,2].map(i=>scene.getObjectByName('Broadleaf_'+i));
   if(variants.some(v=>!v))throw new Error('Existing woods require Broadleaf_0/1/2');
   const parts=variants.map(parent=>{const result=[];parent.traverse(mesh=>{if(mesh.isMesh&&mesh.geometry?.attributes.position)result.push(sourcePart(mesh,parent));});return result;});
   const leaves=parts.map(parts=>parts.filter(p=>/foliage|\bleaf\b|\bleaves\b|crown/i.test(p.mesh.name)));
   if(parts.some(parts=>!parts.length)||leaves.some(parts=>!parts.length))throw new Error('Existing Broadleaf woods require trunk and foliage meshes');
   const trees=[[-3,-4],[-3,4],[3,-4],[3,4],[-2.8,0],[2.8,-1]].map(([x,z],i)=>({x,z,scale:.88+noise(i)*.14,yaw:noise(i+9)*Math.PI*2,variant:i%3}));
   // Fill the horizon behind the six close trees without another material or
   // draw batch. All distant trunks remain outside the authored walk bounds.
   const backdrop=(x,z)=>{const i=trees.length;trees.push({x,z,scale:.95+noise(i+50)*.3,yaw:noise(i+90)*Math.PI*2,variant:i%3});};
   for(const z of [-8.8,10.2])for(let x=-10.5;x<=10.5;x+=3.5)backdrop(x,z);
   for(const x of [-7.5,7.5])for(const z of [-5,-1,3,6.5])backdrop(x,z);
   for(const z of [-12.5,13.4])for(let x=-12;x<=12;x+=4)backdrop(x,z);
   const shrubs=[];
   for(const side of [-1,1])for(const [i,z] of [-5.25,-4.3,-3.35,-2.4,-1.45,-.5,.45,1.4,2.35,3.3,4.25,5.2].entries()){
    const variant=i%3,scale=.2+noise(i+21)*.055,radius=Math.max(...leaves[variant].map(p=>p.radius)),height=Math.max(.001,...leaves[variant].map(p=>p.height));
    const x=side*(Math.max(2.35,1.43+radius*scale)+noise(i+side+15)*.2);
    shrubs.push({x,z,scale,scaleY:Math.min(.18+noise(i+24)*.02,.86/height),yaw:noise(i+30)*Math.PI*2,variant});
   }
   for(let i=0;i<3;i++){
    for(const part of parts[i])batch(part,trees.filter(p=>p.variant===i),'tree');
    for(const part of leaves[i])batch({...part,relative:sourcePart(part.mesh,variants[i],{grounded:true}).relative},shrubs.filter(p=>p.variant===i),'shrub',{motion:!!foliage?.material});
   }
   requirements.push('Six nearby existing broadleaf trees frame the childhood woods','Distant broadleaf forest backdrop fills the horizon beyond walking bounds','Low broadleaf shrubs frame the figure without blocking the central reveal approach');
  }else{
   const sources=[0,1,2].map(i=>scene.getObjectByName('corn_near_'+i));
   if(sources.some(mesh=>!mesh?.isMesh||!mesh.geometry?.attributes.position))throw new Error('Existing field requires corn_near_0/1/2');
   const parts=sources.map(mesh=>sourcePart(mesh,scene)),plants=[];
   function plant(x,z){
    const i=plants.length,variant=i%3,scale=.82+noise(i+40)*.12;
    const radius=parts[variant].radius*scale+.32;
    if(setId==='SEARCH_TRAIL'&&trailDistance(x,z)<.9+radius)return;
    if(setId==='FARM_YARD'&&x+radius>13.6&&x-radius<19.8&&z+radius>5.4&&z-radius<10)return;
    if(plants.some(p=>Math.hypot(p.x-x,p.z-z)<.48))return;
    plants.push({x,z,scale,yaw:noise(i+80)*Math.PI*2,variant});
   }
   if(setId==='SEARCH_TRAIL'){
    for(let segment=0;segment<TRAIL.length-1;segment++){
     const a=TRAIL[segment],b=TRAIL[segment+1],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
     for(let along=0;along<=length+.01;along+=.88)for(const side of [-1,1])for(const width of [2.5,3.5,4.5]){
      const lateral=side*(width+noise(along+width+segment)*.1),t=Math.min(1,along/length);
      plant(a[0]+dx*t-dz/length*lateral,a[1]+dz*t+dx/length*lateral);
     }
    }
    requirements.push('Existing corn flanks both sides of the authored bent search trail','The walking route and hand approach retain clear leaf and wind margins');
   }else if(setId==='FARM_YARD'){
    for(let x=15.6;x<=22.5;x+=.88)for(const z of [3.5,2.4,11.9,13])plant(x,z);
    for(const x of [22.2,23.2])for(let z=4.6;z<=11;z+=.88)plant(x,z);
    requirements.push('Existing corn frames the farm yard and distant field edge','Yard exit, recovery and search-entry walking space remain clear');
   }else{
    for(const side of [-1,1])for(const x of [3.4,4.4])for(let z=-4;z<=4.5;z+=.94)plant(side*x,z);
    for(let x=-2;x<=2;x+=.9)plant(x,-5.5);
    requirements.push('Existing corn frames the two static creature silhouettes','The central creature view stays open');
   }
   for(let i=0;i<3;i++)batch(parts[i],plants.filter(p=>p.variant===i),'corn',{motion:!!foliage?.material});
  }
  group.add(root);return handle;
 }catch(error){dispose();throw error;}
}
