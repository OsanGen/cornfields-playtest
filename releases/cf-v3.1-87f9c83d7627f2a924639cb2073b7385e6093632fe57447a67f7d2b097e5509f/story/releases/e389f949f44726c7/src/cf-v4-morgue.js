// Scene-owned morgue sequence. Geometry and input use these same six sockets.
const clamp=n=>Math.max(0,Math.min(1,n));
const ease=(t,a,b)=>{const x=clamp((t-a)/(b-a));return x*x*(3-2*x);};
const mix=(a,b,t)=>t===1?b:t===0?a:a+(b-a)*t;
const copy=x=>x==null?x:structuredClone(x);
const same=(a,b)=>a&&b&&['runId','sceneId','entryId'].every(k=>a[k]===b[k]);
export const MORGUE_INTRO_SECONDS=23;
export const MORGUE_QTE_SECONDS=6;
export const MORGUE_LAYOUT=Object.freeze({
 bounds:{x:[-3.35,3.35],z:[-3.65,3.55]},eyeHeight:1.58,
 start:{x:0,y:0,z:2.25,yaw:0,pitch:Math.atan2(1.03-1.58,2)},
 searchStart:{x:1.7,y:0,z:.9,yaw:0,pitch:0},
 colliders:[{id:'examination-table',minX:-.8,maxX:.8,minZ:-.22,maxZ:.78},
  {id:'mortuary-bank',minX:-2.35,maxX:2.35,minZ:-3.75,maxZ:-2.44},
  {id:'sink',minX:-3.38,maxX:-2.72,minZ:.6,maxZ:1.55},
  {id:'cabinet',minX:2.73,maxX:3.38,minZ:1.75,maxZ:2.65}],
 drawers:Array.from({length:6},(_,index)=>Object.freeze({index,id:'morgue-fridge-'+index,label:String(index+1).padStart(2,'0'),x:(index%3-1)*1.5,y:index<3?.62:1.55,z:-2.4,width:1.34})),
});
let attemptSerial=0;
export function createMorgueAttempt(random=Math.random){
 const value=random();if(!Number.isFinite(value)||value<0||value>=1)throw Error('Invalid morgue random value');
 return {id:++attemptSerial,target:Math.floor(value*6)};
}
const face=(p,target)=>({...p,yaw:Math.atan2(p.x-target.x,p.z-target.z),pitch:Math.atan2(target.y-MORGUE_LAYOUT.eyeHeight,Math.hypot(p.x-target.x,p.z-target.z))});
export function sampleMorgueIntro(seconds,target=0){
 const t=Math.max(0,Math.min(MORGUE_INTRO_SECONDS,seconds)),d=MORGUE_LAYOUT.drawers[target];
 if(!d)throw Error('Unknown morgue drawer');
 const settle=ease(t,21,23);
 const p={x:mix(0,1.7,ease(t,6,10.5)),y:0,z:mix(mix(2.25,1.4,ease(t,0,2.4)),.9,ease(t,9,14))};
 const hand={x:0,y:1.21,z:.25,yaw:0,pitch:0,visible:t>=2&&t<20.8,moving:t>=9};
 if(t>=6&&t<8){hand.x=mix(0,.62,ease(t,6,8));hand.z=mix(.25,.55,ease(t,6,8));}
 else if(t>=8&&t<9){hand.x=mix(.62,.93,ease(t,8,9));hand.y=mix(1.21,.03,ease(t,8,9));hand.z=mix(.55,.83,ease(t,8,9));}
 else if(t>=9&&t<17){const u=ease(t,9,17);hand.x=mix(.93,d.x+.72,u);hand.y=.035;hand.z=mix(.83,d.z+.15,u);hand.yaw=Math.atan2(.93-(d.x+.72),.83-(d.z+.15));}
 else if(t>=17&&t<18.6){const u=ease(t,17,18.6);hand.x=d.x+.72;hand.z=mix(d.z+.15,d.z+.96,u);hand.y=mix(.035,d.y+.44,u);hand.pitch=Math.PI/2*ease(t,17,17.4);}
 else if(t>=18.6&&t<19.4){const u=ease(t,18.6,19.4);hand.x=mix(d.x+.72,d.x,u);hand.y=d.y+.44;hand.z=d.z+.96;}
 else if(t>=19.4){const u=ease(t,19.4,20.8);hand.x=d.x;hand.y=mix(d.y+.44,d.y-.23,u);hand.z=mix(d.z+.96,d.z-.7,u);}
 const track=ease(t,5.4,6.4),look=t<20.8?{x:mix(0,hand.x,track),y:mix(1.03,hand.y+.045,track),z:mix(.25,hand.z,track)}:{x:d.x,y:d.y-.185,z:d.z-.7};
 const player=face(p,look);player.pitch=mix(player.pitch,-.06,settle);
 return {seconds:t,player,hand,coolerOpen:ease(t,.7,2.4),drawerAmount:ease(t,17,18.4)*(1-ease(t,20.2,21.8)),target,complete:t>=23};
}
export function morgueColliders(drawers=[]){
 return [...MORGUE_LAYOUT.colliders,...drawers.filter(d=>d.amount>.04).map(d=>{
  const socket=MORGUE_LAYOUT.drawers[d.index];
  return {id:socket.id+'-tray',minX:socket.x-.64,maxX:socket.x+.64,minZ:socket.z-.08,maxZ:socket.z+d.amount*.88+.06};
 })];
}
export function morgueOffer(player,drawers){
 if(!player)return null;
 const pitch=player.pitch||0,cp=Math.cos(pitch),forward={x:-Math.sin(player.yaw)*cp,y:Math.sin(pitch),z:-Math.cos(player.yaw)*cp};
 return MORGUE_LAYOUT.drawers.map(d=>{const dx=d.x-player.x,dy=d.y-MORGUE_LAYOUT.eyeHeight,dz=d.z-player.z;
  return {d,dist:Math.hypot(dx,d.z+.45-player.z),aim:(forward.x*dx+forward.y*dy+forward.z*dz)/Math.hypot(dx,dy,dz)};})
  .filter(({dist,aim})=>dist<1.65&&aim>.90).sort((a,b)=>b.aim-a.aim)[0]?.d||null;
}
export function createMorgueEncounter({token,mode='intro',attempt=createMorgueAttempt()}={}){
 if(!token||!Number.isInteger(token.runId)||!Number.isInteger(token.entryId)||!['intro','search'].includes(mode)||!MORGUE_LAYOUT.drawers[attempt.target])throw Error('Invalid morgue entry');
 const identity={...token},recipe=copy(attempt),drawers=MORGUE_LAYOUT.drawers.map(d=>({index:d.index,amount:0,target:0,checked:false}));
 let phase=mode==='intro'?'intro':'search',elapsed=0,seconds=0,phaseTime=0,disposed=false,completed=false;
 let presses=0,pushImpulse=0,hold=0,holdCommitted=false,contact=null,door=null,lastSound=0,events=[],emitted=new Set();
 const emit=(type,detail={})=>{events.push({type,token:{...identity},...detail});};
 const once=(type,detail={})=>{if(!emitted.has(type)){emitted.add(type);emit(type,detail);}};
 const enter=next=>{phase=next;phaseTime=0;};
 function snapshot(){
  const cinematic=phase==='intro'?sampleMorgueIntro(seconds,recipe.target):null;
  const attack=['lunge','struggle','fatal'].includes(phase);
  const attackPlayer=attack?{...contact.player,pitch:mix(contact.player.pitch,-.08,phase==='lunge'?ease(phaseTime,0,.65):1)}:null;
  return {morgue:true,phase,elapsed,phaseTime,completed,canMove:phase==='search',canLook:phase==='search',
   cinematic,drawers:copy(drawers),offer:door,checked:drawers.filter(d=>d.checked).length,
   hand:cinematic?.hand||{visible:false},coolerOpen:cinematic?.coolerOpen??1,
   attack:attack?{drawer:contact.drawer,player:attackPlayer}:null,
   scriptedPlayer:phase==='pulling'?{...contact.player,x:mix(contact.origin.x,contact.player.x,ease(phaseTime,0,.24)),z:mix(contact.origin.z,contact.player.z,ease(phaseTime,0,.24))}:
    attack?attackPlayer:phase==='opening'?contact?.player:null,
   presses,targetPresses:8,pushImpulse,cameraDrop:phase==='struggle'?Math.min(.16,phaseTime*.06):0,
   captureProgress:phase==='lunge'?clamp(phaseTime/.65):phase==='struggle'?clamp(phaseTime/MORGUE_QTE_SECONDS):phase==='fatal'?1:0,
   fade:phase==='fatal'?1:phase==='struggle'?ease(phaseTime,4.8,6):0,
   objective:phase==='search'?'Find the hand. Check the mortuary refrigerators.':phase==='struggle'?'Get it off.':null};
 }
 function update(dt,input={}){
  if(!Number.isFinite(dt)||dt<0)throw Error('Invalid morgue clock');events=[];
  if(disposed||completed||!same(input.token,identity)||input.active!==true||input.ready!==true)return {state:snapshot(),events};
  elapsed+=dt;pushImpulse=Math.max(0,pushImpulse-dt*4);
  if(phase==='intro'){
   const limit=!input.setupComplete?0:!input.examinationComplete?8:!input.floorLineComplete?17:!input.introComplete?22.4:23;
   const before=seconds;seconds=Math.min(limit,seconds+dt);
   if(before<2.4&&seconds>=2.4)once('morgue-container-open');
   if(before<9&&seconds>=9)once('morgue-hand-fell');
   if(before<17&&seconds>=17)once('morgue-hand-climb');
   if(before<21.8&&seconds>=21.8)once('morgue-hand-hidden');
   if(seconds>=23){completed=true;once('morgue-intro-complete');}
   return {state:snapshot(),events};
  }
  for(const d of drawers){const step=dt/ .55;d.amount=d.target>d.amount?Math.min(d.target,d.amount+step):Math.max(d.target,d.amount-step);}
  if(phase==='pulling'){
   phaseTime=Math.min(.24,phaseTime+dt);
   if(phaseTime>=.24){const d=drawers[contact.drawer];d.target=1;d.checked=true;enter(contact.drawer===recipe.target?'opening':'search');}
   return {state:snapshot(),events};
  }
  if(phase==='search'){
   const d=morgueOffer(input.player,drawers);door=d?{...d,open:drawers[d.index].target===1}:null;
   if(input.interact&&d&&Math.abs(drawers[d.index].amount-drawers[d.index].target)<.01){
    const state=drawers[d.index],open=state.target!==1;
    if(open){const origin={...input.player};contact={drawer:d.index,origin,player:face({...origin,z:Math.max(origin.z,d.z+1.35)},{x:d.x,y:d.y,z:d.z})};enter('pulling');}
    else state.target=0;
    emit('morgue-door',{drawer:d.index,open,position:{x:d.x,z:d.z}});
   }
   if(elapsed-lastSound>=8){lastSound=elapsed;once('morgue-hunt-started');emit('morgue-fridge-rattle',{position:{x:0,z:-2.4}});}
  }else if(phase==='opening'){
   if(drawers[contact.drawer].amount>=.94){enter('lunge');once('morgue-capture');}
  }else if(phase==='lunge'){
   phaseTime=Math.min(.65,phaseTime+dt);if(phaseTime>=.65){enter('struggle');hold=0;holdCommitted=false;once('morgue-struggle');}
  }else if(phase==='struggle'){
   // Start the fatal struggle only after its prompt has been presented. Buffered
   // presses from the search/cinematic cannot count as fresh QTE input.
   if(input.pushReady!==true){hold=0;holdCommitted=false;return {state:snapshot(),events};}
   phaseTime=Math.min(MORGUE_QTE_SECONDS,phaseTime+dt);
   const pushMode=input.pushMode||'repeat';let count=0;
   if(pushMode==='hold'){
    if(input.pushHeld){hold+=dt;if(hold>=.65&&!holdCommitted){count=8;holdCommitted=true;}}
    else {hold=0;holdCommitted=false;}
   }else count=Math.min(8,Math.max(0,input.pushPresses||0))*(pushMode==='single'?8:1);
   if(count){presses=Math.min(8,presses+count);pushImpulse=1;emit('morgue-push');}
   if(phaseTime>=MORGUE_QTE_SECONDS){enter('fatal');completed=true;once('morgue-complete');}
  }
  return {state:snapshot(),events};
 }
 return {snapshot,update,receipt:()=>copy(recipe),releasePush(){hold=0;holdCommitted=false;},dispose(){disposed=true;events=[];}};
}
