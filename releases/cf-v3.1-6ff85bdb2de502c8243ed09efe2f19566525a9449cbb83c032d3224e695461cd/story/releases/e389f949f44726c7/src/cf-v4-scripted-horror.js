// V4 horror outcomes and local pursuit. The adapter owns presentation, input
// and route receipts.
import {advanceZombieDetection,createEnemy,trackZombieTarget,transition} from './zombie-ai.js';
import {hasLineOfSight,moveBounded} from './cf-v4-evasion-geometry.js';

const copy = value => JSON.parse(JSON.stringify(value));
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const KINDS = new Set(['hand', 'wayne', 'randall']);
const matches = (a, b) => !!a && !!b && ['runId', 'sceneId', 'entryId'].every(k => a[k] === b[k]);
const WAYNE_HAND_PATH = [[0,.25],[0,-2],[2,-2],[2,-4.2]];
const WAYNE_SOUND_TIMES = [4,9,15,21,25];
export const HORROR_TIMING = Object.freeze({wayneCapture:27, wayneTerminal:30, handCollapse:1.5});
export const RANDALL_AMBUSH_SITE = Object.freeze({x:27,z:10});

const TRAIL = {bounds:{x:[17,33],z:[4,15]}};
const distanceBetween = (a,b) => Math.hypot(a.x-b.x,a.z-b.z);
function randallAttacker(id,x,z,yaw) {
  return {id,enemy:{...createEnemy(),x,z,yaw},elapsed:0,events:[],moving:false};
}
function pursueRandall(actor,player,dt,elapsed,colliders,noise,speed) {
  const {enemy}=actor,dx=player.x-enemy.x,dz=player.z-enemy.z,dist=Math.hypot(dx,dz);
  const facing=dist<.01?1:(-Math.sin(enemy.yaw)*dx-Math.cos(enemy.yaw)*dz)/dist;
  const seen=dist<8&&facing>-.22&&hasLineOfSight(enemy,player,colliders);
  const heard=noise&&dist<6?{type:'footsteps',position:{x:player.x,z:player.z}}:null;
  if(seen)enemy.memory.lastSeen={x:player.x,z:player.z};
  if(seen||heard)enemy.memory.lastKnown=seen?enemy.memory.lastSeen:heard.position;
  actor.elapsed=elapsed;
  actor.events.length=0;
  actor.moving=false;
  enemy.timer=Math.max(0,enemy.timer-dt);
  if(advanceZombieDetection(actor))return;
  if(!trackZombieTarget(actor,dt,{seen,heard},()=>{
    transition(actor,'predictive_search','lost_evidence');
    enemy.target=enemy.memory.lastKnown;
  }))return;
  const target=enemy.target;
  if(!target)return;
  const remaining=distanceBetween(enemy,target);
  const step=Math.min(Math.max(0,remaining-.5),speed*Math.min(dt,.1));
  if(step<=0)return;
  const next=moveBounded(enemy,{x:(target.x-enemy.x)*step/remaining,z:(target.z-enemy.z)*step/remaining},{...TRAIL,colliders},.2);
  actor.moving=distanceBetween(enemy,next)>.001;
  if(actor.moving)enemy.yaw=Math.atan2(enemy.x-next.x,enemy.z-next.z);
  Object.assign(enemy,next);
}

export function createScriptedHorror({kind, token, origin=RANDALL_AMBUSH_SITE, colliders=[]} = {}) {
  if (!KINDS.has(kind)) throw new TypeError('Unknown scripted horror kind');
  if (!token || !Number.isInteger(token.runId) || token.runId < 1 || typeof token.sceneId !== 'string' || !token.sceneId || !Number.isInteger(token.entryId) || token.entryId < 1) throw new TypeError('Invalid horror ownership token');
  const identity = copy(token);
  let phase = kind === 'hand' ? 'approach' : kind === 'wayne' ? 'hunt' : 'patrol';
  let elapsed = 0, phaseTime = 0, disposed = false, sequence = 0, completed = false;
  let struggleCount = 0, distance = Infinity, reducedEffects = false;
  const attackers=kind==='randall'?[randallAttacker('grabber',origin.x+2.1,origin.z+1.3,.95),randallAttacker('flanker',origin.x-3.8,origin.z-2.7,-2.2)]:[];
  let contact=null;
  const emitted = new Set();
  let events = [];
  const event = (type, detail = {}) => {
    if (emitted.has(type)) return;
    emitted.add(type);
    events.push({type, ...identity, id:++sequence, at:elapsed, ...detail});
  };
  const enter = next => { phase = next; phaseTime = 0; };
  function snapshot() {
    const proximity = Number.isFinite(distance) ? clamp(1 - distance / 7, 0, 1) : 0;
    return {kind, token:copy(identity), phase, elapsed, phaseTime, disposed, completed,
      weaponAllowed:false, healthMutationAllowed:false, retryAllowed:false,
      creatureVisible:kind === 'randall' && !['patrol','medic','complete'].includes(phase),
      handMoving:kind === 'wayne' && !disposed && !completed,
      struggleCount, struggleFeedback:phase === 'grab' ? Math.min(struggleCount, 4) / 4 : 0,
      // Reduced effects retain distance and action semantics, without camera sway.
      proximity, presentationIntensity:reducedEffects ? proximity * .25 : proximity,
      cameraSwayAllowed:!reducedEffects && kind === 'hand',
      captureProgress:kind === 'wayne' && phase === 'capture' ? clamp(phaseTime / 3, 0, 1) : 0,
      ...(kind==='randall'?{
        attackers:attackers.map(({id,enemy,moving},index)=>({id,x:enemy.x,z:enemy.z,yaw:enemy.yaw,state:enemy.state,moving,
          visible:index===0?!['patrol','medic','complete'].includes(phase):['run','ankle','command','bite','retreat'].includes(phase)})),
        contact:copy(contact),runEnabled:phase==='run',
      }:{}),
      objective:phase==='hunt'?'Move through the lab. Listen for the hand.':phase==='grab'?'Struggle.':
        phase==='run'?'Run back toward the house.':phase==='approach'?(kind==='randall'?'Something is in the rows.':'Examine the hand.'):null};
  }
  function update(dt, input = {}) {
    if (!Number.isFinite(dt) || dt < 0) throw new TypeError('Horror dt must be finite and nonnegative');
    events = [];
    if (disposed || completed || !matches(identity, input.token) || input.active !== true || input.ready !== true) return {state:snapshot(), events:[]};
    reducedEffects = input.reducedEffects === true;
    if (Number.isFinite(input.distance) && input.distance >= 0) distance = input.distance;
    const before = elapsed;
    elapsed += dt;
    phaseTime += dt;
    if (kind === 'hand') {
      if (phase === 'approach' && input.interact === true && distance <= (Number.isFinite(input.examineRadius) ? clamp(input.examineRadius, .1, 2) : 1.25)) {
        enter('examined'); event('hand-examined');
      }
      // Adapter acknowledges the halt/radio/recognition lines before collapse.
      if (phase === 'examined' && input.reportAcknowledged === true) { enter('collapse'); event('hand-collapse'); }
      if (phase === 'collapse' && phaseTime >= HORROR_TIMING.handCollapse) {
        enter('recovery'); completed = true; event('hand-complete', {outcome:'fainted', next:'outdoor-recovery'});
      }
    } else if (kind === 'wayne') {
      // The last three seconds always belong to the terminal attack. A slow
      // update crosses both boundaries in order, never extending the deadline.
      if (phase === 'hunt' && elapsed >= HORROR_TIMING.wayneCapture) {
        enter('capture'); phaseTime = elapsed - HORROR_TIMING.wayneCapture;
        event('wayne-capture', {at:HORROR_TIMING.wayneCapture});
      }
      if (phase === 'capture' && elapsed >= HORROR_TIMING.wayneTerminal) {
        elapsed = HORROR_TIMING.wayneTerminal; enter('fatal'); completed = true;
        event('wayne-complete', {outcome:'scripted-death', next:'family-report', at:HORROR_TIMING.wayneTerminal});
      } else if (phase === 'hunt') {
        // Sound/visual alternatives use one cue per authored threshold.
        for (const at of WAYNE_SOUND_TIMES) if (before < at && elapsed >= at) event(`wayne-scurrying-${at}`, {
          at, caption:at === 15 ? 'Three taps nearby.' : 'Something scurries nearby.',
          position:sampleWayneHandPath(at)
        });
      }
    } else {
      const player=input.player||origin, [grabber,flanker]=attackers;
      const lineDone=id=>input.lineComplete?.(id)===true;
      const hit=actor=>distanceBetween(actor.enemy,player)<.76&&hasLineOfSight(actor.enemy,player,colliders);
      const attach=(actor,next,type)=>{
        actor.moving=false;
        contact={...player,at:elapsed,attacker:actor.id,yaw:Math.atan2(player.x-actor.enemy.x,player.z-actor.enemy.z)};
        enter(next);event(type,{attacker:actor.id});
      };
      if(phase==='patrol'&&input.actorsReady===true)enter('approach');
      if(phase==='approach'){
        pursueRandall(grabber,player,dt,elapsed,colliders,true,2.15);
        if(hit(grabber))attach(grabber,'grab','randall-grab');
      }else if(phase==='grab'){
        if(input.struggle===true)struggleCount=Math.min(struggleCount+1,4);
        if(phaseTime>=(struggleCount>=4?.72:1.35)){
          enter('run');contact=null;
          event('randall-first-shot',{attacker:grabber.id});
        }
      }else if(phase==='run'){
        pursueRandall(flanker,player,dt,elapsed,colliders,input.moving||phaseTime<.8,3.1);
        if(phaseTime>=1.45&&lineDone('CF-V4-S19-D02')&&hit(flanker))attach(flanker,'ankle','randall-flank');
      }else if(phase==='ankle'&&lineDone('CF-V4-S19-D04')){
        enter('command');event('randall-aim',{attacker:flanker.id});
      }else if(phase==='command'&&lineDone('CF-S15-D05')){
        enter('bite');event('randall-bite',{attacker:flanker.id,outcome:'unavoidable-injury'});
      }else if(phase==='bite'&&phaseTime>=.5){
        enter('retreat');event('randall-retreat',{attacker:flanker.id,oliveSurvives:true});
      }else if(phase==='retreat'&&phaseTime>=1.2&&lineDone('CF-V4-S19-D06')){
        enter('medic');event('randall-medic',{speaker:'Brad'});
      }else if(phase==='medic'&&input.reportAcknowledged===true){
        enter('complete');completed=true;
        event('randall-complete',{outcome:'bitten',next:'clarence-stanley',aliveUnresolved:true});
      }
      // A shot sends each creature back toward a different side of the rows.
      const shot=phase!=='patrol'&&phase!=='approach'&&phase!=='grab';
      for(const [index,actor] of attackers.entries()){
        if(index===0?!shot:phase!=='retreat')continue;
        const dx=index===0?1:-.5,dz=index===0?.65:-1;
        Object.assign(actor.enemy,moveBounded(actor.enemy,{x:dx*Math.min(dt,.1)*1.9,z:dz*Math.min(dt,.1)*1.9},{...TRAIL,colliders},.2));
        actor.enemy.yaw=Math.atan2(-dx,-dz);
        actor.moving=true;
      }
    }
    return {state:snapshot(), events:events.map(copy)};
  }
  return {update, snapshot, dispose() { disposed = true; events = []; }};
}

export function sampleWayneHandPath(activeSeconds) {
  const path = WAYNE_HAND_PATH;
  const progress = clamp((activeSeconds - 3) / 24, 0, 1) * (path.length - 1);
  const index = Math.min(path.length - 2, Math.floor(progress));
  const [x,z] = path[index], [endX,endZ] = path[index + 1], blend = progress - index;
  return {x:x+(endX-x)*blend,y:.03,z:z+(endZ-z)*blend};
}

// Renderer-independent poses. Existing scene/view may apply these to its own
// retained mesh; this helper does not claim rendered or audio acceptance.
export function sampleCrawlingHand(activeSeconds, {captureProgress = 0, reducedEffects = false} = {}) {
  const t = Number.isFinite(activeSeconds) ? Math.max(0, activeSeconds) : 0;
  const capture = clamp(Number.isFinite(captureProgress) ? captureProgress : 0, 0, 1);
  return {bob:reducedEffects ? 0 : Math.sin(t * 10) * .018,
    yaw:Math.sin(t * 1.8) * .12, lunge:capture * capture,
    fingers:Array.from({length:5}, (_, i) => Math.sin(t * 11 + i * 1.3) * .35)};
}
