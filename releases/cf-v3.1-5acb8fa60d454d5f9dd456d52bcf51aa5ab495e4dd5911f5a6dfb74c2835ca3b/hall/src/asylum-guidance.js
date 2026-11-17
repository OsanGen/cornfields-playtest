import * as THREE from 'three';
import {createNavigation} from './asylum-navigation.js';
export function objectiveTarget(world,progress){const id=!progress.firstUnlocked?'hall-key':!progress.unlocked?'room-a-key':!progress.completed?'room-b-token':null;return id?world.items.get(id):null;}
export function guidanceWaypoint(world,progress,area='hall',position=null,navigation=null){const item=objectiveTarget(world,progress);if(!item)return null;if(position&&navigation){const path=navigation.route(position,item,{traverseDoors:true}),approach={x:world.layout.foldHallArrival.x,z:world.layout.foldHallArrival.z-.35,y:.12};if(area==='hall'&&path.some(p=>p.kind==='fold')&&navigation.walkable(position,approach))return approach;const firstDoor=path.find(p=>p.kind==='door');if(firstDoor){const d=world.interiorDoors.get(firstDoor.doorId),side=d.axis==='x'?Math.sign(firstDoor.x-d.x):Math.sign(firstDoor.z-d.z),approach={x:d.x-(d.axis==='x'?side*.4:0),z:d.z-(d.axis==='z'?side*.4:0),y:.12};if(Math.hypot(position.x-d.x,position.z-d.z)<1.65&&navigation.walkable(position,approach))return approach;}const next=path.find(p=>p.kind==='fold'||p.kind==='door'||Math.hypot(p.x-position.x,p.z-position.z)>.12);if(!next)return item.area===area?item:null;if(next.kind==='door'){const d=world.interiorDoors.get(next.doorId);const side=d.axis==='x'?Math.sign(next.x-d.x):Math.sign(next.z-d.z);return {x:d.x-(d.axis==='x'?side*.4:0),z:d.z-(d.axis==='z'?side*.4:0),y:.12};}if(next.kind==='fold')return area==='B'?{...world.layout.bayReturn,y:.12}:{x:world.layout.foldHallArrival.x,z:world.layout.foldHallArrival.z-.35,y:.12};return {...next,y:.12};}if(item.area===area)return item;if(area==='B')return {...world.layout.bayReturn,y:.12};if(area==='A')return {x:-9.7,y:.12,z:0};if(item.area==='A')return {x:-8.5,y:.12,z:0};return {...world.layout.foldHallArrival,y:.12};}
function createWaypointCache(world,progress,navigation){
  let previous=null,target=null,lastX=NaN,lastZ=NaN;
  const closeTo=(origin,point,distance)=>point&&Math.hypot(origin.x-point.x,origin.z-point.z)<distance;
  const nearDoor=origin=>{
    for(const point of world.interiorDoors.values())if(closeTo(origin,point,2))return true;
    for(const door of world.layout.doors||[])if(Math.hypot(origin.x-door.center[0],origin.z-door.center[2])<2)return true;
    return [world.layout.foldHallArrival,world.layout.foldBayArrival,world.layout.bayReturn].some(point=>closeTo(origin,point,2));
  };
  return (area,origin)=>{
    const item=objectiveTarget(world,progress);
    const key=[area,world.doorVersion,progress.firstUnlocked,progress.unlocked,progress.completed,item?.id,item?.area,item?.x,item?.z,Math.floor(origin.x/.5),Math.floor(origin.z/.5)].join(':');
    const moved=previous&&(origin.x!==lastX||origin.z!==lastZ);lastX=origin.x;lastZ=origin.z;
    // Only the visual hint is cached. Near an interaction or turn, keep the
    // existing route query's immediate response; AI keeps its own cadence.
    const refresh=!previous||key!==previous.key||moved&&(
      Math.hypot(origin.x-previous.x,origin.z-previous.z)>=.2||nearDoor(origin)||nearDoor(previous)||closeTo(origin,target,.35)||
      target&&typeof navigation.walkable==='function'&&!navigation.walkable(origin,target));
    if(refresh){
      target=guidanceWaypoint(world,progress,area,origin,navigation);
      previous={key,x:origin.x,z:origin.z};
    }
    return target;
  };
}

export function createGuidance(world,progress,config,player=null,sharedNavigation=null){
  const navigation=sharedNavigation||createNavigation(world,progress),ownsNavigation=!sharedNavigation;
  const root=new THREE.Group(),arrow=new THREE.ArrowHelper(new THREE.Vector3(0,0,-1),new THREE.Vector3(0,.12,4),1.2,0x8fffd0,.35,.22);
  const ammo=new THREE.Mesh(new THREE.BoxGeometry(.3,.28,.3),new THREE.MeshStandardMaterial({color:0xffd576,emissive:0xffaa33,emissiveIntensity:.65}));
  ammo.position.set(config.ammoPoint.x,config.ammoPoint.y,config.ammoPoint.z);ammo.name='AMMO: E refill to six rounds';root.add(arrow,ammo);
  world.createSign('ammo-point-label','AMMO · E REFILL\n6 ROUNDS · 8 SECOND COOLDOWN',[config.ammoPoint.x,1.75,config.ammoPoint.z],0,2.15,.5,root);world.scene.add(root);
  const waypoint=createWaypointCache(world,progress,navigation),direction=new THREE.Vector3();
  let disposed=false;
  return {root,navigation,
    update(){
      if(disposed)return;
      const area=player?world.areaAt(player.state.x,player.state.z):'hall',origin=player?.state??world.layout.spawn,target=waypoint(area,origin);
      arrow.position.set(origin.x,.12,origin.z);arrow.visible=!!target;
      if(target){
        direction.set(target.x-arrow.position.x,0,target.z-arrow.position.z);
        const distance=direction.length();arrow.position.y=world.layout.player.eyeHeight-Math.min(.37,distance*.25);arrow.visible=distance>.06;
        if(distance>.06){arrow.setDirection(direction.normalize());arrow.setLength(Math.min(1.2,distance),Math.min(.35,distance*.4),Math.min(.22,distance*.25));}
      }
      for(const item of world.items.values()){const mesh=item.mesh;if(mesh?.material){mesh.material.emissive?.setHex(0x77ffbb);mesh.material.emissiveIntensity=.65;}}
    },
    dispose(){if(disposed)return;disposed=true;if(ownsNavigation)navigation.dispose();root.removeFromParent();root.traverse(o=>{o.geometry?.dispose();for(const m of [o.material].flat().filter(Boolean))m.dispose();});},
  };
}
