export const HANDOFF_SCHEMA='cornfields.hall-entry.v1';
export const PENDING='Central hall connection pending';
export function entryRecord(state){
 if(state.checkpoint!=='CP3')throw new Error('CP3 required');
 return Object.freeze({schema:HANDOFF_SCHEMA,routeId:'asylum-intro-v0.1',checkpoint:'CP3',dialogue:{watched:[...state.watched],skipped:[...state.skipped]},comfort:{reducedMotion:!!state.comfort.reducedMotion,master:state.comfort.master,voice:state.comfort.voice,effects:state.comfort.effects},safeSpawnRole:'central-hall-story-entry'});
}
export function validateEntry(record){
 if(!record||record.schema!==HANDOFF_SCHEMA||record.routeId!=='asylum-intro-v0.1'||record.checkpoint!=='CP3'||record.safeSpawnRole!=='central-hall-story-entry')throw new Error('Unknown handoff schema/route/spawn');
 const keys=['schema','routeId','checkpoint','dialogue','comfort','safeSpawnRole'];
 if(Object.keys(record).some(k=>!keys.includes(k)))throw new Error('Unexpected carried state');
 if(Object.keys(record.dialogue||{}).sort().join(',')!=='skipped,watched'||!['watched','skipped'].every(k=>Array.isArray(record.dialogue[k])&&record.dialogue[k].every(x=>typeof x==='string'))||record.dialogue.watched.some(x=>record.dialogue.skipped.includes(x)))throw new Error('Invalid dialogue state');
 if(Object.keys(record.comfort||{}).sort().join(',')!=='effects,master,reducedMotion,voice'||typeof record.comfort.reducedMotion!=='boolean'||!['master','voice','effects'].every(k=>Number.isFinite(record.comfort[k])&&record.comfort[k]>=0&&record.comfort[k]<=1))throw new Error('Invalid comfort state');
 return true;
}
/** No host, URL, network or fallback in this outcome. */
export function requestHallEntry(record){validateEntry(record);return Object.freeze({status:'pending',message:PENDING,moved:false});}
/** Contract-only injection, never called by the runtime. */
export async function testHostContract(record,host){
 validateEntry(record);if(typeof host!=='function')return requestHallEntry(record);
 const result=await host(record);
 if(result?.schema!==HANDOFF_SCHEMA||result?.status!=='ready'||result?.safeSpawnRole!==record.safeSpawnRole||result?.collisionVerified!==true)throw new Error('Host did not accept a verified safe spawn');
 return {...result,synthetic:true};
}
