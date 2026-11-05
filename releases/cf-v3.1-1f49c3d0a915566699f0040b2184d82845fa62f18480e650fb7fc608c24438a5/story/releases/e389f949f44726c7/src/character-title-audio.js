import {runCleanups} from '../../../../shared/runtime/resource-scope.js';

// Optional one-shot cue on the existing master bus. No fetch, context or story clock.
export function createCharacterTitleAudio(audio) {
  const consumed=new Set();let current=null,disposed=false;
  function release(item){
    if(!item||item.released)return;item.released=true;if(current===item)current=null;
    runCleanups([...item.sources.map(source=>()=>{source.onended=null;}),
      ...item.sources.map(source=>()=>source.stop()),...item.nodes.map(node=>()=>node.disconnect())]);
  }
  function stop(){release(current);}
  function available(){return !audio.disposed&&audio.ctx?.state==='running'&&audio.lifecycle?.active&&audio.master&&audio.noise&&!audio.muted&&Number.isFinite(audio.volume)&&audio.volume>0;}
  function sync(value){
    if(disposed)return false;const frame=value||{},key=typeof frame.key==='string'&&frame.key?frame.key:null;
    if(current&&current.key!==key)stop();
    if(frame.kind!=='character'||!key||frame.visible!==true||frame.active!==true||frame.ready!==true){stop();return false;}
    const duration=Number.isFinite(frame.duration)?Math.min(2,Math.max(0,frame.duration)):2;
    const remaining=Number.isFinite(frame.elapsed)&&frame.elapsed>=0?duration-frame.elapsed:0;
    if(consumed.has(key)){
      if(!available()||frame.enabled===false||remaining<=0||(frame.quiet&&current&&!current.quiet))stop();
      if(current){
        const time=audio.ctx.currentTime,end=time+remaining;
        // Millisecond drift must not erase the attack or trigger an early fade.
        if(end<current.end-.03){
          try{
            const fadeAt=Math.max(time,end-Math.min(.08,remaining/2));
            for(const {node,peak} of current.gains){
              const level=peak*Math.max(0,Math.min((fadeAt-current.started)/current.attack,(current.end-fadeAt)/(current.length-current.attack)));
              node.gain.cancelScheduledValues(fadeAt);node.gain.setValueAtTime(level,fadeAt);node.gain.linearRampToValueAtTime(0,end);
            }
            for(const source of current.sources)source.stop(end);current.end=end;
          }catch{stop();}
        }
      }
      return !!current;
    }
    consumed.add(key);
    if(!available()||frame.enabled===false||remaining<.12){stop();return false;}
    const ctx=audio.ctx,time=ctx.currentTime;if(!Number.isFinite(time))return false;
    const length=Math.min(1.4,remaining),quiet=!!frame.quiet;
    const item={key,quiet,started:time,end:time+length,length,attack:length*.24,nodes:[],sources:[],gains:[],released:false};current=item;
    const own=node=>{item.nodes.push(node);return node;};
    const source=node=>{own(node);item.sources.push(node);return node;};
    const envelope=peak=>{const node=own(ctx.createGain());peak*=quiet?.35:1;item.gains.push({node,peak});node.gain.setValueAtTime(0,time);node.gain.linearRampToValueAtTime(peak,time+item.attack);node.gain.linearRampToValueAtTime(0,item.end);return node;};
    try{
      const noise=source(ctx.createBufferSource()),filter=own(ctx.createBiquadFilter()),gain=envelope(.08);
      noise.buffer=audio.noise;noise.loop=false;filter.type='lowpass';filter.frequency.value=quiet?450:700;noise.connect(filter).connect(gain).connect(audio.master);
      const pulse=source(ctx.createOscillator()),level=envelope(.045);pulse.type='sine';pulse.frequency.setValueAtTime(72,time);pulse.frequency.exponentialRampToValueAtTime(36,item.end);pulse.connect(level).connect(audio.master);
      for(const node of item.sources)node.onended=()=>release(item);
      for(const node of item.sources){
        if(disposed||current!==item||item.released){release(item);return false;}
        node.start(time);
        if(disposed||current!==item||item.released){release(item);return false;}
        node.stop(item.end);
      }
      return current===item;
    }catch{release(item);return false;}
  }
  return Object.freeze({sync,stop,reset:stop,
    dispose(){if(disposed)return;disposed=true;stop();consumed.clear();},
    diagnostics:()=>({disposed,playing:!!current,key:current?.key||null,consumed:consumed.size}),
  });
}
