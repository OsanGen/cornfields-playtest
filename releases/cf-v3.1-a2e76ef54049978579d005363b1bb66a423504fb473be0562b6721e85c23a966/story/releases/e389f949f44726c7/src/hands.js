import {EMPTY_ASSET_VARIANTS,resolveV31Asset} from './cf-v31-asset-variants.js';
import {installHands as installSharedHands} from '../../../../shared/runtime/hands.js';
export {createStoryForearmFit} from '../../../../shared/runtime/hands.js';
export function installHands(options){
  const assetBindings=options.assetBindings||EMPTY_ASSET_VARIANTS;
  return installSharedHands({...options,assetURL:name=>new URL('../assets/'+resolveV31Asset('field/'+name,assetBindings),import.meta.url).href});
}
