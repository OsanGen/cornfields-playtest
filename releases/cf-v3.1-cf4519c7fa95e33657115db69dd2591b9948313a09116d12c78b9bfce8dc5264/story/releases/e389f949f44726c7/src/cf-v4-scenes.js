// V4 route data derived from the retained V3.1 line registry. Old assets/data stay intact.
import * as old from './cf-v31-scenes.js';
import {BINDINGS} from './scene-behaviors.js';
import {V4_FINALE_SCENES,NEW_LINES as FINALE_LINES} from './cf-v4-finale.js';
const clone=x=>JSON.parse(JSON.stringify(x));
const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
const id=n=>`CF-S${String(n).padStart(2,'0')}`;
const oldLines=(n,from=1,to=999)=>Object.keys(old.V31_LINES).filter(k=>k.startsWith(id(n)+'-D')&&Number(k.split('-D')[1])>=from&&Number(k.split('-D')[1])<=to);
const newLine=(line_id,speaker,text,source_refs)=>({line_id,speaker,text,source_refs,origin:'V4_ADAPTATION',delivery:'restrained; conversational',audience:'SCENE_POV_AND_AUDIENCE',trigger:'PREVIOUS_CUE_COMPLETE',optional_voice_asset:null,subtitle_required:true,voice_status:'NEW_RECORDING_REQUIRED'});
const additions={
 'CF-V4-S01-D01':newLine('CF-V4-S01-D01','CLARENCE','Mike. Wake up. Dispatch is calling.',['DEC-02']),
 'CF-V4-S05-D01':newLine('CF-V4-S05-D01','CLARENCE_INNER','I was almost six. Darkness was falling over the woods. I had left my bike beside the trail.',['DEC-06']),
 'CF-V4-S05-D03':newLine('CF-V4-S05-D03','CLARENCE_INNER','Gray skin. Torn jacket. It stared right at me.',['CF-S09-D03']),
 'CF-V4-S15-D02':newLine('CF-V4-S15-D02','NARRATOR','The hand had come in a little cooler that looked like a gift box.',['CF-S14-D02']),
 'CF-V4-S16-D01':newLine('CF-V4-S16-D01','NARRATOR','Something scratched across the lab floor.',['CF-S14-D05']),
 'CF-V4-S16-D02':newLine('CF-V4-S16-D02','NARRATOR','The hand found him. Its fingers caught his face.',['CF-S14-D06']),
 'CF-V4-S16-D03':newLine('CF-V4-S16-D03','NARRATOR','Then everything went dark.',['CF-S14-D07']),
 'CF-V4-S18-D01':newLine('CF-V4-S18-D01','NARRATOR','Half the search team turned back. Randall followed Brad Iris and his bloodhound, Olive, deeper into the corn.',['CF-S15-D01']),
 'CF-V4-S18-D02':newLine('CF-V4-S18-D02','NARRATOR','Olive stopped at the pile. Then came the thunder.',['CF-S15-D01']),
 'CF-V4-S19-D02':newLine('CF-V4-S19-D02','NARRATOR','Brad’s shot broke the creature’s grip.',['CF-S15-D02']),
 'CF-V4-S19-D04':newLine('CF-V4-S19-D04','NARRATOR','A second creature caught Randall’s ankle. Olive lunged, then backed away.',['CF-S15-D04']),
 'CF-V4-S19-D06':newLine('CF-V4-S19-D06','NARRATOR','The bite left Randall badly hurt. The creatures backed into the corn.',['CF-S15-D06']),
 'CF-V4-S20-D03':newLine('CF-V4-S20-D03','CLARENCE','I wouldn’t jump to conclusions. We don’t know what has happened to your daughter.',['DEC-10']),
 ...FINALE_LINES
};
const rows=[
 {n:1,src:1,pov:'MIKE',title:{main:'MIKE',sub:'PRESENT'},lines:['CF-V4-S01-D01',...oldLines(1,1,5)],name:'Mike wakes; Clarence drives'},
 {n:2,src:2,pov:'MIKE',title:null,name:'Ride and physical arrival'},
 {n:3,src:3,pov:'MIKE'},
  {n:4,src:4,pov:'MIKE',lines:[...oldLines(4),...oldLines(8,1,6)],capture:{target_scene_id:'CF-S07',policy:'replace',return_pov:'clarence'},name:'Family interview and gray-jacket recollection'},
  {n:5,src:9,pov:'YOUNG_CLARENCE',period:'CHILDHOOD',title:{main:'CLARENCE',sub:'CHILDHOOD'},lines:[...oldLines(8,7,7),'CF-V4-S05-D01','CF-S09-D02','CF-V4-S05-D03','CF-S09-D04'],
   triggers:{'CF-V4-S05-D03':'WOODLAND_REVEALED','CF-S09-D04':'WOODLAND_RUN'},adapter:'v4Encounter',encounter:'woodland',actions:['BICYCLE_MOUNTED'],controls:'WALK_LOOK_FLASHLIGHT',name:'Find the bicycle'},
 {n:6,title:null,src:9,pov:'YOUNG_CLARENCE',period:'CHILDHOOD',lines:oldLines(9,5,5),adapter:'v4Encounter',encounter:'bicycleEscape',actions:['BICYCLE_ESCAPE_COMPLETE'],controls:'LOOK_ONLY',name:'Cinematic bicycle escape'},
  {n:7,src:10,pov:'CLARENCE',lines:oldLines(10,1,8),title:{main:'CLARENCE',sub:'PRESENT'},return:{source_scene_id:'CF-S04',policy:'replace',return_pov:'clarence'}},
 {n:8,src:5,pov:'CLARENCE'},
 {n:9,src:6,pov:'CLARENCE',capture:{target_scene_id:'CF-S12',policy:'restore',return_pov:'clarence'}},
  {n:10,src:7,pov:'SADIE',period:'CHILDHOOD',title:{main:'SADIE',sub:'SCHOOL MEMORY'},lines:oldLines(7,1,2),adapter:'v4Encounter',encounter:'schoolSetup',actions:['CLASSROOM_ONSET_COMPLETE'],controls:'LOOK_ONLY'},
  {n:11,title:null,src:7,pov:'SADIE',period:'CHILDHOOD',lines:oldLines(7,3,3),adapter:'v4Encounter',encounter:'school',actions:['SCHOOL_SURVIVAL_COMPLETE'],controls:'WALK_LOOK',name:'Escape the school nightmare'},
  {n:12,src:11,pov:'CLARENCE',lines:[...oldLines(10,9,10),...oldLines(11)],title:{main:'CLARENCE',sub:'PRESENT'},return:{source_scene_id:'CF-S09',policy:'restore',return_pov:'clarence'}},
 {n:13,src:12,pov:'CLARENCE'},
 {n:14,src:13,pov:'CLARENCE'},
 {n:15,src:14,pov:'WAYNE',adapter:'v4Encounter',encounter:'waynePrelude',actions:['CONTAINER_EXAMINED'],controls:'WALK_LOOK_INSPECT',title:{main:'WAYNE PROBST',sub:'PRESENT'},lines:['CF-S14-D01','CF-V4-S15-D02','CF-S14-D03','CF-S14-D04'],
   triggers:{'CF-S14-D03':'CONTAINER_EXAMINED','CF-S14-D04':'WAYNE_HAND_FELL'},binding:['investigationCutaway','FARM_INTERIOR','FORENSICS'],name:'Wayne examines the hand'},
 {n:16,title:null,src:14,pov:'WAYNE',lines:['CF-V4-S16-D01','CF-V4-S16-D02','CF-V4-S16-D03','CF-S14-D08'],
   triggers:{'CF-V4-S16-D01':'WAYNE_HUNT_SOUND','CF-V4-S16-D02':'WAYNE_HAND_ATTACKED','CF-V4-S16-D03':'WAYNE_DEATH_COMPLETE'},adapter:'v4Encounter',encounter:'wayne',actions:['WAYNE_DEATH_COMPLETE'],controls:'WALK_LOOK',name:'The moving hand'},
 {n:17,title:null,src:14,pov:'EXTERNAL',lines:oldLines(14,9,17),binding:['investigationCutaway','FARM_INTERIOR','V4_KITCHEN_PRIVATE'],name:'Glenda, Stanley and Mike’s report'},
 {n:18,src:15,pov:'RANDALL',title:{main:'RANDALL',sub:'PRESENT'},lines:['CF-V4-S18-D01','CF-V4-S18-D02'],triggers:{'CF-V4-S18-D02':'PATROL_AMBUSH_REACHED'},adapter:'v4Encounter',encounter:'patrol',actions:['PATROL_AMBUSH_REACHED'],controls:'WALK_LOOK',name:'Randall, Brad and Olive'},
  {n:19,title:null,src:15,pov:'RANDALL',lines:['CF-S15-D03','CF-V4-S19-D02','CF-V4-S19-D04','CF-S15-D05','CF-V4-S19-D06','CF-S15-D07'],
   triggers:{'CF-S15-D03':'RANDALL_FREED','CF-V4-S19-D02':'RANDALL_FREED','CF-V4-S19-D04':'RANDALL_FLANKED','CF-S15-D05':'RANDALL_BRAD_AIMED','CF-V4-S19-D06':'RANDALL_SECOND_SHOT','CF-S15-D07':'RANDALL_MEDIC'},
   adapter:'v4Encounter',encounter:'randall',actions:['RANDALL_BITE_COMPLETE'],controls:'WALK_LOOK_AND_STRUGGLE',name:'Randall’s ambush'},
 {n:20,src:15,pov:'CLARENCE',title:{main:'CLARENCE',sub:'PRESENT'},lines:[...oldLines(15,8,9),'CF-V4-S20-D03',...oldLines(15,11,13)],binding:['investigationCutaway','FARM_YARD','PORCH_STANLEY'],name:'Stanley asks Clarence'}
];
const finaleObjectives={
 'CF-S21':'Watch the gathering.','CF-S22':'1955','CF-S23':'Recall the wedding night.',
 'CF-S24':'Look over the papers on Pam’s desk.','CF-S25':'Meet Diego at the table.',
 'CF-S26':'Listen to Pam.','CF-S27':'Walk down the aisle to hear the forecast.',
 'CF-S28':'Talk with Diego.','CF-S29':'Midnight is approaching.',
 'CF-S30':'The Shadows of the Night','CF-S31':'Find your parents.',
 'CF-S32':'Listen to Stanley.'
};
const finaleNames=[
 'The creatures and the safe','1955','Wedding-night memories','Pam at work',
 'Lunch with Diego','Dinner at home','The storm forecast','Pam and Diego at the store',
 'Midnight approaches','The Shadows of the Night','Sadie finds her parents','Stanley’s lullaby',
];
for(const f of V4_FINALE_SCENES){const n=Number(f.sceneId.slice(-2));const src=Number(f.sourceScene.slice(-2));let lines=oldLines(src);
 if(n===24)lines=oldLines(22,1,2);if(n===25)lines=oldLines(22,3,7);if(n===27)lines=oldLines(24,1,2);
 if(n>=28)lines=Object.keys(FINALE_LINES).filter(k=>k.startsWith(`CF-V4-S${n}-`));
 rows.push({n,src,name:finaleNames[n-21],pov:f.pov,period:f.period,title:f.title??null,lines,controls:f.controls,actions:f.requiredActions,knowledge:f.knowledge,binding:[f.set?'historical':'title1955',f.set,f.anchor||null],finale:f});
}
const scenes={};const usedLines={};
for(const row of rows){const sceneId=id(row.n),sourceId=id(row.src),base=clone(old.V31_SCENES[sourceId]);const lineIds=row.lines||oldLines(row.src);
 for(const lineId of lineIds){const original=additions[lineId]||old.V31_LINES[lineId];if(!original)throw new Error(`Missing V4 line ${lineId}`);usedLines[lineId]=clone(original);
  if(row.n===25&&lineId===lineIds[0])usedLines[lineId].trigger='REACH_LUNCH_TABLE';
  if(row.n===27&&lineId===lineIds[0])usedLines[lineId].trigger='REACH_STORE_AISLE';
  if(row.n===31&&lineId==='CF-V4-S31-D02')usedLines[lineId].trigger='RETURN_TO_BED';
  if(row.triggers?.[lineId])usedLines[lineId].trigger=row.triggers[lineId];
 }
  if(row.n===11)usedLines['CF-S07-D03'].trigger='SCHOOL_SURVIVAL_COMPLETE';
 const binding=row.binding||clone(BINDINGS[sourceId]);if(row.adapter)binding[0]=row.adapter;if(row.n===21)binding[0]='revelation';
 const actions=row.actions||[];const sourceRecords=(row.n===4?[old.V31_SCENES['CF-S04'],old.V31_SCENES['CF-S08']]:[base]);
 const semanticBindings=row.encounter?[]:sourceRecords.flatMap(s=>s.cue_bindings||[]).filter(b=>b.bound_cue!=='TRIAL_COMPLETE'&&!(row.n===20&&b.bound_cue==='AFTER_D13'));
 const cues=[...new Set(['ENTRY',...semanticBindings.map(b=>b.bound_cue),...actions,...Object.values(row.triggers||{}),...lineIds.flatMap(l=>[`line:${l}:start`,`line:${l}:complete`])])];
 // Only remapped ordinary narrative cues remain. Encounters carry authoritative
 // action receipts; neither old trial cues nor obsolete source prerequisites survive.
 const recipients=row.knowledge||['audience',row.pov==='YOUNG_CLARENCE'?'clarence':({DALE_ARKINS:'dale',PAM_ARKINS:'pam'}[row.pov]||row.pov.toLowerCase())];
 const record={...base,scene_id:sceneId,v4_beat:`V4-${String(row.n).padStart(2,'0')}`,source_scene_id:sourceId,source_scene_ids:row.n===4?['CF-S04','CF-S08']:[sourceId],title:row.name||base.title,
 implementation_status:'V4_INTEGRATION_PENDING_VERIFICATION',perspective:{character:row.pov,period:row.period||'PRESENT',mode:row.controls||base.perspective.mode},title_card:row.title===undefined?(row.n===1?null:base.title_card):row.title,
 controls:row.controls||base.controls,adapter_key:binding[0],binding,line_ids:lineIds,cues,cue_bindings:semanticBindings,knowledge_events:lineIds.map(line_id=>({event_id:`${sceneId}:line:${line_id}`,scene_id:sceneId,line_id,kind:'line',recipients:[...new Set(recipients)],presentation:'heard'})),
 knowledge_scope:`V4 scene recipients: ${[...new Set(recipients)].join(', ')}`,
 entry:{previous_scene:row.n===1?null:id(row.n-1),checkpoint:`CP-${String(row.n).padStart(2,'0')}`,requirements:row.n===1?[]:[`v4_beat_${row.n-1}_complete`]},
 exit:{next_scene:row.n===32?'END_AVAILABLE_EXCERPT':id(row.n+1),condition:'Canonical dialogue and explicit V4 action gates completed.',sets_flags:[`v4_beat_${row.n}_complete`],side_effects:'APPLY_ONCE'},
 physical_view_sets:binding[1]?[binding[1]]:[],anchor:binding[2],renderer_binding:binding[1]?'v31-view':base.renderer_binding,
 recap_line_ids:[...lineIds],skip_allowed:!row.encounter&&!actions.length,completion_rule:{kind:row.encounter?'ENCOUNTER':'NARRATIVE',required_line_ids:[...lineIds],required_cues:actions,minimum_active_seconds:0,adapter_condition:'All explicit action receipts and dialogue complete.'},required_actions:actions};
 if(row.capture)record.memory_capture=row.capture;else delete record.memory_capture;
 if(row.return)record.memory_return=row.return;else delete record.memory_return;
 if(row.encounter){record.encounter_required=true;record.encounter_kind=row.encounter;record.skip_allowed=false;}
 if(row.n===32)record.skip_allowed=false;
 if(row.finale){record.finale=true;record.eye_height=row.finale.eyeHeight;record.clear_modern_state=!!row.finale.clearModernState;record.clear_historical_state=!!row.finale.clearHistoricalState;}
 // Prevent inherited staging/canon prose from masquerading as V4 runtime contracts.
 record.objective=row.name||finaleObjectives[sceneId]||base.objective;
 if(row.n<=4){record.narrative='Mike is the playable passenger. Clarence drives. Mike leads the initial family interview.';record.blocking='Mike occupies the passenger viewpoint; Clarence is the driver and companion.';}
 record.binding_note=`V4 ${sceneId}: ${binding.join(' / ')}. Current verified behavior requires matching runtime evidence.`;
 scenes[sceneId]=record;
}
export const V31_SPEC_ID='CORNFIELDS_V4_STORY_AND_GAMEPLAY';
export const V31_ROUTE_ID='CORNFIELDS_V4_32_BEATS';
export const V31_SCENE_IDS=freeze(rows.map(r=>id(r.n)));
export const V31_CHECKPOINT_IDS=freeze(rows.map(r=>`CP-${String(r.n).padStart(2,'0')}`));
export const V31_END_SCENE_ID='END_AVAILABLE_EXCERPT';
export const V31_PHYSICAL_SET_IDS=freeze([...new Set(rows.map(r=>scenes[id(r.n)].binding[1]).filter(Boolean))]);
export const V31_ADAPTER_KEYS=freeze([...new Set(Object.values(scenes).map(s=>s.adapter_key))]);
export const V31_KNOWLEDGE_RECIPIENTS=freeze(['audience','clarence','mike','sadie','wayne','randall','pam','dale','glenda','stanley','external','title']);
export const V31_PROHIBITED_FLAGS=old.V31_PROHIBITED_FLAGS;
export const V31_CUE_DECISIONS=freeze([]);
export const V31_LINES=freeze(usedLines);
export const V31_SCENES=freeze(scenes);
export {V31_SCENES as V4_SCENES,V31_LINES as V4_LINES,V31_SCENE_IDS as V4_SCENE_IDS};
