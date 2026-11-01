import {createLoadGate} from './load-gate.js';
export function hallValidationOptions(doc){
  const meta=name=>doc?.querySelector?.('meta[name="'+name+'"]')?.getAttribute('content');
  return {baseline:!(meta('cornfields-development')==='true'&&meta('cornfields-build')==='fixture:development')};
}
/** Development diagnostics preserve useful context without private paths or URL queries. */
export function hallDiagnostic(error,stage){
  const raw=String(error?.message||error||'Unknown error');
  const message=raw.replace(/https?:\/\/[^\s]+/g,'[url]').replace(/\/(?:Users|Volumes|workspace|tmp)\/[^\r\n]*/g,'[path]').replace(/(token|password|secret|authorization)\s*[=:]\s*[^\s,;]+/gi,'$1=[redacted]').slice(0,320);
  return Object.freeze({stage,name:String(error?.name||'Error').slice(0,64),message});
}

export function createHallBrowserSession({doc=globalThis.document,win=globalThis.window,options={},createRuntime,loadData,createUI,THREE}={}){
  const canvas=doc.getElementById('view');const ui=createUI(doc,{quickplay:options.quickplay===true,gameplay:options.gameplay===true});const validation=hallValidationOptions(doc),gate=createLoadGate();let runtime=null,renderer=null,frame=0,last=0,dead=false,suspended=false,captureEpoch=0,pendingCapture=null,activeCapture=null,savedProgress=null;const cleanups=[];let diagnostic=null;
  const captureTimeoutMs=Number.isFinite(options.captureTimeoutMs)?Math.max(1,Math.min(30000,options.captureTimeoutMs)):5000;
  const schedule=win.setTimeout?.bind(win)||globalThis.setTimeout,cancelTimer=win.clearTimeout?.bind(win)||globalThis.clearTimeout;
  function on(target,type,fn){target.addEventListener(type,fn);cleanups.push(()=>target.removeEventListener(type,fn));}
  function release(){if(doc.pointerLockElement===canvas)doc.exitPointerLock?.();}
  function cancelCapture(){captureEpoch++;pendingCapture?.finish();activeCapture=null;}
  function contextReady(){return !dead&&!suspended&&!doc.hidden&&doc.hasFocus?.()!==false;}
  function activeCaptureValid(){return contextReady()&&activeCapture===captureEpoch&&runtime?.input.active;}
  function rejectStaleLock(){if(doc.pointerLockElement===canvas&&!activeCaptureValid()&&!pendingCapture?.valid())release();}
  function pause(panel='pause'){cancelCapture();runtime?.pause();release();ui.show(panel);invalidate();}
  function stopCurrent(){if(runtime)savedProgress=runtime.progress.snapshot();cancelCapture();release();win.cancelAnimationFrame(frame);frame=0;runtime?.dispose();runtime=null;renderer?.dispose();renderer=null;last=0;}
  function fail(error,stage='unknown'){diagnostic=hallDiagnostic(error,stage);stopCurrent();release();ui.show('error',options.debug?diagnostic:null);try{options.onDiagnostic?.(diagnostic);}catch{/* Diagnostics never own the session. */}}
  async function load(){const token=gate.begin();if(token===null)return;stopCurrent();ui.show('loading');try{const {layout,routes}=await loadData(options.fetcher??globalThis.fetch,validation);let gameplayConfig=null;if(options.gameplay){const response=await (options.fetcher??globalThis.fetch)(new URL('../data/enemy-loop.json',import.meta.url));if(!response.ok)throw new Error('Gameplay configuration unavailable');gameplayConfig=await response.json();}if(!gate.current(token))return;runtime=createRuntime(layout,routes,{document:doc,entry:options.entry,quickplay:options.quickplay,gameplay:options.gameplay,gameplayConfig,progressSnapshot:savedProgress,...validation});options.prepareRuntime?.(runtime);if(options.entry)ui.entry(options.entry);renderer=options.makeRenderer?options.makeRenderer(canvas):new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(win.devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;const candidate=runtime;await candidate.gameplay?.attachVisuals(renderer);if(!gate.current(token)||candidate!==runtime)return;resize();ui.apply(runtime);ui.show('start');last=0;if(!suspended)invalidate();}catch(error){if(gate.current(token))fail(error,'load');}}
  function invalidate(){if(!dead&&!suspended&&runtime&&renderer&&!frame)frame=win.requestAnimationFrame(tick);}
  function resize(){if(!renderer||!runtime)return;const w=Math.max(1,win.innerWidth),h=Math.max(1,win.innerHeight);renderer.setSize(w,h,false);runtime.player.camera.aspect=w/h;runtime.player.camera.updateProjectionMatrix();invalidate();}
  function tick(now){frame=0;if(dead||suspended||!runtime||!renderer)return;try{const dt=last?Math.max(0,(now-last)/1000):0;last=now;runtime.update(dt);if(runtime.gameplay?.combat.dead&&!ui.isBlocking())pause('dead');ui.update(runtime);if(runtime.gameplay)runtime.gameplay.render(renderer);else renderer.render(runtime.world.scene,runtime.player.camera);if(runtime.input.active)invalidate();}catch(error){fail(error,'render');}}
  async function capture(){
    if(!runtime||dead||suspended||pendingCapture)return;
    const token=++captureEpoch,candidate=runtime;
    let timer=null,settled=false;
    const lease={token,valid:()=>!settled&&pendingCapture===lease&&candidate===runtime&&token===captureEpoch&&contextReady(),
      finish(){if(settled)return;settled=true;if(timer!==null)cancelTimer(timer);timer=null;if(pendingCapture===lease)pendingCapture=null;}};
    pendingCapture=lease;
    timer=schedule(()=>{if(lease.valid())pause('pointer');else lease.finish();},captureTimeoutMs);
    try{
      if(!canvas.requestPointerLock)throw new Error('Pointer lock unavailable');
      await canvas.requestPointerLock();
      if(lease.valid()&&doc.pointerLockElement===canvas)acceptCapture(lease);
      else if(!lease.valid()){lease.finish();rejectStaleLock();}
    }catch{const current=lease.valid();lease.finish();if(current)pause('pointer');else rejectStaleLock();}
  }
  function acceptCapture(lease){if(!lease?.valid())return false;activeCapture=lease.token;lease.finish();runtime.resume();last=0;ui.show(null);invalidate();return true;}
  ui.bind({resume:()=>{if(runtime?.gameplay?.combat.dead)runtime.retryRun();capture();},help:()=>pause('help'),pause:()=>pause(),safeReturn:()=>{runtime?.safeReturn();pause();},reset:()=>{runtime?.reset();pause('start');},retry:load,settings:()=>{if(runtime){ui.apply(runtime);invalidate();}}});
  on(canvas,'click',()=>{if(runtime&&!runtime.input.active&&!runtime.gameplay?.combat.dead)capture();});
  on(canvas,'mousedown',event=>{if(event.button===0&&doc.pointerLockElement===canvas&&runtime?.input.active)runtime.gameplay?.fire();});
  on(doc,'pointerlockchange',()=>{if(doc.pointerLockElement===canvas){if(acceptCapture(pendingCapture)||activeCaptureValid())return;release();}else{cancelCapture();if(runtime){runtime.pause();if(!ui.isBlocking())ui.show('pause');}}});
  on(doc,'pointerlockerror',()=>{if(pendingCapture||!activeCaptureValid())pause('pointer');});
  on(win,'keydown',event=>{if(event.code==='Escape'&&runtime?.input.active){event.preventDefault();pause();return;}if(event.code==='Tab'&&runtime?.input.active){event.preventDefault();pause('help');return;}if(!runtime?.input.active||/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(event.target?.tagName??''))return;if(['KeyW','KeyA','KeyS','KeyD','ShiftLeft','ShiftRight','KeyE','KeyR','KeyF','Space'].includes(event.code)){event.preventDefault();runtime.key(event.code,event.repeat);}});
  on(win,'keyup',e=>runtime?.input.up(e.code));on(win,'mousemove',e=>{if(runtime?.input.active&&!runtime.transition.active)runtime.player.look(e.movementX,e.movementY);});
  on(win,'blur',()=>{if(runtime)pause();});on(doc,'visibilitychange',()=>{if(doc.hidden&&runtime)pause();});on(win,'resize',resize);
  on(canvas,'webglcontextlost',e=>{e.preventDefault();fail(new Error('Graphics context was lost'),'context');});
  function dispose(){if(dead)return;dead=true;gate.close();release();stopCurrent();cleanups.splice(0).forEach(fn=>fn());ui.dispose();}
  on(win,'pagehide',event=>{if(event.persisted){suspended=true;pause();win.cancelAnimationFrame(frame);frame=0;}else dispose();});on(win,'pageshow',event=>{if(event.persisted&&!dead){suspended=false;last=0;if(runtime&&renderer&&!frame){ui.show('pause');invalidate();}}});load();return {dispose,load,invalidate,get runtime(){return runtime;},get diagnostic(){return diagnostic;}};
}
