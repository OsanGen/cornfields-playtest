import {V31_SCENES} from './cf-v31-scenes.js';

export function readDevelopmentConfig(document, search = '') {
  if (document.querySelector('meta[name="cornfields-development"]')?.content !== 'true') return null;
  if (document.querySelector('meta[name="cornfields-build"]')?.content !== 'fixture:development') return null;
  const sceneId = new URLSearchParams(search).get('scene') || 'CF-S01';
  if (!Object.hasOwn(V31_SCENES, sceneId)) throw new Error('Unknown development scene: '+sceneId);
  return Object.freeze({sceneId, label:'Local development fixture; synthetic prerequisites; not release acceptance'});
}

export function developmentFixture(sceneId, label) {
  const scene = V31_SCENES[sceneId];
  if (!scene || typeof label !== 'string' || !label.trim()) throw new Error('Labeled development scene required');
  const fixture = {label, story_flags:[...(scene.entry.requirements || [])].filter(flag => flag !== 'return_anchor_saved')};
  if (['CF-S08','CF-S10'].includes(sceneId)) fixture.return_context = {
    schema_version:1, run_id:0, source_scene_id:sceneId==='CF-S08'?'CF-S06':'CF-S08', target_scene_id:sceneId,
    anchor_id:'INTERVIEW', environment_id:'FARM_INTERIOR', player:{x:9,y:0,z:7,yaw:0,pitch:0},
    camera_preset:'INTERVIEW', control_mode:scene.controls,
    modern_state:{objective:scene.objective,weapon_visible:false,health_visible:false}, consumed:false,
  };
  return {sceneId, fixture};
}
