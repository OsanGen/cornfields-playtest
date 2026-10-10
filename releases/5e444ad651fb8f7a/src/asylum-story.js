import {createPrologue} from './prologue.js';
import {createIntro} from './intro.js';
import {SCENES,EVENTS,NEW_LINES,RETAINED_LINES,OPENING_TIMELINE,DISPATCH_END,DESCRIPTIONS} from './asylum-story-script.js';
import {clamp} from './asylum-crash.js';
import {HOSPITAL,moveHospital} from './asylum-hospital.js';
import {entryRecord,requestHallEntry} from './asylum-handoff.js';
export const DEFAULT_COMFORT=Object.freeze({reducedMotion:false,master:.7,voice:1,effects:.7});
export function createStory({onCue=()=>{}}={}){
 let disposed=false,index=0,time=0,phase='preflight',generation=0,held=false,checkpoint='CP0',progress=0,standing=false;
 let comfort={...DEFAULT_COMFORT},player={x:.5,y:1.13,z:.35,yaw:0,pitch:0};
 const facts=new Set(),watched=new Set(),skipped=new Set(),exposure=new Map();
 const makeOpening=()=>createPrologue({timeline:OPENING_TIMELINE,onCue:id=>{if(['entertainment_off','radio'].includes(id))onCue(id);}});let opening=makeOpening(),titles=createIntro({onCue:id=>onCue('title:'+id)});
 const scene=()=>SCENES[index],lines=()=>scene().id==='opening'?RETAINED_LINES:NEW_LINES[scene().id]||[];
 function fact(id,skip=false){
  if(facts.has(id))return;
  const require=(condition,message)=>{if(!condition)throw new Error(message);};
  if(id==='custody_confirmed')require(['cuffs_closed','stanley_seated','rear_door_closed','handle_checked'].every(x=>facts.has(x)),'Unsecured custody');
  if(id==='vines_closed')require(facts.has('both_officers_clear'),'Early vine closure');
  if(id==='impossible_return')require(facts.has('custody_confirmed'),'Return without custody');
  if(id==='shot')require(facts.has('impossible_return'),'Shot before return');
  if(id==='stanley_consumed')require(facts.has('apology_complete'),'Missing apology before consumption');
  if(id==='mike_consumed')require(facts.has('stanley_consumed'),'Reversed consumption');
  facts.add(id);if(id==='custody_confirmed')checkpoint='CP1';if(id==='CP2'||id==='CP3')checkpoint=id;
  if(!skip)onCue(id);
 }
 function canonical(){for(const [id]of EVENTS[scene().id]||[])fact(id,true);for(const l of lines())if(!watched.has(l.id))skipped.add(l.id);}
 function advance(){
  if(index>=SCENES.length-1)return;
  index++;time=0;held=false;progress=0;
  if(scene().id==='field')player={...player,x:0,y:1.58,z:0};
  if(scene().id==='titles')titles.begin({replay:true});
  if(scene().id==='hospital_wake'){player={x:-1.1,y:1.0,z:.1,yaw:0,pitch:0};standing=false;}
  if(scene().id==='connector'){player={x:.3,y:1.58,z:.8,yaw:0,pitch:0};standing=true;}
  for(const [id,at]of EVENTS[scene().id]||[])if(at===0)fact(id);
 }
 const api={
  get phase(){return phase;},get generation(){return generation;},
  begin(){if(disposed||!['preflight','finished'].includes(phase))return false;phase='playing';opening.begin();return true;},
  tick(dt,controls={}){
   if(disposed||phase!=='playing'||!Number.isFinite(dt)||dt<=0)return 0;
   dt=Math.min(dt,.1);const id=scene().id,previous=time,edge=!!controls.interact&&!held;held=!!controls.interact;
   if(Number.isFinite(controls.yaw))player.yaw=controls.yaw;
   if(Number.isFinite(controls.pitch))player.pitch=clamp(controls.pitch,-1.15,1.15);
   if(id==='opening'){
    opening.tick(dt,{yaw:player.yaw,pitch:player.pitch},DISPATCH_END);time=opening.snapshot().time;
   }else if(id==='hospital_stand'){if(edge){standing=true;advance();}return dt;}
   else if(id==='boundary')return dt;
   else if(id==='field'){
    const forward=clamp(Number(controls.forward)||0,-1,1);progress=clamp(progress+Math.max(0,forward)*dt*2.2,0,8);
    time=Math.min(8,time+dt);player.x=clamp(player.x+(Number(controls.strafe)||0)*dt*1.5,-.65,.65);player.y=1.58;player.z=-progress;
   }else if(id==='connector'){
    const forward=clamp(Number(controls.forward)||0,-1,1),strafe=clamp(Number(controls.strafe)||0,-1,1),n=Math.max(1,Math.hypot(forward,strafe));
    const x=player.x+(-Math.sin(player.yaw)*forward+Math.cos(player.yaw)*strafe)*dt*1.8/n,z=player.z+(-Math.cos(player.yaw)*forward-Math.sin(player.yaw)*strafe)*dt*1.8/n;
    player=moveHospital(player,x-player.x,z-player.z);
    if(player.z<=HOSPITAL.boundaryZ+.001)advance();return dt;
   }else{time=Math.min(scene().duration,time+dt);if(id==='titles')titles.tick(dt);}
   for(const l of lines()){
    const amount=Math.max(0,Math.min(time,l.end)-Math.max(previous,l.start));
    if(amount){exposure.set(l.id,(exposure.get(l.id)||0)+amount);if(exposure.get(l.id)>=l.end-l.start-.001&&!skipped.has(l.id))watched.add(l.id);}
   }
   for(const [event,at]of EVENTS[id]||[])if(event==='both_officers_clear'?progress>=7.8:previous<=at&&time>=at)fact(event);
   if(time>=scene().duration-1e-8&&(id!=='field'||progress>=8))advance();return dt;
  },
  pause(){if(phase!=='playing')return false;phase='paused';held=false;opening.pause();titles.pause();return true;},
  resume(){if(disposed||phase!=='paused')return false;phase='playing';held=false;opening.resume();titles.resume();return true;},
  skipScene(){if(disposed||!['playing','paused'].includes(phase)||scene().id==='boundary')return false;canonical();advance();return true;},
  skipIntroduction(){if(disposed)return false;while(scene().id!=='hospital_stand'&&index<SCENES.length-1){canonical();advance();}phase='playing';return true;},
  replay(){if(disposed)return false;generation++;index=time=progress=0;checkpoint='CP0';standing=false;held=false;facts.clear();watched.clear();skipped.clear();exposure.clear();player={x:.5,y:1.13,z:.35,yaw:0,pitch:0};opening.dispose();titles.dispose();opening=makeOpening();titles=createIntro({onCue:id=>onCue('title:'+id)});phase='preflight';return api.begin();},
  setComfort(values){for(const k of ['master','voice','effects'])if(Number.isFinite(values[k]))comfort[k]=clamp(values[k]);if(typeof values.reducedMotion==='boolean')comfort.reducedMotion=values.reducedMotion;},
  frame(){
   const current=scene(),line=lines().find(l=>time>=l.start&&time<l.end)||null;
   return {scene:current.id,title:current.title,time,phase,checkpoint,player:{...player},standing,comfort:{...comfort},facts:[...facts],line,caption:line?.text||'',description:DESCRIPTIONS[current.id]||'',opening:current.id==='opening'?opening.frame(comfort.reducedMotion):null,titles:current.id==='titles'?titles.frame(comfort.reducedMotion):null,progress};
  },
  snapshot(){return {scene:scene().id,time,phase,checkpoint,player:{...player},standing,comfort:{...comfort},facts:[...facts],watched:[...watched],skipped:[...skipped],generation};},
  hall(){return requestHallEntry(entryRecord(api.snapshot()));},
  dispose(){if(disposed)return;disposed=true;phase='disposed';opening.dispose();titles.dispose();held=false;},
 };
 return api;
}
