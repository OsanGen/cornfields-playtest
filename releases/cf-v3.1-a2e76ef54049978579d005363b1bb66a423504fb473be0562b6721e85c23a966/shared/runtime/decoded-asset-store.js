/** Bounded decoded sources. Consumers own leases, not the retained source objects. */
export function createDecodedAssetStore({load,dispose,measure=()=>0,limit=6,maxBytes=64*1024*1024}={}){
  if(typeof load!=='function'||typeof dispose!=='function'||!Number.isInteger(limit)||limit<1||!Number.isFinite(maxBytes)||maxBytes<0)throw new TypeError('Invalid decoded asset store');
  const entries=new Map(),live=new Set();
  const stats={hits:0,misses:0,loads:0,evictions:0,failures:0,capacityRefusals:0,disposeErrors:0};
  let closed=false,serial=0,bytes=0;
  function destroy(entry){
    if(entry.destroyed||entry.refs||entry.status==='pending')return;
    entry.destroyed=true;live.delete(entry);
    if(entry.status==='ready')try{dispose(entry.value);}catch{stats.disposeErrors++;}
  }
  function retire(entry){
    if(entry.retired){destroy(entry);return;}
    entry.retired=true;
    if(entries.get(entry.key)===entry){entries.delete(entry.key);bytes-=entry.bytes;}
    destroy(entry);
  }
  function oldestIdle(){return [...entries.values()].filter(entry=>!entry.refs&&entry.status!=='pending').sort((a,b)=>a.used-b.used)[0];}
  function trim(){
    while(bytes>maxBytes){const entry=oldestIdle();if(!entry)break;stats.evictions++;retire(entry);}
  }
  function acquire(key){
    if(closed)throw new Error('Decoded asset store disposed');
    if(typeof key!=='string'||!key)throw new TypeError('Decoded asset key required');
    let entry=entries.get(key);
    const reused=!!entry;
    if(entry)stats.hits++;
    else{
      while(entries.size>=limit){const idle=oldestIdle();if(!idle){stats.capacityRefusals++;throw new Error('Decoded asset capacity is busy');}stats.evictions++;retire(idle);}
      stats.misses++;stats.loads++;
      entry={key,refs:0,used:++serial,status:'pending',bytes:0,retired:false,destroyed:false,value:null,promise:null};
      entries.set(key,entry);live.add(entry);
      let loading;try{loading=load(key);}catch(error){loading=Promise.reject(error);}
      entry.promise=Promise.resolve(loading).then(value=>{
        entry.value=value;entry.status='ready';
        const size=Number(measure(value));entry.bytes=Number.isFinite(size)&&size>0?size:0;
        if(entries.get(key)===entry)bytes+=entry.bytes;
        if(closed||entry.retired)destroy(entry);else trim();
        return value;
      }).catch(error=>{
        if(entry.status==='ready')try{dispose(entry.value);}catch{stats.disposeErrors++;}
        stats.failures++;entry.status='failed';entry.bytes=0;retire(entry);throw error;
      });
    }
    entry.refs++;entry.used=++serial;
    let released=false;
    function release(){
      if(released)return;released=true;entry.refs--;entry.used=++serial;
      if(closed||entry.retired)destroy(entry);else trim();
    }
    const ready=entry.promise.then(value=>{
      if(released||closed){release();throw new Error('Decoded asset lease cancelled');}
      return value;
    },error=>{release();throw error;});
    // A released pending lease may have no waiter; cancellation still remains
    // observable to callers awaiting the original ready promise.
    ready.catch(()=>{});
    return Object.freeze({ready,release,reused});
  }
  return Object.freeze({
    acquire,
    diagnostics:()=>({entries:entries.size,bytes,pending:[...live].filter(entry=>entry.status==='pending').length,leases:[...live].reduce((sum,entry)=>sum+entry.refs,0),limit,maxBytes,closed,...stats}),
    dispose(){if(closed)return;closed=true;for(const entry of [...entries.values()])retire(entry);},
  });
}
