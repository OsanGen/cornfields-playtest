// Canonical route owner. No browser loop, storage, navigation or gameplay simulation.
import {recordTransition,cancelTransitionMetrics} from './transition-metrics.js';
import {runCleanups} from '../../../../shared/runtime/resource-scope.js';
import {isInterviewReturnPose} from './cf-story-memory.js';
const SCENE = /^CF-S(?:0[1-9]|1[0-9]|2[0-4])$/;
const FORBIDDEN = new Set(['pregnancy_confirmed','mike_dead','creatures_caused_school_behavior','projector_is_ring_leader','sadie_rescued']);
const copy = value => value == null ? value : JSON.parse(JSON.stringify(value));
let sessionRun = 0;
export function createV31Route({candidateManifestId, scenes, adapters, dialogue, onState = () => {}, onError = () => {}, autoAdvanceTitles = false, transitionMetrics=null} = {}) {
  if (typeof candidateManifestId !== 'string' || !(/^cf-v3\.1-[a-f0-9]{64}$/.test(candidateManifestId) || /^fixture:[A-Za-z0-9_-]+$/.test(candidateManifestId))) throw new Error('Resolved candidateManifestId required');
  if (!scenes || !adapters) throw new Error('Scene and adapter registries required');
  let state = null, token = null, adapter = null, pending = null, disposed = false, entry = 0, serial = 0;
  let fixture = null, error = null, seen = new Set(), title = null, elapsed = 0, skipping = false, immediateSkip = false, trialSuccess = false, trialIdentity = null, stagingPaused = false, queuedAdapterCues = [];
  let resetting = false, restartFailure = false, transitionCleanup = false, trialRecovery = null, trialPresentationToken = null, trialPresenting = false;
  const notify = () => onState(copy(state));
  const trace=(phase,tx)=>{try{recordTransition(transitionMetrics,{phase,sceneId:tx.scene.scene_id,runId:state.run_id,transactionId:tx.transactionId,attempt:tx.attempt,entryId:tx.token?.entryId??null});}catch{/* Optional diagnostics never affect progression. */}};
  const result = (accepted, reason) => ({accepted, reason});
  const current = t => !!token && t?.runId === token.runId && t?.sceneId === token.sceneId && t?.entryId === token.entryId;
  const active = () => !disposed && state?.status === 'active' && !pending;
  const adapterFrame = (owner=adapter) => owner?.peekFrame ? owner.peekFrame() : owner?.frame?.();
  const adapterStatus = (owner=adapter) => owner?.readStatus ? owner.readStatus() : adapterFrame(owner);
  function record(id) {
    if (!SCENE.test(id) || !Object.hasOwn(scenes,id)) throw new Error(`Unknown scene: ${id}`);
    const s = scenes[id];
    if (s.scene_id !== id || s.entry?.checkpoint !== `CP-${id.slice(-2)}`) throw new Error(`Invalid scene/checkpoint: ${id}`);
    if (!SCENE.test(s.exit?.next_scene) && s.exit?.next_scene !== 'END_AVAILABLE_EXCERPT') throw new Error(`Invalid exit: ${id}`);
    if ((s.exit?.sets_flags || []).some(f => FORBIDDEN.has(f))) throw new Error(`Prohibited story flag: ${id}`);
    return s;
  }
  function eligible(s, snapshot) {
    const flags = new Set([...snapshot.story_flags, ...(fixture?.story_flags || [])]);
    return (s.entry?.requirements || []).every(f => f === 'return_anchor_saved' ? !!snapshot.return_context && !snapshot.return_context.consumed : flags.has(f));
  }
  const sameToken = (a,b) => a?.runId===b?.runId && a?.sceneId===b?.sceneId && a?.entryId===b?.entryId;
  function validContext(c, source, target) {
    return c?.schema_version===1 && c.run_id===state.run_id && c.source_scene_id===source && c.target_scene_id===target && c.consumed===false && isInterviewReturnPose(c) && typeof c.camera_preset==='string' && typeof c.control_mode==='string' && typeof c.modern_state?.objective==='string' && typeof c.modern_state.weapon_visible==='boolean' && typeof c.modern_state.health_visible==='boolean';
  }
  function entryLines(scene, snapshot) {
    if (scene.scene_id==='CF-S18') return snapshot.trial_snapshot?.entry_line_delivered ? [] : ['CF-S18-D01'];
    return scene.line_ids || [];
  }
  function validateReady(tx, receipt) {
    const scene=tx.scene, r=receipt || {}, p=r.presentationReady;
    if (scene.renderer_binding && scene.renderer_binding!=='overlay') {
      if (!p || !sameToken(p.token,tx.token) || !p.geometryReady || !p.uiReady || !p.bodyApplied || !p.cameraApplied || typeof p.anchorId!=='string' || typeof p.environmentId!=='string') throw new Error(`Missing applied presentation readiness: ${scene.scene_id}`);
    }
    if (['CF-S08','CF-S10'].includes(scene.scene_id)) {
      const m=r.memoryRestore, c=tx.provisional.return_context, source=scene.scene_id==='CF-S08'?'CF-S06':'CF-S08';
      if (!m || !sameToken(m.token,tx.token) || m.targetSceneId!==scene.scene_id || m.anchorId!=='INTERVIEW' || m.environmentId!=='FARM_INTERIOR' || m.bodyApplied!==true || m.cameraApplied!==true) throw new Error('Missing applied memory restore');
      if (m.mode!=='saved' || !validContext(c,source,scene.scene_id) || m.sourceRunId!==c.run_id || m.sourceSceneId!==c.source_scene_id) throw new Error('Invalid saved memory context');
      tx.provisional.return_context={...copy(c),consumed:true};
    }
    if (scene.scene_id==='CF-S18') {
      const t=r.trialStart, recipe=t?.trialStartRecipe;
      if (!t || !recipe || recipe.schema_version!==1 || recipe.build_id!==candidateManifestId || recipe.run_id!==state.run_id || recipe.checkpoint_id!=='CP-18' || recipe.maze_options?.corridors!==true || recipe.maze_options?.survival!==false || recipe.initial_trial_seconds!==180 || !recipe.baseline_id || !recipe.config_identity || !recipe.initial_spawn || !['x','y','z'].every(k=>Number.isFinite(recipe.initial_spawn[k])) || !recipe.initial_camera || Object.values(recipe.initial_camera).some(v=>typeof v==='number'&&!Number.isFinite(v)) || !Array.isArray(recipe.investigation_flags) || recipe.settings_ref!=='existing_user_settings' || !Number.isInteger(t.trialGameRunId) || !Number.isInteger(t.trialAttempt) || t.trialAttempt<1) throw new Error('Invalid trial-start recipe/identity');
      if (trialIdentity && (t.trialGameRunId===trialIdentity.gameRunId || t.trialAttempt<=trialIdentity.attempt)) throw new Error('Trial retry requires fresh identity');
      tx.trialIdentity={gameRunId:t.trialGameRunId,attempt:t.trialAttempt,receipts:new Set()};
      tx.provisional.trial_snapshot={...copy(recipe),entry_line_delivered:!!tx.provisional.trial_snapshot?.entry_line_delivered};
    }
  }
  function trialEvent(event) {
    const r=event.receipt;
    if (!active() || token.sceneId!=='CF-S18' || !trialIdentity || trialSuccess || title&&!title.acknowledged) return result(false,'trial-inactive');
    const live=adapterFrame()?.trial;
    if (!live || live.status!=='playing' || live.gameRunId!==trialIdentity.gameRunId || live.trialAttempt!==trialIdentity.attempt) return result(false,'trial-not-playing');
    if (r?.type!=='trial_complete' || r.runId!==trialIdentity.gameRunId || event.trialGameRunId!==trialIdentity.gameRunId || event.trialAttempt!==trialIdentity.attempt || !['string','number'].includes(typeof r.id) || r.id==='' || typeof r.id==='number'&&!Number.isFinite(r.id) || !Number.isFinite(r.at) || r.at<0 || trialIdentity.receipts.has(r.id)) return result(false,'invalid-trial-receipt');
    if (!state.trial_snapshot?.entry_line_delivered) return result(false,'trial-entry-line-pending');
    trialIdentity.receipts.add(r.id); trialSuccess=true; seen.add('TRIAL_COMPLETE');
    trialRecovery={receipt:copy(r)};
    return presentTrialWin();
  }
  function presentTrialWin() {
    if(trialPresenting)return result(false,'trial-presentation-in-progress');
    if(disposed || !trialRecovery || !trialSuccess || !token || pending)return result(false,'trial-recovery-unavailable');
    trialPresenting=true;
    try {
    const own=token, owner=adapter, recovery=trialRecovery;
    const lease=Object.freeze({...own,presentationId:++serial});
    trialPresentationToken=lease;state.status='active';error=null;
    // A failed initialization may already have emitted a start cue. Only this
    // new presentation lease can reissue it; the earned game receipt is retained.
    seen.delete('line:CF-S18-D02:start');seen.delete('line:CF-S18-D02:complete');
    try {
      dialogue?.stop();
      if(!current(own)||adapter!==owner||trialRecovery!==recovery||disposed)return result(false,'trial-recovery-invalidated');
      owner?.resume?.();
      if(!current(own)||adapter!==owner||trialRecovery!==recovery||disposed)return result(false,'trial-recovery-invalidated');
      dialogue?.start({lineIds:['CF-S18-D02'],token:lease});
      if(!current(own)||adapter!==owner||trialRecovery!==recovery||disposed)return result(false,'trial-recovery-invalidated');
      if(state.status!=='active')throw new Error(error||'Trial completion presentation interrupted');
      owner?.onCue?.({...own,cueId:'TRIAL_COMPLETE'});
      if(!current(own)||adapter!==owner||trialRecovery!==recovery||disposed)return result(false,'trial-recovery-invalidated');
      if(state.status!=='active')throw new Error(error||'Trial completion presentation interrupted');
      trialRecovery=null;notify();return result(true,'trial-success-accepted');
    } catch(cause) {
      if(!current(own)||adapter!==owner||trialRecovery!==recovery||disposed)return result(false,'trial-recovery-invalidated');
      trialPresentationToken=null;
      state.status='failed';
      runCleanups([()=>dialogue?.stop(),()=>{
        // Cleanup can synchronously reset/dispose and reuse the adapter object.
        // Only the original scene and earned-result lease may pause that owner.
        if(current(own)&&adapter===owner&&trialRecovery===recovery&&!disposed)owner?.pause?.();
      }]);
      if(!current(own)||adapter!==owner||trialRecovery!==recovery||disposed)return result(false,'trial-recovery-invalidated');
      error='Trial completion presentation failed. Retry to continue the earned result. ('+String(cause?.message||cause)+')';
      notify();if(!current(own)||adapter!==owner||trialRecovery!==recovery||disposed)return result(false,'trial-recovery-invalidated');onError({message:error,sceneId:'CF-S18',actions:['Retry completion presentation','Restart story']});
      return result(false,'trial-presentation-failed');
    }
    } finally {trialPresenting=false;}
  }
  function initial() {
    return {schema_version:1,spec_id:'CORNFIELDS_V3_1_MASTER',route_id:'BOOK_FIRST_CORNFIELD_1955',build_id:candidateManifestId,run_id:++sessionRun,active_scene_id:'CF-S01',active_checkpoint_id:'CP-01',entry_id:entry,status:'loading',current_pov:null,period:null,completed_scenes:[],completed_transition_ids:[],story_flags:[],knowledge:{audience:[],clarence:[],glenda:[],stanley:[],mike:[],dale:[]},event_ledger:[],return_context:null,trial_snapshot:null,settings_ref:'existing_user_settings',debug_entry:!!fixture};
  }
  function exitOwned(options) { const old = adapter; adapter = null; old?.exit?.(options); }
  function fail(tx, cause) {
    if (disposed || pending !== tx || tx.status !== 'preparing') return;
    trace('failed',tx);
    tx.status = 'failed'; try { tx.adapter?.exit?.({recoverable:true}); } catch (_) { /* Preserve original entry failure. */ }
    error = String(cause?.message || cause); state.status = 'failed'; notify(); onError({message:error,sceneId:tx.scene.scene_id,checkpoint:state.active_checkpoint_id,actions:['Retry scene entry','Restart story']});
  }
  function ready(tx, receipt, expectedToken) {
    if (disposed || pending !== tx || tx.status !== 'preparing' || tx.token!==expectedToken) return;
    const beforeValidation=copy(tx.provisional);
    try {
      if (!eligible(tx.scene,tx.provisional)) throw new Error(`Missing prerequisites: ${tx.scene.scene_id}`);
      validateReady(tx,receipt);
      dialogue?.pause();
      if (!tx.scene.title_card) dialogue?.start({lineIds:entryLines(tx.scene,tx.provisional),token:tx.token});
      if (disposed || pending !== tx) return;
      tx.status = 'committed'; state = tx.provisional;
      Object.assign(state,{active_scene_id:tx.scene.scene_id,active_checkpoint_id:tx.scene.entry.checkpoint,entry_id:tx.token.entryId,current_pov:tx.scene.perspective?.character,period:tx.scene.perspective?.period,status:tx.pausedIntent?'paused':'active'});
      token = tx.token; adapter = tx.adapter; pending = null; error = null; seen = new Set(); elapsed = 0; trialSuccess = false; skipping = false; immediateSkip = false; trialIdentity=tx.trialIdentity || null; trialRecovery=null; trialPresentationToken=null; stagingPaused=false; queuedAdapterCues=[];
      if (tx.scene.scene_id==='CF-S18' && state.trial_snapshot?.entry_line_delivered) { seen.add('line:CF-S18-D01:start'); seen.add('line:CF-S18-D01:complete'); }
      title = tx.scene.title_card ? makeTitle(tx.scene.title_card) : null;
      trace('ready',tx);
      if (!title && state.status === 'active') dialogue?.resume();
      notify();
    } catch (cause) { if (pending === tx) { tx.provisional=beforeValidation; tx.status = 'preparing'; fail(tx,cause); } else { pause(); error=String(cause?.message || cause); onError({message:error,sceneId:tx.scene.scene_id}); } }
  }
  function prepare(tx) {
    tx.status = 'preparing'; tx.token = Object.freeze({runId:state.run_id,sceneId:tx.scene.scene_id,entryId:++entry});
    tx.adapter = adapters[tx.scene.adapter_key];
    state.status = tx.pausedIntent ? 'paused' : 'loading'; notify();
    if (disposed || pending !== tx || tx.status !== 'preparing') return;
    try {
      if (!tx.adapter || typeof tx.adapter.enter !== 'function') throw new Error(`Missing adapter: ${tx.scene.adapter_key}`);
      if (!eligible(tx.scene,tx.provisional)) throw new Error(`Missing prerequisites: ${tx.scene.scene_id}`);
      const reserved = tx.token;
      const emit = event => {
        if (!current(reserved)) return result(false,'inactive-token');
        if (event?.type === 'asset-failure') {
          // A failed in-scene set change needs the same explicit Retry path as
          // entry failure. Keep committed story effects, invalidate this lease,
          // and reserve a fresh entry token only when the player retries.
          const recovery = {transactionId:++serial,scene:record(reserved.sceneId),provisional:copy(state),pausedIntent:state.status==='paused',attempt:1,status:'preparing',adapter};
          pending=recovery; token=null; title=null; adapter=null; runCleanups([()=>dialogue?.stop()]);
          fail(recovery,new Error(String(event.message || 'Asset failure')));
          return result(true,'asset-failure-reported');
        }
        if (state?.status==='paused' && !pending && event?.type==='cue') { if (!queuedAdapterCues.some(e=>e.cueId===event.cueId) && queuedAdapterCues.length<256) queuedAdapterCues.push({...event,...reserved}); return result(false,'cue-queued-while-paused'); }
        if (!active()) return result(false,'inactive-token');
        if (event?.type === 'cue') return cue({...event,...reserved});
        if (event?.type === 'completion') { if (skipping && !dialogue?.frame().complete) return result(false,'recap-pending'); return complete({...event,...reserved,reason:skipping?'skip':event.reason},true); }
        if (event?.type === 'trial-event') return trialEvent(event);
        return result(false,'unsupported-event');
      };
      trace('prepare',tx);
      const readyValue = tx.adapter.enter({scene:tx.scene,token:reserved,checkpoint:copy(tx.provisional),emit});
      if (readyValue && typeof readyValue.then === 'function') Promise.resolve(readyValue).then(receipt => ready(tx,receipt,reserved),cause => { if(tx.token===reserved) fail(tx,cause); }); else ready(tx,readyValue,reserved);
    } catch(cause) { fail(tx,cause); }
  }
  function cleanupOutgoing(outgoing) {
    transitionCleanup=true;
    try { return runCleanups([()=>dialogue?.stop(),()=>outgoing?.exit?.()]); }
    finally { transitionCleanup=false; }
  }
  function begin(scene, provisional) {
    const pausedIntent = state.status === 'paused';
    const tx = {transactionId:++serial,scene,provisional,pausedIntent,attempt:1,status:'preparing'};
    pending = tx; token = null; title=null; state.status = 'transitioning'; tx.status='preparing';
    trace('begin',tx);
    const outgoing=adapter; adapter=null;
    trace('cleanupStart',tx);
    const cleanupErrors=cleanupOutgoing(outgoing);
    trace('cleanupEnd',tx);
    if (disposed || pending!==tx) return;
    if (cleanupErrors.length) { fail(tx,new Error('Scene transition cleanup failed. Retry scene entry.')); return; }
    prepare(tx);
  }
  function start(options = {}) {
    if (disposed) return result(false,'disposed');
    if (resetting) return result(false,'restart-in-progress');
    if (transitionCleanup) return result(false,'transition-cleanup-in-progress');
    if (restartFailure && !Object.keys(options).length) return reset();
    if(trialRecovery && state?.status==='failed' && !Object.keys(options).length)return presentTrialWin();
    if (pending?.status === 'failed' && !Object.keys(options).length) {
      const tx = pending; tx.attempt++; prepare(tx); return result(true,'retrying-entry');
    }
    if (state) return result(false,'already-started');
    const sceneId = options.sceneId || 'CF-S01'; const s = record(sceneId);
    fixture = options.fixture || null;
    if ((sceneId !== 'CF-S01' || candidateManifestId.startsWith('fixture:')) && !(typeof fixture?.label === 'string' && fixture.label.trim())) throw new Error('Labeled debug fixture required');
    fixture = copy(fixture); state = initial();
    if(candidateManifestId.startsWith('fixture:')&&fixture?.return_context)state.return_context={...copy(fixture.return_context),run_id:state.run_id};
    if (!eligible(s,state)) { state = null; throw new Error(`Missing prerequisites: ${sceneId}`); }
    begin(s,copy(state)); return result(true,'started');
  }
  function makeTitle(fields, returnCue=null) {
    return {...copy(fields),kind:token.sceneId==='CF-S20'?'chapter':'character',
      key:`${token.runId}:${token.sceneId}:${token.entryId}:${returnCue||'entry'}`,
      returnCue,resumeCursor:!!returnCue,elapsed:0,acknowledged:false,minimumSeconds:1.8};
  }
  function cue(event) {
    if (!current(event) || !active() || title && !title.acknowledged) return result(false,'inactive-token');
    const s = record(token.sceneId), id = event.cueId;
    if(id==='line:CF-S18-D02:complete' && trialRecovery)return result(false,'trial-presentation-pending');
    if(/^line:CF-S18-D02:/.test(id||'') && (!trialPresentationToken || event.presentationId!==trialPresentationToken.presentationId))return result(false,'stale-trial-presentation');
    const ids = (s.cues || []).map(c => typeof c === 'string' ? c : c.cue_id || c.cueId || c.bound_cue);
    const lineCue = /^line:(.+):(start|complete)$/.exec(id || '');
    if (!ids.includes(id) && !(lineCue && s.line_ids?.includes(lineCue[1]))) return result(false,'unknown-cue');
    if (seen.has(id)) return result(false,'duplicate-cue');
    if (id === 'TRIAL_COMPLETE') return result(false,'authoritative-trial-receipt-required');
    seen.add(id); if (!lineCue) dialogue?.cue(id);
    for (const e of s.knowledge_events || []) if (`line:${e.line_id}:complete` === id && !state.event_ledger.some(old => old.event_id === e.event_id)) {
      const item = {...copy(e),evidence:skipping?'skip':'normal',presentation:skipping?'recap':e.presentation}; state.event_ledger.push(item);
      for (const recipient of item.recipients || []) if (Object.hasOwn(state.knowledge,recipient) && !state.knowledge[recipient].includes(item.event_id)) state.knowledge[recipient].push(item.event_id);
    }
    if (id==='line:CF-S18-D01:complete' && state.trial_snapshot) state.trial_snapshot.entry_line_delivered=true;
    const cueToken=token, cueAdapter=adapter;
    try { cueAdapter?.onCue?.({...cueToken,cueId:id}); if (current(cueToken) && active() && adapter===cueAdapter && (adapterStatus()?.ready===false || !skipping&&adapterStatus()?.actionPending)) { stagingPaused=true; dialogue?.pause(); } } catch(cause) { pause(); error=String(cause?.message || cause); onError({message:error,sceneId:s.scene_id}); return result(false,'adapter-cue-failed'); }
    if (!immediateSkip && current(cueToken) && active() && adapter===cueAdapter && ((s.scene_id==='CF-S14' && id==='BEFORE_D16') || (s.scene_id==='CF-S15' && id==='BEFORE_D08'))) {
      title=makeTitle({main:'CLARENCE',sub:'PRESENT'},id);
      dialogue?.pause();
      notify();
    }
    return result(true,'cue');
  }
  function complete(event, adapterOwned=false) {
    if (!current(event)) return result(false,'stale-token');
    if(event.presentationId!=null && event.presentationId!==trialPresentationToken?.presentationId)return result(false,'stale-trial-presentation');
    if (!active()) return result(false,'inactive');
    if (adapterFrame()?.ready===false) return result(false,'staging-pending');
    if (!skipping && adapterFrame()?.actionPending) return result(false,'player-action-pending');
    const s = record(token.sceneId);
    if (event.transitionId !== `${s.scene_id}:exit`) return result(false,'invalid-transition');
    if (!['normal','skip','trial-success'].includes(event.reason)) return result(false,'invalid-reason');
    if (s.scene_id === 'CF-S18' && (event.reason !== 'trial-success' || !trialSuccess || !seen.has('line:CF-S18-D02:complete'))) return result(false,'trial-success-required');
    if (title && !title.acknowledged) return result(false,'title-pending');
    if (s.scene_id === 'CF-S07' && elapsed < 3 && !(event.reason === 'skip' && immediateSkip)) return result(false,'observation-pending');
    if (event.reason === 'skip' && (!skipping || !dialogue?.frame().complete)) return result(false,'recap-pending');
    if (s.line_ids?.length && !dialogue?.frame().complete) return result(false,'dialogue-pending');
    const rule = s.completion_rule;
    if (event.reason !== 'skip' && rule?.required_cues?.some(id => !seen.has(id))) return result(false,'predicate-pending');
    if (event.reason !== 'skip' && rule && typeof rule === 'string' && !seen.has(rule)) return result(false,'predicate-pending');
    const next = s.exit.next_scene; if (next !== 'END_AVAILABLE_EXCERPT') record(next);
    const provisional = copy(state);
    if (['CF-S06','CF-S08'].includes(s.scene_id)) {
      const target=s.scene_id==='CF-S06'?'CF-S08':'CF-S10';
      if (state.return_context && !state.return_context.consumed) return result(false,'nested-memory-context');
      if (!adapterOwned || !validContext(event.memoryCapture,s.scene_id,target)) return result(false,'invalid-memory-capture');
      provisional.return_context=copy(event.memoryCapture);
    } else if (event.memoryCapture) return result(false,'unexpected-memory-capture');
    provisional.completed_scenes.push(s.scene_id);
    provisional.completed_transition_ids.push(`${state.run_id}:${s.scene_id}:${event.transitionId}`);
    provisional.story_flags = [...new Set([...state.story_flags,...s.exit.sets_flags])];
    provisional.event_ledger.push({event_id:`${state.run_id}:${s.scene_id}:exit`,scene_id:s.scene_id,line_id:null,kind:event.reason === 'skip'?'skipped':'witnessed',recipients:[],presentation:event.reason==='skip'?'recap':'shown',evidence:event.reason==='skip'?'skip':'normal'});
    if (next === 'END_AVAILABLE_EXCERPT') {
      const outgoing=adapter, before=state; token=null; title=null; adapter=null; state.status='transitioning';
      const cleanupErrors=cleanupOutgoing(outgoing);
      // Cleanup callbacks may dispose or restart. Never overwrite their new owner.
      if (disposed || state!==before) return result(true,'transitioning');
      if (cleanupErrors.length) {
        restartFailure=true; state.status='failed';
        error='Story ending cleanup failed. Retry restarting the story. ('+cleanupErrors.join(', ')+')';
        notify();
        if (!disposed && state===before) onError({message:error,sceneId:s.scene_id,checkpoint:state.active_checkpoint_id,actions:['Retry story restart','Restart story']});
      } else { state=provisional; state.status='ended'; notify(); }
    }
    else begin(record(next),provisional);
    return result(true,'transitioning');
  }
  function continueLine() {
    if (!active() || error || adapterFrame()?.ready===false) return false;
    if (title && !title.acknowledged) {
      if (title.elapsed < title.minimumSeconds) return false;
      const acknowledgedTitle=title, acknowledgedToken=token; title.acknowledged=true;
      try { if (!acknowledgedTitle.resumeCursor) dialogue?.start({lineIds:skipping?record(token.sceneId).recap_line_ids:entryLines(record(token.sceneId),state),token,silent:immediateSkip}); if (!current(acknowledgedToken) || !active()) return false; if ((!stagingPaused||acknowledgedTitle.resumeCursor) && adapterFrame()?.ready!==false && (skipping||!adapterFrame()?.actionPending)) {stagingPaused=false;dialogue?.resume();} return true; } catch(cause) { if (!current(acknowledgedToken)) return false; if (title===acknowledgedTitle) title.acknowledged=false; pause(); error=String(cause?.message || cause); onError({message:error,sceneId:state.active_scene_id}); return false; }
    }
    const explicitAction=adapter?.onContinue?.()===true;
    if (!skipping && adapterFrame()?.actionPending) return explicitAction;
    return (dialogue?.advance() || false)||explicitAction;
  }
  function requestSkip({immediate=false}={}) {
    if (!active() || adapterFrame()?.ready===false || token.sceneId === 'CF-S18' || skipping) return result(false,'skip-unavailable');
    const recap = record(token.sceneId).recap_line_ids;
    if (!recap?.length) return result(false,'recap-unavailable');
    skipping=true; immediateSkip=immediate===true; if(title&&!title.acknowledged)title.resumeCursor=false; adapter?.onSkip?.(); dialogue?.stop(); if (!title || title.acknowledged) dialogue?.start({lineIds:recap,token,silent:immediateSkip}); return result(true,'recap');
  }
  function drainImmediateSkip() {
    const own=token,owner=adapter;
    if(!immediateSkip || !skipping || !active() || adapterStatus()?.ready===false)return;
    if(title && !title.acknowledged){title.acknowledged=true;dialogue?.start({lineIds:record(own.sceneId).recap_line_ids,token:own,silent:true});}
    if(stagingPaused && adapterStatus()?.ready!==false){stagingPaused=false;dialogue?.resume();}
    // Advance the real canonical cursor, preserving skip knowledge and cue order.
    // A staging cue can pause it; the next ready tick resumes the same request.
    for(let count=0;count<128 && active() && current(own) && adapter===owner && adapterStatus()?.ready!==false && !dialogue?.frame().complete;count++){
      if(!dialogue?.advance())break;
    }
    // Only the adapter may emit completion, including its validated memory pose.
    if(active() && current(own) && adapter===owner && adapterStatus()?.ready!==false)owner?.tick?.(0,{});
  }
  function pause() { if (!state || disposed || ['ended','failed','paused'].includes(state.status)) return; if (pending) pending.pausedIntent=true; state.status='paused'; dialogue?.pause(); adapter?.pause?.(); notify(); }
  function resume() { if (!state || disposed || state.status !== 'paused') return; if (pending) { pending.pausedIntent=false; state.status='loading'; } else { state.status='active'; adapter?.resume?.(); if ((!title||title.acknowledged) && !stagingPaused && adapterFrame()?.ready!==false && (skipping||!adapterFrame()?.actionPending)) dialogue?.resume(); if (!title && !dialogue?.frame().token) dialogue?.start({lineIds:record(token.sceneId).line_ids || [],token}); } notify(); }
  function retryTrial() { if (!state || disposed || pending || state.active_scene_id!=='CF-S18' || !trialIdentity || trialSuccess) return result(false,'retry-unavailable'); begin(record('CF-S18'),copy(state)); return result(true,'retrying-trial'); }
  function reset() {
    if (disposed) return result(false,'disposed');
    if (resetting) return result(false,'restart-in-progress');
    if (transitionCleanup) return result(false,'transition-cleanup-in-progress');
    resetting=true; restartFailure=false;
    cancelTransitionMetrics(transitionMetrics);
    const exiting=new Set([pending?.adapter,adapter].filter(Boolean));
    if (pending) pending.status='cancelled';
    // Revoke old authority before any cleanup can throw or reenter the route.
    pending=null; token=null; title=null; adapter=null; queuedAdapterCues=[]; trialIdentity=null; trialRecovery=null; trialPresentationToken=null;
    if (state) state.status='transitioning';
    try {
      const errors=runCleanups([()=>dialogue?.stop(),...[...exiting].map(owner=>()=>owner.exit?.({discardRetained:true}))]);
      if (disposed) return result(false,'disposed');
      if (errors.length) {
        restartFailure=true;
        error='Story restart cleanup failed. Retry restarting the story. ('+errors.join(', ')+')';
        if (!state) state=initial();
        state.status='failed';
        notify();
        if (!disposed) onError({message:error,sceneId:state.active_scene_id,checkpoint:state.active_checkpoint_id,actions:['Retry story restart','Restart story']});
        return result(false,'restart-cleanup-failed');
      }
      state=null;
      resetting=false;
      return start({fixture});
    } finally { resetting=false; }
  }
  function dispose() {
    if(disposed)return;disposed=true;
    cancelTransitionMetrics(transitionMetrics);
    const exiting=new Set([pending?.adapter,adapter].filter(Boolean));
    if(pending)pending.status='cancelled';
    // Invalidate every lease before callbacks can throw or complete late.
    pending=null;token=null;title=null;adapter=null;queuedAdapterCues=[];trialRecovery=null;trialPresentationToken=null;
    runCleanups([()=>dialogue?.stop(),...[...exiting].map(owner=>()=>owner.exit?.({discardRetained:true}))]);
  }
  // Live character cards use the app's presentation clock; direct CPU/manual
  // stepping retains this seam without changing the simulation stepper.
  function tickTitle(dt) {
    if(!active()||error||!title||title.acknowledged||adapterStatus()?.ready===false||!Number.isFinite(dt)||dt<0)return false;
    title.elapsed=Math.min(title.minimumSeconds,title.elapsed+dt);
    if(autoAdvanceTitles && (title.kind==='character'||dialogue?.frame()?.mode==='auto') && title.elapsed>=title.minimumSeconds)continueLine();
    return true;
  }
  function tick(dt,controls) {
    if (!active() || !Number.isFinite(dt) || dt < 0) return;
    if(immediateSkip){drainImmediateSkip();return;}
    const tickToken=token, tickAdapter=adapter;
    if (title && !title.acknowledged) {
      tickTitle(dt);
      return;
    }
    tickAdapter?.tick?.(dt,controls);
    if (!active() || !current(tickToken) || adapter!==tickAdapter) return;
    if (title && !title.acknowledged) return;
    if (adapterStatus()?.ready===false) { stagingPaused=true; dialogue?.pause(); return; }
    elapsed+=dt;
    for (const event of queuedAdapterCues.splice(0)) { if (!active() || !current(tickToken) || adapter!==tickAdapter) return; cue(event); }
    if (!active() || !current(tickToken) || adapter!==tickAdapter) return;
    if (title && !title.acknowledged) return;
    if (adapterStatus()?.ready===false) { stagingPaused=true; dialogue?.pause(); return; }
    if (title && !title.acknowledged) return;
    if (!skipping && adapterStatus()?.actionPending) { stagingPaused=true; dialogue?.pause(); return; }
    if (stagingPaused) { stagingPaused=false; dialogue?.resume(); if (!active() || !current(tickToken) || adapter!==tickAdapter) return; }
    dialogue?.tick(dt);
  }
  // Trusted rendering/input consumers may borrow these live references for the
  // current synchronous read only. Never mutate or retain them across a tick.
  // Public frame()/snapshot() remain defensive copies for external observers.
  function readFrame() {const presentation=adapterFrame()||null,dialogueFrame=dialogue?.frame()||null;return {state,token,dialogue:presentation?.ready===false?null:dialogueFrame,presentation,dialogueMode:dialogueFrame?.mode,staging:presentation?.ready===false,error,title};}
  function readStatus(){return {state,token,title,error,presentation:adapterStatus()||null};}
  return Object.freeze({start,tick,tickTitle,readFrame,readStatus,frame:()=>copy(readFrame()),snapshot:()=>copy(state),cue,complete:event=>complete(event),continueLine,requestSkip,pause,resume,retryTrial,reset,dispose});
}
