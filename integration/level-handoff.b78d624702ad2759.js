/** One-use same-origin handoff from a completed fall or explicit title selection. */
export const LEVEL_KEY='cornfields.level-two.once.v1';
export const MAX_AGE=300000;
export function validateLevel(record){
 const keys=record&&Object.keys(record).sort().join(',');
 const completed=keys==='comfort,completed'&&record.completed===true;
 const selected=keys==='comfort,selectedLevel'&&record.selectedLevel===2;
 if(!completed&&!selected)throw new Error('Complete Level 1 or select Start Level 2 from the title.');
 const c=record.comfort;if(!c||Object.keys(c).sort().join(',')!=='effects,master,reducedMotion,voice'||typeof c.reducedMotion!=='boolean'||!['master','voice','effects'].every(k=>Number.isFinite(c[k])&&c[k]>=0&&c[k]<=1))throw new Error('Invalid comfort settings');
 return {...(completed?{completed:true}:{selectedLevel:2}),comfort:{...c}};
}
export function stageLevelEntry(record,storage,now=Date.now()){
 const value=JSON.stringify({at:now,record:validateLevel(record)});if(!Number.isFinite(now))throw new Error('Invalid entry time');
 try{storage.setItem(LEVEL_KEY,value);if(storage.getItem(LEVEL_KEY)!==value)throw new Error('Readback failed');}catch{try{storage.removeItem(LEVEL_KEY);}catch{}throw new Error('Session storage is unavailable. Allow it, then retry Level 2.');}
}
export function consumeLevelEntry(storage,now=Date.now()){
 let raw;try{raw=storage.getItem(LEVEL_KEY);storage.removeItem(LEVEL_KEY);if(storage.getItem(LEVEL_KEY)!==null)throw new Error();}catch{throw new Error('Could not consume Level 2 entry safely. Restart Level 1.');}
 if(!raw||raw.length>2048)throw new Error('Level 2 entry expired or was already used. Restart Level 1.');
 const e=JSON.parse(raw);if(Object.keys(e).sort().join(',')!=='at,record'||!Number.isFinite(e.at)||!Number.isFinite(now)||now<e.at||now-e.at>MAX_AGE)throw new Error('Level 2 entry expired.');
 return validateLevel(e.record);
}
export function transferToWake(record,{window:win=globalThis.window,shutdown,now=Date.now}={}){
 const target=new URL('../asylum-wake.html',import.meta.url);if(target.origin!==win.location.origin||typeof shutdown!=='function')throw new Error('Invalid Level 2 destination');
 stageLevelEntry(record,win.sessionStorage,now());
 try{shutdown();win.location.assign(target.href);}catch(e){try{win.sessionStorage.removeItem(LEVEL_KEY);}catch{}throw e;}
 return {status:'transitioning'};
}
