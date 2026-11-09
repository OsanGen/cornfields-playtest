// V4 authored horror outcomes. Pure active-time state; no renderer, health, AI,
// input ownership or route mutation. The adapter owns presentation and teardown.
const copy = value => JSON.parse(JSON.stringify(value));
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const KINDS = new Set(['hand', 'wayne', 'randall']);
const matches = (a, b) => !!a && !!b && ['runId', 'sceneId', 'entryId'].every(k => a[k] === b[k]);
const WAYNE_HAND_PATH = [[0,.25],[0,-2],[2,-2],[2,-4.2]];
const WAYNE_SOUND_TIMES = [4,9,15,21,25];
export const HORROR_TIMING = Object.freeze({wayneCapture:27, wayneTerminal:30, randallBite:2, randallRetreat:4, randallMedic:6, handCollapse:1.5});
export const RANDALL_AMBUSH_SITE = Object.freeze({x:27,z:10});

export function createScriptedHorror({kind, token} = {}) {
  if (!KINDS.has(kind)) throw new TypeError('Unknown scripted horror kind');
  if (!token || !Number.isInteger(token.runId) || token.runId < 1 || typeof token.sceneId !== 'string' || !token.sceneId || !Number.isInteger(token.entryId) || token.entryId < 1) throw new TypeError('Invalid horror ownership token');
  const identity = copy(token);
  let phase = kind === 'hand' ? 'approach' : kind === 'wayne' ? 'hunt' : 'patrol';
  let elapsed = 0, phaseTime = 0, disposed = false, sequence = 0, completed = false;
  let struggleCount = 0, distance = Infinity, reducedEffects = false;
  const emitted = new Set();
  let events = [];
  const event = (type, detail = {}) => {
    if (emitted.has(type)) return;
    emitted.add(type);
    events.push({type, ...identity, id:++sequence, at:elapsed, ...detail});
  };
  const enter = next => { phase = next; phaseTime = 0; };
  function snapshot() {
    const proximity = Number.isFinite(distance) ? clamp(1 - distance / 7, 0, 1) : 0;
    return {kind, token:copy(identity), phase, elapsed, phaseTime, disposed, completed,
      weaponAllowed:false, healthMutationAllowed:false, retryAllowed:false,
      creatureVisible:kind === 'randall' && ['grab', 'bite', 'retreat'].includes(phase),
      handMoving:kind === 'wayne' && !disposed && !completed,
      struggleCount, struggleFeedback:phase === 'grab' ? Math.min(struggleCount, 4) / 4 : 0,
      // Reduced effects retain distance and action semantics, without camera sway.
      proximity, presentationIntensity:reducedEffects ? proximity * .25 : proximity,
      cameraSwayAllowed:!reducedEffects && kind === 'hand',
      captureProgress:kind === 'wayne' && phase === 'capture' ? clamp(phaseTime / 3, 0, 1) : 0,
      objective:phase === 'hunt' ? 'Hide. Something is moving outside.' : phase === 'grab' ? 'STRUGGLE' : phase === 'approach' ? 'Examine the hand.' : null};
  }
  function update(dt, input = {}) {
    if (!Number.isFinite(dt) || dt < 0) throw new TypeError('Horror dt must be finite and nonnegative');
    events = [];
    if (disposed || completed || !matches(identity, input.token) || input.active !== true || input.ready !== true) return {state:snapshot(), events:[]};
    reducedEffects = input.reducedEffects === true;
    if (Number.isFinite(input.distance) && input.distance >= 0) distance = input.distance;
    const before = elapsed;
    elapsed += dt;
    phaseTime += dt;
    if (kind === 'hand') {
      if (phase === 'approach' && input.interact === true && distance <= (Number.isFinite(input.examineRadius) ? clamp(input.examineRadius, .1, 2) : 1.25)) {
        enter('examined'); event('hand-examined');
      }
      // Adapter acknowledges the halt/radio/recognition lines before collapse.
      if (phase === 'examined' && input.reportAcknowledged === true) { enter('collapse'); event('hand-collapse'); }
      if (phase === 'collapse' && phaseTime >= HORROR_TIMING.handCollapse) {
        enter('recovery'); completed = true; event('hand-complete', {outcome:'fainted', next:'outdoor-recovery'});
      }
    } else if (kind === 'wayne') {
      // The last three seconds always belong to the terminal attack. A slow
      // update crosses both boundaries in order, never extending the deadline.
      if (phase === 'hunt' && elapsed >= HORROR_TIMING.wayneCapture) {
        enter('capture'); phaseTime = elapsed - HORROR_TIMING.wayneCapture;
        event('wayne-capture', {at:HORROR_TIMING.wayneCapture});
      }
      if (phase === 'capture' && elapsed >= HORROR_TIMING.wayneTerminal) {
        elapsed = HORROR_TIMING.wayneTerminal; enter('fatal'); completed = true;
        event('wayne-complete', {outcome:'scripted-death', next:'family-report', at:HORROR_TIMING.wayneTerminal});
      } else if (phase === 'hunt') {
        // Sound/visual alternatives use one cue per authored threshold.
        for (const at of WAYNE_SOUND_TIMES) if (before < at && elapsed >= at) event(`wayne-scurrying-${at}`, {
          at, caption:at === 15 ? 'Three taps at the doorway.' : 'Something scurries nearby.',
          position:at === 15 ? {x:2, z:-3} : sampleWayneHandPath(at)
        });
      }
    } else {
      if (phase === 'patrol' && input.ambush === true && input.actorsReady === true) { enter('grab'); event('randall-grab'); }
      // phaseTime starts at accepted ambush, not patrol duration.
      if (phase === 'grab' && input.struggle === true) struggleCount++;
      if (phase === 'grab' && phaseTime >= HORROR_TIMING.randallBite) { phase = 'bite'; event('randall-bite', {outcome:'unavoidable-injury'}); }
      if (phase === 'bite' && phaseTime >= HORROR_TIMING.randallRetreat) { phase = 'retreat'; event('randall-retreat', {oliveSurvives:true}); }
      if (phase === 'retreat' && phaseTime >= HORROR_TIMING.randallMedic) { phase = 'medic'; event('randall-medic', {speaker:'Brad', text:'I need a medic. We have a man incapacitated.'}); }
      if (phase === 'medic' && input.reportAcknowledged === true) {
        phase = 'complete'; completed = true; event('randall-complete', {outcome:'bitten', next:'clarence-stanley', aliveUnresolved:true});
      }
    }
    return {state:snapshot(), events:events.map(copy)};
  }
  return {update, snapshot, dispose() { disposed = true; events = []; }};
}

export function sampleWayneHandPath(activeSeconds) {
  const path = WAYNE_HAND_PATH;
  const progress = clamp((activeSeconds - 3) / 24, 0, 1) * (path.length - 1);
  const index = Math.min(path.length - 2, Math.floor(progress));
  const [x,z] = path[index], [endX,endZ] = path[index + 1], blend = progress - index;
  return {x:x+(endX-x)*blend,y:.03,z:z+(endZ-z)*blend};
}

// Renderer-independent poses. Existing scene/view may apply these to its own
// retained mesh; this helper does not claim rendered or audio acceptance.
export function sampleCrawlingHand(activeSeconds, {captureProgress = 0, reducedEffects = false} = {}) {
  const t = Number.isFinite(activeSeconds) ? Math.max(0, activeSeconds) : 0;
  const capture = clamp(Number.isFinite(captureProgress) ? captureProgress : 0, 0, 1);
  return {bob:reducedEffects ? 0 : Math.sin(t * 10) * .018,
    yaw:Math.sin(t * 1.8) * .12, lunge:capture * capture,
    fingers:Array.from({length:5}, (_, i) => Math.sin(t * 11 + i * 1.3) * .35)};
}
