import {createStory} from './asylum-story.js';
import {createStoryView} from './asylum-story-view.js';
import {createStoryAudio} from './asylum-story-audio.js';
import {createStoryUI} from './asylum-story-ui.js';
import {entryRecord} from './asylum-handoff.js';
/** Testable one-session owner, independent of DOM and WebGL. */
export function createSessionGate(){let generation=0,closed=false,current=null;return {begin(){if(closed)throw new Error('Session disposed');generation++;current?.dispose();current=null;return generation;},accept(token,value){if(closed||token!==generation){value?.dispose();return false;}current=value;return true;},get current(){return current;},get generation(){return generation;},dispose(){if(closed)return;closed=true;generation++;current?.dispose();current=null;}};}
export function createStoryApp({canvas,renderer,document=globalThis.document,window=globalThis.window,makeView=createStoryView,makeAudio=createStoryAudio,enterHall=null,profile='asylum-intro-v0.1',initialComfort=null,requestFrame=cb=>window.requestAnimationFrame(cb),cancelFrame=id=>window.cancelAnimationFrame(id)}={}){
 const ui=createStoryUI(document,{connected:typeof enterHall==='function'}),gate=createSessionGate(),keys=new Set(),listeners=[];
 let story=createStory({profile}),view=null,audio=null,status='idle',error='',disposed=false,raf=null,last=null,boot=false,wantsStart=false,silent=false,yaw=0,pitch=0,drag=false;
 if(initialComfort){for(const k of ['master','voice','effects'])document.getElementById(k).value=String(initialComfort[k]);document.getElementById('reduced').checked=initialComfort.reducedMotion;}
 const on=(target,event,fn,options)=>{target.addEventListener(event,fn,options);listeners.push(()=>target.removeEventListener(event,fn,options));};
 const clear=()=>{keys.clear();drag=false;};
 function pause(){wantsStart=false;story.pause();audio?.pause();clear();if(document.pointerLockElement===canvas)document.exitPointerLock();}
 function fail(e){if(disposed)return;error=e?.message||String(e);status='error';pause();}
 async function load(){
  const token=gate.begin();boot=false;clear();last=null;status='loading';error='';story.dispose();audio=null;view=null;
  let localView=null,localAudio=null;
  const session={dispose(){localView?.dispose();localAudio?.dispose();}};
  if(!gate.accept(token,session))return;
  try{
   story=createStory({profile,onCue:id=>audio?.cue(id)});story.setComfort(ui.settings());localAudio=makeAudio();audio=localAudio;localView=makeView(renderer);view=localView;
   const [,sound]=await Promise.all([localView.ready,localAudio.prepare()]);if(disposed||gate.generation!==token)return;silent=!!sound?.silent;boot=true;if(!wantsStart||document.hidden)status='loaded';
  }catch(e){if(!disposed&&gate.generation===token){session.dispose();view=null;audio=null;fail(e);}}
 }
 async function start(){wantsStart=true;if(status==='idle'||status==='error')await load();else if(story.phase==='paused'){const token=gate.generation,sessionStory=story,sessionAudio=audio;try{await sessionAudio?.prepare();if(!disposed&&gate.generation===token&&story===sessionStory&&wantsStart&&!document.hidden){story.resume();sessionAudio?.sync(story.frame());}}catch(e){if(!disposed&&gate.generation===token)fail(e);}}}
 function action(id){
  if(disposed)return;
  if(id==='start'||id==='retry'){void start();return;}
  if(id==='pause'){pause();return;}
  if(id==='resume'){void start();return;}
  if(id==='replay'){wantsStart=true;yaw=pitch=0;void load();return;}
  if(status!=='ready')return;
  clear();audio?.pause();
  if(id==='scene')story.skipScene();if(id==='skip')story.skipIntroduction();if(id==='stand')keys.add('KeyE');if(id==='hall'){
   if(story.frame().scene!=='boundary')return;
   try{if(typeof enterHall==='function')enterHall({...entryRecord(story.snapshot()),routeId:profile==='original-level-two'?'original-level-two':'asylum-intro-v0.1'},{shutdown:dispose});else ui.notice(story.hall().message);}catch(e){ui.notice(e?.message||'Hall connection failed. Try again.',story.frame().scene);}
  }
 }
 on(document,'click',e=>{const b=e.target.closest?.('[data-action]');if(b)action(b.dataset.action);});
 on(document,'change',e=>{if(['master','voice','effects','reduced'].includes(e.target.id)){const c=ui.settings();story.setComfort(c);audio?.setComfort(c);}});
 on(window,'keydown',e=>{if(e.target?.matches?.('input,textarea,button,summary')&&e.code!=='Escape')return;if(e.code==='Escape'){pause();return;}if(['KeyW','KeyA','KeyS','KeyD','KeyE','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();if(!e.repeat)keys.add(e.code);}});
 on(window,'keyup',e=>keys.delete(e.code));on(window,'blur',pause);on(document,'visibilitychange',()=>{if(document.hidden)pause();});on(document,'pointerlockchange',()=>{if(document.pointerLockElement!==canvas&&status==='ready')pause();});
 on(canvas,'click',()=>{if(story.phase==='playing'&&document.pointerLockElement!==canvas){Promise.resolve(canvas.requestPointerLock?.()).catch(()=>ui.notice('Mouse capture unavailable. Drag the scene to look.'));}});
 on(canvas,'pointerdown',e=>{drag=true;canvas.setPointerCapture?.(e.pointerId);});on(window,'pointerup',()=>{drag=false;keys.delete('KeyE');});
 on(window,'pointermove',e=>{if(story.phase!=='playing'||!(drag||document.pointerLockElement===canvas))return;yaw-=Math.max(-120,Math.min(120,e.movementX||0))*.002;pitch=Math.max(-1.15,Math.min(1.15,pitch-(e.movementY||0)*.002));});
 for(const b of document.querySelectorAll('[data-move]')){const key={forward:'KeyW',back:'KeyS',left:'KeyA',right:'KeyD'}[b.dataset.move];on(b,'pointerdown',e=>{e.preventDefault();keys.add(key);b.setPointerCapture?.(e.pointerId);});for(const event of ['pointerup','pointercancel','lostpointercapture'])on(b,event,()=>keys.delete(key));}
 on(canvas,'webglcontextlost',e=>{e.preventDefault();fail(new Error('Graphics context was lost. Retry loading to start again safely.'));});
 function resize(){renderer.setPixelRatio(Math.min(1.5,window.devicePixelRatio||1));renderer.setSize(Math.max(1,canvas.clientWidth),Math.max(1,canvas.clientHeight),false);}on(window,'resize',resize);resize();
 function frame(at){
  if(disposed)return;try{
   const dt=last===null?0:Math.min(.1,Math.max(0,(at-last)/1000));last=at;
   if(view?.stats.status==='ready'&&!error){view.render(story.frame());if(boot&&wantsStart&&story.phase==='preflight'&&!document.hidden&&view.criticalStatus(profile)){story.begin();audio.setComfort(story.snapshot().comfort);status='ready';}}
   if(status==='ready'&&!error){story.tick(dt,{forward:Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown')),strafe:Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft')),interact:keys.has('KeyE'),yaw,pitch});if(story.frame().scene!=='hospital_stand')keys.delete('KeyE');audio.sync(story.frame());}
   ui.render(story.frame(),{status,error,silent});
  }catch(e){fail(e);ui.render(story.frame(),{status,error,silent});}raf=requestFrame(frame);
 }
 raf=requestFrame(frame);
 function dispose(){if(disposed)return;disposed=true;wantsStart=false;audio?.pause();if(document.pointerLockElement===canvas)document.exitPointerLock?.();if(raf!==null)cancelFrame(raf);raf=null;for(const off of listeners.splice(0))off();clear();gate.dispose();story.dispose();ui.dispose();renderer.dispose();}
 return {start,pause,action,snapshot:()=>({...story.snapshot(),status,error,loops:raf===null?0:1,listeners:listeners.length,generation:gate.generation}),dispose};
}
