import {installHands as installSharedHands} from '../../shared/runtime/hands.js';
export {createStoryForearmFit} from '../../shared/runtime/hands.js';
export function installHands(options){
  return installSharedHands({...options,assetURL:name=>new URL('../../story/releases/e389f949f44726c7/assets/field/'+name,import.meta.url).href});
}
