import {v31PerformanceLine} from './cf-v31-voice.js';
import {V31_VOICES} from './cf-v31-voice-manifest.js';

/** One narrative renderer selection and entry-cue owner. Never advances the route. */
export function createStoryPresentation({view, v31View, prologueView, survivalView, prologueAudio, audio, ui, storyUI, voice, characterTitlePresentation=null}) {
  let entryKey = null;
  let ridePhase = null;
  let radioCueEntry = null;
  let radioTransmission = null;
  let bridgePending = false;
  let audioPhase = null;
  return Object.freeze({
    render(frame, {game, time, reducedMotion, inputReady, error, captureError, blockingError, hidden=false,horror=true,notice=null}) {
      const p = frame.presentation || frame.heldOpening;
      const opening = p?.legacyFrame?.v31Arrival || p?.legacyFrame?.v31ExteriorWalk;
      const sceneId = frame.state.active_scene_id;
      const nextKey = frame.token ? `${frame.token.runId}:${frame.token.entryId}` : null;
      const entering = nextKey && nextKey !== entryKey;
      if (entering) {
        if(!p?.continuousOpening)prologueAudio?.pause();
        entryKey = nextKey;
        ridePhase = null;
        bridgePending = ['CF-S07','CF-S08','CF-S09','CF-S10','CF-S19','CF-S20'].includes(sceneId);
      }
      // Bus ownership follows the ready scene, including reduced-motion entries
      // that deliberately omit optional bridge cues. This never resumes context.
      const nextAudioPhase=p?.adapterKey==='trial'&&p?.ready!==false?'trial':'narrative';
      if(nextAudioPhase!==audioPhase){audio.setStoryPhase?.(nextAudioPhase);audioPhase=nextAudioPhase;}
      if(frame.title?.kind==='character')bridgePending=false;
      const playback = voice?.playbackFrame(frame.dialogue?.lineId);
      const speechLine = v31PerformanceLine(frame.dialogue, p?.time, V31_VOICES, playback);
      if (p?.adapterKey === 'trial' || entering) ui.render(game);
      storyUI.render({...frame, muted:!!audio.muted, mono:!!audio.mono, callTitle:null, ...(error ? {error} : {}), captureError, blockingError, inputReady, reducedMotion, hidden,horror,notice}, game);
      if (p?.ready === false) {
        view.renderer.setClearColor?.(0x000000,1);
        view.renderer.clear();
      } else if (p?.renderer === 'v31-view') {
        const camera=view.camera, fov=camera?.fov;
        const intensity=horror&&!reducedMotion&&frame.state.status==='active'?p.handIntensity||0:0;
        const distorted=intensity>0&&Number.isFinite(fov);
        if(distorted){
          camera.fov=fov-intensity*(5+2*Math.sin(p.time*2.4));
          camera.updateProjectionMatrix();
        }
        try{v31View.render({...p,speechLine,reduced:reducedMotion});}
        finally{if(distorted){camera.fov=fov;camera.updateProjectionMatrix();}}
      }
      else if (p?.adapterKey === 'trial') view.render(game,time,reducedMotion);
      else if (p?.renderer === 'prologue') prologueView?.render({
        ...p.legacyFrame, elapsed:p.legacyFrame?.elapsed ?? p.time,
        speaker:speechLine?.playing?speechLine.speaker:'', spoken:speechLine?.playing?speechLine.text:'',
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
      const live = !hidden && (frame.state.status === 'active' || !!frame.heldOpening && frame.state.status === 'loading');
      if (live && p?.ready !== false) {
        if (opening) {
          const radio=p.legacyFrame.callRadio;
          const legacyFrame=p.legacyFrame;
          prologueAudio?.sync?.({...legacyFrame,chapter:legacyFrame.v31ExteriorWalk?'walk':legacyFrame.chapter,line:null,spoken:null});
          if ((radio?.phase === 'lifting'||radio?.phase === 'raised') && radioCueEntry !== entryKey) {
            radioCueEntry=entryKey;
            prologueAudio?.cue?.('radio');
          }
          if (radio?.transmitting && radioTransmission !== radio.transmitting) prologueAudio?.cue?.('radio_ptt');
          radioTransmission=radio?.transmitting||null;
          if (p.ride?.phase === 'exiting' && ridePhase !== 'exiting') prologueAudio?.cue?.('door_open');
          ridePhase = p.ride?.phase || null;
        } else if(p?.stagedFarmDog&&p.set?.setId==='FARM_FRONT'){
          prologueAudio?.sync?.({chapter:'walk',v31ExteriorWalk:true,stagedFarmDog:true,player:p.player,eyeHeight:p.eyeHeight,time:p.time,reduced:reducedMotion});
        } else if(sceneId==='CF-S03')prologueAudio?.pause();
        if (bridgePending && audio.ctx?.state === 'running') {
          if (!reducedMotion && !audio.muted) prologueAudio?.cue?.('memory_bridge');
          bridgePending = false;
        }
      } else prologueAudio?.pause();
    },
  });
}
