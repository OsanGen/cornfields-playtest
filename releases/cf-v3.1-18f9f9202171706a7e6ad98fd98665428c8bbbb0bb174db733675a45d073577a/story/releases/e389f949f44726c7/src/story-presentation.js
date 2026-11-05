import {v31PerformanceLine} from './cf-v31-voice.js';
import {V31_VOICES} from './cf-v31-voice-manifest.js';

/** One narrative renderer selection and entry-cue owner. Never advances the route. */
export function createStoryPresentation({view, v31View, prologueView, survivalView, prologueAudio, audio, ui, storyUI, voice, characterTitlePresentation=null}) {
  let entryKey = null;
  let ridePhase = null;
  let bridgePending = false;
  let audioPhase = null;
  return Object.freeze({
    render(frame, {game, time, reducedMotion, inputReady, error, captureError, blockingError, hidden=false,horror=true,notice=null}) {
      const p = frame.presentation;
      const sceneId = frame.state.active_scene_id;
      const nextKey = frame.token ? `${frame.token.runId}:${frame.token.entryId}` : null;
      const entering = nextKey && nextKey !== entryKey;
      if (entering) {
        prologueAudio?.pause();
        entryKey = nextKey;
        ridePhase = null;
        bridgePending = ['CF-S07','CF-S08','CF-S09','CF-S10','CF-S19','CF-S20'].includes(sceneId);
      }
      // Bus ownership follows the ready scene, including reduced-motion entries
      // that deliberately omit optional bridge cues. This never resumes context.
      const nextAudioPhase=sceneId==='CF-S18'&&p?.ready!==false?'trial':'narrative';
      if(nextAudioPhase!==audioPhase){audio.setStoryPhase?.(nextAudioPhase);audioPhase=nextAudioPhase;}
      if(frame.title?.kind==='character')bridgePending=false;
      const playback = voice?.playbackFrame(frame.dialogue?.lineId);
      const speechLine = v31PerformanceLine(frame.dialogue, p?.time, V31_VOICES, playback);
      if (sceneId === 'CF-S18' || entering) ui.render(game);
      storyUI.render({...frame, muted:!!audio.muted, callTitle:null, ...(error ? {error} : {}), captureError, blockingError, inputReady, reducedMotion, hidden,horror,notice}, game);
      if (p?.ready === false) {
        view.renderer.setClearColor?.(0x000000,1);
        view.renderer.clear();
      } else if (p?.renderer === 'v31-view') v31View.render({...p, speechLine,reduced:reducedMotion});
      else if (sceneId === 'CF-S18') view.render(game,time,reducedMotion);
      else if (p?.renderer === 'prologue') prologueView?.render({
        ...p.legacyFrame, elapsed:p.legacyFrame?.elapsed ?? p.time,
        speaker:frame.dialogue?.speaker || '', spoken:frame.dialogue?.text || '',
        line:v31PerformanceLine(frame.dialogue,p.legacyFrame?.time,V31_VOICES,playback),
      });
      else if (p?.renderer === 'survival') survivalView?.render(game,reducedMotion);
      else { view.renderer.setClearColor?.(0x000000,1); view.renderer.clear(); }
      // World renders retain their staging and ownership side effects. Optional
      // title artwork draws afterward and never participates in scene readiness.
      if(characterTitlePresentation){
        const titlePresentation=characterTitlePresentation.present(frame,{reducedMotion,hidden,error,blockingError,textSize:storyUI.characterTitleTextSize?.()});
        storyUI.setCharacterTitlePresentation?.(titlePresentation);
      }
      const title=frame.title,visible=title?.kind==='character'&&!title.acknowledged&&frame.state.status==='active'&&p?.ready===true&&!hidden&&!error&&!blockingError&&!frame.error;
      audio.syncCharacterTitle?.({kind:title?.kind,key:title?.key,elapsed:title?.elapsed,duration:title?.minimumSeconds,visible,active:frame.state.status==='active',ready:p?.ready===true,quiet:reducedMotion,enabled:horror});
      if (frame.state.status === 'active' && p?.ready !== false) {
        if (['CF-S01','CF-S02'].includes(sceneId) && p?.legacyFrame) {
          prologueAudio?.sync?.({...p.legacyFrame,line:null,spoken:null});
          if (p.ride?.phase === 'exiting' && ridePhase !== 'exiting') prologueAudio?.cue?.('door_open');
          ridePhase = p.ride?.phase || null;
        }
        if (bridgePending && audio.ctx?.state === 'running') {
          if (!reducedMotion && !audio.muted) prologueAudio?.cue?.('memory_bridge');
          bridgePending = false;
        }
      } else prologueAudio?.pause();
    },
  });
}
