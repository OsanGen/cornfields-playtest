import {sampleSpeech} from './prologue-speech.js';

// V4 finale contracts. The existing view owns rendering and audio.
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
export const SAFE_LOWER_SECONDS=2.55;
export const SAFE_CUT_TAIL_SECONDS=.6;
const VIGIL_SECONDS=12;
export const V4_LULLABY="There was a little man named Tom Poley who fell out of a tree. On one night when it was dark and stormy, the man fell and cracked his knee. He hobbled back home to put himself back together, and saw the crisp glaze of the fire burning. The warmth, the smell, the orange-y flame. He'd sit in front of the fire, and knew he could gaze for days.";
export const V4_INVITATION="Well if you ever need a place to crash. Assuming you lose power or what not, feel free to come by our home after the storm subsides. We have a guest room.";
const line=(id,speaker,text,source,origin='ADAPTED')=>({line_id:id,speaker,text,origin,source_refs:[source],delivery:'restrained; conversational',audience:'SCENE_POV_AND_AUDIENCE',trigger:'PREVIOUS_CUE_COMPLETE',optional_voice_asset:null,subtitle_required:true,voice_status:'NEW_RECORDING_REQUIRED'});
export const NEW_LINES=freeze(Object.fromEntries([
 ['CF-V4-S28-D01','DIEGO','Pam? Are you getting ready for the storm?','MS:II.04:313-325'],
 ['CF-V4-S28-D02','PAM','Diego! You too?','MS:II.04:313-325'],
 ['CF-V4-S28-D03','DIEGO','I just hope the diner is still standing when it is over.','MS:II.04:313-325'],
 ['CF-V4-S28-D04','PAM','I would miss you. And those onion rings.','MS:II.04:313-325'],
 ['CF-V4-S28-D05','DIEGO','What are your plans?','MS:II.04:313-325'],
 ['CF-V4-S28-D06','PAM','Crosswords, probably. Dale enjoys The Lone Ranger.','MS:II.04:313-325'],
 ['CF-V4-S28-D07','DIEGO','I listen to Gunsmoke.','MS:II.04:313-325'],
 ['CF-V4-S28-D08','NARRATOR','They talked until other shoppers needed to pass.','MS:II.04:313-325'],
 ['CF-V4-S28-D09','PAM',V4_INVITATION,'MS:II.04:322','VERBATIM'],
 ['CF-V4-S28-D10','NARRATOR','Diego’s face faltered for a moment. Then he thanked her.','MS:II.04:323-325'],
 ['CF-V4-S28-D11','DIEGO','Thank you. Let’s hope it doesn’t blow us backwards.','MS:II.04:323-325'],
 ['CF-V4-S29-D01','NARRATOR','The storm was supposed to start at midnight, after Pam’s second meeting with Diego.','MS:II.05:328'],
 ['CF-V4-S30-D01','TITLE_CARD','PART III\nTHE SHADOWS OF THE NIGHT','MS:III:title','VERBATIM'],
 ['CF-V4-S31-D01','NARRATOR','When Sadie could not sleep, she went to her parents. She said the monsters in her closet were watching her.','MS:III.01:335-338'],
 ['CF-V4-S31-D02','NARRATOR','Glenda and Stanley did not see a monster. They comforted their daughter, and Stanley brought her back to bed.','MS:III.01:335-338'],
 ['CF-V4-S32-D01','STANLEY',V4_LULLABY,'MS:III.01:339','VERBATIM'],
 ['CF-V4-S32-D02','TITLE_CARD','END OF AVAILABLE STORY\nTO BE CONTINUED','DEC-27','APPROVED_END_CARD']
].map(args=>{const l=line(...args);if(l.line_id==='CF-V4-S32-D02')l.trigger='FADE_COMPLETE';return [l.line_id,l];})));
export const V4_FINALE_SCENES=freeze([
 {sceneId:'CF-S21',beat:'V4-21',sourceScene:'CF-S19',pov:'SADIE',period:'PRESENT',title:{main:'THE CREATURES',sub:"SADIE’S POV | PRESENT"},set:'CREATURE_REVEAL',anchor:'CREATURE_REVEAL',controls:'LOOK_ONLY',eyeHeight:.95,requiredActions:['SAFE_LATCHED'],knowledge:['sadie','audience'],next:'CF-S22'},
 {sceneId:'CF-S22',beat:'V4-22',sourceScene:'CF-S20',pov:'TITLE',period:'1955',title:{main:'PART II',sub:'1955'},set:null,controls:'TITLE_ONLY',requiredActions:[],knowledge:['audience'],next:'CF-S23',clearModernState:true},
 {sceneId:'CF-S23',beat:'V4-23',sourceScene:'CF-S21',pov:'DALE_ARKINS',period:'1955',title:{main:'DALE ARKINS',sub:'1955 | FRIENDLY’S'},set:'HISTORICAL_CAFE',anchor:'HISTORICAL_CAFE',controls:'WALK_LOOK_INSPECT',requiredActions:['INSPECT_ENVELOPE','INSPECT_PHOTOS'],knowledge:['dale','audience'],next:'CF-S24'},
 {sceneId:'CF-S24',beat:'V4-24',sourceScene:'CF-S22',pov:'PAM_ARKINS',period:'1955',title:{main:'PAM ARKINS',sub:'1955 | OFFICE'},set:'HISTORICAL_OFFICE',anchor:'HISTORICAL_DESK',controls:'WALK_LOOK_INSPECT',requiredActions:['INSPECT_PAPERS'],knowledge:['pam','audience'],next:'CF-S25'},
 {sceneId:'CF-S25',beat:'V4-25',sourceScene:'CF-S22',pov:'PAM_ARKINS',period:'1955',set:'HISTORICAL_LUNCH',anchor:'HISTORICAL_LUNCH_ENTRY',controls:'WALK_LOOK',requiredActions:['REACH_LUNCH_TABLE'],knowledge:['pam','audience'],next:'CF-S26'},
 {sceneId:'CF-S26',beat:'V4-26',sourceScene:'CF-S23',pov:'DALE_ARKINS',period:'1955',title:{main:'DALE ARKINS',sub:'1955'},set:'HISTORICAL_DINNER',anchor:'HISTORICAL_TABLE',controls:'LOOK_ONLY',requiredActions:[],knowledge:['dale','audience'],next:'CF-S27'},
 {sceneId:'CF-S27',beat:'V4-27',sourceScene:'CF-S24',pov:'PAM_ARKINS',period:'1955',title:{main:'PAM ARKINS',sub:'1955 | THE FOLLOWING DAY'},set:'HISTORICAL_STORE',anchor:'HISTORICAL_STORE_ENTRANCE',controls:'WALK_LOOK',requiredActions:['REACH_STORE_AISLE'],knowledge:['pam','audience'],next:'CF-S28'},
 {sceneId:'CF-S28',beat:'V4-28',sourceScene:'CF-S24',pov:'PAM_ARKINS',period:'1955',set:'HISTORICAL_STORE',anchor:'HISTORICAL_STORE_DIEGO',controls:'LOOK_ONLY',requiredActions:[],knowledge:['pam','audience'],next:'CF-S29'},
 {sceneId:'CF-S29',beat:'V4-29',sourceScene:'CF-S24',pov:'PAM_ARKINS',period:'1955',set:'HISTORICAL_STORE',anchor:'HISTORICAL_STORE_ENTRANCE',controls:'LOOK_ONLY',requiredActions:[],knowledge:['pam','audience'],next:'CF-S30'},
 {sceneId:'CF-S30',beat:'V4-30',sourceScene:'CF-S20',pov:'TITLE',period:'SADIE_CHILDHOOD',title:{main:'PART III',sub:'THE SHADOWS OF THE NIGHT'},set:null,controls:'TITLE_ONLY',requiredActions:[],knowledge:['audience'],next:'CF-S31',clearHistoricalState:true},
 {sceneId:'CF-S31',beat:'V4-31',sourceScene:'CF-S22',pov:'SADIE',period:'CHILDHOOD',title:{main:'SADIE',sub:'CHILDHOOD'},set:'BEDTIME_HOME',anchor:'SADIE_BEDROOM',controls:'WALK_LOOK',eyeHeight:.95,requiredActions:['REACH_PARENTS','RETURN_TO_BED'],knowledge:['sadie','audience'],next:'CF-S32'},
 {sceneId:'CF-S32',beat:'V4-32',sourceScene:'CF-S24',pov:'SADIE',period:'CHILDHOOD',set:'BEDTIME_HOME',anchor:'SADIE_BED',controls:'LOOK_ONLY',eyeHeight:.65,requiredActions:['LULLABY_COMPLETE','QUIET_HOLD_COMPLETE','FADE_COMPLETE'],knowledge:['sadie','audience'],next:'END_AVAILABLE_EXCERPT'}
]);
const same=(a,b)=>a?.runId===b?.runId&&a?.entryId===b?.entryId&&a?.sceneId===b?.sceneId;
export function createFinaleProgression({sceneId,token,quietSeconds=2,fadeSeconds=2}={}){
 const spec=V4_FINALE_SCENES.find(s=>s.sceneId===sceneId);
 if(!spec||!token||token.sceneId!==sceneId||!Number.isInteger(token.runId)||!Number.isInteger(token.entryId))throw new Error('Valid finale scene/token required');
 if(!Number.isFinite(quietSeconds)||quietSeconds<0||!Number.isFinite(fadeSeconds)||fadeSeconds<=0)throw new Error('Invalid finale timing');
 const own=Object.freeze({...token}),done=new Set();let disposed=false,paused=false,quiet=0,fade=0,vigil=null;
 const accepts=t=>!disposed&&same(own,t);
 function cue(name,t=own){if(!accepts(t)||paused||done.has(name)||!spec.requiredActions.includes(name))return false;if(name==='RETURN_TO_BED'&&!done.has('REACH_PARENTS'))return false;if(['QUIET_HOLD_COMPLETE','FADE_COMPLETE'].includes(name))return false;done.add(name);return true;}
 function vigilAction(){
  if(disposed||paused||!done.has('LULLABY_COMPLETE')||fade>0||done.has('FADE_COMPLETE'))return null;
  if(vigil>0)return 'finish';
  return vigil===null&&quiet<quietSeconds?'stay':null;
 }
 function activateVigil(t=own){
  if(!accepts(t))return false;
  const action=vigilAction();
  if(!action)return false;
  vigil=action==='stay'?VIGIL_SECONDS:0;
  return true;
 }
 function tick(dt,{token:t=own,paused:p=paused,hidden=false,ready=true}={}){
  if(!accepts(t)||paused||p||hidden||!ready||!Number.isFinite(dt)||dt<0||!done.has('LULLABY_COMPLETE'))return snapshot();
  let left=dt;
  if(!done.has('QUIET_HOLD_COMPLETE')){
   const used=Math.min(left,Math.max(0,quietSeconds-quiet));
   quiet+=used;left-=used;
   if(quiet>=quietSeconds)done.add('QUIET_HOLD_COMPLETE');
  }
  if(done.has('QUIET_HOLD_COMPLETE')){
   if(vigil>0){const used=Math.min(left,vigil);vigil-=used;left-=used;}
   fade=Math.min(fadeSeconds,fade+left);
   if(fade>=fadeSeconds)done.add('FADE_COMPLETE');
  }
  return snapshot();
 }
 function snapshot(){return {sceneId,token:{...own},disposed,paused,actions:[...done],complete:!disposed&&spec.requiredActions.every(x=>done.has(x)),quietSeconds:quiet,fade:fade/fadeSeconds,closetChanged:false,vigilAction:vigilAction()};}
 return Object.freeze({cue,tick,snapshot,activateVigil,pause(){paused=true;},resume(){paused=false;},dispose(){disposed=true;done.clear();},filterControls(c={}){const lookOnly=spec.controls==='LOOK_ONLY'||spec.controls==='TITLE_ONLY';return {...c,forward:lookOnly?0:c.forward,strafe:lookOnly?0:c.strafe,interact:lookOnly?false:c.interact,fire:false,attack:false,flashlight:false,sprint:false};}});
}

// Small original bedtime set. No enemy, closet animation, clock or asset loader.
// The caller supplies the existing Three namespace and owns rendering/placement.
export function createV4BedtimeSet(THREE){
 if(!THREE?.Scene||!THREE?.BoxGeometry)throw new Error('Existing Three namespace required');
 const group=new THREE.Scene();group.name='V4_BEDTIME_HOME';
 const geometries=new Set(),materials=new Map(),colliders=[];
 const material=color=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.95,flatShading:true}));return materials.get(color);};
 function box(name,w,h,d,x,y,z,color,solid=false){const geometry=new THREE.BoxGeometry(w,h,d);geometries.add(geometry);const mesh=new THREE.Mesh(geometry,material(color));mesh.name=name;mesh.position.set(x,y,z);group.add(mesh);if(solid)colliders.push({id:name,minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});return mesh;}
 const wall=0x66615d,wood=0x403529;
 box('bedroom floor',6,.12,6,0,-.06,-1,0x514737);box('passage floor',2,.12,4,0,-.06,4,0x514737);box('parents floor',6,.12,5,0,-.06,8.5,0x514737);
 box('bedroom far wall',6,2.5,.12,0,1.25,-4,wall,true);
 for(const x of [-3,3])box('bedroom side',.12,2.5,6,x,1.25,-1,wall,true);
 for(const x of [-2,2]){box('bedroom doorway side',2,2.5,.12,x,1.25,2,wall,true);box('parents doorway side',2,2.5,.12,x,1.25,6,wall,true);}
 for(const x of [-1,1])box('passage side',.12,2.5,4,x,1.25,4,wall,true);
 for(const x of [-3,3])box('parents side',.12,2.5,5,x,1.25,8.5,wall,true);
 box('parents far wall',6,2.5,.12,0,1.25,11,wall,true);
 box('child bed frame',1.25,.32,1.85,-1.52,.16,-.05,wood,true);box('child mattress',1.22,.16,1.8,-1.52,.4,-.05,0xa49d88);box('child blanket',1.21,.04,1.2,-1.52,.5,-.4,0x686d75);box('child pillow',.8,.12,.35,-1.52,.53,.5,0xb8b3a5);
 // Door is an ordinary static mesh. No update function can change its transform.
 const closet=box('ordinary closed closet door',1.4,2.1,.12,2,1.05,-3,0x282726,true);
 for(const x of [1.24,2.76])box('closet side panel',.12,2.21,.9,x,1.105,-3.44,0x35302a,true);
 box('closet lintel',1.64,.14,.13,2,2.17,-2.97,0x40382d);
 box('closet knob',.07,.07,.09,1.5,1,-2.9,0x8a7651);
 box('parents bed',2,.45,1.8,0,.225,9.7,wood,true);box('parents bedding',1.95,.16,1.75,0,.53,9.7,0x857e72);
 function parent(name,x,color){
  const actor=new THREE.Group();actor.name=name;
  const faceGeometry=new THREE.IcosahedronGeometry(.144,1);geometries.add(faceGeometry);
  const face=new THREE.Mesh(faceGeometry,material(0xa47c62));face.scale.set(1.02,1.18,.89);face.position.y=1.37;
  const pieces=[
   box(`${name} torso`,.42,.58,.29,0,.94,0,color),
   box(`${name} collar`,.15,.13,.025,0,1.12,-.147,0xc8baa2),
   face,
   box(`${name} hair`,.27,.1,.25,0,1.53,.015,name==='STANLEY'?0x62594d:0x392822),
   box(`${name} nose`,.065,.074,.055,0,1.385,-.131,0xa47c62),
   box(`${name} lap`,.42,.19,.48,0,.58,-.14,color)
  ];
  for(const side of [-1,1]){
   pieces.push(box(`${name} arm`,.12,.42,.14,side*.245,.91,-.04,color));
   pieces.push(box(`${name} eye`,.032,.021,.014,side*.053,1.411,-.117,0x44352b));
  }
  const mouth=box(`${name} mouth`,.074,.015,.016,0,1.311,-.125,0x6e483d);
  actor.add(...pieces,mouth);actor.userData.mouth=mouth;actor.position.set(x,0,9.2);group.add(actor);
  return actor;
 }
 const stanley=parent('STANLEY',-.55,0x58616a);
 parent('GLENDA',.55,0x60634a);
 const ambient=new THREE.HemisphereLight(0x888b9a,0x191619,.8);group.add(ambient);
 for(const z of [1.2,8]){const lamp=new THREE.PointLight(0xffd19a,2.5,6);lamp.position.set(-2,1.4,z);group.add(lamp);box('bedside lamp base',.2,.55,.2,-2,.275,z,wood);}
 const anchors={SADIE_BEDROOM:{id:'SADIE_BEDROOM',position:{x:0,y:0,z:1},lookTarget:{x:0,y:1,z:8},eyeHeight:.95},SADIE_BED:{id:'SADIE_BED',position:{x:-1.52,y:0,z:.4},lookTarget:{x:2,y:.9,z:-3},eyeHeight:.65}};
 const targets=[{id:'PARENTS',kind:'family',position:{x:0,y:0,z:8},radius:1.1},{id:'BED',kind:'bed',position:{x:-.48,y:0,z:.25},radius:.78}];
 let disposed=false;
 return {group,colliders,anchors,targets,bounds:{x:[-2.8,2.8],z:[-3.8,10.8]},closet,
  update({sceneId,returnStartedAt,returnedToBed,player,time=0,speechLine,reducedEffects=false}={}){
   if(sceneId==='CF-S32'){
    stanley.position.set(-1.0,0,-1.1);stanley.rotation.y=2.81;
    const speaking=speechLine?.id==='CF-V4-S32-D01'&&speechLine.playing;
    const offset=speechLine?.offsetSeconds||0;
    stanley.rotation.z=speaking&&!reducedEffects?.025*Math.sin(offset*2.4):0;
    stanley.userData.mouth.scale.y=speaking&&!reducedEffects?1+sampleSpeech(speechLine.id,offset)*.9:1;
   }else if(Number.isFinite(returnStartedAt)&&Number.isFinite(player?.z)){
    // Keep Stanley behind Sadie on the return. The cut to the bed remains
    // separate, and Stanley cannot block the passage collision.
    const target=returnedToBed?.65:Math.max(.65,Math.min(9.2,player.z+1.1));
    const blend=Math.min(1,Math.max(0,(time-returnStartedAt)/.45));
    const z=9.2+(target-9.2)*blend*blend*(3-2*blend);
    stanley.position.set(-.55,0,z);
    stanley.rotation.y=0;
   }
  },
  dispose(){if(disposed)return;disposed=true;for(const g of geometries)g.dispose();for(const m of materials.values())m.dispose();group.clear();}};
}
