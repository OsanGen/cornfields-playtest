import * as THREE from 'three';
import {smooth,clamp} from './asylum-crash.js';
export function vineClosure(time,officers){
 if(!officers||officers.length!==2||officers.some(p=>p[2]>-2.5))throw new Error('Both officers must clear before closure');
 return {amount:smooth(time/3.5),collider:time>=3.5,bounds:{min:[-1.1,0,-.4],max:[1.1,2.5,.4]}};
}
export function createVines(){
 const root=new THREE.Group();root.name='Original field vines';const material=new THREE.MeshStandardMaterial({color:0x243c25,roughness:.95}),gate=new THREE.Group(),engulf=new THREE.Group();root.add(gate,engulf);
 for(let i=0;i<12;i++){
  const path=new THREE.CatmullRomCurve3(Array.from({length:7},(_,j)=>new THREE.Vector3(-1.1+j*.365,.15+i*.19+Math.sin(j*1.8+i)*.11,Math.sin(j*1.3+i)*.10)));
  const mesh=new THREE.Mesh(new THREE.TubeGeometry(path,24,.035,6,false),material);gate.add(mesh);
 }
 for(let i=0;i<14;i++){
  const path=new THREE.CatmullRomCurve3(Array.from({length:18},(_,j)=>{const t=j/17,a=t*Math.PI*4+i*.45;return new THREE.Vector3(Math.cos(a)*(.28+.1*t),t*1.9,Math.sin(a)*(.28+.1*t));}));
  engulf.add(new THREE.Mesh(new THREE.TubeGeometry(path,52,.035,6,false),material));
 }
 return {root,gate,engulf,update({closure=0,consumption=0,target=[0,0,0]}={}){gate.visible=closure>0;gate.scale.x=Math.max(.001,clamp(closure));engulf.visible=consumption>0;engulf.position.fromArray(target);engulf.scale.set(1,Math.max(.001,clamp(consumption)),1);},dispose(){root.traverse(o=>o.geometry?.dispose());material.dispose();}};
}
