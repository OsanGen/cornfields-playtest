// Opt-in, bounded, local CPU/submission observations. No telemetry or GPU claims.
const sinks=new WeakMap();
export function recordTransition(owner,event){try{sinks.get(owner)?.event(event);}catch{/* Optional internal diagnostics only. */}}
export function cancelTransitionMetrics(owner){try{sinks.get(owner)?.cancel();}catch{/* Foreign callbacks are never invoked. */}}
export function createTransitionMetrics({now=()=>performance.now(),limit=32,enabled=true}={}){
  const records=[];let serial=0,staging=null;const capacity=Number.isInteger(limit)?Math.min(64,Math.max(1,limit)):32;
  const scene=id=>/^CF-S(?:0[1-9]|[12][0-9]|3[0-2])$/.test(id)?id:null;
  const clock=()=>{try{const n=now();return Number.isFinite(n)&&n>=0?n:null;}catch{return null;}};
  const duration=(a,b)=>a!=null&&b!=null&&b>=a?b-a:null;
  const safe=fn=>{if(enabled)try{return fn();}catch{/* Diagnostics cannot affect the game. */}};
  const append=item=>{records.push({id:++serial,...item});while(records.length>capacity)records.shift();return records.at(-1);};
  const same=(r,t)=>r.runId===t?.runId&&r.sceneId===t?.sceneId&&r.entryId===t?.entryId;
  function event(value){return safe(()=>{
    const id=scene(value?.sceneId);if(!id||!Number.isSafeInteger(value.runId)||!Number.isSafeInteger(value.transactionId)||!Number.isSafeInteger(value.attempt))return;
    const time=clock(),key=`${value.runId}:${value.transactionId}:${value.attempt}`;
    let record=records.find(r=>r.transactionKey===key);
    if(value.phase==='begin'||value.phase==='prepare'&&!record){
      if(staging&&!staging.outcome){staging.outcome='cancelled';staging.finished=time;}staging=null;
      for(const old of records)if(old.kind==='entry'&&!old.outcome){old.outcome='cancelled';old.finished=time;}
      record=append({transactionKey:key,runId:value.runId,sceneId:id,entryId:value.entryId,kind:'entry',started:time,outcome:null,wasPaused:false,wasHidden:false});
    }
    if(!record||record.outcome)return;
    if(value.phase==='prepare'){record.entryId=value.entryId;record.preparing=time;}
    if(value.phase==='cleanupStart')record.cleanupStarted=time;
    if(value.phase==='cleanupEnd')record.cleanupMs=duration(record.cleanupStarted,time);
    if(value.phase==='ready'){record.ready=time;record.prepareToReadyMs=duration(record.preparing,time);record.outcome='ready';}
    if(value.phase==='failed'){record.outcome='failed';record.finished=time;}
    if(value.phase==='failed'&&staging&&staging.sceneId===id){staging.outcome='failed';staging.finished=time;staging=null;}
  });}
  function observe(frame,{hidden=false,manual=false}={}){return safe(()=>{
    for(const record of records)if(!record.outcome||record.outcome==='ready'&&record.submitted==null){record.wasPaused ||= frame?.state?.status==='paused';record.wasHidden ||= !!hidden;record.manual ||= !!manual;}
    const id=scene(frame?.state?.active_scene_id),token=frame?.token;
    if(staging&&id===staging.sceneId&&(frame?.error||['failed','ended'].includes(frame?.state?.status))){staging.outcome=frame.state.status==='ended'?'cancelled':'failed';staging.finished=clock();staging=null;}
    if(!id||!token)return;
    if(frame.presentation?.ready===false&&frame.state.status==='active'&&!frame.error){
      if(!staging||!same(staging,token))staging=append({runId:token.runId,sceneId:id,entryId:token.entryId,kind:'in-scene-observed',started:clock(),outcome:null,wasPaused:false,wasHidden:hidden,manual});
    }
    if(frame.error&&staging&&same(staging,token)){staging.outcome='failed';staging=null;}
  });}
  function submitted(frame){return safe(()=>{
    if(frame?.error||frame?.state?.status!=='active'||frame?.presentation?.ready!==true)return;
    const time=clock();
    for(const record of records)if(record.kind==='entry'&&same(record,frame.token)&&record.outcome==='ready'&&record.submitted==null){record.submitted=time;record.loadingMs=duration(record.started,time);record.readyToSubmittedDrawMs=duration(record.ready,time);}
    if(staging&&same(staging,frame.token)&&!staging.outcome){staging.outcome='submitted-draw';staging.submitted=time;staging.loadingMs=duration(staging.started,time);staging=null;}
  });}
  const api=Object.freeze({event,observe,submitted,
    report:()=>({enabled:!!enabled,capacity,clock:'monotonic-wall-milliseconds',entries:records.map(r=>({...r,queueMs:null,loadAsyncMs:null,cloneMs:null,attachmentMs:null,gpuTimeMs:null,pixelsPresentedAt:null})),gpuTimeMs:null,pixelsPresentedAt:null}),
    cancel(){safe(()=>{for(const r of records)if(!r.outcome)r.outcome='cancelled';staging=null;});},
    reset(){records.length=0;staging=null;/* Serial never reused. */},
  });
  sinks.set(api,{event,cancel:api.cancel});return api;
}
