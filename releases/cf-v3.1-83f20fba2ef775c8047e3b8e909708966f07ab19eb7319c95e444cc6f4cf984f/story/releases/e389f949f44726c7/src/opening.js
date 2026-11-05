import {createChildhoodMemory,STORY_IDENTITIES,IDENTITY_HOLD_SECONDS} from './cf-story-memory.js';
import {createCrashOriginalBeat} from './crash-original-opening.js';
import {ease} from './prologue-performance.js';
import {createIntro,INTRO} from './intro.js';
import {createPrologue,PROLOGUE} from './prologue.js';
import {createPrologueTimeline} from './prologue-script.js';
import {PROLOGUE_VOICE_TIMING} from './prologue-voice-timing.js';

/** Isolated story actors and credits never advance the live hunt or weather. */
export function createOpening({onCue=()=>{},onIntroCue=()=>{},durations=PROLOGUE_VOICE_TIMING,crashOriginal=false,crashReady=()=>true,onTransition=()=>{}}={}){
  const timeline=createPrologueTimeline({durations}),titlesAt=timeline.chapters.find(c=>c.id==='solid_return').start;
  const story=createPrologue({onCue,durations,timeline}),titles=createIntro({onCue:onIntroCue});
  const dispatchEnd=timeline.chapters.find(c=>c.id==='dispatch').end,crash=createCrashOriginalBeat({onCue});let crashStarted=false,crashFinished=false;
  const undeadAt=timeline.chapters.find(c=>c.id==='undead').start+1.5;
  const memory=createChildhoodMemory({capture:()=>({...story.player}),restore:saved=>Object.assign(story.player,saved),clearInput:onTransition});
  let identityRemaining=0,pendingSkip=null;
  function skipAll(){skipped=true;story.finish();titles.finish();phase='ready';}
  function skipStoryNow(){storySkipped=true;story.finish();if(titlesPlayed){phase='ready';return;}stage='credits';titles.begin({replay:true});if(phase==='paused')titles.pause();}
  let phase='preflight',stage='prologue',replay=false,disposed=false,skipped=false,titlesPlayed=false,storySkipped=false;
  return {
    get phase(){return phase;},get stage(){return stage;},get active(){return phase!=='finished';},get replaying(){return replay;},get transitionActive(){return identityRemaining>0||memory.active;},get memoryActive(){return memory.active;},get player(){return memory.active?memory.player:crashStarted&&!crashFinished?crash.player:story.player;},
    begin({replay:isReplay=false}={}){
      if(disposed||phase==='playing'||(!isReplay&&phase!=='preflight'))return false;
      // Replay owns a fresh story cursor even when requested from a paused
      // opening. Continue uses resume() and leaves that cursor untouched.
      if(isReplay){story.finish();titles.finish();}
      memory.reset();identityRemaining=IDENTITY_HOLD_SECONDS;pendingSkip=null;onTransition();
      crash.reset();crashStarted=false;crashFinished=false;replay=isReplay;stage='prologue';skipped=false;titlesPlayed=false;storySkipped=false;story.begin();phase='playing';return true;
    },
    tick(dt,controls={}){
      if(disposed||phase!=='playing'||!Number.isFinite(dt)||dt<=0)return;
      if(identityRemaining>0){identityRemaining=Math.max(0,identityRemaining-dt);if(identityRemaining===0){onTransition();if(pendingSkip==='all')skipAll();else if(pendingSkip==='story')skipStoryNow();pendingSkip=null;}return;}
      if(memory.active){memory.tick(dt,controls);return;}
      // One story cursor stops exactly at full liquid coverage. Titles have
      // their existing 20-second clock, then the same story continues.
      while(dt>1e-8&&phase==='playing'){
        if(stage==='prologue'){
          if(crashOriginal&&!crashFinished&&story.snapshot().time>=dispatchEnd-1e-8){
            if(!crashReady())break;
            crashStarted=true;const used=crash.tick(dt,controls);dt-=used;
            if(crash.done){crashFinished=true;story.resumeAfterCrash();}else if(used<=0)break;
            continue;
          }
          if(!memory.seen&&story.snapshot().time>=undeadAt-1e-8){memory.begin(story.frame());return;}
          const routeStop=crashOriginal&&!crashFinished?dispatchEnd:titlesPlayed?timeline.duration:titlesAt;
          const stop=memory.seen?routeStop:Math.min(routeStop,undeadAt);
          const used=story.tick(dt,controls,stop);dt-=used;
          if(!memory.seen&&story.snapshot().time>=undeadAt-1e-8){memory.begin(story.frame());return;}
          if(!titlesPlayed&&story.snapshot().time>=titlesAt-1e-8){stage='credits';titles.begin({replay:true});}
          else if(story.phase==='finished')phase='ready';
          else if(used<=0)break;
        }else{
          const used=Math.min(dt,INTRO.duration-titles.snapshot().time);titles.tick(used);dt-=used;
          if(titles.phase==='ready'){
            titlesPlayed=true;
            if(storySkipped)phase='ready';else stage='prologue';
          }else if(used<=0)break;
        }
      }
    },
    pause(){if(phase==='playing'){phase='paused';story.pause();titles.pause();memory.pause();}},
    resume(){if(phase==='paused'){phase='playing';story.resume();titles.resume();memory.resume();}},
    skipMemory(){return memory.skip();},
    skipStory(){if(!['playing','paused'].includes(phase)||stage!=='prologue')return;if(memory.active){memory.skip();return;}if(identityRemaining>0){pendingSkip='story';return;}skipStoryNow();},
    skip(){if(disposed||phase==='finished'||phase==='preflight')return;if(memory.active){memory.skip();return;}if(identityRemaining>0){pendingSkip='all';return;}skipAll();},
    resetToTitle(){
      if(disposed)return false;
      memory.reset();identityRemaining=0;pendingSkip=null;story.finish();titles.finish();crash.reset();
      crashStarted=false;crashFinished=false;replay=false;skipped=false;titlesPlayed=false;storySkipped=false;stage='prologue';phase='preflight';onTransition();return true;
    },
    finish(){memory.cancel();identityRemaining=0;pendingSkip=null;story.finish();titles.finish();phase='finished';},
    frame(reduced=false){
      if(memory.active)return {...memory.frame(),reduced,stage,shot:'prologue',label:'',name:'',opacity:0,accent:0};
      if(stage==='credits'){const frame=titles.frame(reduced),handoffFade=ease(frame.time,19.65,20);return {...frame,opacity:frame.opacity*(1-handoffFade),handoffFade,stage,returning:false};}
      const frame=crashStarted&&!crashFinished?crash.frame(reduced):story.frame(reduced);
      return {...frame,stage,shot:'prologue',label:'',name:'',opacity:0,accent:0,...(identityRemaining>0?{identityCard:STORY_IDENTITIES.present,spoken:'',speaker:'',line:null,nextLine:null}:{} )};
    },
    snapshot(){return {memory:memory.snapshot(),identityRemaining,pendingSkip,crash:crash.snapshot(),crashStarted,crashFinished,phase,stage,replay,skipped,storySkipped,titlesPlayed,titlesAt,time:story.snapshot().time,story:story.snapshot(),credits:titles.snapshot(),duration:(story.snapshot().duration||PROLOGUE.duration)+INTRO.duration};},
    dispose(){memory.dispose();identityRemaining=0;disposed=true;story.dispose?.();titles.dispose();phase='finished';},
  };
}
