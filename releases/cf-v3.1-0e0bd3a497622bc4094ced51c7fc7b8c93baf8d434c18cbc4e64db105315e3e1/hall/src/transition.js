export function createTransition({ canTravel, arrive, restore, onError = () => {} }) {
  let state = null, opacity = 0, generation = 0;
  const report = message => { try { onError(message); } catch { /* Failure reporting must not trap the transition. */ } };
  function restoreSafely(origin){try{if(restore(origin)===false)report('Safe return unavailable. Reset the run.');}catch{report('Safe return unavailable. Reset the run.');}}
  return {
    get active() { return state !== null; }, get opacity() { return opacity; }, get generation() { return generation; }, get phase(){return state?.phase??'idle';},
    start(from, to, origin) {
      if (state || !origin || ![origin.x, origin.z, origin.yaw].every(Number.isFinite)) return false;
      try{if(!canTravel(from,to))return false;}catch{return false;}
      state = { from, to, origin: { ...origin }, elapsed: 0, phase: 'out' }; opacity = 0; generation++; return true;
    },
    update(dt) {
      if (!state || !Number.isFinite(dt) || dt <= 0) return;
      const step=Math.min(dt,0.25);
      if(state.phase==='out'){
        state.elapsed=Math.min(0.36,state.elapsed+step);opacity=state.elapsed/0.36;
        if(state.elapsed>=0.36){state.phase='opaque';state.elapsed=0;opacity=1;}return;
      }
      // The preceding rendered frame is fully neutral before the transform changes.
      if(state.phase==='opaque'){
        try{if(!canTravel(state.from,state.to)||arrive(state.to)!==true)throw new Error('Safe arrival unavailable');state.phase='in';state.elapsed=0;opacity=1;}
        catch{const origin=state.origin;state=null;opacity=0;restoreSafely(origin);report('The doorway could not complete. You remain safely at its entrance.');}return;
      }
      state.elapsed=Math.min(0.36,state.elapsed+step);opacity=1-state.elapsed/0.36;
      if(state.elapsed>=0.36){state=null;opacity=0;}
    },
    cancel({ restoreOrigin = true } = {}) { const origin=state?.origin;state=null;opacity=0;generation++;if(origin&&restoreOrigin)restoreSafely(origin); }
  };
}
