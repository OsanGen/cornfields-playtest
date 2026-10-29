import {samplePrologueWake} from './prologue-performance.js';
import {sampleHallucination} from './prologue-hallucination.js';
import {interactionPrompt} from './game.js';
import {GAME_CONFIG} from './game-config.js';
import {interactionLocked} from './grapple.js';
import {corruptionFrame} from './horror-presentation.js';
import {INTRO} from './intro.js';
import {survivalTime} from './survival-ending.js';
import {checkpointVisionState} from './checkpoint-vision.js';

/** Presentation only: it never advances gameplay, captures the mouse or plays audio. */
export function createUI(document, {debug = false, reducedMotion = false, touch = false, horror = true} = {}) {
  const nodes = new Map();
  const node = id => {
    if (!nodes.has(id)) nodes.set(id, document.getElementById(id));
    return nodes.get(id);
  };
  const text = (id, value) => {
    const next = String(value);
    if (node(id).textContent !== next) node(id).textContent = next;
  };
  let readableThreat = '';
  let readableUntil = 0;
  let previousMessageAt = null;
  let previousResult = null;
  let previousSeconds=null,glitchUntil=0;
  let alias='STRANGER';
  let introFontsReady=false;
  const fontDeadline=Date.now()+2000;
  if(document.fonts?.load)Promise.all([document.fonts.load('600 16px "Barlow Condensed"'),document.fonts.load('16px "Rubik Glitch"')]).then(fonts=>{
    introFontsReady=Date.now()<=fontDeadline&&fonts.every(faces=>faces.length>0);
  }).catch(()=>{});
  node('debug').hidden = !debug;
  node('motion').checked = reducedMotion;
  node('intro-motion').checked = reducedMotion;
  document.body.classList.toggle('reduced-motion', reducedMotion);
  if (touch) {
    text('control-summary', 'LEFT THUMB MOVE · RIGHT SIDE LOOK');
    text('device-label', 'PHONE / LANDSCAPE');
    text('controls-help', 'Left stick: move · Drag right side: look · Buttons: fire, light, interact. Walk through a glowing HIDE HERE entrance for cover. Stay still, including your aim. Going deep attracts more creatures. Find Sadie Yates in the corridors. Grabbed? Tap STAB repeatedly.');
    text('light-label', 'LIGHT');
  }

  return {
    node,
    chooseIntroFont(){
      // Fix the font for this run. A late font load must not reflow a credit.
      document.body.classList.toggle('intro-fonts',introFontsReady);
    },
    renderIntro(intro,{enabled,portrait,coreReady,coreError,entering,pointerError,creditsOpen,muted,volume}){
      const phase=intro.phase, active=intro.active, preflight=phase==='preflight', ready=phase==='ready', paused=phase==='paused';
      const frame=intro.frame(reducedMotion);
      document.body.classList.toggle('intro-active',active);
      document.body.classList.toggle('intro-preflight',preflight);
      node('intro-screen').hidden=!active||preflight;
      node('intro-settings').hidden=!active;
      node('preflight-skip').hidden=!preflight;
      node('intro-content-note').hidden=!preflight;
      node('credits').hidden=!creditsOpen;
      node('credits-replay').hidden=active||!enabled;
      node('replay-intro').hidden=!enabled;
      node('intro-continue').hidden=!paused;
      node('intro-enter').hidden=!ready;
      node('intro-enter').disabled=!coreReady||!!coreError||entering||portrait;
      node('intro-skip').hidden=ready;
      node('intro-status').hidden=!paused&&!ready;
      text('intro-status',paused?'INTRO PAUSED':coreError?'The field could not load. Reload to retry.':pointerError||(!coreReady?'PREPARING THE FIELD...':portrait?'TURN YOUR PHONE TO ENTER THE FIELD':entering?'ENTERING THE FIELD...':''));
      text('intro-label',paused?'A MOMENT BETWEEN THE ROWS':frame.label);
      text('intro-name',paused?'Hold your breath.':frame.name);
      text('intro-ghost',paused?'':frame.name);
      node('intro-card').style.opacity=String(paused?1:frame.opacity);
      node('intro-card').className=`intro-card ${frame.shot==='title'&&!paused?'title-card':''}`;
      node('intro-ghost').style.opacity=String(frame.accent*.18);
      node('intro-ghost').style.transform=`translateX(${frame.accent*5}px)`;
      text('intro-mute',muted?'SOUND OFF':'SOUND ON');
      node('intro-mute').setAttribute?.('aria-pressed',String(muted));
      node('intro-volume').value=String(Math.round((volume??.55)*100));
      node('start-btn').disabled=!active&&!coreReady;
      text('start-btn',preflight?'BEGIN':'ENTER THE FIELD ↗');
      if(active){
        node('menu').hidden=!preflight;
        for(const id of ['hud','pause','result','touch-controls','rotate'])node(id).hidden=true;
        document.body.classList.toggle('playing',false);
      }
      text('credits-roles',INTRO.roles);
    },
    renderHandoff(amount=0){const veil=node('opening-reveal');if(!veil)return;veil.hidden=amount<=0;veil.style.opacity=String(Math.max(0,Math.min(1,amount)));},
    renderOpening(intro,{touch:openingTouch=touch,portrait=false,coreReady=false,coreError=null,entering=false,pointerError=''}={}){
      const frame=intro.frame(reducedMotion);
      // The original title-only flow remains owned by renderIntro.
      if(!frame.stage)return;
      const active=intro.active,phase=intro.phase,preflight=phase==='preflight',paused=phase==='paused',ready=phase==='ready';
      const playing=active&&phase==='playing',story=frame.stage==='prologue';
      const lids=node('story-eyelids'),blink=Math.max(samplePrologueWake(frame).blink,sampleHallucination(frame).blink);
      if(lids){lids.hidden=!playing||!story||blink<=0;lids.style.setProperty('--lid',String(blink));}
      document.body.classList.toggle('story-player',true);
      document.body.classList.toggle('opening-active',active);
      document.body.classList.toggle('opening-story',playing&&story);
      document.body.classList.toggle('opening-paused',active&&(paused||ready));
      node('intro-screen').style.zIndex=active&&(paused||ready)?'8':'5';
      node('intro-card').hidden=!active||preflight||ready||(!paused&&frame.stage!=='credits');
      node('intro-enter').hidden=true;
      node('intro-continue').hidden=!active||(!paused&&!ready);
      node('intro-continue').disabled=!coreReady||!!coreError||entering||portrait;
      text('intro-continue','CONTINUE');
      node('intro-settings').hidden=!active||(!preflight&&!paused&&!ready);
      node('preflight-skip').hidden=true;
      node('intro-content-note').hidden=true;
      node('opening-note').hidden=!active||!preflight;
      node('start-btn').disabled=!coreReady||!!coreError||entering||portrait;
      if(preflight)text('start-btn','BEGIN STORY');
      const status=coreError?'The field could not load. Reload to retry.':
        portrait?'TURN YOUR PHONE TO LANDSCAPE TO CONTINUE':
        entering?'PREPARING TO CONTINUE...':!coreReady?'PREPARING THE FIELD...':
        pointerError||(paused?'OPENING PAUSED':'');
      node('opening-status').hidden=!active||!preflight||!status;text('opening-status',status);
      node('intro-status').hidden=!active||(!paused&&!ready)||!status;text('intro-status',status);
      node('intro-skip').hidden=!active||preflight||ready;
      node('intro-skip').setAttribute?.('aria-keyshortcuts','K');
      text('intro-skip',openingTouch?'SKIP OPENING':'SKIP OPENING / K');
      node('story-skip').hidden=!active||!story||preflight||ready;
      text('story-skip',openingTouch?'SKIP STORY':'SKIP STORY / J');
      node('opening-pause').hidden=!playing;
      text('opening-pause',openingTouch?'PAUSE':'PAUSE / ESC');
      const liquidPhrase=playing&&story&&frame.chapter==='liquid'&&frame.chapterTime>=1&&frame.chapterTime<4;
      node('liquid-phrase').hidden=!liquidPhrase;
      const showCaption=playing&&story&&frame.chapter!=='liquid'&&!!frame.spoken;
      node('story-caption').hidden=!showCaption;
      text('story-speaker',showCaption?frame.speaker:'');text('story-subtitle',showCaption?frame.spoken:'');
      let tutorial='';
      if(playing&&story){
        if(frame.waitingForExit)tutorial=openingTouch?'TAP EXIT TO LEAVE THE CRUISER':'PRESS E TO EXIT';
        else if(frame.chapter==='car'&&!frame.player.looked)tutorial=openingTouch?'DRAG THE RIGHT SIDE TO LOOK AROUND':'MOVE MOUSE TO LOOK AROUND';
        else if(frame.chapter==='exit')tutorial=openingTouch?'INTERACT: USE / OPEN DOORS':'E: INTERACT / OPEN DOORS';
        else if(frame.chapter==='flashlight'&&!frame.player.flashlightOn)tutorial=openingTouch?'TAP LIGHT TO TURN ON YOUR FLASHLIGHT':'TURN ON YOUR FLASHLIGHT / F';
        else if(frame.followHeld||frame.chapter==='walk'&&frame.chapterTime<5)tutorial='FOLLOW STANLEY AND MIKE';
      }
      text('story-tutorial',tutorial);node('story-tutorial').hidden=!tutorial;
      node('touch-controls').hidden=active?!(playing&&story&&openingTouch):node('touch-controls').hidden;
      if(active){
        node('look-zone').hidden=false;
        node('move-stick').hidden=!frame.canMove;node('touch-fire').hidden=true;node('touch-stab').hidden=true;node('touch-pause').hidden=true;
        node('touch-interact').hidden=!frame.waitingForExit;node('touch-light').hidden=!frame.player?.flashlightOn&&!frame.canMove;
        node('touch-light').setAttribute?.('aria-pressed',String(!!frame.player?.flashlightOn));
        text('touch-interact','EXIT');
      }else{node('move-stick').hidden=document.body.classList.contains('cf-child-memory');node('touch-pause').hidden=false;}
      const chapterFringe={car:.03,dispatch:.04,emergence:.16,walk:.22,history:.35,disappearance:.45,arrival:.5,rupture:.7};
      const distortion=Number.isFinite(frame.distortion)?frame.distortion:chapterFringe[frame.chapter]||0;
      node('story-caption').style.setProperty('--story-fringe',`${reducedMotion?0:Math.max(0,Math.min(1,distortion))*.8}px`);
      text('credits-replay','REPLAY OPENING');text('replay-intro','REPLAY OPENING');text('title-btn','TITLE');
    },
    renderEnding(line){node('ending-caption').hidden=!line;text('ending-caption',line);},
    setAlias(value){alias=value;},
    setReducedMotion(value) {
      reducedMotion = value;
      document.body.classList.toggle('reduced-motion', value);
    },
    reset() {
      readableThreat = '';
      readableUntil = 0;
      previousMessageAt = null;
      previousResult = null;
      previousSeconds=null;glitchUntil=0;
    },
    focusMode(mode) {
      if (mode === 'paused') node('resume-btn').focus();
      if (mode === 'dead' || mode === 'won' || mode === 'playtest-ended') node('retry-btn').focus();
    },
    showError(message) {
      node('error').hidden = false;
      text('error-copy', message);
    },
    render(game) {
      const {mode, player} = game;
      const playing = mode === 'playing';
      const ended = mode === 'dead' || mode === 'won' || mode === 'playtest-ended';
      const locked=interactionLocked(game),qte=game.interaction?.phase==='qte';
      const recovering=game.interaction?.phase==='recovery';
      document.body.classList.toggle('grappling',locked);
      node('qte-prompt').hidden=!playing||!qte;
      text('qte-copy',touch?'TAP STAB - BREAK FREE':'SPAM SPACE - STAB');
      node('recovery-timer').hidden=!playing||!recovering;
      const seconds=recovering?Math.max(1,Math.ceil(game.interaction.recoveryDeadline-game.elapsed-1e-9)):0;
      text('recovery-number',seconds);
      if(seconds!==previousSeconds){previousSeconds=seconds;if([7,4,2].includes(seconds))glitchUntil=game.elapsed+.10;}
      node('recovery-timer').classList?.toggle('glitch',recovering&&!reducedMotion&&game.elapsed<glitchUntil);
      node('recovery-timer').classList?.toggle('urgent',seconds<=3);
      node('menu').hidden = mode !== 'menu';
      const childView=['classroom','classroom-card','hospital-card','handoff'].includes(game.survivalEnding?.phase);
      document.body.classList.toggle('cf-child-memory',childView);
      node('hud').hidden = !playing||childView;
      node('touch-controls').hidden = !touch || !playing;
      node('pause').hidden = mode !== 'paused';node('pause').style.zIndex='8';
      node('result').hidden = !ended;
      document.body.classList.toggle('playing', playing);
      document.body.classList.toggle('dead', mode === 'dead');
      document.body.classList.toggle('hiding', player.hidden && playing);
      for (const id of ['chapter', 'objective', 'caption', 'landmark']) text(id, game[id]);
      text('health', Math.ceil(player.health));
      text('ammo', player.ammo);
      text('flashlight-state', player.flashlightOn ? 'ON' : 'OFF');
      node('health-meter').style.setProperty('--health', player.health + '%');
      const ending=game.survivalEnding,active=ending?.phase==='active';
      node('trial-timer').hidden=!playing||!ending||['arrival','entry','room','exit','sadie','collapse','classroom-card','classroom','hospital-card','handoff'].includes(ending.phase);
      text('trial-timer',ending?`${active?'SURVIVE':'COMPLETE'} ${survivalTime(ending)}`:'');

      const prompt = interactionPrompt(game);
      node('prompt').hidden = !prompt || !playing;
      text('prompt-copy', prompt.replace(/^E - /, ''));
      if (touch) {
        node('touch-stab').hidden=!playing||!qte;
        for(const id of ['touch-fire','touch-light','look-zone'])node(id).hidden=locked;
        node('touch-interact').hidden = !prompt || !playing;
        text('touch-interact', prompt.replace(/^E - /, ''));
        node('touch-light').setAttribute?.('aria-pressed', String(player.flashlightOn));
        node('touch-fire').disabled = player.ammo <= 0;
        if(ending&&!['arrival','active'].includes(ending.phase))node('touch-fire').hidden=true;
        node('move-stick').hidden=childView;
        if(childView){node('touch-light').hidden=true;node('touch-interact').hidden=ending?.phase!=='classroom';text('touch-interact','SKIP MEMORY');node('touch-stab').hidden=true;node('look-zone').hidden=false;}
      }
      text('hide-status', 'DO NOT MOVE. IT CAN HEAR YOU.');
      const corruption=horror?corruptionFrame(game,{reduced:reducedMotion,touch}):{fragments:[],taunt:null};
      for(let i=0;i<4;i++){
        const fragment=corruption.fragments[i],element=node(`die-${i}`);
        element.hidden=!fragment;
        if(fragment){text(`die-${i}`,fragment.text);element.className=`die-fragment slot-${fragment.slot}`;}
      }
      const message = game.threat.activeMessage;
      if (message && game.threat.lastMessageAt !== previousMessageAt) {
        readableThreat = typeof message === 'string' ? message : message.text;
        readableUntil = game.elapsed + GAME_CONFIG.feedback.reducedMotionFadeSeconds;
        previousMessageAt = game.threat.lastMessageAt;
      }
      const visibleMessage = reducedMotion
        ? (game.elapsed < readableUntil ? readableThreat : '')
        : (typeof message === 'string' ? message : message?.text || '');
      text('threat-card', visibleMessage);
      node('threat-card').hidden = !playing || !visibleMessage||locked||recovering;
      const vision=checkpointVisionState(game,reducedMotion);
      if(vision.active)node('threat-card').hidden=true;
      text('caption',vision.active?vision.caption:game.caption);
      node('caption').className=vision.active?'checkpoint-vision':'';
      node('caption').style.setProperty('--checkpoint-red',String(vision.red));
      // One warning owner: the protected checkpoint vision, danger, then caption.
      const quiet=!playing||locked||recovering,threat=!node('threat-card').hidden,caption=vision.active||!!game.caption;
      node('caption').hidden=quiet||threat||!caption;
      node('hide-status').hidden=quiet||threat||caption||!player.hidden;
      const taunt=!quiet&&!threat&&!caption&&!player.hidden&&!prompt&&corruption.taunt;
      node('corn-taunt').hidden=!taunt;
      if(taunt)text('corn-taunt',`${alias}, ${taunt}`);
      node('danger').style.opacity = playing
        ? String(Math.min(0.7, (100 - player.health) / 170 + game.threat.intensity * 0.13))
        : '0';
      if(ending&&ending.phase!=='active'){
        for(const id of ['threat-card','hide-status','corn-taunt','caption',...Array.from({length:4},(_,i)=>`die-${i}`)])node(id).hidden=true;
        node('danger').style.opacity='0';
        if(['entry','room','exit'].includes(ending.phase)){text('chapter','THE PROJECTOR');text('objective','TRIAL ACCESS');text('landmark','');}
      }

      if (ended && previousResult !== mode) {
        const won = mode === 'won';
        text('result-label', won ? 'CORNFIELD / SADIE YATES FOUND' : 'THE FIELD REMEMBERS');
        text('result-title', won ? 'You found Sadie.' : 'You were found.');
        text('result-copy', won
          ? 'Sadie Yates is safe. The search is over.'
          : 'Shots buy time. Hide unseen. Remain completely still.');
        node('retry-btn').innerHTML = won
          ? 'ENTER AGAIN <span>↗</span>' : 'TRY AGAIN <span>↗</span>';
        text('result-time', Math.floor(game.elapsed / 60) + ':' +
          String(Math.floor(game.elapsed % 60)).padStart(2, '0') +
          ' IN THE FIELD · ' + game.metrics.shotsFired + ' SHOTS');
        if(mode==='playtest-ended'){
          text('result-label','CORNFIELD / DEEPER ACCESS');text('result-title','END OF CURRENT PLAYTEST');
          text('result-copy','The passage continues below.');node('retry-btn').innerHTML='PLAY AGAIN <span>↗</span>';
        }
        previousResult = mode;
      }
      if (debug) {
        text('debug', JSON.stringify({
          state: game.enemy.state,
          target: game.enemy.target,
          reason: game.enemy.reason,
          memory: game.enemy.memory,
          tier: game.progress.escalationTier,
          hidden: player.hidden,
          metrics: game.metrics,
          perception:game.enemy.perception,
          pacing:game.threat.pacing,
          zone:player.zone,
          fieldDepth:player.zone==='field'?Math.hypot(player.x,player.z):0,
          worldRevision:game.maze.cornWorld?.revision,
        }, null, 2));
      }
    },
  };
}

// Route-owned data only; this bridge never advances a scene itself.
export function createV31UI(document,{onContinue,onInteract,onSkip,onPause,onResume,onRetry,onRestart,onCaptionMode,onReplayOpening}={}){
  const assign=(node,key,value)=>{if(node[key]!==value)node[key]=value;};
  const styles=(node,values)=>{for(const [key,value] of Object.entries(values))assign(node.style,key,value);};
  const attributes=new WeakMap();
  const attribute=(node,key,value)=>{let cache=attributes.get(node);if(!cache)attributes.set(node,cache=new Map());if(cache.get(key)!==value){node.setAttribute(key,value);cache.set(key,value);}};
  const panel=document.createElement('section');panel.id='v31-narrative';
  panel.setAttribute('aria-label','Story dialogue');
  styles(panel,{position:'absolute',zIndex:'20',boxSizing:'border-box',color:'white',padding:'.65rem .85rem',overflow:'auto',borderRadius:'.35rem',textShadow:'0 1px 3px #000',lineHeight:'1.4'});
  const identity=document.createElement('h2'),caption=document.createElement('p'),status=document.createElement('p');
  caption.setAttribute('aria-live','polite');
  Object.assign(identity.style,{fontSize:'.8rem',fontWeight:'600',margin:'0 0 .25rem',letterSpacing:'.04em'});
  Object.assign(caption.style,{fontSize:'clamp(1rem, 2vw, 1.2rem)',margin:'.25rem 0 .5rem'});
  Object.assign(status.style,{fontSize:'.9rem',margin:'.25rem 0'});
  panel.append(identity,caption,status);
  let paused=false,lastMode=null,captionMode='manual';
  const pauseSkip=()=>{if(paused)onResume?.();onSkip?.();};
  const buttons={};for(const [key,label,action] of [['continue','Continue',onContinue],['interact','Inspect',onInteract],['skip','Skip scene',pauseSkip],['pause','Pause',onPause],['resume','Resume',onResume],['retry','Retry',onRetry],['restart','Restart story',onRestart],['captionMode','Automatic captions',()=>onCaptionMode?.(captionMode==='auto'?'manual':'auto')],['replayOpening','Replay opening',onReplayOpening]]){const b=document.createElement('button');assign(b,'textContent',label);b.onclick=action;b.type='button';Object.assign(b.style,{minHeight:'44px',padding:'.4rem .7rem',margin:'.15rem .3rem .15rem 0',fontSize:'.9rem'});panel.append(b);buttons[key]=b;}
  document.getElementById('game').append(panel);assign(panel,'hidden',true);
  return {isReady:()=>panel.isConnected&&!!caption&&!!identity,showIdentity({scene}){assign(identity,'textContent',[scene.perspective?.character,scene.perspective?.period].filter(Boolean).join(' · '));},
    render(frame,game){
      assign(panel,'hidden',false);captionMode=frame.dialogue?.mode||'manual';const state=frame.state,trial=state?.active_scene_id==='CF-S18',staging=frame.presentation?.ready===false, titlePending=!!(frame.title&&!frame.title.acknowledged);
      for(const id of ['menu','pause','result','intro-settings'])assign(document.getElementById(id),'hidden',true);
      const callTitle=state?.active_scene_id==='CF-S01'&&state?.status==='active'&&!staging?frame.callTitle:null;
      const titleScreen=document.getElementById('intro-screen');
      const manual=captionMode==='manual',actionAlternative=!!frame.presentation?.continueLabel&&frame.presentation.continueLabel!=='Continue';
      const showContinue=manual||actionAlternative||!!frame.presentation?.explicitContinue;
      assign(titleScreen,'hidden',!callTitle);
      attribute(titleScreen,'data-v31-call',String(!!callTitle));
      if(callTitle){
        // Reuse the actual approved title DOM/font treatment over the rendered
        // corn/eyes shot; this layer owns no captions or progression controls.
        assign(titleScreen,'hidden',false);
        const card=document.getElementById('intro-card');assign(card,'hidden',false);assign(card,'className',`intro-card ${callTitle.shot||'title'}-card`);assign(card.style,'opacity',String(callTitle.opacity??1));
        assign(document.getElementById('intro-label'),'textContent',callTitle.label||'');
        assign(document.getElementById('intro-name'),'textContent',callTitle.name??'');
        const ghost=document.getElementById('intro-ghost');assign(ghost,'textContent',callTitle.name??'');assign(ghost.style,'opacity',String((callTitle.reduced?0:callTitle.accent||0)*.18));assign(ghost.style,'transform',`translateX(${(callTitle.reduced?0:callTitle.accent||0)*5}px)`);
        for(const id of ['intro-skip','opening-pause','story-skip','story-caption','story-tutorial','liquid-phrase','intro-status','intro-continue','intro-enter'])assign(document.getElementById(id),'hidden',true);
      }

      assign(document.getElementById('hud'),'hidden',!trial||state?.status!=='active');
      assign(document.getElementById('touch-controls'),'hidden',!document.body.classList.contains('touch')||state?.status!=='active'||frame.presentation?.renderer==='overlay'||staging||titlePending);
      if(!trial){
        // The legacy gameplay HUD renders first. Narrative ownership must hide
        // its combat affordances without replacing the actual touch look pad.
        for(const id of ['touch-fire','touch-stab','touch-light'])assign(document.getElementById(id),'hidden',true);
        assign(document.getElementById('move-stick'),'hidden',!frame.presentation?.movementEnabled);
        assign(document.getElementById('look-zone'),'hidden',staging||titlePending||frame.presentation?.renderer==='overlay');
        assign(document.getElementById('touch-interact'),'hidden',state?.status!=='active'||staging||titlePending||!frame.presentation?.canInteract);
        assign(document.getElementById('touch-interact'),'textContent',frame.presentation?.interactionPrompt||'INTERACT');
        assign(document.getElementById('touch-pause'),'hidden',true); // The visible native Pause button owns this menu.
      }

      paused=state?.status==='paused';
      const card=state?.status==='loading'||staging||paused||state?.status==='failed'||state?.status==='ended'||!!frame.error;
      const identityCard=titlePending&&!card,mode=card?'menu':identityCard?'identity':'subtitle';
      attribute(panel,'data-presentation',mode);attribute(panel,'data-period',state?.active_scene_id==='CF-S20'?'time-jump':'identity');
      const touch=document.body.classList.contains('touch');
      // Keep the world visible during play; full cards are reserved for explicit
      // transitions, errors and pause states rather than ordinary subtitles.
      styles(panel,identityCard?{inset:'28% 1rem auto',width:'auto',maxWidth:'56rem',maxHeight:'60vh',transform:'none',background:'rgba(3,7,4,.5)',padding:'clamp(1rem, 3vw, 2rem)'}:card?{inset:'0',width:'auto',maxWidth:'none',maxHeight:'100%',transform:'none',background:'rgba(0,0,0,.9)',padding:'clamp(1rem, 5vw, 3rem)'}:{inset:touch?'auto 1rem 6.5rem':'auto 1rem 1rem',width:'auto',maxWidth:'56rem',maxHeight:'34vh',transform:'none',background:'rgba(0,0,0,.6)',padding:'.65rem .85rem'});
      assign(identity,'textContent',state?.status==='ended'?'END OF AVAILABLE EXCERPT':frame.title&&!frame.title.acknowledged?Object.values(frame.title).filter(v=>typeof v==='string').join(' · '):frame.presentation?.objective||state?.active_scene_id||'CORNFIELDS');
      assign(caption,'textContent',staging||titlePending?'':[frame.dialogue?.speaker,frame.dialogue?.text].filter(Boolean).join(': '));
      let statusText=frame.error||(!state?'Ready to begin':game.mode==='dead'&&trial?'Trial failed. Retry the trial.':state.status==='loading'||staging?'Preparing scene…':state.status==='paused'?'Paused':trial&&state.trial_snapshot?.entry_line_delivered&&!frame.inputReady?'Click the scene to capture the mouse and begin the trial.':state.status==='ended'?'The story ends here.':frame.presentation?.recoveryNote||frame.presentation?.actionPrompt||'');
      if(!trial&&!card&&state?.status==='active'&&!frame.inputReady&&frame.presentation?.renderer!=='overlay')statusText=[statusText,frame.presentation?.movementEnabled?'Click the scene to look around. WASD to move; E to interact.':showContinue?'Click the scene to look around. E to continue.':'Click the scene to look around.'].filter(Boolean).join(' ');
      if(!trial&&!card&&state?.status==='active'&&frame.inputReady&&!touch){
        const interaction=!titlePending&&frame.presentation?.canInteract;
        const titleReady=titlePending&&frame.title.elapsed>=frame.title.minimumSeconds;
        const canContinue=showContinue&&(titleReady||(!titlePending&&(!!frame.dialogue?.text||frame.presentation?.explicitContinue)&&frame.presentation?.canContinue!==false));
        const hint=interaction?`E — ${frame.presentation.interactionPrompt||'Inspect'}`:canContinue?'E — continue':'';
        statusText=[statusText,hint].filter(Boolean).join(' ');
      }
      assign(status,'textContent',statusText);
      assign(status,'hidden',!status.textContent);assign(caption,'hidden',!caption.textContent);
      assign(buttons.continue,'textContent',frame.presentation?.continueLabel||'Continue');
      assign(buttons.continue,'disabled',titlePending?frame.title.elapsed<frame.title.minimumSeconds:!!state&&frame.presentation?.canContinue===false);
      assign(buttons.interact,'hidden',state?.status!=='active'||staging||titlePending||!frame.presentation?.canInteract);assign(buttons.interact,'textContent',frame.presentation?.interactionPrompt||'Inspect');
      assign(buttons.continue,'hidden',!showContinue||!state||state.status!=='active'||game.mode==='dead'||staging||(!titlePending&&!frame.dialogue?.text&&!frame.presentation?.explicitContinue));assign(buttons.skip,'hidden',trial||!paused);assign(buttons.pause,'hidden',state?.status!=='active');assign(buttons.resume,'hidden',!paused);assign(buttons.retry,'hidden',state?.status!=='failed'&&!(trial&&game.mode==='dead'));assign(buttons.restart,'hidden',!paused&&!['ended','failed'].includes(state?.status));
      assign(buttons.captionMode,'hidden',!paused);assign(buttons.captionMode,'textContent',manual?'Automatic captions':'Manual captions');
      assign(buttons.replayOpening,'hidden',!paused||state?.active_scene_id!=='CF-S01');
      if(mode!==lastMode){lastMode=mode;if(paused)buttons.resume.focus?.();else if(identityCard&&showContinue)buttons.continue.focus?.();}
    },dispose(){panel.remove();}};
}
