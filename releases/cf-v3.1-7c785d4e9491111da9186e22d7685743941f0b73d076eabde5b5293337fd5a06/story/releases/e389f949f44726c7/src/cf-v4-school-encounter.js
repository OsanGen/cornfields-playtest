import {canOccupy,hasLineOfSight,moveBounded,findWaypointPath,stepPath} from './cf-v4-evasion-geometry.js';
import {advanceZombieDetection,createEnemy,trackZombieTarget,transition} from './zombie-ai.js';

const sameToken=(a,b)=>!!a&&!!b&&a.runId===b.runId&&a.sceneId===b.sceneId&&a.entryId===b.entryId;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const wall=(id,minX,maxX,minZ,maxZ)=>({id,minX,maxX,minZ,maxZ});
const rooms=[-6,0,6].map((z,i)=>({id:`classroom-${i+1}`,center:{x:5.5,z},door:{id:`door-${i+1}`,x:2,z,width:1.4},bounds:{x:[2,9],z:[z-3,z+3]}}));
const searchRooms=rooms.slice(1);
const exit={id:'school-exit',x:0,z:9,width:2,depth:.12,endZ:10.25};
const exitLeft=exit.x-exit.width/2,exitRight=exit.x+exit.width/2;
const exitDoor=wall(exit.id,exitLeft,exitRight,exit.z,exit.z+exit.depth);
const walls=[wall('hall-left',-2.12,-2,-9,9),wall('north',-2,9,-9.12,-9),
 wall('south-left',-2,exitLeft,exit.z,exit.z+exit.depth),wall('south-right',exitRight,9,exit.z,exit.z+exit.depth),
 wall('exit-left',exitLeft-.12,exitLeft,exit.z,exit.endZ),wall('exit-right',exitRight,exitRight+.12,exit.z,exit.endZ),
 wall('east',9,9.12,-9,9),wall('partition-1',2,9,-3.06,-2.94),wall('partition-2',2,9,2.94,3.06)];
for(const room of rooms){const z=room.center.z;walls.push(wall(`${room.id}-wall-a`,1.94,2.06,z-3,z-.7),wall(`${room.id}-wall-b`,1.94,2.06,z+.7,z+3));}
const cover=rooms.map(room=>wall(`${room.id}-bookcase`,6,7.5,room.center.z+.75,room.center.z+1.75));
const desks=rooms.flatMap(room=>[-2.3,2.3].map((dz,i)=>({...wall(`${room.id}-desk-${i}`,4.5,5.5,room.center.z+dz-.325,room.center.z+dz+.325),blocksSight:false})));
const nodes=[];const edges=[];
for(let i=0;i<rooms.length;i++){const z=rooms[i].center.z;for(const [suffix,x,dz]of [['hall',0,0],['door',2,0],['middle',4,0],['far',8,0],['rear',8,-1.8],['near',4,-1.8],['hide',8,2.3],['side',4,2.3]])nodes.push({id:`r${i}-${suffix}`,x,z:z+dz});for(const [a,b]of [['hall','door'],['door','middle'],['middle','far'],['far','rear'],['rear','near'],['near','middle'],['far','hide'],['hide','side'],['side','middle']])edges.push([`r${i}-${a}`,`r${i}-${b}`]);if(i)edges.push([`r${i-1}-hall`,`r${i}-hall`]);}
/** One authoritative layout for rendering, collision, sight and navigation. */
export const SCHOOL_LAYOUT=Object.freeze({bounds:{x:[-2,9],z:[-9,exit.endZ]},rooms,exit,walls,cover,desks,nodes,edges,playerStart:{x:0,z:-5.5,yaw:Math.PI,pitch:0},setupAnchor:{position:{x:3.25,y:0,z:-8.1},lookTarget:{x:5.2,y:.9,z:-6.8},eyeHeight:.9},zombieStart:{x:6,z:-6,yaw:Math.PI/2},eyeHeight:.9});
export function schoolColliders(doors={},exitUnlocked=false){return [...walls,...cover,...desks,...(exitUnlocked?[]:[exitDoor]),...rooms.filter(r=>doors[r.door.id]===false).map(r=>wall(r.door.id,1.94,2.06,r.center.z-.7,r.center.z+.7))];}
const sightColliders=colliders=>colliders.filter(c=>c.blocksSight!==false);

/** Scene-owned simulation; no renderer, interval, wall clock or global input. */
export function createSchoolEncounter({token,onOutcome=()=>{}}={}){
 if(!token||!Number.isInteger(token.runId)||token.runId<1||!Number.isInteger(token.entryId)||token.entryId<1||typeof token.sceneId!=='string'||!token.sceneId)throw new TypeError('School entry token required');
 const owner=Object.freeze({...token});
 const ai={runId:owner.runId,enemy:null,elapsed:0,events:[],eventId:0};
 let disposed=false,attempt=1,elapsed=0,status='running',zombie,doors,player,searchUntil,patrolIndex,lastNoiseId,doorCue;
 const checkedRooms=new Set();
 const exitUnlocked=()=>checkedRooms.size===searchRooms.length;
 const layout=()=>({...SCHOOL_LAYOUT,colliders:schoolColliders(doors,exitUnlocked())});
 const patrol=nodes.filter(n=>/-hide$|-rear$|-hall$/.test(n.id));
 function reset(){
  elapsed=0;status='running';
  zombie=ai.enemy={...createEnemy(),...SCHOOL_LAYOUT.zombieStart,stateStartedAt:0};
  ai.elapsed=0;ai.events.length=0;
  player={...SCHOOL_LAYOUT.playerStart};doors=Object.fromEntries(rooms.map(r=>[r.door.id,true]));
  searchUntil=0;patrolIndex=0;lastNoiseId=null;doorCue=null;checkedRooms.clear();
 }
 reset();
 const accepts=(eventToken=owner,eventAttempt=attempt)=>!disposed&&sameToken(owner,eventToken)&&eventAttempt===attempt;
 function finish(outcome){if(disposed||status!=='running')return false;status=outcome;onOutcome({type:outcome==='survived'?'school-survived':'school-captured',token:{...owner},attempt,elapsed});return true;}
 function snapshot(){
  const objective=status==='survived'?'Escaped the school.':exitUnlocked()?'Follow the glowing EXIT sign at the end of the hall.':`Check both side rooms (${checkedRooms.size}/${searchRooms.length}).`;
  const {x,z,yaw,state,stateStartedAt}=zombie,lastKnown=zombie.memory.lastKnown;
  return {token:{...owner},attempt,elapsed,status,zombie:{x,z,yaw,state,stateStartedAt},player:{...player},mode:status==='running'?state:'retired',lastKnown:lastKnown&&{...lastKnown},doors:{...doors},doorCue,
   checkedRooms:[...checkedRooms],exitUnlocked:exitUnlocked(),threatActive:!disposed&&status==='running',objective};
 }
 function capture(eventToken=owner,at=elapsed,eventAttempt=attempt){if(!accepts(eventToken,eventAttempt)||status!=='running'||!Number.isFinite(at)||at<0||at>elapsed+1e-8)return false;return finish('captured');}
 function toggleDoor(id,eventToken=owner){if(!accepts(eventToken)||status!=='running')return false;const room=rooms.find(r=>r.door.id===id);if(!room||distance(player,room.door)>1.4)return false;const next=!doors[id];const leaf=wall(id,1.94,2.06,room.center.z-.7,room.center.z+.7);if(!next&&(!canOccupy(player,{bounds:SCHOOL_LAYOUT.bounds,colliders:[leaf]},.25)||!canOccupy(zombie,{bounds:SCHOOL_LAYOUT.bounds,colliders:[leaf]},.25)))return false;doors[id]=next;doorCue={id,open:next,elapsed};return true;}
 function seeTarget(colliders){
  const d=distance(zombie,player);
  if(d<=.001)return true;
  const facing=(-Math.sin(zombie.yaw)*(player.x-zombie.x)-Math.cos(zombie.yaw)*(player.z-zombie.z))/d;
  return d<8&&facing>-.15&&hasLineOfSight(zombie,player,sightColliders(colliders));
 }
 function schoolPath(target,world){
  const path=findWaypointPath(zombie,target,world,.25);
  if(path.length||distance(zombie,target)<=.3)return path;
  const insideRoom=(actor,room)=>actor.x>2&&Math.abs(actor.z-room.center.z)<3;
  const room=rooms.find(r=>!doors[r.door.id]&&insideRoom(zombie,r))||rooms.find(r=>!doors[r.door.id]&&insideRoom(target,r));
  if(!room)return path;
  const approach={x:insideRoom(zombie,room)?2.65:1.35,z:room.center.z};
  if(distance(zombie,approach)>=.45)return findWaypointPath(zombie,approach,world,.25);
  doors[room.door.id]=true;doorCue={id:room.door.id,open:true,elapsed,actor:'zombie'};
  return path;
 }
 function pursue(dt,noise,world){
  const seen=seeTarget(world.colliders);
  let heard=null;
  if(noise&&noise.id!==lastNoiseId&&Number.isFinite(noise.x)&&Number.isFinite(noise.z)&&distance(zombie,noise)<=Math.min(6,Math.max(0,noise.radius||0))){
   lastNoiseId=noise.id;heard={type:noise.type||'footsteps',position:{x:noise.x,z:noise.z}};
  }
  if(seen)zombie.memory.lastSeen={x:player.x,z:player.z};
  if(seen||heard){zombie.memory.lastKnown=seen?zombie.memory.lastSeen:heard.position;searchUntil=elapsed+6;}
  ai.elapsed=elapsed;ai.events.length=0;
  zombie.timer=Math.max(0,zombie.timer-dt);
  if(advanceZombieDetection(ai))return;
  if(!trackZombieTarget(ai,dt,{seen,heard},()=>{
   transition(ai,'predictive_search','lost_evidence');zombie.target=zombie.memory.lastKnown;
  })){
   zombie.yaw=Math.atan2(zombie.x-player.x,zombie.z-player.z);
   return;
  }
  if(zombie.target&&zombie.state!=='chase'&&(elapsed>=searchUntil||distance(zombie,zombie.target)<.3)){
   transition(ai,'concealed_stalk','school_search_finished');zombie.target=null;zombie.memory.lastKnown=null;
  }
  let target=zombie.target||patrol[patrolIndex%patrol.length];
  if(!zombie.target&&distance(zombie,target)<.3)target=patrol[++patrolIndex%patrol.length];
  const speed=seen&&zombie.state==='chase'?(elapsed>100?1.33:1.2):.95;
  const moved=stepPath(zombie,schoolPath(target,world),speed*dt,world,.25).position;
  if(distance(zombie,moved)>.00001)zombie.yaw=Math.atan2(zombie.x-moved.x,zombie.z-moved.z);
  Object.assign(zombie,moved);
 }
 function simulate(dt,controls){
  const world=layout(),{colliders}=world;
  if(controls.player&&Number.isFinite(controls.player.x)&&Number.isFinite(controls.player.z)&&canOccupy(controls.player,world,.25))player={...player,...controls.player};
  pursue(dt,controls.noise,world);
  if(distance(zombie,player)<=.48&&hasLineOfSight(zombie,player,colliders))finish('captured');
 }
 function advanceEscape(previous){
  // Count distinct classrooms only once Sadie is clear of the doorway.
  const room=searchRooms.find(({bounds})=>player.x>=bounds.x[0]+.6&&player.z>bounds.z[0]&&player.z<bounds.z[1]);
  if(room)checkedRooms.add(room.id);
  if(exitUnlocked()&&previous.z<exit.z&&player.z>=exit.z&&Math.abs(player.x-exit.x)<=exit.width/2-.25)finish('survived');
 }
 function update(dt,controls={}){
  if(!Number.isFinite(dt)||dt<0)throw new TypeError('Finite nonnegative school dt required');
  if(!accepts(controls.token||owner,controls.attempt??attempt)||status!=='running')return snapshot();
  if(controls.ready!==true||controls.controllable!==true||controls.paused||controls.hidden||controls.pointerReady!==true)return snapshot();
  const end=elapsed+dt,captureAt=controls.captureAt;
  if(captureAt!==undefined&&(!Number.isFinite(captureAt)||captureAt<elapsed||captureAt>end))throw new TypeError('Capture must fall inside this active interval');
  if(captureAt===elapsed){finish('captured');return snapshot();}
  while(elapsed<end&&status==='running'){
   const previous=player;
   const next=Math.min(end,elapsed+.05,captureAt===undefined?Infinity:captureAt),step=Math.max(0,next-elapsed);
   elapsed=next;simulate(step,controls);
   if(status==='running'&&captureAt!==undefined&&elapsed>=captureAt)finish('captured');
   if(status==='running')advanceEscape(previous);
   if(step===0&&status==='running')break;
  }
  return snapshot();
 }
 function retry(eventToken=owner){if(!accepts(eventToken)||status!=='captured')return false;attempt++;reset();return snapshot();}
 function dispose(){disposed=true;status='disposed';ai.events.length=0;}
 return {update,tick:update,snapshot,capture,toggleDoor,retry,dispose,canPlace:p=>canOccupy(p,layout(),.25),move:(p,delta)=>moveBounded(p,delta,layout(),.25)};
}
