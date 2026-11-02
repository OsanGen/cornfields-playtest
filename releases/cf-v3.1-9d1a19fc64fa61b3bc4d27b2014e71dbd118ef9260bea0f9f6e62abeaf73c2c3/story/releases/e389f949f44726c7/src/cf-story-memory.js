/** CF-S1: shared identity UI and a render-only, look-only memory clock.
 * No timers, audio, AI, persistence or second render loop are created here.
 * The caller MUST suspend its story/game clocks while active, and clear input
 * at transition boundaries. capture/restore retain the caller's exact state.
 */
export const STORY_IDENTITIES=Object.freeze({
  present:Object.freeze({title:'CLARENCE',subtitle:'PRESENT'}),
  childhood:Object.freeze({title:'CLARENCE',subtitle:'CHILDHOOD'}),
  kindergarten:Object.freeze({title:'SADIE',subtitle:'KINDERGARTEN'}),
});
export const IDENTITY_HOLD_SECONDS=1.7;
const copy=value=>value==null?value:structuredClone(value);
const positive=(value,fallback)=>Number.isFinite(value)&&value>0?value:fallback;

/** One opaque treatment; callers own readable timing and pause controls. */
export function createIdentityCard({document=globalThis.document,zIndex=6}={}){
  const node=document.createElement('div'),title=document.createElement('div'),subtitle=document.createElement('div');
  node.className='cf-identity-card';node.setAttribute('role','status');node.setAttribute('aria-live','polite');node.setAttribute('aria-atomic','true');
  node.style.cssText=`position:fixed;inset:0;z-index:${Number(zIndex)||6};background:#000;color:#eee9dd;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;pointer-events:none;padding:24px;box-sizing:border-box;`;
  title.style.cssText='font-family:Georgia,serif;font-size:clamp(38px,9vw,110px);font-weight:600;letter-spacing:.09em;line-height:1.15;';
  subtitle.style.cssText='font-family:system-ui,sans-serif;font-size:clamp(14px,2.4vw,24px);letter-spacing:.28em;margin-top:22px;line-height:1.5;';
  node.appendChild(title);node.appendChild(subtitle);document.body.appendChild(node);
  let current=null,disposed=false;
  function render(identity){
    if(disposed)return;
    node.style.display=identity?'flex':'none';node.hidden=!identity;
    const key=identity?`${identity.title}/${identity.subtitle}`:null;
    if(key!==current){title.textContent=identity?.title||'';subtitle.textContent=identity?.subtitle||'';current=key;}
  }
  render(null);
  return {render,node,dispose(){if(disposed)return;disposed=true;node.remove();}};
}

export function createChildhoodMemory({capture=()=>null,restore=()=>{},clearInput=()=>{},onEnter=()=>{},onExit=()=>{},onComplete=()=>{},duration=12,cardDuration=IDENTITY_HOLD_SECONDS}={}){
  const hold=positive(cardDuration,IDENTITY_HOLD_SECONDS),length=positive(duration,12);
  let phase='idle',time=0,seen=false,paused=false,disposed=false,source=null,saved=null,player=null,anchor=null,skipRequested=false,skipped=false;
  const active=()=>['entry','memory','return'].includes(phase);
  function leave(completed){
    if(!active())return false;
    // Restore before marking seen. A failed restore is not a completed memory.
    restore(copy(saved));clearInput();
    phase='idle';time=0;paused=false;
    if(completed)seen=true;
    onExit({completed,skipped});
    if(completed)onComplete({skipped});
    source=saved=player=anchor=null;
    return true;
  }
  function returning(){phase='return';time=0;clearInput();}
  return {
    get active(){return active();},get seen(){return seen;},get player(){return player;},
    begin(frame){
      if(disposed||active()||seen||!frame?.player)return false;
      const captured=copy(capture());
      source=copy(frame);saved=captured;player={...source.player,y:.95,flashlightOn:false,moving:false};
      anchor={x:player.x,z:player.z,yaw:player.yaw||0};
      phase='entry';time=0;paused=false;skipRequested=false;skipped=false;clearInput();onEnter();return true;
    },
    tick(dt,controls={}){
      if(!active()||paused||!Number.isFinite(dt)||dt<=0)return;
      if(phase==='memory'){
        if(Number.isFinite(controls.yaw))player.yaw=controls.yaw;
        if(Number.isFinite(controls.pitch))player.pitch=Math.max(-1.15,Math.min(1.15,controls.pitch));
      }
      // Do not consume residual time in the newly revealed phase: every card
      // is actually presented even after a slow frame or a queued skip.
      time+=dt;
      if(phase==='entry'&&time>=hold){if(skipRequested)returning();else{phase='memory';time=0;clearInput();}}
      else if(phase==='memory'&&time>=length)returning();
      else if(phase==='return'&&time>=hold)leave(true);
    },
    skip(){if(!active())return false;skipped=true;if(phase==='entry')skipRequested=true;else if(phase==='memory')returning();return true;},
    pause(){if(active())paused=true;},resume(){if(active())paused=false;},
    cancel(){return leave(false);},
    reset(){leave(false);seen=false;skipRequested=false;skipped=false;},
    frame(){
      if(!active())return null;
      const identityCard=phase==='entry'?STORY_IDENTITIES.childhood:phase==='return'?STORY_IDENTITIES.present:null;
      return {...copy(source),chapter:'undead',chapterTime:2,chapterProgress:2/5.2,returning:false,
        player:{...player},memoryAnchor:{...anchor},childMemory:true,memoryPhase:phase,identityCard,
        canMove:false,waitingForExit:false,spoken:'',speaker:'',line:null,nextLine:null,nextRecordedLine:null,
        red:0,mist:0,joinFade:0};
    },
    snapshot(){return {phase,time,seen,paused,skipped,skipRequested,active:active(),player:player?{...player}:null};},
    dispose(){leave(false);disposed=true;},
  };
}
