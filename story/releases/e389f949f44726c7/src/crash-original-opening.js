import {PROLOGUE_LINES} from './prologue-script.js';
import {sampleCrash,sampleEncounter} from './asylum-crash.js';
const retained=(id,start,end)=>({...PROLOGUE_LINES.find(l=>l.id===id),start,end});
const lines=[{id:'CRASH-01',speaker:'CLARANCE',voice:'clarence',text:'Are you okay, Mike?',start:3.9,end:6.7,audioMode:'subtitle-only'},
{id:'RECOVERY-MIKE',speaker:'MIKE',voice:'mike',text:'I hit my head in the crash.',start:7.1,end:10.1,audioMode:'subtitle-only'},
{id:'RECOVERY-CLARANCE',speaker:'CLARANCE',voice:'clarence',text:'I’ll deal with this while you get yourself straight.',start:10.3,end:14.5,audioMode:'subtitle-only'},retained('ARR-01',14.9,19.2),retained('ARR-02',19.4,21)];
export const CRASH_ORIGINAL_DURATION=28.9;
export function createCrashOriginalBeat({onCue=()=>{}}={}){
 let time=0,impact=false,player={x:.5,y:1.13,z:.35,yaw:0,pitch:0};
 return {get player(){return player;},reset(){time=0;impact=false;player={x:.5,y:1.13,z:.35,yaw:0,pitch:0};},get done(){return time>=CRASH_ORIGINAL_DURATION;},tick(dt,controls={}){const used=Math.min(Math.max(0,dt),CRASH_ORIGINAL_DURATION-time);time+=used;for(const k of ['yaw','pitch'])if(Number.isFinite(controls[k]))player[k]=controls[k];if(time>=3.4&&!impact){impact=true;onCue('vehicle_impact');}return used;},
 frame(reduced=false){const scene=time<.9?'encounter':time<6.9?'crash':'exit',local=scene==='encounter'?time:scene==='crash'?time-.9:time-6.9,line=lines.find(l=>time>=l.start&&time<l.end)||null;
 return {crashOriginal:true,profile:'crash-original-v3',scene,time:local,audioTime:time,chapter:scene==='exit'?'recovery':scene,chapterTime:local,chapterProgress:0,player:{...player},comfort:{reducedMotion:reduced},reduced,line,spoken:line?.text||'',speaker:line?.speaker||'',nextLine:lines.find(l=>l.start>time)||null,nextRecordedLine:lines.find(l=>l.audioMode==='recorded'&&l.start>time)||null,facts:[],canMove:false,waitingForExit:false,driving:scene==='encounter'?sampleEncounter(local,{reduced}):sampleCrash(scene==='crash'?local:6,{reduced}),joinFade:Math.max(0,(time-CRASH_ORIGINAL_DURATION+.4)/.4)};},snapshot:()=>({time,impact,done:time>=CRASH_ORIGINAL_DURATION})};
}
