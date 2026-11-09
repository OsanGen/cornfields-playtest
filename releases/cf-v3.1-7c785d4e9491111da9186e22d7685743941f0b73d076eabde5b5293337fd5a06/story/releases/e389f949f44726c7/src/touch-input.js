import {runCleanups} from '../../../../shared/runtime/resource-scope.js';

/** Touch controls implement the same PlayerInput contract as keyboard/mouse. */
export function createTouchInput({document, isPlaying, onPause,isQte=()=>false,inputTime=()=>0}) {
  const pointers = new Map();
  const listeners = [];
  const node = id => document.getElementById(id);
  const stick = node('move-stick'), knob = node('move-knob');
  let forward = 0, strafe = 0;
  const empty = () => ({fire: false, flashlight: false, interact: false, moved: false, dx: 0, dy: 0, lookDelta: 0});
  let pending = empty();
  let stabs=[];
  let disposed=false;

  function listen(target, type, fn) {
    const guarded = event => { if (!disposed) fn(event); };
    target.addEventListener(type, guarded);
    listeners.push(() => target.removeEventListener(type, guarded));
  }
  function moveStick(event, owner) {
    const dx = event.clientX - owner.x, dy = event.clientY - owner.y;
    const length = Math.hypot(dx, dy), scale = Math.min(1, owner.radius / (length || 1));
    const x = dx * scale, y = dy * scale;
    const active = length > owner.radius * 0.18;
    pending.moved ||= active;
    strafe = active ? x / owner.radius : 0;
    forward = active ? -y / owner.radius : 0;
    knob.style.setProperty('--stick-x', x + 'px');
    knob.style.setProperty('--stick-y', y + 'px');
  }
  function centerStick() {
    forward = strafe = 0;
    knob.style.setProperty('--stick-x', '0px');
    knob.style.setProperty('--stick-y', '0px');
  }
  function release(id) {
    const owner = pointers.get(id);
    if (!owner) return;
    pointers.delete(id);
    if (owner.role === 'move') centerStick();
    // The browser may already have invalidated capture during cancellation or teardown.
    try {
      if (owner.target.hasPointerCapture?.(id)) owner.target.releasePointerCapture(id);
    } catch {}
  }
  function clear() {
    for (const id of [...pointers.keys()]) release(id);
    centerStick();
    pending = empty();
    stabs=[];
  }
  function bind(target, role) {
    listen(target, 'pointerdown', event => {
      if (!isPlaying() || (event.button !== undefined && event.button !== 0)) return;
      event.preventDefault();
      if ([...pointers.values()].some(owner => owner.role === role)) return;
      const owner = {role, target, x: event.clientX, y: event.clientY, acquiring:true};
      if (role === 'move') {
        const rect = stick.getBoundingClientRect();
        Object.assign(owner, {x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, radius: rect.width * 0.34});
      }
      pointers.set(event.pointerId, owner);
      try { target.setPointerCapture?.(event.pointerId); }
      catch { if (pointers.get(event.pointerId)===owner) release(event.pointerId); return; }
      // Capture can synchronously cancel this lease or dispose the input owner.
      if (disposed || pointers.get(event.pointerId)!==owner) return;
      owner.acquiring=false;
      if (role === 'move') moveStick(event, owner);
      if (role === 'pause') onPause();
      else if(role==='stab'&&isQte()){stabs.push(inputTime(event.timeStamp));if(stabs.length>32)stabs.shift();}
      else if (['fire', 'interact', 'flashlight'].includes(role)) pending[role] = true;
    });
    listen(target, 'pointermove', event => {
      const owner = pointers.get(event.pointerId);
      if (!owner || owner.acquiring || !isPlaying()) return;
      event.preventDefault();
      if (owner.role === 'move') moveStick(event, owner);
      if (owner.role === 'look') {
        const dx = event.clientX - owner.x, dy = event.clientY - owner.y;
        pending.dx += dx; pending.dy += dy; pending.lookDelta += Math.hypot(dx, dy);
        owner.x = event.clientX; owner.y = event.clientY;
      }
    });
    listen(target, 'pointerup', event => release(event.pointerId));
    for (const type of ['pointercancel', 'lostpointercapture']) {
      listen(target, type, event => {
        const owner=pointers.get(event.pointerId);
        if (!owner) return;
        if (owner.acquiring) release(event.pointerId);
        else clear();
      });
    }
  }
  bind(stick, 'move');
  bind(node('look-zone'), 'look');
  for (const [id, role] of [['touch-fire', 'fire'], ['touch-interact', 'interact'], ['touch-light', 'flashlight'], ['touch-pause', 'pause']]) bind(node(id), role);
  if(node('touch-stab'))bind(node('touch-stab'),'stab');

  return {
    read(player,until=Infinity) {
      const value = {
        forward, strafe, movementIntent: pending.moved || Boolean(forward || strafe),
        sprint:false,
        yaw: player.yaw - pending.dx * 0.004,
        pitch: Math.max(-1.25, Math.min(1.25, player.pitch - pending.dy * 0.004)),
        fire: pending.fire, flashlight: pending.flashlight, interact: pending.interact,
        lookDelta: pending.lookDelta,
        stabTimes:stabs.filter(at=>at<=until+1e-9),
      };
      pending = empty();
      stabs=stabs.filter(at=>at>until+1e-9);
      return value;
    },
    clear,
    clearEdges(){pending=empty();stabs=[];},
    dispose() {
      if (disposed) return;
      disposed=true;
      runCleanups([clear,...listeners.splice(0)]);
    },
  };
}
