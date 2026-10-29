import {samplePrologueMotion} from './prologue-motion.js';
import {moveBody} from './maze.js';
import {wetGroundHeight} from './environment-materials.js';
// CF-V3.1 T01-C foundation: one token-owned presentation lease, no route state.
// This is not a playable-route receipt. Dialogue staging, memory/trial payloads,
// movement and legacy renderer readiness remain explicit integration boundaries.
const BINDINGS = Object.freeze({
  'CF-S01':['call',null,null],
  'CF-S02':['cruiser',null,null],
  'CF-S03':['farm','FARM_FRONT','FARM_FRONT'],
  'CF-S04':['farm','FARM_INTERIOR','INTERVIEW'],
  'CF-S05':['farm','FARM_INTERIOR','INTERVIEW'],
  'CF-S06':['farm','FARM_INTERIOR','INTERVIEW'],
  'CF-S07':['schoolMemory','CLASSROOM','CLASSROOM'],
  'CF-S08':['farm','FARM_INTERIOR','INTERVIEW'],
  'CF-S09':['childMemory','CHILDHOOD_POCKET','CHILDHOOD_FIXED_VIEWS'],
  'CF-S10':['farm','FARM_INTERIOR','INTERVIEW'],
  'CF-S11':['search','FARM_INTERIOR','INTERVIEW'],
  'CF-S12':['hand','SEARCH_TRAIL','HAND_APPROACH'],
  'CF-S13':['recovery','FARM_YARD','YARD_RECOVERY'],
  'CF-S14':['investigationCutaway','FARM_INTERIOR','KITCHEN_PRIVATE'],
  'CF-S15':['investigationCutaway','SEARCH_TRAIL','SEARCH_BEND'],
  'CF-S16':['sky',null,null],
  'CF-S17':['projector',null,null],
  'CF-S18':['trial',null,null],
  'CF-S19':['revelation','CREATURE_REVEAL','CREATURE_REVEAL'],
  'CF-S20':['title1955',null,null],
  'CF-S21':['historical','HISTORICAL_TABLE','HISTORICAL_TABLE'],
  'CF-S22':['historical','HISTORICAL_WORK_LUNCH','HISTORICAL_DESK'],
  'CF-S23':['historical','HISTORICAL_DINNER','HISTORICAL_TABLE'],
  'CF-S24':['historical','HISTORICAL_STORE','HISTORICAL_STORE_COUNTER'],
});
// Authored composite staging is explicit, not a range/name inference.
const COMPOSITE_CUES = Object.freeze({
  'CF-S14':{D02:'D02_TO_D08',D03:'D02_TO_D08',D04:'D02_TO_D08',D05:'D02_TO_D08',D06:'D02_TO_D08',D07:'D02_TO_D08',D08:'D02_TO_D08',D09:'BEFORE_D09',D16:'BEFORE_D16'},
  'CF-S15':{D02:'D02_TO_D06',D03:'D02_TO_D06',D04:'D02_TO_D06',D05:'D02_TO_D06',D06:'D02_TO_D06',D08:'BEFORE_D08'},
  'CF-S22':{D04:'D04_TO_D08',D05:'D04_TO_D08',D06:'D04_TO_D08',D07:'D04_TO_D08',D08:'D04_TO_D08'},
});
const STAGE_ANCHORS = Object.freeze({
  'CF-S03':{AFTER_D06:['FARM_INTERIOR','INTERVIEW']},
  'CF-S05':{D04:['FARM_FRONT','FRONT_DOOR'],D06:['FARM_INTERIOR','INTERVIEW']},
  'CF-S11':{D01:['FARM_YARD','YARD_EXIT'],D04:['SEARCH_TRAIL','FIELD_EDGE'],AFTER_D09:['SEARCH_TRAIL','SEARCH_BEND']},
  'CF-S14':{BEFORE_D09:['FARM_INTERIOR','KITCHEN_PRIVATE'],BEFORE_D16:['FARM_YARD','PORCH_STANLEY']},
  'CF-S15':{BEFORE_D08:['FARM_YARD','PORCH_STANLEY'],AFTER_D13:['FARM_YARD','FIELD_EDGE']},
  'CF-S22':{D03:['HISTORICAL_WORK_LUNCH','HISTORICAL_TABLE']},
});
const copy = value => value == null ? value : JSON.parse(JSON.stringify(value));
const finitePoint = p => !!p && ['x','y','z'].every(k => Number.isFinite(p[k]));
const keys = [...new Set(Object.values(BINDINGS).map(b => b[0]))];

export function createV31Adapters({view,prologueView,survivalView,audio,input,getGame,replaceTrialGame,ui} = {}) {
  // Reserved dependencies are deliberately not invoked before their frozen seams
  // exist. In particular: never drive legacy story clocks to manufacture readiness.
  void prologueView; void survivalView; void audio; void replaceTrialGame;
  let owner = null, trialAttempt = 0;
  const clearInput = () => {
    if (typeof input?.quarantine === 'function') input.quarantine();
    else input?.clear?.();
    input?.clearEdges?.();
  };
  function makeAdapter(key) {
    let lease = null;
    const live = item => item && lease === item && owner === item && !item.exited;
    function exit() {
      const item = lease;
      if (!item || item.exited) return;
      item.exited = true;
      lease = null;
      const ownsInput = owner === item;
      if (ownsInput) owner = null;
      // releaseSet is token-scoped; never dispose the shared renderer or assets.
      try { if (item.setRequested) view.releaseSet(item.token); if(item.legacyFrame)prologueView?.release?.(); }
      finally { if (ownsInput) clearInput(); }
    }
    async function applySet(item,binding) {
      const scene = item.scene;
      if (binding[1]) {
          if (!view || ['enterSet','releaseSet','setCue'].some(name => typeof view[name] !== 'function')) throw new Error(`${scene.scene_id}: V3.1 view contract unavailable`);
          item.setRequested = true;
          const descriptor = await view.enterSet({setId:binding[1],anchorId:binding[2],period:scene.perspective?.period,actors:binding[1]==='FARM_INTERIOR'?[{role:'MIKE',anchorId:'MIKE_INTERVIEW'},{role:'STANLEY',anchorId:'STANLEY_INTERVIEW'}]:[],token:item.token});
          if (!live(item)) return;
          if (descriptor?.token && (descriptor.token.runId !== item.token.runId || descriptor.token.sceneId !== item.token.sceneId || descriptor.token.entryId !== item.token.entryId)) throw new Error(`${scene.scene_id}: stale view descriptor`);
          if (descriptor?.ready !== true || descriptor.setId !== binding[1] || !finitePoint(descriptor.anchor?.position) || !Number.isFinite(descriptor.anchor?.eyeHeight) || !Array.isArray(descriptor.colliders)) throw new Error(`${scene.scene_id}: safe geometry/camera not ready`);
          if (descriptor.cameraApplied !== true && descriptor.readiness?.cameraApplied !== true) throw new Error(`${scene.scene_id}: view did not apply existing camera`);
          if (typeof ui?.isReady !== 'function' || ui.isReady() !== true || typeof ui.showIdentity !== 'function') throw new Error(`${scene.scene_id}: required narrative UI unavailable`);
          const player = ['schoolMemory','childMemory'].includes(key) ? (item.memoryPlayer ||= {x:0,z:0,yaw:0,pitch:0}) : getGame?.()?.player, anchor = descriptor.anchor;
          if (!player || !['x','z','yaw','pitch'].every(field => Number.isFinite(player[field])) || !finitePoint(anchor.lookTarget)) throw new Error(`${scene.scene_id}: existing body/anchor unavailable`);
          const dx = anchor.lookTarget.x-anchor.position.x, dz = anchor.lookTarget.z-anchor.position.z;
          const yaw = Math.atan2(-dx,-dz), pitch = Math.atan2(anchor.lookTarget.y-anchor.position.y-anchor.eyeHeight,Math.hypot(dx,dz));
          player.x=anchor.position.x; player.z=anchor.position.z; player.yaw=yaw; player.pitch=pitch;
          // Legacy body has no y field: floor height remains the view anchor.
          ui.showIdentity({scene,token:item.token});
          if (!live(item)) return;
          if (ui.isReady() !== true || player.x !== anchor.position.x || player.z !== anchor.position.z || player.yaw !== yaw || player.pitch !== pitch) throw new Error(`${scene.scene_id}: presentation application failed`);
          item.presentationReady={token:item.token,environmentId:binding[1],anchorId:binding[2],geometryReady:true,uiReady:true,bodyApplied:true,cameraApplied:true};
          item.descriptor = copy({setId:descriptor.setId,anchor:descriptor.anchor,colliders:descriptor.colliders,bounds:descriptor.bounds,missingAssets:descriptor.missingAssets || []});
        }
    }
    async function enter({scene,token,checkpoint,emit} = {}) {
      const binding = BINDINGS[scene?.scene_id];
      if (!binding || binding[0] !== key || scene.adapter_key !== key) throw new Error(`Adapter/scene mismatch: ${key}`);
      if (!token || token.sceneId !== scene.scene_id || !Number.isInteger(token.entryId) || token.entryId < 1 || !Number.isInteger(token.runId) || token.runId < 1) throw new Error('Invalid adapter entry token');
      if (typeof emit !== 'function' || !checkpoint || scene.entry?.checkpoint !== `CP-${scene.scene_id.slice(-2)}`) throw new Error('Invalid adapter entry contract');
      if (owner && owner !== lease) throw new Error('Previous adapter lease must exit before entry');
      exit();
      // Missing transfer channels must fail visibly, not silently lose adult state.



      const item = {token:Object.freeze({...token}),scene,emit,exited:false,ready:false,setRequested:false,entryEmitted:false,time:0,descriptor:null,received:new Set(),lastCue:null,checkpoint:copy(checkpoint),finalAcknowledged:false,completionAccepted:false,queuedCues:[],pendingSemantic:new Set()};
      lease = owner = item;
      try {
        clearInput();
        if (['cruiser','projector','sky'].includes(key)) {
          if(!prologueView?.render || !prologueView?.diagnostics || !ui?.isReady?.())throw new Error('Legacy presentation dependency unavailable');
          item.legacyFrame={chapter:key==='cruiser'?'car':key==='sky'?'rupture':'redroom',chapterTime:key==='projector'?2:0,chapterProgress:key==='projector'?2/12.4:0,time:0,player:{yaw:0,pitch:0},reduced:true};
          if(key==='sky'){item.legacyFrame.v31Sky=true;item.legacyFrame.motion=samplePrologueMotion({chapter:'rupture',chapterProgress:0,time:0},{worldAvailable:true});}
          prologueView.render(item.legacyFrame);
          const d=prologueView.diagnostics(),p=d.camera;
          if(!d.live || !p || !['x','y','z','yaw','pitch'].every(k=>Number.isFinite(p[k])) || (key==='projector'&&d.environment!=='red room'))throw new Error('Legacy camera/environment not applied');
          const body=getGame?.()?.player;if(!body)throw new Error('Legacy body unavailable');
          Object.assign(body,{x:p.x,z:p.z,yaw:p.yaw,pitch:p.pitch});ui.showIdentity({scene,token:item.token});
          if(!ui.isReady())throw new Error('Legacy UI unavailable');
          item.presentationReady={token:item.token,environmentId:key==='cruiser'?'CRUISER':key==='sky'?'SKY_FIELD_EDGE':'PROJECTOR',anchorId:key==='cruiser'?'EXISTING_PASSENGER_SEAT':key==='sky'?'FIELD_EDGE':'EXISTING_PROJECTOR_ROOM',geometryReady:true,uiReady:true,bodyApplied:true,cameraApplied:true};
        } else if (key==='trial') {
          if(typeof replaceTrialGame!=='function')throw new Error('Trial replacement bridge unavailable');
          const started=await replaceTrialGame({checkpoint:copy(checkpoint),trialAttempt:++trialAttempt,token:item.token,scene});
          if(!live(item))return;
          const game=getGame?.();
          if(!started?.trialStartRecipe || started.trialGameRunId!==game?.runId || started.trialAttempt!==trialAttempt || game.survivalEnding?.remaining!==180)throw new Error('Invalid fresh trial bridge result');
          if(!started.presentationReady?.cameraApplied || !started.presentationReady?.bodyApplied || !started.presentationReady?.uiReady)throw new Error('Applied trial presentation readiness missing');
          item.trialStart={trialStartRecipe:copy(started.trialStartRecipe),trialGameRunId:started.trialGameRunId,trialAttempt};
          item.presentationReady=copy(started.presentationReady); item.trialReceipts=new Set();
        } else await applySet(item,binding);
        if (['CF-S08','CF-S10'].includes(scene.scene_id)) {
          const c=checkpoint.return_context,p=c?.player,source=scene.scene_id==='CF-S08'?'CF-S06':'CF-S08',body=getGame?.()?.player;
          const valid=c?.schema_version===1 && c.run_id===token.runId && c.source_scene_id===source && c.target_scene_id===scene.scene_id && c.anchor_id==='INTERVIEW' && c.environment_id==='FARM_INTERIOR' && c.consumed===false && p && ['x','y','z','yaw','pitch'].every(k=>Number.isFinite(p[k])) && p.y===0 && p.x>=7.5 && p.x<=12.9 && p.z>=4.3 && p.z<=9.7 && Math.abs(p.pitch)<=Math.PI/2;
          if(!valid){
            item.recoveryNote='Memory return unavailable. Restored to the safe farmhouse interview checkpoint.';
            item.memoryRestore={mode:'safe-fallback',token:item.token,targetSceneId:scene.scene_id,environmentId:'FARM_INTERIOR',anchorId:'INTERVIEW',bodyApplied:true,cameraApplied:true,recoveryNote:item.recoveryNote};
          } else {
          view.render({token:item.token,player:copy(p),eyeHeight:item.descriptor.anchor.eyeHeight});
          const applied=view.frame()?.cameraPose;
          if(!applied || !['x','y','z','yaw','pitch'].every(k=>Math.abs(applied[k]-p[k])<1e-9))throw new Error(`${scene.scene_id}: saved camera pose not applied`);
          for(const field of ['x','z','yaw','pitch'])body[field]=p[field];
          item.memoryRestore={mode:'saved',token:item.token,targetSceneId:scene.scene_id,environmentId:'FARM_INTERIOR',anchorId:'INTERVIEW',bodyApplied:true,cameraApplied:true,sourceRunId:c.run_id,sourceSceneId:c.source_scene_id};
          }
        }
        if (live(item)) { item.ready = true; return item.presentationReady ? {presentationReady:copy(item.presentationReady),...(item.trialStart?{trialStart:copy(item.trialStart)}:{}),...(item.memoryRestore?{memoryRestore:copy(item.memoryRestore)}:{})} : undefined; }
      } catch (error) {
        if (!live(item)) return; // Late failures cannot poison the next entry.
        exit();
        throw error;
      }
    }
    function semantic(item,cue) {
      item.received.add(cue);
      const result=item.emit({type:'cue',...item.token,cueId:cue});
      if(live(item)&&!result?.accepted&&result?.reason!=='duplicate-cue')item.pendingSemantic.add(cue);
    }
    function tick(dt,controls={}) {
      const item = lease;
      if (!live(item) || !item.ready || !Number.isFinite(dt) || dt < 0) return;
      for(const cue of [...item.pendingSemantic]){const result=item.emit({type:'cue',...item.token,cueId:cue});if(!live(item))return;if(result?.accepted||result?.reason==='duplicate-cue')item.pendingSemantic.delete(cue);}
      item.time += dt;
      if(item.legacyFrame && (key==='cruiser'||key==='projector'||key==='sky'&&!item.skyStarted)) {
        if(Number.isFinite(controls.yaw))item.legacyFrame.player.yaw=controls.yaw;
        if(Number.isFinite(controls.pitch))item.legacyFrame.player.pitch=Math.max(-1.25,Math.min(1.25,controls.pitch));
      }

      if(item.descriptor) {
        const body=item.memoryPlayer||getGame?.()?.player, prior=body&&{x:body.x,z:body.z,yaw:body.yaw,pitch:body.pitch};
        if(body) {
          const candidate={...prior,radius:.25};
          if(Number.isFinite(controls.yaw))candidate.yaw=controls.yaw;
          if(Number.isFinite(controls.pitch))candidate.pitch=Math.max(-1.25,Math.min(1.25,controls.pitch));
          if(['search','hand','historical'].includes(key)&&/WALK/.test(item.scene.controls)) {
            const f=Number.isFinite(controls.forward)?Math.max(-1,Math.min(1,controls.forward)):0,r=Number.isFinite(controls.strafe)?Math.max(-1,Math.min(1,controls.strafe)):0,step=Math.min(dt,.05)*1.5;
            // Existing movement subdivision; exact environment collision/bounds
            // remain validated by the owning view before committing this body.
            const row=new Proxy({}, {get:()=>0}),grid=new Proxy({}, {get:()=>row});
            moveBody({grid},candidate,(-Math.sin(candidate.yaw)*f+Math.cos(candidate.yaw)*r)*step,(-Math.cos(candidate.yaw)*f-Math.sin(candidate.yaw)*r)*step);
          }
          const outside=['FARM_FRONT','FARM_YARD','SEARCH_TRAIL'].includes(item.descriptor.setId),y=outside?wetGroundHeight(candidate.x,candidate.z):0;
          try {view.render({token:item.token,player:{x:candidate.x,y,z:candidate.z,yaw:candidate.yaw,pitch:candidate.pitch},eyeHeight:item.descriptor.anchor.eyeHeight});Object.assign(body,{x:candidate.x,z:candidate.z,yaw:candidate.yaw,pitch:candidate.pitch});item.floorY=y;}
          catch(error){if(!/unsafe|bounds|collid|floor/i.test(String(error.message)))throw error;}
        }
      }

      if(controls.interact && item.scene.scene_id==='CF-S21' && !item.inspected) {
        const p=getGame?.()?.player,target=(view.frame()?.interactionTargets||[]).find(t=>/envelope/i.test(t.id));
        if(p&&target&&Math.hypot(p.x-(target.proximityPoint||target.position).x,p.z-(target.proximityPoint||target.position).z)<=target.radius){item.inspected=true;view.setCue({cueId:'INSPECT_ENVELOPE',lineId:null,token:item.token});item.emit({type:'cue',...item.token,cueId:'INSPECT_ENVELOPE'});}
      }
      if(item.scene.scene_id==='CF-S20'&&item.time>=2.5&&!item.titleHeld){const r=item.emit({type:'cue',...item.token,cueId:'TITLE_HOLD'});if(r?.accepted)item.titleHeld=true;}
      if(item.finalAcknowledged&&['CF-S20','CF-S24'].includes(item.scene.scene_id)&&!item.exitPresented){const r=item.emit({type:'cue',...item.token,cueId:'EXIT'});if(r?.accepted)item.exitPresented=true;}

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
      if ((item.finalAcknowledged || item.recapAcknowledged) && !item.completionAccepted) {
        const event={type:'completion',...item.token,transitionId:`${item.scene.scene_id}:exit`,reason:key==='trial'?'trial-success':'normal'};
        if (['CF-S06','CF-S08'].includes(item.scene.scene_id)) {
          const p=getGame?.()?.player;
          if (!p || !['x','z','yaw','pitch'].every(k=>Number.isFinite(p[k])) || p.x<7.5 || p.x>12.9 || p.z<4.3 || p.z>9.7) throw new Error('Unsafe adult memory capture');
          event.memoryCapture={schema_version:1,run_id:item.token.runId,source_scene_id:item.scene.scene_id,target_scene_id:item.scene.scene_id==='CF-S06'?'CF-S08':'CF-S10',anchor_id:'INTERVIEW',environment_id:'FARM_INTERIOR',player:{x:p.x,y:0,z:p.z,yaw:p.yaw,pitch:p.pitch},camera_preset:'INTERVIEW',control_mode:item.scene.controls,modern_state:{objective:item.scene.objective,weapon_visible:false,health_visible:false},consumed:false};
        }
        const result=item.emit(event); if(live(item)&&result?.accepted)item.completionAccepted=true;
      }
      // No hardware reads, combat, or timer-derived success in this bridge.
    }
    function onCue(event) {
      const item = lease;
      if (!live(item) || event?.runId !== item.token.runId || event?.sceneId !== item.token.sceneId || event?.entryId !== item.token.entryId) return;
      if(!item.ready){if(item.queuedCues.length>=256)throw new Error('Scene cue queue exceeded');item.queuedCues.push({...event});return;}
      const id = event.cueId;
      if (!(item.scene.cues || []).includes(id) || item.received.has(id)) return;
      if (id === `line:${item.scene.line_ids.at(-1)}:complete`) item.finalAcknowledged=true;
      if(id==='line:CF-S18-D01:complete')item.entryLineAcknowledged=true;
      if(id===`line:${item.scene.recap_line_ids?.at(-1)}:complete`)item.recapAcknowledged=true;
      const line = /^line:(CF-S\d{2}-D\d{2}):(start|complete)$/.exec(id);
      let cue = id, lineId = null;
      if (line) {
        lineId = line[1];
        if (!item.scene.line_ids.includes(lineId)) return;
        const short = lineId.slice(-3);
        if(item.scene.scene_id==='CF-S09' && line[2]==='complete' && ['D02','D04'].includes(short)) {
          const childCue=short==='D02'?'REVEAL':'RETREAT';
          view.setCue({cueId:childCue,lineId,token:item.token});
          item.emit({type:'cue',...item.token,cueId:childCue});
        }
        cue = line[2] === 'complete' ? `AFTER_${short}` : COMPOSITE_CUES[item.scene.scene_id]?.[short] || short;
        if (!(item.scene.cue_bindings || []).some(binding => binding.bound_cue === cue)) return;
      }
      if(key==='sky' && ['D02','AFTER_D03'].includes(cue)) {
        item.skyStarted=true;
        item.legacyFrame.chapter=cue==='D02'?'rupture':'solid_return';
        item.legacyFrame.chapterTime=cue==='D02'?5.5:4;
        item.legacyFrame.chapterProgress=cue==='D02'?5.5/12:1;
        prologueView.render(item.legacyFrame);
        const p=prologueView.diagnostics()?.camera;
        if(!p||!['x','y','z','yaw','pitch'].every(k=>Number.isFinite(p[k])))throw new Error('Sky camera application failed');
      }
      const stage = STAGE_ANCHORS[item.scene.scene_id]?.[cue];
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
    function interaction(item) {
      if(!item?.ready || item.inspected || item.scene.scene_id!=='CF-S21')return null;
      const p=getGame?.()?.player,target=(view.frame()?.interactionTargets||[]).find(t=>t.id==='ENVELOPE');
      const at=target&&(target.proximityPoint||target.position);
      return p&&at&&Math.hypot(p.x-at.x,p.z-at.z)<=target.radius ? {canInteract:true,interactionPrompt:'Inspect envelope and photographs'} : null;
    }
    function frame() {
      const item = lease;
      if (!live(item)) return null;
      return copy({adapterKey:key,sceneId:item.scene.scene_id,token:item.token,ready:item.ready,time:item.time,
        renderer:item.legacyFrame?'prologue':key==='trial'?'gameplay':item.setRequested?'v31-view':'overlay',legacyFrame:item.legacyFrame,recoveryNote:item.recoveryNote,player:item.legacyFrame?item.legacyFrame.player:item.descriptor?{...(item.memoryPlayer||getGame?.()?.player),y:item.floorY??item.descriptor.anchor.position.y}:null,eyeHeight:item.descriptor?.anchor.eyeHeight,set:item.descriptor,
        background:item.setRequested?null:'black',controls:item.scene.controls,
        weaponVisible:false,healthVisible:false,trialHudVisible:false,
        identity:item.scene.perspective,titleCard:item.scene.title_card,objective:item.scene.objective,
        narrativeUI:{continue:true,skip:key!=='trial'},canInteract:!!interaction(item),interactionPrompt:interaction(item)?.interactionPrompt||null,
        trial:item.trialStart?{gameRunId:getGame?.()?.runId,trialAttempt:item.trialStart.trialAttempt,status:getGame?.()?.player?.health<=0?'dead':getGame?.()?.mode}:null,
        lastCue:item.lastCue,implementationStage:'functional-integration',movementEnabled:['search','hand','historical'].includes(key)&&/WALK/.test(item.scene.controls),stagingComplete:false});
    }
    return Object.freeze({enter,tick,frame,exit,onCue});
  }
  return Object.freeze(Object.fromEntries(keys.map(key => [key,makeAdapter(key)])));
}
