import {validateRoutesShape} from './layout-schema.js';
import {validateApprovedRoutes} from './approved-contracts.js';
export const DOOR_NAMES = Object.freeze(['Brasenhill', 'Pillsbury', 'Lebold', 'Aldrich', 'Winchester']);
export function createProgression({quickplay=false,random=Math.random,doorIds=[]} = {}) {
  let unlocked = false, firstUnlocked = false, completed = false;
  const collected = new Set(), openedDoors=new Set();
  const choose=n=>Math.min(n-1,Math.max(0,Math.floor((Number(random())||0)*n)));
  let tokenLocation=choose(3); 
  return {
    get tokenLocation(){return tokenLocation;},
    get openedDoors(){return [...openedDoors];}, openDoor(id){if(!doorIds.includes(id)||openedDoors.has(id))return false;openedDoors.add(id);return true;},
    get unlocked() { return unlocked; },
    get quickplay() { return quickplay; }, get firstUnlocked() { return !quickplay || firstUnlocked; }, get completed() { return completed; },
    collected(id) { return collected.has(id); },
    get objective() { return !firstUnlocked ? 'Find the labelled HALL KEY near the starting point. E picks it up.' : !unlocked ? 'Brasenhill is open. Find the PILLSBURY KEY in original room A.' : !completed ? 'Return to the hall. Use E at Pillsbury, then collect the FINAL TOKEN deeper in the Pillsbury first floor. Follow the arrows and press E to open interior doors.' : 'Loop complete. Explore, return to the hall, or choose Reset run to play again.'; },
    pickup(id,area) {
      if(!quickplay || collected.has(id))return {changed:false,message:'Already collected or unavailable.'};
      if(id==='hall-key'&&area==='hall'){firstUnlocked=true;collected.add(id);return {changed:true,message:'HALL KEY collected. Brasenhill is OPEN ◇. Walk through to original room A.'};}
      if(id==='room-a-key'&&area==='A'&&firstUnlocked){unlocked=true;collected.add(id);return {changed:true,message:'PILLSBURY KEY collected. Return to the hall and press E at Pillsbury.'};}
      if(id==='room-b-token'&&area==='B'&&firstUnlocked&&unlocked){completed=true;collected.add(id);return {changed:true,message:'LOOP COMPLETE — three items collected. Return to the hall or use Reset run to play again.'};}
      return {changed:false,message:'This item is not available yet.'};
    },
    latch(area) { if(quickplay)return {changed:false,message:'Pick up the labelled PILLSBURY KEY with E.'}; if (area !== 'A') return { changed: false, message: 'The test latch is in vestibule A.' }; const changed = !unlocked; unlocked = true; return { changed, message: changed ? 'Pillsbury is now OPEN ◇. Return to the hall and press E at its door.' : 'Pillsbury remains OPEN ◇.' }; },
    doorState(id) { if (!DOOR_NAMES.includes(id)) throw new Error('Unknown entrance'); return (id === 'Brasenhill' && (!quickplay || firstUnlocked)) || (id === 'Pillsbury' && unlocked) ? 'OPEN ◇' : 'LOCKED ■'; },
    canFold(from, to) { return unlocked && ((from === 'hall' && to === 'B') || (from === 'B' && to === 'hall')); },
    snapshot() { return {quickplay,firstUnlocked,unlocked,completed,tokenLocation,openedDoors:[...openedDoors]}; },
    restore(value) { if(!value||!Number.isInteger(value.tokenLocation)||value.tokenLocation<0||value.tokenLocation>2||value.quickplay!==quickplay||[value.firstUnlocked,value.unlocked,value.completed].some(v=>typeof v!=='boolean')||(quickplay&&((value.unlocked&&!value.firstUnlocked)||(value.completed&&!value.unlocked))))throw new Error('Invalid progression snapshot');if(value.openedDoors!==undefined&&(!Array.isArray(value.openedDoors)||value.openedDoors.some(id=>!doorIds.includes(id))))throw new Error('Invalid door snapshot');openedDoors.clear();for(const id of value.openedDoors??[])openedDoors.add(id);unlocked=false;firstUnlocked=false;completed=false;collected.clear();tokenLocation=value.tokenLocation;if(quickplay){if(value.firstUnlocked)this.pickup('hall-key','hall');if(value.unlocked)this.pickup('room-a-key','A');if(value.completed)this.pickup('room-b-token','B');}else unlocked=value.unlocked; },
    reset() { openedDoors.clear();tokenLocation=(tokenLocation+1+choose(2))%3;unlocked = false; firstUnlocked = false; completed = false; collected.clear(); }
  };
}
export function validateRoutes(routes,{baseline=true}={}){
  validateRoutesShape(routes);
  if(baseline)validateApprovedRoutes(routes);
  return true;
}
