// One manually acknowledged caption cursor; voice is optional, never progression authority.
const clone = x => x == null ? x : JSON.parse(JSON.stringify(x));
export function createV31Dialogue({lines, onCue = () => {}, voice = null} = {}) {
  if (!lines) throw new Error('Canonical line registry required');
  let ids = [], token = null, index = 0, page = 0, paused = false, generation = 0, handle = null;
  let visible = false, started = false, completed = false, granted = new Set();
  const line = () => lines[ids[index]];
  const pages = () => line()?.pages || [line()?.text || ''];
  const emit = phase => onCue({...clone(token),cueId:`line:${ids[index]}:${phase}`});
  function stopVoice() { generation++; const h = handle; handle=null; try { h?.stop?.(); voice?.stop?.(); } catch (_) { /* Captions remain available without audio. */ } }
  function playVoice() {
    const l = line(); if (!l?.optional_voice_asset || !voice?.play || paused) return;
    const gen = generation, own = token;
    try {
      const playback = voice.play({asset:l.optional_voice_asset,token:clone(token),lineId:l.line_id});
      Promise.resolve(playback).then(h => {
        if (gen !== generation || own !== token || paused) h?.stop?.(); else handle=h;
      },() => {}); // Exact subtitles are the specified missing-recording fallback.
    } catch (_) { /* No recording is required. */ }
  }
  function eligible() {
    const trigger = line()?.trigger;
    return !trigger || ['ENTRY','PREVIOUS_CUE_COMPLETE'].includes(trigger) || granted.has(trigger);
  }
  function reveal() {
    if (!token || paused || completed || visible || !eligible()) return;
    visible=true;
    if (!started) { started=true; emit('start'); playVoice(); }
  }
  function start({lineIds,token:nextToken} = {}) {
    if (!Array.isArray(lineIds) || !nextToken) throw new Error('Line IDs and entry token required');
    for (const id of lineIds) {
      const l=lines[id]; if (!l || l.line_id !== id || typeof l.text !== 'string') throw new Error(`Unknown canonical line: ${id}`);
      if (l.pages && (!Array.isArray(l.pages) || l.pages.some(p=>typeof p!=='string') || l.pages.join('')!==l.text)) throw new Error(`Pages must preserve exact text: ${id}`);
    }
    const keepPaused=paused; stop(); paused=keepPaused; ids=[...lineIds]; token=Object.freeze(clone(nextToken)); completed=!ids.length; reveal();
  }
  function advance() {
    if (!token || paused || completed || !visible) return false;
    if (page + 1 < pages().length) { page++; return true; }
    const completedId=ids[index]; const own=token;
    stopVoice(); visible=false; emit('complete');
    // A cue callback may stop/reset the owner; never resurrect its old cursor.
    if (token !== own) return true;
    granted.add(`line:${completedId}:complete`); granted.add(`AFTER_${completedId.split('-').at(-1)}`);
    index++; page=0; started=false; visible=false;
    if (index >= ids.length) completed=true; else reveal();
    return true;
  }
  function cue(id) { if (!token) return false; granted.add(id); reveal(); return true; }
  function pause() { if (paused) return; paused=true; stopVoice(); }
  function resume() { if (!paused) return; paused=false; reveal(); }
  function stop() { stopVoice(); ids=[]; token=null; index=0; page=0; paused=false; visible=false; started=false; completed=false; granted=new Set(); }
  function frame() { const l=line(); return {token:clone(token),lineId:l?.line_id || null,text:visible?pages()[page]:'',speaker:visible?l.speaker:null,pageIndex:page,pageCount:l?pages().length:0,complete:completed,waiting:!!token&&!completed&&!visible,paused}; }
  return Object.freeze({start,tick(dt){ if (!Number.isFinite(dt)||dt<0||paused) return; reveal(); },advance,cue,pause,resume,frame,stop});
}
