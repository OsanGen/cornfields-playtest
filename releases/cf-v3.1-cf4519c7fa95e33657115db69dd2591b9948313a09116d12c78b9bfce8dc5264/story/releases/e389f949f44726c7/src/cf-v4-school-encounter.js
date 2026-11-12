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
export function createSchoolEncounter({token,onOutcome=()=>{},doorDelay=true,searchSweep=true}={}){
 if(!token||!Number.isInteger(token.runId)||token.runId<1||!Number.isInteger(token.entryId)||token.entryId<1||typeof token.sceneId!=='string'||!token.sceneId)throw new TypeError('School entry token required');
 const owner=Object.freeze({...token});
 const ai={runId:owner.runId,enemy:null,elapsed:0,events:[],eventId:0};
 let disposed=false,attempt=1,elapsed=0,status='running',zombie,doors,player,searchUntil,patrolIndex,doorCue;
 let evidence=null,sweep=null,doorCommitment=null,eventId=0,events=[];
 const recentNoiseIds=new Set();
 const checkedRooms=new Set();
 const exitUnlocked=()=>checkedRooms.size===searchRooms.length;
 const layout=()=>({...SCHOOL_LAYOUT,colliders:schoolColliders(doors,exitUnlocked())});
 const patrol=nodes.filter(n=>/-hide$|-rear$|-hall$/.test(n.id));
 function reset(){
  elapsed=0;status='running';
  zombie=ai.enemy={...createEnemy(),...SCHOOL_LAYOUT.zombieStart,stateStartedAt:0};
  ai.elapsed=0;ai.events.length=0;
  player={...SCHOOL_LAYOUT.playerStart};doors=Object.fromEntries(rooms.map(r=>[r.door.id,true]));
  searchUntil=0;patrolIndex=0;doorCue=null;evidence=null;sweep=null;doorCommitment=null;
  eventId=0;events=[];recentNoiseIds.clear();checkedRooms.clear();
 }
 reset();
 const accepts=(eventToken=owner,eventAttempt=attempt)=>!disposed&&sameToken(owner,eventToken)&&eventAttempt===attempt;
 function finish(outcome){if(disposed||status!=='running')return false;status=outcome;onOutcome({type:outcome==='survived'?'school-survived':'school-captured',token:{...owner},attempt,elapsed});return true;}
 function snapshot(){
  const objective=status==='survived'?'Escaped the school.':exitUnlocked()?'Follow the glowing EXIT sign at the end of the hall.':`Check both side rooms (${checkedRooms.size}/${searchRooms.length}).`;
  const {x,z,yaw,state,stateStartedAt}=zombie,lastKnown=zombie.memory.lastKnown;
  return {token:{...owner},attempt,elapsed,status,zombie:{x,z,yaw,state,stateStartedAt},player:{...player},mode:status==='running'?state:'retired',lastKnown:lastKnown&&{...lastKnown},doors:{...doors},doorCue,
   events:events.slice(),searchingAtEvidence:!!sweep,openingDoor:doorCommitment?.active?doorCommitment.id:null,
   checkedRooms:[...checkedRooms],exitUnlocked:exitUnlocked(),threatActive:!disposed&&status==='running',objective};
 }
 function capture(eventToken=owner,at=elapsed,eventAttempt=attempt){if(!accepts(eventToken,eventAttempt)||status!=='running'||!Number.isFinite(at)||at<0||at>elapsed+1e-8)return false;return finish('captured');}
 function publish(type,position,fields={}){
  const event={id:++eventId,type,x:position.x,z:position.z,elapsed,...fields};
  events.push(event);
  return event;
 }
 function setDoor(room,open,actor){
  const {id}=room.door;
  doors[id]=open;
  doorCue={id,open,elapsed,actor};
  publish('door',room.door,{doorId:id,open,actor,radius:4.8});
 }
 function toggleDoor(id,eventToken=owner){
  if(!accepts(eventToken)||status!=='running')return false;
  const room=rooms.find(r=>r.door.id===id);
  if(!room||distance(player,room.door)>1.4)return false;
  const open=!doors[id],leaf=wall(id,1.94,2.06,room.center.z-.7,room.center.z+.7);
  const leafWorld={bounds:SCHOOL_LAYOUT.bounds,colliders:[leaf]};
  if(!open&&(!canOccupy(player,leafWorld)||!canOccupy(zombie,leafWorld)))return false;
  setDoor(room,open,'player');
  return true;
 }
 function seeTarget(colliders){
  const d=distance(zombie,player);
  if(d<=.001)return true;
  const facing=(-Math.sin(zombie.yaw)*(player.x-zombie.x)-Math.cos(zombie.yaw)*(player.z-zombie.z))/d;
  return d<8&&facing>-.15&&hasLineOfSight(zombie,player,sightColliders(colliders));
 }
 function schoolPath(target,world,dt){
  const path=findWaypointPath(zombie,target,world,.25);
  if(doorCommitment)doorCommitment.active=false;
  if(path.length||distance(zombie,target)<=.3)return path;
  const insideRoom=(actor,room)=>actor.x>2&&Math.abs(actor.z-room.center.z)<3;
  const room=rooms.find(r=>!doors[r.door.id]&&insideRoom(zombie,r))||rooms.find(r=>!doors[r.door.id]&&insideRoom(target,r));
  if(!room)return path;
  const approach={x:insideRoom(zombie,room)?2.65:1.35,z:room.center.z};
  const reached=distance(zombie,approach)<.18;
  if(!reached)return findWaypointPath(zombie,approach,world,.25);
  const id=room.door.id;
  const openWorld={...world,colliders:world.colliders.filter(c=>c.id!==id)};
  const opensRoute=findWaypointPath(zombie,target,openWorld,.25).length>0;
  // Leave a closed room even when a second closed door still blocks the destination.
  if(!opensRoute&&!insideRoom(zombie,room))return path;
  if(doorDelay&&id==='door-2'&&opensRoute&&zombie.target){
   if(doorCommitment?.id!==id||doorCommitment.evidence!==evidence)doorCommitment={id,evidence,elapsed:0,active:false};
   doorCommitment.active=true;
   doorCommitment.elapsed+=dt;
   if(doorCommitment.elapsed<1.4)return path;
  }
  setDoor(room,true,'zombie');
  doorCommitment=null;
  return path;
 }
 function hear(noises,world){
  let heard=null;
  for(const noise of noises){
   if(noise.id==null||recentNoiseIds.has(noise.id))continue;
   recentNoiseIds.add(noise.id);
   if(recentNoiseIds.size>64)recentNoiseIds.delete(recentNoiseIds.values().next().value);
   if(!Number.isFinite(noise.x)||!Number.isFinite(noise.z))continue;
   const closedDoors=world.colliders.filter(c=>/^door-/.test(c.id)&&c.id!==noise.doorId);
   const attenuation=hasLineOfSight(zombie,noise,closedDoors)?1:.55;
   const radius=Math.min(6,Math.max(0,noise.radius||0))*attenuation;
   if(distance(zombie,noise)<=radius){
    const position={x:noise.x,z:noise.z};
    // A closed leaf is a sound source, but its center is never a legal body target.
    if(noise.doorId&&doors[noise.doorId]===false)position.x=zombie.x>noise.x?noise.x+.65:noise.x-.65;
    heard={type:noise.type||'footsteps',position};
   }
  }
  return heard;
 }
 function pursue(dt,noises,world){
  if(doorCommitment)doorCommitment.active=false;
  const seen=seeTarget(world.colliders);
  const heard=hear(noises,world);
  if(seen)zombie.memory.lastSeen={x:player.x,z:player.z};
  if(seen||heard){
   const position=seen?zombie.memory.lastSeen:heard.position;
   if(!evidence||sweep||distance(evidence,position)>.45)evidence=position;
   sweep=null;zombie.memory.lastKnown=position;searchUntil=elapsed+6;
  }
  ai.elapsed=elapsed;ai.events.length=0;
  zombie.timer=Math.max(0,zombie.timer-dt);
  if(advanceZombieDetection(ai))return;
  const previousState=zombie.state;
  if(!trackZombieTarget(ai,dt,{seen,heard},()=>{
   transition(ai,'predictive_search','lost_evidence');zombie.target=zombie.memory.lastKnown;
  })){
   const target=zombie.memory.lastSeen;
   if(target)zombie.yaw=Math.atan2(zombie.x-target.x,zombie.z-target.z);
   if(previousState!=='detection_tell')publish('detection',zombie);
   return;
  }
  if(zombie.target&&zombie.state!=='chase'){
   const reached=distance(zombie,zombie.target)<.3;
   if(reached&&searchSweep&&elapsed<searchUntil){
    sweep??={startedAt:elapsed,endsAt:Math.min(searchUntil,elapsed+1.5),yaw:zombie.yaw};
    if(elapsed<sweep.endsAt){
     zombie.yaw=sweep.yaw+Math.sin((elapsed-sweep.startedAt)/(sweep.endsAt-sweep.startedAt)*2*Math.PI)*1.05;
     return;
    }
   }
   if(reached||elapsed>=searchUntil){
    transition(ai,'concealed_stalk','school_search_finished');
    zombie.target=null;zombie.memory.lastKnown=null;evidence=null;sweep=null;doorCommitment=null;
   }
  }
  let target=zombie.target||patrol[patrolIndex%patrol.length];
  if(!zombie.target&&distance(zombie,target)<.3)target=patrol[++patrolIndex%patrol.length];
  const speed=seen&&zombie.state==='chase'?(elapsed>100?1.33:1.2):.95;
  const moved=stepPath(zombie,schoolPath(target,world,dt),speed*dt,world,.25).position;
  if(distance(zombie,moved)>.00001)zombie.yaw=Math.atan2(zombie.x-moved.x,zombie.z-moved.z);
  Object.assign(zombie,moved);
 }
 function simulate(dt,controls,first){
  let world=layout();
  if(controls.player&&Number.isFinite(controls.player.x)&&Number.isFinite(controls.player.z)&&canOccupy(controls.player,world,.25))player={...player,...controls.player};
  const noises=first?[controls.noise].filter(Boolean):[];
  if(first&&controls.doorId&&toggleDoor(controls.doorId)){
   const event=events.at(-1);
   noises.push({...event,id:'door:'+event.id});
   world=layout();
  }
  if(first&&controls.footstep)noises.unshift({...publish('footsteps',player,{radius:controls.quiet?1.15:2.6}),id:'footstep:'+eventId});
  pursue(dt,noises,world);
  if(distance(zombie,player)<=.48&&hasLineOfSight(zombie,player,layout().colliders))finish('captured');
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
  events=[];
  const end=elapsed+dt,captureAt=controls.captureAt;
  if(captureAt!==undefined&&(!Number.isFinite(captureAt)||captureAt<elapsed||captureAt>end))throw new TypeError('Capture must fall inside this active interval');
  if(captureAt===elapsed){finish('captured');return snapshot();}
  let first=true;
  while(elapsed<end&&status==='running'){
   const previous=player;
   const next=Math.min(end,elapsed+.05,captureAt===undefined?Infinity:captureAt),step=Math.max(0,next-elapsed);
   elapsed=next;simulate(step,controls,first);first=false;
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
