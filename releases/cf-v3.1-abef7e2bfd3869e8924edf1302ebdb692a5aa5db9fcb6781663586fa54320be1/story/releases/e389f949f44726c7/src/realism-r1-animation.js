/** R1 authoring/playback contract. All curves are sampled from the unchanged
 * chapter clock. There is no advancing timer and no gameplay/root movement.
 * This is a bounded hero proof, not a visual-quality or device-performance pass.
 */
export const R1_STANLEY_CLIPS = Object.freeze({
  emergence: Object.freeze({name:'R1_Stanley_Approach',duration:5.2}),
  bang: Object.freeze({name:'R1_Stanley_Window',duration:2}),
  cabin: Object.freeze({name:'R1_Stanley_Retreat',duration:3.05}),
});
export const R1_STANLEY_IMPACTS = Object.freeze([.60,1.30]);
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(x)?x:0));
const smooth=x=>{const u=clamp(x);return u*u*(3-2*u);};
/** C1 keypose interpolation; keys are authored values, not independent noise. */
export function sampleR1Keys(keys,time){
  const t=Number.isFinite(time)?time:0;
  if(t<=keys[0][0])return keys[0][1];
  for(let i=1;i<keys.length;i++)if(t<=keys[i][0]){
    const a=keys[i-1],b=keys[i],u=smooth((t-a[0])/(b[0]-a[0]));
    return a[1]+(b[1]-a[1])*u;
  }
  return keys.at(-1)[1];
}
// Read from left to right as anticipation -> contact -> absorption -> recovery.
// The second blow is slightly more urgent, with the left support hand delayed.
const WINDOW={
  chest:[[0,0],[.20,-.016],[.43,-.047],[.60,.027],[.68,.035],[.87,-.005],[1.08,-.052],[1.30,.038],[1.39,.043],[1.68,-.008],[2,0]],
  nod:[[0,.012],[.39,-.020],[.60,.032],[.73,.014],[1.08,-.016],[1.30,.042],[1.45,.012],[2,.012]],
  crouch:[[0,1],[.28,.97],[.47,1.03],[.60,1.08],[.76,1.02],[1.10,1.04],[1.30,1.10],[1.52,1.015],[2,1]],
  retractL:[[0,.20],[.21,.22],[.40,.24],[.60,0],[.635,0],[.79,.15],[.96,.17],[1.11,.22],[1.30,0],[1.335,0],[1.50,.15],[1.76,.20],[2,.20]],
  retractR:[[0,.20],[.20,.25],[.43,.27],[.60,0],[.635,0],[.77,.18],[.98,.22],[1.13,.29],[1.30,0],[1.335,0],[1.49,.19],[1.78,.20],[2,.20]],
  fingers:[[0,.12],[.34,.44],[.53,.27],[.60,.08],[.67,.12],[.87,.28],[1.08,.50],[1.24,.26],[1.30,.08],[1.38,.15],[1.72,.20],[2,.12]],
  pressure:[[0,0],[.49,0],[.60,1],[.635,.9],[.74,0],[1.18,0],[1.30,1],[1.335,.85],[1.45,0],[2,0]],
};
export function sampleStanleyChoreography(chapter,time=0){
  const t=clamp(time,0,R1_STANLEY_CLIPS[chapter]?.duration??0);
  if(chapter==='bang')return Object.fromEntries(Object.entries(WINDOW).map(([key,keys])=>[key,sampleR1Keys(keys,t)]));
  if(chapter==='emergence')return {
    chest:sampleR1Keys([[0,0],[.20,.025],[.65,-.020],[1.2,.012],[2.2,.006],[2.6,-.025],[3.0,.010],[4.4,.023],[4.8,.014],[5.2,0]],t),
    nod:sampleR1Keys([[0,-.035],[.5,.035],[.85,.012],[2.3,.014],[2.6,-.02],[4.8,.005],[5.2,.012]],t),
    fingers:sampleR1Keys([[0,.22],[2.3,.20],[2.7,.40],[4.6,.34],[5.2,.12]],t),pressure:0,
  };
  return {chest:sampleR1Keys([[0,0],[.42,.015],[.85,.003],[1.4,-.01],[2.55,.008],[3.05,0]],t),nod:sampleR1Keys([[0,.012],[.5,.04],[.85,.012],[1.25,-.018],[2.65,.015],[3.05,0]],t),fingers:sampleR1Keys([[0,.12],[.6,.20],[1.2,.26],[3.05,.16]],t),pressure:0};
}
export function sampleStanleyHero({chapter,chapterTime=0,mode='standing',corpse=false,limpWeight=0}={}){
  const clip=R1_STANLEY_CLIPS[chapter];
  if(!clip||corpse||mode==='limp'||limpWeight>0)return null;
  const time=clamp(chapterTime,0,clip.duration),pose=sampleStanleyChoreography(chapter,time);
  const impacts=chapter==='bang'?R1_STANLEY_IMPACTS.map(at=>({at,contact:chapterTime>=at&&chapterTime<=at+.035})):[];
  return {clip:clip.name,time,duration:clip.duration,chapter,pose,impacts,ended:chapterTime>=clip.duration};
}
export function sampleStanleyFace({hero=null,speech=0,blink=0,distress=0,breath=0}={}){
  const pressure=hero?.pose.pressure||0,worry=clamp(distress),vocal=clamp(speech),closure=clamp(blink);
  return {
    R1_BrowConcern:.24+.50*worry,
    R1_BrowKnit:.18*worry+.20*pressure,
    R1_LipPress:clamp(.18+.42*pressure-.35*vocal),
    R1_JawVowel:.58*vocal,
    R1_MouthWide:.25*vocal,
    R1_CheekTension:.16*worry+.22*pressure,
    R1_Nasolabial:.14*worry+.18*vocal,
    R1_BlinkL:closure,R1_BlinkR:closure,
    R1_ChestBreath:clamp(.5+breath*18),
    R1_ShoulderReach:hero?.chapter==='bang'?clamp(1-(hero.pose.retractL+hero.pose.retractR)/.48):0,
    R1_ElbowFoldL:hero?.chapter==='bang'?clamp(.42+hero.pose.retractL*1.8):0,
    R1_ElbowFoldR:hero?.chapter==='bang'?clamp(.40+hero.pose.retractR*1.8):0,
    R1_CollarTension:.35*worry+.30*pressure,
  };
}
