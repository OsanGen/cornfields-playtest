import {PENDING} from './asylum-handoff.js';
export function createStoryUI(document,{connected=false}={}){
 const node=id=>document.getElementById(id);let previous='',notice='',noticeScene='';
 function text(id,value){const n=node(id);if(n&&n.textContent!==value)n.textContent=value;}
 const hall=document.querySelector('[data-action="hall"]');if(hall&&connected)hall.textContent='Enter central hall';
 return {render(frame,{status='idle',error='',silent=false}={}){
  node('story-preflight').hidden=!['idle','loading','loaded'].includes(status);node('story-error').hidden=!error;node('story-pause').hidden=frame.phase!=='paused'||!!error;
  text('error-message',error);text('load-status',status==='loading'?'Loading the verified local assets…':status==='loaded'?'Ready. Choose Begin introduction when you’re ready.':silent?'Audio is unavailable. Captions remain available.':'');
  const opening=frame.opening,line=opening?.line||frame.line,caption=opening?.spoken||line?.text||'';text('speaker',line?.speaker||'');text('caption',caption);node('story-caption').hidden=!caption;
  if(previous!==frame.scene){text('event-description',frame.description);previous=frame.scene;if(noticeScene!==frame.scene)notice='';}
  text('story-prompt',notice|| (frame.scene==='field'?'WASD: walk with Clarance into the field':frame.scene==='hospital_stand'?'Look around. Press E or choose Stand when you’re ready.':frame.scene==='connector'?'Walk toward the door beneath the skylight.':frame.scene==='boundary'?(connected?'The central hall is ready. Enter when you’re ready.':PENDING):''));
  for(const action of ['stand','hall'])document.querySelector(`[data-action="${action}"]`).hidden=frame.scene!==(action==='stand'?'hospital_stand':'boundary');
  const title=frame.titles;node('intro-screen').hidden=!title;if(title){text('intro-label',title.label);text('intro-name',title.name);text('intro-ghost',title.name);node('intro-ghost').style.opacity=String(title.accent*.18);node('intro-ghost').style.transform=`translateX(${title.accent*5}px)`;document.querySelector('.intro-card').style.opacity=title.opacity;document.querySelector('.intro-card').classList.toggle('title-card',title.shot==='title');}
  let cover=0;if(frame.scene==='blackout')cover=1;if(frame.scene==='mike_engulf')cover=Math.max(0,Math.min(1,(frame.time-3.7)/1.1));if(frame.scene==='hospital_wake')cover=Math.max(0,1-frame.time/2.5);if(frame.scene==='opening')cover=opening.wake?.blink||0;if(frame.scene==='crash'&&frame.comfort.reducedMotion)cover=Math.max(0,1-Math.abs(frame.time-2.5)/.4);node('story-cover').style.opacity=String(cover);
 },notice(value,scene=previous){notice=value;noticeScene=scene;text('story-prompt',value);},settings(){return {reducedMotion:node('reduced').checked,...Object.fromEntries(['master','voice','effects'].map(k=>[k,Number(node(k).value)]))};},dispose(){}};
}
