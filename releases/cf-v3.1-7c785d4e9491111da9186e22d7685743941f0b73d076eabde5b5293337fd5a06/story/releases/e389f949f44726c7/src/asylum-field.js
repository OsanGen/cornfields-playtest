import * as THREE from 'three';
import {smooth,clamp} from './asylum-crash.js';
import {box} from './asylum-cruiser.js';
import {WOUND} from './asylum-story-script.js';
export function sampleField(scene,time,progress=8,playerX=0){
 const both=progress>=7.8,shot=['shot','apology','stanley_engulf','mike_engulf'].includes(scene),fired=shot&&(scene!=='shot'||time>=1.2);
 return {mike:[clamp(playerX,-.65,.65),1.58,-progress],clarance:[-.5,0,-Math.min(9,progress+1.1)],bothClear:both,stanleyVisible:['return','shot','apology','stanley_engulf'].includes(scene),stanley:[.32,0,-11.4],shotCount:fired?1:0,wound:fired?WOUND:null,stanleyConsumed:scene==='stanley_engulf'?smooth(time/4.8):scene==='mike_engulf'?1:0,mikeConsumed:scene==='mike_engulf'?smooth(time/4.8):0};
}
export function createField(){
 const root=new THREE.Group();root.name='Original bounded two-officer field route';const earth=new THREE.MeshStandardMaterial({color:0x33392d,roughness:1}),stalk=new THREE.MeshStandardMaterial({color:0x58603b,roughness:1,side:THREE.DoubleSide});
 box(root,'Field floor',[8,.10,22],[0,-.065,-8],earth);
 const g=new THREE.BufferGeometry(),v=[];
 for(let i=0;i<7;i++){const y=.35+i*.29,s=i%2?1:-1;v.push(0,y,0,s*.58,y+.20,0,s*.15,y+.3,.10);}
 g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.computeVertexNormals();const plants=new THREE.InstancedMesh(g,stalk,420),d=new THREE.Object3D();
 for(let i=0;i<420;i++){const s=i%2?1:-1;d.position.set(s*(1.2+Math.floor(i/140)*.65),0,-(i%140)*.12);d.rotation.y=i*2.399;d.scale.setScalar(.95+.08*Math.sin(i*3.71));d.updateMatrix();plants.setMatrixAt(i,d.matrix);}plants.computeBoundingSphere();root.add(plants);
 return {root,dispose(){root.traverse(o=>o.geometry?.dispose());earth.dispose();stalk.dispose();}};
}
