/** Bounded live-frame timings. GPU time is explicitly unavailable here. */
export function createFrameRecorder({capacity=360}={}){
  if(!Number.isInteger(capacity)||capacity<1||capacity>10000)throw new RangeError('Invalid frame capacity');
  const data=new Float64Array(capacity*3);let count=0,next=0,total=0,stagingFrames=0;
  return Object.freeze({
    record(intervalMs,updateMs,renderMs,{ready=true}={}){if(![intervalMs,updateMs,renderMs].every(Number.isFinite)||intervalMs<=0||updateMs<0||renderMs<0)return;const index=next*3;data[index]=intervalMs;data[index+1]=updateMs;data[index+2]=renderMs;next=(next+1)%capacity;count=Math.min(capacity,count+1);total++;if(!ready)stagingFrames++;},
    reset(){count=next=total=stagingFrames=0;},
    report(){const intervals=[];let update=0,render=0,sum=0;for(let i=0;i<count;i++){intervals.push(data[i*3]);sum+=data[i*3];update+=data[i*3+1];render+=data[i*3+2];}intervals.sort((a,b)=>a-b);const percentile=p=>count?intervals[Math.min(count-1,Math.ceil(count*p)-1)]:null;return {count,total,capacity,stagingFrames,meanMs:count?sum/count:null,p50Ms:percentile(.5),p95Ms:percentile(.95),p99Ms:percentile(.99),meanUpdateMs:count?update/count:null,meanRenderMs:count?render/count:null,gpuTimeMs:null};},
  });
}
