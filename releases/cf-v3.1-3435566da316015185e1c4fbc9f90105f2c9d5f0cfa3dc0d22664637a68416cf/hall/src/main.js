import * as THREE from 'three';
import { createHall, validateLayout } from './hall.js';
import { createPlayer, createInput } from './player.js';
import { createProgression, validateRoutes } from './progression.js';
import { createTransition } from './transition.js';
import { createUI } from './ui.js';
import {createGameplay} from './asylum-gameplay.js';

export function createRuntime(layout, routes, options = {}) {
  validateLayout(layout); validateRoutes(routes);
  const world=createHall(layout,options),player=createPlayer(world),input=createInput(),progress=createProgression({quickplay:options.quickplay===true,random:options.random??Math.random,doorIds:layout.mansion.doors.map(d=>d.id)});
  let disposed=false,notice=options.quickplay?'All five doors are locked. Pick up the labelled HALL KEY with E.':'Walk through Brasenhill to find the test latch.',comfort=false;
  const transition=createTransition({canTravel:(a,b)=>progress.canFold(a,b),arrive:to=>player.place(to==='B'?layout.foldBayArrival:layout.foldHallArrival),restore:p=>player.place(p)||player.place(layout.spawn),onError:text=>{notice=text;input.clear();}});
  const runtime={world,player,input,progress,transition,gameplay:null,
    get quickplay(){return options.quickplay===true;},get objective(){return this.quickplay?progress.objective:'';},get storyEntry(){return options.entry??null;},get area(){return world.areaAt(player.state.x,player.state.z);},get notice(){return notice;},get disposed(){return disposed;},get comfort(){return comfort;},
    resume(){if(disposed||this.gameplay?.combat.dead)return false;input.setActive(true);return true;},
    pause(){input.setActive(false);transition.cancel();},
    setComfort(value){comfort=Boolean(value);world.motion.setComfort(comfort);},
    prompt(){if(this.gameplay?.nearAmmo())return this.gameplay.ammoCooldown>0?'AMMO · Ready in '+Math.ceil(this.gameplay.ammoCooldown)+' active seconds':'E · AMMO: refill pistol to six rounds';if(transition.active)return 'Passing through the doorway…';if(this.quickplay){const item=[...world.items.values()].find(i=>i.area===this.area&&!progress.collected(i.id)&&player.near(i));if(item)return 'E · Pick up '+item.label;const interior=world.nearbyDoor(player);if(interior)return 'E · Open '+interior.label;if(progress.completed)return 'LOOP COMPLETE · R return to hall · Esc then Reset run to replay';}if(!this.quickplay&&this.area==='A'&&player.near(layout.latch))return progress.unlocked?'E · Test latch: Pillsbury remains OPEN ◇':'E · Test latch: unlock Pillsbury';if(this.area==='B'&&player.near({...layout.bayReturn,y:1.4}))return 'E · Pillsbury: return to hall';const d=layout.doors.find(d=>player.near({x:d.center[0],z:d.center[2],y:1.4}));return d?d.id+' · '+progress.doorState(d.id)+(d.id==='Pillsbury'&&progress.unlocked?' · E to enter':''):'WASD move · E interact · R safe return · Esc pause · Tab help';},
    interact(){if(disposed||!input.active||transition.active)return false;
      if(this.gameplay?.nearAmmo()){const changed=this.gameplay.refill();notice=changed?'Pistol refilled: six rounds. Ammo point ready again after eight active seconds.':'Ammo is full or refill is cooling down.';return changed;}
      if(this.quickplay){const item=[...world.items.values()].find(i=>i.area===this.area&&!progress.collected(i.id)&&player.near(i));if(item){const result=progress.pickup(item.id,this.area);notice=result.message;world.updateProgress(progress);return result.changed;}}
      const interior=world.nearbyDoor(player);if(interior){progress.openDoor(interior.id);world.updateProgress(progress);notice='Opened '+interior.label;return true;}
      if(!this.quickplay&&this.area==='A'&&player.near(layout.latch)){notice=progress.latch('A').message;world.updateProgress(progress);return true;}
      if(this.area==='B'&&player.near({...layout.bayReturn,y:1.4})){input.clear();return transition.start('B','hall',{...player.state});}
      const d=layout.doors.find(d=>player.near({x:d.center[0],z:d.center[2],y:1.4}));
      if(d?.id==='Pillsbury'&&progress.unlocked){input.clear();return transition.start('hall','B',{...player.state});}
      if(d){notice=d.id==='Brasenhill'?(progress.firstUnlocked?'Brasenhill is open. Walk through to Original test vestibule A.':'Brasenhill is LOCKED ■. Find the labelled HALL KEY near the starting point.'):d.id+' is LOCKED ■. '+(d.id==='Pillsbury'?'The test latch is in vestibule A.':'Future wing, not implemented.');return true;}return false;
    },
    key(code,repeat=false){if(!input.down(code,repeat))return false;if(code==='KeyF')return this.gameplay?.toggleFlashlight()??false;if(code==='Space')return this.gameplay?.fire().fired??false;if(code==='KeyE')return this.interact();if(code==='KeyR'){this.safeReturn();return true;}return true;},
    update(dt){if(disposed||!input.active)return;if(!Number.isFinite(dt)||dt<=0)return;const wasTransitioning=transition.active;transition.update(dt);if(!transition.active&&!wasTransitioning){player.move(input,dt);this.gameplay?.step(dt);}world.motion.update(dt);},
    safeReturn(){if(disposed)return false;input.clear();transition.cancel({restoreOrigin:false});if(!player.place(layout.spawn)){notice='Safe return unavailable. Please reset the run.';this.pause();return false;}notice='Returned to hall. '+(progress.unlocked?'Pillsbury remains OPEN ◇.':'Pillsbury remains LOCKED ■.');return true;},
    retryRun(){if(disposed)return false;this.pause();return this.gameplay?this.gameplay.retry():this.safeReturn();},
    reset(){if(disposed)return false;input.clear();transition.cancel({restoreOrigin:false});progress.reset();world.updateProgress(progress);world.motion.reset();this.gameplay?.reset();const ok=player.place(layout.spawn);notice=this.quickplay?'Run reset. All five doors are LOCKED ■. Find the HALL KEY.':'Run reset. Pillsbury is LOCKED ■. Start with Brasenhill.';return ok;},
    dispose(){if(disposed)return;this.pause();disposed=true;this.gameplay?.dispose();world.dispose();}
  };
  if(options.progressSnapshot)progress.restore(options.progressSnapshot);world.updateProgress(progress);if(options.gameplay)runtime.gameplay=createGameplay(runtime,options.gameplayConfig);return runtime;
}
export async function loadData(fetcher = globalThis.fetch) {
  const names=['layout','routes','provenance'];
  const values=await Promise.all(names.map(async name=>{const response=await fetcher(new URL('../data/'+name+'.json',import.meta.url));if(!response.ok)throw new Error('Required hall data unavailable');return response.json();}));
  const [layout,routes,provenance]=values;validateLayout(layout);validateRoutes(routes);
  if(provenance?.schema!==1||provenance.outcome!=='asylum-hall-rebuild-r2'||provenance.dependency?.version!=='0.181.2'||provenance.audio!==false||provenance.aiProcessing!==false)throw new Error('Invalid hall provenance');
  return {layout,routes,provenance};
}
export function createLoadGate(){let token=0,closed=false;return{begin(){if(closed)return null;return ++token;},current(t){return !closed&&t!==null&&t===token;},close(){closed=true;token++;}};}
export function startBrowser(doc=globalThis.document,win=globalThis.window,options={}){
  const canvas=doc.getElementById('view');const ui=createUI(doc,{quickplay:options.quickplay===true,gameplay:options.gameplay===true});const gate=createLoadGate();let runtime=null,renderer=null,frame=0,last=0,dead=false,suspended=false,captureEpoch=0,pendingCapture=null,savedProgress=null;const cleanups=[];
  function on(target,type,fn){target.addEventListener(type,fn);cleanups.push(()=>target.removeEventListener(type,fn));}
  function release(){if(doc.pointerLockElement===canvas)doc.exitPointerLock?.();}
  function pause(panel='pause'){captureEpoch++;runtime?.pause();release();ui.show(panel);}
  function stopCurrent(){if(runtime)savedProgress=runtime.progress.snapshot();captureEpoch++;win.cancelAnimationFrame(frame);frame=0;runtime?.dispose();runtime=null;renderer?.dispose();renderer=null;last=0;}
  function fail(){stopCurrent();release();ui.show('error');}
  async function load(){const token=gate.begin();if(token===null)return;stopCurrent();ui.show('loading');try{const {layout,routes}=await loadData(options.fetcher??globalThis.fetch);let gameplayConfig=null;if(options.gameplay){const response=await (options.fetcher??globalThis.fetch)(new URL('../data/enemy-loop.json',import.meta.url));if(!response.ok)throw new Error('Gameplay configuration unavailable');gameplayConfig=await response.json();}if(!gate.current(token))return;runtime=createRuntime(layout,routes,{document:doc,entry:options.entry,quickplay:options.quickplay,gameplay:options.gameplay,gameplayConfig,progressSnapshot:savedProgress});options.prepareRuntime?.(runtime);if(options.entry)ui.entry(options.entry);renderer=options.makeRenderer?options.makeRenderer(canvas):new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(win.devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;const candidate=runtime;await candidate.gameplay?.attachVisuals(renderer);if(!gate.current(token)||candidate!==runtime)return;resize();ui.apply(runtime);ui.show('start');last=0;if(!suspended)frame=win.requestAnimationFrame(tick);}catch{if(gate.current(token))fail();}}
  function resize(){if(!renderer||!runtime)return;const w=Math.max(1,win.innerWidth),h=Math.max(1,win.innerHeight);renderer.setSize(w,h,false);runtime.player.camera.aspect=w/h;runtime.player.camera.updateProjectionMatrix();}
  function tick(now){frame=0;if(dead||suspended||!runtime||!renderer)return;try{const dt=last?Math.max(0,(now-last)/1000):0;last=now;runtime.update(dt);if(runtime.gameplay?.combat.dead&&!ui.isBlocking())pause('dead');ui.update(runtime);if(runtime.gameplay)runtime.gameplay.render(renderer);else renderer.render(runtime.world.scene,runtime.player.camera);frame=win.requestAnimationFrame(tick);}catch{fail();}}
  async function capture(){
    if(!runtime||dead||suspended||pendingCapture)return;
    const token=++captureEpoch;
    const valid=()=>!dead&&!suspended&&token===captureEpoch&&!doc.hidden&&doc.hasFocus?.()!==false;
    let settled=false;
    const finish=()=>{if(settled)return;settled=true;doc.removeEventListener('pointerlockchange',grant);doc.removeEventListener('pointerlockerror',denied);if(pendingCapture?.token===token)pendingCapture=null;};
    const grant=()=>{if(!valid()){finish();release();return;}if(doc.pointerLockElement===canvas)finish();};
    const denied=()=>finish();
    pendingCapture={token};doc.addEventListener('pointerlockchange',grant);doc.addEventListener('pointerlockerror',denied);
    try{if(!canvas.requestPointerLock)throw new Error('Pointer lock unavailable');await canvas.requestPointerLock();if(!valid()){finish();release();}}
    catch{finish();if(valid())pause('pointer');}
  }
  ui.bind({resume:()=>{if(runtime?.gameplay?.combat.dead)runtime.retryRun();capture();},help:()=>pause('help'),pause:()=>pause(),safeReturn:()=>{runtime?.safeReturn();pause();},reset:()=>{runtime?.reset();pause('start');},retry:load,settings:()=>{if(runtime)ui.apply(runtime);}});
  on(canvas,'click',()=>{if(runtime&&!runtime.input.active&&!runtime.gameplay?.combat.dead)capture();});
  on(canvas,'mousedown',event=>{if(event.button===0&&doc.pointerLockElement===canvas&&runtime?.input.active)runtime.gameplay?.fire();});
  on(doc,'pointerlockchange',()=>{if(doc.pointerLockElement===canvas){if(!runtime||dead||suspended||pendingCapture?.token!==captureEpoch||doc.hidden||doc.hasFocus?.()===false){release();return;}runtime.resume();last=0;ui.show(null);}else if(runtime){runtime.pause();if(!ui.isBlocking())ui.show('pause');}});
  on(doc,'pointerlockerror',()=>pause('pointer'));
  on(win,'keydown',event=>{if(event.code==='Escape'&&runtime?.input.active){event.preventDefault();pause();return;}if(event.code==='Tab'&&runtime?.input.active){event.preventDefault();pause('help');return;}if(!runtime?.input.active||/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(event.target?.tagName??''))return;if(['KeyW','KeyA','KeyS','KeyD','ShiftLeft','ShiftRight','KeyE','KeyR','KeyF','Space'].includes(event.code)){event.preventDefault();runtime.key(event.code,event.repeat);}});
  on(win,'keyup',e=>runtime?.input.up(e.code));on(win,'mousemove',e=>{if(runtime?.input.active&&!runtime.transition.active)runtime.player.look(e.movementX,e.movementY);});
  on(win,'blur',()=>{if(runtime)pause();});on(doc,'visibilitychange',()=>{if(doc.hidden&&runtime)pause();});on(win,'resize',resize);
  on(canvas,'webglcontextlost',e=>{e.preventDefault();fail();});
  function dispose(){if(dead)return;dead=true;gate.close();release();stopCurrent();cleanups.splice(0).forEach(fn=>fn());ui.dispose();}
  on(win,'pagehide',event=>{if(event.persisted){suspended=true;pause();win.cancelAnimationFrame(frame);frame=0;}else dispose();});on(win,'pageshow',event=>{if(event.persisted&&!dead){suspended=false;last=0;if(runtime&&renderer&&!frame){ui.show('pause');frame=win.requestAnimationFrame(tick);}}});load();return {dispose,load,get runtime(){return runtime;}};
}
if(typeof document!=='undefined'&&document.getElementById('view')&&document.documentElement?.dataset?.storyHall!=='v1')startBrowser();
