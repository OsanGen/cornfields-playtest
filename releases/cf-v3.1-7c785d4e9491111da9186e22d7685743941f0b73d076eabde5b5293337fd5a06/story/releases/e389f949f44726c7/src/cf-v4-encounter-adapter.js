import {canMountWoodlandBike,createWoodlandEncounter,WOODLAND_LAYOUT,WOODLAND_ESCAPE_SECONDS} from './cf-v4-woodland.js';
import {createSchoolEncounter,SCHOOL_LAYOUT} from './cf-v4-school-encounter.js';
import {createScriptedHorror,RANDALL_AMBUSH_SITE} from './cf-v4-scripted-horror.js';
import {moveBounded} from './cf-v4-evasion-geometry.js';
const copy=x=>x==null?x:JSON.parse(JSON.stringify(x));
const same=(a,b)=>a&&b&&a.runId===b.runId&&a.sceneId===b.sceneId&&a.entryId===b.entryId;
const finite=p=>p&&['x','y','z'].every(k=>Number.isFinite(p[k]));
const nearbySchoolDoor=player=>SCHOOL_LAYOUT.rooms.map(room=>room.door).find(door=>Math.hypot(door.x-player.x,door.z-player.z)<=1.4);
const horrorPredecessor={wayne:'waynePrelude',randall:'patrol'};
const woodlandPrompts={
 searching:'Find your bicycle. Stay away from the figure.',
 scare:'Something is behind you.',
 fleeing:'Run for the bike.',
 grab:'It caught you.',
 free:'Get to the bike.',
};
export function createV4EncounterAdapter({view,input,audio,getGame,ui,getReducedMotion=()=>false}={}){
 let item=null,mountReceipt=null,schoolStartReceipt=null,horrorHandoff=null;
 const live=i=>i&&item===i&&!i.exited;
 const clear=()=>{input?.quarantine?.();input?.clear?.();input?.clearEdges?.();};
 function stopSceneSounds(i){for(const source of i.sceneSounds){try{source.stop();}catch{}}i.sceneSounds.clear();}
 function playSceneSound(i,options){
  const source=audio?.sound?.({...options,bus:audio.master});
  if(!source)return;
  i.sceneSounds.add(source);
  source.addEventListener?.('ended',()=>i.sceneSounds.delete(source),{once:true});
 }
 function exit(){const i=item;if(!i)return;i.exited=true;item=null;stopSceneSounds(i);i.controller?.dispose?.();clear();view?.releaseSet?.(i.token);}
 async function enter({scene,token,checkpoint,emit}){
  exit();
  if(!scene?.encounter_kind||!same(token,{...token,sceneId:scene.scene_id})||typeof emit!=='function')throw new Error('V4 encounter entry contract unavailable');
  const kind=scene.encounter_kind;
  if(!['woodland','bicycleEscape','schoolSetup','school','wayne','patrol','randall','waynePrelude'].includes(kind))throw new Error(`Unsupported V4 encounter ${kind}`);
  if(horrorHandoff&&(horrorHandoff.runId!==token.runId||horrorHandoff.source!==horrorPredecessor[kind]))horrorHandoff=null;
  const i={scene,token:{...token},emit,kind,ready:false,exited:false,time:0,done:false,finalAcknowledged:!scene.line_ids.length,actions:new Set(),sceneSounds:new Set(),controller:null,snapshot:{},interactHeld:true,phase:'normal',reorientation:0,walked:0,paused:false,flashlightOn:true,flashlightHeld:true,retryRequested:false};item=i;
  let ride;
  if(kind==='bicycleEscape'){
   const previous=checkpoint?.event_ledger?.at(-1);
   if(mountReceipt?.runId===token.runId&&mountReceipt.sceneId==='CF-S05')ride=mountReceipt;
   else if(previous?.event_id===`${token.runId}:CF-S05:exit`&&previous.presentation==='playtest')
    ride={flashlight:true,elapsed:0,escapeElapsed:0,enemy:WOODLAND_LAYOUT.enemySpawn};
   else throw new Error('Bicycle escape missing same-run accepted mount');
  }
  if(kind==='woodland'){mountReceipt=null;i.controller=createWoodlandEncounter({token});}
  if(kind==='school')i.controller=createSchoolEncounter({token});
  if(['wayne','randall'].includes(kind))i.controller=createScriptedHorror({kind,token});
  const setId=['woodland','bicycleEscape'].includes(kind)?'V4_WOODLAND':['school','schoolSetup'].includes(kind)?'V4_SCHOOL':['wayne','waynePrelude'].includes(kind)?'V4_WAYNE':'SEARCH_TRAIL';
  const anchorId=setId==='V4_WOODLAND'?'WOODLAND_START':setId==='V4_SCHOOL'?'SCHOOL_START':setId==='V4_WAYNE'?'WAYNE_LAB_ENTRY':'SEARCH_BEND';
  clear();
  const d=await view.enterSet({setId,anchorId,token,period:scene.perspective?.period,actors:[]});
  if(!live(i))return;
  if(d?.ready!==true||!finite(d.anchor?.position)||!finite(d.anchor?.lookTarget)||!Number.isFinite(d.anchor?.eyeHeight)||!Array.isArray(d.colliders))throw new Error(`${scene.scene_id}: encounter geometry/readiness missing`);
  i.descriptor=d;i.eyeHeight=d.anchor.eyeHeight;
  const a=d.anchor,dx=a.lookTarget.x-a.position.x,dz=a.lookTarget.z-a.position.z;
  i.player={...a.position,yaw:Math.atan2(-dx,-dz),pitch:Math.atan2(a.lookTarget.y-a.position.y-a.eyeHeight,Math.hypot(dx,dz))};
  if(horrorHandoff){
   const pose=horrorHandoff.player;
   if(!view.canPlaceBody({token:i.token,player:pose,eyeHeight:i.eyeHeight}))throw new Error(`${scene.scene_id}: prior encounter pose cannot be carried into the next scene`);
   i.player={...pose};
  }
  if(kind==='randall')i.ambushOrigin={...i.player};
  if(kind==='school')Object.assign(i.player,schoolStartReceipt?.runId===token.runId?schoolStartReceipt.player:SCHOOL_LAYOUT.playerStart,{y:0});
  if(kind==='schoolSetup'){const a=SCHOOL_LAYOUT.setupAnchor;i.player={...a.position,yaw:Math.atan2(-(a.lookTarget.x-a.position.x),-(a.lookTarget.z-a.position.z)),pitch:0};}
  if(ride){
   i.flashlightOn=ride.flashlight;
   i.snapshot={state:'mounted',escapeElapsed:ride.escapeElapsed,elapsed:ride.elapsed,enemy:{...ride.enemy}};
  }
  else i.snapshot=i.controller?.snapshot?.()||{};
  if(kind==='randall')i.snapshot.ambushOrigin=i.ambushOrigin;
  if(!getGame?.()?.player||!ui?.isReady?.())throw new Error('V4 encounter body/UI unavailable');
  Object.assign(getGame().player,i.player);ui.showIdentity?.({scene,token});
  i.ready=true;present(i);
  const p=view.frame()?.cameraPose;
  if(!p||!['x','y','z','yaw','pitch'].every(k=>Number.isFinite(p[k])))throw new Error('V4 applied camera receipt missing');
  i.presentationReady={token:{...token},environmentId:setId,anchorId,geometryReady:true,uiReady:true,bodyApplied:true,cameraApplied:true};
  return {presentationReady:copy(i.presentationReady)};
 }
 function present(i){
  const p={token:i.token,player:{...i.player},eyeHeight:i.eyeHeight,encounter:i.snapshot,time:i.time,phase:i.kind==='school'?(i.snapshot.status==='survived'?'reorientation':'nightmare'):i.phase,reduced:!!getReducedMotion(),prelude:i.kind==='waynePrelude',flashlight:i.flashlightOn,fade:i.captureFade||0};
  if(view.prepare(p)===false)throw new Error('V4 encounter presentation rejected');
 }
 function cue(i,id){if(i.actions.has(id))return;const r=i.emit({type:'cue',...i.token,cueId:id});if(r?.accepted||r?.reason==='duplicate-cue')i.actions.add(id);}
 function achieved(i){i.done=true;for(const id of i.scene.required_actions||[])cue(i,id);}
 function horrorNotice(i,text){i.horrorNotice={text,until:i.time+1.8};}
 function wayneContainer(i){
  const target=i.descriptor.interactionTargets?.find(t=>t.id==='wayne-container');
  const point=target?.proximityPoint||target?.position;
  return !!point&&Math.hypot(i.player.x-point.x,i.player.z-point.z)<=target.radius;
 }
 function horrorEvents(i,events){
  for(const event of events){
   if(event.type.startsWith('wayne-scurrying-')){
    const pan=audio?.pan?.(event.position,i.player)||0;
    const distance=Math.hypot(i.player.x-event.position.x,i.player.z-event.position.z);
    const gain=.2/(1+distance*.16);
    const taps=event.at===15;
    for(const delay of taps?[0,.15,.30]:[0,.085,.17,.26]){
     playSceneSound(i,{noise:true,duration:taps?.065:.07,filter:taps?520:2400,gain,pan,delay});
    }
    horrorNotice(i,event.caption);
   }else if(event.type==='wayne-capture'){
    playSceneSound(i,{noise:true,duration:.7,filter:1800,gain:.31});
    horrorNotice(i,'The hand rushes toward you.');
   }else if(event.type==='wayne-complete'){
    playSceneSound(i,{noise:true,duration:.24,filter:490,gain:.42});
    horrorNotice(i,'The hand strikes.');
    achieved(i);
   }else if(event.type==='randall-grab'||event.type==='randall-retreat'){
    playSceneSound(i,{buffer:audio?.samples?.pistol,noise:true,duration:.24,filter:6500,gain:.68,pan:-.25});
    horrorNotice(i,event.type==='randall-grab'?'Brad fires. Struggle.':'Brad fires again. The creature retreats.');
   }else if(event.type==='randall-bite'){
    playSceneSound(i,{noise:true,duration:.21,filter:580,gain:.35});
    horrorNotice(i,'The creature bites Randall’s ankle.');
   }else if(event.type==='randall-medic'){
    i.allowDialogue=true;
   }else if(event.type==='randall-complete'){
    achieved(i);
   }
  }
 }
 function woodlandEvents(i,events){
  for(const event of events){
   if(event.type==='behind')playSceneSound(i,{noise:true,duration:.2,gain:.24,filter:1400,pan:.25});
   else if(event.type==='scare'||event.type==='grab')playSceneSound(i,{buffer:audio?.samples?.growl,type:'triangle',freq:103,end:40,duration:.6,gain:.46,filter:1450});
   else if(event.type==='push')playSceneSound(i,{noise:true,duration:.09,gain:.18,filter:1100});
   else if(event.type==='shove')playSceneSound(i,{noise:true,duration:.35,gain:.34,filter:560});
  }
 }
 function schoolCanLeave(i){return i.kind==='schoolSetup'&&i.phase==='nightmare'&&i.reorientation>=1.2;}
 function canMove(i){
  if(i.kind==='woodland')return !i.done&&i.snapshot.canMove;
  return !i.done&&(/WALK/.test(i.scene.controls)||schoolCanLeave(i))&&i.snapshot.status!=='captured'&&i.snapshot.status!=='survived'&&i.snapshot.phase!=='capture';
 }
 function tick(dt,controls={}){
  const i=item;if(!live(i)||!i.ready)return;if(!Number.isFinite(dt)||dt<0)throw new Error('Invalid encounter dt');
  const active=!i.paused&&controls.paused!==true&&controls.hidden!==true&&controls.loading!==true&&controls.pointerReady!==false&&controls.focused!==false;
  if(!active){stopSceneSounds(i);return;}
  i.time+=dt;const edge=!!controls.interact&&!i.interactHeld;i.interactHeld=!!controls.interact;
  const lightEdge=!!controls.flashlight&&!i.flashlightHeld;i.flashlightHeld=!!controls.flashlight;
  if(i.kind==='woodland'&&lightEdge&&!i.done&&i.snapshot.canMove)i.flashlightOn=!i.flashlightOn;
  if(i.kind==='schoolSetup'&&i.finalAcknowledged&&!i.done){
   if(i.phase==='normal')playSceneSound(i,{noise:true,duration:.65,gain:.14,filter:410});
   i.reorientation+=dt;
   i.phase=i.reorientation<.45?'transformation':'nightmare';
  }
  if(i.kind!=='woodland'||i.snapshot.canMove){
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
  const schoolEscape=schoolCanLeave(i);
  if(canMove(i)){const f=Number.isFinite(controls.forward)?Math.max(-1,Math.min(1,controls.forward)):0,r=Number.isFinite(controls.strafe)?Math.max(-1,Math.min(1,controls.strafe)):0;
   const speed=i.kind==='woodland'?(i.snapshot.state==='fleeing'?3.35:2.3):i.kind==='school'?1.8:1.7;
   const step=Math.min(dt,.1)*speed/Math.max(1,Math.hypot(f,r));
   const delta={x:(-Math.sin(i.player.yaw)*f+Math.cos(i.player.yaw)*r)*step,z:(-Math.cos(i.player.yaw)*f-Math.sin(i.player.yaw)*r)*step};
   let xy;
   if(i.kind==='school')xy=i.controller.move(i.player,delta);
   else if(i.kind==='woodland')xy=moveBounded(i.player,delta,WOODLAND_LAYOUT);
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
   const previous=i.snapshot.elapsed;
   i.snapshot=i.controller.update(dt,{player:i.player,interact:!!controls.interact,pushPresses:controls.stabTimes?.length||0});
   if(i.snapshot.scriptedPlayer)Object.assign(i.player,i.snapshot.scriptedPlayer);
   woodlandEvents(i,i.snapshot.events);
   if(previous<.45&&i.snapshot.elapsed>=.45)playSceneSound(i,{noise:true,duration:.45,gain:.18,filter:1250});
   if(previous<.85&&i.snapshot.elapsed>=.85)playSceneSound(i,{buffer:audio?.samples?.growl,type:'triangle',freq:78,end:42,duration:.7,gain:.18,filter:760});
   if(i.snapshot.state==='mounted'){
    mountReceipt={...i.token,enemy:{...i.snapshot.enemy},elapsed:i.snapshot.elapsed,escapeElapsed:0,flashlight:i.flashlightOn};
    achieved(i);
   }
  }
  if(i.snapshot.state==='mounted'&&(i.kind==='woodland'||i.kind==='bicycleEscape'&&!i.done)){
   // E starts the authored ride immediately. The accepted mount carries its
   // progress across the story cut while S06 still commits the exit receipt.
   const previous=i.snapshot.escapeElapsed;
   i.snapshot.escapeElapsed=Math.min(WOODLAND_ESCAPE_SECONDS,previous+dt);
   if(i.kind==='woodland')mountReceipt.escapeElapsed=i.snapshot.escapeElapsed;
   if(i.snapshot.escapeElapsed<WOODLAND_ESCAPE_SECONDS&&dt>0&&(!i.rideAudio||Math.floor(i.snapshot.escapeElapsed/.65)>Math.floor(previous/.65))){
    i.rideAudio=true;
    playSceneSound(i,{noise:true,duration:.68,gain:.15,filter:420});
    playSceneSound(i,{noise:true,duration:.18,gain:.12,filter:1800});
    if(previous===0||Math.floor(i.snapshot.escapeElapsed/1.3)>Math.floor(previous/1.3))
     playSceneSound(i,{noise:true,duration:.43,gain:.1,filter:780});
   }
   if(i.snapshot.escapeElapsed>=WOODLAND_ESCAPE_SECONDS){
    i.snapshot.state='escaped';
    if(i.kind==='bicycleEscape'){mountReceipt=null;achieved(i);}
   }
  }
  if(schoolEscape&&!i.done&&i.player.x<=1.4&&i.player.z>=-8.4&&i.player.z<=-3.6){schoolStartReceipt={runId:i.token.runId,player:{...i.player}};achieved(i);}
  if(i.kind==='school'&&!i.done){
   const door=edge&&nearbySchoolDoor(i.player);
   const doorMoved=door&&i.controller.toggleDoor(door.id,i.token);
   const footfall=Math.floor(i.walked/.7);
   let noise;
   if(doorMoved||footfall>(i.footfall||0)){
    i.footfall=footfall;
    noise={id:i.time,type:doorMoved?'door':'footsteps',x:i.player.x,z:i.player.z,radius:doorMoved?4.8:2.6};
    playSceneSound(i,{noise:true,duration:doorMoved?.16:.08,gain:.09,filter:doorMoved?560:1000});
   }
   const previous=i.snapshot.zombie.state;
   i.snapshot=i.controller.update(dt,{token:i.token,player:i.player,noise,ready:true,controllable:true,pointerReady:true});
   if(previous!=='detection_tell'&&i.snapshot.zombie.state==='detection_tell'){
    const pan=audio?.pan?.(i.snapshot.zombie,i.player)||0;
    playSceneSound(i,{buffer:audio?.samples?.scream,type:'sawtooth',freq:175,end:55,duration:.85,gain:.47,filter:4000,pan});
   }
   if(i.snapshot.status==='survived'){if(!i.schoolReoriented){const a=SCHOOL_LAYOUT.setupAnchor;i.player={...a.position,yaw:Math.atan2(-(a.lookTarget.x-a.position.x),-(a.lookTarget.z-a.position.z)),pitch:0};i.schoolReoriented=true;i.reorientation=0;clear();}else i.reorientation+=dt;if(i.reorientation>=1.2)achieved(i);}
  }
  if(i.kind==='waynePrelude'&&!i.done&&edge&&wayneContainer(i)){
   i.snapshot={phase:'examined'};
   playSceneSound(i,{noise:true,duration:.14,filter:950,gain:.2});
   achieved(i);
  }
  if(i.kind==='wayne'&&!i.done){
   const r=i.controller.update(dt,{token:i.token,active:true,ready:true});
   i.snapshot=r.state;horrorEvents(i,r.events);
  }
  if(i.kind==='patrol'){
   const distance=Math.hypot(i.player.x-RANDALL_AMBUSH_SITE.x,i.player.z-RANDALL_AMBUSH_SITE.z);
   i.snapshot={phase:'patrol',walked:i.walked};
   if(!i.done&&i.walked>=4&&distance<=1){
    playSceneSound(i,{buffer:audio?.samples?.patrolThunder,noise:true,duration:1.5,filter:420,gain:.31});
    playSceneSound(i,{buffer:audio?.samples?.oliveBark,freq:173,end:88,duration:.56,filter:2300,gain:.28,type:'sawtooth',pan:.3});
    horrorNotice(i,'Olive barks near the pile. Thunder rolls.');
    achieved(i);
   }
  }
  if(i.kind==='randall'&&!i.done){
   const r=i.controller.update(dt,{token:i.token,active:true,ready:true,ambush:true,actorsReady:true,struggle:edge,reportAcknowledged:i.finalAcknowledged});
   i.snapshot={...r.state,ambushOrigin:i.ambushOrigin};
   horrorEvents(i,r.events);
  }
  if(!live(i))return;Object.assign(getGame().player,i.player);present(i);
  for(const id of i.scene.required_actions||[])if(i.done&&!i.actions.has(id))cue(i,id);
  if(i.done&&i.finalAcknowledged&&(i.scene.required_actions||[]).every(id=>i.actions.has(id))&&!i.completing){
   if(i.kind==='patrol'||i.kind==='waynePrelude')horrorHandoff={runId:i.token.runId,source:i.kind,player:{...i.player}};
   i.completing=true;
   const r=i.emit({type:'completion',...i.token,transitionId:`${i.scene.scene_id}:exit`,reason:'normal'});
   if(live(i)&&!r?.accepted)i.completing=false;
  }
 }
 function pending(i){
  if(i.kind==='schoolSetup')return i.finalAcknowledged&&!i.done;
  if(i.kind==='woodland')return ['scare','fleeing','grab','struggle','shove','captured'].includes(i.snapshot.state);
  return !i.done&&!i.allowDialogue;
 }
 function frame(){
  const i=item;if(!live(i))return null;
  const p=pending(i),captured=i.snapshot.status==='captured'||i.snapshot.state==='captured';
  const woodland=i.kind==='woodland';
  const pushRequired=woodland&&i.snapshot.state==='struggle';
  const flashlightAllowed=woodland&&i.snapshot.canMove&&!i.done;
  const canMount=woodland&&i.snapshot.state==='free'&&canMountWoodlandBike(i.player);
  const canUseSchoolDoor=i.kind==='school'&&i.snapshot.status==='running'&&!!nearbySchoolDoor(i.player);
  const canExamine=i.kind==='waynePrelude'&&!i.done&&wayneContainer(i);
  const horrorPrompt=i.horrorNotice?.until>=i.time?i.horrorNotice.text:i.snapshot.objective||
   (i.kind==='waynePrelude'&&!i.done?'Walk to the cooler and inspect it.':i.kind==='patrol'&&!i.done?'Follow Brad and Olive along the trail.':null);
  return {
   adapterKey:'v4Encounter',sceneId:i.scene.scene_id,token:copy(i.token),ready:i.ready,renderer:'v31-view',time:i.time,
   player:copy(i.player),eyeHeight:i.eyeHeight,set:copy(i.descriptor),encounter:copy(i.snapshot),encounterSnapshot:copy(i.snapshot),
   encounterStatus:captured?'captured':i.done?'completed':i.snapshot.status||i.snapshot.state||'running',
   flashlight:i.flashlightOn,flashlightAllowed,fade:i.captureFade||0,pushRequired,
   phase:i.kind==='school'?(i.snapshot.status==='survived'?'reorientation':'nightmare'):i.phase,
   reduced:!!getReducedMotion(),prelude:i.kind==='waynePrelude',weaponVisible:false,healthVisible:false,trialHudVisible:false,
   controls:i.kind==='schoolSetup'&&i.phase==='nightmare'?'WALK_LOOK':i.scene.controls,identity:i.scene.perspective,
   objective:i.scene.objective,actionPending:p,
   actionPrompt:captured?'Caught. Press interact to retry this encounter.':i.kind==='schoolSetup'&&i.phase==='nightmare'?'Leave the classroom. Reach the hallway.':woodland?woodlandPrompts[i.snapshot.state]||'':horrorPrompt||i.scene.objective,
   canContinue:!p,canInteract:captured||pushRequired||canMount||canUseSchoolDoor||canExamine||(i.kind==='randall'&&i.snapshot.phase==='grab'),
   interactionPrompt:captured?'Retry encounter':pushRequired?'Push it off':i.kind==='randall'?'STRUGGLE':woodland?'Mount bicycle':i.kind==='school'?'Open / close nearby door':'Examine container',
   narrativeUI:{continue:!p,skip:false},movementEnabled:canMove(i),lookEnabled:!woodland||i.snapshot.canMove,
   stagingComplete:i.done,implementationStage:'v4-functional-candidate'
  };
 }
 function onCue(e){const i=item;if(!live(i)||!same(e,i.token))return;if(e.cueId===`line:${i.scene.line_ids.at(-1)}:complete`)i.finalAcknowledged=true;view.setCue?.({token:i.token,cueId:e.cueId});}
 return {enter,tick,frame,peekFrame:frame,readStatus:frame,onCue,onContinue:()=>false,onSkip:()=>false,exit,pause(){if(item){item.paused=true;stopSceneSounds(item);}},resume(){if(item)item.paused=false;},dispose(){exit();mountReceipt=null;schoolStartReceipt=null;horrorHandoff=null;}};
}
