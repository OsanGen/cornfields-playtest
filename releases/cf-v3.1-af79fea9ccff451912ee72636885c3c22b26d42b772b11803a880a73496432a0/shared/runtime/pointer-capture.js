/** One cancellable browser capture owner. A stale completion cannot release a newer grant. */
export function createPointerCapture({document,canvas,isAllowed,onError=()=>{},timeoutMs=4000,setTimer=globalThis.setTimeout,clearTimer=globalThis.clearTimeout,now=()=>Date.now()}){
  let closed=false,serial=0,pending=null,active=null;
  const allowed=()=>!closed&&isAllowed();
  const valid=lease=>!!lease&&lease.serial===serial&&allowed();
  const release=()=>{if(document.pointerLockElement===canvas)document.exitPointerLock?.();};
  const finish=lease=>{if(lease.timer!==null)clearTimer(lease.timer);lease.timer=null;if(pending===lease)pending=null;};
  function rejectOrphan(){if(document.pointerLockElement===canvas&&!valid(active)&&!valid(pending))release();}
  function grant(lease){
    if(pending===lease&&valid(lease)&&document.pointerLockElement===canvas){active=lease;finish(lease);return;}
    if(pending===lease&&!valid(lease))finish(lease);
    rejectOrphan();
  }
  function failed(lease,error){const current=pending===lease&&valid(lease);finish(lease);if(current)onError(error);rejectOrphan();}
  const changed=()=>{if(document.pointerLockElement===canvas){if(valid(pending))grant(pending);else rejectOrphan();}else active=null;};
  const errored=()=>{if(document.pointerLockElement!==canvas&&pending)failed(pending,new Error('Mouse capture denied'));};
  document.addEventListener('pointerlockchange',changed);document.addEventListener('pointerlockerror',errored);
  function cancel(){serial++;active=null;if(pending)finish(pending);release();}
  return Object.freeze({
    request(){
      if(!allowed()||pending)return false;
      const lease={serial:++serial,timer:null,legacy:false,expires:now()+timeoutMs};pending=lease;
      lease.timer=setTimer(()=>{if(document.pointerLockElement===canvas)grant(lease);else failed(lease,new Error('Mouse capture timed out. Click the scene to retry.'));},timeoutMs);
      try{
        const request=canvas.requestPointerLock();lease.legacy=!request?.then;
        if(request?.then)Promise.resolve(request).then(()=>grant(lease),error=>failed(lease,error));
        if(document.pointerLockElement===canvas)grant(lease);
      }catch(error){failed(lease,error);}
      return true;
    },
    cancel,
    dispose(){
      if(closed)return;
      const retired=pending,guard=retired?.legacy&&document.pointerLockElement!==canvas;
      closed=true;cancel();document.removeEventListener('pointerlockchange',changed);document.removeEventListener('pointerlockerror',errored);
      // Void-returning legacy APIs cannot cancel a queued browser grant. Keep
      // only a bounded orphan guard until that grant or its original deadline.
      if(guard){
        let timer=null;const stop=()=>{document.removeEventListener('pointerlockchange',orphan);if(timer!==null)clearTimer(timer);};
        const orphan=()=>{if(document.pointerLockElement===canvas){release();stop();}};
        document.addEventListener('pointerlockchange',orphan);timer=setTimer(stop,Math.max(0,retired.expires-now()));
      }
    },
  });
}
