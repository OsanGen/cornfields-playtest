import * as THREE from 'three';
export const R1_CONTACT_LIMITS=Object.freeze({windowMeters:.005,plantedSlideMeters:.005,plantedHeightMeters:.005});
/** Capture actual hand/finger skin samples once. A wrist origin plus an invented
 * offset is not contact evidence. This includes every sufficiently hand-weighted
 * vertex, so the measured forward envelope also detects glass penetration.
 */
export function createR1HandSurface(root,side){
  const samples=[];
  root.traverse(mesh=>{
    if(!mesh.isSkinnedMesh)return;
    const ids=mesh.geometry.attributes.skinIndex,weights=mesh.geometry.attributes.skinWeight;
    const wanted=new Set(mesh.skeleton.bones.flatMap((bone,index)=>{
      const name=bone.name.replaceAll('.','');return (name==='hand'+side||new RegExp('^f[12]'+side+'(?:00[24])?$').test(name))?[index]:[];
    }));
    if(!wanted.size)return;
    const indices=[];
    for(let i=0;i<ids.count;i++){
      let sum=0;for(let j=0;j<4;j++)if(wanted.has(ids.getComponent(i,j)))sum+=weights.getComponent(i,j);
      if(sum>.75)indices.push(i);
    }
    if(indices.length)samples.push({mesh,indices,points:new Float64Array(indices.length*3),matrix:new THREE.Matrix4()});
  });
  const p=new THREE.Vector3(),best=new THREE.Vector3();
  return {
    count:samples.reduce((n,s)=>n+s.indices.length,0),
    measure(target,marker=null){
      root.updateMatrixWorld(true);let maximum=-Infinity,bestScore=Infinity,selected=null;
      const inverse=new THREE.Matrix4().copy(root.matrixWorld).invert();
      for(const {mesh,indices,points,matrix}of samples){mesh.skeleton.update();matrix.multiplyMatrices(inverse,mesh.matrixWorld);for(let n=0;n<indices.length;n++){
        mesh.getVertexPosition(indices[n],p).applyMatrix4(matrix);points[n*3]=p.x;points[n*3+1]=p.y;points[n*3+2]=p.z;maximum=Math.max(maximum,p.z);
      }}
      // Pick a real leading skin point. Reuse this sample's values rather than
      // recomputing skeleton and object matrices for every vertex twice.
      for(const [sampleIndex,{points}]of samples.entries())for(let i=0;i<points.length;i+=3){
        if(points[i+2]<maximum-.00025)continue;
        const score=(points[i]-target.x)**2+(points[i+1]-target.y)**2;
        if(score<bestScore){best.set(points[i],points[i+1],points[i+2]);bestScore=score;selected={sampleIndex,offset:i};}
      }
      if(marker){const points=samples[marker.sampleIndex].points,i=marker.offset;best.set(points[i],points[i+1],points[i+2]);selected=marker;}
      return {point:best.clone(),maximum,vertices:this.count,marker:selected};
    },
  };
}
/** Two bounded, three-iteration skin-to-plane correction passes after the baked pose. The
 * existing anatomical arm solver remains authoritative for segment lengths.
 */
export function fitR1WindowHand({root,hand,surface,target,solve}){
  const desired=target.clone();
  // Establish the authored palm orientation before selecting one physical pad.
  // Keeping that vertex for the solve avoids alternating between fingertips.
  solve(root.worldToLocal(hand.getWorldPosition(new THREE.Vector3())));
  let measurement=surface.measure(desired);
  if(!surface.count||!Number.isFinite(measurement.maximum))return null;
  for(let pass=0;pass<2;pass++){
    measurement=surface.measure(desired);const marker=measurement.marker;
    for(let i=0;i<3;i++){
    const wrist=root.worldToLocal(hand.getWorldPosition(new THREE.Vector3()));
    const correction=desired.clone().sub(measurement.point);correction.z=desired.z-measurement.maximum;
    if(correction.length()<.00005)break;
    solve(wrist.add(correction));measurement=surface.measure(desired,marker);
    }
  }
  return {point:measurement.point.toArray(),target:desired.toArray(),error:measurement.point.distanceTo(desired),maximum:measurement.maximum,penetration:Math.max(0,measurement.maximum-desired.z),separation:Math.max(0,desired.z-measurement.maximum),vertices:measurement.vertices,method:'actual CPU-skinned hand/finger envelope'};
}
