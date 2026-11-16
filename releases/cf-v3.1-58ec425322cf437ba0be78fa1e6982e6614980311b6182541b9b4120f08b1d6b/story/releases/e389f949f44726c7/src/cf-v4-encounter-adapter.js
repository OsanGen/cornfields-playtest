import {canMountWoodlandBike,createWoodlandEncounter,sampleWoodlandEscape,WOODLAND_LAYOUT,WOODLAND_ESCAPE_SECONDS} from './cf-v4-woodland.js';
import {createSchoolEncounter,SCHOOL_LAYOUT} from './cf-v4-school-encounter.js';
import {createSchoolHallEncounter,SCHOOL_HALL} from './cf-v4-school-hall.js';
import {createMaze} from './maze.js';
import {blocksFor,createGame,interactionPrompt as fieldInteraction,startGame,updateGame} from './game.js';
import {GAME_CONFIG} from './game-config.js';
import {interactionLocked,sweptClear} from './grapple.js';
import {fieldPortalCrossing} from './field-portal.js';
import {attachSurvivalEnding} from './survival-ending.js';
import {createScriptedHorror,RANDALL_AMBUSH_SITE,sampleWayneHandPath} from './cf-v4-scripted-horror.js';
import {PATROL_LANDMARK} from './cf-v4-patrol-layout.js';
import {moveBounded} from './cf-v4-evasion-geometry.js';
import {runCleanups} from '../../../../shared/runtime/resource-scope.js';
const copy=x=>x==null?x:JSON.parse(JSON.stringify(x));
const same=(a,b)=>a&&b&&a.runId===b.runId&&a.sceneId===b.sceneId&&a.entryId===b.entryId;
const finite=p=>p&&['x','y','z'].every(k=>Number.isFinite(p[k]));
const nearbySchoolDoor=player=>SCHOOL_LAYOUT.rooms.map(room=>room.door).find(door=>Math.hypot(door.x-player.x,door.z-player.z)<=1.4);
function nearbySchoolMarks(player){
 const dx=8.85-player.x,dz=-1.7-player.z;
 const distance=Math.hypot(dx,dz);
 return distance<1.6&&(-Math.sin(player.yaw)*dx-Math.cos(player.yaw)*dz)>distance*.35;
}
function schoolOffer(i){
 if(i.snapshot.status!=='running')return null;
 const door=nearbySchoolDoor(i.player);
 if(door)return {id:door.id,label:'Open / close nearby door'};
 if(i.schoolPreset!=='combined')return null;
 if(!i.schoolMarksInspected&&nearbySchoolMarks(i.player))return {id:'school-marks',label:'Look at the chalk marks'};
 if(i.controller.canSetBell(i.player))return {id:'school-bell',label:'Set bell'};
 return null;
}
const horrorPredecessor={wayne:'waynePrelude',randall:'patrol'};
const woodlandPrompts={
 searching:'Find your bicycle. Stay away from the figure.',
 scare:'Something is behind you.',
 fleeing:'Run for the bike.',
 grab:'It caught you.',
 free:'Get to the bike.',
};
function fieldRevealPoint(game,distances,radius){
 const player=game.player,blocks=blocksFor(game);
 const portals=game.maze.cornDoors.filter(door=>game.player.zone==='field'?door.fieldReturn:door.fieldEntrance);
 for(const distance of distances){
  for(const angle of [0,.48,-.48,Math.PI/2,-Math.PI/2,Math.PI]){
   const yaw=player.yaw+angle;
   const point={x:player.x-Math.sin(yaw)*distance,z:player.z-Math.cos(yaw)*distance,yaw};
   if(sweptClear(game.maze,player,point,radius,blocks)&&
      !portals.some(door=>fieldPortalCrossing(door,player,point,radius)))return point;
  }
 }
 return {x:player.x,z:player.z,yaw:player.yaw};
}
export function createV4EncounterAdapter({view,input,audio,weather,getGame,ui,getReducedMotion=()=>false}={}){
 let item=null,mountReceipt=null,schoolStartReceipt=null,horrorHandoff=null,fieldMaze=null;
 const live=i=>i&&item===i&&!i.exited;
 const clear=()=>{input?.quarantine?.();input?.clear?.();input?.clearEdges?.();};
 function stopSceneSounds(i){for(const source of i.sceneSounds){try{source.stop();}catch{}}i.sceneSounds.clear();i.waynePan=null;}
 function playSceneSound(i,options){
  const source=audio?.sound?.({...options,bus:audio.master});
  if(!source)return;
  i.sceneSounds.add(source);
  source.addEventListener?.('ended',()=>i.sceneSounds.delete(source),{once:true});
  return source;
 }
 function playSchoolDoor(i,event,{pan=0,gain=.12,muffled=false}={}){
  playSceneSound(i,{noise:true,duration:event.open?.16:.13,gain,filter:muffled?330:event.open?660:480,pan});
  playSceneSound(i,{noise:true,duration:.045,gain:gain*.7,filter:muffled?850:1350,pan,delay:.045});
 }
 function exit({recoverable=false,discardRetained=false}={}){
  const i=item;
  if(discardRetained||i?.kind==='bicycleEscape'&&!recoverable)mountReceipt=null;
  if(!i)return;
  i.exited=true;item=null;
  if(i.fieldGame){audio?.stopCues?.();audio?.stopPlayerBreathing?.();}
  const errors=runCleanups([()=>stopSceneSounds(i),()=>i.controller?.dispose?.(),clear,()=>view?.releaseSet?.(i.token)]);
  if(errors.length)throw new AggregateError(errors,'Encounter cleanup failed');
 }
 async function enter({scene,token,checkpoint,emit,encounterRetry=false}){
  exit();
  if(!scene?.encounter_kind||!same(token,{...token,sceneId:scene.scene_id})||typeof emit!=='function')throw new Error('V4 encounter entry contract unavailable');
  const kind=scene.encounter_kind;
  if(!['woodland','bicycleEscape','schoolSetup','school','wayne','patrol','randall','waynePrelude'].includes(kind))throw new Error(`Unsupported V4 encounter ${kind}`);
  if(horrorHandoff&&(horrorHandoff.runId!==token.runId||horrorHandoff.source!==horrorPredecessor[kind]))horrorHandoff=null;
  const i={scene,token:{...token},emit,kind,ready:false,exited:false,time:0,done:false,finalAcknowledged:!scene.line_ids.length,actions:new Set(),sceneSounds:new Set(),controller:null,snapshot:{},interactHeld:true,phase:'normal',reorientation:0,walked:0,paused:false,flashlightOn:true,flashlightHeld:true,retryRequested:false};item=i;
  i.timedBicycle=['woodland','bicycleEscape'].includes(kind)&&checkpoint?.entryFixture?.woodlandVariant!=='refuge';
  i.fieldBicycle=kind==='woodland'&&i.timedBicycle;
  i.longSchool=kind==='school'&&!checkpoint?.entryFixture?.schoolPreset;
  i.classicField=kind==='randall'&&checkpoint?.entryFixture?.randallVariant!=='ambush';
  if(kind==='school'){
   const preset=checkpoint?.entryFixture?.schoolPreset;
   i.schoolPreset=preset==='wide-sweep'?'combined':preset||'combined';
   i.schoolSweepAngle=preset==='wide-sweep'?1.05:Math.PI/6;
  }
  let ride;
  if(kind==='bicycleEscape'){
   const previous=checkpoint?.event_ledger?.at(-1);
   const testEntry=checkpoint?.entryFixture?.bicycleMount===true||previous?.event_id===`${token.runId}:CF-S05:exit`&&previous.presentation==='playtest';
   const mountScene=testEntry?'CF-S06':'CF-S05';
   if(mountReceipt?.runId===token.runId&&mountReceipt.sceneId===mountScene)ride=mountReceipt;
   else if(testEntry){
    const start=sampleWoodlandEscape(0);
    ride=mountReceipt={runId:token.runId,sceneId:mountScene,flashlight:true,elapsed:0,escapeElapsed:0,
     enemy:WOODLAND_LAYOUT.enemySpawn,lookYaw:start.yaw,lookPitch:start.pitch,audioBeat:-1};
   }
   else throw new Error('Bicycle escape missing same-run accepted mount');
  }
  if(kind==='woodland'){
   mountReceipt=null;
   if(!i.fieldBicycle){
    i.woodlandLayout=WOODLAND_LAYOUT;
    i.controller=createWoodlandEncounter({token,layout:i.woodlandLayout});
   }
  }
  if(i.fieldBicycle||i.classicField){
   fieldMaze??=createMaze({corridors:true});
   i.fieldGame=createGame(fieldMaze,{unarmed:i.fieldBicycle,pursuerSpeed:i.fieldBicycle?.85:1});
   attachSurvivalEnding(i.fieldGame,{briefing:false,completionMode:'v4-field'});
   startGame(i.fieldGame);
  }
  if(i.longSchool)i.controller=createSchoolHallEncounter({token,retry:encounterRetry});
  else if(kind==='school')i.controller=createSchoolEncounter({token,
   doorDelay:['combined','door-only'].includes(i.schoolPreset),
   searchSweep:['combined','search-only'].includes(i.schoolPreset),
   bellEnabled:i.schoolPreset==='combined',
   searchAngle:i.schoolPreset==='combined'?i.schoolSweepAngle:1.05});
  if(kind==='wayne')i.controller=createScriptedHorror({kind,token});
  const setId=i.fieldGame?'CORNFIELD':['woodland','bicycleEscape'].includes(kind)?'V4_WOODLAND':i.longSchool?'V4_SCHOOL_HALL':['school','schoolSetup'].includes(kind)?'V4_SCHOOL':['wayne','waynePrelude'].includes(kind)?'V4_WAYNE':'SEARCH_TRAIL';
  const anchorId=i.fieldGame?'CORNFIELD_START':setId==='V4_WOODLAND'?'WOODLAND_START':setId==='V4_SCHOOL_HALL'?'SCHOOL_HALL_START':setId==='V4_SCHOOL'?'SCHOOL_START':setId==='V4_WAYNE'?'WAYNE_LAB_ENTRY':'SEARCH_BEND';
  clear();
  const patrolLayout=kind==='patrol'&&checkpoint?.entryFixture?.patrolLayout==='alternate'?'alternate':undefined;
  const d=await view.enterSet({setId,anchorId,token,period:scene.perspective?.period,actors:[],patrolLayout,timedBicycle:i.timedBicycle,fieldGame:i.fieldGame});
  if(!live(i))return;
  if(d?.ready!==true||!finite(d.anchor?.position)||!finite(d.anchor?.lookTarget)||!Number.isFinite(d.anchor?.eyeHeight)||!Array.isArray(d.colliders))throw new Error(`${scene.scene_id}: encounter geometry/readiness missing`);
  i.descriptor=d;i.eyeHeight=d.anchor.eyeHeight;
  if(patrolLayout)i.patrolLayout=patrolLayout;
  const a=d.anchor,dx=a.lookTarget.x-a.position.x,dz=a.lookTarget.z-a.position.z;
  i.player={...a.position,yaw:Math.atan2(-dx,-dz),pitch:Math.atan2(a.lookTarget.y-a.position.y-a.eyeHeight,Math.hypot(dx,dz))};
  if(horrorHandoff&&!i.fieldGame){
   const pose=horrorHandoff.player;
   if(!view.canPlaceBody({token:i.token,player:pose,eyeHeight:i.eyeHeight}))throw new Error(`${scene.scene_id}: prior encounter pose cannot be carried into the next scene`);
   i.player={...pose};
  }
  if(kind==='randall'){
   i.ambushOrigin={...i.player};
   i.controller=createScriptedHorror({kind,token,origin:i.ambushOrigin,colliders:d.colliders,fieldEscape:i.classicField});
   i.finishedLines=new Set();
   if(i.classicField&&!encounterRetry)i.soundCaption={text:'Brad’s radio falls silent.',until:2};
  }
  if(i.fieldGame){
   if(encounterRetry)audio?.reset?.();
   weather?.reset?.();
   i.fieldActive=true;i.player={...i.fieldGame.player,y:0};
  }
  if(i.longSchool)i.player=encounterRetry?{...SCHOOL_HALL.chaseStart}:
   schoolStartReceipt?.runId===token.runId?{...schoolStartReceipt.player}:{...SCHOOL_HALL.start};
  else if(kind==='school')Object.assign(i.player,schoolStartReceipt?.runId===token.runId?schoolStartReceipt.player:SCHOOL_LAYOUT.playerStart,{y:0});
  if(kind==='schoolSetup'){const a=SCHOOL_LAYOUT.setupAnchor;i.player={...a.position,yaw:Math.atan2(-(a.lookTarget.x-a.position.x),-(a.lookTarget.z-a.position.z)),pitch:0};}
  if(ride){
   i.flashlightOn=ride.flashlight;
   i.player.yaw=ride.lookYaw;i.player.pitch=ride.lookPitch;
   i.snapshot={state:'mounted',escapeElapsed:ride.escapeElapsed,elapsed:ride.elapsed,enemy:{...ride.enemy},lookYaw:ride.lookYaw,lookPitch:ride.lookPitch};
  }
  else i.snapshot=i.controller?.snapshot?.()||{};
  if(i.fieldActive)fieldFrame(i);
  else if(kind==='randall')i.snapshot.ambushOrigin=i.ambushOrigin;
  if(!getGame?.()?.player||!ui?.isReady?.())throw new Error('V4 encounter body/UI unavailable');
  Object.assign(getGame().player,i.player);ui.showIdentity?.({scene,token});
  i.ready=true;present(i);
  const p=view.frame()?.cameraPose;
  if(!p||!['x','y','z','yaw','pitch'].every(k=>Number.isFinite(p[k])))throw new Error('V4 applied camera receipt missing');
  i.presentationReady={token:{...token},environmentId:setId,anchorId,geometryReady:true,uiReady:true,bodyApplied:true,cameraApplied:true};
  return {presentationReady:copy(i.presentationReady)};
 }
 function present(i){
  const p={token:i.token,player:{...i.player},eyeHeight:i.eyeHeight,encounter:i.snapshot,time:i.time,phase:i.kind==='school'?(i.snapshot.status==='survived'?'reorientation':'nightmare'):i.phase,schoolTransition:i.kind==='schoolSetup'?i.reorientation/.45:1,schoolBell:i.kind==='school'&&i.schoolPreset==='combined',reduced:!!getReducedMotion(),prelude:i.kind==='waynePrelude',flashlight:i.flashlightOn,fieldVisible:!!i.fieldGame,fieldBike:i.done?null:i.fieldBike,fieldBiteAge:i.fieldBiteAt===undefined?null:Math.min(.32,i.time-i.fieldBiteAt),fade:i.captureFade||0};
  if(view.prepare(p)===false)throw new Error('V4 encounter presentation rejected');
 }
 function cue(i,id){if(i.actions.has(id))return;const r=i.emit({type:'cue',...i.token,cueId:id});if(r?.accepted||r?.reason==='duplicate-cue')i.actions.add(id);}
 function achieved(i){i.done=true;for(const id of i.scene.required_actions||[])cue(i,id);}
 function horrorNotice(i,text){i.soundCaption={text,until:i.time+1.8};}
 function wayneContainer(i){
  const target=i.descriptor.interactionTargets?.find(t=>t.id==='wayne-container');
  const point=target?.proximityPoint||target?.position;
  return !!point&&Math.hypot(i.player.x-point.x,i.player.z-point.z)<=target.radius;
 }
 function horrorEvents(i,events){
  for(const event of events){
   if(event.type.startsWith('wayne-scurrying-')){
    cue(i,'WAYNE_HUNT_SOUND');
    const pan=audio?.pan?.(event.position,i.player)||0;
    const distance=Math.hypot(i.player.x-event.position.x,i.player.z-event.position.z);
    const gain=.2/(1+distance*.16);
    const taps=event.at===15;
    if(event.at===9){
     playSceneSound(i,{noise:true,duration:.68,filter:1500,gain:gain*.64,pan,
      movePan:update=>{i.waynePan={update,until:i.time+.68};}});
    }else for(const delay of taps?[0,.15,.30]:[0,.085,.17,.26]){
     playSceneSound(i,{noise:true,duration:taps?.065:.07,filter:taps?520:2400,gain,pan,delay});
    }
    horrorNotice(i,event.caption);
   }else if(event.type==='wayne-capture'){
    playSceneSound(i,{noise:true,duration:.7,filter:1800,gain:.31});
    cue(i,'WAYNE_HAND_ATTACKED');
    horrorNotice(i,'The hand rushes toward you.');
   }else if(event.type==='wayne-complete'){
    playSceneSound(i,{noise:true,duration:.24,filter:490,gain:.42});
    horrorNotice(i,'The hand strikes.');
    achieved(i);
   }else if(event.type==='randall-grab'){
    playSceneSound(i,{buffer:audio?.samples?.growl,type:'triangle',freq:90,end:40,duration:.6,gain:.42});
   }else if(event.type==='randall-first-shot'||event.type==='randall-retreat'){
    playSceneSound(i,{buffer:audio?.samples?.pistol,noise:true,duration:.24,filter:6500,gain:.68,pan:-.25});
    const first=event.type==='randall-first-shot';
    if(first&&!i.classicField){
     const pastBend=i.player.x>24.35||i.player.z>7.35;
     i.player.yaw=Math.atan2(i.player.x-(pastBend?24:19),i.player.z-7);
     i.player.pitch=0;
    }
    horrorNotice(i,first?'Brad fires. The creature lets go.':i.classicField?'Brad’s shot echoes through the corn.':'Brad fires again. The creatures retreat.');
    cue(i,first?'RANDALL_FREED':'RANDALL_SECOND_SHOT');
   }else if(event.type==='randall-flank'){
    playSceneSound(i,{buffer:audio?.samples?.oliveBark,freq:162,end:85,duration:.55,filter:2300,gain:.29,pan:.25});
    cue(i,'RANDALL_FLANKED');
   }else if(event.type==='randall-aim'){
    cue(i,'RANDALL_BRAD_AIMED');
   }else if(event.type==='randall-bite'){
    playSceneSound(i,{noise:true,duration:.21,filter:580,gain:.35});
    horrorNotice(i,'The creature bites Randall’s ankle.');
   }else if(event.type==='randall-medic'){
    cue(i,'RANDALL_MEDIC');
   }else if(event.type==='randall-complete'){
    achieved(i);
   }
  }
 }
 function woodlandEvents(i,events){
  for(const event of events){
   const pan=event.position?audio?.pan?.(event.position,i.player)||0:0;
   if(event.type==='behind'){
    cue(i,'WOODLAND_BEHIND');
    playSceneSound(i,{noise:true,duration:.2,gain:.24,filter:1400,pan});
    i.soundCaption={text:'Something rustles behind you.',until:i.time+.45};
   }else if(event.type==='scare'||event.type==='grab'){
    playSceneSound(i,{buffer:audio?.samples?.growl,type:'triangle',freq:103,end:40,duration:.6,gain:.46,filter:1450,pan});
    i.soundCaption={text:'The creature growls.',until:i.time+.8};
   }
   else if(event.type==='push')playSceneSound(i,{noise:true,duration:.09,gain:.18,filter:1100});
   else if(event.type==='shove')playSceneSound(i,{noise:true,duration:.35,gain:.34,filter:560});
   else if(event.type==='bike-ready'){
    playSceneSound(i,{freq:482,end:330,duration:.5,gain:.12,filter:1300,pan});
    horrorNotice(i,'You can ride now. Get to the bicycle.');
   }
  }
 }
 function fieldFrame(i){
  const g=i.fieldGame,s=g.survivalEnding,phase=g.interaction?.phase;
  i.flashlightOn=g.player.flashlightOn;
  const locked=interactionLocked(g)||i.fieldBiteAt!==undefined||i.done;
  i.snapshot={phase:i.fieldBiteAt!==undefined?'bite':'survival',status:g.mode==='dead'?'captured':'running',runEnabled:!locked&&g.mode==='playing',
   ...(i.fieldBicycle?{state:g.mode==='dead'?'captured':i.done?'mounted':i.fieldBike?'free':'searching',bikeReady:!!i.fieldBike,bike:i.fieldBike??null}:{}),
   elapsed:g.elapsed,remaining:s.remaining,zone:g.player.zone,portal:g.fieldTrip.doorId,
   ammo:g.player.ammo,health:g.player.health,hidden:g.player.hidden,interaction:phase||null,struggleCount:g.interaction?.presses||0,
   targetPresses:GAME_CONFIG.grapple.targetPresses,doorPrompt:fieldInteraction(g),enemy:{x:g.enemy.x,z:g.enemy.z,state:g.enemy.state,visible:g.enemy.visible},
   sections:g.corridorRun.recycles,locked};
 }
 function bicycleCues(i){
  for(const id of ['WOODLAND_BEHIND','WOODLAND_REVEALED','WOODLAND_RUN'])cue(i,id);
 }
 function canMountFieldBike(i){
  const g=i.fieldGame,bike=i.fieldBike;
  return !!bike&&!i.done&&bike.zone===g.player.zone&&(bike.zone==='corridor'||bike.portal===g.fieldTrip.doorId)&&
   Math.hypot(g.player.x-bike.x,g.player.z-bike.z)<=1.35&&sweptClear(g.maze,g.player,bike,g.player.radius,blocksFor(g));
 }
 function mountFieldBike(i){
  const start=sampleWoodlandEscape(0);
  mountReceipt={...i.token,enemy:WOODLAND_LAYOUT.enemySpawn,elapsed:i.fieldGame.elapsed,escapeElapsed:0,flashlight:i.flashlightOn,
   lookYaw:start.yaw,lookPitch:start.pitch,audioBeat:-1};
  achieved(i);fieldFrame(i);clear();
 }
 function revealFieldEnding(i){
  const g=i.fieldGame;
  input?.clearEdges?.();
  if(i.fieldBicycle){
   const point=fieldRevealPoint(g,[3.2,2.1,1.05],.40);
   i.fieldBike={...point,zone:g.player.zone,portal:g.player.zone==='field'?g.fieldTrip.doorId:null};
   g.player.yaw=point.yaw;g.player.pitch=-.09;g.player.flashlightOn=true;
   bicycleCues(i);
   woodlandEvents(i,[{type:'bike-ready',position:point}]);
  }else{
   const point=fieldRevealPoint(g,[1.05,.73],g.player.radius);
   i.fieldBiteAt=i.time;
   g.player.yaw=point.yaw;g.player.pitch=-.36;g.player.flashlightOn=true;
   Object.assign(g.enemy,{...point,yaw:point.yaw+Math.PI,active:true,visible:true,zone:g.player.zone,state:'tackle',stateStartedAt:g.elapsed});
   horrorEvents(i,[{type:'randall-bite'}]);
  }
 }
 function tickField(i,dt,controls,edge,lightPresses){
  const g=i.fieldGame,before=g.steps,phase=g.interaction?.phase;
  if(g.mode!=='playing'||i.done)return;
  if(i.fieldBicycle&&edge&&canMountFieldBike(i)){mountFieldBike(i);return;}
  if(!i.fieldSoundStarted){
   i.fieldSoundStarted=true;audio?.setStoryPhase?.('trial');
   if(i.classicField&&!i.partnerLost){
    i.partnerLost=true;playSceneSound(i,{noise:true,duration:.32,gain:.10,filter:2050});
   }
  }
  const inputFrame={...controls,interact:edge,flashlight:lightPresses%2===1};
  if(dt===0&&inputFrame.flashlight&&!phase)g.player.flashlightOn=!g.player.flashlightOn;
  updateGame(g,dt,inputFrame);
  const events=g.events.splice(0);
  if(events.some(event=>event.type==='trial_complete'))revealFieldEnding(i);
  i.player={...g.player,y:0};
  fieldFrame(i);
  if(phase!==g.interaction?.phase){
   input?.clearEdges?.();g.pendingStabs.length=0;
  }
  for(const event of events){
   audio?.event?.(event,g);view.combatEvent?.(event);
   if(i.fieldBicycle&&['detection','chase','glimpse'].includes(event.type))bicycleCues(i);
  }
  const weatherEvents=weather?.update?.(g,dt,{events,reduced:getReducedMotion(),muted:audio?.muted})||[];
  audio?.weatherState?.(g,weather?.state);
  for(const event of weatherEvents)audio?.weatherEvent?.(event,g);
  if(audio?.ctx?.state==='running'){
   audio.update?.(g,dt,{footsteps:!weather});audio.updatePlayerBreathing?.(g,dt,{distance:g.steps-before});
  }
 }
 function schoolChaseAudio(i){
  if(!i.longSchool||!i.snapshot.hunting||i.snapshot.status!=='running'||i.time<(i.nextSchoolBeat||0))return;
  const interval=i.snapshot.exitUnlocked?.42:.56;
  i.nextSchoolBeat=i.time+interval;
  playSceneSound(i,{freq:52,end:32,type:'triangle',duration:.30,gain:.19,filter:320});
  playSceneSound(i,{freq:71,end:48,type:'triangle',duration:.24,gain:.095,filter:430,delay:.14});
  if(Math.floor(i.time/interval)%4===0)playSceneSound(i,{noise:true,duration:.43,gain:.085,filter:1050});
 }
 function schoolCanLeave(i){return i.kind==='schoolSetup'&&i.phase==='nightmare'&&i.reorientation>=1.2;}
 function canMove(i){
  if(i.fieldActive)return !i.done&&i.snapshot.runEnabled===true;
  if(i.kind==='woodland')return !i.done&&i.snapshot.canMove;
  if(i.kind==='randall')return !i.done&&i.snapshot.runEnabled&&(!i.classicField||i.fieldActive);
  return !i.done&&(/WALK/.test(i.scene.controls)||schoolCanLeave(i))&&i.snapshot.status!=='captured'&&i.snapshot.status!=='survived'&&i.snapshot.phase!=='capture';
 }
 function tick(dt,controls={}){
  const i=item;if(!live(i)||!i.ready)return;if(!Number.isFinite(dt)||dt<0)throw new Error('Invalid encounter dt');
  const cinematic= i.classicField&&(!i.fieldActive||i.fieldBiteAt!==undefined)||i.kind==='bicycleEscape'||i.kind==='woodland'&&i.snapshot.state==='mounted'||
   i.kind==='school'&&i.snapshot.status==='survived';
  const active=!i.paused&&controls.paused!==true&&controls.hidden!==true&&controls.loading!==true&&(cinematic||controls.pointerReady!==false)&&controls.focused!==false;
  if(!active){i.controller?.releasePush?.();if(i.sceneSounds.size)stopSceneSounds(i);return;}
  i.time+=dt;const edge=!!controls.interact&&!i.interactHeld;i.interactHeld=!!controls.interact;
  const lightEdge=!!controls.flashlight&&!i.flashlightHeld;i.flashlightHeld=!!controls.flashlight;
  const lightPresses=Number.isSafeInteger(controls.flashlightPresses)?controls.flashlightPresses:Number(lightEdge);
  if(i.kind==='woodland'&&!i.fieldActive&&lightPresses%2===1&&!i.done&&i.snapshot.canMove)i.flashlightOn=!i.flashlightOn;
  if(i.kind==='schoolSetup'&&i.finalAcknowledged&&!i.done){
   if(i.phase==='normal')playSceneSound(i,{noise:true,duration:.65,gain:.14,filter:410});
   i.reorientation+=dt;
   i.phase=i.reorientation<.45?'transformation':'nightmare';
  }
  if(!i.fieldGame&&(i.kind!=='woodland'||i.snapshot.canMove||i.snapshot.state==='mounted')){
   if(Number.isFinite(controls.yaw))i.player.yaw=controls.yaw;
   if(Number.isFinite(controls.pitch))i.player.pitch=Math.max(-1.2,Math.min(1.2,controls.pitch));
  }
  const captured=i.snapshot.status==='captured'||i.snapshot.state==='captured';
  if(captured&&edge&&!i.retryRequested){
   // The route owns re-entry and must mint a fresh entry token. Never reset a
   // captured controller in place under an already-issued scene lease.
   i.retryRequested=true;
   const result=i.emit({type:'retry-encounter',...i.token});
   if(live(i)&&!result?.accepted)i.retryRequested=false;
   return;
  }
  if(captured)i.captureFade=Math.min(1,(i.captureFade||0)+dt*3.5);
  if(i.fieldActive){
   if(i.fieldBiteAt===undefined)tickField(i,dt,controls,edge,lightPresses);
   else {
    const age=i.time-i.fieldBiteAt;
    i.captureFade=Math.min(1,Math.max(0,(age-.10)/.26));
    if(age>=.62){
     i.fieldActive=false;i.fieldGame.enemy.active=false;i.fieldGame.enemy.visible=false;
     stopSceneSounds(i);audio?.stopCues?.();audio?.stopPlayerBreathing?.();audio?.setStoryPhase?.('narrative');
     i.snapshot=i.controller.snapshot();
     i.returnAt=i.time;clear();
    }
   }
   if(i.fieldActive){
    if(i.done)i.captureFade=Math.min(1,(i.captureFade||0)+dt*5);
    Object.assign(getGame().player,i.player);present(i);finishEncounter(i);return;
   }
  }
  const schoolEscape=schoolCanLeave(i);
  const intent=Math.hypot(controls.forward||0,controls.strafe||0);
  const schoolQuiet=i.kind==='school'&&i.schoolPreset!=='control'&&(controls.quiet===true||intent>0&&intent<.62);
  const walkedBefore=i.walked;
  if(canMove(i)){const f=Number.isFinite(controls.forward)?Math.max(-1,Math.min(1,controls.forward)):0,r=Number.isFinite(controls.strafe)?Math.max(-1,Math.min(1,controls.strafe)):0;
   const speed=i.kind==='woodland'?(i.snapshot.state==='fleeing'||i.timedBicycle&&i.snapshot.state==='free'?3.35:2.3):i.kind==='school'?(schoolQuiet?1.15:1.8):i.kind==='randall'?2.8:1.7;
   const step=Math.min(dt,.1)*speed/Math.max(1,Math.hypot(f,r));
   const delta={x:(-Math.sin(i.player.yaw)*f+Math.cos(i.player.yaw)*r)*step,z:(-Math.cos(i.player.yaw)*f-Math.sin(i.player.yaw)*r)*step};
   let xy;
   if(i.kind==='school')xy=i.controller.move(i.player,delta);
   else if(i.kind==='woodland')xy=moveBounded(i.player,delta,i.woodlandLayout);
   else {xy={...i.player};for(const axis of ['x','z']){
    const p={...xy,[axis]:xy[axis]+delta[axis]};
    // Legacy outdoor collision checks the terrain height at each candidate,
    // not the old anchor's height. Keep accepted body and camera poses aligned.
    if(['patrol','randall'].includes(i.kind)&&view.groundHeight)p.y=view.groundHeight(p.x,p.z);
    if(view.canPlaceBody({token:i.token,player:p,eyeHeight:i.eyeHeight}))Object.assign(xy,p);
   }}
   i.walked+=Math.hypot(xy.x-i.player.x,xy.z-i.player.z);Object.assign(i.player,xy);
  }
  if(i.kind==='woodland'&&!i.done&&!captured){
   const previous=i.snapshot.elapsed,previousState=i.snapshot.state;
   i.pushMode=controls.pushMode||'repeat';
   i.snapshot=i.controller.update(dt,{player:i.player,interact:!!controls.interact,moving:i.walked>walkedBefore,flashlight:i.flashlightOn,pushPresses:controls.pushPresses??controls.stabTimes?.length??0,
    pushHeld:controls.pushHeld,pushReady:controls.pushReady,pushMode:i.pushMode});
   if(i.snapshot.scriptedPlayer)Object.assign(i.player,i.snapshot.scriptedPlayer);
   if(i.snapshot.scareVisible&&i.snapshot.state==='scare')cue(i,'WOODLAND_REVEALED');
   if(i.snapshot.state==='fleeing'){
    cue(i,'WOODLAND_REVEALED');
    cue(i,'WOODLAND_RUN');
    if(previousState==='scare')stopSceneSounds(i);
   }
   woodlandEvents(i,i.snapshot.events);
   if(i.timedBicycle){
    const footfall=Math.floor(i.walked/.81);
    if(footfall>(i.footfall||0)){
     audio?.footstep?.({actor:'clarence',surface:'soft',owner:'bicycle-field',bus:audio.master,gain:.22});
     i.footfall=footfall;
    }
   }
   if(previous<.45&&i.snapshot.elapsed>=.45)playSceneSound(i,{noise:true,duration:.45,gain:.18,filter:1250});
   if(previous<.85&&i.snapshot.elapsed>=.85)playSceneSound(i,{buffer:audio?.samples?.growl,type:'triangle',freq:78,end:42,duration:.7,gain:.18,filter:760});
   if(i.snapshot.state==='mounted'){
    const start=sampleWoodlandEscape(0);
    i.player.yaw=start.yaw;i.player.pitch=start.pitch;
    mountReceipt={...i.token,enemy:{...i.snapshot.enemy},elapsed:i.snapshot.elapsed,escapeElapsed:0,flashlight:i.flashlightOn,
     lookYaw:start.yaw,lookPitch:start.pitch,audioBeat:-1};
    achieved(i);
   }
  }
  if(i.snapshot.state==='mounted'&&(i.kind==='woodland'||i.kind==='bicycleEscape'&&!i.done)){
   // E starts the authored ride immediately. The accepted mount carries its
   // progress across the story cut while S06 still commits the exit receipt.
   const previous=i.snapshot.escapeElapsed;
   i.snapshot.escapeElapsed=Math.min(WOODLAND_ESCAPE_SECONDS,previous+dt);
   i.snapshot.lookYaw=mountReceipt.lookYaw=i.player.yaw;
   i.snapshot.lookPitch=mountReceipt.lookPitch=i.player.pitch;
   mountReceipt.escapeElapsed=i.snapshot.escapeElapsed;
   const beat=Math.floor(i.snapshot.escapeElapsed/.65);
   if(i.snapshot.escapeElapsed<WOODLAND_ESCAPE_SECONDS&&dt>0&&beat>mountReceipt.audioBeat){
    mountReceipt.audioBeat=beat;
    playSceneSound(i,{noise:true,duration:.68,gain:.15,filter:420});
    playSceneSound(i,{noise:true,duration:.18,gain:.12,filter:1800});
    if(beat%2===0)
     playSceneSound(i,{noise:true,duration:.43,gain:.1,filter:780});
   }
   if(i.snapshot.escapeElapsed>=WOODLAND_ESCAPE_SECONDS){
    i.snapshot.state='escaped';
    if(i.kind==='bicycleEscape')achieved(i);
   }
  }
  if(schoolEscape&&!i.done&&i.player.x<=1.4&&i.player.z>=-8.4&&i.player.z<=-3.6){schoolStartReceipt={runId:i.token.runId,player:{...i.player}};achieved(i);}
  if(i.kind==='school'&&!i.done){
   const offer=edge&&!i.longSchool?schoolOffer(i):null;
   const action=offer&&(controls.interactionTarget===undefined||controls.interactionTarget===offer.id)?offer.id:null;
   const footfall=Math.floor(i.walked/.7);
   if(i.snapshot.status==='running'){
    if(action==='school-marks'){
     i.schoolMarksInspected=true;
     i.observation={id:'school-marks',text:'Three chalk marks. The middle one is shorter.',until:i.time+3};
    }
    i.snapshot=i.controller.update(dt,{token:i.token,player:i.player,doorId:action?.startsWith('door-')?action:null,setBell:action==='school-bell',quiet:schoolQuiet,
     footstep:footfall>(i.footfall||0),ready:true,controllable:true,pointerReady:true});
    i.footfall=footfall;
    for(const event of i.snapshot.events){
     const pan=audio?.pan?.(event,i.player)||0;
     if(event.type==='door'){
      if(event.actor==='player')i.lastSchoolDoor=event;
      playSchoolDoor(i,event,{pan});
     }else if(event.type==='door-rattle'){
      playSchoolDoor(i,event,{pan,gain:.055,muffled:true});
      if(Math.hypot(event.x-i.player.x,event.z-i.player.z)<5)i.soundCaption={text:'A door rattles.',until:i.time+1.2};
     }else if(event.type==='bell-set'){
      i.observation={id:'bell-set',text:'Bell set.',until:i.time+2};
     }else if(event.type==='bell'){
      playSceneSound(i,{freq:784,end:765,duration:.57,gain:.12,filter:2600,type:'triangle',pan});
      playSceneSound(i,{freq:1320,end:1290,duration:.27,gain:.032,filter:3200,pan});
      i.soundCaption={text:'A classroom bell rings.',until:i.time+1.4};
     }else if(event.type==='footsteps'){
      playSceneSound(i,{noise:true,duration:.08,gain:schoolQuiet?.045:.09,filter:1000});
     }else if(event.type==='detection'){
      playSceneSound(i,{buffer:audio?.samples?.scream,type:'sawtooth',freq:175,end:55,duration:.85,gain:.47,filter:4000,pan});
      if(i.schoolPreset!=='control')i.soundCaption={text:'A creature screams.',until:i.time+1.4};
     }else if(event.type==='exit-unlocked'){
      playSceneSound(i,{freq:240,end:120,duration:.62,gain:.18,filter:580});
      horrorNotice(i,'The red exit is open.');
     }
    }
    schoolChaseAudio(i);
   }
   if(i.snapshot.status==='survived'){
    if(!i.schoolReoriented){
     const a=SCHOOL_LAYOUT.setupAnchor;
     i.player={...a.position,yaw:Math.atan2(-(a.lookTarget.x-a.position.x),-(a.lookTarget.z-a.position.z)),pitch:0};
     i.schoolReoriented=true;i.reorientation=0;i.soundCaption=null;clear();
     if(i.longSchool)i.captureFade=.86;
    }else i.reorientation+=dt;
    if(i.longSchool)i.captureFade=Math.max(0,.86-i.reorientation*2.5);
    if(i.schoolPreset==='combined'&&i.lastSchoolDoor&&!i.schoolEchoed&&i.reorientation>=.35){
     i.schoolEchoed=true;
     const emptyDoor=SCHOOL_LAYOUT.rooms.slice(1).find(({door})=>door.id!==i.lastSchoolDoor.doorId).door;
     playSchoolDoor(i,i.lastSchoolDoor,{gain:.065,muffled:true,pan:audio?.pan?.(emptyDoor,i.player)||0});
     i.soundCaption={text:'A latch clicks.',until:i.time+.85};
    }
    if(i.reorientation>=1.2)achieved(i);
   }
  }
  if(i.kind==='waynePrelude'&&!i.done&&edge&&wayneContainer(i)){
   i.snapshot={phase:'examined'};
   playSceneSound(i,{noise:true,duration:.14,filter:950,gain:.2});
   achieved(i);
  }
  if(i.kind==='waynePrelude'&&Number.isFinite(i.snapshot.dropAt)&&i.time-i.snapshot.dropAt>=.42){
   if(!i.actions.has('WAYNE_HAND_FELL'))playSceneSound(i,{noise:true,duration:.12,filter:590,gain:.18});
   cue(i,'WAYNE_HAND_FELL');
  }
  if(i.kind==='wayne'&&!i.done){
   const r=i.controller.update(dt,{token:i.token,active:true,ready:true});
   i.snapshot=r.state;horrorEvents(i,r.events);
   if(i.waynePan){
    if(i.time<i.waynePan.until)i.waynePan.update(audio?.pan?.(sampleWayneHandPath(i.snapshot.elapsed),i.player)||0);
    else i.waynePan=null;
   }
  }
  if(i.kind==='patrol'){
   const distance=Math.hypot(i.player.x-RANDALL_AMBUSH_SITE.x,i.player.z-RANDALL_AMBUSH_SITE.z);
   i.snapshot={phase:i.done?'alert':'patrol',walked:i.walked,alertSeconds:i.thunderAt==null?0:i.time-i.thunderAt};
   if(!i.done&&i.patrolIntroComplete&&!i.patrolHintPlayed&&i.walked>=1.1&&distance>1.4){
    i.patrolHintPlayed=true;
    const nearRustle=(i.token.runId+i.token.entryId)%2===0;
    playSceneSound(i,{noise:true,duration:nearRustle?.32:.22,filter:nearRustle?1550:1050,gain:.095,pan:audio?.pan?.(PATROL_LANDMARK,i.player)||0});
    horrorNotice(i,'Corn rustles off the trail.');
   }
   const mergeRadius=i.patrolLayout==='alternate'?.55:1;
   if(!i.done&&i.walked>=4&&distance<=mergeRadius){
    playSceneSound(i,{buffer:audio?.samples?.patrolThunder,noise:true,duration:1.5,filter:420,gain:.31});
    playSceneSound(i,{buffer:audio?.samples?.oliveBark,freq:173,end:88,duration:.56,filter:2300,gain:.28,type:'sawtooth',pan:.3});
    i.thunderAt=i.time;
    horrorNotice(i,'Olive barks near the pile. Thunder rolls.');
    achieved(i);
   }
  }
  if(i.kind==='randall'&&!i.done){
   const r=i.controller.update(dt,{token:i.token,active:true,ready:i.ready,actorsReady:!!i.presentationReady,player:i.player,moving:i.walked>walkedBefore,
    fieldBiteComplete:i.classicField&&i.returnAt!==undefined,lineComplete:id=>i.finishedLines.has(id),struggle:edge&&i.snapshot.phase==='grab',reportAcknowledged:i.finalAcknowledged});
   i.snapshot={...r.state,ambushOrigin:i.ambushOrigin,walked:i.walked};
   horrorEvents(i,r.events);
   if(i.classicField){
    const arrivalFade=Math.max(0,1-(i.time-i.returnAt)/.38);
    i.captureFade=arrivalFade;
   }
  }
  if(!live(i))return;Object.assign(getGame().player,i.player);present(i);
  finishEncounter(i);
 }
 function finishEncounter(i){
  for(const id of i.scene.required_actions||[])if(i.done&&!i.actions.has(id))cue(i,id);
  if(i.done&&i.finalAcknowledged&&(i.scene.required_actions||[]).every(id=>i.actions.has(id))&&!i.completing&&
     (i.kind!=='patrol'||i.time-i.thunderAt>=1.15)){
   if(i.kind==='patrol'||i.kind==='waynePrelude')horrorHandoff={runId:i.token.runId,source:i.kind,player:{...i.player}};
   i.completing=true;
   const r=i.emit({type:'completion',...i.token,transitionId:`${i.scene.scene_id}:exit`,reason:'normal'});
   if(live(i)&&!r?.accepted)i.completing=false;
  }
 }
 function pending(i){
  if(i.kind==='schoolSetup')return i.finalAcknowledged&&!i.done;
  if(i.kind==='woodland')return i.snapshot.state==='captured';
  if(i.classicField&&i.snapshot.status==='captured')return true;
  if(['randall','patrol','wayne','waynePrelude'].includes(i.kind))return false;
  return !i.done;
 }
 function readStatus(){
  const i=item;if(!live(i))return null;
  // The fixed-step caller borrows this player pose only for the current input read.
  return {adapterKey:'v4Encounter',renderer:'v31-view',ready:i.ready,player:i.player,actionPending:pending(i),
   pushRequired:i.kind==='woodland'&&i.snapshot.state==='struggle',fieldElapsed:i.fieldActive?i.fieldGame.elapsed:null,
   fieldActive:!!i.fieldActive,fieldQte:i.fieldActive&&i.snapshot.interaction==='qte'};
 }
 function frame(copyFrame=true){
  const i=item;if(!live(i))return null;
  const p=pending(i),captured=i.snapshot.status==='captured'||i.snapshot.state==='captured';
  const woodland=i.kind==='woodland';
  const pushRequired=woodland&&i.snapshot.state==='struggle';
  const pushMode=i.pushMode||'repeat';
  const pushInstruction=pushMode==='hold'?'Hold to push it off.':pushMode==='single'?'Press once to push it off.':`Press repeatedly to push it off. ${i.snapshot.presses} / ${i.snapshot.targetPresses}`;
  const field=!!i.fieldActive&&!captured;
  const flashlightAllowed=field?!i.snapshot.locked:woodland&&i.snapshot.canMove&&!i.done;
  const canMount=i.fieldBicycle?canMountFieldBike(i):woodland&&i.snapshot.state==='free'&&canMountWoodlandBike(i.player,i.woodlandLayout);
  const offer=i.kind==='school'&&!i.longSchool?schoolOffer(i):null;
  const canExamine=i.kind==='waynePrelude'&&!i.done&&wayneContainer(i);
  const horrorPrompt=i.snapshot.phase==='grab'&&i.kind==='randall'?`Struggle. ${i.snapshot.struggleCount} / 4`:i.snapshot.objective||
   (i.kind==='waynePrelude'&&!i.done?'Walk to the cooler and inspect it.':i.kind==='patrol'&&!i.done?'Follow Brad and Olive along the trail.':null);
  const timedSchool=i.longSchool&&i.snapshot.hunting&&i.snapshot.status==='running';
  const showFieldHud=field&&i.fieldBiteAt===undefined;
  const remaining=showFieldHud?i.snapshot.remaining:timedSchool?i.snapshot.chaseRemaining:null;
  const fieldQte=field&&i.snapshot.interaction==='qte';
  const fieldPrompt=i.snapshot.locked&&!fieldQte?'':fieldQte?'Keep tapping Space or STAB to break free.':
   i.fieldBike?'Get to the bicycle.':i.snapshot.hidden?'In cover. Stay still.':
   i.classicField&&i.snapshot.zone==='field'?'Follow the red EXIT HERE sign to return to the corridors.':'Survive in the rows. Use the hide doors for cover.';
  const schoolPrompt=i.longSchool?(i.snapshot.status==='survived'?'':i.snapshot.exitUnlocked?'Get to the red EXIT sign.':i.snapshot.hunting?'Keep moving. The exit is still locked.':`Walk through three classrooms. ${i.snapshot.checkedRooms.length} / 3`):null;
  const bicyclePrompt=woodlandPrompts[i.snapshot.state];
  const presentation={
   adapterKey:'v4Encounter',sceneId:i.scene.scene_id,token:i.token,ready:i.ready,renderer:'v31-view',time:i.time,
   soundCaption:!captured&&i.soundCaption?.until>=i.time?i.soundCaption.text:null,
   observation:i.observation?.id==='school-marks'?i.observation:null,
   detailCaption:!captured&&i.observation?.until>=i.time?i.observation.text:null,
   interactionTarget:offer?.id,quietWalkAvailable:i.kind==='school'&&i.snapshot.status==='running'&&i.schoolPreset!=='control',
   schoolTransition:i.kind==='schoolSetup'?i.reorientation/.45:1,schoolBell:i.kind==='school'&&i.schoolPreset==='combined',
   player:{...i.player},eyeHeight:i.eyeHeight,set:i.descriptor,encounter:i.snapshot,encounterSnapshot:i.snapshot,
   encounterStatus:captured?'captured':i.done?'completed':i.snapshot.status||i.snapshot.state||'running',
   flashlight:i.flashlightOn,flashlightAllowed,fade:i.captureFade||0,pushRequired,pushMode,
   phase:i.kind==='school'?(i.snapshot.status==='survived'?'reorientation':'nightmare'):i.phase,
   reduced:!!getReducedMotion(),prelude:i.kind==='waynePrelude',fieldActive:!!i.fieldActive,fieldVisible:!!i.fieldGame,fieldBike:i.done?null:i.fieldBike,fieldBiteAge:i.fieldBiteAt===undefined?null:Math.min(.32,i.time-i.fieldBiteAt),
   fieldQte,weaponVisible:showFieldHud&&!woodland&&!i.snapshot.locked,healthVisible:showFieldHud&&!woodland,trialHudVisible:false,
   survivalStatus:!captured&&Number.isFinite(remaining)?{remaining,ammo:showFieldHud&&!woodland?i.snapshot.ammo:null,health:showFieldHud&&!woodland?i.snapshot.health:null,struggle:fieldQte?{count:i.snapshot.struggleCount,target:i.snapshot.targetPresses}:null}:null,
   controls:i.kind==='schoolSetup'&&i.phase==='nightmare'?'WALK_LOOK':i.scene.controls,identity:i.scene.perspective,
   objective:i.scene.objective,actionPending:p,
   actionPrompt:captured?'Caught. Retry the encounter.':field?fieldPrompt:i.classicField?'':i.kind==='schoolSetup'&&i.phase==='nightmare'?'Leave the classroom. Reach the hallway.':pushRequired?pushInstruction:woodland?bicyclePrompt||'':schoolPrompt??(horrorPrompt||i.scene.objective),
   canContinue:!p,canInteract:captured||pushRequired||canMount||!!offer||canExamine||field&&!i.snapshot.locked&&!!i.snapshot.doorPrompt||(i.kind==='randall'&&!i.classicField&&i.snapshot.phase==='grab'),
   interactionPrompt:captured?'Retry encounter':pushRequired?'Push it off':canMount?'Mount bicycle':field?(i.snapshot.doorPrompt||'').replace(/^E - /,''):i.kind==='randall'?'STRUGGLE':woodland?'Mount bicycle':offer?.label||(i.kind==='school'?'Open / close nearby door':'Examine container'),
   narrativeUI:{continue:!p,skip:false},movementEnabled:canMove(i),lookEnabled:field?!i.snapshot.locked:i.classicField?false:!woodland||i.snapshot.canMove||i.snapshot.state==='mounted',
   stagingComplete:i.done,implementationStage:'v4-functional-candidate'
  };
  return copyFrame?copy(presentation):presentation;
 }
 function onCue(e){
  const i=item;if(!live(i)||!same(e,i.token))return;
  const finished=e.cueId?.match(/^line:(.+):complete$/)?.[1];
  if(finished){
   if(finished===i.scene.line_ids.at(-1))i.finalAcknowledged=true;
   if(i.kind==='patrol'&&finished==='CF-V4-S18-D01')i.patrolIntroComplete=true;
   i.finishedLines?.add(finished);
   if(i.kind==='waynePrelude'&&finished==='CF-S14-D03')i.snapshot.dropAt=i.time;
  }
  view.setCue?.({token:i.token,cueId:e.cueId});
 }
  return {enter,tick,frame,peekFrame:()=>frame(false),readStatus,onCue,onContinue:()=>false,onSkip:()=>false,exit,pause(){if(item){item.paused=true;item.controller?.releasePush?.();stopSceneSounds(item);if(item.fieldGame){item.fieldSoundStarted=false;item.fieldGame.pendingStabs.length=0;audio?.stopCues?.();}}},resume(){if(item)item.paused=false;},dispose(){exit();mountReceipt=null;schoolStartReceipt=null;horrorHandoff=null;fieldMaze=null;}};
}
