import * as THREE from 'three';
import {installHands} from './hands.js';
import {viewmodelPose,flashlightPose,renderFirstPersonLayers} from './viewmodel-pose.js';
export function createEquipment(scene,camera,renderer){
 const gun=new THREE.Group(),knife=new THREE.Group(),torch=new THREE.Group(),muzzle=new THREE.PointLight(0xffd29b,0,3),ambient=new THREE.HemisphereLight(0xdce6ef,0x525158,2),beam=new THREE.SpotLight(0xe7efff,18,13,.3,.55,1),target=new THREE.Object3D();
 knife.visible=false;ambient.layers.set(1);muzzle.layers.set(1);beam.position.set(-.18,-.12,-.2);target.position.set(0,0,-10);beam.target=target;gun.add(muzzle);camera.add(gun,knife,torch,beam,target,ambient);if(!camera.parent)scene.add(camera);
 const hands=installHands({gun,knife,torch,muzzle,placeholders:[],renderer});let disposed=false,recoil=0,lastElapsed=0;
 const ready=hands.ready.then(()=>{if(disposed)throw new Error('Equipment disposed');if(hands.stats.status!=='ready'||hands.stats.flashlightStatus!=='ready')throw new Error('Required equipment models unavailable');});
 return {ready,stats:hands.stats,shot(){recoil=.16;},update(game,reduced){if(disposed)return;const pose=viewmodelPose({time:game.elapsed,recoil,reduced,aspect:camera.aspect}),left=flashlightPose({time:game.elapsed,reduced,aspect:camera.aspect});gun.position.fromArray(pose.position);gun.rotation.set(...pose.rotation);torch.position.fromArray(left.position);torch.rotation.set(...left.rotation);hands.update({elapsed:game.elapsed,runId:game.runId,progress:{checkpointIndex:0}},{recoil,reduced});beam.visible=game.combat.flashlightOn;torch.visible=true;muzzle.intensity=reduced?0:game.combat.muzzleFlash>0?4:0;recoil=Math.max(0,recoil-Math.max(0,game.elapsed-lastElapsed));lastElapsed=game.elapsed;},render(){renderFirstPersonLayers(renderer,scene,camera,true);},dispose(){if(disposed)return;disposed=true;hands.dispose();for(const o of [gun,knife,torch,beam,target,ambient])o.removeFromParent();beam.dispose();muzzle.dispose();}};
}
