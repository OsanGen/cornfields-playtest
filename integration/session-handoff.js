import {copyEntry} from './entry-contract.js';
export const SESSION_KEY='cornfields.story-hall.once.v1';
export const MAX_AGE_MS=300000;
const MAX_BYTES=48000;
export function stageEntry(record,storage,now=Date.now(),nonce=globalThis.crypto?.randomUUID?.()){
 const entry=copyEntry(record);
 if(!Number.isFinite(now)||typeof nonce!=='string'||!/^[a-zA-Z0-9-]{16,80}$/.test(nonce))throw new Error('Secure session handoff unavailable');
 const value=JSON.stringify({version:1,createdAt:now,nonce,record:entry});if(value.length>MAX_BYTES)throw new Error('Entry is too large');
 try{storage.setItem(SESSION_KEY,value);if(storage.getItem(SESSION_KEY)!==value)throw new Error('Session readback failed');}catch{try{storage.removeItem(SESSION_KEY);}catch{}throw new Error('Session storage is unavailable. Allow this local session and try Enter central hall again.');}
 return entry;
}
export function consumeEntry(storage,now=Date.now()){
 let raw;try{raw=storage.getItem(SESSION_KEY);storage.removeItem(SESSION_KEY);if(storage.getItem(SESSION_KEY)!==null)throw new Error('Session removal failed');}catch{throw new Error('The one-use session could not be consumed safely. Return to the story and try again.');}
 if(!raw)throw new Error('This hall entry has expired or was already used. Return to the story to enter again.');
 if(raw.length>MAX_BYTES)throw new Error('Invalid entry size');
 let envelope;try{envelope=JSON.parse(raw);}catch{throw new Error('Invalid entry data');}
 if(!envelope||Object.keys(envelope).sort().join(',')!=='createdAt,nonce,record,version'||envelope.version!==1||!Number.isFinite(envelope.createdAt)||!Number.isFinite(now)||now<envelope.createdAt||now-envelope.createdAt>MAX_AGE_MS||typeof envelope.nonce!=='string'||!/^[a-zA-Z0-9-]{16,80}$/.test(envelope.nonce))throw new Error('Invalid or expired one-use entry');
 return copyEntry(envelope.record);
}
export function transferToHall(record,{window:win=globalThis.window,shutdown,now=Date.now,nonce=()=>win.crypto.randomUUID()}={}){
 if(typeof shutdown!=='function')throw new Error('Story shutdown is required');
 const destination=new URL('../hall/index.html',import.meta.url);
 if(destination.origin!==win.location.origin)throw new Error('Hall must be on the same origin');
 const storage=win.sessionStorage;stageEntry(record,storage,now(),nonce());
 try{shutdown();win.location.assign(destination.href);}catch(error){try{storage.removeItem(SESSION_KEY);}catch{}throw error;}
 return Object.freeze({status:'transitioning',moved:true,message:'Opening the central hall…'});
}
