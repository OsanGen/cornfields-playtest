import {hallValidationOptions} from './browser-session.js';
import {copyEntry,SCHEMA} from '../../integration/entry-contract.b78d624702ad2759.js';
import {consumeEntry} from '../../integration/session-handoff.b78d624702ad2759.js';

/** Direct hall preview is synthetic only under the server-injected identities. */
export function hallEntryForDocument(document,storage){
  if(hallValidationOptions(document).baseline)return {entry:consumeEntry(storage),fixtureLabel:null};
  return {fixtureLabel:'Synthetic development hall entry; not story completion',entry:copyEntry({
    schema:SCHEMA,routeId:'original-level-two',checkpoint:'CP3',safeSpawnRole:'central-hall-story-entry',
    dialogue:{watched:[],skipped:[]},comfort:{reducedMotion:false,master:.55,voice:1,effects:.7},
  })};
}
