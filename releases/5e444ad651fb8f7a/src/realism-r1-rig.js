/** Semantic adapter for the approved Stanley-only R1 replacement. */
export const R1_STANLEY_BONES=Object.freeze(['master','pelvis','waist','torso','collar','neck','head','mouth','shoulderL','armupL','armloL','handL','shoulderR','armupR','armloR','handR','legupL','legloL','foot1L','foot2L','legupR','legloR','foot1R','foot2R']);
export function createR1StanleyRig(model,gltf){
  if(gltf?.asset?.extras?.realismR1?.role!=='stanley')return null;
  const bones=new Map(),morphs=[];
  model.traverse(object=>{
    if(object.isBone){bones.set(object.name.replaceAll('.',''),object);object.userData.realismR1Deform=true;}
    if(object.morphTargetDictionary&&object.morphTargetInfluences)morphs.push({object,entries:Object.entries(object.morphTargetDictionary)});
  });
  const missing=R1_STANLEY_BONES.filter(name=>!bones.has(name));
  if(missing.length)throw new Error('R1 Stanley semantic rig missing '+missing.join(', '));
  return {
    bones,
    authoredEyelids:!!gltf.asset.extras.realismR1.authoredEyelids,
    applyFace(values={}){for(const {object,entries}of morphs)for(const [name,index]of entries)object.morphTargetInfluences[index]=Math.max(0,Math.min(1,Number(values[name])||0));},
    diagnostics:()=>({version:1,bones:bones.size,morphMeshes:morphs.length,morphTargets:[...new Set(morphs.flatMap(m=>m.entries.map(e=>e[0])))],source:gltf.asset.extras.realismR1.sourceSha256,quality:'unaccepted hero candidate',browserEvidence:'not run'}),
  };
}
