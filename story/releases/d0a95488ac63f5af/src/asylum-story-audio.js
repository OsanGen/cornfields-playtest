import {FieldAudio} from './audio.js';
import {RETAINED_LINES} from './asylum-story-script.js';
import {prologueRadioOffTime} from './prologue-performance.js';
const allowed=new Set(RETAINED_LINES.filter(l=>l.audioMode!=='subtitle-only').map(l=>l.id));
export function createStoryAudio({Context=globalThis.AudioContext||globalThis.webkitAudioContext,fetcher=globalThis.fetch}={}){
 let ctx=null,master=null,voiceBus=null,effectBus=null,disposed=false,generation=0,muted=false;
 const titleAudio=new FieldAudio({weatherEnabled:false});let titleActive=false;
 const buffers=new Map(),active=new Map(),controllers=new Set();let comfort={master:.7,voice:1,effects:.7};
 const stop=k=>{const item=active.get(k);if(!item)return;active.delete(k);try{item.source.stop();}catch{}for(const n of item.nodes)n.disconnect();};
 function pause(){for(const k of [...active.keys()])stop(k);titleAudio.stopIntro();titleActive=false;}
 function play(key,buffer,bus,offset=0,{gain=1,filter=null,loop=false}={}){
  if(disposed||muted||!ctx||ctx.state!=='running'||offset>=buffer.duration)return;
  stop(key);const source=ctx.createBufferSource(),level=ctx.createGain(),nodes=[source,level];source.buffer=buffer;source.loop=loop;level.gain.value=gain;source.connect(level);
  if(filter){const f=ctx.createBiquadFilter();f.type=filter;f.frequency.value=1700;f.Q.value=.3;level.connect(f).connect(bus);nodes.push(f);}else level.connect(bus);
  const item={source,level,nodes,offset,started:ctx.currentTime};active.set(key,item);source.onended=()=>{if(active.get(key)===item)active.delete(key);for(const n of nodes)n.disconnect();};source.start(0,Math.max(0,offset));return item;
 }
 async function prepare(){
  if(disposed)throw new Error('Audio disposed');if(!Context)return {silent:true,reason:'Web Audio unavailable; captions remain available'};
  if(!ctx){ctx=new Context();master=ctx.createGain();voiceBus=ctx.createGain();effectBus=ctx.createGain();voiceBus.connect(master);effectBus.connect(master);master.connect(ctx.destination);}
  await ctx.resume();const token=generation;
  const items=[...allowed].map(id=>[id,`prologue/${id}.mp3`]).concat([['music','prologue/entertainment-music.mp3'],['titles','prologue/title-music.mp3'],['shot','pistol-shot.wav'],['distress','distress.wav']]);
  await Promise.all(items.map(async([key,path])=>{if(buffers.has(key))return;const c=new AbortController();controllers.add(c);const timer=setTimeout(()=>c.abort(),8000);try{const response=await fetcher(new URL('../assets/audio/'+path,import.meta.url),{signal:c.signal});if(!response.ok)throw new Error('Required local audio unavailable: '+key);const bytes=await response.arrayBuffer();if(bytes.byteLength>8*1024*1024)throw new Error('Audio bound exceeded');const buffer=await ctx.decodeAudioData(bytes);if(!disposed&&token===generation)buffers.set(key,buffer);}finally{clearTimeout(timer);controllers.delete(c);}}));
  if(disposed||token!==generation)throw new Error('Stale audio initialization');titleAudio.ctx=ctx;titleAudio.master=effectBus;titleAudio.samples={titleMusic:buffers.get('titles'),distress:buffers.get('distress')};if(!titleAudio.noise){titleAudio.noise=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate);const d=titleAudio.noise.getChannelData(0);let last=0,seed=719;for(let i=0;i<d.length;i++){seed=(seed*1664525+1013904223)>>>0;last=(last+(seed/4294967296*2-1)*.045)/1.025;d[i]=last*3;}}setComfort(comfort);return {silent:false};
 }
 function setComfort(v){comfort={...comfort,...v};if(!ctx)return;master.gain.value=comfort.master;voiceBus.gain.value=comfort.voice;effectBus.gain.value=comfort.effects;}
 function sync(frame){if(!ctx||disposed)return;if(frame.phase!=='playing'){pause();return;}
  if(frame.scene==='opening'){
   const f=frame.opening,line=f.line,offset=line?f.time-line.start:0,key=line?.id;
   for(const k of active.keys())if(k.startsWith('voice:')&&k!=='voice:'+key)stop(k);
   if(allowed.has(key)&&buffers.has(key)){
    const item=active.get('voice:'+key),duration=buffers.get(key).duration;if(offset<duration-.03&&(!item||Math.abs(ctx.currentTime-item.started+item.offset-offset)>.2))play('voice:'+key,buffers.get(key),voiceBus,offset,{gain:line.voice==='dispatch'?1.25:1,filter:line.voice==='dispatch'?'bandpass':null});
   }
   const on=f.chapter==='car'&&f.chapterTime<prologueRadioOffTime(f);if(on&&buffers.has('music')){const item=active.get('music');if(!item||Math.abs(ctx.currentTime-item.started+item.offset-f.chapterTime)>.2)play('music',buffers.get('music'),effectBus,f.chapterTime,{gain:line?.id==='CAR-00'?.34:.65,filter:'bandpass'});}else stop('music');const music=active.get('music');if(music)music.level.gain.setTargetAtTime(line?.id==='CAR-00'?.34:.65,ctx.currentTime,.16);
  }else{for(const k of [...active.keys()])if(k.startsWith('voice:')||k==='music')stop(k);}
  if(frame.scene==='titles'){if(!titleActive){titleAudio.startIntro();titleActive=true;}titleAudio.syncIntro(frame.titles);}else if(titleActive){titleAudio.stopIntro();titleActive=false;}
 }
 function cue(id){if(!ctx||disposed)return;if(id==='entertainment_off')stop('music');if(['radio','entertainment_off'].includes(id)){if(muted)return;const t=ctx.currentTime,source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),level=ctx.createGain();source.buffer=titleAudio.noise;filter.type='lowpass';filter.frequency.value=id==='radio'?2100:1400;level.gain.setValueAtTime(0,t);level.gain.linearRampToValueAtTime(id==='entertainment_off'?.10:.28,t+.01);level.gain.exponentialRampToValueAtTime(.001,t+.28);source.connect(filter).connect(level).connect(effectBus);const key='effect:'+id,nodes=[source,filter,level];stop(key);active.set(key,{source,nodes,level,started:t,offset:0});source.onended=()=>{active.delete(key);for(const n of nodes)n.disconnect();};source.start();source.stop(t+.30);return;}if(id.startsWith('title:')){titleAudio.introCue(id.slice(6));return;}if(id==='shot'){if(buffers.has('shot'))play('shot',buffers.get('shot'),effectBus,0,{gain:.45});return;}
  if(!['impact','glass','cuffs_closed','rear_door_open','rear_door_closed','vines_closed'].includes(id))return;
  const duration=id==='vines_closed'?1:.18,buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate),data=buffer.getChannelData(0);let seed=2139;
  for(let i=0;i<data.length;i++){seed=(seed*1664525+1013904223)>>>0;data[i]=((seed/4294967296)*2-1)*Math.exp(-i/data.length*7)*.18;}
  play('effect:'+id,buffer,effectBus,0,{filter:'lowpass',gain:id==='impact'?1:.4});
 }
 return {prepare,sync,cue,pause,setComfort,setMuted(v){muted=!!v;if(muted)pause();},diagnostics:()=>({active:active.size,pending:controllers.size,loaded:[...buffers.keys()],voiceIds:[...allowed],activeKeys:[...active.keys()],musicGain:active.get('music')?.level.gain.value??null,titleActive,titleMusic:titleAudio.titleMusicVoice?{offset:titleAudio.titleMusicVoice.offset,started:titleAudio.titleMusicVoice.started}:null,titleSources:titleAudio.introSources?.size||0,disposed}),dispose(){if(disposed)return;disposed=true;generation++;pause();for(const c of controllers)c.abort();controllers.clear();buffers.clear();master?.disconnect();voiceBus?.disconnect();effectBus?.disconnect();void ctx?.close();}};
}
