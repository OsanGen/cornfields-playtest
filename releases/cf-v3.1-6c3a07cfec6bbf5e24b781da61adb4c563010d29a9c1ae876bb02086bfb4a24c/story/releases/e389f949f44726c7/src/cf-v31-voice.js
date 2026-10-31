// Local recordings only. Captions/dialogue retain progression authority.
import {decodeLocalSample} from './sample-transport.js';
export function createV31Voice(audio,{manifest={},fetcher=globalThis.fetch,baseURL=new URL('../assets/',import.meta.url),cacheLimit=4,isMuted=()=>!!audio.muted}={}) {
  const allowed=new Map();
  for(const [id,entry] of Object.entries(manifest)) {
    const asset=entry?.asset;
    if(typeof asset!=='string'||!/^audio\/[A-Za-z0-9_./-]+$/.test(asset)||asset.split('/').some(part=>!part||part==='.'||part==='..'))throw new Error(`Invalid local voice asset: ${id}`);
    allowed.set(id,Object.freeze({...entry}));
  }
  const limit=Math.max(1,Math.min(6,Number.isInteger(cacheLimit)?cacheLimit:4)),cache=new Map(),pending=new Map();
  let generation=0,disposed=false,active=null,lastPlayback=null;
  const stale=()=>new Error('Local voice playback cancelled');
  function remember(asset,buffer){cache.delete(asset);cache.set(asset,buffer);while(cache.size>limit)cache.delete(cache.keys().next().value);return buffer;}
  async function load(asset,epoch){
    if(cache.has(asset)){const b=cache.get(asset);remember(asset,b);return b;}
    if(pending.has(asset))return pending.get(asset).promise;
    const controller=new AbortController(),ctx=audio.ctx;
    const request={controller,promise:null};
    request.promise=(async()=>{
      const buffer=await decodeLocalSample({url:new URL(asset,baseURL).href,context:ctx,fetcher,signal:controller.signal});
      if(disposed||epoch!==generation||controller.signal.aborted)throw stale();
      return remember(asset,buffer);
    })().finally(()=>{if(pending.get(asset)===request)pending.delete(asset);});
    pending.set(asset,request);return request.promise;
  }
  function stop(){generation++;active?.stop();active=null;lastPlayback=null;for(const p of pending.values())p.controller.abort();pending.clear();}
  async function play({asset,lineId,token,offsetSeconds=0}={}){
    stop();const epoch=generation,entry=allowed.get(lineId),ctx=audio.ctx;
    if(disposed)throw new Error('Local voice adapter disposed');
    if(!entry||entry.asset!==asset)throw new Error(`Recording is not in local voice manifest: ${lineId}`);
    if(!ctx||!audio.master||isMuted())throw new Error('Local voice audio unavailable or muted');
    const buffer=await load(asset,epoch);
    if(disposed||epoch!==generation||isMuted())throw stale();
    let source=null,filter=null,offset=Math.max(0,Math.min(buffer.duration,Number(offsetSeconds)||0)),startedAt=0,done=false,resolveFinished;
    const finishedPromise=new Promise(resolve=>{resolveFinished=resolve;});
    const finish=reason=>{if(done)return;done=true;lastPlayback={lineId,offsetSeconds:offset,durationSeconds:buffer.duration,playing:false};resolveFinished({reason,lineId,token});if(active===handle)active=null;};
    function disconnectFilter(){const old=filter;filter=null;old?.disconnect?.();}
    function detach(){const old=source;source=null;if(old){old.onended=null;try{old.stop();}catch(_){}old.disconnect?.();}disconnectFilter();}
    function start(){
      if(done||disposed||epoch!==generation)return;
      if(isMuted()){handle.stop();return;}
      if(offset>=buffer.duration){finish('ended');return;}
      if(entry.channel==='radio'){
        if(typeof ctx.createBiquadFilter!=='function'){finish('failed');throw new Error('Local radio voice filter unavailable');}
        // Same dispatch coloration as the existing prologue audio path.
        filter=ctx.createBiquadFilter();filter.type='bandpass';filter.frequency.value=1700;filter.Q.value=.65;
      }
      source=ctx.createBufferSource();source.buffer=buffer;
      if(filter){source.connect(filter);filter.connect(audio.master);}else source.connect(audio.master);
      startedAt=ctx.currentTime;
      const own=source;source.onended=()=>{if(source!==own||done)return;source=null;own.disconnect?.();disconnectFilter();offset=buffer.duration;finish('ended');};
      source.start(0,offset);
    }
    const handle={finishedPromise,durationSeconds:buffer.duration,lineId,
      playbackFrame(){return {lineId,offsetSeconds:Math.min(buffer.duration,offset+(source?Math.max(0,ctx.currentTime-startedAt):0)),durationSeconds:buffer.duration,playing:!!source&&!done};},
      stop(){if(done)return;detach();finish('stopped');},
      pause(){if(done||!source)return;offset=Math.min(buffer.duration,offset+Math.max(0,ctx.currentTime-startedAt));detach();},
      resume(){if(!done&&!source)start();}
    };
    active=handle;start();return handle;
  }
  async function prefetch(lineIds=[]){
    if(disposed||!audio.ctx)return [];
    const epoch=generation;
    return Promise.allSettled(lineIds.slice(0,2).map(id=>{const entry=allowed.get(id);return entry?load(entry.asset,epoch):Promise.reject(new Error(`Unknown local recording: ${id}`));}));
  }
  return Object.freeze({play,stop,prefetch,playbackFrame(lineId){
    if(typeof lineId!=='string'||!lineId)return null;
    return active&&active.lineId===lineId?active.playbackFrame():lastPlayback&&lastPlayback.lineId===lineId?{...lastPlayback}:null;
  },dispose(){if(disposed)return;stop();disposed=true;cache.clear();},diagnostics:()=>({cachedAssets:[...cache.keys()],pending:pending.size,active:!!active,disposed,cacheLimit:limit})});
}

// Canonical dialogue enters the existing performance sampler with its complete
// legacy contract. Actual recording time owns face articulation when available.
export function v31PerformanceLine(dialogue,frameTime,manifest={},playback=null){
  if(!dialogue?.lineId||!dialogue.text)return null;
  const entry=manifest[dialogue.lineId],time=Number.isFinite(frameTime)?frameTime:0;
  const offset=Number.isFinite(playback?.offsetSeconds)?Math.max(0,playback.offsetSeconds):Number.isFinite(dialogue.elapsedSeconds)?Math.max(0,dialogue.elapsedSeconds):0;
  const duration=Number.isFinite(playback?.durationSeconds)&&playback.durationSeconds>0?playback.durationSeconds:Number.isFinite(entry?.duration)&&entry.duration>0?entry.duration:Math.max(2,dialogue.text.trim().split(/\s+/).length/2.6+.8);
  const role=String(dialogue.speaker||'').toUpperCase(),voice=role.startsWith('STANLEY')?'stanley':role.includes('CLARENCE')?'clarence':role.toLowerCase();
  return {id:dialogue.lineId,speaker:dialogue.speaker,text:dialogue.text,voice,start:time-offset,end:time-offset+duration,offsetSeconds:offset,playing:playback?.playing??!!dialogue.speaking};
}
