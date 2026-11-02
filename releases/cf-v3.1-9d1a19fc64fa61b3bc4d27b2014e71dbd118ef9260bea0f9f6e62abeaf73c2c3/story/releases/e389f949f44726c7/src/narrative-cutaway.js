import * as THREE from 'three';
import {runCleanups} from '../../../../shared/runtime/resource-scope.js';

/** Minimal authored transport-box insert on the existing kitchen counter. */
export function createForensicsCutaway({group,palette}={}){
 const root=new THREE.Group();root.name='Forensics transport insert';
 const material=palette.material('wood',{repeat:[.8,.6],wet:false,color:0x6e6652,roughness:.95});
 const geometry=new THREE.BoxGeometry(.54,.3,.34),lidGeometry=new THREE.BoxGeometry(.57,.035,.37);
 const box=new THREE.Mesh(geometry,material),lid=new THREE.Mesh(lidGeometry,material);box.name='Closed transport box';box.position.set(11.65,1.05,4.7);lid.position.set(11.65,1.2175,4.7);root.add(box,lid);
 const lights=[];group.traverse(o=>{if(o.isLight){lights.push([o,o.intensity]);o.intensity*=.035;}});
 const actors=[];group.traverse(o=>{if(o.userData.storyIdentity){actors.push([o,o.visible]);o.visible=false;}});
 const previousFog=group.fog,previousBackground=group.background;group.background=new THREE.Color(0x030403);group.fog=new THREE.FogExp2(0x030403,.6);
 const light=new THREE.PointLight(0xbec6af,1.8,2.4);light.position.set(11.8,1.7,5.1);root.add(light);group.add(root);let disposed=false;
 return {requirements:['Closed transport box on existing counter','Dark audience-only forensics framing'],dispose(){if(disposed)return;disposed=true;runCleanups([
  ()=>root.removeFromParent(),()=>geometry.dispose(),()=>lidGeometry.dispose(),
  ()=>{for(const [o,intensity]of lights)o.intensity=intensity;for(const [o,visible]of actors)o.visible=visible;group.fog=previousFog;group.background=previousBackground;},
 ]);}};
}
