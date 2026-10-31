/** Roll back partial construction; commit transfers cleanup to the returned owner. */
export function createStartupTransaction(){
  const pending=[];let closed=false;
  const defer=cleanup=>{if(closed)throw new Error('Startup transaction is closed');if(typeof cleanup!=='function')throw new TypeError('Cleanup required');pending.push(cleanup);};
  return Object.freeze({
    defer,
    own(resource){if(typeof resource?.dispose!=='function')throw new TypeError('Startup resource needs dispose()');defer(()=>resource.dispose());return resource;},
    commit(){if(closed)return;closed=true;pending.length=0;},
    rollback(){if(closed)return;closed=true;for(const cleanup of pending.splice(0).reverse())try{cleanup();}catch{/* Preserve the original construction failure. */}},
  });
}
