import {V31_VOICES as legacy} from './cf-v31-voice-manifest.js';
import {DRAMA_VOICES} from './cf-v4-dialogue-voices.js';
// Retired recordings remain in the archive, but cannot be played or prefetched
// by the current route. Changed wording always receives a matching new clip.
export const V31_VOICES=Object.freeze({
 ...Object.fromEntries(Object.entries(legacy).filter(([,entry])=>!['NARRATOR','CLARENCE_INNER','STAGE_CAPTION'].includes(entry.speaker))),
 ...DRAMA_VOICES,
});
