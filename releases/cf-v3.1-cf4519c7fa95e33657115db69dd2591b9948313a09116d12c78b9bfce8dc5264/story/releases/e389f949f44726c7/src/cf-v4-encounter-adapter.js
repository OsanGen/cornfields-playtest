import {canMountWoodlandBike,createWoodlandEncounter,sampleWoodlandEscape,WOODLAND_LAYOUT,WOODLAND_ESCAPE_SECONDS} from './cf-v4-woodland.js';
import {createSchoolEncounter,SCHOOL_LAYOUT} from './cf-v4-school-encounter.js';
import {createScriptedHorror,RANDALL_AMBUSH_SITE} from './cf-v4-scripted-horror.js';
import {PATROL_LANDMARK} from './cf-v4-patrol-layout.js';
import {moveBounded} from './cf-v4-evasion-geometry.js';
const copy=x=>x==null?x:JSON.parse(JSON.stringify(x));
const same=(a,b)=>a&&b&&a.runId===b.runId&&a.sceneId===b.sceneId&&a.entryId===b.entryId;
const finite=p=>p&&['x','y','z'].every(k=>Number.isFinite(p[k]));
const nearbySchoolDoor=player=>SCHOOL_LAYOUT.rooms.map(room=>room.door).find(door=>Math.hypot(door.x-player.x,door.z-player.z)<=1.4);
function nearbySchoolMarks(player){
 const dx=8.85-player.x,dz=-1.7-player.z;
 const distance=Math.hypot(dx,dz);
 return distance<1.6&&(-Math.sin(player.yaw)*dx-Math.cos(player.yaw)*dz)>distance*.35;
}
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
 function playSchoolDoor(i,event,{pan=0,gain=.12}={}){
  playSceneSound(i,{noise:true,duration:event.open?.16:.13,gain,filter:event.open?660:480,pan});
  playSceneSound(i,{noise:true,duration:.045,gain:gain*.7,filter:1350,pan,delay:.045});
 }
 function exit({recoverable=false,discardRetained=false}={}){
  const i=item;
  if(discardRetained||i?.kind==='bicycleEscape'&&!recoverable)mountReceipt=null;
  if(!i)return;
  i.exited=true;item=null;
  stopSceneSounds(i);i.controller?.dispose?.();clear();view?.releaseSet?.(i.token);
 }
 async function enter({scene,token,checkpoint,emit}){
  exit();
  if(!scene?.encounter_kind||!same(token,{...token,sceneId:scene.scene_id})||typeof emit!=='function')throw new Error('V4 encounter entry contract unavailable');
  const kind=scene.encounter_kind;
  if(!['woodland','bicycleEscape','schoolSetup','school','wayne','patrol','randall','waynePrelude'].includes(kind))throw new Error(`Unsupported V4 encounter ${kind}`);
  if(horrorHandoff&&(horrorHandoff.runId!==token.runId||horrorHandoff.source!==horrorPredecessor[kind]))horrorHandoff=null;
  const i={scene,token:{...token},emit,kind,ready:false,exited:false,time:0,done:false,finalAcknowledged:!scene.line_ids.length,actions:new Set(),sceneSounds:new Set(),controller:null,snapshot:{},interactHeld:true,phase:'normal',reorientation:0,walked:0,paused:false,flashlightOn:true,flashlightHeld:true,retryRequested:false};item=i;
  if(kind==='school')i.schoolPreset=checkpoint?.entryFixture?.schoolPreset||'combined';
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
  if(kind==='woodland'){mountReceipt=null;i.controller=createWoodlandEncounter({token});}
  if(kind==='school')i.controller=createSchoolEncounter({token,
   doorDelay:['combined','door-only'].includes(i.schoolPreset),
   searchSweep:['combined','search-only'].includes(i.schoolPreset)});
  if(kind==='wayne')i.controller=createScriptedHorror({kind,token});
  const setId=['woodland','bicycleEscape'].includes(kind)?'V4_WOODLAND':['school','schoolSetup'].includes(kind)?'V4_SCHOOL':['wayne','waynePrelude'].includes(kind)?'V4_WAYNE':'SEARCH_TRAIL';
  const anchorId=setId==='V4_WOODLAND'?'WOODLAND_START':setId==='V4_SCHOOL'?'SCHOOL_START':setId==='V4_WAYNE'?'WAYNE_LAB_ENTRY':'SEARCH_BEND';
  clear();
  const patrolLayout=kind==='patrol'&&checkpoint?.entryFixture?.patrolLayout==='alternate'?'alternate':undefined;
  const d=await view.enterSet({setId,anchorId,token,period:scene.perspective?.period,actors:[],patrolLayout});
  if(!live(i))return;
  if(d?.ready!==true||!finite(d.anchor?.position)||!finite(d.anchor?.lookTarget)||!Number.isFinite(d.anchor?.eyeHeight)||!Array.isArray(d.colliders))throw new Error(`${scene.scene_id}: encounter geometry/readiness missing`);
  i.descriptor=d;i.eyeHeight=d.anchor.eyeHeight;
  if(patrolLayout)i.patrolLayout=patrolLayout;
  const a=d.anchor,dx=a.lookTarget.x-a.position.x,dz=a.lookTarget.z-a.position.z;
  i.player={...a.position,yaw:Math.atan2(-dx,-dz),pitch:Math.atan2(a.lookTarget.y-a.position.y-a.eyeHeight,Math.hypot(dx,dz))};
  if(horrorHandoff){
   const pose=horrorHandoff.player;
   if(!view.canPlaceBody({token:i.token,player:pose,eyeHeight:i.eyeHeight}))throw new Error(`${scene.scene_id}: prior encounter pose cannot be carried into the next scene`);
   i.player={...pose};
  }
  if(kind==='randall'){
   i.ambushOrigin={...i.player};
   i.controller=createScriptedHorror({kind,token,origin:i.ambushOrigin,colliders:d.colliders});
   i.finishedLines=new Set();
  }
  if(kind==='school')Object.assign(i.player,schoolStartReceipt?.runId===token.runId?schoolStartReceipt.player:SCHOOL_LAYOUT.playerStart,{y:0});
  if(kind==='schoolSetup'){const a=SCHOOL_LAYOUT.setupAnchor;i.player={...a.position,yaw:Math.atan2(-(a.lookTarget.x-a.position.x),-(a.lookTarget.z-a.position.z)),pitch:0};}
  if(ride){
   i.flashlightOn=ride.flashlight;
   i.player.yaw=ride.lookYaw;i.player.pitch=ride.lookPitch;
   i.snapshot={state:'mounted',escapeElapsed:ride.escapeElapsed,elapsed:ride.elapsed,enemy:{...ride.enemy},lookYaw:ride.lookYaw,lookPitch:ride.lookPitch};
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
    for(const delay of taps?[0,.15,.30]:[0,.085,.17,.26]){
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
    if(first){
     const pastBend=i.player.x>24.35||i.player.z>7.35;
     i.player.yaw=Math.atan2(i.player.x-(pastBend?24:19),i.player.z-7);
     i.player.pitch=0;
    }
    horrorNotice(i,first?'Brad fires. The creature lets go.':'Brad fires again. The creatures retreat.');
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
    playSceneSound(i,{noise:true,duration:.2,gain:.24,filter:1400,pan});
    i.soundCaption={text:'Something rustles behind you.',until:i.time+.45};
   }else if(event.type==='scare'||event.type==='grab'){
    playSceneSound(i,{buffer:audio?.samples?.growl,type:'triangle',freq:103,end:40,duration:.6,gain:.46,filter:1450,pan});
    i.soundCaption={text:'The creature growls.',until:i.time+.8};
   }
   else if(event.type==='push')playSceneSound(i,{noise:true,duration:.09,gain:.18,filter:1100});
   else if(event.type==='shove')playSceneSound(i,{noise:true,duration:.35,gain:.34,filter:560});
  }
 }
 function schoolCanLeave(i){return i.kind==='schoolSetup'&&i.phase==='nightmare'&&i.reorientation>=1.2;}
 function canMove(i){
  if(i.kind==='woodland')return !i.done&&i.snapshot.canMove;
  if(i.kind==='randall')return !i.done&&i.snapshot.runEnabled;
  return !i.done&&(/WALK/.test(i.scene.controls)||schoolCanLeave(i))&&i.snapshot.status!=='captured'&&i.snapshot.status!=='survived'&&i.snapshot.phase!=='capture';
 }
 function tick(dt,controls={}){
  const i=item;if(!live(i)||!i.ready)return;if(!Number.isFinite(dt)||dt<0)throw new Error('Invalid encounter dt');
  const active=!i.paused&&controls.paused!==true&&controls.hidden!==true&&controls.loading!==true&&controls.pointerReady!==false&&controls.focused!==false;
  if(!active){i.controller?.releasePush?.();stopSceneSounds(i);return;}
  i.time+=dt;const edge=!!controls.interact&&!i.interactHeld;i.interactHeld=!!controls.interact;
  const lightEdge=!!controls.flashlight&&!i.flashlightHeld;i.flashlightHeld=!!controls.flashlight;
  const lightPresses=Number.isSafeInteger(controls.flashlightPresses)?controls.flashlightPresses:Number(lightEdge);
  if(i.kind==='woodland'&&lightPresses%2===1&&!i.done&&i.snapshot.canMove)i.flashlightOn=!i.flashlightOn;
  if(i.kind==='schoolSetup'&&i.finalAcknowledged&&!i.done){
   if(i.phase==='normal')playSceneSound(i,{noise:true,duration:.65,gain:.14,filter:410});
   i.reorientation+=dt;
   i.phase=i.reorientation<.45?'transformation':'nightmare';
  }
  if(i.kind!=='woodland'||i.snapshot.canMove||i.snapshot.state==='mounted'){
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
  const walkedBefore=i.walked;
  if(canMove(i)){const f=Number.isFinite(controls.forward)?Math.max(-1,Math.min(1,controls.forward)):0,r=Number.isFinite(controls.strafe)?Math.max(-1,Math.min(1,controls.strafe)):0;
   const speed=i.kind==='woodland'?(i.snapshot.state==='fleeing'?3.35:2.3):i.kind==='school'?(controls.quiet?1.15:1.8):i.kind==='randall'?2.8:1.7;
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
   i.pushMode=controls.pushMode||'repeat';
   i.snapshot=i.controller.update(dt,{player:i.player,interact:!!controls.interact,pushPresses:controls.pushPresses??controls.stabTimes?.length??0,
    pushHeld:controls.pushHeld,pushReady:controls.pushReady,pushMode:i.pushMode});
   if(i.snapshot.scriptedPlayer)Object.assign(i.player,i.snapshot.scriptedPlayer);
   if(i.snapshot.scareVisible&&i.snapshot.state==='scare')cue(i,'WOODLAND_REVEALED');
   if(i.snapshot.state==='fleeing'){
    cue(i,'WOODLAND_REVEALED');
    cue(i,'WOODLAND_RUN');
   }
   woodlandEvents(i,i.snapshot.events);
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
   const door=edge&&nearbySchoolDoor(i.player);
   const footfall=Math.floor(i.walked/.7);
   const quiet=i.schoolPreset!=='control'&&(controls.quiet===true||Math.hypot(controls.forward||0,controls.strafe||0)<.62);
   if(i.snapshot.status==='running'){
    if(edge&&!door&&i.schoolPreset==='combined'&&!i.schoolMarksInspected&&nearbySchoolMarks(i.player)){
     i.schoolMarksInspected=true;
     i.soundCaption={text:'Three chalk marks. The middle one is shorter.',until:i.time+1.8};
    }
    i.snapshot=i.controller.update(dt,{token:i.token,player:i.player,doorId:door?.id,quiet,
     footstep:footfall>(i.footfall||0),ready:true,controllable:true,pointerReady:true});
    i.footfall=footfall;
    for(const event of i.snapshot.events){
     const pan=audio?.pan?.(event,i.player)||0;
     if(event.type==='door'){
      if(event.actor==='player')i.lastSchoolDoor=event;
      playSchoolDoor(i,event,{pan});
     }else if(event.type==='footsteps'){
      playSceneSound(i,{noise:true,duration:.08,gain:quiet?.045:.09,filter:1000});
     }else if(event.type==='detection'){
      playSceneSound(i,{buffer:audio?.samples?.scream,type:'sawtooth',freq:175,end:55,duration:.85,gain:.47,filter:4000,pan});
      if(i.schoolPreset!=='control')i.soundCaption={text:'A creature screams.',until:i.time+1.4};
     }
    }
   }
   if(i.snapshot.status==='survived'){
    if(!i.schoolReoriented){
     const a=SCHOOL_LAYOUT.setupAnchor;
     i.player={...a.position,yaw:Math.atan2(-(a.lookTarget.x-a.position.x),-(a.lookTarget.z-a.position.z)),pitch:0};
     i.schoolReoriented=true;i.reorientation=0;i.soundCaption=null;clear();
    }else i.reorientation+=dt;
    if(i.schoolPreset==='combined'&&i.lastSchoolDoor&&!i.schoolEchoed&&i.reorientation>=.35){
     i.schoolEchoed=true;
     playSchoolDoor(i,i.lastSchoolDoor,{gain:.065});
     i.soundCaption={text:'A familiar door sound.',until:i.time+.85};
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
  }
  if(i.kind==='patrol'){
   const distance=Math.hypot(i.player.x-RANDALL_AMBUSH_SITE.x,i.player.z-RANDALL_AMBUSH_SITE.z);
   i.snapshot={phase:i.done?'alert':'patrol',walked:i.walked};
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
    horrorNotice(i,'Olive barks near the pile. Thunder rolls.');
    achieved(i);
   }
  }
  if(i.kind==='randall'&&!i.done){
   const r=i.controller.update(dt,{token:i.token,active:true,ready:i.ready,actorsReady:!!i.presentationReady,player:i.player,moving:i.walked>walkedBefore,
    lineComplete:id=>i.finishedLines.has(id),struggle:edge&&i.snapshot.phase==='grab',reportAcknowledged:i.finalAcknowledged});
   i.snapshot={...r.state,ambushOrigin:i.ambushOrigin,walked:i.walked};
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
  if(i.kind==='woodland')return i.snapshot.state==='captured';
  if(['randall','patrol','wayne','waynePrelude'].includes(i.kind))return false;
  return !i.done;
 }
 function readStatus(){
  const i=item;if(!live(i))return null;
  // The fixed-step caller borrows this player pose only for the current input read.
  return {adapterKey:'v4Encounter',renderer:'v31-view',ready:i.ready,player:i.player,actionPending:pending(i),
   pushRequired:i.kind==='woodland'&&i.snapshot.state==='struggle'};
 }
 function frame(){
  const i=item;if(!live(i))return null;
  const p=pending(i),captured=i.snapshot.status==='captured'||i.snapshot.state==='captured';
  const woodland=i.kind==='woodland';
  const pushRequired=woodland&&i.snapshot.state==='struggle';
  const pushMode=i.pushMode||'repeat';
  const pushInstruction=pushMode==='hold'?'Hold to push it off.':pushMode==='single'?'Press once to push it off.':`Press repeatedly to push it off. ${i.snapshot.presses} / ${i.snapshot.targetPresses}`;
  const flashlightAllowed=woodland&&i.snapshot.canMove&&!i.done;
  const canMount=woodland&&i.snapshot.state==='free'&&canMountWoodlandBike(i.player);
  const canUseSchoolDoor=i.kind==='school'&&i.snapshot.status==='running'&&!!nearbySchoolDoor(i.player);
  const canInspectSchoolMarks=i.kind==='school'&&i.snapshot.status==='running'&&i.schoolPreset==='combined'&&!i.schoolMarksInspected&&nearbySchoolMarks(i.player);
  const canExamine=i.kind==='waynePrelude'&&!i.done&&wayneContainer(i);
  const horrorPrompt=i.snapshot.phase==='grab'&&i.kind==='randall'?`Struggle. ${i.snapshot.struggleCount} / 4`:i.snapshot.objective||
   (i.kind==='waynePrelude'&&!i.done?'Walk to the cooler and inspect it.':i.kind==='patrol'&&!i.done?'Follow Brad and Olive along the trail.':null);
  return {
   adapterKey:'v4Encounter',sceneId:i.scene.scene_id,token:copy(i.token),ready:i.ready,renderer:'v31-view',time:i.time,
   soundCaption:!captured&&i.soundCaption?.until>=i.time?i.soundCaption.text:null,
   player:copy(i.player),eyeHeight:i.eyeHeight,set:copy(i.descriptor),encounter:copy(i.snapshot),encounterSnapshot:copy(i.snapshot),
   encounterStatus:captured?'captured':i.done?'completed':i.snapshot.status||i.snapshot.state||'running',
   flashlight:i.flashlightOn,flashlightAllowed,fade:i.captureFade||0,pushRequired,pushMode,
   phase:i.kind==='school'?(i.snapshot.status==='survived'?'reorientation':'nightmare'):i.phase,
   reduced:!!getReducedMotion(),prelude:i.kind==='waynePrelude',weaponVisible:false,healthVisible:false,trialHudVisible:false,
   controls:i.kind==='schoolSetup'&&i.phase==='nightmare'?'WALK_LOOK':i.scene.controls,identity:i.scene.perspective,
   objective:i.scene.objective,actionPending:p,
   actionPrompt:captured?'Caught. Press interact to retry this encounter.':i.kind==='schoolSetup'&&i.phase==='nightmare'?'Leave the classroom. Reach the hallway.':pushRequired?pushInstruction:woodland?woodlandPrompts[i.snapshot.state]||'':horrorPrompt||i.scene.objective,
   canContinue:!p,canInteract:captured||pushRequired||canMount||canUseSchoolDoor||canInspectSchoolMarks||canExamine||(i.kind==='randall'&&i.snapshot.phase==='grab'),
   interactionPrompt:captured?'Retry encounter':pushRequired?'Push it off':i.kind==='randall'?'STRUGGLE':woodland?'Mount bicycle':canInspectSchoolMarks?'Look at the chalk marks':i.kind==='school'?'Open / close nearby door':'Examine container',
   narrativeUI:{continue:!p,skip:false},movementEnabled:canMove(i),lookEnabled:!woodland||i.snapshot.canMove||i.snapshot.state==='mounted',
   stagingComplete:i.done,implementationStage:'v4-functional-candidate'
  };
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
 return {enter,tick,frame,peekFrame:frame,readStatus,onCue,onContinue:()=>false,onSkip:()=>false,exit,pause(){if(item){item.paused=true;item.controller?.releasePush?.();stopSceneSounds(item);}},resume(){if(item)item.paused=false;},dispose(){exit();mountReceipt=null;schoolStartReceipt=null;horrorHandoff=null;}};
}
