import {V31_SCENES} from './cf-v31-scenes.js';

export const DEVELOPMENT_PRESETS = Object.freeze({
  schoolPreset: Object.freeze(['combined','control','cue-only','door-only','search-only']),
  patrolLayout: Object.freeze(['bend','alternate']),
  hordeDensity: Object.freeze(['standard','dense','maximum']),
});

export function readDevelopmentConfig(document, search = '', scenes=V31_SCENES) {
  if (document.querySelector('meta[name="cornfields-development"]')?.content !== 'true') return null;
  if (document.querySelector('meta[name="cornfields-build"]')?.content !== 'fixture:development') return null;
  const parameters = new URLSearchParams(search);
  const sceneId = parameters.get('scene') || 'CF-S01';
  if (!Object.hasOwn(scenes, sceneId)) throw new Error('Unknown development scene: '+sceneId);
  const label='Local development fixture; synthetic prerequisites; not release acceptance';
  const presets = Object.fromEntries(Object.keys(DEVELOPMENT_PRESETS).map(key => [key,parameters.get(key)]));
  return Object.freeze({sceneId,label,routeEntry:developmentFixture(sceneId,label,scenes,presets)});
}

export function developmentFixture(sceneId, label, scenes=V31_SCENES, presets={}) {
  const scene = scenes[sceneId];
  if (!scene || typeof label !== 'string' || !label.trim()) throw new Error('Labeled development scene required');
  const fixture = {label, story_flags:[...(scene.entry.requirements || [])].filter(flag => flag !== 'return_anchor_saved')};
  if (scenes!==V31_SCENES) {
    fixture.entryFixture = {};
    if (scene.encounter_kind==='bicycleEscape') fixture.entryFixture.bicycleMount = true;
    for (const [key,values] of Object.entries(DEVELOPMENT_PRESETS)) {
      if (values.includes(presets[key])) fixture.entryFixture[key] = presets[key];
    }
  }
  // Both memory entries and their returns need the same saved adult context.
  // Canonical route eligibility still requires this object, never a flag alias.
  let returnTarget,returnSource;
  if(scenes===V31_SCENES){
    returnTarget=({'CF-S07':'CF-S08','CF-S08':'CF-S08','CF-S09':'CF-S10','CF-S10':'CF-S10'})[sceneId];
    returnSource=returnTarget==='CF-S08'?'CF-S06':'CF-S08';
  }else{
    const source=Object.values(scenes).find(candidate=>{
      const target=candidate.memory_capture?.target_scene_id;
      return target&&sceneId>candidate.scene_id&&sceneId<=target;
    });
    returnSource=source?.scene_id;
    returnTarget=source?.memory_capture?.target_scene_id;
  }
  if (returnTarget) {
    const contextScene = scenes===V31_SCENES ? scene : scenes[returnSource];
    fixture.return_context = {
      schema_version:1, run_id:0, source_scene_id:returnSource, target_scene_id:returnTarget,
      anchor_id:'INTERVIEW', environment_id:'FARM_INTERIOR', player:{x:9,y:0,z:7,yaw:0,pitch:0},
      camera_preset:'INTERVIEW', control_mode:contextScene.controls,
      modern_state:{objective:contextScene.objective,weapon_visible:false,health_visible:false}, consumed:false,
    };
  }
  return {sceneId, fixture};
}
