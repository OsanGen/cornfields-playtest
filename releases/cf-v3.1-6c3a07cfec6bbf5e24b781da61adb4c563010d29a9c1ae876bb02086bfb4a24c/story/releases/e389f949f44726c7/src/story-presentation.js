import {v31PerformanceLine} from './cf-v31-voice.js';
import {V31_VOICES} from './cf-v31-voice-manifest.js';

/** One narrative renderer selection and entry-cue owner. Never advances the route. */
export function createStoryPresentation({view, v31View, prologueView, survivalView, prologueAudio, audio, ui, storyUI, voice}) {
  let entryKey = null;
  let ridePhase = null;
  let bridgePending = false;
  return Object.freeze({
    render(frame, {game, time, reducedMotion, inputReady, error}) {
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
      const playback = voice?.playbackFrame(frame.dialogue?.lineId);
      const speechLine = v31PerformanceLine(frame.dialogue, p?.time, V31_VOICES, playback);
      if (sceneId === 'CF-S18' || entering) ui.render(game);
      storyUI.render({...frame, callTitle:null, ...(error ? {error} : {}), inputReady}, game);
      if (p?.ready === false) {
        view.renderer.setClearColor?.(0x000000,1);
        view.renderer.clear();
      } else if (p?.renderer === 'v31-view') v31View.render({...p, speechLine});
      else if (sceneId === 'CF-S18') view.render(game,time,reducedMotion);
      else if (p?.renderer === 'prologue') prologueView?.render({
        ...p.legacyFrame, elapsed:p.legacyFrame?.elapsed ?? p.time,
        speaker:frame.dialogue?.speaker || '', spoken:frame.dialogue?.text || '',
        line:v31PerformanceLine(frame.dialogue,p.legacyFrame?.time,V31_VOICES,playback),
      });
      else if (p?.renderer === 'survival') survivalView?.render(game,reducedMotion);
      else { view.renderer.setClearColor?.(0x000000,1); view.renderer.clear(); }
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
