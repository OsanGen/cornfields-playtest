/** Collect resources once even when cloned meshes share materials and textures. */
export function collectVisualResources(roots,resources=new Set()){
  for(const root of roots.filter(Boolean))root.traverse(object=>{
    if(object.geometry)resources.add(object.geometry);
    if(object.isSkinnedMesh)resources.add(object.skeleton);
    for(const material of [object.material].flat().filter(Boolean)){
      resources.add(material);
      for(const value of Object.values(material))if(value?.isTexture)resources.add(value);
    }
  });
  return resources;
}

/** A mount and its late loaders share this function to release resources once. */
export function createVisualResourceDisposer(){
  const disposed=new WeakSet();
  return resource=>{
    if(!resource||typeof resource.dispose!=='function'||disposed.has(resource))return;
    disposed.add(resource);resource.dispose();
  };
}
