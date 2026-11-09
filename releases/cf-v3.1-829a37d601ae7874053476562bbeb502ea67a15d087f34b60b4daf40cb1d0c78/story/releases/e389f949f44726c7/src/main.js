import {EMPTY_ASSET_VARIANTS,V31_ASSET_VARIANTS} from './cf-v31-asset-variants.js';
import {createV31View} from './cf-v4-view.js';
import {readDevelopmentConfig} from './development.js';
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
import {createStartupTransaction} from '../../../../shared/runtime/startup-transaction.js';
import {createCharacterTitlePresentation} from './character-title-presentation.js';
import {v4OpeningPrologueOptions} from './cf-v4-opening-identity.js';
import {V4_SCENES} from './cf-v4-scenes.js';

const node = id => document.getElementById(id);
node('start-btn').disabled = true;
const startup=createStartupTransaction();
const own=resource=>resource?startup.own(resource):null;
let mountedApp=null;

try {
  const publicRuntime=document.querySelector('meta[name="cornfields-runtime"]')?.content==='public';
  const parameters = new URLSearchParams(location.search);
  if(publicRuntime)for(const key of [...parameters.keys()]){
    if(!['weather','introfx','horror'].includes(key)||!['on','off'].includes(parameters.get(key)))parameters.delete(key);
  }
  const development=publicRuntime?null:readDevelopmentConfig(document,location.search,V4_SCENES);
  const v31Enabled=!!development||!parameters.has('test');
  const touch = selectControlMode({search:parameters.toString(),
    coarse:matchMedia('(pointer: coarse)').matches,
    fine:matchMedia('(pointer: fine)').matches,
    maxTouchPoints:navigator.maxTouchPoints})==='touch';
  document.body.classList.toggle('touch', touch);
  node('rotate').hidden = !touch || innerWidth >= innerHeight;
  const legacy=parameters.has('test')&&parameters.get('survival')==='off';
  const previous=parameters.has('test')&&parameters.get('layout')==='survival';
  const maze = createMaze({corridors:!legacy&&!previous,survival:previous});
  const weather = createWeather(maze, {touch, enabled: parameters.get('weather') !== 'off'});
  const assetBindings=v31Enabled?V31_ASSET_VARIANTS:EMPTY_ASSET_VARIANTS;
  const view = own(createScene(node('scene'), maze, {touch, weather,assetBindings,playerIdentity:v31Enabled?'Mike':'Clarence'}));
  const audio = own(new FieldAudio({weatherEnabled: weather.state.enabled}));
  const introEnabled=!v31Enabled&&INTRO_ENABLED&&parameters.get('intro')!=='off';
  const introView=own((introEnabled||v31Enabled)?createIntroVisuals(view.renderer,{getCorn:view.introCorn,touch,enhanced:parameters.get('introfx')!=='off'}):null);
  const prologueEnabled=introEnabled&&parameters.get('prologue')!=='off';
  const survivalEndingEnabled=parameters.get('ending')!=='off'&&(!parameters.has('test')||parameters.get('ending')==='on');
  const originalPrologueView=own((prologueEnabled||v31Enabled)?createPrologueVisuals(view.renderer,{assetBindings,...(v31Enabled?v4OpeningPrologueOptions():{}),getCorn:view.introCorn,getWorld:()=>({scene:view.scene,camera:view.camera}),renderEquipment:view.renderPrologueEquipment,spawn:{...maze.spawn,yaw:Math.PI},touch}):null);
  const crashView=own(prologueEnabled?(await import('./asylum-story-view.js')).createStoryView(view.renderer):null);
  let crashLoaded=false,crashFailure=null;
  if(crashView)crashView.ready.then(()=>{crashLoaded=true;}).catch(error=>{crashFailure=error;});
  const prologueView=originalPrologueView&&{...originalPrologueView,
    crashReady(){if(crashFailure)throw crashFailure;return crashLoaded;},
    render(frame){if(frame.crashOriginal){if(crashFailure)throw crashFailure;if(!crashLoaded)throw Error('Crash assets are not ready');crashView.render(frame);}else originalPrologueView.render(frame);view.renderer.domElement.style.opacity=String(1-(frame.joinFade||0));},
    release(){view.renderer.domElement.style.opacity='1';originalPrologueView.release();},
    dispose(){view.renderer.domElement.style.opacity='1';originalPrologueView.dispose();crashView?.dispose();}
  };
  const prologueAudio=own(prologueEnabled||v31Enabled||survivalEndingEnabled?createPrologueAudio(audio):null);
  const survivalView=own((survivalEndingEnabled||v31Enabled)?createSurvivalVisuals(view,{touch}):null);
  const survivalAudio=own(survivalEndingEnabled?createSurvivalAudio(audio):null);

  const v31View=own(v31Enabled?createV31View({assetBindings,renderer:view.renderer,camera:view.camera,environmentAssets:view.environmentAssets,getQuality:view.getEnvironmentQuality}):null);
  const characterTitlePresentation=own(v31Enabled?createCharacterTitlePresentation(view.renderer):null);
  const candidateManifestId=v31Enabled?document.querySelector('meta[name="cornfields-build"]')?.content:null;
  const app = createGameApp({
    v31View,candidateManifestId,development,characterTitlePresentation,
    maze, view, audio, weather, document, window, touch, introEnabled, introView, prologueEnabled,prologueView,prologueAudio,ready:Promise.all([v31Enabled?view.storyReady:view.ready,crashView?.ready]),
    survivalEndingEnabled,survivalView,survivalAudio,crashOriginal:true,
    onLevelSelect:record=>window.dispatchEvent(new CustomEvent('cornfields-level-complete',{detail:{record,shutdown:()=>app.dispose()}})),
    onLevelComplete:record=>window.dispatchEvent(new CustomEvent('cornfields-level-complete',{detail:{record,shutdown:()=>app.dispose()}})),
    debug: parameters.has('debug'), horror:parameters.get('horror')!=='off',
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  });
  mountedApp=app;startup.commit();
  installDebugHooks(app, window, maze, parameters,{development:!!development,publicRuntime});
  app.startLoop();
} catch (error) {
  if(mountedApp)mountedApp.dispose();else startup.rollback();
  node('error').hidden = false;
  node('error-copy').textContent = error.message + '. Try a browser with WebGL enabled.';
  console.error(error);
}
