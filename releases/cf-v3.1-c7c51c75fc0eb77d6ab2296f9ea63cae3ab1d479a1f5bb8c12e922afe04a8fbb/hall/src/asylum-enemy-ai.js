// Hall adaptation of existing zombie-ai.js sight, memory, tell, chase, search, beam recoil and stagger states.
import {GAME_CONFIG as C} from '../../story/releases/e389f949f44726c7/src/game-config.js';
export function createEnemyState(spec){return {...spec,room:spec.kind==='zombie'?spec.area:null,radius:spec.kind==='rabbit'?.42:.28,state:'observe',stateStartedAt:0,timer:0,repath:0,path:[],lastKnown:null,lost:0,memory:0,flashlightExposure:0,contact:0,visible:true,patrolIndex:0,foldTimer:0,foldTarget:null};}
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
function transition(e,state,time,timer=0){e.state=state;e.stateStartedAt=time;e.timer=timer;}
export function senseEnemy(e,player,world,flashlight){const d=dist(e,player),dx=player.x-e.x,dz=player.z-e.z;const inRoom=!e.room||player.area===e.room;const seen=inRoom&&d<=C.zombie.visionDistance&&(d<1||(-Math.sin(e.yaw)*dx-Math.cos(e.yaw)*dz)/Math.max(.001,d)>=Math.cos(['chase','rage_chase'].includes(e.state)?C.zombie.chaseHalfAngle:C.zombie.visionHalfAngle))&&world.lineClear({...e,y:1.25},{...player,y:1.62});const beam=inRoom&&flashlight&&d<=C.zombie.flashlightRange&&(-Math.sin(player.yaw)*-dx-Math.cos(player.yaw)*-dz)/Math.max(.001,d)>=Math.cos(C.zombie.flashlightCone)&&world.lineClear({...player,y:1.62},{...e,y:1.25});return {seen,beam,distance:d,inRoom};}
export function updateEnemy(e,dt,{time,player,world,navigation,flashlight,noise=null}={}){
 if(!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.1);e.area=world.areaAt(e.x,e.z);e.timer=Math.max(0,e.timer-dt);e.repath=Math.max(0,e.repath-dt);e.memory=Math.max(0,e.memory-dt);
 if(e.state==='staggered'){e.contact=0;if(e.timer===0){transition(e,'investigate',time);e.repath=0;}return;}
 if(e.foldTarget){e.foldTimer-=dt;if(e.foldTimer<=0){const p=e.foldTarget;if(world.isSafe(p,e.radius)){e.x=p.x;e.z=p.z;e.area=world.areaAt(e.x,e.z);}e.foldTarget=null;e.path=[];e.repath=0;}return;}
 const sensed=senseEnemy(e,player,world,flashlight);
 if(sensed.seen){e.lastKnown={x:player.x,z:player.z};e.memory=C.zombie.memorySeconds;e.lost=0;}else e.lost+=dt;
 if(noise&&sensed.inRoom&&dist(e,noise)<=C.hearing.gunshotRadius){e.lastKnown={x:noise.x,z:noise.z};e.memory=C.zombie.memorySeconds;if(!['chase','rage_chase'].includes(e.state))transition(e,'investigate',time);}
 e.flashlightExposure=sensed.beam?e.flashlightExposure+dt:0;
 if(!['rage_chase','flashlight_recoil'].includes(e.state)&&e.flashlightExposure>=C.zombie.flashlightConfirmSeconds){transition(e,'flashlight_recoil',time,C.zombie.flashlightRecoilSeconds);e.contact=0;return;}
 if(e.state==='flashlight_recoil'){if(e.timer===0)transition(e,'rage_chase',time);return;}
 if(e.state==='detection_tell'){if(e.timer===0)transition(e,'chase',time);return;}
 if(sensed.seen&&!['chase','rage_chase'].includes(e.state)){transition(e,'detection_tell',time,.25);return;}
 if(['chase','rage_chase'].includes(e.state)&&!sensed.seen&&e.lost>C.zombie.lostSightSeconds)transition(e,'search',time);
 let target=e.memory>0?e.lastKnown:null;
 if(!target){transition(e,'observe',time);const nodes=navigation.targets(e);if(!nodes.length)return;target=nodes[e.patrolIndex%nodes.length];if(dist(e,target)<.35){e.patrolIndex++;target=nodes[e.patrolIndex%nodes.length];}}
 if(e.repath===0||!e.path.length){e.path=navigation.route(e,target,{radius:e.radius,room:e.room});e.repath=C.zombie.repathSeconds;}
 while(e.path.length&&e.path[0].kind!=='fold'&&dist(e,e.path[0])<.06)e.path.shift();
 const next=e.path[0];if(!next)return;
 if(next.kind==='fold'){e.foldTarget={x:next.x,z:next.z};e.foldTimer=1;e.path.shift();e.contact=0;return;}
 const speed=(e.state==='rage_chase'?C.zombie.rageSpeedByTier[0]:e.state==='chase'?C.zombie.chaseSpeedByTier[0]:e.state==='investigate'||e.state==='search'?C.zombie.investigateSpeed:C.zombie.stalkSpeed)*e.speedScale;
 if(navigation.move(e,next,speed*dt))e.path.shift();
 e.area=world.areaAt(e.x,e.z);
}
