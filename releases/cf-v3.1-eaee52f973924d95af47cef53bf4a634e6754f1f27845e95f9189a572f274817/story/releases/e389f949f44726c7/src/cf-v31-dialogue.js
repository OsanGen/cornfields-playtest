// One canonical caption cursor. Optional local speech and readable timed playback
// never grant physical action cues; the route still owns action-gated progression.
const clone = x => x == null ? x : JSON.parse(JSON.stringify(x));
export function createV31Dialogue({lines,onCue=()=>{},voice=null,mode='manual',voiceAssets={},muted=()=>false,timing={}}={}) {
  if(!lines)throw new Error('Canonical line registry required');
  if(!['manual','auto'].includes(mode))throw new Error('Unknown dialogue mode');
  const positive=(n,fallback)=>Number.isFinite(n)&&n>0?n:fallback;
  const minimum=positive(timing.minimumSeconds,2),rate=positive(timing.wordsPerSecond,2.6),padding=Number.isFinite(timing.paddingSeconds)&&timing.paddingSeconds>=0?timing.paddingSeconds:.8;
  let ids=[],token=null,index=0,page=0,paused=false,generation=0,handle=null;
  let visible=false,started=false,completed=false,granted=new Set(),pageElapsed=0,lineElapsed=0;
  let voiceState='none',voiceFinished=false,voiceDuration=0,voiceRequestedAt=0;
  const pendingGrace=positive(timing.pendingGraceSeconds,8);
  const line=()=>lines[ids[index]],pages=()=>line()?.pages||[line()?.text||''];
  const emit=phase=>onCue({...clone(token),cueId:`line:${ids[index]}:${phase}`});
  const isMuted=()=>typeof muted==='function'?!!muted():!!muted;
  const pageSeconds=()=>Math.max(minimum,(pages()[page].trim().match(/\S+/g)||[]).length/rate+padding);
  function stopVoice(){generation++;const h=handle;handle=null;voiceState='none';voiceFinished=false;voiceDuration=0;try{h?.stop?.();voice?.stop?.();}catch(_){/* Local captions remain available. */}}
  function playVoice(){
    const l=line(),entry=voiceAssets[l?.line_id]||l?.optional_voice_asset,asset=typeof entry==='string'?entry:entry?.asset;
    if(!asset||!voice?.play||paused||isMuted())return;
    const gen=generation,own=token,id=l.line_id;voiceState='pending';voiceRequestedAt=lineElapsed;
    voiceDuration=positive(typeof entry==='object'?entry.duration:0,0);
    try{
      const playback=voice.play({asset,token:clone(token),lineId:id,text:l.text,offsetSeconds:lineElapsed});
      Promise.resolve(playback).then(h=>{
        if(gen!==generation||own!==token||id!==line()?.line_id||paused){h?.stop?.();return;}
        handle=h;voiceState=h?'playing':'failed';voiceDuration=positive(h?.durationSeconds,voiceDuration);
        const finished=h?.finishedPromise||h?.finished;
        if(finished&&typeof finished.then==='function')Promise.resolve(finished).then(()=>{if(gen===generation&&own===token&&id===line()?.line_id){voiceFinished=true;voiceState='finished';}},()=>{if(gen===generation&&own===token&&id===line()?.line_id)voiceState='failed';});
      },()=>{if(gen===generation&&own===token&&id===line()?.line_id)voiceState='failed';});
    }catch(_){voiceState='failed';}
  }
  function eligible(){const trigger=line()?.trigger;return !trigger||['ENTRY','PREVIOUS_CUE_COMPLETE'].includes(trigger)||granted.has(trigger);}
  function reveal(){
    if(!token||paused||completed||visible||!eligible())return;
    visible=true;
    if(!started){started=true;const own=token,id=line()?.line_id;emit('start');if(own===token&&id===line()?.line_id&&!paused)playVoice();}
  }
  function start({lineIds,token:nextToken}={}){
    if(!Array.isArray(lineIds)||!nextToken)throw new Error('Line IDs and entry token required');
    for(const id of lineIds){const l=lines[id];if(!l||l.line_id!==id||typeof l.text!=='string')throw new Error(`Unknown canonical line: ${id}`);if(l.pages&&(!Array.isArray(l.pages)||l.pages.some(p=>typeof p!=='string')||l.pages.join('')!==l.text))throw new Error(`Pages must preserve exact text: ${id}`);}
    const keepPaused=paused;stop();paused=keepPaused;ids=[...lineIds];token=Object.freeze(clone(nextToken));completed=!ids.length;reveal();
  }
  function advance(){
    if(!token||paused||completed||!visible)return false;
    if(page+1<pages().length){page++;pageElapsed=0;return true;}
    const completedId=ids[index],own=token;stopVoice();visible=false;emit('complete');
    if(token!==own)return true; // A callback may reset/reenter; never resurrect it.
    granted.add(`line:${completedId}:complete`);granted.add(`AFTER_${completedId.split('-').at(-1)}`);
    index++;page=0;pageElapsed=0;lineElapsed=0;started=false;visible=false;
    if(index>=ids.length)completed=true;else reveal();return true;
  }
  function cue(id){if(!token)return false;granted.add(id);reveal();return true;}
  function pause(){if(paused)return;paused=true;try{if(handle?.pause)handle.pause();else stopVoice();}catch(_){stopVoice();}}
  function resume(){if(!paused)return;paused=false;try{if(handle?.resume)handle.resume();else if(started&&visible&&!completed)playVoice();}catch(_){stopVoice();}reveal();}
  function stop(){stopVoice();ids=[];token=null;index=0;page=0;paused=false;visible=false;started=false;completed=false;granted=new Set();pageElapsed=0;lineElapsed=0;}
  function setMode(next){if(!['manual','auto'].includes(next))throw new Error('Unknown dialogue mode');mode=next;pageElapsed=0;}
  function tick(dt){
    if(!Number.isFinite(dt)||dt<0||paused)return;reveal();if(mode!=='auto'||!visible||completed||!token)return;
    if(isMuted()&&(handle||voiceState==='pending'))stopVoice();
    pageElapsed+=dt;lineElapsed+=dt;if(pageElapsed<pageSeconds())return;
    if(page+1===pages().length&&voiceState==='pending'&&!isMuted()){
      // Give a real local fetch/decode a bounded chance before a silent fallback.
      // Invalidating its generation ensures a late handle cannot start old audio.
      if(lineElapsed-voiceRequestedAt<pendingGrace)return;
      stopVoice();
    }
    if(page+1===pages().length&&voiceState==='playing'&&!voiceFinished&&!isMuted()){
      // Prefer the actual completion event. A valid decoded clip duration is a
      // bounded local-audio fallback if its completion callback is unavailable.
      if(!voiceDuration||lineElapsed<voiceDuration+.5)return;
    }
    advance();
  }
  function frame(){const l=line();return {token:clone(token),lineId:l?.line_id||null,text:visible?pages()[page]:'',speaker:visible?l.speaker:null,pageIndex:page,pageCount:l?pages().length:0,complete:completed,waiting:!!token&&!completed&&!visible,paused,mode,elapsedSeconds:lineElapsed,durationSeconds:voiceDuration,speaking:voiceState==='playing'&&!paused&&!isMuted()};}
  return Object.freeze({start,tick,advance,cue,pause,resume,frame,stop,setMode});
}
