import * as THREE from 'three';

/** CF-V1.1 material wrapper. No mesh, rig, collision, camera or game-state edits.
 * Compose inherited shader hooks. Opaque painted surfaces only: practical lights,
 * glass, liquid, foliage cutouts and screen/UI materials keep their own treatment.
 */
export const PS2_STYLE=Object.freeze({version:'cf-ps2-v1',environmentGrid:128,characterGrid:256,colorSteps:31});
export function applyPS2Materials(target,{profile='environment'}={}){
  let changed=0;
  function material(m){
    if(!m||!(m.isMeshStandardMaterial||m.isMeshPhongMaterial||m.isMeshLambertMaterial)||m.transparent||m.alphaTest>0||m.userData?.ps2Exclude)return;
    if(m.emissive&&m.emissive.getHex()!==0&&Number(m.emissiveIntensity??1)>0)return;
    const prior=m.userData.cfPS2;
    if(prior){
      if(profile==='character'&&prior.profile!=='character'){prior.profile='character';m.needsUpdate=true;}
      if('roughness'in m)m.roughness=Math.max(.88,Number(m.roughness)||0);
      if('metalness'in m)m.metalness=Math.min(.1,Number(m.metalness)||0);
      if('envMapIntensity'in m)m.envMapIntensity=Math.min(.15,Number(m.envMapIntensity)||0);
      return;
    }
    const state=m.userData.cfPS2={version:PS2_STYLE.version,profile};
    if('roughness'in m)m.roughness=Math.max(.88,Number(m.roughness)||0);
    if('metalness'in m)m.metalness=Math.min(.1,Number(m.metalness)||0);
    if('envMapIntensity'in m)m.envMapIntensity=Math.min(.15,Number(m.envMapIntensity)||0);
    if('shininess'in m)m.shininess=Math.min(8,Number(m.shininess)||0);
    const before=m.onBeforeCompile,key=m.customProgramCacheKey;
    const inheritedKey=key?key.call(m):'';
    m.onBeforeCompile=function(shader,renderer){
      before?.call(this,shader,renderer);
      const grid=state.profile==='character'?PS2_STYLE.characterGrid:PS2_STYLE.environmentGrid;
      shader.uniforms.cfPS2TexelGrid={value:new THREE.Vector2(grid,grid)};
      shader.fragmentShader='uniform vec2 cfPS2TexelGrid;\n'+shader.fragmentShader;
      const chunk=THREE.ShaderChunk.map_fragment.replace('texture2D( map, vMapUv )','texture2D( map, (floor(vMapUv * cfPS2TexelGrid) + 0.5) / cfPS2TexelGrid )');
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',chunk);
      if(this.isMeshStandardMaterial)shader.fragmentShader=shader.fragmentShader.replace('#include <lights_physical_fragment>','roughnessFactor = max(roughnessFactor, 0.88); metalnessFactor = min(metalnessFactor, 0.1);\n#include <lights_physical_fragment>');
      // Fixed colour precision rather than a full-screen blur/pixel filter.
      const grade='outgoingLight = floor(max(outgoingLight, vec3(0.0)) * 31.0 + 0.5) / 31.0;\n';
      if(shader.fragmentShader.includes('#include <opaque_fragment>'))shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',grade+'#include <opaque_fragment>');
      else shader.fragmentShader=shader.fragmentShader.replace('#include <output_fragment>',grade+'#include <output_fragment>');
    };
    m.customProgramCacheKey=function(){return inheritedKey+'|'+PS2_STYLE.version+'|'+state.profile;};
    m.needsUpdate=true;changed++;
  }
  if(target?.isMaterial)material(target);
  else target?.traverse?.(o=>{if(o.isMesh)for(const m of [].concat(o.material||[]))material(m);});
  return changed;
}
