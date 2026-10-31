// Authored adapter, cue and anchor data. Scene transitions and lease ownership
// remain in cf-v31-adapters.js; this module only describes scene staging.
export const BINDINGS = Object.freeze({
  'CF-S01':['call',null,null],
  'CF-S02':['cruiser',null,null],
  'CF-S03':['farm','FARM_FRONT','FARM_FRONT'],
  'CF-S04':['farm','FARM_INTERIOR','INTERVIEW'],
  'CF-S05':['farm','FARM_INTERIOR','INTERVIEW'],
  'CF-S06':['farm','FARM_INTERIOR','INTERVIEW'],
  'CF-S07':['schoolMemory','CLASSROOM','CLASSROOM'],
  'CF-S08':['farm','FARM_INTERIOR','INTERVIEW'],
  'CF-S09':['childMemory','CHILDHOOD_POCKET','CHILDHOOD_FIXED_VIEWS'],
  'CF-S10':['farm','FARM_INTERIOR','INTERVIEW'],
  'CF-S11':['search','FARM_INTERIOR','INTERVIEW'],
  'CF-S12':['hand','SEARCH_TRAIL','SEARCH_BEND'],
  'CF-S13':['recovery','FARM_YARD','YARD_RECOVERY'],
  'CF-S14':['investigationCutaway','FARM_INTERIOR','KITCHEN_PRIVATE'],
  'CF-S15':['investigationCutaway','SEARCH_TRAIL','SEARCH_BEND'],
  'CF-S16':['sky',null,null],
  'CF-S17':['projector',null,null],
  'CF-S18':['trial',null,null],
  'CF-S19':['revelation','CREATURE_REVEAL','CREATURE_REVEAL'],
  'CF-S20':['title1955',null,null],
  'CF-S21':['historical','HISTORICAL_TABLE','HISTORICAL_TABLE'],
  'CF-S22':['historical','HISTORICAL_WORK_LUNCH','HISTORICAL_DESK'],
  'CF-S23':['historical','HISTORICAL_DINNER','HISTORICAL_TABLE'],
  'CF-S24':['historical','HISTORICAL_STORE','HISTORICAL_STORE_COUNTER'],
});

// Composite staging is explicit rather than inferred from ranges or names.
export const COMPOSITE_CUES = Object.freeze({
  'CF-S14':{D02:'D02_TO_D08',D03:'D02_TO_D08',D04:'D02_TO_D08',D05:'D02_TO_D08',D06:'D02_TO_D08',D07:'D02_TO_D08',D08:'D02_TO_D08',D09:'BEFORE_D09',D16:'BEFORE_D16'},
  'CF-S15':{D02:'D02_TO_D06',D03:'D02_TO_D06',D04:'D02_TO_D06',D05:'D02_TO_D06',D06:'D02_TO_D06',D08:'BEFORE_D08'},
  'CF-S22':{D04:'D04_TO_D08',D05:'D04_TO_D08',D06:'D04_TO_D08',D07:'D04_TO_D08',D08:'D04_TO_D08'},
});

export const STAGE_ANCHORS = Object.freeze({
  'CF-S05':{D04:['FARM_FRONT','FRONT_DOOR'],D06:['FARM_INTERIOR','INTERVIEW']},
  'CF-S14':{BEFORE_D09:['FARM_INTERIOR','KITCHEN_PRIVATE'],BEFORE_D16:['FARM_YARD','PORCH_STANLEY']},
  'CF-S15':{BEFORE_D08:['FARM_YARD','PORCH_STANLEY'],AFTER_D13:['FARM_YARD','FIELD_EDGE']},
  'CF-S22':{D03:['HISTORICAL_WORK_LUNCH','HISTORICAL_TABLE']},
});

export function actorBindingsFor(sceneId,binding) {
  const actors=binding[1]==='FARM_INTERIOR'?[{role:'MIKE',anchorId:'MIKE_INTERVIEW'},{role:'STANLEY',anchorId:'STANLEY_INTERVIEW'}]:[];
  if(binding[1]==='FARM_INTERIOR'&&['CF-S04','CF-S05','CF-S06','CF-S08','CF-S10'].includes(sceneId))actors.push({role:'GLENDA',anchorId:'GLENDA_INTERVIEW'});
  if(binding[1]==='FARM_INTERIOR'&&sceneId==='CF-S14'&&binding[2]==='KITCHEN_PRIVATE')actors.push({role:'GLENDA',anchorId:'GLENDA_KITCHEN'});
  if(binding[1]==='FARM_YARD'&&sceneId==='CF-S13')actors.push({role:'GLENDA',anchorId:'GLENDA_RECOVERY'});
  return actors;
}
