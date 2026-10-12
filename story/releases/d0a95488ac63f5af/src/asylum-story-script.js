import {createPrologueTimeline} from './prologue-script.js';
import {PROLOGUE_VOICE_TIMING} from './prologue-voice-timing.js';
import {INTRO} from './intro.js';

export const OUTCOME='asylum-intro-v0.1';
export const OPENING_TIMELINE=createPrologueTimeline({durations:PROLOGUE_VOICE_TIMING});
export const DISPATCH_END=OPENING_TIMELINE.chapters.find(c=>c.id==='dispatch').end;
export const RETAINED_LINES=Object.freeze(OPENING_TIMELINE.lines.filter(l=>l.end<=DISPATCH_END));
export const WOUND=Object.freeze({side:'left',region:'temple',local:[.082,1.66,.055],graphic:false});
const line=(id,speaker,text,start,end,claim=false)=>Object.freeze({id,speaker,text,start,end,claim,audioMode:'subtitle-only'});
// C1: these are caption performances, never inferred new recordings.
export const NEW_LINES=Object.freeze({
  encounter:[], crash:[line('CRASH-01','CLARANCE','Are you okay, Mike?',3,5.8)], exit:[line('EXIT-01','MIKE','What the hell',.4,2.8),line('REC-01','CLARANCE','Put your hands behind your back!',3,6.8),line('REC-02','STANLEY','You need to help my daughter, she’s in that cornfield.',7,11.8),line('REC-03','CLARANCE','What were you doing in the middle of the highway?',12,15.8)],
  custody:[line('CUS-03','CLARANCE','Cuffs secure. Rear door locked. We’ll look for your daughter.',29,32.8)],
  field:[line('FIELD-01','MIKE','Need some light.',.5,2.5)], closure:[],
  return:[line('RETURN-01','MIKE','We locked you in the car.',.3,3.9)], shot:[],
  apology:[line('APOLOGY-01','STANLEY','I didn’t have a choice. It was the only way to save Sadie.',.5,8.4)],
  stanley_engulf:[], mike_engulf:[], blackout:[], titles:[], hospital_wake:[],
  // Brief original wording of the approved claims, attributable to Clarance only.
  hospital_dialogue:[line('HOS-01','CLARANCE','Mike, you’re in the hospital. We’re treating you here.',1,6),line('HOS-02','MIKE','Clarance? Your head… What happened?',7,11),line('HOS-03','CLARANCE','You shot me, Mike.',12,15,true),line('HOS-04','CLARANCE','You’re being treated for schizophrenia.',17,21,true),line('HOS-05','MIKE','We were police officers. We went into the cornfield.',23,29),line('HOS-06','CLARANCE','You weren’t a police officer. You believed you were.',30,37,true)], hospital_stand:[], connector:[], boundary:[],
});
export const SCENES=Object.freeze([
 ['opening',DISPATCH_END,'Police car and dispatch'],['encounter',.9,'A man in the headlights'],
 ['crash',6,'The pole'],['exit',22,'Recovery in Mike’s eyes'],['custody',33,'Secured custody'],
 ['field',8,'Two officers enter'],['closure',4,'The way closes'],['return',4.5,'An impossible return'],
 ['shot',3,'One shot'],['apology',9,'Stanley’s apology'],['stanley_engulf',5,'Stanley is consumed'],
 ['mike_engulf',5,'Mike is consumed'],['blackout',1,'Blackout'],['titles',INTRO.duration,'Cornfields'],
 ['hospital_wake',4,'Awakening'],['hospital_dialogue',40,'Clarance’s account'],
 ['hospital_stand',Infinity,'Stand when ready'],['connector',Infinity,'The connector'],['boundary',Infinity,'Central hall connection pending'],
].map(([id,duration,title])=>Object.freeze({id,duration,title})));
export const EVENTS=Object.freeze({
 encounter:[['stanley_stationary',0]],crash:[['near_miss',1.7],['impact',2.5],['glass',2.5]],
 exit:[['driver_door_open',.35],['clarance_out',3],['hands_commanded',3],['stanley_complied',7],['daughter_plea_complete',11.8],['highway_challenge_complete',15.8],['front_door_open',16.35],['mike_out',20],['officers_out',20]],
 custody:[['cuffs_closed',12],['escort_started',13],['rear_door_open',21],['stanley_seated',27],['rear_door_closed',29],['handle_checked',31],['custody_confirmed',32]],
 field:[['both_officers_clear',7.8]],closure:[['vines_closed',3.5]],return:[['impossible_return',.2]],
 shot:[['shot',1.2],['clarance_wounded',1.2]],apology:[['apology_complete',8.5]],
 stanley_engulf:[['stanley_consumed',4.8]],mike_engulf:[['mike_consumed',4.8]],
 blackout:[['CP2',.5]],hospital_dialogue:[['CP3',39.9]],
});
export const DESCRIPTIONS=Object.freeze({
 encounter:'Stanley stands motionless in the headlights.',crash:'The cruiser swerves past Stanley and strikes a standing telephone pole. Glass breaks once.',
 exit:'Through Mike’s eyes: glass is picked from his bloodied forearm while Clarance exits and questions Stanley. Mike then climbs out through the passenger door.',custody:'Mike stays outside in first-person view. Clarance cuffs Stanley’s hands behind his back, escorts him to the rear seat, closes the door and checks its handle.',
 field:'Mike and Clarance enter alone. Stanley remains secured in the cruiser.',closure:'Both officers are inside before vines close the path behind them.',
 return:'Stanley is ahead of them. He was secured in the cruiser; no escape has been shown.',shot:'Stanley fires once. Clarance is hit on his left temple.',
 apology:'Stanley speaks after the shot.',stanley_engulf:'The vines consume Stanley first.',mike_engulf:'The vines then consume Mike. Darkness.',
 hospital_wake:'Mike wakes on a bed in an institutional treatment room. Clarance wears attendant clothes and has dried blood at his left temple.',
 hospital_dialogue:'Clarance gives his account. His claims are not confirmed by the narration.',hospital_stand:'The conversation is over. Look around, then choose Stand.',
 connector:'Walk down the short corridor toward the door beneath the skylight.',boundary:'Central hall connection pending. This local story stops here.',
});
export function validateStoryScript({retained=RETAINED_LINES,lines=NEW_LINES,events=EVENTS}={}){
 const expected=OPENING_TIMELINE.lines.filter(l=>l.end<=DISPATCH_END);
 if(JSON.stringify(retained)!==JSON.stringify(expected))throw new Error('Retained dispatch/text/timing changed');
 if(lines.apology?.[0]?.text!=='I didn’t have a choice. It was the only way to save Sadie.')throw new Error('Missing exact apology');
 if(Object.values(events).flat().filter(([id])=>id==='shot').length!==1)throw new Error('Exactly one shot required');
 const order=['shot','apology','stanley_engulf','mike_engulf','blackout','titles'];
 if(order.some((id,i)=>i&&SCENES.findIndex(s=>s.id===id)<=SCENES.findIndex(s=>s.id===order[i-1])))throw new Error('Consumption/title order');
 if(!lines.hospital_dialogue?.length)throw new Error('Approved hospital dialogue pending');
 return true;
}
