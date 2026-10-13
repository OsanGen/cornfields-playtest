import {createStoryView} from './asylum-story-view.js';
import {createMaze} from './maze.js';
import {createScene} from './scene.js';
import {FieldAudio} from './audio.js';
import {createGameApp} from './app.js';
import {installDebugHooks} from './debug.js';
import {selectControlMode} from './control-mode.js';
import {createWeather} from './weather.js';
import {createIntroVisuals} from './intro-visuals.js';
import {INTRO_ENABLED} from './intro.js';
import {createPrologueVisuals} from './prologue-visuals.js';
import {createPrologueAudio} from './prologue-audio.js';
import {createSurvivalVisuals} from './survival-visuals.js';
import {createSurvivalAudio} from './survival-audio.js';

const node = id => document.getElementById(id);
node('start-btn').disabled = true;

try {
  const parameters = new URLSearchParams(location.search);
  const touch = selectControlMode({search:location.search,
    coarse:matchMedia('(pointer: coarse)').matches,
    fine:matchMedia('(pointer: fine)').matches,
    maxTouchPoints:navigator.maxTouchPoints})==='touch';
  document.body.classList.toggle('touch', touch);
  node('rotate').hidden = !touch || innerWidth >= innerHeight;
  const legacy=parameters.has('test')&&parameters.get('survival')==='off';
  const previous=parameters.has('test')&&parameters.get('layout')==='survival';
  const maze = createMaze({corridors:!legacy&&!previous,survival:previous});
  const weather = createWeather(maze, {touch, enabled: parameters.get('weather') !== 'off'});
  const view = createScene(node('scene'), maze, {touch, weather});
  const audio = new FieldAudio({weatherEnabled: weather.state.enabled});
  const introEnabled=INTRO_ENABLED&&parameters.get('intro')!=='off';
  const introView=introEnabled?createIntroVisuals(view.renderer,{getCorn:view.introCorn,touch,enhanced:parameters.get('introfx')!=='off'}):null;
  const prologueEnabled=introEnabled&&parameters.get('prologue')!=='off';
  const survivalEndingEnabled=parameters.get('ending')!=='off'&&(!parameters.has('test')||parameters.get('ending')==='on');
  const originalPrologueView=prologueEnabled?createPrologueVisuals(view.renderer,{getCorn:view.introCorn,getWorld:()=>({scene:view.scene,camera:view.camera}),renderEquipment:view.renderPrologueEquipment,spawn:{...maze.spawn,yaw:Math.PI},touch}):null;
  const crashView=prologueEnabled?createStoryView(view.renderer):null;
  let crashLoaded=false,crashFailure=null;
  if(crashView)crashView.ready.then(()=>{crashLoaded=true;}).catch(error=>{crashFailure=error;});
  const prologueView=originalPrologueView&&{...originalPrologueView,
    crashReady(){if(crashFailure)throw crashFailure;return crashLoaded;},
    render(frame){if(frame.crashOriginal){if(crashFailure)throw crashFailure;if(!crashLoaded)throw Error('Crash assets are not ready');crashView.render(frame);}else originalPrologueView.render(frame);view.renderer.domElement.style.opacity=String(1-(frame.joinFade||0));},
    release(){view.renderer.domElement.style.opacity='1';originalPrologueView.release();},
    dispose(){view.renderer.domElement.style.opacity='1';originalPrologueView.dispose();crashView?.dispose();}
  };
  const prologueAudio=prologueEnabled||survivalEndingEnabled?createPrologueAudio(audio):null;
  const survivalView=survivalEndingEnabled?createSurvivalVisuals(view,{touch}):null;
  const survivalAudio=survivalEndingEnabled?createSurvivalAudio(audio):null;

  const app = createGameApp({
    maze, view, audio, weather, document, window, touch, introEnabled, introView, prologueEnabled,prologueView,prologueAudio,ready:Promise.all([view.ready,crashView?.ready]),
    survivalEndingEnabled,survivalView,survivalAudio,crashOriginal:true,
    onLevelSelect:record=>window.dispatchEvent(new CustomEvent('cornfields-level-complete',{detail:{record,shutdown:()=>app.dispose()}})),
    onLevelComplete:record=>window.dispatchEvent(new CustomEvent('cornfields-level-complete',{detail:{record,shutdown:()=>app.dispose()}})),
    debug: parameters.has('debug'), horror:parameters.get('horror')!=='off',
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  });
  installDebugHooks(app, window, maze, parameters);
  app.startLoop();
} catch (error) {
  node('error').hidden = false;
  node('error-copy').textContent = error.message + '. Try a browser with WebGL enabled.';
  console.error(error);
}
