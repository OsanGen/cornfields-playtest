import {canOccupy,hasLineOfSight,findWaypointPath,moveBounded,stepPath} from './cf-v4-evasion-geometry.js';
import {GAME_CONFIG} from './game-config.js';
const clone=v=>JSON.parse(JSON.stringify(v));
const wall=(id,minX,maxX,minZ,maxZ)=>({id,minX,maxX,minZ,maxZ});
export const WOODLAND_LAYOUT=Object.freeze({
  provenance:'NEW native woodland substitute; original requested refuge not established by bounded lookup',
  bounds:{x:[-12,12],z:[-14,12]},spawn:{x:0,z:10},bike:{x:8,z:-10,radius:1.45},enemySpawn:{x:-8,z:-10},eyeHeight:.95,
  colliders:[wall('refuge-west',-5.2,-4.8,-3,3),wall('refuge-east',.8,1.2,-3,3),wall('refuge-north-left',-5,-3,-3.2,-2.8),wall('refuge-north-right',-1,1,-3.2,-2.8),wall('refuge-south-left',-5,-3,2.8,3.2),wall('refuge-south-right',-1,1,2.8,3.2),wall('rock-east',4,6,-1,1)],
  nodes:[{id:'sw',x:-7,z:5},{id:'south',x:-2,z:5},{id:'inside',x:-2,z:0},{id:'north',x:-2,z:-5},{id:'nw',x:-7,z:-5},{id:'ne',x:3,z:-5},{id:'se',x:3,z:5},{id:'east',x:8,z:3},{id:'bike',x:8,z:-10}],
  patrol:[{x:-2,z:5},{x:-2,z:0},{x:-2,z:-5},{x:8,z:-10},{x:8,z:5}],
});
export const WOODLAND_ESCAPE_SECONDS=3.6;
export const WOODLAND_REVEAL_SECONDS=1.2;
const {targetPresses,inputReadyGrace,fullHealthSeconds}=GAME_CONFIG.grapple;
const pushSeconds=inputReadyGrace+fullHealthSeconds;
const revealAt=.48, backstepAt=.83, faceBikeAt=2.06, runAt=2.58;
const grabSeconds=.4, shoveSeconds=.75;
const clamp=t=>Math.max(0,Math.min(1,t));
const ease=t=>{t=clamp(t);return t*t*(3-2*t);};
const mix=(a,b,t)=>a+(b-a)*t;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const heading=(from,to)=>Math.atan2(from.x-to.x,from.z-to.z);
const turn=(a,b,t)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;
function slide(from,to,t,layout){
  return moveBounded(from,{x:(to.x-from.x)*t,z:(to.z-from.z)*t},layout);
}
function offset(from,toward,meters,layout){
  const length=distance(from,toward);
  return length>1e-6?slide(from,toward,meters/length,layout):{x:from.x,z:from.z};
}
export function canMountWoodlandBike(player,layout=WOODLAND_LAYOUT){
  return canOccupy(player,layout)&&Math.hypot(player.x-layout.bike.x,player.z-layout.bike.z)<=layout.bike.radius&&hasLineOfSight(player,layout.bike,layout.colliders);
}
const same=(a,b)=>a&&b&&a.runId===b.runId&&a.sceneId===b.sceneId&&a.entryId===b.entryId;
export function createWoodlandEncounter({token,layout=WOODLAND_LAYOUT}={}){
  if(!token||!Number.isInteger(token.runId)||!Number.isInteger(token.entryId)||typeof token.sceneId!=='string')throw new Error('Woodland requires scene token');
  const owner=Object.freeze({...token});let disposed=false,state='searching',elapsed=0,escapeElapsed=0,enemy={...layout.enemySpawn},lastKnown=null,patrol=0,interactHeld=true,active=false,events=[];
  let phaseStarted=0,script=null,scriptedPlayer=null,presses=0,lastPushAt=-Infinity;
  const phaseTime=()=>elapsed-phaseStarted;
  const emit=type=>events.push({type,token:{...owner}});
  function enter(next){state=next;phaseStarted=elapsed;}
  function result(accepted,reason){return {accepted,reason};}
  function capture(candidate=owner){
    if(disposed||!active||!same(candidate,owner)||!['searching','struggle'].includes(state))return result(false,'inactive-stale-or-terminal');
    enter('captured');emit('captured');return result(true,'captured');
  }
  function mount(player,candidate=owner){
    if(disposed||!active||!same(candidate,owner)||state!=='free')return result(false,'inactive-stale-or-terminal');
    if(!canMountWoodlandBike(player,layout))return result(false,'bike-not-reachable');
    enter('mounted');escapeElapsed=0;emit('mounted');return result(true,'mounted');
  }
  function pose(player){
    return {...player,y:player.y||0,yaw:Number.isFinite(player.yaw)?player.yaw:heading(player,layout.bike),pitch:player.pitch||0};
  }
  function startScare(player){
    const origin=pose(player);
    const point=[0,.62,-.62,1.2,-1.2,Math.PI].map(angle=>({
      x:origin.x+Math.sin(origin.yaw+angle)*2.5,z:origin.z+Math.cos(origin.yaw+angle)*2.5,
    })).find(candidate=>canOccupy(candidate,layout)&&hasLineOfSight(origin,candidate,layout.colliders));
    const from=point||offset(origin,layout.bike,1.9,layout);
    script={origin,from,contact:offset(from,origin,distance(from,origin)-1.2,layout),retreat:offset(origin,from,-1,layout)};
    enemy={...from};scriptedPlayer=origin;enter('scare');emit('behind');
  }
  function scare(previousAge){
    const age=phaseTime(),{origin,from,contact,retreat}=script;
    enemy=slide(from,contact,ease((age-revealAt)/.25),layout);
    const player=slide(origin,retreat,clamp((age-backstepAt)/(faceBikeAt-backstepAt)),layout);
    const towardThreat=turn(origin.yaw,heading(player,enemy),ease(age/revealAt));
    const facingBike=ease((age-faceBikeAt)/(runAt-faceBikeAt));
    scriptedPlayer={...origin,...player,yaw:turn(towardThreat,heading(player,layout.bike),facingBike),
      pitch:mix(mix(origin.pitch,.25,ease(age/revealAt)),0,facingBike)};
    if(previousAge<revealAt&&age>=revealAt)emit('scare');
    if(age>=runAt)enter('fleeing');
  }
  function startGrab(player){
    const origin=pose(player),from={...enemy};
    const contact=offset(from,origin,distance(from,origin)-.9,layout);
    script={origin,from,contact};enter('grab');emit('grab');
  }
  function grab(){
    const t=ease(phaseTime()/grabSeconds),{origin,from,contact}=script;
    enemy=slide(from,contact,t,layout);
    scriptedPlayer={...origin,yaw:turn(origin.yaw,heading(origin,contact),t),pitch:mix(origin.pitch,.21,t)};
    if(phaseTime()>=grabSeconds){script.origin=scriptedPlayer;enter('struggle');}
  }
  function struggle(count){
    scriptedPlayer=script.origin;
    if(phaseTime()>=pushSeconds){capture();return;}
    if(count<=0)return;
    presses=Math.min(targetPresses,presses+count);
    lastPushAt=elapsed;emit('push');
    if(presses===targetPresses){
      script.from={...enemy};
      script.retreat=offset(enemy,script.origin,-1.95,layout);
      enter('shove');emit('shove');
    }
  }
  function shove(){
    const t=clamp(phaseTime()/shoveSeconds),{origin,from,retreat}=script;
    enemy=slide(from,retreat,ease(t/.72),layout);
    const release=ease((t-.45)/.55);
    scriptedPlayer={...origin,yaw:turn(origin.yaw,heading(origin,layout.bike),release),pitch:mix(origin.pitch,0,release)};
    if(t===1)enter('free');
  }
  function snapshot(){
    const age=phaseTime();
    const cameraDrop=state==='grab'?.24*ease(age/grabSeconds):state==='struggle'?.24:state==='shove'?.24*(1-ease(age/shoveSeconds)):0;
    return {token:{...owner},state,elapsed,phaseTime:age,escapeElapsed,enemy:{...enemy},bike:{...layout.bike},eyeHeight:layout.eyeHeight,
      canMove:['searching','fleeing','free'].includes(state),scareVisible:state!=='scare'||age>=revealAt,
      scriptedPlayer:scriptedPlayer?{...scriptedPlayer}:null,cameraDrop,presses,targetPresses,pushImpulse:clamp(1-(elapsed-lastPushAt)/.24),
      equipment:['flashlight'],captureEnabled:!disposed&&active&&state==='searching',events:clone(events),disposed};
  }
  function update(dt,{player,active:isActive=true,paused=false,hidden=false,loading=false,interact=false,pushPresses=0}={}){
    events=[];active=!!isActive&&!paused&&!hidden&&!loading&&!disposed;
    if(!active||!Number.isFinite(dt)||dt<0)return snapshot();
    scriptedPlayer=null;
    const edge=!!interact&&!interactHeld;interactHeld=!!interact;
    if(state==='captured'||state==='escaped')return snapshot();
    if(state==='mounted'){
      escapeElapsed=Math.min(WOODLAND_ESCAPE_SECONDS,escapeElapsed+dt);
      if(escapeElapsed>=WOODLAND_ESCAPE_SECONDS){enter('escaped');emit('escaped');}
      return snapshot();
    }
    if(!canOccupy(player,layout))return snapshot();
    const previousAge=phaseTime();
    elapsed+=dt;
    if(state==='scare')scare(previousAge);
    else if(state==='grab')grab();
    else if(state==='struggle')struggle((Number.isSafeInteger(pushPresses)?Math.max(0,pushPresses):0)+Number(edge));
    else if(state==='shove')shove();
    else if(state==='free'&&edge)mount(player);
    else if(state==='fleeing'){
      const path=findWaypointPath(enemy,player,layout,.25);
      const step=Math.min(dt,.15)*4.9;
      const travel=hasLineOfSight(enemy,player,layout.colliders)?Math.min(step,Math.max(0,distance(enemy,player)-.9)):step;
      enemy=stepPath(enemy,path,travel,layout,.25).position;
      if(phaseTime()>=.8&&(distance(enemy,player)<=1.05||canMountWoodlandBike(player,layout))&&hasLineOfSight(enemy,player,layout.colliders))startGrab(player);
    }else if(state==='searching'&&distance(player,layout.bike)<=5.1&&hasLineOfSight(player,layout.bike,layout.colliders))startScare(player);
    if(state!=='searching')return snapshot();
    if(elapsed<WOODLAND_REVEAL_SECONDS)return snapshot();
    // Bounded simulation advances only active time; no arbitrary survival deadline.
    let remaining=Math.min(dt,1);
    while(remaining>0&&state==='searching'){
      const step=Math.min(.05,remaining);remaining-=step;
      const visible=Math.hypot(player.x-enemy.x,player.z-enemy.z)<=18&&hasLineOfSight(enemy,player,layout.colliders);
      if(visible)lastKnown={x:player.x,z:player.z};
      const target=lastKnown||layout.patrol[patrol%layout.patrol.length];
      const path=findWaypointPath(enemy,target,layout,.25);
      const moved=stepPath(enemy,path,step*(visible?1.35:1.05),layout,.25);enemy=moved.position;
      if(Math.hypot(enemy.x-target.x,enemy.z-target.z)<.3){if(lastKnown)lastKnown=null;else patrol++;}
      if(Math.hypot(player.x-enemy.x,player.z-enemy.z)<.65&&hasLineOfSight(enemy,player,layout.colliders))capture(owner);
    }return snapshot();
  }
  return {update,tick:update,snapshot,capture,mount,dispose(){disposed=true;active=false;events=[];script=null;scriptedPlayer=null;},layout};
}
export function sampleWoodlandEscape(seconds,{enemy,reduced=false}={}){
  const t=Math.max(0,Math.min(1,seconds/WOODLAND_ESCAPE_SECONDS)),ease=t*t*(3-2*t);
  const position={x:WOODLAND_LAYOUT.bike.x+ease*1.7,y:0,z:WOODLAND_LAYOUT.bike.z-ease*14};
  const forwardYaw=-.1;
  let yaw=forwardYaw;
  if(enemy&&!reduced&&seconds<1.4){
    const towardEnemy=Math.atan2(position.x-enemy.x,position.z-enemy.z);
    const offset=Math.atan2(Math.sin(towardEnemy-forwardYaw),Math.cos(towardEnemy-forwardYaw));
    const glance=Math.min(1,(1.4-seconds)/.85);
    yaw+=offset*glance*glance*(3-2*glance);
  }
  return {position,eyeHeight:1.05,yaw,pitch:-.04,wheelRotation:-ease*14/.32,progress:t,complete:t===1};
}
