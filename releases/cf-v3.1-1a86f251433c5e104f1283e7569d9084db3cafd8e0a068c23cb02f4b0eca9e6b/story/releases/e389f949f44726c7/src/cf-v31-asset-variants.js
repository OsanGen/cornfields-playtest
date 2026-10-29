// Reviewed private numerical integration. Owner visual QA remains pending; no release claim.
export const EMPTY_ASSET_VARIANTS=Object.freeze({});
export const V31_ASSET_VARIANTS=Object.freeze({
  "intro/roadside-set.glb": "v31/retro/roadside-set-r1.glb",
  "intro/cast-stanley.glb": "v31/retro/cast-stanley-collar-r1.glb",
  "intro/cast-clarence.glb": "v31/retro/cast-clarence-r1.glb",
  "field/scarecrow.glb": "v31/retro/scarecrow-r1.glb",
  "field/zombie.glb": "v31/retro/zombie-r1.glb",
  "field/player-arms.glb": "v31/retro/player-arms-r1.glb",
  "field/service-pistol.glb": "v31/retro/service-pistol-r1.glb",
  "field/handheld-flashlight.glb": "v31/retro/handheld-flashlight-r1.glb",
  "intro/cruiser.glb": "v31/retro/cruiser-r1.glb",
  "intro/dispatch-radio.glb": "v31/retro/dispatch-radio-r1.glb",
  "intro/projector.glb": "v31/retro/projector-r1.glb",
  "intro/background-trees-v1.glb": "v31/retro/background-trees-v1-r1.glb",
  "intro/vt1-roadside-corn.glb": "v31/retro/vt1-roadside-corn-r1.glb",
  "intro/roadside-dog-v2.glb": "v31/retro/roadside-dog-v2-r1.glb",
  "intro/asphalt_diff.jpg": "v31/retro/textures/asphalt_diff-r1.png",
  "intro/asphalt_nor_gl.jpg": "v31/retro/textures/asphalt_nor_gl-r1.png",
  "intro/asphalt_rough.jpg": "v31/retro/textures/asphalt_rough-r1.png",
  "intro/vt1-ground-color.png": "v31/retro/textures/vt1-ground-color-r1.png",
  "intro/vt1-ground-normal.png": "v31/retro/textures/vt1-ground-normal-r1.png",
  "intro/vt1-ground-roughness.png": "v31/retro/textures/vt1-ground-roughness-r1.png",
  "field/wood_planks_dirt_diff_1k.jpg": "v31/retro/textures/wood_planks_dirt_diff_1k-r1.png",
  "field/wood_planks_dirt_nor_gl_1k.jpg": "v31/retro/textures/wood_planks_dirt_nor_gl_1k-r1.png",
  "field/wood_planks_dirt_rough_1k.jpg": "v31/retro/textures/wood_planks_dirt_rough_1k-r1.png",
  "field/brown_mud_diff_1k.jpg": "v31/retro/textures/brown_mud_diff_1k-r1.png",
  "field/brown_mud_nor_gl_1k.jpg": "v31/retro/textures/brown_mud_nor_gl_1k-r1.png",
  "field/brown_mud_rough_1k.jpg": "v31/retro/textures/brown_mud_rough_1k-r1.png"
});
export function resolveV31Asset(path,assetVariants=EMPTY_ASSET_VARIANTS){
 if(typeof path!=='string'||!/^(intro|field)\/[a-zA-Z0-9_-]+\.(glb|png|jpg)$/.test(path))throw new Error('Invalid original asset path');
 if(!assetVariants||!Object.isFrozen(assetVariants)||![Object.prototype,null].includes(Object.getPrototypeOf(assetVariants)))throw new Error('Asset variants must be a frozen plain registry');
 for(const key of Reflect.ownKeys(assetVariants)){
  const entry=Object.getOwnPropertyDescriptor(assetVariants,key);
  if(typeof key!=='string'||!entry||!('value' in entry)||!Object.hasOwn(V31_ASSET_VARIANTS,key)||entry.value!==V31_ASSET_VARIANTS[key]||!/^v31\/retro\/(?:[a-zA-Z0-9_-]+-r1\.glb|textures\/[a-zA-Z0-9_-]+-r1\.png)$/.test(entry.value))throw new Error('Unreviewed asset variant');
 }
 return Object.hasOwn(assetVariants,path)?assetVariants[path]:path;
}

