import {DISPATCH_END,OPENING_TIMELINE} from './asylum-story-script.js';
import {samplePrologueDriving} from './prologue-driving.js';
import {samplePrologueExit} from './prologue-performance.js';
export const clamp=(n,a=0,b=1)=>Number.isFinite(n)?Math.max(a,Math.min(b,n)):a;
export const smooth=n=>{const t=clamp(n);return t*t*(3-2*t);};
const start=samplePrologueDriving({chapter:'dispatch',time:DISPATCH_END,chapterTime:OPENING_TIMELINE.chapters.find(c=>c.id==='dispatch').end-OPENING_TIMELINE.chapters.find(c=>c.id==='dispatch').start},{timeline:OPENING_TIMELINE});
const reveal=.9,impact=2.5,speed=6,parked=[.64,0,start.position[2]-speed*(reveal+impact)];
export const CRASH=Object.freeze({start:Object.freeze(start.position),reveal,cruiseSpeed:speed,impact,nearMiss:1.7,stationaryStanley:Object.freeze([-2.3,0,start.position[2]-speed*(reveal+1.7)]),parked:Object.freeze(parked),pole:Object.freeze([parked[0],0,parked[2]-1.969]),yaw:0,frontageOffsetZ:parked[2]-5.5});
const smoother=u=>{u=clamp(u);return u*u*u*(10+u*(-15+6*u));};
function travelledArc(t){const end=Math.min(t,1.8),n=32,h=end/n,delta=parked[0]-start.position[0];let sum=0;for(let i=0;i<=n;i++){const u=(h*i)/1.8,dx=delta*30*u*u*(1-u)*(1-u)/1.8;sum+=(i===0||i===n?1:i%2?4:2)*Math.hypot(speed,dx);}return sum*h/3+speed*Math.max(0,t-1.8);}
/** Single absolute path from the last dispatch frame through reveal and impact.
 * No restart of speed, wheel phase, heading or position at either scene seam.
 */
export function sampleEncounter(t,{reduced=false}={}){
 t=clamp(t,0,reveal);const distance=start.distance+speed*t;
 return {...start,time:t,position:[start.position[0],0,start.position[2]-speed*t],speed,yaw:0,steer:0,wheelRoll:distance/.31,distance,bodyPitch:reduced?0:Math.sin(distance*2.3)*.0012,bodyRoll:0,impacted:false,brokenGlass:false,glassBurst:0,cover:0,reduced};
}
export function sampleCrash(t,{reduced=false}={}){
 t=clamp(t,0,6);const travel=Math.min(t,impact),u=clamp(travel/1.8),delta=parked[0]-start.position[0],dx=u<1?delta*30*u*u*(1-u)*(1-u)/1.8:0,ddx=u<1?delta*60*u*(1-u)*(1-2*u)/(1.8*1.8):0;
 const age=t-impact,rebound=age>0&&age<.65?.045*Math.sin(Math.PI*age/.65)**2:0,reboundVelocity=age>0&&age<.65?.045*Math.PI/.65*Math.sin(2*Math.PI*age/.65):0;
 const position=[u>=1?parked[0]:start.position[0]+delta*smoother(u),0,start.position[2]-speed*(reveal+travel)+rebound],distance=start.distance+speed*reveal+travelledArc(travel);
 const moving=t<impact,roadPitch=Math.sin(distance*2.3)*.0012,impactPitch=age>=0&&age<.65?-.025*Math.sin(Math.PI*age/.65)*Math.exp(-3*age):0;
 return {time:t,position,yaw:dx?Math.atan2(-dx,speed):0,steer:Math.atan(-2.55*speed*ddx/(speed*speed+dx*dx)**1.5),wheelRoll:(distance-rebound)/.31,distance:distance-rebound,bodyPitch:reduced?0:moving?roadPitch:impactPitch,bodyRoll:0,speed:moving?Math.hypot(speed,dx):Math.abs(reboundVelocity),velocity:moving?[dx,0,-speed]:[0,0,reboundVelocity],nearMiss:t>=CRASH.nearMiss,impacted:t>=impact,brokenGlass:t>=impact,glassBurst:age>=0?Math.max(0,1-age/.55):0,cover:reduced?Math.max(0,1-Math.abs(age)/.4):0,reduced};
}
export function sampleCrashExit(t){const pose=samplePrologueExit(clamp(t-.25,0,1.6));return {...pose,car:sampleCrash(6)};}
