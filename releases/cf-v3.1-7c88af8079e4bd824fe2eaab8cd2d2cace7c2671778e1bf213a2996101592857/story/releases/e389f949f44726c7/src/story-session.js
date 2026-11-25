import {createV4Route as createV31Route} from './cf-v4-route.js';
import {createV31Dialogue} from './cf-v31-dialogue.js';
import {createV31Voice} from './cf-v31-voice.js';
import {V31_VOICES} from './cf-v31-voice-manifest.js';
import {createV4Adapters as createV31Adapters} from './cf-v4-adapters.js';
import {V31_SCENES, V31_LINES} from './cf-v4-scenes.js';
import {runCleanups} from '../../../../shared/runtime/resource-scope.js';

/** Compose narrative owners without browser listeners or trial implementation. */
export function createStorySession({candidateManifestId, audio, onError, onState, transitionMetrics, waitForSceneReveal, ...dependencies}) {
  let route;
  let disposed = false;
  const voiceSilent=()=>!!audio.muted||audio.volume===0;
  const voice = createV31Voice(audio, {manifest: V31_VOICES,isMuted:voiceSilent});
  const dialogue = createV31Dialogue({
    lines: V31_LINES,
    onCue: event => route.cue(event),
    mode: 'auto',
    voice,
    voiceAssets: V31_VOICES,
    muted: voiceSilent,
    timing:{pendingGraceSeconds:1,recordingClock:true},
  });
  const adapters = createV31Adapters({...dependencies, audio});
  const prepareVoices=ids=>{if(!voiceSilent())void voice.prefetch(ids.filter(id=>V31_VOICES[id]));};
  try{route = createV31Route({candidateManifestId, scenes: V31_SCENES, adapters, dialogue, autoAdvanceTitles: true, onError,onState,transitionMetrics,waitForSceneReveal,prepareVoices});}
  catch(error){runCleanups([()=>dialogue.stop(),()=>voice.dispose()]);throw error;}
  return Object.freeze({
    route, dialogue, voice,
    dispose() {
      if (disposed) return;
      disposed = true;
      runCleanups([()=>route.dispose(),()=>voice.dispose()]);
    },
  });
}
