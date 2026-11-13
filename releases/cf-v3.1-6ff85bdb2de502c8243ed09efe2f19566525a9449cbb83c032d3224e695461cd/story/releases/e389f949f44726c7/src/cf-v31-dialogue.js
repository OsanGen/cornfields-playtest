// One canonical caption cursor. Optional local speech and readable timed playback
// never grant physical action cues; the route still owns action-gated progression.
const clone = x => x == null ? x : JSON.parse(JSON.stringify(x));
export function createV31Dialogue({lines,onCue=()=>{},voice=null,mode='manual',voiceAssets={},muted=()=>false,timing={}}={}) {
  if(!lines)throw new Error('Canonical line registry required');
  if(!['manual','auto'].includes(mode))throw new Error('Unknown dialogue mode');
  const positive=(n,fallback)=>Number.isFinite(n)&&n>0?n:fallback;
  const minimum=positive(timing.minimumSeconds,2),rate=positive(timing.wordsPerSecond,2.6),padding=Number.isFinite(timing.paddingSeconds)&&timing.paddingSeconds>=0?timing.paddingSeconds:.8;
  let ids=[],token=null,index=0,page=0,paused=false,generation=0,handle=null;
  let visible=false,started=false,completed=false,granted=new Set(),pageElapsed=0,lineElapsed=0,silentDelivery=false;
  let voiceState='none',voiceFinished=false,voiceFinishedNaturally=false,voiceDuration=0,voiceRequestedAt=0,voiceStartedAt=0,voiceOffset=0;
  let pendingSpeechOffset=null;
  let heardOffset=0,emitting=null,requireReadingTime=false;
  const pendingGrace=positive(timing.pendingGraceSeconds,8),recordingClock=timing.recordingClock===true;
  const line=()=>lines[ids[index]],pages=()=>line()?.pages||[line()?.text||''];
  function emit(phase){
    const event={...clone(token),cueId:`line:${ids[index]}:${phase}`};
    const last=emitting;
    emitting=event;
    try{onCue(event);}finally{emitting=last;}
  }
  const isMuted=()=>typeof muted==='function'?!!muted():!!muted;
  let lastMute=isMuted();
  const pageSeconds=()=>Math.max(minimum,(pages()[page].trim().match(/\S+/g)||[]).length/rate+padding);
  function stopVoice(preservePendingOffset=false,keepPreload=false){if(!preservePendingOffset||voiceState!=='pending')pendingSpeechOffset=null;generation++;const h=handle;handle=null;voiceState='none';voiceFinished=false;voiceFinishedNaturally=false;voiceDuration=0;try{h?.stop?.();}catch(_){/* Attempt independent provider cleanup below. */}try{voice?.stop?.({keepPreload});}catch(_){/* Local captions remain available. */}}
  function playVoice(){
    if(silentDelivery)return;
    const l=line(),entry=voiceAssets[l?.line_id]||l?.optional_voice_asset,asset=typeof entry==='string'?entry:entry?.asset;
    if(!asset||!voice?.play||paused||isMuted())return;
    // Loading ages captions but does not play speech. Only a paused pending
    // request retains this offset; successful handles own their playback clock.
    const gen=generation,own=token,id=l.line_id,offsetSeconds=pendingSpeechOffset??(recordingClock?heardOffset:lineElapsed);voiceState='pending';voiceRequestedAt=lineElapsed;pendingSpeechOffset=offsetSeconds;
    voiceDuration=positive(typeof entry==='object'?entry.duration:0,0);
    try{
      const playback=voice.play({asset,token:clone(token),lineId:id,text:l.text,offsetSeconds});
      Promise.resolve(playback).then(h=>{
        if(gen!==generation||own!==token||id!==line()?.line_id||paused){h?.stop?.();return;}
        pendingSpeechOffset=null;handle=h;voiceState=h?'playing':'failed';voiceDuration=positive(h?.durationSeconds,voiceDuration);voiceStartedAt=lineElapsed;voiceOffset=offsetSeconds;
        const finished=h?.finishedPromise||h?.finished;
        if(finished&&typeof finished.then==='function')Promise.resolve(finished).then(result=>{if(gen===generation&&own===token&&id===line()?.line_id){voiceFinished=true;voiceFinishedNaturally=!['stopped','failed'].includes(result?.reason);voiceState='finished';}},()=>{if(gen===generation&&own===token&&id===line()?.line_id)voiceState='failed';});
      },()=>{if(gen===generation&&own===token&&id===line()?.line_id){pendingSpeechOffset=null;voiceState='failed';}});
    }catch(_){pendingSpeechOffset=null;voiceState='failed';}
  }
  function eligible(){const trigger=line()?.trigger;return !trigger||['ENTRY','PREVIOUS_CUE_COMPLETE'].includes(trigger)||granted.has(trigger);}
  function reveal(){
    if(!token||paused||completed||visible||!eligible())return;
    visible=true;
    if(!started){started=true;const own=token,id=line()?.line_id;emit('start');if(own===token&&id===line()?.line_id&&!paused)playVoice();}
  }
  function start({lineIds,token:nextToken,silent=false,keepPreload=false}={}){
    if(!Array.isArray(lineIds)||!nextToken)throw new Error('Line IDs and entry token required');
    for(const id of lineIds){const l=lines[id];if(!l||l.line_id!==id||typeof l.text!=='string')throw new Error(`Unknown canonical line: ${id}`);if(l.pages&&(!Array.isArray(l.pages)||l.pages.some(p=>typeof p!=='string')||l.pages.join('')!==l.text))throw new Error(`Pages must preserve exact text: ${id}`);}
    const keepPaused=paused;stop(keepPreload);paused=keepPaused;ids=[...lineIds];token=Object.freeze(clone(nextToken));completed=!ids.length;silentDelivery=silent===true;reveal();
  }
  function advance(){
    if(!token||paused||completed||!visible)return false;
    if(page+1<pages().length){page++;pageElapsed=0;return true;}
    const completedId=ids[index],own=token;stopVoice(false,true);visible=false;emit('complete');
    if(token!==own)return true; // A callback may reset/reenter; never resurrect it.
    granted.add(`line:${completedId}:complete`);granted.add(`AFTER_${completedId.split('-').at(-1)}`);
    index++;page=0;pageElapsed=0;lineElapsed=0;heardOffset=0;requireReadingTime=false;started=false;visible=false;
    if(index>=ids.length)completed=true;else reveal();return true;
  }
  function cue(id){if(!token)return false;granted.add(id);reveal();return true;}
  function pause(){if(paused)return;paused=true;try{if(handle?.pause)handle.pause();else stopVoice(true);}catch(_){stopVoice();}}
  function resume(){if(!paused)return;paused=false;try{if(handle?.resume)handle.resume();else if(started&&visible&&!completed)playVoice();}catch(_){stopVoice();}reveal();}
  function stop(keepPreload=false){stopVoice(false,keepPreload);ids=[];token=null;index=0;page=0;paused=false;visible=false;started=false;completed=false;granted=new Set();pageElapsed=0;lineElapsed=0;heardOffset=0;requireReadingTime=false;}
  function setMode(next){
    if(!['manual','auto'].includes(next))throw new Error('Unknown dialogue mode');
    if(mode===next)return;
    requireReadingTime=next==='auto'&&visible;
    mode=next;pageElapsed=0;
  }
  // Settings synchronization releases speech without revealing or advancing captions.
  function syncMute(){
    const silent=isMuted(),unmuted=lastMute&&!silent;
    lastMute=silent;
    if(silent&&(handle||voiceState==='pending'||pendingSpeechOffset!==null)){
      const position=handle?.playbackFrame?.()?.offsetSeconds;
      if(Number.isFinite(position))heardOffset=position;
      else if(voiceFinishedNaturally)heardOffset=voiceDuration;
      stopVoice();
    }
    else if(unmuted&&started&&visible&&!paused&&!completed&&voiceState==='none')playVoice();
  }
  function tick(dt){
    if(!Number.isFinite(dt)||dt<0)return;
    syncMute();
    if(paused)return;reveal();if(mode!=='auto'||!visible||completed||!token)return;
    pageElapsed+=dt;lineElapsed+=dt;
    const entry=voiceAssets[line()?.line_id]||line()?.optional_voice_asset;
    // Only opted-in single-page recordings own their natural scene pacing.
    // Silent/manual and multi-page captions retain their readable clock.
    if(!requireReadingTime&&entry?.timing==='recorded'&&pages().length===1&&voiceFinished&&voiceFinishedNaturally&&!isMuted()){advance();return;}
    if(pageElapsed<pageSeconds())return;
    if(page+1===pages().length&&voiceState==='pending'&&!isMuted()){
      // Give a real local fetch/decode a bounded chance before a silent fallback.
      // Invalidating its generation ensures a late handle cannot start old audio.
      if(lineElapsed-voiceRequestedAt<pendingGrace)return;
      stopVoice();
    }
    if(page+1===pages().length&&voiceState==='playing'&&!voiceFinished&&!isMuted()){
      // Prefer the actual completion event. A valid decoded clip duration is a
      // bounded local-audio fallback if its completion callback is unavailable.
      // Loading cannot spend the recording's watchdog. lineElapsed freezes on
      // pause; the successful handle and its requested offset start this clock.
      if(!voiceDuration||voiceOffset+lineElapsed-voiceStartedAt<voiceDuration+.5)return;
    }
    advance();
  }
  function frame(){const l=line();return {token:clone(token),lineId:l?.line_id||null,text:visible?pages()[page]:'',speaker:visible?l.speaker:null,pageIndex:page,pageCount:l?pages().length:0,complete:completed,waiting:!!token&&!completed&&!visible,paused,mode,elapsedSeconds:lineElapsed,durationSeconds:voiceDuration,speaking:voiceState==='playing'&&!paused&&!isMuted()};}
  return Object.freeze({start,tick,advance,cue,pause,resume,frame,stop,setMode,syncMute,ownsCue:event=>event===emitting});
}
