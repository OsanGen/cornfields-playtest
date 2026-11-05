/** Scoped R1 material transport for the two authored Stanley skin/eye classes.
 * Keep MeshStandardMaterial, its existing PBR maps, lighting and draw count.
 * Do not squash the skin roughness atlas into the old narrow G1 interval.
 * This adds no sampler, geometry, pass, transmission or scattering feature.
 * Actual neutral/night browser assessment and device measurements are pending.
 */
export function applyR1HumanSurface(material,{kind='skin'}={}) {
  if(!['skin','eye'].includes(kind))throw new Error('Unknown R1 human surface '+kind);
  if(material.userData.realismR1Surface){
    if(material.userData.realismR1Surface!==kind)throw new Error('R1 material class changed after compilation');
    return;
  }
  const before=material.onBeforeCompile,key=material.customProgramCacheKey?.bind(material),baseKey=key?key():'';
  const adjustment=kind==='skin'
    ?'roughnessFactor=clamp(roughnessFactor,.32,.88);'
    :'roughnessFactor=clamp(roughnessFactor,.12,.24);';
  material.onBeforeCompile=function(shader,renderer){
    before?.call(this,shader,renderer);
    // The inherited liquid override runs later at lights_physical_fragment.
    shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\n'+adjustment);
  };
  material.customProgramCacheKey=()=>baseKey+'|realism-r1-human-'+kind+'-v1';
  material.userData.realismR1Surface=kind;material.needsUpdate=true;
}
