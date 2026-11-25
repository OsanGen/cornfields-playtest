// V4's spoken story is dialogue. Actions have their own clocks and receipts;
// removing a voice recording must never remove a physical story beat.
const line=(id,speaker,text,audience='SCENE_POV_AND_AUDIENCE',trigger='PREVIOUS_CUE_COMPLETE')=>({line_id:id,speaker,text,audience,trigger,origin:'V4_DRAMATIZATION',source_refs:['NARRATION_REWRITE_20261124'],delivery:'in scene; conversational',subtitle_required:true,optional_voice_asset:null});
const entries=[
 ['CF-DR-S05-01','YOUNG_CLARENCE',"Where did I leave my bike?",'MEMORY_ONLY'],
 ['CF-DR-S06-01','DARLENE_MEMORY',"Clarence? What happened?",'MEMORY_ONLY','BICYCLE_ESCAPE_COMPLETE'],
 ['CF-DR-S06-02','YOUNG_CLARENCE',"I almost stepped on a dead possum, Ma.",'MEMORY_ONLY'],
 ['CF-DR-S06-03','DARLENE_MEMORY',"A possum? Leave it alone. Come inside.",'MEMORY_ONLY'],
 ['CF-DR-S07-01','DARLENE_MEMORY',"Billy comes and goes. The drinking, the cocaine. You can't keep waiting for him.",'MEMORY_ONLY'],
 ['CF-DR-S07-02','CLARENCE_MEMORY',"He talked to me, Ma. About growing up. Sex. Being Black in this country. Things nobody else would say.",'MEMORY_ONLY'],
 ['CF-DR-S07-03','DARLENE_MEMORY',"A four-point-oh. Advanced physics. Clarence, you earned this.",'MEMORY_ONLY'],
 ['CF-DR-S08-01','OWEN',"We were just watching TV. Is she okay?",'SCENE_PARTICIPANTS'],
 ['CF-DR-S08-02','MIKE',"We don't know yet, Owen. We're still looking.",'SCENE_PARTICIPANTS'],
 ['CF-DR-S12-01','MIKE',"Ten officers in the field. Keep the dogs on the trail.",'SCENE_PARTICIPANTS'],
 ['CF-DR-S14-01','CLARENCE',"I was afraid he wouldn't believe me. I think I was more afraid he would.",'SCENE_PARTICIPANTS'],
 ['CF-DR-S15-01','WAYNE',"Happy birthday, Troy. I'm still at the lab."],
 ['CF-DR-S15-02','TROY_PHONE',"Come after work. We've got booze, girls, a little cocaine. Same as last weekend."],
 ['CF-DR-S15-03','WAYNE',"I'm not losing my first job over your birthday. I'll call after my shift."],
 ['CF-DR-S15-04','WAYNE',"Gray discoloration. Dry, cracked skin. Strong odor.",'SCENE_POV_AND_AUDIENCE','CONTAINER_EXAMINED'],
 ['CF-DR-S15-05','WAYNE',"What the hell?",'SCENE_POV_AND_AUDIENCE','WAYNE_HAND_FELL'],
 ['CF-DR-S18-01','RADIO_OFFICER',"Half the team is heading back. Randall, stay with Iris and Olive."],
 ['CF-DR-S18-02','BRAD_IRIS',"Come on, Olive.",'SCENE_POV_AND_AUDIENCE','PATROL_AMBUSH_REACHED'],
 ['CF-DR-S19-01','BRAD_IRIS',"Randall! Stay with me.",'SCENE_POV_AND_AUDIENCE','RANDALL_SECOND_SHOT'],
 ['CF-DR-S20-01','CLARENCE',"Easy, Mr. Yates.",'SCENE_PARTICIPANTS'],
 ['CF-DR-S21-01','CREATURE_LEADER',"Get in, vermin.",'CREATURES_AND_AUDIENCE'],
 ['CF-DR-S21-02','CREATURE_PACK',"Some of ours went out. They still haven't come back.",'CREATURES_AND_AUDIENCE'],
 ['CF-DR-S21-03','CREATURE_PACK',"Where are the rest of them?",'CREATURES_AND_AUDIENCE','LEASH_TUG_COMPLETE'],
 ['CF-DR-S23-01','DALE',"Coffee, please.",'MEMORY_ONLY'],
 ['CF-DR-S24-01','PETE_GATEMAN',"Dale's friend put in a good word. Start with these files."],
 ['CF-DR-S24-02','PETE_GATEMAN',"You look too good to hide behind a desk.",'SCENE_POV_AND_AUDIENCE','INSPECT_PAPERS'],
 ['CF-DR-S24-03','PAM',"Take your hand off me, Mr. Gateman.",'SCENE_POV_AND_AUDIENCE','PAM_RECOILED'],
 ['CF-DR-S25-01','DIEGO',"Here's your menu. Cigarette?",'SCENE_PARTICIPANTS','REACH_LUNCH_TABLE'],
 ['CF-DR-S25-02','PAM',"Thank you. A hot dog and onion rings, please.",'SCENE_PARTICIPANTS'],
 ['CF-DR-S25-03','DIEGO',"I'd like to see you here more often.",'SCENE_PARTICIPANTS'],
 ['CF-DR-S28-01','SHOPPER',"Excuse me. Could I get past?",'SCENE_PARTICIPANTS'],
 ['CF-DR-S29-01','WEATHER_VOICE',"The storm is expected to begin at midnight. Stay tuned for further advisories."],
 ['CF-DR-S31-01','SADIE',"Mom? Dad? I can't sleep. The monsters in my closet keep watching me.",'SADIE','REACH_PARENTS'],
 ['CF-DR-S31-02','GLENDA',"Come here, sweetheart.",'SADIE'],
 ['CF-DR-S31-03','STANLEY',"I'll check your room. Come on.",'SADIE'],
 ['CF-DR-S31-04','STANLEY',"I can't see anyone in there. I'll sit with you a while.",'SADIE','RETURN_TO_BED'],
];
export const DRAMA_LINES=Object.freeze(Object.fromEntries(entries.map(args=>{const l=line(...args);return[l.line_id,Object.freeze(l)];})));
export const DRAMA_OVERRIDES=Object.freeze({
 'CF-S10-D05':{text:"I want to go. But Dad's been gone three years. What if he comes back while I'm away?"},
 'CF-S13-D10':{text:"I never told my parents. Not even my father. We could talk about almost anything."},
});
export const DRAMA_SCENES=Object.freeze({
 5:{lines:['CF-DR-S05-01','CF-S09-D04']},
 6:{lines:['CF-DR-S06-01','CF-DR-S06-02','CF-DR-S06-03']},
 7:{name:'Clarence and Darlene',lines:['CF-DR-S07-01','CF-DR-S07-02','CF-DR-S07-03','CF-S10-D04','CF-S10-D05','CF-S10-D06','CF-S10-D07'],title:{main:'CLARENCE',sub:'REMEMBERED CONVERSATION'}},
 8:{lines:['CF-S05-D01','CF-S05-D02','CF-S05-D04','CF-S05-D05','CF-DR-S08-01','CF-DR-S08-02','CF-S05-D06','CF-S05-D07','CF-S05-D08','CF-S05-D09'],triggers:{'CF-S05-D04':'OWEN_ARRIVED'}},
 12:{lines:['CF-S10-D09','CF-S10-D10','CF-S11-D01','CF-S11-D02','CF-DR-S12-01','CF-S11-D04','CF-S11-D05','CF-S11-D06','CF-S11-D07','CF-S11-D08','CF-S11-D09']},
 13:{lines:['CF-S12-D01','CF-S12-D02']},
 14:{lines:['CF-S13-D01','CF-S13-D02','CF-S13-D03','CF-S13-D04','CF-S13-D05','CF-S13-D06','CF-S13-D07','CF-S13-D08','CF-S13-D09','CF-S13-D10','CF-DR-S14-01','CF-S13-D11']},
 15:{lines:['CF-DR-S15-01','CF-DR-S15-02','CF-DR-S15-03','CF-DR-S15-04','CF-DR-S15-05']},
 16:{lines:[]},
 17:{lines:['CF-S14-D09','CF-S14-D10','CF-S14-D11','CF-S14-D12','CF-S14-D13','CF-S14-D14','CF-S14-D16','CF-S14-D17'],triggers:{'CF-S14-D16':'MIKE_ENTERED_KITCHEN'}},
 18:{lines:['CF-DR-S18-01','CF-DR-S18-02']},
 19:{lines:['CF-DR-S19-01','CF-S15-D07'],triggers:{'CF-S15-D07':'RANDALL_MEDIC'}},
 20:{lines:['CF-S15-D08','CF-S15-D09','CF-V4-S20-D03','CF-S15-D11','CF-S15-D12','CF-DR-S20-01']},
 21:{lines:['CF-S19-D03','CF-DR-S21-01','CF-DR-S21-02','CF-DR-S21-03','CF-S19-D05','CF-S19-D06']},
 23:{lines:['CF-DR-S23-01','CF-S21-D03','CF-S21-D04','CF-S21-D05','CF-S21-D07'],triggers:{'CF-S21-D03':'WEDDING_MEMORY_READY'},title:{main:'DALE ARKINS',sub:'1955 | AGE 32 | FRIENDLY’S'}},
 24:{lines:['CF-DR-S24-01','CF-DR-S24-02','CF-DR-S24-03']},
 25:{lines:['CF-DR-S25-01','CF-DR-S25-02','CF-DR-S25-03','CF-S22-D05','CF-S22-D06','CF-S22-D07']},
 26:{lines:['CF-S23-D01','CF-S23-D02','CF-S23-D03','CF-S23-D04','CF-S23-D05','CF-S23-D06','CF-S23-D07','CF-S23-D08','CF-S23-D09','CF-S23-D11','CF-S23-D12','CF-S23-D13'],triggers:{'CF-S23-D11':'PAM_STOMACH_NOTICED'}},
 27:{lines:['CF-S24-D02']},
 28:{lines:['CF-V4-S28-D01','CF-V4-S28-D02','CF-V4-S28-D03','CF-V4-S28-D04','CF-V4-S28-D05','CF-V4-S28-D06','CF-V4-S28-D07','CF-DR-S28-01','CF-V4-S28-D09','CF-V4-S28-D11'],triggers:{'CF-V4-S28-D09':'AISLE_CLEAR','CF-V4-S28-D11':'DIEGO_REACTED'}},
 29:{lines:['CF-DR-S29-01']},
 31:{lines:['CF-DR-S31-01','CF-DR-S31-02','CF-DR-S31-03','CF-DR-S31-04']},
});

// Each hold starts from a real scene/dialogue event, freezes on pause, and emits
// one action receipt. Neither captions nor prerecorded speech fabricate it.
export const DRAMA_BEATS=Object.freeze({
 'CF-S04':[{id:'jacket-recognition',after:'line:CF-S08-D06:complete',seconds:1.1,cue:'JACKET_RECOGNIZED'}],
 'CF-S07':[{id:'withheld-confession',after:'line:CF-S10-D07:complete',seconds:1.5,cue:'CLARENCE_WITHHELD'}],
 'CF-S08':[{id:'owen-arrival',after:'line:CF-S05-D02:complete',seconds:2.2,cue:'OWEN_ARRIVED'}],
 'CF-S13':[{id:'hand-recognition',after:'line:CF-S12-D02:complete',seconds:1.4,cue:'HAND_RECOGNIZED'}],
 'CF-S17':[{id:'mike-entrance',after:'line:CF-S14-D14:complete',seconds:2.5,cue:'MIKE_ENTERED_KITCHEN'}],
 'CF-S20':[{id:'stanley-escort',after:'line:CF-DR-S20-01:complete',seconds:3,cue:'STANLEY_ESCORTED'}],
 'CF-S21':[{id:'leash-tug',after:'line:CF-DR-S21-01:start',seconds:1.2,cue:'LEASH_TUG_COMPLETE'}],
 'CF-S23':[{id:'wedding-memory',after:'line:CF-DR-S23-01:complete',seconds:1.5,cue:'WEDDING_MEMORY_ENTER'}],
 'CF-S24':[{id:'pam-recoil',after:'line:CF-DR-S24-02:complete',seconds:.85,cue:'PAM_RECOILED'}],
 'CF-S26':[{id:'stomach-gesture',after:'line:CF-S23-D09:complete',seconds:1.4,cue:'PAM_STOMACH_NOTICED'}],
 'CF-S28':[{id:'shopper-passes',after:'line:CF-DR-S28-01:complete',seconds:1.5,cue:'AISLE_CLEAR'},{id:'diego-hesitates',after:'line:CF-V4-S28-D09:complete',seconds:1.25,cue:'DIEGO_REACTED'}],
});
export function createDramatization(sceneId){
 const definitions=DRAMA_BEATS[sceneId]||[],started=new Set(),finished=new Set(),active=[];
 let elapsed=0;
 return {
  cue(id){for(const beat of definitions)if(beat.after===id&&!started.has(beat.id)){started.add(beat.id);active.push({...beat,age:0});}},
  tick(dt){elapsed+=dt;const cues=[];for(const beat of active){if(finished.has(beat.id))continue;beat.age=Math.min(beat.seconds,beat.age+dt);if(beat.age>=beat.seconds){finished.add(beat.id);cues.push(beat.cue);}}return cues;},
  frame(){return {sceneId,elapsed,beats:active.map(beat=>({...beat,complete:finished.has(beat.id),progress:beat.age/beat.seconds})),pending:active.some(beat=>!finished.has(beat.id)),complete:finished.size===definitions.length};}
 };
}
