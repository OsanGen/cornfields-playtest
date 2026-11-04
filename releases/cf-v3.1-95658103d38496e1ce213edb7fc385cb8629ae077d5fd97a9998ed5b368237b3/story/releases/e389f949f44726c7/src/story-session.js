import {createV31Route} from './cf-v31-route.js';
import {createV31Dialogue} from './cf-v31-dialogue.js';
import {createV31Voice} from './cf-v31-voice.js';
import {V31_VOICES} from './cf-v31-voice-manifest.js';
import {createV31Adapters} from './cf-v31-adapters.js';
import {V31_SCENES, V31_LINES} from './cf-v31-scenes.js';
import {runCleanups} from '../../../../shared/runtime/resource-scope.js';

/** Compose narrative owners without browser listeners or trial implementation. */
export function createStorySession({candidateManifestId, audio, onError, onState, ...dependencies}) {
  let route;
  let disposed = false;
  const voice = createV31Voice(audio, {manifest: V31_VOICES});
  const dialogue = createV31Dialogue({
    lines: V31_LINES,
    onCue: event => route.cue(event),
    mode: 'auto',
    voice,
    voiceAssets: V31_VOICES,
    muted: () => !!audio.muted,
  });
  const adapters = createV31Adapters({...dependencies, audio});
  try{route = createV31Route({candidateManifestId, scenes: V31_SCENES, adapters, dialogue, autoAdvanceTitles: true, onError,onState});}
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
