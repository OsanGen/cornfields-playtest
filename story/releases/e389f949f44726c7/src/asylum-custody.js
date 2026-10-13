import * as THREE from 'three';
import {reachPrologueArm} from './prologue-confrontation.js';
import {actualVertices} from './asylum-cruiser.js';
import {clamp,smooth,CRASH} from './asylum-crash.js';
const bone=(actor,id)=>{let b;actor.root.traverse(o=>{if(o.isBone&&o.name.replaceAll('.','')===id)b=o;});if(!b)throw new Error('Required bone missing '+id);return b;};
export {bone};
// Existing IK has small nonuniform-transform residuals even at the input wrist.
// Blend its onset to the untouched authored pose so weight zero is an identity.
function blendIKOnset(states,weight){const u=smooth(weight/.05);if(u>=1)return;for(const {b,p,q}of states){b.position.lerpVectors(p,b.position.clone(),u);b.quaternion.copy(q.clone().slerp(b.quaternion,u));}}

export function poseArms(actor,targets,weight=1,{behind=false}={}){
 for(const [i,side]of ['L','R'].entries()){
  const upper=bone(actor,'armup'+side),lower=bone(actor,'armlo'+side),hand=bone(actor,'hand'+side),states=[upper,lower,hand].map(b=>({b,p:b.position.clone(),q:b.quaternion.clone()})),pole=actor.root.worldToLocal(lower.getWorldPosition(new THREE.Vector3())).lerp(new THREE.Vector3(i?-.42:.42,1.1,behind?-.28:.40),weight),palm=hand.getWorldQuaternion(new THREE.Quaternion()).slerp(actor.root.getWorldQuaternion(new THREE.Quaternion()),weight);
  // The wrist is an independent control. Carry its retained bind orientation
  // with the forearm so the behind-back pose does not fold skin through itself.
  let bindRelative=null;if(behind)actor.root.traverse(mesh=>{if(bindRelative||!mesh.isSkinnedMesh)return;const hi=mesh.skeleton.bones.indexOf(hand),li=mesh.skeleton.bones.indexOf(lower);if(hi<0||li<0)return;const bindQ=index=>{const q=new THREE.Quaternion();mesh.skeleton.boneInverses[index].clone().invert().decompose(new THREE.Vector3(),q,new THREE.Vector3());return q;};bindRelative=bindQ(li).invert().multiply(bindQ(hi));});if(behind&&!bindRelative)throw new Error('Actual wrist bind orientation unavailable '+side);
  for(let n=0;n<4;n++){for(const {b,p,q}of states){b.position.copy(p);b.quaternion.copy(q);}actor.root.updateMatrixWorld(true);reachPrologueArm(actor.root,upper,lower,hand,new THREE.Vector3(...targets[i]),pole,true);actor.root.updateMatrixWorld(true);hand.quaternion.copy(hand.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(behind?lower.getWorldQuaternion(new THREE.Quaternion()).multiply(bindRelative):palm));actor.root.updateMatrixWorld(true);}
  blendIKOnset(states,weight);
 }
 actor.root.updateMatrixWorld(true);actor.root.traverse(o=>o.skeleton?.update());
}

function actualRingNormal(points,center,reference){
 const a=Array.from({length:3},()=>[0,0,0]),v=[[1,0,0],[0,1,0],[0,0,1]];
 for(const point of points){const p=point.clone().sub(center).toArray();for(let i=0;i<3;i++)for(let j=0;j<3;j++)a[i][j]+=p[i]*p[j];}
 for(let n=0;n<32;n++){
  let p=0,q=1;for(const [i,j]of [[0,2],[1,2]])if(Math.abs(a[i][j])>Math.abs(a[p][q])){p=i;q=j;}
  if(Math.abs(a[p][q])<1e-18)break;const angle=.5*Math.atan2(2*a[p][q],a[q][q]-a[p][p]),c=Math.cos(angle),s=Math.sin(angle),pp=a[p][p],qq=a[q][q],pq=a[p][q];
  for(let k=0;k<3;k++)if(k!==p&&k!==q){const kp=a[k][p],kq=a[k][q];a[k][p]=a[p][k]=c*kp-s*kq;a[k][q]=a[q][k]=s*kp+c*kq;}
  a[p][p]=c*c*pp-2*s*c*pq+s*s*qq;a[q][q]=s*s*pp+2*s*c*pq+c*c*qq;a[p][q]=a[q][p]=0;
  for(let k=0;k<3;k++){const kp=v[k][p],kq=v[k][q];v[k][p]=c*kp-s*kq;v[k][q]=s*kp+c*kq;}
 }
 const ix=[0,1,2].reduce((i,j)=>a[j][j]<a[i][i]?j:i),axis=new THREE.Vector3(...v.map(row=>row[ix])).normalize();if(axis.dot(reference)<0)axis.negate();return axis;
}

/** Inspect the complete actual deformed wrist skin in its own axial section. */
export function wristSection(actor,side){
 const hand=bone(actor,'hand'+side),lower=bone(actor,'armlo'+side),joint=hand.getWorldPosition(new THREE.Vector3()),referenceAxis=joint.clone().sub(lower.getWorldPosition(new THREE.Vector3())).normalize(),meshes=[],anchors=[];
 // The independent wrist control can lie outside the bent skin. Find the
 // anatomical wrist ring in the retained bind mesh, then carry its triangle
 // barycentric points through the real deformation. Their mean locates the
 // actual skin section, rather than inventing a radius or relaxing a guard.
 actor.root.traverse(o=>{if(!o.isSkinnedMesh||!/arms/i.test(o.name))return;
  const ids=o.geometry.attributes.skinIndex,w=o.geometry.attributes.skinWeight,owned=new Set(o.skeleton.bones.flatMap((b,i)=>{for(let p=b;p;p=p.parent)if(p===hand||p===lower)return [i];return [];})),vertices=actualVertices(o),weights=vertices.map((_,i)=>{let v=0;for(let k=0;k<4;k++)if(owned.has(ids.getComponent(i,k)))v+=w.getComponent(i,k);return v;}),index=o.geometry.index;
  const handIndex=o.skeleton.bones.indexOf(hand),lowerIndex=o.skeleton.bones.indexOf(lower);if(handIndex<0||lowerIndex<0)return;
  const bindHand=new THREE.Vector3().setFromMatrixPosition(o.skeleton.boneInverses[handIndex].clone().invert()),bindLower=new THREE.Vector3().setFromMatrixPosition(o.skeleton.boneInverses[lowerIndex].clone().invert()),bindAxis=bindHand.clone().sub(bindLower).normalize(),rest=vertices.map((_,i)=>new THREE.Vector3().fromBufferAttribute(o.geometry.attributes.position,i).applyMatrix4(o.bindMatrix)),triangles=[];
  for(let i=0;i<(index?index.count:vertices.length);i+=3){const ix=[0,1,2].map(j=>index?index.getX(i+j):i+j);if(ix.some(j=>weights[j]<=.8))continue;for(let j=0;j<3;j++){const a=ix[j],b=ix[(j+1)%3],da=rest[a].clone().sub(bindHand).dot(bindAxis),db=rest[b].clone().sub(bindHand).dot(bindAxis);if(da*db>0||Math.abs(da-db)<1e-12)continue;const p=vertices[a].clone().lerp(vertices[b],da/(da-db));if(p.distanceTo(joint)<.07)anchors.push(p);}triangles.push(ix);}
  meshes.push({vertices,triangles});
 });
 if(anchors.length<3)throw new Error('Actual wrist surface unavailable '+side);
 const center=anchors.reduce((p,q)=>p.add(q),new THREE.Vector3()).multiplyScalar(1/anchors.length),axis=actualRingNormal(anchors,center,referenceAxis),points=[];
 // The bind-ring samples determine a real deformed section plane. Intersect
 // every owned skin triangle, not a preselected subset of bind-crossing faces.
 // Perimeter-length weighting makes the center independent of triangulation
 // density. Returned section points are actual skin, including the full cut.
 // Ownership > .8, the 7 cm anatomical region and 3-point guard are unchanged.
 const boundary=[];for(const {vertices,triangles}of meshes)for(const ix of triangles){const hits=[];for(let j=0;j<3;j++){const a=vertices[ix[j]],b=vertices[ix[(j+1)%3]],da=a.clone().sub(center).dot(axis),db=b.clone().sub(center).dot(axis);if(da*db>0||Math.abs(da-db)<1e-12)continue;const p=a.clone().lerp(b,da/(da-db));if(p.distanceTo(center)<.07&&p.distanceTo(joint)<.07){points.push(p);if(!hits.some(q=>q.distanceTo(p)<1e-9))hits.push(p);}}if(hits.length===2){const length=hits[0].distanceTo(hits[1]);boundary.push({length,center:hits[0].clone().add(hits[1]).multiplyScalar(.5)});}}const length=boundary.reduce((s,e)=>s+e.length,0);if(length>0)center.copy(boundary.reduce((p,e)=>p.addScaledVector(e.center,e.length),new THREE.Vector3()).multiplyScalar(1/length));
 if(points.length<3)throw new Error('Actual wrist surface unavailable '+side);
 const radial=points.map(p=>p.clone().sub(center).addScaledVector(axis,-p.clone().sub(center).dot(axis))),radius=Math.max(...radial.map(p=>p.length()));
 return {center,axis,points,radius,joint,anatomicalSamples:anchors.length};
}
export function createCuffs(){
 const root=new THREE.Group();root.name='Closed cuffs on actual wrists';const metal=new THREE.MeshStandardMaterial({color:0xa9b8bc,metalness:.85,roughness:.28}),rings=[];
 for(const side of ['L','R']){const geometry=new THREE.TorusGeometry(1,.12,12,64),original=geometry.index.array,ordered=[];
  // Reveal complete angular tube slices from the actual inner-contact edge,
  // rather than displaying the distant outer band before skin-side metal.
  for(let segment=0;segment<64;segment++)for(const band of [5,6,4,7,3,8,2,9,1,10,0,11])for(let j=0;j<6;j++)ordered.push(original[(band*64+segment)*6+j]);geometry.setIndex(ordered);
  const mesh=new THREE.Mesh(geometry,metal);mesh.name='Cuff '+side;root.add(mesh);rings.push(mesh);}
 const chain=new THREE.Mesh(new THREE.CylinderGeometry(.005,.005,1,8),metal);chain.name='Cuff joining chain';root.add(chain);
 let report=[];
 return {root,rings,chain,update(actor,closed=1){
  actor.root.updateMatrixWorld(true);root.parent?.updateWorldMatrix(true,false);report=[];
  const centers=[];
  for(const [i,side]of ['L','R'].entries()){
   const s=wristSection(actor,side),m=rings[i],r=(s.radius+.003)/(1-.12);centers.push(s.center);
   m.position.copy(root.worldToLocal(s.center.clone()));const radial=s.points.map(p=>p.clone().sub(s.center).addScaledVector(s.axis,-p.clone().sub(s.center).dot(s.axis))).reduce((a,b)=>a.lengthSq()>b.lengthSq()?a:b).normalize(),tangent=s.axis.clone().cross(radial).normalize();m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(radial,tangent,s.axis));const parentQ=root.getWorldQuaternion(new THREE.Quaternion()).invert();m.quaternion.premultiply(parentQ);m.scale.set(r,r,r*.2);m.geometry.setDrawRange(0,Math.floor(m.geometry.index.count*clamp(closed)/3)*3);
   report.push({side,vertices:s.points.length,innerRadius:r*(1-.12),skinRadius:s.radius,gap:.003});
  }
  root.updateMatrixWorld(true);const toward=centers[1].clone().sub(centers[0]).normalize(),rim=(mesh,direction)=>actualVertices(mesh).reduce((a,b)=>a.dot(direction)>b.dot(direction)?a:b),a=rim(rings[0],toward),b=rim(rings[1],toward.clone().negate());
  // Attach to facing actual outer cuff surfaces, not the interior wrist axes.
  if(b.clone().sub(a).dot(toward)<=0)throw new Error('Actual cuff joining span unavailable');
  chain.position.copy(root.worldToLocal(a.clone().add(b).multiplyScalar(.5)));chain.scale.y=a.distanceTo(b);chain.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize()).premultiply(root.getWorldQuaternion(new THREE.Quaternion()).invert());chain.visible=closed>=1;root.updateMatrixWorld(true);return report;
 },diagnostics:()=>report};
}
export const CUSTODY=Object.freeze({contact:9,cuffs:12,escort:13,door:21,entry:22,seated:27,closed:29,checked:31,confirmed:32,duration:33});
const mix=(a,b,u)=>a.map((v,i)=>v+(b[i]-v)*u);
const road=[CRASH.stationaryStanley[0]-CRASH.parked[0],0,CRASH.stationaryStanley[2]-CRASH.parked[2]];
const escortCurve=new THREE.CatmullRomCurve3([road,[-2.94,0,4.55],[-2.2,0,4.5],[1.1,0,4.5],[1.72,0,3.9],[1.72,0,2.4]].map(p=>new THREE.Vector3(...p)),false,'centripetal');
const total=escortCurve.getLength();
function escortAt(u){u=clamp(u);const p=escortCurve.getPointAt(u),v=escortCurve.getTangentAt(u);return {position:p.toArray(),yaw:Math.atan2(v.x,v.z),distance:u*total};}
const entryX=t=>t<=23?1.72-.42*smooth(t-22):1.3*(1-smooth((t-23)/4));
const footSteps=[[[22,22.65],[23.3,23.95],[24.6,25.25],[25.9,26.55]],[[22.65,23.3],[23.95,24.6],[25.25,25.9],[26.55,26.8]]];
export function custodyEntryFeet(t){return footSteps.map((steps,i)=>{const offset=i?.13:-.13;let p=[1.72+offset,.034,2.4];for(const [lo,hi]of steps){const x=entryX(hi>=26.55?27:hi)+offset,destination=[x,x>1.12?.034:.205,1.8];if(t<lo)return p;if(t<hi){const u=(t-lo)/(hi-lo),q=mix(p,destination,smooth(u));q[1]+=(destination[1]>p[1]+.1?.13:.09)*Math.sin(Math.PI*u);return q;}p=destination;}return p;});}
const handleApproach=new THREE.CatmullRomCurve3([[2.3,0,3.0],[2.70,0,2.5],[2.70,0,1.08],[1.72,0,1.1305]].map(p=>new THREE.Vector3(...p)),false,'centripetal');
function turnTravel(u){let previous=[road[0],0,road[2]-.55],distance=0;for(let i=1;i<=32;i++){const v=u*i/32,p=mix([road[0],0,road[2]-.55],[road[0]-.58*Math.cos(Math.PI*v),0,road[2]+.58*Math.sin(Math.PI*v)],v);distance+=Math.hypot(...p.map((x,j)=>x-previous[j]));previous=p;}return distance;}
const turnLength=turnTravel(1);
export function sampleCustody(time){
 const t=clamp(time,0,CUSTODY.duration),escort=escortAt(smooth((t-13)/8)),seat=smooth((t-22)/5),turn=smooth((t-12)/1);
 const entry=seat>0,stanley=t<13?[...road]:entry?[entryX(t),-.30*smooth(t-22)-.05*smooth((t-26.8)/.2),2.4]:escort.position;
 const yaw=t<12?0:t<13?Math.PI*turn:t<21?escort.yaw:Math.PI;
 const start=[-1.56,-.012,.31],waypoint=[-3.0013,0,.7107],cuffOfficer=[road[0],0,road[2]-.55],first=smooth((t-.5)/1.1),second=smooth((t-1.6)/2.9),firstHeading=Math.atan2(waypoint[0]-start[0],waypoint[2]-start[2]),secondHeading=Math.atan2(cuffOfficer[0]-waypoint[0],cuffOfficer[2]-waypoint[2]),turnTo=(a,b,u)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*u,heading=turnTo(firstHeading,secondHeading,smooth((t-1.3)/.6));
 let officer=t<=1.6?mix(start,waypoint,first):mix(waypoint,cuffOfficer,second),officerYaw=t<.5?turnTo(Math.PI,firstHeading,smooth(t/.5)):t<4.5?heading:turnTo(secondHeading,0,smooth((t-4.5)/1)),officerWalking=t>=.5&&t<4.5;
 if(t>=12){const beside=[stanley[0]-Math.cos(yaw)*.58,0,stanley[2]+Math.sin(yaw)*.58];officer=t<13?mix(cuffOfficer,beside,turn):beside;officerYaw=t<13?Math.PI*turn:yaw;officerWalking=t<21;}
 if(t>=21){officer=mix([2.30,0,2.4],[2.30,0,3.0],smooth((t-21.3)/.7));officerYaw=t<21.3?Math.PI*(1-smooth((t-21)/.3)):t<22?0:-Math.PI/2*smooth((t-22)/.5);officerWalking=t>=21.3&&t<22;}
 let officerDistance=t<12?first*Math.hypot(...waypoint.map((v,i)=>v-start[i]))+second*Math.hypot(...cuffOfficer.map((v,i)=>v-waypoint[i])):t<13?turnTravel(turn)-turnLength:escort.distance;
 if(t>=21)officerDistance=total+.6*smooth((t-21.3)/.7);
 if(t>=25.3&&t<26){const v=handleApproach.getTangentAt(0),heading=Math.atan2(v.x,v.z),delta=Math.atan2(Math.sin(heading+Math.PI/2),Math.cos(heading+Math.PI/2));officerYaw=-Math.PI/2+delta*smooth((t-25.3)/.7);}
 if(t>=26&&t<28){const u=smooth((t-26)/2),v=handleApproach.getTangentAt(u);officer=handleApproach.getPointAt(u).toArray();const heading=Math.atan2(v.x,v.z);officerYaw=heading*(1-smooth((t-27.5)/.5));officerWalking=true;officerDistance=total+.6+u*handleApproach.getLength();}
 const closeAngle=Math.PI/2*(1-smooth(t-28));
 if(t>=28){const c=Math.cos(closeAngle),s=Math.sin(closeAngle),x=1.11+.79*s+.051*c,z=1.52+.79*c-.051*s;officer=[x+.3385*c-.18*s,0,z-.3385*s-.18*c];officerYaw=-Math.PI/2+closeAngle;officerWalking=t<29;officerDistance=total+.6+handleApproach.getLength()+(Math.PI/2-closeAngle)*Math.hypot(.61,.3895);}
 // Make room for the restrained hands in the unchanged rear doorway/seat.
 // The feet retain their original supported targets while the torso moves
 // smoothly forward18cm; there is no car edit or instantaneous root change.
 if(t>=21.8)stanley[2]-=.18*smooth((t-21.8)/.7);
 const doorContact=smooth((t-27.65)/.35)*(1-smooth((t-31.5)/.5)),officerCrouch=.25*smooth((t-27.5)/.5)*(1-smooth((t-31.5)/.5));
 return {time:t,cuffed:t>=12,seated:t>=27,doorClosed:t>=29,handleChecked:t>=31,secured:t>=32,
  cuffClosure:smooth((t-10)/2),wristContact:smooth((t-8)/1)*(1-smooth((t-12)/.4)),escortContact:smooth((t-12.6)/.4)*(1-smooth((t-20.7)/.3)),
  stanley,stanleyYaw:yaw,officer,officerYaw,officerWalking,officerDistance,officerCrouch,doorContact,escortDistance:escort.distance,walking:t>=13&&t<21,
  seatBlend:seat,duck:smooth(t-22),footTargets:custodyEntryFeet(t),pose:seat>=1?'seated':seat>0?'exit':t>=13&&t<21?'walk':'standing',
  doorOpen:smooth((t-20)/1)*(1-smooth((t-28)/1)),handleTouch:smooth((t-29.7)/.5)*(1-smooth((t-31.5)/.5)),confirmation:t>=32,
 };
}
export function poseCustody(actor,sample){
 actor.root.position.fromArray(sample.stanley);actor.root.rotation.y=sample.stanleyYaw;
 const footTargets=sample.seatBlend>0?sample.footTargets:null;
 const gait=smooth((sample.time-13)/.2)*smooth((21-sample.time)/.2);
 actor.pose({mode:sample.seatBlend>0?'exit':gait>0?'walk':'standing',gait,time:sample.time,phase:sample.escortDistance*5,reduced:true,chapter:'asylum-custody',exitPose:sample.seatBlend>0?{transfer:1-sample.duck,footTargets}:null});
 if(sample.time>=21.8&&sample.time<=22){
  const states=[];actor.root.traverse(b=>{if(b!==actor.root)states.push({b,p:b.position.clone(),q:b.quaternion.clone(),s:b.scale.clone()});});
  actor.pose({mode:'exit',time:sample.time,reduced:true,chapter:'asylum-custody',exitPose:{transfer:1,footTargets:custodyEntryFeet(22)}});
  const u=smooth((sample.time-21.8)/.2);for(const {b,p,q,s}of states){b.position.lerpVectors(p,b.position.clone(),u);b.quaternion.copy(q.slerp(b.quaternion,u));b.scale.lerpVectors(s,b.scale.clone(),u);}actor.root.updateMatrixWorld(true);actor.root.traverse(o=>o.skeleton?.update());
 }
 // Stanley completed the command during recovery; retain the same restrained
 // pose through approach, turn, walking and seating.
 poseArms(actor,[[.075,1.0,-.14],[-.075,1.0,-.14]],1,{behind:true});
}
/** Surface-to-surface contact solved with existing arm lengths, never moving a bone after IK. */
export function fitOfficerWrist(officer,subject,officerSide,subjectSide,weight=1){
 officer.root.updateMatrixWorld(true);subject.root.updateMatrixWorld(true);
 const hand=bone(officer,'hand'+officerSide),shoulder=bone(officer,'armup'+officerSide),lower=bone(officer,'armlo'+officerSide),section=wristSection(subject,subjectSide),toward=shoulder.getWorldPosition(new THREE.Vector3()).sub(section.center).normalize();
 const target=section.points.reduce((a,b)=>a.clone().sub(section.center).dot(toward)>b.clone().sub(section.center).dot(toward)?a:b).clone();
 const owned=[];officer.root.traverse(o=>{if(!o.isSkinnedMesh||!/arms/i.test(o.name))return;const ids=o.geometry.attributes.skinIndex,w=o.geometry.attributes.skinWeight,set=new Set(o.skeleton.bones.flatMap((b,i)=>b===hand||b.parent===hand?[i]:[]));for(let i=0;i<w.count;i++){let sum=0;for(let k=0;k<4;k++)if(set.has(ids.getComponent(i,k)))sum+=w.getComponent(i,k);if(sum>.6)owned.push({o,i});}});
 const vertex=v=>v.o.getVertexPosition(v.i,new THREE.Vector3()).applyMatrix4(v.o.matrixWorld);
 const rest=hand.getWorldPosition(new THREE.Vector3()),restQ=hand.getWorldQuaternion(new THREE.Quaternion()),restPole=officer.root.worldToLocal(lower.getWorldPosition(new THREE.Vector3())),pole=new THREE.Vector3(officerSide==='L'?.5:-.5,1.1,.4),states=[shoulder,lower,hand].map(b=>({b,p:b.position.clone(),q:b.quaternion.clone()}));
 const solve=(p,bend,palm=null)=>{for(const {b,p,q}of states){b.position.copy(p);b.quaternion.copy(q);}officer.root.updateMatrixWorld(true);reachPrologueArm(officer.root,shoulder,lower,hand,officer.root.worldToLocal(p.clone()),bend,true);officer.root.updateMatrixWorld(true);if(palm)hand.quaternion.copy(hand.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(palm));officer.root.updateMatrixWorld(true);officer.root.traverse(o=>o.skeleton?.update());};
 const aim=target.clone();solve(aim,pole);const selected=owned.reduce((a,b)=>vertex(a).distanceToSquared(target)<vertex(b).distanceToSquared(target)?a:b);
 for(let i=0;i<3;i++){aim.add(target.clone().sub(vertex(selected)));solve(aim,pole);}
 const end=hand.getWorldPosition(new THREE.Vector3()),endQ=hand.getWorldQuaternion(new THREE.Quaternion());for(const {b,p,q}of states){b.position.copy(p);b.quaternion.copy(q);}officer.root.updateMatrixWorld(true);
 weight=clamp(weight);if(weight>0){const p=rest.lerp(end,weight),bend=restPole.lerp(pole,weight),palm=restQ.slerp(endQ,weight);for(let i=0;i<4;i++)solve(p,bend,palm);}
 blendIKOnset(states,weight);officer.root.updateMatrixWorld(true);officer.root.traverse(o=>o.skeleton?.update());const surface=vertex(selected);return {officerSide,subjectSide,weight,error:surface.distanceTo(target),surface:surface.toArray(),target:target.toArray(),vertices:owned.length};
}
export function poseOfficerCustody(officer,subject,sample){
 officer.root.position.fromArray(sample.officer);officer.root.rotation.y=sample.officerYaw;
 const t=sample.time,gait=Math.max(...[[.5,4.5],[12,13],[13,21],[21.3,22],[26,29]].map(([lo,hi])=>smooth((t-lo)/.2)*smooth((hi-t)/.2)));
 officer.pose({mode:gait>0?'walk':'standing',gait,time:t,phase:sample.officerDistance*5,reduced:true,crouch:sample.officerCrouch,chapter:'asylum-custody'});
 const contacts=[];
 if(sample.wristContact>0)for(const [a,b]of [['L','L'],['R','R']])contacts.push(fitOfficerWrist(officer,subject,a,b,sample.wristContact));
 if(sample.escortContact)contacts.push(fitOfficerWrist(officer,subject,'L','R',sample.escortContact));
 return contacts;
}
/** Hand fitted to a real rectangular handle face after the inherited pose. */
export function fitHandToHandle(actor,side,handle,weight=1){
 weight=clamp(weight);const hand=bone(actor,'hand'+side),upper=bone(actor,'armup'+side),lower=bone(actor,'armlo'+side);actor.root.updateMatrixWorld(true);handle.updateWorldMatrix(true,false);
 const face=handle.localToWorld(new THREE.Vector3(handle.geometry.parameters.width/2,0,0)),rest=hand.getWorldPosition(new THREE.Vector3()),restQ=hand.getWorldQuaternion(new THREE.Quaternion()),restElbow=actor.root.worldToLocal(lower.getWorldPosition(new THREE.Vector3())),contactQ=actor.root.getWorldQuaternion(new THREE.Quaternion()).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),Math.PI)),aim=face.clone(),weighted=[],states=[upper,lower,hand].map(b=>({b,p:b.position.clone(),q:b.quaternion.clone()}));
 actor.root.traverse(o=>{if(!o.isSkinnedMesh||!/arms/i.test(o.name))return;const ids=o.geometry.attributes.skinIndex,w=o.geometry.attributes.skinWeight,owned=new Set(o.skeleton.bones.flatMap((b,i)=>b===hand||b.parent===hand?[i]:[]));for(let i=0;i<w.count;i++){let sum=0;for(let k=0;k<4;k++)if(owned.has(ids.getComponent(i,k)))sum+=w.getComponent(i,k);if(sum>.6)weighted.push({o,i});}});
 if(!weighted.length)throw new Error('Hand skin unavailable for handle');
 const pole=new THREE.Vector3(side==='L'?.5:-.5,.5,.1),solve=(goal,palm,bend)=>{for(const {b,p,q}of states){b.position.copy(p);b.quaternion.copy(q);}actor.root.updateMatrixWorld(true);reachPrologueArm(actor.root,upper,lower,hand,actor.root.worldToLocal(goal.clone()),bend,true);actor.root.updateMatrixWorld(true);hand.quaternion.copy(hand.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(palm));actor.root.updateMatrixWorld(true);actor.root.traverse(o=>o.skeleton?.update());};
 const point=v=>v.o.getVertexPosition(v.i,new THREE.Vector3()).applyMatrix4(v.o.matrixWorld),axis=new THREE.Vector3(1,0,0).transformDirection(handle.matrixWorld),support=()=>weighted.map(point).reduce((a,b)=>a.dot(axis)<b.dot(axis)?a:b);
 // Fit the innermost actual skin point to the outer face, then blend wrist,
 // palm and elbow pole from the inherited pose. The limit at zero is continuous.
 solve(aim,contactQ,pole);for(let i=0;i<3;i++){aim.add(face.clone().sub(support()));solve(aim,contactQ,pole);}
 const contactWrist=hand.getWorldPosition(new THREE.Vector3());for(const {b,p,q}of states){b.position.copy(p);b.quaternion.copy(q);}actor.root.updateMatrixWorld(true);
 if(weight>0){const goal=rest.lerp(contactWrist,weight),palm=restQ.slerp(contactQ,weight),bend=restElbow.lerp(pole,weight);for(let i=0;i<4;i++)solve(goal,palm,bend);}
 blendIKOnset(states,weight);actor.root.updateMatrixWorld(true);actor.root.traverse(o=>o.skeleton?.update());const surface=support(),shoulder=upper.getWorldPosition(new THREE.Vector3()),elbow=lower.getWorldPosition(new THREE.Vector3()),wrist=hand.getWorldPosition(new THREE.Vector3());
 return {vertices:weighted.length,error:surface.distanceTo(face),surface:surface.toArray(),target:face.toArray(),weight,upperLength:shoulder.distanceTo(elbow),lowerLength:elbow.distanceTo(wrist)};
}
