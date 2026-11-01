import * as THREE from 'three';

/** R1 dog playback samples the authored deform rig from the existing clock.
 * This module owns only presentation resources. It creates no timers, audio,
 * gameplay actors, root motion or materials, and never writes shared geometry.
 */
function createR1DogPresentation(gltf) {
  if (!gltf?.asset?.extras?.realismR1Dog) return null;
  const scene = gltf.scene;
  const clip = gltf.animations.find(item => item.name === 'R1_Dog_BarkWeightShift'),reducedClip=gltf.animations.find(item=>item.name==='R1_Dog_BarkWeightShift_Reduced');
  if (!clip || !reducedClip || [clip,reducedClip].some(c=>Math.abs(c.duration-9.4)>.001)) throw new Error('R1 dog clip contract failed');
  const names = ['DogHead','DogJaw','DogNeck','DogCollarTether','DogFrontPawL','DogFrontPawR','DogHindPawL','DogHindPawR'];
  const nodes = Object.fromEntries(names.map(name => [name,scene.getObjectByName(name)]));
  if (names.some(name => !nodes[name])) throw new Error('R1 dog semantic rig incomplete');
  const skins=[];scene.traverse(object=>{if(object.isSkinnedMesh){skins.push(object);object.frustumCulled=false;}});
  if (!skins.length) throw new Error('R1 dog has no deformable skin');
  const skeletons=new Set(skins.map(skin=>skin.skeleton));
  const makeChannels=source=>source.tracks.map(track=>{
    const binding=THREE.PropertyBinding.parseTrackName(track.name),node=THREE.PropertyBinding.findNode(scene,binding.nodeName);
    if(!node||!['position','quaternion','scale'].includes(binding.propertyName))throw new Error('R1 dog animation target invalid');
    return {node,property:binding.propertyName,interpolant:track.createInterpolant()};
  });
  const channels=makeChannels(clip),reducedChannels=makeChannels(reducedClip);
  let disposed=false;
  // Calibrate support against the first exported sample, not independently
  // rounded GLB default-node values. Every later support sample is measured.
  for(const channel of channels){channel.node[channel.property].fromArray(channel.interpolant.evaluate(0));if(channel.property==='quaternion')channel.node.quaternion.normalize();}
  scene.updateWorldMatrix(true,true);scene.updateMatrixWorld(true);const contactPoint=new THREE.Vector3(),paws=['DogFrontPawL','DogFrontPawR','DogHindPawL','DogHindPawR'].map(name=>({node:nodes[name],rest:scene.worldToLocal(nodes[name].getWorldPosition(new THREE.Vector3()))}));
  return {
    nodes, skins, clip,
    update(pose, frame) {
      if(disposed)return;
      // Clip endpoints are duplicated. Use the real 9.4-second sound phase,
      // not the export's slightly rounded Float32 duration as a new clock.
      const seconds=Math.min(pose.active?pose.phase:3,clip.duration);
      // The reduced performance is independently baked at 28% body/head motion
      // with the same jaw phase and freshly solved fixed paw support.
      for(const channel of frame.reduced?reducedChannels:channels){channel.node[channel.property].fromArray(channel.interpolant.evaluate(seconds));if(channel.property==='quaternion')channel.node.quaternion.normalize();}
      scene.updateWorldMatrix(true,true);scene.updateMatrixWorld(true);
      if(frame.player){
        const look=Math.atan2(frame.player.x-ROADSIDE_DOG.position[0],frame.player.z-ROADSIDE_DOG.position[2])-ROADSIDE_DOG.yaw;
        const yaw=Math.max(-.28,Math.min(.28,Math.atan2(Math.sin(look),Math.cos(look))))*.5*(frame.reduced?.28:1);
        const head=nodes.DogHead,parent=head.parent.getWorldQuaternion(new THREE.Quaternion()),world=head.getWorldQuaternion(new THREE.Quaternion());
        head.quaternion.copy(parent.invert().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),yaw).multiply(world)));
        scene.updateMatrixWorld(true);
      }
      for(const skeleton of skeletons)skeleton.update();
      let pawDisplacement=0;for(const paw of paws){scene.worldToLocal(paw.node.getWorldPosition(contactPoint));pawDisplacement=Math.max(pawDisplacement,contactPoint.distanceTo(paw.rest));}
      return {pawDisplacement,phase:seconds,clip:frame.reduced?reducedClip.name:clip.name};
    },
    dispose(){if(disposed)return;disposed=true;}
  };
}

export const ROADSIDE_DOG=Object.freeze({position:[4.25,0,3.95],yaw:-2.65,pole:[3.02,.70,3.75],tetherLength:2.15});
// One fixed presentation phase owns recorded sound and jaw movement. RMS samples are
// measured from the approved unchanged PCM file; this is not listening QA.
export const ROADSIDE_DOG_SOUND=Object.freeze({cycleSeconds:9.4,durationSeconds:89902/44100,byteCap:256*1024,envelopeStep:.02});
const BARK_ENVELOPE=Object.freeze([0.728,0.933,0.685,0.465,0.586,0.286,0.421,0.311,0.456,0.406,0.082,0.214,0.131,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.934,0.996,0.711,0.505,0.311,0.347,0.214,0.509,0.535,0.344,0.263,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.327,0.594,0.707,0.323,0.255,0.265,0.121,0.212,0.288,0.175,0.218,0.224,0.193,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.513,0.733,1.0,0.734,0.591,0.483,0.366,0.178,0.098,0.371,0.579,0.652,0.512,0.263,0.335,0.211,0.026,0.213]);
function bodyEnvelopeMean(phase){
 const window=.09,step=ROADSIDE_DOG_SOUND.envelopeStep,start=Math.max(0,phase-window),end=Math.min(phase,ROADSIDE_DOG_SOUND.durationSeconds);
 if(end<=start)return 0;
 let area=0;
 // Integrate the piecewise-linear recorded envelope exactly over at most six
 // segments. A continuous window avoids delayed steps at the first sample.
 for(let index=Math.floor(start/step);index<=Math.floor(end/step);index++){
  const left=Math.max(start,index*step),right=Math.min(end,(index+1)*step),a=BARK_ENVELOPE[index]||0,b=BARK_ENVELOPE[index+1]||0;
  area+=(right-left)*(a+(b-a)*((left+right)*.5-index*step)/step);
 }
 return area/window;
}
/** No timers or gameplay actors. The root and paw support remain fixed. */
export function roadsideDogPose(frame={}){
 const t=Math.max(0,Number(frame.elapsed??frame.motion?.time??frame.time)||0),active=!frame.gameplay&&['emergence','bang','cabin','exit','flashlight','walk','history','disappearance'].includes(frame.chapter),phase=t%ROADSIDE_DOG_SOUND.cycleSeconds,cycle=Math.floor(t/ROADSIDE_DOG_SOUND.cycleSeconds),soundWindow=active&&phase<ROADSIDE_DOG_SOUND.durationSeconds;
 const cursor=phase/ROADSIDE_DOG_SOUND.envelopeStep,index=Math.floor(cursor),mix=cursor-index,bark=soundWindow?(BARK_ENVELOPE[index]||0)*(1-mix)+(BARK_ENVELOPE[index+1]||0)*mix:0;
 // Body mass follows the exact jaw/sound envelope through a short causal
 // window. Sampling elapsed time directly makes pause/replay/jumps repeatable;
 // there is no new timer, accumulated state or anticipated bark.
 const effort=active?bodyEnvelopeMean(phase):0;
 const motion=frame.reduced?.28:1,breath=Math.sin(t*2.4)*.22;
 return {active,bark,phase,cycle,soundWindow,head:motion*(Math.sin(t*.53)*.014-effort*.07),jaw:bark*.35,chest:motion*(effort*.8+breath*.16),tail:motion*Math.sin(t*1.3)*.035};
}
export function createRoadsideDog(parent,{heightAt=()=>0}={}){
 const root=new THREE.Group();root.name='Tethered roadside dog';root.position.fromArray(ROADSIDE_DOG.position);root.position.y=heightAt(root.position.x,root.position.z);root.rotation.y=ROADSIDE_DOG.yaw;parent.add(root);
 const ropeMaterial=new THREE.MeshStandardMaterial({color:0x8e7956,roughness:.94}),ropeGeometry=new THREE.BufferGeometry();const rope=new THREE.Mesh(ropeGeometry,ropeMaterial);rope.name='Visible collar tether to lightpole';parent.add(rope);
 let rigPresentation=null;
 let asset=null,head=null,jaw=null,tail=null,collar=null,disposed=false,tetherBuilt=false,chest=null,home=null,ownedChestMaterial=null;const bodyEffort={value:0};
 const stats={status:'loading',visible:false,barkMotion:0,pawsPlanted:true,tetherLength:0,audio:'owned by prologue audio bus; listening unverified'};
 // The animated collar endpoint owns a bounded reusable tube. No per-frame
 // TubeGeometry replacement and no animation/timing authority in the tether.
 let r1RopeLength=null;
 const tetherStart=new THREE.Vector3(),tetherEnd=new THREE.Vector3(...ROADSIDE_DOG.pole),tetherPoint=new THREE.Vector3(),tetherTangent=new THREE.Vector3(),tetherSide=new THREE.Vector3(),tetherUp=new THREE.Vector3(),tetherPrevious=new THREE.Vector3(),worldUp=new THREE.Vector3(0,1,0);
 function updateR1Tether(){
  const rings=17,sides=6;
  if(!tetherBuilt){
   const indices=[];for(let r=0;r<rings-1;r++)for(let a=0;a<sides;a++){const b=(a+1)%sides,c=r*sides;indices.push(c+a,c+sides+a,c+b,c+b,c+sides+a,c+sides+b);}
   ropeGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(rings*sides*3),3));ropeGeometry.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(rings*sides*3),3));ropeGeometry.setIndex(indices);tetherBuilt=true;
  }
  parent.worldToLocal(collar.getWorldPosition(tetherStart));
  const arcLength=(start,sag)=>{let total=0,px=start.x,py=start.y,pz=start.z;for(let i=1;i<rings;i++){const u=i/(rings-1),x=start.x+(tetherEnd.x-start.x)*u,y=start.y+(tetherEnd.y-start.y)*u-Math.sin(Math.PI*u)*sag,z=start.z+(tetherEnd.z-start.z)*u;total+=Math.hypot(x-px,y-py,z-pz);px=x;py=y;pz=z;}return total;};
  if(r1RopeLength===null){const neutral=parent.worldToLocal(root.localToWorld(new THREE.Vector3(-.18,.85,.5)));r1RopeLength=arcLength(neutral,.20);}
  // Fixed material length: the collar's small motion changes slack, rather
  // than stretching the rope mesh. This does not change the existing limit.
  let low=0,high=.50;for(let i=0;i<16;i++){const mid=(low+high)/2;if(arcLength(tetherStart,mid)<r1RopeLength)low=mid;else high=mid;}const sag=(low+high)/2;
  const positions=ropeGeometry.attributes.position,normals=ropeGeometry.attributes.normal;let length=0;
  for(let r=0;r<rings;r++){
   const u=r/(rings-1);tetherPoint.copy(tetherStart).lerp(tetherEnd,u);tetherPoint.y-=Math.sin(Math.PI*u)*sag;
   if(r)length+=tetherPoint.distanceTo(tetherPrevious);tetherPrevious.copy(tetherPoint);
   tetherTangent.copy(tetherEnd).sub(tetherStart);tetherTangent.y-=Math.cos(Math.PI*u)*Math.PI*sag;tetherTangent.normalize();
   tetherSide.crossVectors(tetherTangent,worldUp);if(tetherSide.lengthSq()<1e-8)tetherSide.set(1,0,0);else tetherSide.normalize();tetherUp.crossVectors(tetherSide,tetherTangent).normalize();
   for(let a=0;a<sides;a++){const angle=a/sides*Math.PI*2,c=Math.cos(angle),s=Math.sin(angle),nx=tetherSide.x*c+tetherUp.x*s,ny=tetherSide.y*c+tetherUp.y*s,nz=tetherSide.z*c+tetherUp.z*s,i=r*sides+a;positions.setXYZ(i,tetherPoint.x+.008*nx,tetherPoint.y+.008*ny,tetherPoint.z+.008*nz);normals.setXYZ(i,nx,ny,nz);}
  }
  positions.needsUpdate=true;normals.needsUpdate=true;ropeGeometry.computeBoundingSphere();stats.tetherLength=length;stats.tetherLengthError=Math.abs(length-r1RopeLength);stats.tetherAnchor=tetherStart.toArray();
 }

 return {root,stats,accept(gltf){if(disposed)return;asset=gltf.scene;root.add(asset);head=asset.getObjectByName('DogHead');jaw=asset.getObjectByName('DogJaw');tail=asset.getObjectByName('DogTail');collar=asset.getObjectByName('DogCollarTether');if(!head||!jaw||!tail||!collar){root.remove(asset);asset=null;stats.status='failed';return;}chest=asset.getObjectByName('DogChest');home={head:head.position.clone(),tail:tail.position.clone()};
 if(gltf.asset?.extras?.realismR1Dog){
  try{rigPresentation=createR1DogPresentation(gltf);stats.rig='R1 authored 36-joint skin';stats.status='ready';return;}
  catch(error){root.remove(asset);asset=null;stats.status='failed';stats.error=error.message;return;}
 }
 if(chest){const source=chest.material,previous=source.onBeforeCompile,baseKey=source.customProgramCacheKey();
 // The GLB coat is shared by the torso, head, jaw and tail. Keep body effort on
 // the torso only: head/jaw motion already comes from their presentation nodes.
 const mat=ownedChestMaterial=source.clone();chest.material=mat;
 mat.onBeforeCompile=shader=>{previous?.(shader);shader.uniforms.dogEffort=bodyEffort;shader.vertexShader='uniform float dogEffort;\n'+shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
 float dogHeight=position.y+0.68;float planted=smoothstep(.13,.58,dogHeight);
 transformed.y+=dogEffort*.013*planted;
 transformed.z+=dogEffort*.020*planted;
 transformed.x*=1.+dogEffort*.018*planted;`);};mat.customProgramCacheKey=()=>baseKey+'|original-dog-effort-v2';mat.needsUpdate=true;}
 stats.status='ready';},
 update(frame,visible=true){if(disposed)return;const p=roadsideDogPose(frame);root.visible=rope.visible=visible&&!!asset;stats.visible=root.visible;if(!asset)return;
 if(rigPresentation){const measured=rigPresentation.update(p,frame);stats.barkMotion=p.bark;stats.bodyEffort=p.chest;stats.pawDisplacement=measured.pawDisplacement;stats.pawsPlanted=measured.pawDisplacement<=.005;stats.performancePhase=measured.phase;stats.authoredClip=measured.clip;stats.bodyEffortBasis='legacy envelope diagnostic; actual deformation is the named baked clip';root.updateMatrixWorld(true);updateR1Tether();return;}
 head.rotation.x=p.head;head.position.copy(home.head);head.position.y+=p.chest*.013;head.position.z+=p.chest*.020;
 const target=frame.player,look=target?Math.atan2(target.x-ROADSIDE_DOG.position[0],target.z-ROADSIDE_DOG.position[2])-ROADSIDE_DOG.yaw:0;head.rotation.y=Math.max(-.28,Math.min(.28,Math.atan2(Math.sin(look),Math.cos(look))))*.5;
 // Both attachment nodes follow the torso's same top-region displacement.
 // The tail pivot used to stay behind while the rump moved during each bark.
 tail.position.copy(home.tail);tail.position.y+=p.chest*.013;tail.position.z+=p.chest*.020;
 jaw.rotation.x=p.jaw;tail.rotation.y=p.tail;bodyEffort.value=p.chest;stats.barkMotion=p.bark;stats.bodyEffort=p.chest;stats.pawDisplacement=0;root.updateMatrixWorld(true);
 if(!tetherBuilt){const start=parent.worldToLocal(collar.getWorldPosition(new THREE.Vector3())),end=new THREE.Vector3(...ROADSIDE_DOG.pole),points=[];for(let i=0;i<17;i++){const t=i/16,q=start.clone().lerp(end,t);q.y-=Math.sin(Math.PI*t)*.20;points.push(q);}const curve=new THREE.CatmullRomCurve3(points);stats.tetherLength=curve.getLength();rope.geometry.dispose();rope.geometry=new THREE.TubeGeometry(curve,16,.008,5,false);rope.geometry.computeBoundingSphere();tetherBuilt=true;}},
 dispose(){if(disposed)return;disposed=true;root.removeFromParent();rope.removeFromParent();rigPresentation?.dispose();rigPresentation=null;ownedChestMaterial?.dispose();ownedChestMaterial=null;rope.geometry.dispose();ropeMaterial.dispose();stats.status='disposed';stats.visible=false;}
 };
}
