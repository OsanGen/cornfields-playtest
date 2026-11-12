import {createFinaleProgression,SAFE_LOWER_SECONDS,SAFE_CUT_TAIL_SECONDS} from './cf-v4-finale.js';
import {createV4EncounterAdapter} from './cf-v4-encounter-adapter.js';
import {runCleanups} from '../../../../shared/runtime/resource-scope.js';
import {interviewReturnContext,isInterviewReturnPose} from './cf-story-memory.js';
import {samplePrologueMotion} from './prologue-motion.js';
import {samplePrologueDriving} from './prologue-driving.js';
import {sampleV31Exit,V31_EXIT_SECONDS,EXIT_SECONDS} from './prologue-performance.js';
import {createPrologueTimeline} from './prologue-script.js';
import {moveBody} from './maze.js';
import {wetGroundHeight} from './environment-materials.js';
import {BINDINGS,COMPOSITE_CUES,STAGE_ANCHORS,actorBindingsFor} from './scene-behaviors.js';
// Reuse the authored drive/braking samples without running obsolete dialogue or events.
const RIDE_TIMELINE=createPrologueTimeline();
const RIDE_CHAPTERS=RIDE_TIMELINE.chapters.filter(c=>['car','dispatch','emergence'].includes(c.id));
export const V31_RIDE_PARK_SECONDS=RIDE_CHAPTERS.at(-1).end;
export function sampleV31Arrival(elapsed,{exitSeconds=null,yaw=0,pitch=0,reduced=false}={}) {
  const time=Math.max(0,Math.min(V31_RIDE_PARK_SECONDS,elapsed));
  const c=RIDE_CHAPTERS.find(c=>time<c.end)||RIDE_CHAPTERS.at(-1);
  const exiting=exitSeconds!==null,progress=exiting?Math.min(1,Math.max(0,exitSeconds)/EXIT_SECONDS):0;
  const frame={v31Arrival:true,chapter:exiting?'exit':c.id,chapterTime:exiting?Math.min(EXIT_SECONDS,Math.max(0,exitSeconds)):time-c.start,chapterProgress:exiting?progress:(time-c.start)/(c.end-c.start),time,elapsed:time,player:{yaw,pitch},reduced,radioOffAt:0};
  frame.driving=samplePrologueDriving(exiting?{chapter:'exit',time,reduced}:frame,{timeline:RIDE_TIMELINE});
  frame.driving.honk=false;
  frame.exitProgress=progress;frame.exitPose=exiting?sampleV31Exit(exitSeconds):null;
  return frame;
}
// CF-V3.1 T01-C foundation: one token-owned presentation lease, no route state.
// This is not a playable-route receipt. Dialogue staging, memory/trial payloads,
// movement and legacy renderer readiness remain explicit integration boundaries.
const sid=scene=>scene.source_scene_id||scene.scene_id;
const copy = value => value == null ? value : JSON.parse(JSON.stringify(value));
const finitePoint = p => !!p && ['x','y','z'].every(k => Number.isFinite(p[k]));
const planarOffset = (player,point) => {const dx=point.x-player.x,dz=point.z-player.z;return {dx,dz,distance:Math.hypot(dx,dz)};};
const facingDot = (player,offset) => (-Math.sin(player.yaw)*offset.dx-Math.cos(player.yaw)*offset.dz)/offset.distance;
const inspectionActions = {
  ENVELOPE: ['INSPECT_ENVELOPE', 'Inspect envelope'],
  PHOTOS: ['INSPECT_PHOTOS', 'Inspect photographs'],
  PAPERS: ['INSPECT_PAPERS', 'Inspect papers'],
};
const keys = [...new Set(Object.values(BINDINGS).map(b => b[0]))];
// The narrative view owns placement; this stateless shim preserves moveBody's
// subdivision and axis ordering without allocating an empty maze every tick.
const movementRow = new Proxy({}, {get:()=>0});
const movementGrid = new Proxy({}, {get:()=>movementRow});
const movementMaze = {grid:movementGrid};

export function createV4Adapters({view,prologueView,survivalView,audio,input,getGame,replaceTrialGame,ui,reducedMotion=false,getReducedMotion=()=>reducedMotion,hordeDensity='standard'} = {}) {
  // Reserved dependencies are deliberately not invoked before their frozen seams
  // exist. In particular: never drive legacy story clocks to manufacture readiness.
  void prologueView; void survivalView; void audio; void replaceTrialGame;
  let owner = null, trialAttempt = 0, arrivalHandoff = null, retainedArrival = null, rideContinuation = null;
  const prepareView=presentation=>typeof view.prepare==='function'?view.prepare(presentation):view.render(presentation);
  const preparePrologue=frame=>typeof prologueView.prepare==='function'?prologueView.prepare(frame):prologueView.render(frame);
  const clearInput = () => {
    if (typeof input?.quarantine === 'function') input.quarantine();
    else input?.clear?.();
    input?.clearEdges?.();
  };
  function makeAdapter(key) {
    let lease = null;
    const live = item => item && lease === item && owner === item && !item.exited;
    function stopHandSound(item) {
      if (!item?.handSound) return;
      try { item.handSound.stop(); } catch {}
      item.handSound = null;
    }
    function stopRoomSound(item) {
      for(const source of item.roomSounds||[])try{source?.stop();}catch{}
      item.roomSounds=null;
    }
    function stopContactSound(item) {
      try{item.contactSound?.stop();}catch{}
      item.contactSound=null;
    }
    function roomSound(item) {
      const set=item.descriptor?.setId;
      const horde=key==='revelation';
      if((!horde&&!['HISTORICAL_CAFE','HISTORICAL_LUNCH','HISTORICAL_STORE'].includes(set))||item.scene.scene_id==='CF-S29')return;
      if(audio?.muted||audio?.ctx?.state!=='running'){stopRoomSound(item);return;}
      if(item.time<(item.nextRoomSound||0))return;
      stopRoomSound(item);item.nextRoomSound=item.time+2.5;
      if(horde){
        const gathered=item.reveal?.tugAt!=null;
        item.roomSounds=[
          audio.sound?.({noise:true,duration:2.5,gain:.033,filter:255,bus:audio.master}),
          ...(gathered?[
            audio.sound?.({noise:true,duration:2.5,gain:.018,filter:420,pan:-.62,bus:audio.master}),
            audio.sound?.({noise:true,duration:2.5,gain:.014,filter:315,pan:.65,bus:audio.master})
          ]:[])
        ];
        return;
      }
      // Quiet original room texture and incidental dishes or counter sounds.
      // No contemporary broadcasts, recorded crowd speech or storm audio.
      item.roomSounds=[
        audio.sound?.({noise:true,duration:2.45,gain:.026,filter:set==='HISTORICAL_STORE'?390:325,bus:audio.master}),
        audio.sound?.({freq:set==='HISTORICAL_STORE'?306:840,end:set==='HISTORICAL_STORE'?120:560,duration:.10,gain:.014,pan:-.45,filter:900,bus:audio.master})
      ];
    }
    function exit({recoverable=false,discardRetained=false}={}) {
      const item = lease;
      if (!item || item.exited) {
        if(discardRetained&&retainedArrival){prologueView?.release?.();retainedArrival=null;}
        if(discardRetained&&rideContinuation){prologueView?.release?.();rideContinuation=null;}
        return;
      }
      item.exited = true;item.finaleProgress?.dispose();stopHandSound(item);stopRoomSound(item);stopContactSound(item);
      lease = null;
      const ownsInput = owner === item;
      if (ownsInput) owner = null;
      // releaseSet is token-scoped; never dispose the shared renderer or assets.
      try { if (item.setRequested) view.releaseSet(item.token);
        if(item.retainedExterior){
          if(recoverable&&!discardRetained&&prologueView.parkArrival?.(item.token))retainedArrival={runId:item.token.runId,retained:true};
          else {prologueView.releaseArrival?.(item.token);retainedArrival=null;}
        }
        else if(!discardRetained&&key==='call'&&(item.completing||item.completionAccepted)){rideContinuation={runId:item.token.runId,elapsed:item.rideElapsed,player:copy(item.legacyFrame.player)};}
        else if(!discardRetained&&key==='cruiser'&&item.carExited&&prologueView?.retainArrival&&prologueView?.adoptArrival){retainedArrival=prologueView.retainArrival({runId:item.token.runId});}
        else if(item.legacyFrame){prologueView?.release?.();if(key==='call')rideContinuation=null;} }
      finally { if (ownsInput) clearInput(); }
    }
    async function applySet(item,binding) {
      const scene = item.scene;
      if (binding[1]) {
          if (!view || ['enterSet','releaseSet','setCue'].some(name => typeof view[name] !== 'function')) throw new Error(`${scene.scene_id}: V3.1 view contract unavailable`);
          item.setRequested = true;
          const handoff=sid(scene)==='CF-S03'&&binding[1]==='FARM_FRONT'&&arrivalHandoff?.runId===item.token.runId?arrivalHandoff:null;
          const anchorId=handoff&&binding[1]==='FARM_FRONT'?'CAR_EXIT':binding[2];
          const retained=!!handoff&&!!retainedArrival&&retainedArrival.runId===item.token.runId;
          if(retained&&!item.retainedExterior){prologueView.adoptArrival(item.token);item.retainedExterior=true;}
          const actors=actorBindingsFor(sid(scene),binding,scene.scene_id);
          const revealDensity=scene.scene_id==='CF-S21'?(item.checkpoint.entryFixture?.hordeDensity||hordeDensity):undefined;
          const descriptor = await view.enterSet({setId:binding[1],anchorId,period:scene.perspective?.period,actors,collisionOnly:retained,token:item.token,sourceSceneId:sid(scene),hordeDensity:revealDensity});
          if (!live(item)) return;
          if (descriptor?.token && (descriptor.token.runId !== item.token.runId || descriptor.token.sceneId !== item.token.sceneId || descriptor.token.entryId !== item.token.entryId)) throw new Error(`${scene.scene_id}: stale view descriptor`);
          if (descriptor?.ready !== true || descriptor.setId !== binding[1] || !finitePoint(descriptor.anchor?.position) || !Number.isFinite(descriptor.anchor?.eyeHeight) || !Array.isArray(descriptor.colliders)) throw new Error(`${scene.scene_id}: safe geometry/camera not ready`);
          if (descriptor.cameraApplied !== true && descriptor.readiness?.cameraApplied !== true) throw new Error(`${scene.scene_id}: view did not apply existing camera`);
          if (typeof ui?.isReady !== 'function' || ui.isReady() !== true || typeof ui.showIdentity !== 'function') throw new Error(`${scene.scene_id}: required narrative UI unavailable`);
          const player = ['schoolMemory','childMemory'].includes(key) ? (item.memoryPlayer ||= {x:0,z:0,yaw:0,pitch:0}) : getGame?.()?.player, anchor = descriptor.anchor;
          if (!player || !['x','z','yaw','pitch'].every(field => Number.isFinite(player[field])) || !finitePoint(anchor.lookTarget)) throw new Error(`${scene.scene_id}: existing body/anchor unavailable`);
          const dx = anchor.lookTarget.x-anchor.position.x, dz = anchor.lookTarget.z-anchor.position.z;
          const yaw = handoff?.player.yaw??Math.atan2(-dx,-dz), pitch = handoff?.player.pitch??Math.atan2(anchor.lookTarget.y-anchor.position.y-anchor.eyeHeight,Math.hypot(dx,dz));
          player.x=anchor.position.x; player.z=anchor.position.z; player.yaw=yaw; player.pitch=pitch;
          item.floorY=handoff?.player.y??anchor.position.y;
          if(handoff){item.arrivalHandoff=copy(handoff);item.floorY=handoff.player.y;prepareView({token:item.token,player:copy(handoff.player),eyeHeight:handoff.eyeHeight});}
          // Legacy body has no y field: floor height remains the view anchor.
          ui.showIdentity({scene,token:item.token});
          if (!live(item)) return;
          if (ui.isReady() !== true || player.x !== anchor.position.x || player.z !== anchor.position.z || player.yaw !== yaw || player.pitch !== pitch) throw new Error(`${scene.scene_id}: presentation application failed`);
          item.presentationReady={token:item.token,environmentId:binding[1],anchorId,geometryReady:true,uiReady:true,bodyApplied:true,cameraApplied:true};
          item.descriptor = copy({setId:descriptor.setId,anchor:descriptor.anchor,colliders:descriptor.colliders,bounds:descriptor.bounds,missingAssets:descriptor.missingAssets || [],composition:descriptor.composition || null});
          item.inspectionPresented=undefined;
          if(item.retainedExterior&&binding[1]!=='FARM_FRONT'){prologueView.releaseArrival(item.token);retainedArrival=null;item.retainedExterior=false;}
        }
    }
    async function enter({scene,token,checkpoint,emit} = {}) {
      const binding = scene?.binding||BINDINGS[scene?.scene_id];
      if (!binding || binding[0] !== key || scene.adapter_key !== key) throw new Error(`Adapter/scene mismatch: ${key}`);
      if (!token || token.sceneId !== scene.scene_id || !Number.isInteger(token.entryId) || token.entryId < 1 || !Number.isInteger(token.runId) || token.runId < 1) throw new Error('Invalid adapter entry token');
      if (typeof emit !== 'function' || !checkpoint || scene.entry?.checkpoint !== `CP-${scene.scene_id.slice(-2)}`) throw new Error('Invalid adapter entry contract');
      if (owner && owner !== lease) throw new Error('Previous adapter lease must exit before entry');
      exit();
      if(retainedArrival&&(scene.scene_id!=='CF-S03'||retainedArrival.runId!==token.runId)){prologueView.release?.();retainedArrival=null;}
      if(rideContinuation&&(scene.scene_id!=='CF-S02'||rideContinuation.runId!==token.runId)){prologueView.release?.();rideContinuation=null;}
      // Missing transfer channels must fail visibly, not silently lose adult state.



      const item = {token:Object.freeze({...token}),scene,emit,exited:false,ready:false,setRequested:false,entryEmitted:false,time:0,descriptor:null,received:new Set(),actorPhases:new Set(),lastCue:null,checkpoint:copy(checkpoint),finalAcknowledged:false,completionAccepted:false,queuedCues:[],pendingSemantic:new Set()};
      lease = owner = item;if(scene.finale)item.finaleProgress=createFinaleProgression({sceneId:scene.scene_id,token});
      try {
        if (!!scene.memory_return) {
          const c=item.checkpoint.return_context,source=scene.memory_return.source_scene_id;
          if (!(c?.schema_version===1 && c.run_id===token.runId && c.source_scene_id===source && c.target_scene_id===scene.scene_id && c.consumed===false && isInterviewReturnPose(c) && typeof c.camera_preset==='string' && typeof c.control_mode==='string' && typeof c.modern_state?.objective==='string' && typeof c.modern_state.weapon_visible==='boolean' && typeof c.modern_state.health_visible==='boolean')) throw new Error(`${scene.scene_id}: invalid saved memory context`);
        }
        clearInput();
        if (['call','cruiser','projector','sky'].includes(key)) {
          if(!prologueView?.render || !prologueView?.diagnostics || !ui?.isReady?.())throw new Error('Legacy presentation dependency unavailable');
          const ride=['call','cruiser'].includes(key),continued=key==='cruiser'?rideContinuation:null;
          item.legacyFrame=ride?sampleV31Arrival(continued?.elapsed||0,{yaw:continued?.player.yaw||0,pitch:continued?.player.pitch||0,reduced:!!getReducedMotion()}):{chapter:key==='sky'?'rupture':'redroom',chapterTime:key==='projector'?2:0,chapterProgress:key==='projector'?2/12.4:0,time:0,player:{yaw:0,pitch:0},reduced:true};
          if(ride){arrivalHandoff=null;item.rideElapsed=continued?.elapsed||0;item.rideExitSeconds=null;rideContinuation=null;if(key==='call')item.legacyFrame.v31WakeSeconds=0;}
          if(key==='sky'){item.legacyFrame.v31Sky=true;item.legacyFrame.motion=samplePrologueMotion({chapter:'rupture',chapterProgress:0,time:0},{worldAvailable:true});}
          preparePrologue(item.legacyFrame);
          const d=prologueView.diagnostics(),p=d.camera;
          if(!d.live || !p || !['x','y','z','yaw','pitch'].every(k=>Number.isFinite(p[k])) || (key==='projector'&&d.environment!=='red room'))throw new Error('Legacy camera/environment not applied');
          const body=getGame?.()?.player;if(!body)throw new Error('Legacy body unavailable');
          Object.assign(body,{x:p.x,z:p.z,yaw:p.yaw,pitch:p.pitch});if(ride)item.rideCamera=copy(p);ui.showIdentity({scene,token:item.token});
          if(!ui.isReady())throw new Error('Legacy UI unavailable');
          item.presentationReady={token:item.token,environmentId:ride?'CRUISER':key==='sky'?'SKY_FIELD_EDGE':'PROJECTOR',anchorId:ride?'EXISTING_PASSENGER_SEAT':key==='sky'?'FIELD_EDGE':'EXISTING_PROJECTOR_ROOM',geometryReady:true,uiReady:true,bodyApplied:true,cameraApplied:true};
        } else if (key==='trial') {
          if(typeof replaceTrialGame!=='function')throw new Error('Trial replacement bridge unavailable');
          const started=await replaceTrialGame({checkpoint:copy(checkpoint),trialAttempt:++trialAttempt,token:item.token,scene,isCurrent:()=>live(item)});
          if(!live(item))return;
          const game=getGame?.();
          if(!started?.trialStartRecipe || started.trialGameRunId!==game?.runId || started.trialAttempt!==trialAttempt || game.survivalEnding?.remaining!==180)throw new Error('Invalid fresh trial bridge result');
          if(!started.presentationReady?.cameraApplied || !started.presentationReady?.bodyApplied || !started.presentationReady?.uiReady)throw new Error('Applied trial presentation readiness missing');
          item.trialStart={trialStartRecipe:copy(started.trialStartRecipe),trialGameRunId:started.trialGameRunId,trialAttempt};
          item.presentationReady=copy(started.presentationReady); item.trialReceipts=new Set();
        } else await applySet(item,binding);
        if(key==='childMemory')item.memoryStart={x:item.memoryPlayer.x,z:item.memoryPlayer.z};
        if (!!scene.memory_return) {
          if(!live(item))return;
          const c=item.checkpoint.return_context,p=c.player,body=getGame?.()?.player;
          const replace=scene.memory_return.policy==='replace';
          if(!replace){
            prepareView({token:item.token,player:copy(p),eyeHeight:item.descriptor.anchor.eyeHeight});
            if(!live(item))return;
            const applied=view.frame()?.cameraPose;
            if(!applied || !['x','y','z','yaw','pitch'].every(k=>Math.abs(applied[k]-p[k])<1e-9))throw new Error(`${scene.scene_id}: saved camera pose not applied`);
            for(const field of ['x','z','yaw','pitch'])body[field]=p[field];
            item.floorY=p.y;
          }
          item.memoryRestore={mode:replace?'replacement':'saved',token:item.token,targetSceneId:scene.scene_id,environmentId:item.presentationReady.environmentId,anchorId:item.presentationReady.anchorId,bodyApplied:true,cameraApplied:true,sourceRunId:c.run_id,sourceSceneId:c.source_scene_id};
        }
        if (live(item)) {
          if (scene.scene_id==='CF-S25'||scene.scene_id==='CF-S27') {
            item.actionPending=true;
            item.actionPrompt=scene.scene_id==='CF-S25'?'Walk to Diego’s table.':'Walk down the aisle to hear the forecast.';
          }
          if(scene.scene_id==='CF-S31')item.bedtimePhase='parents';
          item.ready = true;
          return item.presentationReady ? {presentationReady:copy(item.presentationReady),...(item.trialStart?{trialStart:copy(item.trialStart)}:{}),...(item.memoryRestore?{memoryRestore:copy(item.memoryRestore)}:{})} : undefined;
        }
      } catch (error) {
        if (!live(item)) return; // Late failures cannot poison the next entry.
        runCleanups([()=>exit({recoverable:!!item.retainedExterior})]);
        throw error;
      }
    }
    function semantic(item,cue) {
      item.received.add(cue);
      const result=item.emit({type:'cue',...item.token,cueId:cue});
      if(live(item)&&!result?.accepted&&result?.reason!=='duplicate-cue')item.pendingSemantic.add(cue);
    }
    function updateRide(item,dt,controls={}) {
      item.rideElapsed=Math.min(V31_RIDE_PARK_SECONDS,(item.rideElapsed||0)+dt);
      const parked=item.rideElapsed>=V31_RIDE_PARK_SECONDS;
      if(parked&&!item.rideParked){item.rideParked=true;if(key==='cruiser')semantic(item,'PARKED');}
      if(key==='cruiser'&&parked&&item.finalAcknowledged&&controls.interact&&item.rideExitSeconds===null){item.rideExitSeconds=0;audio?.cue?.('door_open');}
      if(item.rideExitSeconds!==null)item.rideExitSeconds=Math.min(V31_EXIT_SECONDS,item.rideExitSeconds+dt);
      const prior=item.legacyFrame.player;
      item.legacyFrame=sampleV31Arrival(item.rideElapsed,{exitSeconds:item.rideExitSeconds,yaw:Number.isFinite(controls.yaw)?controls.yaw:prior.yaw,pitch:Number.isFinite(controls.pitch)?Math.max(-1.25,Math.min(1.25,controls.pitch)):prior.pitch,reduced:!!getReducedMotion()});
      if(key==='call')item.legacyFrame.v31WakeSeconds=item.time;
      preparePrologue(item.legacyFrame);
      const camera=prologueView.diagnostics().camera;
      if(!camera||!['x','y','z','yaw','pitch'].every(k=>Number.isFinite(camera[k])))throw Error('Cruiser camera unavailable');
      item.rideCamera=copy(camera);Object.assign(getGame().player,{x:camera.x,z:camera.z,yaw:camera.yaw,pitch:camera.pitch});
      if(key==='cruiser'&&item.rideExitSeconds===V31_EXIT_SECONDS&&!item.carExited){
        item.carExited=true;const y=wetGroundHeight(camera.x,camera.z);
        arrivalHandoff={runId:item.token.runId,sourceSceneId:'CF-S02',coordinateFrame:'V31_ROADSIDE_LOCAL',player:{x:camera.x,y,z:camera.z,yaw:camera.yaw,pitch:camera.pitch},camera:copy(camera),eyeHeight:camera.y-y,parked:true,exitComplete:true,reduced:!!getReducedMotion(),skipped:!!item.skipRequested};
        item.arrivalHandoff=copy(arrivalHandoff);semantic(item,'EXIT_CAR');
      }
    }
    function tick(dt,controls={}) {
      const item = lease;
      if (!live(item) || !item.ready || !Number.isFinite(dt) || dt < 0) return;
      if(item.finaleProgress&&(controls.hidden===true||controls.loading===true||controls.focused===false)){
        stopRoomSound(item);stopContactSound(item);return;
      }
      for(const cue of [...item.pendingSemantic]){const result=item.emit({type:'cue',...item.token,cueId:cue});if(!live(item))return;if(result?.accepted||result?.reason==='duplicate-cue')item.pendingSemantic.delete(cue);}
      item.time += dt;
      if(key==='call'||key==='cruiser')updateRide(item,dt,controls);
      if(item.legacyFrame && (key==='call'||key==='cruiser'||key==='projector'||key==='sky'&&!item.skyStarted)) {
        if(Number.isFinite(controls.yaw))item.legacyFrame.player.yaw=controls.yaw;
        if(Number.isFinite(controls.pitch))item.legacyFrame.player.pitch=Math.max(-1.25,Math.min(1.25,controls.pitch));
      }

      if(item.descriptor) {
        const body=item.memoryPlayer||getGame?.()?.player, prior=body&&{x:body.x,z:body.z,yaw:body.yaw,pitch:body.pitch};
        if(body) {
          const candidate={...prior,radius:.25};
          if(Number.isFinite(controls.yaw))candidate.yaw=controls.yaw;
          if(Number.isFinite(controls.pitch))candidate.pitch=Math.max(-1.25,Math.min(1.25,controls.pitch));
          if((['search','hand','historical','childMemory'].includes(key)||sid(item.scene)==='CF-S03')&&/WALK/.test(item.scene.controls)) {
            const f=Number.isFinite(controls.forward)?Math.max(-1,Math.min(1,controls.forward)):0,r=Number.isFinite(controls.strafe)?Math.max(-1,Math.min(1,controls.strafe)):0,step=Math.min(dt,.05)*1.5/Math.max(1,Math.hypot(f,r));
            // Existing movement subdivision; exact environment collision/bounds
            // remain validated by the owning view before committing this body.
            moveBody(movementMaze,candidate,(-Math.sin(candidate.yaw)*f+Math.cos(candidate.yaw)*r)*step,(-Math.cos(candidate.yaw)*f-Math.sin(candidate.yaw)*r)*step);
          }
          const outside=['FARM_FRONT','FARM_YARD','SEARCH_TRAIL'].includes(item.descriptor.setId);
          const placement=point=>({token:item.token,player:{x:point.x,y:outside?wetGroundHeight(point.x,point.z):0,z:point.z,yaw:point.yaw,pitch:point.pitch},eyeHeight:item.descriptor.anchor.eyeHeight});
          if(typeof view.canPlaceBody==='function'&&!view.canPlaceBody(placement(candidate))){
            // Preserve look while resolving each blocked translation component.
            // The view owns the same terrain, body radius, solids and bounds.
            const desiredX=candidate.x,desiredZ=candidate.z;
            candidate.x=prior.x;candidate.z=prior.z;
            if(view.canPlaceBody(placement({...candidate,x:desiredX})))candidate.x=desiredX;
            if(view.canPlaceBody(placement({...candidate,z:desiredZ})))candidate.z=desiredZ;
          }
          const y=outside?wetGroundHeight(candidate.x,candidate.z):0;
          try {prepareView({token:item.token,player:{x:candidate.x,y,z:candidate.z,yaw:candidate.yaw,pitch:candidate.pitch},eyeHeight:item.descriptor.anchor.eyeHeight});Object.assign(body,{x:candidate.x,z:candidate.z,yaw:candidate.yaw,pitch:candidate.pitch});item.floorY=y;if(['CF-S11','CF-S12'].includes(sid(item.scene)))item.walked=(item.walked||0)+Math.hypot(candidate.x-prior.x,candidate.z-prior.z);if(sid(item.scene)==='CF-S03'){const distance=Math.hypot(candidate.x-prior.x,candidate.z-prior.z);if(item.doorEntered)item.insideWalk=(item.insideWalk||0)+distance;else item.outsideWalk=(item.outsideWalk||0)+distance;}}
          catch(error){if(!/unsafe|outside safe body|bounds|collid|floor/i.test(String(error.message)))throw error;}
        }
      }

      if(sid(item.scene)==='CF-S03') {
        if(controls.interact && interaction(item)?.action==='open-front-door' && !item.doorOpening) {
          item.doorOpening=true;item.ready=false;clearInput();
          applySet(item,['farm','FARM_INTERIOR','INTERVIEW_ENTRY']).then(()=>{
            if(!live(item))return;
            item.doorEntered=true;item.insideWalk=0;item.ready=true;
            item.actionPrompt='Walk through the foyer to the interview position.';
            view.setCue({cueId:'AFTER_D06',lineId:'CF-S03-D06',token:item.token});
            semantic(item,'AFTER_D06');
          }).catch(error=>{if(live(item))item.emit({type:'asset-failure',message:String(error.message||error)});});
        }
        const p=getGame?.()?.player;
        if(item.doorEntered&&!item.interviewArrived&&p&&(item.insideWalk||0)>=.7&&Math.hypot(p.x-9.05,p.z-7)<=.4){
          item.interviewArrived=true;item.actionPending=false;item.actionPrompt=null;
        }
      }

      if(item.retainedExterior&&item.descriptor?.setId==='FARM_FRONT')preparePrologue({v31ExteriorWalk:true,token:item.token,player:{...getGame().player,y:item.floorY??item.descriptor.anchor.position.y},eyeHeight:item.descriptor.anchor.eyeHeight,time:item.time,reduced:!!getReducedMotion()});

      if(key==='childMemory' && item.memoryArmed && !item.memoryRevealed) {
        const p=item.memoryPlayer,dx=-p.x,dz=-3.5-p.z,d=Math.hypot(dx,dz);
        const toward=d>0?(-Math.sin(p.yaw)*dx-Math.cos(p.yaw)*dz)/d:1;
        if(Math.hypot(p.x-item.memoryStart.x,p.z-item.memoryStart.z)>=.75 && Math.abs(p.x)<=1.25 && p.z<=1.8 && p.z>=.3 && toward>=.5) {
          item.memoryRevealed=true;item.memoryRevealPosition={x:p.x,z:p.z};item.actionPending=false;
          view.setCue({cueId:'REVEAL',lineId:null,token:item.token});semantic(item,'REVEAL');
        }
      }
      if(key==='childMemory' && item.memoryRevealed && !item.memoryRetreated) {
        const p=item.memoryPlayer,r=item.memoryRevealPosition;
        if(p.z>=r.z+1 && Math.hypot(p.x,p.z+3.5)>=Math.hypot(r.x,r.z+3.5)+.8) {
          item.memoryRetreated=true;item.actionPending=false;view.setCue({cueId:'RETREAT',lineId:null,token:item.token});semantic(item,'RETREAT');
        }
      }

      // Search progression is grounded in the body that survived view collision checks.
      if(sid(item.scene)==='CF-S11') {
        const p=getGame?.()?.player;
        if(p && item.descriptor?.setId==='FARM_INTERIOR' && controls.interact && backDoorTarget(item)) {
          item.ready=false;clearInput();
          applySet(item,['search','FARM_YARD','YARD_EXIT']).then(()=>{if(live(item)){item.yardEntered=true;item.ready=true;}}).catch(error=>{if(live(item))item.emit({type:'asset-failure',message:String(error.message||error)});});
          return;
        }
        if(p && !item.trailEntered && item.descriptor?.setId==='FARM_YARD' && p.x>=19 && Math.hypot(p.x-19,p.z-7)<=.65 && (item.walked||0)>=4.5) {
          const crossing={x:p.x,z:p.z,yaw:p.yaw,pitch:p.pitch};
          item.ready=false;clearInput();
          applySet(item,['search','SEARCH_TRAIL','FIELD_EDGE']).then(()=>{
            if(!live(item))return;
            // Both existing bounds overlap here; retain the real crossing pose.
            prepareView({token:item.token,player:{...crossing,y:wetGroundHeight(crossing.x,crossing.z)},eyeHeight:item.descriptor.anchor.eyeHeight});
            Object.assign(getGame().player,crossing);item.trailEntered=true;item.ready=true;
          }).catch(error=>{if(live(item))item.emit({type:'asset-failure',message:String(error.message||error)});});
          return;
        }
        if(p && item.trailEntered && !item.searchArrived && (item.walked||0)>=8.5 && Math.hypot(p.x-24,p.z-7)<=.75) {
          item.searchArrived=true;semantic(item,'SEARCH_ARRIVED');
        }
      }
      if(sid(item.scene)==='CF-S12' && controls.interact && !item.handExamined) {
        const target=handTarget(item);
        if(target){item.handExamined=true;view.setCue({cueId:'HAND_EXAMINED',lineId:null,token:item.token});semantic(item,'HAND_EXAMINED');}
      }
      if(key==='hand') {
        const target=view.frame()?.interactionTargets?.find(t=>t.id==='HAND_APPROACH');
        const player=getGame?.()?.player;
        const offset=player&&target&&planarOffset(player,target.position);
        item.handIntensity=offset&&!item.skipRequested?Math.max(0,1-offset.distance/11):0;
        if(!item.handExamined&&item.handIntensity>.18&&item.time>=(item.nextHandSound||0)){
          const intensity=item.handIntensity;
          const pan=(Math.cos(player.yaw)*offset.dx-Math.sin(player.yaw)*offset.dz)/Math.max(.01,offset.distance);
          stopHandSound(item);
          item.handSound=audio?.sound?.({noise:true,filter:360+900*intensity,duration:.58+.55*intensity,gain:(.035+.1*intensity)*(getReducedMotion()?.6:1),pan,bus:audio.master});
          item.nextHandSound=item.time+4.2-2.5*intensity;
        }
      }

      if(!item.finaleProgress && controls.interact && sid(item.scene)==='CF-S21' && !item.inspected) {
        const p=getGame?.()?.player,target=(view.frame()?.interactionTargets||[]).find(t=>/envelope/i.test(t.id));
        if(p&&target&&planarOffset(p,target.proximityPoint||target.position).distance<=target.radius){item.inspected=true;view.setCue({cueId:'INSPECT_ENVELOPE',lineId:null,token:item.token});item.emit({type:'cue',...item.token,cueId:'INSPECT_ENVELOPE'});}
      }
      if(sid(item.scene)==='CF-S20'&&item.time>=2.5&&!item.titleHeld){const r=item.emit({type:'cue',...item.token,cueId:'TITLE_HOLD'});if(r?.accepted)item.titleHeld=true;}
      if(item.finalAcknowledged&&['CF-S20','CF-S24'].includes(sid(item.scene))&&!item.exitPresented){const r=item.emit({type:'cue',...item.token,cueId:'EXIT'});if(r?.accepted)item.exitPresented=true;}

      if (!item.entryEmitted && (item.scene.cues || []).includes('ENTRY')) {
        const result = item.emit({type:'cue',...item.token,cueId:'ENTRY'});
        if (!live(item)) return;
        if (result?.accepted === true) {
          item.entryEmitted = true;
          if (item.setRequested) view.setCue({cueId:'ENTRY',lineId:null,token:item.token});
        }
      }
      if(key==='trial' && item.trialStart) {
        if(!item.playEmitted && (item.entryLineAcknowledged || item.checkpoint.trial_snapshot?.entry_line_delivered)) {const r=item.emit({type:'cue',...item.token,cueId:'PLAY'});if(r?.accepted)item.playEmitted=true;}
        const game=getGame?.();
        if(game?.runId===item.trialStart.trialGameRunId && game.mode==='playing' && game.player.health>0)for(const receipt of game.events || []) {
          if(receipt.type!=='trial_complete' || item.trialReceipts.has(receipt.id))continue;
          const result=item.emit({type:'trial-event',receipt:copy(receipt),trialGameRunId:game.runId,trialAttempt:item.trialStart.trialAttempt});
          if(!live(item))return;
          if(result?.accepted)item.trialReceipts.add(receipt.id);
        }
      }
      if(item.finaleProgress){
        roomSound(item);
        if(key==='revelation'&&item.reveal?.lowerAt!=null){
          const lowering=item.time-item.reveal.lowerAt;
          if(lowering>=SAFE_LOWER_SECONDS&&item.finaleProgress.cue('SAFE_LATCHED',item.token)){
            item.reveal.latchedAt=item.time;
            item.soundCaption={text:'The safe latches shut.',until:item.time+SAFE_CUT_TAIL_SECONDS};
            item.contactSound=audio?.sound?.({noise:true,freq:180,end:54,duration:.21,gain:.12,filter:630,bus:audio.master});
          }
        }
        const p=getGame?.()?.player,targets=view.frame()?.interactionTargets||[];
        const interactEdge=controls.interact&&!item.finaleInteractHeld;
        const inspection=interactEdge&&historicalInspection(item,item.inspectionPresented);
        item.finaleInteractHeld=!!controls.interact;
        if(inspection&&item.finaleProgress.cue(inspection.action,item.token)){
          view.setCue({cueId:inspection.action,lineId:null,token:item.token});
          item.inspectionPresented=undefined;
        }
        if(interactEdge&&item.lullabyDone)item.finaleProgress.activateVigil(item.token);
        if(p&&item.bedtimePhase==='bed'&&p.z<2)item.bedroomReturned=true;
        if(p)for(const t of targets){
          const q=t.proximityPoint||t.position;
          if(!q||Math.hypot(p.x-q.x,p.z-q.z)>t.radius)continue;
          const action={LUNCH_TABLE:'REACH_LUNCH_TABLE',STORE_AISLE:'REACH_STORE_AISLE',PARENTS:'REACH_PARENTS',BED:'RETURN_TO_BED'}[t.id];
          if(!action||item.received.has(action)||action==='RETURN_TO_BED'&&!item.bedroomReturned)continue;
          if(!item.finaleProgress.cue(action,item.token))continue;
          if(action==='REACH_PARENTS'){
            item.bedtimePhase='bed';
            item.bedtimeReturnStarted=item.time;
            item.actionPrompt='Walk back to your bedroom with Stanley.';
          }else if(action==='RETURN_TO_BED')item.bedtimePhase='returned';
        }
        const fs=item.finaleProgress.tick(dt,{token:item.token,ready:item.ready});
        for(const action of fs.actions)if(!item.received.has(action))semantic(item,action);
        item.finaleFade=fs.fade;
        if(item.lullabyDone)item.actionPending=!fs.complete;
        else if(key==='revelation'&&item.reveal?.latchedAt!=null){
          item.actionPending=item.time-item.reveal.latchedAt<SAFE_CUT_TAIL_SECONDS;
          if(!item.actionPending)item.actionPrompt=null;
        }else if(fs.complete){
          item.actionPending=false;item.actionPrompt=null;
        }
      }
      // A recap's last line can occur before the normal final line. The moving
      // call must finish its actual D05 before handing the same ride to S02.
      const openingComplete=item.skipRequested?item.recapAcknowledged:item.finalAcknowledged;
      if ((!item.finaleProgress||item.finaleProgress.snapshot().complete) && (key==='call'?openingComplete:item.finalAcknowledged || item.recapAcknowledged) && !item.completionAccepted && (item.skipRequested&&item.recapAcknowledged || (key!=='cruiser'||item.carExited)&&(sid(item.scene)!=='CF-S03'||item.interviewArrived)&&(sid(item.scene)!=='CF-S11'||item.searchArrived)&&(sid(item.scene)!=='CF-S12'||item.handExamined))) {
        const event={type:'completion',...item.token,transitionId:`${item.scene.scene_id}:exit`,reason:key==='trial'?'trial-success':'normal'};
        if (item.scene.memory_capture) event.memoryCapture=interviewReturnContext(item.scene,item.token.runId,getGame?.()?.player);
        // Route completion can synchronously exit this lease inside emit().
        // Mark the real transition before exit so it can transfer the ride.
        item.completing=true;let result;
        try{result=item.emit(event);}finally{if(live(item))item.completing=false;}
        if(live(item)&&result?.accepted)item.completionAccepted=true;
      }
      // No hardware reads, combat, or timer-derived success in this bridge.
    }
    function onCue(event) {
      const item = lease;
      if (!live(item) || event?.runId !== item.token.runId || event?.sceneId !== item.token.sceneId || event?.entryId !== item.token.entryId) return;
      if(!item.ready){if(item.queuedCues.length>=256)throw new Error('Scene cue queue exceeded');item.queuedCues.push({...event});return;}
      const id = event.cueId;if(item.finaleProgress&&id==='line:CF-V4-S32-D01:complete'){item.finaleProgress.cue('LULLABY_COMPLETE',item.token);item.lullabyDone=true;item.actionPending=true;}
      if (!(item.scene.cues || []).includes(id) || item.received.has(id)) return;
      if(key==='revelation'){
        item.reveal??={};
        if(id==='line:CF-S19-D04:start'&&item.reveal.tugAt==null){
          item.reveal.tugAt=item.time;
          item.nextRoomSound=item.time;
        }
        if(id==='line:CF-S19-D06:complete'){
          item.reveal.lowerAt??=item.time;
          item.actionPending=true;
        }
      }
      if(item.scene.scene_id==='CF-S17'&&id==='line:CF-S14-D15:start'&&!item.knockPlayed){
        item.knockPlayed=true;
        item.contactSound=audio?.sound?.({noise:true,duration:.12,filter:640,gain:.16,pan:.28,bus:audio.master});
        view.setCue({cueId:'MIKE_ENTERS_KITCHEN',lineId:null,token:item.token});
      }
      if(item.scene.scene_id==='CF-S23'&&id==='line:CF-S21-D02:complete'&&item.descriptor?.setId==='HISTORICAL_CAFE'){
        item.received.add(id);item.ready=false;clearInput();stopRoomSound(item);
        applySet(item,[key,'HISTORICAL_TABLE','HISTORICAL_TABLE']).then(()=>{
          if(!live(item))return;
          item.ready=true;item.actionPending=true;item.actionPrompt='Inspect the envelope and the farm photographs.';
          while(live(item)&&item.ready&&item.queuedCues.length)onCue(item.queuedCues.shift());
        }).catch(error=>{if(live(item))item.emit({type:'asset-failure',message:String(error.message||error)});});
        return;
      }
      if(item.scene.scene_id==='CF-S24'&&id==='line:CF-S22-D01:complete'&&!item.finaleProgress.snapshot().complete){
        item.actionPending=true;item.actionPrompt='Walk to the desk and inspect the papers.';
      }
      if(item.scene.scene_id==='CF-S31'&&id==='line:CF-V4-S31-D01:complete'&&item.bedtimePhase!=='returned'){
        item.actionPending=true;
        if(item.bedtimePhase==='parents')item.actionPrompt='Walk down the passage to your parents.';
      }
      const actorLine=/^line:((?:CF-S\d{2}|CF-V4-S\d{2})-D\d{2}):(start|complete)$/.exec(id);
      if(actorLine&&item.scene.line_ids.includes(actorLine[1])){
        if(item.actorPhases.has(id))return;item.actorPhases.add(id);
        if(item.setRequested)view.setCue({cueId:id,lineId:actorLine[1],token:item.token});
      }
      if(key==='childMemory') {
        const started=/^line:(CF-S09-D\d{2}):start$/.exec(id);
        if(started)item.memoryCurrentLine=started[1];
        if(!item.skipRequested&&id==='line:CF-S09-D02:start'&&!item.memoryRevealed){item.memoryArmed=true;item.actionPending=true;}
      }
      if (!(item.scene.cues || []).includes(id) || item.received.has(id)) return;
      if(key==='childMemory'&&!item.skipRequested&&id==='line:CF-S09-D04:complete'&&item.memoryRevealed&&!item.memoryRetreated)item.actionPending=true;
      if(!item.skipRequested&&sid(item.scene)==='CF-S03'&&id==='line:CF-S03-D06:complete'){
        item.received.add(id);item.actionPending=true;item.actionPrompt='Walk to the front door and open it.';return;
      }
      if (id === `line:${item.scene.line_ids.at(-1)}:complete`) item.finalAcknowledged=true;
      if(id==='line:CF-S18-D01:complete')item.entryLineAcknowledged=true;
      if(id===`line:${item.scene.recap_line_ids?.at(-1)}:complete`)item.recapAcknowledged=true;
      const line = /^line:((?:CF-S\d{2}|CF-V4-S\d{2})-D\d{2}):(start|complete)$/.exec(id);
      let cue = id, lineId = null;
      if (line) {
        lineId = line[1];
        if (!item.scene.line_ids.includes(lineId)) return;
        const short = lineId.slice(-3);
        if(line[2]==='start')item.actionLine=Number(short.slice(1));
        // Auto dialogue completion is never an accessibility action. Keep the
        // explicit cut-based alternative available until a real Continue input.
        if(key==='childMemory' && line[2]==='start' && short==='D04')item.memoryRetreatOffered=true;
        cue = line[2] === 'complete' ? `AFTER_${short}` : COMPOSITE_CUES[sid(item.scene)]?.[short] || short;
        if (!(item.scene.cue_bindings || []).some(binding => binding.bound_cue === cue)) return;
      }
      if(key==='sky' && ['D02','AFTER_D03'].includes(cue)) {
        item.skyStarted=true;
        item.legacyFrame.chapter=cue==='D02'?'rupture':'solid_return';
        item.legacyFrame.chapterTime=cue==='D02'?5.5:4;
        item.legacyFrame.chapterProgress=cue==='D02'?5.5/12:1;
        preparePrologue(item.legacyFrame);
        const p=prologueView.diagnostics()?.camera;
        if(!p||!['x','y','z','yaw','pitch'].every(k=>Number.isFinite(p[k])))throw new Error('Sky camera application failed');
      }
      const stage = item.finaleProgress||item.scene.scene_id==='CF-S17'?null:STAGE_ANCHORS[sid(item.scene)]?.[cue];
      if (stage && (stage[0] !== item.descriptor?.setId || stage[1] !== item.descriptor?.anchor?.id)) {
        item.received.add(id); item.ready=false; clearInput();
        applySet(item,[key,...stage]).then(()=>{
          if (!live(item)) return;
          item.ready=true; item.lastCue={cueId:cue,lineId};
          view.setCue({cueId:cue,lineId,token:item.token});
          if(line)semantic(item,cue);
          while(live(item)&&item.ready&&item.queuedCues.length)onCue(item.queuedCues.shift());
        }).catch(error=>{if(live(item))item.emit({type:'asset-failure',message:String(error.message||error)});});
        return;
      }
      item.received.add(id);
      item.lastCue = {cueId:cue,lineId};
      if (item.setRequested) view.setCue({cueId:cue,lineId,token:item.token});
      if(line && cue!=='TRIAL_COMPLETE')semantic(item,cue);
      // Never echo incoming lifecycle cues or derive trial success from staging.
    }
    function backDoorTarget(item) {
      if(!item?.ready || sid(item.scene)!=='CF-S11' || item.descriptor?.setId!=='FARM_INTERIOR' || (item.walked||0)<2.5)return null;
      const p=getGame?.()?.player,target=(view.frame()?.interactionTargets||[]).find(t=>t.id==='BACK_DOOR');
      if(!p||!target||planarOffset(p,target.position).distance>target.radius)return null;
      const offset=planarOffset(p,target.position);
      return !target.requiresFacing||offset.distance<.001||facingDot(p,offset)>=.55?target:null;
    }
    function handTarget(item) {
      if(!item?.ready || sid(item.scene)!=='CF-S12' || (item.walked||0)<4)return null;
      const p=getGame?.()?.player,target=(view.frame()?.interactionTargets||[]).find(t=>t.id==='HAND_APPROACH'),at=target?.proximityPoint||target?.position;
      if(!p || !target || planarOffset(p,at).distance>target.radius)return null;
      const offset=planarOffset(p,target.position);
      if(target.requiresFacing && offset.distance>.001 && facingDot(p,offset)<.55)return null;
      return target;
    }
    function searchAction(item) {
      if(item.skipRequested)return {actionPending:false,actionPrompt:''};
      if(sid(item.scene)==='CF-S12'&&!item.handExamined)return {actionPending:true,actionPrompt:'Walk to the gray hand and inspect it.'};
      if(sid(item.scene)==='CF-S11') {
        if(!item.trailEntered && (item.actionLine||0)>=3)return {actionPending:true,actionPrompt:item.descriptor?.setId==='FARM_INTERIOR'?'Walk to the back door and open it.':'Walk across the yard to the corn path.'};
        if(!item.searchArrived && (item.actionLine||0)>=9)return {actionPending:true,actionPrompt:'Follow the corn path to the first bend.'};
      }
      return {actionPending:false,actionPrompt:''};
    }
    function interaction(item) {
      if(key==='cruiser'&&item?.ready&&item.rideParked&&item.finalAcknowledged&&!item.carExited&&item.rideExitSeconds===null)return {canInteract:true,interactionPrompt:'Exit cruiser'};
      if(item&&sid(item.scene)==='CF-S11'&&backDoorTarget(item))return {canInteract:true,interactionPrompt:'Open back door and join the search'};
      if(item&&sid(item.scene)==='CF-S12'&&!item.handExamined&&handTarget(item))return {canInteract:true,interactionPrompt:'Examine gray hand'};
      if(item?.ready&&sid(item.scene)==='CF-S03'&&item.actionPending&&!item.doorEntered){
        const p=getGame?.()?.player,t=(view.frame()?.interactionTargets||[]).find(t=>t.id==='FRONT_DOOR'),at=t&&(t.proximityPoint||t.position);
        if(p&&at){const offset=planarOffset(p,at),distance=offset.distance,facing=distance<.05||facingDot(p,offset)>=.2;
          if((item.outsideWalk||0)>=.4&&distance<=Math.min(t.radius,.75)&&facing)return {canInteract:true,interactionPrompt:'Open front door',action:'open-front-door'};
        }
        return null;
      }
      if(item?.finaleProgress){
        const vigilAction=item.finaleProgress.snapshot().vigilAction;
        if(vigilAction)return {canInteract:true,interactionPrompt:vigilAction==='stay'?'Stay a little longer':'Finish'};
        const inspection=historicalInspection(item);
        item.inspectionPresented=inspection?.target.id;
        return inspection?{canInteract:true,interactionPrompt:inspection.prompt}:null;
      }
      if(!item?.ready || item.inspected || sid(item.scene)!=='CF-S21')return null;
      const p=getGame?.()?.player,target=(view.frame()?.interactionTargets||[]).find(t=>t.id==='ENVELOPE');
      const at=target&&(target.proximityPoint||target.position);
      return p&&at&&planarOffset(p,at).distance<=target.radius ? {canInteract:true,interactionPrompt:'Inspect envelope and photographs'} : null;
    }
    function historicalInspection(item,selectedId) {
      if(!item.ready||!item.finaleProgress)return null;
      const player=getGame?.()?.player;
      if(!player)return null;
      const completed=item.finaleProgress.snapshot().actions;
      let nearest=null;
      for(const target of view.frame()?.interactionTargets||[]){
        if(selectedId&&target.id!==selectedId)continue;
        const [action,prompt]=inspectionActions[target.id]||[];
        if(!action||!item.scene.required_actions?.includes(action)||completed.includes(action))continue;
        const range=planarOffset(player,target.proximityPoint||target.position).distance;
        const facing=planarOffset(player,target.position);
        if(range>target.radius||(target.requiresFacing&&facing.distance>.001&&facingDot(player,facing)<.2))continue;
        if(!nearest||range<nearest.range)nearest={target,action,prompt,range};
      }
      return nearest;
    }
    function onContinue(){
      const item=lease;if(!live(item)||!item.ready||key!=='childMemory'||!item.memoryRetreatOffered||!item.memoryRevealed||item.memoryRetreated)return false;
      item.memoryRetreated=true;item.actionPending=false;view.setCue({cueId:'RETREAT',lineId:null,token:item.token});semantic(item,'RETREAT');return true;
    }
    function status(item,search=searchAction(item)){
      return {ready:item.ready,renderer:item.retainedExterior||item.legacyFrame?'prologue':key==='trial'?'gameplay':item.setRequested?'v31-view':'overlay',
        actionPending:!item.skipRequested&&(!!item.actionPending||search.actionPending||(key==='cruiser'&&item.finalAcknowledged&&!item.carExited))};
    }
    function readStatus(){return live(lease)?status(lease):null;}
    function frame(copyFrame=true) {
      const item = lease;
      if (!live(item)) return null;
      const search=searchAction(item),state=status(item,search),target=interaction(item);
      const presentation={adapterKey:key,sceneId:item.scene.scene_id,token:item.token,ready:state.ready,time:item.time,
        renderer:state.renderer,legacyFrame:item.retainedExterior?{v31ExteriorWalk:true,token:item.token,player:{...getGame().player,y:item.floorY??item.descriptor.anchor.position.y},eyeHeight:item.descriptor.anchor.eyeHeight,time:item.time,reduced:!!getReducedMotion()}:item.legacyFrame,recoveryNote:item.recoveryNote,player:item.legacyFrame?item.legacyFrame.player:item.descriptor?{...(item.memoryPlayer||getGame?.()?.player),y:item.floorY??item.descriptor.anchor.position.y}:null,eyeHeight:item.descriptor?.anchor.eyeHeight,set:item.descriptor,
         fade:item.finaleFade||0,bedtimeReturnStarted:item.bedtimeReturnStarted,returnedToBed:item.received.has('RETURN_TO_BED'),reveal:item.reveal,handIntensity:item.handIntensity||0,background:item.setRequested?null:'black',controls:item.scene.controls,
        weaponVisible:false,healthVisible:false,trialHudVisible:false,
        identity:item.scene.perspective,titleCard:item.scene.title_card,objective:item.bedtimePhase==='bed'?'Return to your bedroom':item.bedtimePhase==='returned'?'Back in your bedroom':item.scene.objective,
        actionPending:state.actionPending,
        soundCaption:item.soundCaption?.until>=item.time?item.soundCaption.text:null,
        actionPrompt:(key==='cruiser'&&item.finalAcknowledged&&!item.carExited?(item.rideParked?'Use Exit cruiser to step out.':'Riding to the Yates farm…'):null)||search.actionPrompt||(key==='childMemory'?(item.memoryRevealed&&!item.memoryRetreated?'Back away from the figure, or use Continue memory for a cut-based retreat.':item.memoryArmed&&!item.memoryRevealed?'Walk toward the rustling bushes to see the figure.':''):item.actionPrompt||null),
        canContinue:!state.actionPending,
        explicitContinue:key==='childMemory'&&!!item.memoryRetreatOffered&&!!item.memoryRevealed&&!item.memoryRetreated,continueLabel:key==='childMemory'&&item.memoryRetreatOffered&&item.memoryRevealed&&!item.memoryRetreated?'Continue memory (cut-based retreat)':'Continue',
        narrativeUI:{continue:!state.actionPending,skip:item.scene.skip_allowed!==false&&!item.scene.required_actions?.length&&key!=='trial'},canInteract:!!target,interactionPrompt:target?.interactionPrompt||null,
        ride:['call','cruiser'].includes(key)?{phase:item.carExited?'exited':item.rideExitSeconds!==null?'exiting':item.rideParked?'parked':item.legacyFrame.chapter==='emergence'?'braking':'driving',elapsed:item.rideElapsed,position:item.legacyFrame.driving.position,speed:item.legacyFrame.driving.speed,parked:!!item.rideParked,exitProgress:item.legacyFrame.exitProgress,exited:!!item.carExited,coordinateFrame:'V31_ROADSIDE_LOCAL',camera:item.rideCamera||null}:null,
        actionResults:{carExited:!!item.carExited,arrivalHandoff:item.arrivalHandoff||null,doorEntered:!!item.doorEntered,interviewArrived:!!item.interviewArrived,outsideWalk:item.outsideWalk||0,insideWalk:item.insideWalk||0,memoryRevealed:!!item.memoryRevealed,memoryRetreated:!!item.memoryRetreated,yardEntered:!!item.yardEntered,trailEntered:!!item.trailEntered,searchArrived:!!item.searchArrived,handExamined:!!item.handExamined,inspected:!!item.inspected,walked:item.walked||0,documentInspection:view?.frame?.()?.documentInspection||null},
        trial:item.trialStart?{gameRunId:getGame?.()?.runId,trialAttempt:item.trialStart.trialAttempt,status:getGame?.()?.player?.health<=0?'dead':getGame?.()?.mode}:null,
        lastCue:item.lastCue,implementationStage:'functional-integration',movementEnabled:(['search','hand','historical','childMemory'].includes(key)||sid(item.scene)==='CF-S03')&&/WALK/.test(item.scene.controls),stagingComplete:false};
      return copyFrame?copy(presentation):presentation;
    }
    return Object.freeze({enter,tick,frame,readStatus,peekFrame:()=>frame(false),exit,pause(){if(lease){stopHandSound(lease);stopRoomSound(lease);stopContactSound(lease);}},onCue,onContinue,onSkip(){if(live(lease)){stopHandSound(lease);lease.skipRequested=true;lease.actionPending=false;if(key==='cruiser'){lease.rideElapsed=V31_RIDE_PARK_SECONDS;lease.rideExitSeconds=V31_EXIT_SECONDS;updateRide(lease,0,{});}}}});
  }
  return Object.freeze({...Object.fromEntries(keys.map(key => [key,makeAdapter(key)])),v4Encounter:createV4EncounterAdapter({view,input,audio,getGame,ui,getReducedMotion})});
}
