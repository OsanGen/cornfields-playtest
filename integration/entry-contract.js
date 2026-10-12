/** Engine-independent, bounded state. No positions, URLs, personal data or gameplay carryover. */
export const SCHEMA='cornfields.hall-entry.v1';
export const SAFE_SPAWN=Object.freeze({x:0,z:5.2,yaw:0});
const exact=(value,keys)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).sort().join(',')===[...keys].sort().join(',');
export function validateEntry(record){
 if(!exact(record,['schema','routeId','checkpoint','dialogue','comfort','safeSpawnRole'])||record.schema!==SCHEMA||record.routeId!=='asylum-intro-v0.1'||record.checkpoint!=='CP3'||record.safeSpawnRole!=='central-hall-story-entry')throw new Error('Invalid story checkpoint or entry contract');
 if(!exact(record.dialogue,['watched','skipped']))throw new Error('Invalid dialogue markers');
 const {watched,skipped}=record.dialogue;
 for(const values of [watched,skipped])if(!Array.isArray(values)||values.length>256||values.some(x=>typeof x!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(x))||new Set(values).size!==values.length)throw new Error('Invalid dialogue markers');
 if(watched.some(x=>skipped.includes(x)))throw new Error('A skipped line cannot be watched');
 if(!exact(record.comfort,['reducedMotion','master','voice','effects'])||typeof record.comfort.reducedMotion!=='boolean'||!['master','voice','effects'].every(k=>Number.isFinite(record.comfort[k])&&record.comfort[k]>=0&&record.comfort[k]<=1))throw new Error('Invalid comfort settings');
 return true;
}
export function copyEntry(record){validateEntry(record);return Object.freeze({...record,dialogue:Object.freeze({watched:Object.freeze([...record.dialogue.watched]),skipped:Object.freeze([...record.dialogue.skipped])}),comfort:Object.freeze({...record.comfort})});}
export function applyHallEntry(runtime,record){
 const entry=copyEntry(record),spawn=runtime.world.layout.spawn;
 if(!Object.keys(SAFE_SPAWN).every(k=>spawn[k]===SAFE_SPAWN[k])||!runtime.world.isSafe(SAFE_SPAWN)||runtime.world.areaAt(SAFE_SPAWN.x,SAFE_SPAWN.z)!=='hall'||!runtime.player.place(SAFE_SPAWN))throw new Error('Central hall safe spawn verification failed');
 runtime.setComfort(entry.comfort.reducedMotion);runtime.pause();return entry;
}
