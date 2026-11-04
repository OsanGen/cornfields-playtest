/** Stable verification hooks, using the same runtime as real input. */
export function installDebugHooks(app, window, maze, parameters,{development=false}={}) {
  const cleanups=[];let disposed=false;
  const ownGlobal=(key,value)=>{const existed=Object.hasOwn(window,key),previous=window[key];window[key]=value;cleanups.push(()=>{if(window[key]!==value)return;if(existed)window[key]=previous;else delete window[key];});};
  const dispose=()=>{if(disposed)return;disposed=true;for(const cleanup of cleanups.splice(0).reverse())cleanup();};
  try{
  ownGlobal('render_game_to_text',() => JSON.stringify(app.snapshot()));
  ownGlobal('advanceTime',milliseconds => app.advance(milliseconds));
  if (parameters.has('test')||development) {
    ownGlobal('__test',{
      diagnostics: app.diagnostics,
      intro:app.introSnapshot,
      state: () => app.snapshot(true),
      maze: () => maze.grid,
      anchors: () => structuredClone(maze.hideAnchors),
      route: app.route,
      survival:app.survivalLayout,
      corridors:app.corridorLayout,
      puddles: app.weatherSurfaces,
      doors:()=>structuredClone(maze.cornDoors),
      fixture:app.fixture,
      step: app.step,
      render:app.preview,
      animation:app.animationTrial,
      clockMode:app.clockMode,
      setClockMode:app.setClockMode,
      performance:app.performanceReport,
      resetPerformance:app.resetPerformance,
    });
    if(parameters.has('lab'))cleanups.push(installLab(app,window));
  }
  if(app.onDispose)cleanups.push(app.onDispose(dispose));
  return Object.freeze({dispose});
  }catch(error){dispose();throw error;}
}

function installLab(app,window){
  const document=window.document,panel=document.createElement('aside');
  let frameId=null,disposed=false;
  const dispose=()=>{if(disposed)return;disposed=true;if(frameId!==null)window.cancelAnimationFrame(frameId);panel.remove();};
  try{
  panel.id='development-lab';panel.style.cssText='position:fixed;z-index:30;bottom:8px;left:8px;max-width:90vw;background:#101b16ed;color:#dfebce;padding:10px;font:12px monospace';
  const select=document.createElement('select');select.setAttribute('aria-label','Development scene');
  for(const name of ['viewmodel','corridor','gate','field','animation','encounter']){const option=document.createElement('option');option.value=option.textContent=name;select.append(option);}
  const clips=document.createElement('select');clips.setAttribute('aria-label','Animation trial');
  for(const name of ['Gameplay poses','Original breathing idle','Zombie Lurch','Pixelhouse Fury','Pixelhouse Collapse']){const option=document.createElement('option');option.textContent=option.value=name;clips.append(option);}
  const button=document.createElement('button');button.textContent='Load scene';
  let animate=false,start=0;
  button.onclick=()=>{app.animationTrial(null);app.fixture(select.value);animate=['animation','viewmodel'].includes(select.value);start=performance.now();};
  clips.onchange=()=>{app.animationTrial(clips.value==='Gameplay poses'?null:clips.value);start=performance.now();};
  const label=document.createElement('span');label.textContent=' LOCAL LAB · Begin/skip intro first · ';
  const status=document.createElement('pre');status.style.margin='8px 0 0';
  panel.append(label,select,button,clips,status);document.body.append(panel);
  let last=0;
  function frame(time){
    if(animate&&!document.hidden)app.preview((time-start)/1000);
    if(time-last>500){const d=app.diagnostics();status.textContent=JSON.stringify({state:d.enemy?.state,quality:d.quality?.tier,drawCalls:d.drawCalls,triangles:d.triangles,clip:d.creature?.animation?.clip,playerModel:d.visuals?.hands?.status});last=time;}
    if(!disposed&&panel.isConnected)frameId=window.requestAnimationFrame(frame);
  }
  frameId=window.requestAnimationFrame(frame);
  return dispose;
  }catch(error){dispose();throw error;}
}
