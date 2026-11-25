import * as THREE from 'three';
import {applyPS2Materials} from './ps2-style.js';
import {box} from './asylum-cruiser.js';
import {bone} from './asylum-custody.js';
import {WOUND} from './asylum-story-script.js';
export const HOSPITAL=Object.freeze({bed:{min:[-1.85,0,-.9],max:[-.55,.75,1.25]},stand:[.3,1.58,.8],threshold:{min:[-.6,0,-1.65],max:[.6,2.7,-1.45]},boundaryZ:-8.00,radius:.28,attendant:[1.1,0,-.3],equipment:[]});
export function createWound(actor){
 const group=new THREE.Group();group.name='Small non-graphic left temple wound';const patch=new THREE.Mesh(new THREE.SphereGeometry(.019,12,8),new THREE.MeshStandardMaterial({color:0x4b2924,roughness:.92}));patch.scale.set(1,.56,.16);group.add(patch);
 const head=bone(actor,'head');head.add(group);actor.root.updateMatrixWorld(true);
 // Locate the left temple from the real head surface, then keep its fitted head-local attachment.
 let candidate=null;actor.root.traverse(o=>{if(!o.isSkinnedMesh||!/head/i.test(o.name))return;o.skeleton.update();for(let i=0;i<o.geometry.attributes.position.count;i++){const p=actor.root.worldToLocal(o.getVertexPosition(i,new THREE.Vector3()).applyMatrix4(o.matrixWorld));const score=p.distanceTo(new THREE.Vector3(...WOUND.local));if(!candidate||score<candidate.score)candidate={p,score};}});
 if(!candidate)throw new Error('Critical head surface missing for wound');
 group.position.copy(head.worldToLocal(actor.root.localToWorld(candidate.p.clone())));group.rotation.y=Math.PI/2;group.visible=false;
 return {root:group,side:WOUND.side,headLocal:group.position.toArray(),setVisible:v=>group.visible=!!v};
}
export function attendantTreatment(actor){
 const changed=[];actor.root.traverse(o=>{
  if(/badge|epaulette|police|duty|holster|pouch/i.test(o.name)&&o.isMesh){o.visible=false;changed.push(o.name);}
  if(o.isMesh)for(const m of [o.material].flat())if(/shirt|navy uniform|pants/i.test(m.name)){m.map=null;m.color.setHex(/pants/i.test(m.name)?0x69726c:0xb7c4b2);m.metalness=0;m.roughness=.9;m.needsUpdate=true;changed.push(m.name);}
 });return {runtimeOnly:true,changed};
}
export function createHospital(){
 const root=new THREE.Group();root.name='Original treatment room and connector';const plaster=new THREE.MeshStandardMaterial({color:0x989e94,roughness:1}),tile=new THREE.MeshStandardMaterial({color:0x53685f,roughness:.92}),floor=new THREE.MeshStandardMaterial({color:0x62675e,roughness:.96}),metal=new THREE.MeshStandardMaterial({color:0x46514d,metalness:.16,roughness:.86}),linen=new THREE.MeshStandardMaterial({color:0xb7bba7,roughness:1});
 box(root,'Treatment room floor',[6,.1,5],[0,-.05,.55],floor);
 for(const x of [-3,3]){box(root,'Treatment wall',[.12,3.2,5],[x,1.6,.55],plaster);box(root,'Gray green wall tiles',[.13,1.1,5],[x,.55,.55],tile);}
 box(root,'Room back wall',[6,3.2,.12],[0,1.6,3.05],plaster);
 for(const x of [-1.95,1.95])box(root,'Doorway shoulder',[2.1,3.2,.12],[x,1.6,-1.95],plaster);
 box(root,'Door lintel',[1.8,.4,.12],[0,3,-1.95],plaster);
 for(const x of [-.92,.92]){box(root,'Connector wall',[.12,3.2,6.4],[x,1.6,-5.10],plaster);box(root,'Connector tiles',[.13,1.1,6.4],[x,.55,-5.10],tile);}
 box(root,'Connector floor',[1.8,.1,6.4],[0,-.05,-5.10],floor);
 box(root,'Hall boundary door',[1.78,2.8,.13],[0,1.4,-8.55],metal);
 const sky=new THREE.MeshStandardMaterial({color:0xb7c7b4,emissive:0x92b2a2,emissiveIntensity:.35,roughness:.8});box(root,'Original skylight landmark',[1.1,.08,1.25],[0,3.1,-7.2],sky);
 const bed=new THREE.Group();bed.name='Clarence treatment bed';root.add(bed);const frame=box(bed,'Bed frame',[1.3,.10,2.15],[-1.2,.48,.15],metal),mattress=box(bed,'Bed mattress',[1.3,.22,2.15],[-1.2,.64,.15],linen);box(bed,'Pillow',[.95,.12,.37],[-1.2,.81,-.58],linen);
 for(const x of [-1.73,-.67])for(const z of [-.78,1.1])box(bed,'Bed leg',[.05,.48,.05],[x,.24,z],metal);
 const light=new THREE.HemisphereLight(0x91aead,0x343a32,.72);root.add(light);const key=new THREE.PointLight(0xd6d3a2,15,8,2);key.position.set(0,2.8,.3);root.add(key);
 // Cold fill preserves silhouettes; the existing ceiling pool remains the treatment landmark.
 applyPS2Materials(root,{profile:'environment'});
 return {root,bed,mattress,frame,stand:HOSPITAL.stand,dispose(){root.traverse(o=>o.geometry?.dispose());for(const m of [plaster,tile,floor,metal,linen,sky])m.dispose();}};
}

// Bounds are shared with the original meshes above and independently compared
// against their actual BoxGeometry bounds by the acceptance suite.
export const HOSPITAL_SOLIDS=Object.freeze([
 {name:'Clarence treatment bed',min:[-1.85,-.925],max:[-.55,1.225]},
 {name:'Left room wall',min:[-3.065,-1.95],max:[-2.935,3.05]},
 {name:'Right room wall',min:[2.935,-1.95],max:[3.065,3.05]},
 {name:'Room back wall',min:[-3,2.99],max:[3,3.11]},
 {name:'Left doorway shoulder',min:[-3,-2.01],max:[-.9,-1.89]},
 {name:'Right doorway shoulder',min:[.9,-2.01],max:[3,-1.89]},
 {name:'Left connector wall',min:[-.985,-8.3],max:[-.855,-1.9]},
 {name:'Right connector wall',min:[.855,-8.3],max:[.985,-1.9]},
 {name:'Hall boundary door',min:[-.89,-8.615],max:[.89,-8.485]},
]);
export function hospitalPositionClear(x,z,r=HOSPITAL.radius){
 if(!Number.isFinite(x)||!Number.isFinite(z))return false;
 // The foot disk stays supported within the union of room and connector floors.
 if(z>2.99-r||z< -8.3+r||x< -2.935+r||x>2.935-r)return false;
 if(z< -1.9&&Math.abs(x)>.855-r)return false;
 if(Math.hypot(x-HOSPITAL.attendant[0],z-HOSPITAL.attendant[2])<r+.45)return false;
 for(const b of HOSPITAL_SOLIDS){const dx=x-Math.max(b.min[0],Math.min(b.max[0],x)),dz=z-Math.max(b.min[1],Math.min(b.max[1],z));if(dx*dx+dz*dz<r*r-1e-10)return false;}
 return true;
}
export function moveHospital(player,dx,dz){
 const distance=Math.hypot(dx,dz);if(!Number.isFinite(distance))return {...player};const n=Math.max(1,Math.ceil(distance/.02)),p={...player};
 for(let i=0;i<n;i++){const x=p.x+dx/n,z=Math.max(HOSPITAL.boundaryZ,p.z+dz/n);if(hospitalPositionClear(x,p.z))p.x=x;if(hospitalPositionClear(p.x,z))p.z=z;}
 return p;
}
