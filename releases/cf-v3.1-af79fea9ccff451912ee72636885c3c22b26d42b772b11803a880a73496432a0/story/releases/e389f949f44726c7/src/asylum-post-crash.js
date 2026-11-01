// NEW V27 reconstruction; prior generated candidate bytes were lost. No acceptance inherited.
import * as THREE from 'three';
import {clone as cloneSkeleton} from 'three/addons/utils/SkeletonUtils.js';
import {createTexturedPrologueActor} from './prologue-model-actor.js';
import {createStoryForearmFit} from './hands.js';
import {applyHandGrip} from './hand-grip.js';
import {sampleCrashExit,clamp,smooth} from './asylum-crash.js';
import {sampleCustody} from './asylum-custody.js';

// Shared C2 seated-contact fit: imported rig and geometry remain unchanged.
export const {createClaranceContactFit,sampleClaranceRecovery}=(()=>{
 const T=THREE;
const update=root=>{root.updateWorldMatrix(true,true);root.updateMatrixWorld(true);root.traverse(o=>o.skeleton?.update());};
function rotate(b,from,to){const inverse=b.parent.matrixWorld.clone().invert(),delta=new T.Quaternion().setFromUnitVectors(from.transformDirection(inverse),to.transformDirection(inverse));b.quaternion.premultiply(delta);b.updateWorldMatrix(false,true);}
function fixedChain(actor,chain,target,pole){
 if(!Array.isArray(chain)||chain.length!==3||!actor?.root||![target,pole].every(p=>p&&[p.x,p.y,p.z].every(Number.isFinite)))throw Error('Driver IK invalid inputs');
 actor.root.updateWorldMatrix(true,true);
 for(const bone of chain){const m=bone?.parent?.matrixWorld;if(!m||!m.elements.every(Number.isFinite)||!Number.isFinite(m.determinant())||m.determinant()===0||!m.clone().invert().elements.every(Number.isFinite)||![...bone.position.toArray(),...bone.quaternion.toArray(),...bone.scale.toArray(),...bone.matrixWorld.elements].every(Number.isFinite))throw Error('Driver IK invalid parent or bone transform');const own=bone.matrixWorld;if(!Number.isFinite(own.determinant())||own.determinant()===0||!own.clone().invert().elements.every(Number.isFinite))throw Error('Driver IK noninvertible bone transform');}
 const [upper,lower,end]=chain,a=upper.getWorldPosition(new T.Vector3()),b=lower.getWorldPosition(new T.Vector3()),c=end.getWorldPosition(new T.Vector3()),la=chain.fixedLengths?.upper??a.distanceTo(b),lb=chain.fixedLengths?.lower??b.distanceTo(c);
 if(![...a.toArray(),...b.toArray(),...c.toArray(),la,lb].every(Number.isFinite)||la<=0||lb<=0)throw Error('Driver IK invalid segment lengths');
 const minimum=Math.abs(la-lb)+.0001,maximum=la+lb-.0001;if(![minimum,maximum].every(Number.isFinite)||minimum>maximum)throw Error('Driver IK invalid reach interval');
 const dir=target.clone().sub(a),raw=dir.length();if(!Number.isFinite(raw)||raw===0)throw Error('Driver IK zero or nonfinite target direction');const distance=T.MathUtils.clamp(raw,minimum,maximum);dir.normalize();
 const destination=a.clone().addScaledVector(dir,distance),bend=pole.clone().sub(a);bend.addScaledVector(dir,-bend.dot(dir));if(!bend.toArray().every(Number.isFinite)||!Number.isFinite(bend.lengthSq())||bend.lengthSq()<1e-16)throw Error('Driver IK pole degenerate');bend.normalize();
 const along=(la*la-lb*lb+distance*distance)/(2*distance),elbow=a.clone().addScaledVector(dir,along).addScaledVector(bend,Math.sqrt(Math.max(0,la*la-along*along))),lowerTip=lower.worldToLocal(c.clone());if(![along,...elbow.toArray(),...lowerTip.toArray()].every(Number.isFinite))throw Error('Driver IK nonfinite derived pose');
 rotate(upper,b.clone().sub(a),elbow.clone().sub(a));lower.position.copy(lower.parent.worldToLocal(elbow.clone()));lower.updateWorldMatrix(false,true);rotate(lower,lower.localToWorld(lowerTip).sub(lower.getWorldPosition(new T.Vector3())),destination.clone().sub(elbow));end.position.copy(end.parent.worldToLocal(destination));update(actor.root);
 return {upper:la,lower:lb,requestedDistance:raw,resolvedDistance:distance,geometricallyClamped:Math.abs(raw-distance)>1e-10,error:end.getWorldPosition(new T.Vector3()).distanceTo(target)};
}
function activeMeshes(root){const result=[];root.traverse(o=>{if(o.isMesh&&renderedSupportRanges(o).length)result.push(o);});return result;}
function meshTriangles(mesh,car){mesh.updateWorldMatrix(true,false);mesh.skeleton?.update();const positions=Array.from({length:mesh.geometry.attributes.position.count},(_,i)=>car.worldToLocal(mesh.getVertexPosition(i,new T.Vector3()).applyMatrix4(mesh.matrixWorld))),index=mesh.geometry.index,result=[];for(const[lo,hi]of renderedSupportRanges(mesh))for(let n=lo;n+2<hi;n+=3){const ids=[0,1,2].map(k=>index?index.getX(n+k):n+k);result.push({index:result.length,ids,points:ids.map(i=>positions[i])});}return result;}

const seatedSave=bones=>bones.map(b=>({b,p:b.position.clone(),q:b.quaternion.clone(),s:b.scale.clone()}));
const seatedRestore=states=>{for(const {b,p,q,s} of states){b.position.copy(p);b.quaternion.copy(q);b.scale.copy(s);}};
const quaternion=matrix=>{const q=new T.Quaternion();matrix.decompose(new T.Vector3(),q,new T.Vector3());return q;};
function shoeFaces(root,car,side){const out=[];for(const m of activeMeshes(root)){if(!/shoe/i.test(m.name))continue;const ids=m.geometry.attributes.skinIndex,w=m.geometry.attributes.skinWeight;for(const t of meshTriangles(m,car)){const own={L:0,R:0};for(const i of t.ids)for(let k=0;k<4;k++){const n=m.skeleton.bones[ids.getComponent(i,k)]?.name;for(const s of ['L','R'])if(n?.endsWith(s))own[s]+=w.getComponent(i,k);}if(own[side]>=own[side==='L'?'R':'L'])out.push({index:t.index,points:t.points.map(p=>p.toArray())});}}if(!out.length)throw Error('Driver actual shoe triangles unavailable '+side);return out;}
function fitClaranceSeatedContact({actor,car,wheel,floors,standing,parameters,weight=1,legWeight=weight,armWeight=weight}){
 if(![weight,legWeight,armWeight].every(w=>Number.isFinite(w)&&w>=0&&w<=1))throw Error('Invalid driver contact weight');if(legWeight===0&&armWeight===0)return{weight,legWeight,armWeight,identity:true};
 update(actor.root);const all=[];actor.root.traverse(b=>{if(b.isBone)all.push(b);});const original=seatedSave(all),bone=name=>{const b=actor.root.getObjectByName(name);if(!b)throw Error('Driver bone missing '+name);return b;};
 const sourceRoot=new T.Matrix4().fromArray(standing.rootMatrixWorld),sourceLocal=new T.Matrix4().compose(new T.Vector3(...standing.originalRoot),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),standing.yaw),new T.Vector3(1,1,1)),sourceCar=sourceRoot.clone().multiply(sourceLocal.invert()),sourceCarInverse=sourceCar.clone().invert();
 const support=floors.flatMap(m=>meshTriangles(m,car).map(t=>({mesh:m.name,index:t.index,points:t.points.map(p=>p.toArray())})));if(!support.length)throw Error('Driver actual floor and mat faces unavailable');
 const legs=['L','R'].map((side,index)=>{const chain=['legup','leglo','foot1'].map(n=>bone(n+side)),toe=bone('foot2'+side),points=chain.map(b=>b.getWorldPosition(new T.Vector3()));chain.fixedLengths={upper:points[0].distanceTo(points[1]),lower:points[1].distanceTo(points[2])};const neutral=quaternion(sourceCarInverse.clone().multiply(new T.Matrix4().fromArray(standing.legFrames['foot1'+side].matrixWorld))),rotation=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),parameters.footYaws[index]).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),parameters.footPitches[index])).multiply(neutral),world=car.getWorldQuaternion(new T.Quaternion()).multiply(rotation),local=chain[2].parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(world);return{side,index,chain,toe,points,original:seatedSave([...chain,toe]),footQuaternion:local,toeQuaternion:new T.Quaternion().fromArray(standing.legFrames['foot2'+side].quaternion),target:new T.Vector3(...parameters.targets[index]),targetHint:new T.Vector3(...parameters.targets[index]),iterations:[]};});
 const solveFull=leg=>{seatedRestore(leg.original);update(actor.root);const a=car.worldToLocal(leg.chain[0].getWorldPosition(new T.Vector3())),dir=leg.target.clone().sub(a).normalize(),bend=new T.Vector3(0,1,0);bend.addScaledVector(dir,-bend.dot(dir));if(bend.lengthSq()<1e-16)throw Error('Driver car-up knee plane degenerate');bend.normalize().applyAxisAngle(dir,parameters.kneeSwivels[leg.index]);const reach=fixedChain(actor,leg.chain,car.localToWorld(leg.target.clone()),car.localToWorld(a.add(bend)));leg.chain[2].quaternion.copy(leg.footQuaternion);leg.toe.quaternion.copy(leg.toeQuaternion);update(actor.root);return reach;};
 try{
 for(const leg of legs){for(let iteration=0;iteration<8;iteration++){const reach=solveFull(leg),gap=fullShoeSupport(shoeFaces(actor.root,car,leg.side),support,{maxSupportY:leg.target.y});if(!gap)throw Error('Driver foot support unavailable '+leg.side);leg.iterations.push({iteration,target:leg.target.toArray(),gap:gap.gap,reach:reach.error,clamped:reach.geometricallyClamped,shoeTriangle:gap.shoeTriangle,supportMesh:gap.supportMesh,supportTriangle:gap.supportTriangle});if(reach.error>.005)throw Error('Driver target is unreachable '+leg.side);const dy=parameters.authoredShoeMargin-gap.gap;if(Math.abs(dy)<1e-9)break;if(iteration===7)throw Error('Driver vertical contact solve not converged '+leg.side);if(Math.abs(leg.target.y+dy-leg.targetHint.y)>.010)throw Error('Driver reconstructed fit exceeds retained 10 mm vertical correction '+leg.side);leg.target.y+=dy;}leg.endPoints=leg.chain.map(b=>b.getWorldPosition(new T.Vector3()));leg.endLocalQ=leg.chain[2].quaternion.clone();leg.endToeQ=leg.toe.quaternion.clone();}
 const full={legs:legs.map(l=>({side:l.side,target:l.target.toArray(),iterations:l.iterations}))};
 seatedRestore(original);update(actor.root);
 for(const leg of legs){const target=leg.points[2].clone().lerp(leg.endPoints[2],legWeight),pole=leg.points[1].clone().lerp(leg.endPoints[1],legWeight),reach=fixedChain(actor,leg.chain,target,pole);leg.chain[2].quaternion.copy(leg.original[2].q).slerp(leg.endLocalQ,legWeight);leg.toe.quaternion.copy(leg.original[3].q).slerp(leg.endToeQ,legWeight);leg.blendedReach=reach;update(actor.root);}
 const normal=new T.Vector3(0,0,1).transformDirection(wheel.matrixWorld),arms=[];
 if(armWeight>0)for(const [i,side]of ['L','R'].entries()){const chain=['armup','armlo','hand'].map(n=>bone(n+side)),[a,b,c]=chain.map(b=>b.getWorldPosition(new T.Vector3())),q=chain[2].quaternion.clone();chain.fixedLengths={upper:a.distanceTo(b),lower:b.distanceTo(c)};const target=c.clone().addScaledVector(normal,parameters.wheelNormalOffsets[i]*armWeight),dir=target.clone().sub(a).normalize(),bend=b.clone().sub(a);bend.addScaledVector(dir,-bend.dot(dir)).normalize().applyAxisAngle(dir,parameters.wheelPoleSwivels[i]*armWeight);const reach=fixedChain(actor,chain,target,a.clone().add(bend));chain[2].quaternion.copy(q);update(actor.root);arms.push({side,reach,wristDelta:c.distanceTo(chain[2].getWorldPosition(new T.Vector3())),elbowDelta:b.distanceTo(chain[1].getWorldPosition(new T.Vector3()))});}
 return {weight,legWeight,armWeight,classification:'NEW_UNVALIDATED_FRAME_CONVENTION',full,arms,legs:legs.map(l=>({side:l.side,reach:l.blendedReach,ankleDelta:l.points[2].distanceTo(l.chain[2].getWorldPosition(new T.Vector3())),kneeDelta:l.points[1].distanceTo(l.chain[1].getWorldPosition(new T.Vector3())),support:fullShoeSupport(shoeFaces(actor.root,car,l.side),support,{maxSupportY:car.worldToLocal(l.chain[2].getWorldPosition(new T.Vector3())).y})}))};
 }catch(error){seatedRestore(original);update(actor.root);error.contactDiagnostics={weight,legs:legs.map(l=>({side:l.side,target:l.target.toArray(),iterations:l.iterations}))};throw error;}
}
 const standing={"rootMatrixWorld":[-1,0,-1.2246467991473532e-16,0,0,1,0,0,1.2246467991473532e-16,0,-1,0,-0.66,0,-13.0608050763607,1],"originalRoot":[-1.3,0,-0.35],"yaw":3.141592653589793,"legFrames":{"foot1L":{"matrixWorld":[-0.5334327783218701,2.53756050114368e-07,-3.3886397881494854e-08,0,-4.0107521775018326e-13,-0.07060827252857564,-0.5287390668739974,0,-2.5600863448498745e-07,-0.5287390668739363,0.07060827252856763,0,-0.7890000088581773,0.03391103654993365,-13.060805074137535,1],"quaternion":[0.9977978081013197,-1.5916592818887153e-08,2.394349381368092e-07,-0.06632898422367588]},"foot2L":{"matrixWorld":[-0.5334327783217364,4.48616333520337e-07,-8.363091715724852e-08,0,-4.2186873209522144e-13,-0.0977586969566806,-0.5243984479730289,0,-4.5634495743920787e-07,-0.524398447972837,0.09775869695664496,0,-0.7890000137353628,0.013969920167470354,-13.210131030742346,1],"quaternion":[0.02577195380286275,1.8771796315300336e-07,1.720809493044498e-08,0.9996678480361102]},"foot1R":{"matrixWorld":[-0.5334327783218701,2.53756050114368e-07,-3.3886397881494854e-08,0,-4.0107521775018326e-13,-0.07060827252857564,-0.5287390668739974,0,-2.5600863448498745e-07,-0.5287390668739363,0.07060827252856763,0,-0.5279999909912984,0.037828451399503464,-13.060805074003467,1],"quaternion":[0.9977978081013197,-1.5916592818887153e-08,2.394349381368092e-07,-0.06632898422367588]},"foot2R":{"matrixWorld":[-0.5333927174719088,-0.002451795859548369,0.006060250263033396,0,-0.005563303392219853,-0.0894625387612259,-0.5258478211791195,0,0.003433304191958984,-0.5258715651648428,0.08943025505683325,0,-0.5279999960405486,0.017887335463397155,-13.210131014629223,1],"quaternion":[0.017862512788843134,-0.0031247600783660357,-0.005271373059151532,0.9998216736685559]}}};
 const parameters={"targets":[[-0.3856796444966751,0.1957448431318488,-0.4789712764641031],[-0.205,0.16489823524397187,-0.4908497977737216]],"footYaws":[-0.20345170418927594,-0.2],"footPitches":[0.45,0.2],"kneeSwivels":[-0.06752014534108709,0.15047346629516434],"authoredShoeMargin":0.001,"wheelNormalOffsets":[0.061084187017525826,0.05949423234368614],"wheelPoleSwivels":[-0.19,0]};
const PI=Math.PI,UP=new T.Vector3(0,1,0),clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);},ease=(t,a,b)=>smooth((t-a)/(b-a));
const outwardTransfer=.07783899426862222,leftPoleCorrection=-.18823708552219146,releaseEnd=(.25+.36)*3/1.85;
const roots=[[0,[-.45,-.38,.09],PI],[1.65,[-.5993377637903524,-.2597891608463604,.03219654509509043],PI],[3,[-1.56,-.012,.31],PI]];
const rightHipStart=new T.Vector3(-.3347807967703575,.3083976786487995,.02880892610804686),rightKneeFixed=new T.Vector3(-.2341185605607099,.4766085178024391,-.22824722425816013),rightHipEnd=new T.Vector3(-.4841185605607099,.42860851780243914,-.028994528796862706);
const steps=[{side:0,start:.25,end:1.65,target:[-1.2260805344318628,.03,.27747963675360454],yaw:PI/2,pitch:0,roll:0,lift:.35,surface:'ground'}];
const retainedRightAnchor={side:1,time:3,sourceLandingTime:2.5,source:'clarance-near-hold-actual-v4-20261011T024623698309Z-144e4734',nominal:[-1.4279999909912984,.028654206943208332,.31000000235723313],ids:[280,200,153],weights:[0,0,1],target:[-1.4523368692127232,-.0071716234281438695,.34031245333056503],surface:'VT1_Original_driveway_gravel',surfaceTriangle:11,originalCanonicalGap:.0009999999828924737};
const sourceStandingCar=new T.Matrix4().fromArray(standing.rootMatrixWorld).multiply(new T.Matrix4().compose(new T.Vector3(...standing.originalRoot),new T.Quaternion().setFromAxisAngle(UP,PI),new T.Vector3(1,1,1)).invert()),leftHold=new T.Vector3().setFromMatrixPosition(new T.Matrix4().fromArray(standing.legFrames.foot1L.matrixWorld)).applyMatrix4(sourceStandingCar.clone().invert()).add(new T.Vector3(-1.56,-.012,.31).sub(new T.Vector3(...standing.originalRoot))).toArray();
steps.push({side:1,start:1.65,end:2.3,target:[-1.08,.035,.05],yaw:PI,pitch:0,roll:0,lift:.30,surface:'ground'},{side:0,start:2.3,end:2.65,target:leftHold,yaw:PI,pitch:0,roll:0,lift:.12,surface:'ground'},{side:1,start:2.65,end:3,target:[...retainedRightAnchor.nominal],yaw:PI,pitch:0,roll:0,lift:.12,surface:'ground'});
function authoredQuaternionOffset(current,sourceStart,fittedEntry,weight){
 if(!Number.isFinite(weight)||weight<0||weight>1)throw Error('Invalid authored quaternion weight');
 for(const q of[current,sourceStart,fittedEntry])if(!q?.toArray().every(Number.isFinite)||!Number.isFinite(q.lengthSq())||q.lengthSq()<=0)throw Error('Invalid authored quaternion');
 const inverse=sourceStart.clone().conjugate();for(const k of['x','y','z','w'])inverse[k]/=sourceStart.lengthSq();
 const delta=fittedEntry.clone().multiply(inverse),magnitude=delta.length();if(!Number.isFinite(magnitude)||magnitude<=0)throw Error('Invalid authored relative quaternion');
 const unit=delta.clone();for(const k of['x','y','z','w'])unit[k]/=magnitude;const offset=new T.Quaternion().slerp(unit,weight),scale=1+(magnitude-1)*weight;for(const k of['x','y','z','w'])offset[k]*=scale;
 const out=offset.multiply(current);if(!out.toArray().every(Number.isFinite))throw Error('Nonfinite authored quaternion result');return out;
}
function sampleClaranceRecovery(time){const t=Math.max(0,Math.min(22,time)),old=sampleCrashExit(t/3*1.85);let p=roots.at(-1)[1].slice(),yaw=PI;for(let i=1;i<roots.length;i++)if(t<roots[i][0]){const a=roots[i-1],b=roots[i],u=ease(t,a[0],b[0]);p=a[1].map((v,j)=>v+(b[1][j]-v)*u);yaw=a[2]+(b[2]-a[2])*u;break;}if(t<=1.65){const v=rightHipStart.clone().sub(rightKneeFixed),q=new T.Quaternion().setFromUnitVectors(v.clone().normalize(),rightHipEnd.clone().sub(rightKneeFixed).normalize()),rotation=new T.Quaternion().slerp(q,ease(t,(.25+.36)*3/1.85,1.65));const hip=rightKneeFixed.clone().add(v.applyQuaternion(rotation)),turn=Math.atan2(Math.sin(old.driverYaw-PI),Math.cos(old.driverYaw-PI))/3,offset=rightHipStart.clone().sub(new T.Vector3(-.45,-.38,.09));p=hip.sub(offset.applyAxisAngle(UP,turn)).toArray();yaw=PI+turn;p[0]-=outwardTransfer*ease(t,releaseEnd,1.65);}if(t>1.65){const endpoint=sampleClaranceRecovery(1.65),route=[[1.65,endpoint.driver],[2.3,[-1.12,-.17,.19]],[2.65,[-1.38,-.10,.27]],[3,roots.at(-1)[1]]];p=roots.at(-1)[1].slice();for(let i=1;i<route.length;i++)if(t<route[i][0]){const a=route[i-1],b=route[i],u=ease(t,a[0],b[0]);p=a[1].map((v,j)=>v+(b[1][j]-v)*u);break;}yaw=t>=3?PI:endpoint.driverYaw+Math.atan2(Math.sin(PI-endpoint.driverYaw),Math.cos(PI-endpoint.driverYaw))*ease(t,1.65,3);}
 const footTargets=[0,1].map(side=>{let from=parameters.targets[side];for(const step of steps.filter(step=>step.side===side)){if(t<=step.start)return [...from];if(t<step.end){const u=ease(t,step.start,step.end),v=from.map((x,i)=>x+(step.target[i]-x)*u);v[1]+=Math.sin(PI*clamp((t-step.start)/(step.end-step.start)))*step.lift;return v;}from=step.target;}return [...from];});
 return {...old,driver:p,driverYaw:yaw,time:t,transfer:ease(t,1.05,3),footTargets,steps:steps.map(s=>({...s,swing:t>s.start&&t<s.end}))};}
function sampleClaranceLeftWithdrawal(t,from,to){
 const u=ease(t,.25,1.65),releaseEnd=(.25+.36)*3/1.85;
 return{target:[from[0]+(to[0]-from[0])*ease(t,.65,1.65),from[1]+(to[1]-from[1])*u+.35*Math.sin(PI*clamp((t-.25)/1.4)),t<=releaseEnd?from[2]+(-.23-from[2])*ease(t,.25,releaseEnd):-.23+(to[2]+.23)*ease(t,releaseEnd,1.32)],yaw:parameters.footYaws[0]+(PI/2-parameters.footYaws[0])*ease(t,.5,1.2),pitch:parameters.footPitches[0]*(1-ease(t,releaseEnd,1.65))};
}

const save=root=>{const a=[];root.traverse(o=>{if(o!==root)a.push({o,p:o.position.clone(),q:o.quaternion.clone(),s:o.scale.clone()});});return a;},restore=a=>{for(const{o,p,q,s}of a){o.position.copy(p);o.quaternion.copy(q);o.scale.copy(s);}};
const active=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
function faces(mesh,car){if(!mesh?.isMesh||!active(mesh))return[];const g=mesh.geometry,position=g.attributes.position;if(!position)throw Error('Selected driver surface lacks vertices');const ix=g.index,total=ix?.count??position.count,start=Math.max(0,g.drawRange.start),end=Math.min(total,start+g.drawRange.count),groups=Array.isArray(mesh.material)?g.groups:[{start:0,count:total,materialIndex:0}],out=[];for(const group of groups){const material=Array.isArray(mesh.material)?mesh.material[group.materialIndex]:mesh.material;if(!material?.visible)continue;for(let n=Math.max(start,group.start);n+2<Math.min(end,group.start+group.count);n+=3){const ids=[0,1,2].map(k=>ix?ix.getX(n+k):n+k),points=ids.map(i=>car.worldToLocal(mesh.getVertexPosition(i,new T.Vector3()).applyMatrix4(mesh.matrixWorld)).toArray());if(!points.flat().every(Number.isFinite))throw Error('Nonfinite driver surface');out.push({mesh:mesh.name,index:n/3,ids,points});}}return out;}
function createClaranceSupportedRecovery({actor,car,wheel,floors,groundMeshes}){
 const root=actor.root,bone=n=>{const b=root.getObjectByName(n);if(!b)throw Error('Driver bone missing '+n);return b;},shoe=root.getObjectByName('black_fancy_shoes');if(!shoe?.isSkinnedMesh)throw Error('Driver shoe unavailable');
 const chains=['L','R'].map(s=>['legup','leglo','foot1'].map(n=>bone(n+s))),toes=['L','R'].map(s=>bone('foot2'+s)),footNeutral=chains.map((c,i)=>{const m=new T.Matrix4().fromArray(standing.rootMatrixWorld),local=new T.Matrix4().compose(new T.Vector3(...standing.originalRoot),new T.Quaternion().setFromAxisAngle(UP,PI),new T.Vector3(1,1,1)),inv=m.multiply(local.invert()).invert(),q=new T.Quaternion();inv.multiply(new T.Matrix4().fromArray(standing.legFrames['foot1'+(i?'R':'L')].matrixWorld)).decompose(new T.Vector3(),q,new T.Vector3());return q;});
 const surfaceCache=new Map();let report=null;
 function surfaces(kind='all'){update(root);const out=[];for(const m of kind==='floor'?floors:kind==='ground'?groundMeshes:[...floors,...groundMeshes]){m.updateWorldMatrix(true,false);const relative=car.matrixWorld.clone().invert().multiply(m.matrixWorld),key=relative.elements.join(','),old=surfaceCache.get(m);if(old&&old.key===key&&old.geometry===m.geometry&&old.version===m.geometry.attributes.position.version)out.push(...old.faces);else{const f=faces(m,car);surfaceCache.set(m,{key,geometry:m.geometry,version:m.geometry.attributes.position.version,faces:f});out.push(...f);}}return out;}
 function shoes(side){return faces(shoe,car).filter(f=>{const own=[0,0],ix=shoe.geometry.attributes.skinIndex,w=shoe.geometry.attributes.skinWeight;for(const i of f.ids)for(let k=0;k<4;k++){const n=shoe.skeleton.bones[ix.getComponent(i,k)].name.replaceAll('.','');for(let j=0;j<2;j++)if(n.endsWith(j?'R':'L'))own[j]+=w.getComponent(i,k);}return own[side]>=own[1-side];});}
 function setRoot(t,originalRoot=false){const s=sampleClaranceRecovery(t),p=s.driver.slice();if(originalRoot&&t<=1.65)p[0]+=outwardTransfer*ease(t,releaseEnd,1.65);root.position.fromArray(p);root.rotation.set(0,s.driverYaw,0);update(root);return s;}
 function build(reduced){const prior=save(root),p=root.position.clone(),q=root.quaternion.clone(),state=actor.capturePoseState();root.position.set(-.45,-.38,.09);root.rotation.set(0,PI,0);actor.pose({mode:'drive',time:6,reduced,wheelMatrix:wheel.matrixWorld,steer:0});fitClaranceSeatedContact({actor,car,wheel,floors,standing,parameters,legWeight:1,armWeight:1});update(root);const entry=save(root),initial=chains.map((c,i)=>({time:0,target:car.worldToLocal(c[2].getWorldPosition(new T.Vector3())).toArray(),yaw:parameters.footYaws[i],pitch:parameters.footPitches[i],roll:0,surface:'floor',side:i})),lengths=chains.map(c=>{const[a,b,d]=c.map(o=>o.getWorldPosition(new T.Vector3()));return{upper:a.distanceTo(b),lower:b.distanceTo(d)};}),plantedFrames=null,armChains=['L','R'].map(s=>['armup','armlo','hand'].map(n=>bone(n+s))),armLengths=armChains.map(c=>{const[a,b,d]=c.map(o=>o.getWorldPosition(new T.Vector3()));return{upper:a.distanceTo(b),lower:b.distanceTo(d)};}),armObjects=new Set();for(const c of armChains){for(const o of c)armObjects.add(o);c[2].traverse(o=>{if(o.isBone)armObjects.add(o);});}const armEntry=entry.filter(x=>armObjects.has(x.o));actor.pose({mode:'exit',time:0,exitPose:sampleCrashExit(0),reduced:true,wheelMatrix:wheel.matrixWorld,steer:0});update(root);const armSourceStart=save(root).filter(x=>armObjects.has(x.o));setRoot(3);actor.pose({mode:'standing',time:0,reduced:true,chapter:'asylum-custody'});const end=save(root);restore(prior);root.position.copy(p);root.quaternion.copy(q);actor.restorePoseState(state);update(root);const data={entry,end,initial,lengths,plantedFrames,armChains,armLengths,armObjects,armEntry,armSourceStart,anchors:new Map()};return data;}
 function sampleExistingArms(t,data){const original=save(root),history=actor.capturePoseState(),old=sampleCrashExit(t/3*1.85);actor.pose({mode:'exit',time:old.time,exitPose:old,reduced:true,wheelMatrix:wheel.matrixWorld,steer:0});update(root);const sampled=save(root).filter(x=>data.armObjects.has(x.o));restore(original);actor.restorePoseState(history);update(root);const hold=1-smooth(old.time/.36);for(let i=0;i<sampled.length;i++){const x=sampled[i],a=data.armEntry[i],b=data.armSourceStart[i];if(x.o!==a.o||x.o!==b.o)throw Error('Driver arm topology changed');x.o.position.copy(x.p).add(a.p.clone().sub(b.p).multiplyScalar(hold));x.o.quaternion.copy(authoredQuaternionOffset(x.q,b.q,a.q,hold));x.o.scale.copy(a.s);}update(root);const reaches=[];for(const [i,c]of data.armChains.entries()){const wrist=c[2].getWorldPosition(new T.Vector3()),elbow=c[1].getWorldPosition(new T.Vector3()),handQ=c[2].quaternion.clone();c.fixedLengths=data.armLengths[i];if(i===1){const lift=.021079037964511944*ease(t,.4054054054054054,.9891891891891892)*(1-ease(t,.9891891891891892,1.4108108108108107));wrist.add(new T.Vector3(0,1,0).transformDirection(car.matrixWorld).multiplyScalar(lift));}const reach=fixedChain(actor,c,wrist,elbow);c[2].quaternion.copy(handQ);update(root);reaches.push(reach);}return{sourceTime:old.time,releaseWeight:1-hold,sourceInterface:'existing actor.pose(mode exit, retained sampleCrashExit)',reaches};}
 function body(t,data,originalRoot=false){setRoot(t,originalRoot);data.poseTime=t;const u=ease(t,1.65,3);for(let i=0;i<data.entry.length;i++){const a=data.entry[i],b=data.end[i];if(a.o!==b.o)throw Error('Driver pose topology changed');a.o.position.lerpVectors(a.p,b.p,u);a.o.quaternion.copy(a.q).slerp(b.q,u);a.o.scale.copy(a.s);}update(root);data.armReport=sampleExistingArms(t,data);const bend=.10090181145*ease(t,releaseEnd,1.65)*(1-ease(t,1.65,3));if(bend){const torso=bone('torso'),wrists=data.armChains.map(c=>({point:c[2].getWorldPosition(new T.Vector3()),q:c[2].quaternion.clone()})),axis=new T.Vector3(0,0,-1).transformDirection(car.matrixWorld).transformDirection(torso.parent.matrixWorld.clone().invert());torso.quaternion.premultiply(new T.Quaternion().setFromAxisAngle(axis,bend));update(root);for(let i=0;i<2;i++){const c=data.armChains[i];c.fixedLengths=data.armLengths[i];fixedChain(actor,c,wrists[i].point,c[1].getWorldPosition(new T.Vector3()));c[2].quaternion.copy(wrists[i].q);update(root);}}}
 function preservePlantedFrames(data){const measurements=[];for(const f of data.plantedFrames){f.o.parent.updateWorldMatrix(true,false);const wanted=car.matrixWorld.clone().multiply(f.carMatrix),parent=f.o.parent.matrixWorld;if(!parent.elements.every(Number.isFinite)||parent.determinant()===0)throw Error('Invalid planted frame parent');const local=parent.clone().invert().multiply(wanted),p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3();local.decompose(p,q,s);if(![...p.toArray(),...q.toArray(),...s.toArray()].every(Number.isFinite))throw Error('Nonfinite planted frame');f.o.position.copy(p);f.o.quaternion.copy(q);f.o.scale.copy(f.scale);update(root);measurements.push({bone:f.o.name,maxMatrixResidual:Math.max(...wanted.elements.map((v,i)=>Math.abs(v-f.o.matrixWorld.elements[i]))),derivedScale:s.toArray(),retainedScale:f.scale.toArray()});}return measurements;}
 function footFrames(side){return[chains[side][2],toes[side]].map(o=>({o,carMatrix:car.matrixWorld.clone().invert().multiply(o.matrixWorld),scale:o.scale.clone()}));}
 function plantKeys(side,data){return[data.initial[side],...steps.filter(s=>s.side===side).map(s=>({...s,time:s.end}))];}
 function schedule(t,side,data){const ks=plantKeys(side,data);for(let i=1;i<ks.length;i++){const to=ks[i],from=ks[i-1];if(t<=to.start)return{from,to:from,u:0,plant:from};if(t<to.time)return{from,to,u:ease(t,to.start,to.time),swing:true,lift:Math.sin(Math.PI*(t-to.start)/(to.time-to.start))*to.lift};}const plant=ks.at(-1);return{from:plant,to:plant,u:0,plant};}
 function legPose(side,target,key,data,base){restore(base);update(root);const chain=chains[side];chain.fixedLengths=data.lengths[side];const a=car.worldToLocal(chain[0].getWorldPosition(new T.Vector3())),dir=target.clone().sub(a).normalize(),bend=UP.clone().addScaledVector(dir,-UP.dot(dir));if(bend.lengthSq()<1e-16)throw Error('Driver knee pole degenerate');bend.normalize().applyAxisAngle(dir,parameters.kneeSwivels[side]*(1-ease(key.time,0,3))+(side===0?leftPoleCorrection*ease(data.poseTime,releaseEnd,1.65)*(1-ease(data.poseTime,1.65,3)):0));const reach=fixedChain(actor,chain,car.localToWorld(target.clone()),car.localToWorld(side===1&&key.time===0?rightKneeFixed.clone():side===1&&data.transition&&data.poseTime<2.3?new T.Vector3(...data.transition.knee).lerp(a.clone().add(bend),ease(data.poseTime,1.65,2.3)):a.clone().add(bend)));const q=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),key.roll||0).multiply(new T.Quaternion().setFromAxisAngle(UP,key.yaw)).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),key.pitch)).multiply(footNeutral[side]),world=car.getWorldQuaternion(new T.Quaternion()).multiply(q);chain[2].quaternion.copy(chain[2].parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(world));if(side===1&&data.transition&&data.poseTime<2.3){const first=new T.Quaternion().fromArray(data.transition.footQuaternion);chain[2].quaternion.copy(authoredQuaternionOffset(first,first,chain[2].quaternion,ease(data.poseTime,1.65,2.3)));}toes[side].quaternion.fromArray(standing.legFrames['foot2'+(side?'R':'L')].quaternion);if(side===1&&data.naturalRightActive){chain[2].quaternion.copy(data.naturalRightBase.find(x=>x.o===chain[2]).q);toes[side].quaternion.copy(data.naturalRightBase.find(x=>x.o===toes[side]).q);}update(root);if(side===1&&key.time===0&&data.plantedFrames&&!data.naturalRightActive)data.framePreservation=preservePlantedFrames(data);return reach;}
 function legState(side){return[...chains[side],toes[side]].map(o=>({o,p:o.position.clone(),q:o.quaternion.clone(),s:o.scale.clone()}));}
 function anchor(side,key,data){const id=side+'/'+key.time;if(data.anchors.has(id))return data.anchors.get(id);body(key.time,data);const base=legState(side),target=new T.Vector3(...key.target),iterations=[];let gap,reach;const fail=message=>{const e=new Error(message);e.routeDiagnostics={side,key,target:target.toArray(),iterations,joints:chains[side].map(b=>car.worldToLocal(b.getWorldPosition(new T.Vector3())).toArray())};throw e;};
  if(side===1&&key.time===3){const fixed=structuredClone(retainedRightAnchor),goal=new T.Vector3(...fixed.target);for(let n=0;n<24;n++){reach=legPose(side,target,key,data,base);const delta=goal.clone().sub(material(fixed));iterations.push({iteration:n,materialError:delta.length(),reach:reach.error,target:target.toArray()});if(delta.length()<1e-11)break;if(n===23)fail('Retained right material target did not converge');target.add(delta);}gap=fullShoeSupport(shoes(side),surfaces('ground'),{maxSupportY:target.y});const a={...fixed,nominal:target.toArray(),canonicalGap:gap?.gap,canonicalReach:reach,canonicalIterations:iterations,fixedMaterialTarget:true,footFrames:footFrames(side)};data.anchors.set(id,a);return a;}
  for(let n=0;n<10;n++){reach=legPose(side,target,key,data,base);gap=fullShoeSupport(shoes(side),surfaces(key.surface),{maxSupportY:target.y});iterations.push({iteration:n,target:target.toArray(),reach:reach.error,gap:gap?.gap,surface:gap?.supportMesh,triangle:gap?.supportTriangle});if(!gap)fail('Driver landing lacks authored actual support '+id);if(reach.error>.005)fail('Driver landing exceeds actual reach '+id);const dy=.0010001-gap.gap;if(Math.abs(dy)<1e-9)break;if(n===9)fail('Driver landing height did not converge '+id);target.y+=dy;}
  const face=shoes(side).find(f=>f.index===gap.shoeTriangle);if(!face)fail('Driver anchor face missing');const point=new T.Vector3(...gap.point),weights=new T.Triangle(...face.points.map(p=>new T.Vector3(...p))).getBarycoord(point,new T.Vector3()).toArray();if(!weights.every(Number.isFinite))fail('Driver anchor weights invalid');if(side===1&&key.time===0){if(data.plantedFrames)fail('Initial plant frame already established');data.plantedFrames=[chains[1][1],chains[1][2],toes[1]].map(o=>({o,carMatrix:car.matrixWorld.clone().invert().multiply(o.matrixWorld),scale:o.scale.clone()}));}const a={side,time:key.time,nominal:target.toArray(),ids:face.ids,weights,target:point.toArray(),surface:gap.supportMesh,surfaceTriangle:gap.supportTriangle,canonicalGap:gap.gap,canonicalReach:reach,canonicalIterations:iterations,footFrames:footFrames(side)};data.anchors.set(id,a);return a;}
 function material(a){const p=new T.Vector3();for(let i=0;i<3;i++)p.addScaledVector(car.worldToLocal(shoe.getVertexPosition(a.ids[i],new T.Vector3()).applyMatrix4(shoe.matrixWorld)),a.weights[i]);return p;}
 function prepareNaturalRight(t,data){
  data.naturalRightActive=false;body(t,data,true);const a=data.anchors.get('1/0');if(!a)throw Error('Natural right support lacks canonical entry anchor');const key=data.initial[1],base=legState(1),target=new T.Vector3(...a.nominal),goal=new T.Vector3(...a.target);let error=Infinity;
  // Independently reconstruct the unchanged supported frame at this exact authored time.
  // This is never seeded from a preceding render or from the proposed shifted pose.
  for(let n=0;n<24;n++){legPose(1,target,key,data,base);const delta=goal.clone().sub(material(a));error=delta.length();if(error<1e-11)break;target.add(delta);}
  data.naturalRightBase=legState(1);data.naturalRightReference={time:t,target:target.toArray(),materialError:error};
 }
 function pose(time,reduced,suppliedData=null){if(!suppliedData)surfaceCache.clear();const t=Math.max(0,Math.min(3,time)),data=suppliedData||build(reduced);if(t>1.65){pose(1.65,reduced,data);data.transition={knee:car.worldToLocal(chains[1][1].getWorldPosition(new T.Vector3())).toArray(),footQuaternion:chains[1][2].quaternion.toArray()};}else data.transition=null;const plans=[0,1].map(i=>schedule(t,i,data));data.naturalRightActive=false;anchor(1,data.initial[1],data);const anchors=plans.map((s,i)=>({from:anchor(i,s.from,data),to:anchor(i,s.to,data)}));if(t>releaseEnd&&t<=1.65)prepareNaturalRight(t,data);body(t,data);data.naturalRightActive=t>releaseEnd&&t<=1.65;const sides=[];for(let side=0;side<2;side++){const s=plans[side],a=anchors[side],key={time:s.from.time+(s.to.time-s.from.time)*s.u,yaw:s.from.yaw+(s.to.yaw-s.from.yaw)*s.u,pitch:s.from.pitch+(s.to.pitch-s.from.pitch)*s.u,roll:(s.from.roll||0)+((s.to.roll||0)-(s.from.roll||0))*s.u},target=new T.Vector3(...a.from.nominal).lerp(new T.Vector3(...a.to.nominal),s.u);target.y+=s.lift||0;if(side===0&&s.swing&&s.to.time===1.65){const withdrawal=sampleClaranceLeftWithdrawal(t,a.from.nominal,a.to.nominal);target.fromArray(withdrawal.target);key.yaw=withdrawal.yaw;key.pitch=withdrawal.pitch;}const base=side===1&&data.naturalRightActive?data.naturalRightBase:legState(side);let reach,error=0,iterations=0;if(s.plant&&a.from.time>0){const ankle=new T.Vector3().setFromMatrixPosition(a.from.footFrames[0].carMatrix),goal=new T.Vector3(...a.from.target);target.copy(ankle);const evaluate=point=>{const result=legPose(side,point,key,data,base),shift=point.clone().sub(ankle),frames=a.from.footFrames.map(f=>({...f,carMatrix:new T.Matrix4().makeTranslation(shift.x,shift.y,shift.z).multiply(f.carMatrix)})),residuals=preservePlantedFrames({plantedFrames:frames});if(residuals.some(r=>r.maxMatrixResidual>1e-6))throw Error('Driver planted foot frame could not be reconstructed');return{reach:result,point:material(a.from)};};for(let n=0;n<24;n++){const current=evaluate(target),delta=goal.clone().sub(current.point);reach=current.reach;error=delta.length();iterations=n+1;if(error<1e-11)break;const h=1e-5,columns=['x','y','z'].map(axis=>{const p=target.clone();p[axis]+=h;return evaluate(p).point.sub(current.point).multiplyScalar(1/h);}),j=new T.Matrix3().set(columns[0].x,columns[1].x,columns[2].x,columns[0].y,columns[1].y,columns[2].y,columns[0].z,columns[1].z,columns[2].z);if(!Number.isFinite(j.determinant())||Math.abs(j.determinant())<1e-10)throw Error('Driver material correction Jacobian degenerate');const step=delta.applyMatrix3(j.invert());let accepted=false;for(const factor of[1,.5,.25,.125,.0625]){const trial=target.clone().addScaledVector(step,factor),value=evaluate(trial);if(value.reach.error<=.005&&value.point.distanceTo(goal)<error){target.copy(trial);accepted=true;break;}}if(!accepted)break;}const final=evaluate(target);reach=final.reach;error=final.point.distanceTo(goal);}else if(s.plant){const goal=new T.Vector3(...a.from.target);for(let n=0;n<24;n++){reach=legPose(side,target,key,data,base);const delta=goal.clone().sub(material(a.from));error=delta.length();iterations=n+1;if(error<1e-11)break;target.add(delta);if(!target.toArray().every(Number.isFinite))throw Error('Driver material solve nonfinite');}}else reach=legPose(side,target,key,data,base);sides.push({side:side?'R':'L',planted:!!s.plant,swing:!!s.swing,target:target.toArray(),reach,anchor:s.plant?Object.fromEntries(Object.entries(a.from).filter(([k])=>k!=='footFrames')):null,materialError:error,iterations,support:fullShoeSupport(shoes(side),surfaces(),{maxSupportY:target.y})});}update(root);for(const [i,s]of sides.entries()){s.support=fullShoeSupport(shoes(i),surfaces(),{maxSupportY:s.target[1]});if(s.anchor)s.materialError=material(s.anchor).distanceTo(new T.Vector3(...s.anchor.target));if(s.planted){s.visualFootStatus=s.materialError>.005||!s.support||s.support.gap<.001-1e-8?'OWNER_WAIVED_VISUAL_FAILURE':'FOCUSED_CONTACT_WITHIN_BOUNDS_NOT_FULL_ACCEPTANCE';if(!Number.isFinite(s.materialError)||(s.support&&!Number.isFinite(s.support.gap))||!Number.isFinite(s.reach?.error)||s.reach.error>.005){const error=new Error('Driver planted pose has invalid numeric state or exceeds fixed-length reach');error.routeDiagnostics={time:t,side:s.side,materialError:s.materialError,reach:s.reach,support:s.support,target:s.target,iterations:s.iterations};throw error;}}}report={time,reduced,root:root.position.toArray(),yaw:root.rotation.y,sides,arms:data.armReport,framePreservation:data.framePreservation,naturalRightTransfer:{active:data.naturalRightActive,rootDelta:[-outwardTransfer*ease(t,releaseEnd,1.65),0,0],leftPoleCorrection:leftPoleCorrection*ease(t,releaseEnd,1.65),reference:data.naturalRightReference,originalMaterialTarget:data.anchors.get('1/0').target},transferTiming:{previousStart:.65,start:(.25+.36)*3/1.85,end:1.65,speedRatio:(1.65-.65)/(1.65-(.25+.36)*3/1.85)},turnWithdrawal:{turnFraction:1/3,maxTurnRadians:PI/6,leftSwingStart:.25,leftSwingEnd:1.65,oldLeftSwingStart:.65,firstLandingYaw:PI/2,canonicalLandingY:'full actual shoe fit before first contact',previousRejectedPlanningKneePeakDegrees:137.7054804,planningMaxRootDelta:.06753106667,constructionSupportTarget:.0010001,requiredSupportMinimum:.001},classification:'C2_GENERATED_ROUTE_UNVALIDATED'};return report;}
 // Owner-approved rough-cinematic MVP: keep the authored state/IK path, and
 // retain the detailed contact solver above as deferred, unaccepted work.
 function assertMvpPose(){update(root);root.traverse(o=>{const q=o.quaternion;if(![...o.position.toArray(),...q.toArray(),...o.scale.toArray(),...o.matrixWorld.elements].every(Number.isFinite)||q.lengthSq()===0||o.matrixWorld.determinant()===0)throw Error('Invalid MVP driver transform '+o.name);});const expected=[[.3236596703340808,.4086004027939235],[.32327331570761203,.4086212157819593]];for(const [i,c]of chains.entries()){const p=c.map(b=>b.getWorldPosition(new T.Vector3()));for(let j=0;j<2;j++)if(Math.abs(p[j].distanceTo(p[j+1])-expected[i][j])>.005)throw Error('MVP driver limb length changed');}}
 function poseMvp(time,reduced){if(!Number.isFinite(time))throw Error('Invalid MVP driver time');const t=Math.max(0,Math.min(22,time)),s=sampleClaranceRecovery(t),old=sampleCrashExit(t/3*1.85);root.position.fromArray(s.driver);root.rotation.set(0,s.driverYaw,0);actor.pose(t<3?{mode:'exit',time:old.time,exitPose:{...old,transfer:s.transfer,footTargets:s.footTargets},reduced:true,wheelMatrix:wheel.matrixWorld,steer:0}:{mode:'standing',time:0,reduced:true,chapter:'asylum-custody'});assertMvpPose();report={time:t,reduced,root:root.position.toArray(),yaw:root.rotation.y,sides:[],classification:'OWNER_APPROVED_ROUGH_MVP',visualPrecision:'OWNER_DEFERRED_NOT_PASSED',solver:'existing authored actor pose and IK; no per-frame sole/material refinement'};return report;}
 return{pose:poseMvp,report:()=>report,fitSeated(){assertMvpPose();return{classification:'OWNER_APPROVED_ROUGH_MVP',visualPrecision:'OWNER_DEFERRED_NOT_PASSED',solver:'existing drive pose retained; sole fitting deferred'};}};
}
 return {createClaranceContactFit:createClaranceSupportedRecovery,sampleClaranceRecovery};
})();

/** Absolute-time choreography. All positions are in the stopped car's frame. */
export const POST_CRASH=Object.freeze({duration:22,driverOut:3,mikeExitStart:16,mikeOut:20});
const mix=(a,b,u)=>a.map((v,i)=>v+(b[i]-v)*u);
const ease=(t,a,b)=>smooth((t-a)/(b-a));
const angle=(a,b,u)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*u;
const UP=new THREE.Vector3(0,1,0),Z=new THREE.Vector3(0,0,1);
// The inherited index is curled: this exposed distal surface is its support
// direction, avoiding the nearer knuckle crossing a contacted surface.
const TIP_AXIS=new THREE.Vector3(-.7,.1,-1).normalize();
const SEATED=[.5,-.24,.58],OUTSIDE=[1.62,0,.92];
const EXIT_FEET=[[1.65,.045,1.02],[1.534,.045,.821]];
const OUT_YAW=-.86;
function keyed(t,keys){for(let i=1;i<keys.length;i++)if(t<keys[i][0])return mix(keys[i-1][1],keys[i][1],ease(t,keys[i-1][0],keys[i][0]));return [...keys.at(-1)[1]];}
function footFlight(t,from,to,start,end,lift=.19){const u=clamp((t-start)/(end-start)),p=mix(from,to,smooth(u));p[1]+=Math.sin(Math.PI*u)*lift;return p;}
// Reconstructed from retained numeric authoring. This is a new candidate identity.
const INSIDE_LEFT=[.54,.02,.24],INSIDE_RIGHT=[.63,.02,.08],RIGHT_PLANT=[1.42,.045,.72];
const CABIN_SUPPORT_XZ=[[.37,.24],[.63,.24],[.54,.24],[.63,.08]];
function rightOutsideLift(t){return t<=17.65?keyed(t,[[17.25,[0]],[17.4,[.164]],[17.65,[.39*Math.sin(Math.PI*(17.65-17.25)/(18-17.25))]]])[0]:.39*Math.sin(Math.PI*clamp((t-17.25)/(18-17.25)));}
function exitFeet(t){
 const left=t<18.05?footFlight(t,[.37,.02,.24],INSIDE_LEFT,16.65,17.1,.06):footFlight(t,INSIDE_LEFT,EXIT_FEET[0],18.05,19.05,.30);
 if(t>16.65&&t<17.1)left[0]-=.117*Math.sin(Math.PI*(t-16.65)/(17.1-16.65));
 if(t>=18.05&&t<=19.05){const outward=keyed(t,[[18.05,INSIDE_LEFT],[18.25,INSIDE_LEFT],[18.40,[1.15,.02,.24]],[19.05,EXIT_FEET[0]]]);left[0]=outward[0];left[2]=outward[2];if(t>18.4)left[0]+=.136*Math.sin(Math.PI*clamp((t-18.4)/(19.05-18.4)));}
 const right=t<17.25?footFlight(t,[.63,.02,.24],INSIDE_RIGHT,16.35,16.6,.035):t<19.1?footFlight(t,INSIDE_RIGHT,RIGHT_PLANT,17.25,18.0,.39):footFlight(t,RIGHT_PLANT,EXIT_FEET[1],19.1,19.75,.12);
 if(t>=17.25&&t<=18.0){const outward=keyed(t,[[17.25,INSIDE_RIGHT],[17.40,[.65,.02,.25]],[17.60,[1.20,.02,.28]],[17.65,[1.20,.02,.28]],[17.80,[1.42,.045,.52]],[18.0,RIGHT_PLANT]]);right[0]=outward[0];right[2]=outward[2];right[1]+=rightOutsideLift(t)-.39*Math.sin(Math.PI*clamp((t-17.25)/(18-17.25)));}
 return [left,right];
}
function exitFootYaws(t){return [angle(angle(Math.PI,Math.PI/2,ease(t,16.65,16.875)),OUT_YAW,ease(t,18.4,19.05)),angle(angle(Math.PI,Math.PI/2,ease(t,18.05,18.4)),OUT_YAW,ease(t,18.4,19.05))];}
function exitFootPitches(t){return [(THREE.MathUtils.degToRad(12)*ease(t,16.65,16.875)-THREE.MathUtils.degToRad(8.573893640969853)*ease(t,17.1,17.35))*(1-ease(t,18.05,19.05))-THREE.MathUtils.degToRad(6.35)*ease(t,18.4,19.05)*(1-ease(t,19.05,19.75)),(THREE.MathUtils.degToRad(10)*ease(t,16.35,16.6)*(1-ease(t,17.25,18.0))-THREE.MathUtils.degToRad(9.953670501708327)*ease(t,17.25,18.0)-THREE.MathUtils.degToRad(7.546329498291673)*ease(t,18.05,18.75))*(1-ease(t,19.1,19.75))];}
function pickingAt(t){
 const fragments=[1,6,11].map((start,index)=>{const approach=ease(t,start,start+.65),extract=ease(t,start+1,start+1.7),release=ease(t,start+2.35,start+2.7);return {index,start,approach,extract,release,contact:t>=start+.65&&t<=start+1,held:t>=start+1&&t<start+2.35,removed:t>=start+1.7,dropAge:Math.max(0,t-start-2.35)};});
 const index=Math.min(2,Math.max(0,Math.floor((t-1)/5)));
 return {active:t<16,weight:ease(t,0,.65)*(1-ease(t,15.3,16)),index,fragments};
}
export function sampleRecovery(time=0){
 const t=clamp(time,0,POST_CRASH.duration),driverExit=sampleClaranceRecovery(t),turn=ease(t,17.35,18.0),transfer=ease(t,17.65,19.45);
 const mike=keyed(t,[[0,SEATED],[16.35,SEATED],[16.55,[.50,-.18,.50]],[17.35,[.50,-.18,.50]],[17.50,[.54,-.18,.50]],[17.65,[.65,-.18,.52]],[17.80,[.80,-.18,.55]],[18.0,[.94,-.18,.60]],[18.40,[1.18,-.16,.70]],[18.75,[1.35,-.15,.7414856733369504]],[19.05,[1.45,-.18,.88]],[19.75,OUTSIDE],[22,OUTSIDE]]);
 mike[2]-=.02*ease(t,17.737,17.8)*(1-ease(t,17.8,18.0));
 mike[2]+=.0053*ease(t,17.68,17.73)*(1-ease(t,17.745,17.8));
 mike[1]=keyed(t,[[0,[-.24]],[16.35,[-.24]],[16.55,[-.18]],[17.35,[-.18]],[17.85,[-.18]],[18.75,[-.15]],[19.05,[-.18]],[19.75,[0]],[22,[0]]])[0];
 mike[1]-=.018*Math.sin(Math.PI*ease(t,19.1,20));
 const mikeYaw=angle(angle(Math.PI,Math.PI/2,ease(t,18.05,18.40)),OUT_YAW,ease(t,18.40,19.05));
 const forward=new THREE.Vector3(Math.sin(mikeYaw),0,Math.cos(mikeYaw)).multiplyScalar(.23*(1-transfer));
 const eye=[mike[0]+forward.x,mike[1]+1.37+.21*transfer,mike[2]+forward.z];if(t<=16.35)eye[1]=1.13;
 let cameraYaw=angle(angle(0,-Math.PI/2,turn),OUT_YAW+Math.PI,ease(t,18.40,19.05));
 const glance=Math.max(ease(t,2.65,3.25)*(1-ease(t,4.8,5.4)),ease(t,11.9,12.5)*(1-ease(t,14.5,15.1)));
 const down=.64*ease(t,0,.75)*(1-ease(t,14.8,16)),cameraPitch=-down+(down+.18)*glance-.24*Math.sin(Math.PI*transfer);
 if(t<16)cameraYaw=angle(0,Math.atan2(eye[0]-driverExit.driver[0],eye[2]-driverExit.driver[2]),glance);
 const feet=exitFeet(t),picking=pickingAt(t),passengerDoor=ease(t,16.05,16.85);
 return {time:t,chapter:'recovery',driver:driverExit.driver,driverYaw:driverExit.driverYaw,driverExit,driverPose:driverExit,driverDoor:driverExit.door,driverFinished:t>=3,
  passengerDoor,mike,mikeYaw,bodyFitCrouch:(.035/.24)*ease(t,17.40,17.65),mikeFootYaws:exitFootYaws(t),mikeFootPitches:exitFootPitches(t),mikeFootTargets:feet,footTargets:feet,transfer,eye,cameraYaw,cameraPitch,finished:t>=20,mikeFinished:t>=20,
  mikePose:{time:t,transfer,footTargets:feet,finished:t>=20},picking,doorHand:ease(t,15.7,16)*(1-ease(t,16.15,16.35)),walking:false};
}


// Generated W1 candidate; physical validation remains pending.
const W1={start:.55,end:7.75,pairs:8,steps:16,step:.45,lift:.065,fit:.125,hold:[3.25,0,3.65]};
const W1_START=sampleRecovery(22),W1_FEET=W1_START.mikeFootTargets;
const W1_DELTA=W1.hold.map((v,i)=>i===1?0:v-W1_START.mike[i]);
function w1Boundary(index){return (2640+66+index*54)/120;}
function w1SupportedPitches(time,pitches){
 const result=[...pitches],absolute=22+time;
 for(let pair=0;pair<W1.pairs;pair++){const start=w1Boundary(2*pair),takeoff=w1Boundary(2*pair+1),landing=w1Boundary(2*pair+2);
  if(absolute>start&&absolute<landing){const weight=absolute<=takeoff?ease(absolute,start,takeoff):1-ease(absolute,takeoff,landing);result[1]-=THREE.MathUtils.degToRad(1)*weight;break;}
 }return result;
}
function w1Swings(side){return Array.from({length:W1.pairs},(_,i)=>[w1Boundary(i*2+side),w1Boundary(i*2+side+1)]);}
function w1Foot(time,side){const absolute=22+time;let p=[...W1_FEET[side]];for(let i=0;i<W1.pairs;i++){const a=w1Boundary(i*2+side),b=w1Boundary(i*2+side+1),target=W1_FEET[side].map((v,k)=>v+W1_DELTA[k]*(i+1)/W1.pairs);if(absolute<=a)return p;if(absolute<b)return footFlight(absolute,p,target,a,b,W1.lift);p=target;}return p;}
function w1BodyProgress(time){const absolute=22+time;for(let i=0;i<W1.steps;i++){const a=w1Boundary(i),b=w1Boundary(i+1);if(absolute<=a)return i/W1.steps;if(absolute<b)return (i+ease(absolute,a,b))/W1.steps;}return 1;}
function absoluteSample(time){return time<=22?sampleRecovery(time):sampleMikeCustody(time-22);}
function absoluteTime(sample){return sample.chapter==='custody'?22+sample.time:sample.time;}
function w1PlantStart(time,side){let previous=side===0?19.05:19.75;for(const [a,b]of w1Swings(side)){if(time<=a)return previous;if(time<b)return null;previous=b;}return previous;}

// Mike watches from the passenger side. The body and eye retain the exact exit
// endpoint; head turns never become an exterior observer or cross the cruiser.
export function sampleMikeCustody(time=0){
 const t=clamp(time,0,33),sample=sampleRecovery(22),progress=w1BodyProgress(t),mike=sample.mike.map((v,k)=>v+W1_DELTA[k]*progress),feet=[w1Foot(t,0),w1Foot(t,1)],eye=[mike[0],1.58,mike[2]],subject=sampleCustody(t).stanley,dx=subject[0]-eye[0],dz=subject[2]-eye[2],bearing=Math.atan2(-dx,-dz),pitch=Math.atan2(subject[1]+1.25-eye[1],Math.hypot(dx,dz)),look=ease(t,0,.65);
 return {...sample,time:t,chapter:'custody',mike,mikeYaw:sample.mikeYaw,eye,bodyFitCrouch:sample.bodyFitCrouch+W1.fit*ease(t,.10,W1.start),mikeFootTargets:feet,footTargets:feet,mikeFootYaws:[...sample.mikeFootYaws],mikeFootPitches:w1SupportedPitches(t,sample.mikeFootPitches),mikePose:{...sample.mikePose,time:t,footTargets:feet},
  cameraYaw:angle(sample.cameraYaw,bearing,look),cameraPitch:sample.cameraPitch+(pitch-sample.cameraPitch)*look,picking:{...pickingAt(22),active:false,weight:0},doorHand:0,finished:true,mikeFinished:true,walking:t>W1.start&&t<W1.end};
}

function updateMatrices(root){root.updateWorldMatrix(true,false);root.updateMatrixWorld(true);root.traverse(o=>o.skeleton?.update());}
function vertex(mesh,index){return mesh.getVertexPosition(index,new THREE.Vector3()).applyMatrix4(mesh.matrixWorld);}
function surface(anchor){
 const [a,b,c]=anchor.ids.map(i=>vertex(anchor.mesh,i)),point=a.clone().multiplyScalar(anchor.weights[0]).addScaledVector(b,anchor.weights[1]).addScaledVector(c,anchor.weights[2]);
 return {point,normal:b.clone().sub(a).cross(c.clone().sub(a)).normalize()};
}
function chooseForearmAnchor(item,z){
 updateMatrices(item.root);let best=null,score=Infinity;
 for(const {mesh}of item.fit.records){const ids=mesh.geometry.index,count=ids?.count||mesh.geometry.attributes.position.count;
  for(let n=0;n<count;n+=3){const ix=[0,1,2].map(j=>ids?ids.getX(n+j):n+j),p=ix.map(i=>item.root.worldToLocal(vertex(mesh,i)));if(p.some(v=>v.z<.055||v.z>.23))continue;
   const center=p.reduce((a,b)=>a.add(b),new THREE.Vector3()).multiplyScalar(1/3),normal=p[1].clone().sub(p[0]).cross(p[2].clone().sub(p[0])).normalize();
   const d=Math.abs(center.z-z)+Math.abs(center.x)*.15+(1-normal.y)*.055;if(d<score){score=d;best={mesh,ids:ix,weights:[1/3,1/3,1/3]};}
  }
 }
 if(!best)throw new Error('Mike actual forearm skin triangle unavailable');return best;
}
function chooseFingertip(item){
 updateMatrices(item.root);let best=null,score=-Infinity;
 for(const {mesh}of item.fit.records){const weights=mesh.geometry.attributes.skinWeight,ids=mesh.geometry.attributes.skinIndex;
  for(let i=0;i<weights.count;i++){let ownership=0;for(let n=0;n<4;n++)if(mesh.skeleton.bones[ids.getComponent(i,n)]?.name==='f_index03R')ownership+=weights.getComponent(i,n);if(ownership<.65)continue;
   const p=item.root.worldToLocal(vertex(mesh,i)),value=p.dot(TIP_AXIS);if(value>score){score=value;best={mesh,index:i};}
  }
 }
 if(!best)throw new Error('Mike actual index fingertip skin unavailable');return best;
}
function copyPose(root){const states=[];root.traverse(o=>{if(o.isBone)states.push({o,p:o.position.clone(),q:o.quaternion.clone(),s:o.scale.clone()});});return states;}
function restorePose(states){for(const {o,p,q,s}of states){o.position.copy(p);o.quaternion.copy(q);o.scale.copy(s);}}

/** Owns runtime clones only. Caller retains and disposes the loaded GLTF assets. */
export function createMikePerformance({bodyGltf,armsGltf,reuseFootCalculations=true}={}){
 if(!bodyGltf?.scene||!bodyGltf.animations?.some(c=>c.name==='Seated')||!armsGltf?.scene)throw new Error('Critical existing Mike body/arms unavailable');
 const root=new THREE.Group();root.name='Mike continuous first-person recovery';
 const geometries=new Set(),materials=new Set(),skeletons=new Set();let disposed=false,lastReport=null,releaseSurfaces=null;
 // The existing actor adapter refits owned clothing/sole geometry. Give it
 // copies so even its inherited adjustments cannot alter source GLTF bytes.
 const bodySource=cloneSkeleton(bodyGltf.scene);
 bodySource.traverse(o=>{if(o.geometry){o.geometry=o.geometry.clone();geometries.add(o.geometry);}});
 const actor=createTexturedPrologueActor({name:'Mike',police:true,gltf:{...bodyGltf,scene:bodySource},sourceHeight:3.374371126294136,uniformDetails:false});
 bodySource.traverse(o=>{if(o.isSkinnedMesh)skeletons.add(o.skeleton);});
 actor.root.name='Mike headless fitted body';root.add(actor.root);
 actor.root.traverse(o=>{for(const m of [].concat(o.material||[]))materials.add(m);});
 const bodyStates=actor.capturePoseState(),arms={};
 for(const side of ['L','R']){
  const source=armsGltf.scene.getObjectByName(side==='L'?'LeftArm':'RightArm');if(!source)throw new Error('Critical Mike anatomical arm missing '+side);
  const pivot=new THREE.Group(),arm=cloneSkeleton(source);pivot.name='Mike recovery '+side+' hand and forearm';pivot.add(arm);root.add(pivot);
  arm.traverse(o=>{if(o.isSkinnedMesh)skeletons.add(o.skeleton);if(o.isMesh){o.frustumCulled=false;const own=m=>{const c=m.clone();materials.add(c);return c;};o.material=Array.isArray(o.material)?o.material.map(own):own(o.material);}});
  const fit=createStoryForearmFit(arm,{side,ownGeometry:g=>geometries.add(g)});arms[side]={root:pivot,arm,fit,rest:copyPose(arm),side};
 }
 const anchors=[.085,.13,.175].map(z=>chooseForearmAnchor(arms.L,z)),tip=chooseFingertip(arms.R);let latchTip,latchRoll=0,latchOutboardExtent=null;
 const blood=new THREE.MeshStandardMaterial({color:0x541d1b,roughness:.52,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1});materials.add(blood);
 const glass=new THREE.MeshStandardMaterial({color:0xc4dcda,roughness:.16,metalness:.18,transparent:true,opacity:.75,side:THREE.DoubleSide});materials.add(glass);
 const shardGeometry=new THREE.BufferGeometry();shardGeometry.setAttribute('position',new THREE.Float32BufferAttribute([-.003,0,0,.003,0,0,.001,.009,.0015,-.003,0,0,.001,.009,.0015,-.001,.002,.003],3));shardGeometry.computeVertexNormals();geometries.add(shardGeometry);
 const scarGeometry=new THREE.CircleGeometry(1,9);geometries.add(scarGeometry);
 const shards=[],cuts=[];for(let i=0;i<3;i++){const shard=new THREE.Mesh(shardGeometry,glass);shard.name='Small forearm glass '+i;root.add(shard);shards.push(shard);const cut=new THREE.Mesh(scarGeometry,blood);cut.name='Localized forearm cut '+i;cut.scale.set(.006,.0025,1);root.add(cut);cuts.push(cut);}
 const fingertipBlood=new THREE.Mesh(scarGeometry,blood);fingertipBlood.name='Small extraction fingertip blood';fingertipBlood.scale.set(.003,.002,1);root.add(fingertipBlood);
 const joints={};for(const side of ['L','R']){const find=id=>actor.root.getObjectByName(id+side);joints[side]={upper:find('armup'),lower:find('armlo'),hand:find('hand')};if(Object.values(joints[side]).some(x=>!x))throw new Error('Existing Mike arm rig missing '+side);}
 let armBases={};
 const shirt=actor.root.getObjectByName('shirt');if(!shirt?.isSkinnedMesh)throw new Error('Existing Mike upper-arm skin missing');
 const toWorld=p=>root.localToWorld(new THREE.Vector3().fromArray(p));
 const shoes=actor.root.getObjectByName('black_fancy_shoes');if(!shoes?.isSkinnedMesh)throw new Error('Existing Mike shoe skin missing');
 const shoeWeights=shoes.geometry.attributes.skinWeight,shoeIndices=shoes.geometry.attributes.skinIndex;
 const soleVertices=['L','R'].map(side=>Array.from({length:shoeWeights.count},(_,i)=>i).filter(i=>{
  let weight=0;for(let slot=0;slot<4;slot++)if(new RegExp('(foot[12]|leglo)'+side+'$').test(shoes.skeleton.bones[shoeIndices.getComponent(i,slot)].name.replaceAll('.','')))weight+=shoeWeights.getComponent(i,slot);return weight>.8;
 }));
 if(soleVertices.some(vertices=>vertices.length<3))throw new Error('Mike actual shoe sole surface unavailable');
 const floorCache=new WeakMap();
 function actualFloorHeights(mesh){
  if(!mesh?.isMesh)return CABIN_SUPPORT_XZ.map(()=>null);updateMatrices(root);
  const mat=mesh.parent?.getObjectByName('InteriorFloormats'),surfaces=[mesh,...mat?.isMesh&&mat.visible?[mat]:[]];
  const parts=surfaces.map(surface=>{const ranges=renderedSupportRanges(surface);if(!ranges.length)return null;surface.updateWorldMatrix(true,false);
   const relative=root.matrixWorld.clone().invert().multiply(surface.matrixWorld),attribute=surface.geometry.attributes.position,index=surface.geometry.index,previous=floorCache.get(surface);let points;
   if(previous&&previous.geometry===surface.geometry&&previous.position===attribute&&previous.version===attribute.version&&previous.index===index&&previous.indexVersion===index?.version&&sameSupportRanges(previous.ranges,ranges)&&previous.matrix.equals(relative))points=previous.points;
   else{points=Array.from({length:attribute.count},(_,i)=>surface.getVertexPosition(i,new THREE.Vector3()).applyMatrix4(relative));floorCache.set(surface,{geometry:surface.geometry,position:attribute,version:attribute.version,index,indexVersion:index?.version,ranges:ranges.map(range=>[...range]),matrix:relative,points});}
   return {points,index,ranges};
  }).filter(Boolean);
  return CABIN_SUPPORT_XZ.map(([x,z])=>{const ray=new THREE.Ray(new THREE.Vector3(x,2,z),new THREE.Vector3(0,-1,0)),hit=new THREE.Vector3();let y=null;
   for(const {points,index,ranges}of parts)for(const[lo,hi]of ranges)for(let i=lo;i+2<hi;i+=3){const p=[0,1,2].map(j=>points[index?index.getX(i+j):i+j]);if(ray.intersectTriangle(...p,false,hit)&&hit.y<2)y=y===null?hit.y:Math.max(y,hit.y);}return y;
  });
 }
 function solePath(s,index,cabin,roadHeight){
  const t=absoluteTime(s);
  if(t>22){
   const sequence=w1Swings(index),active=sequence.find(([a,b])=>t>a&&t<b),faces=supportFaces(s),heightAt=time=>{const p=absoluteSample(time).mikeFootTargets[index];return fullShoeSupport([{points:[p,p,p]}],faces)?.height??null;};
   if(!active){const height=heightAt(t);return {height:height===null?null:height+.0001,lift:0,planted:true,surface:'actual ground'};}
   const [a,b]=active,u=clamp((t-a)/(b-a)),from=heightAt(a),to=heightAt(b),lift=Math.sin(Math.PI*u)*W1.lift;
   return {height:from===null||to===null?null:from+(to-from)*smooth(u)+lift+.0001,lift,planted:false,surface:'swing'};
  }
  const stage=index===0?(t<18.05?{start:16.65,end:17.1,from:cabin[0],to:cabin[2],lift:.06,fromSurface:'cabin',toSurface:'cabin'}:{start:18.05,end:19.05,from:cabin[2],to:roadHeight[0],lift:.30,fromSurface:'cabin',toSurface:'road'}):t<17.25?{start:16.35,end:16.6,from:cabin[1],to:cabin[3],lift:.035,fromSurface:'cabin',toSurface:'cabin'}:t<19.1?{start:17.25,end:18.0,from:cabin[3],to:roadHeight[1],lift:.39,fromSurface:'cabin',toSurface:'road'}:{start:19.1,end:19.75,from:roadHeight[1],to:roadHeight[2],lift:.12,fromSurface:'road',toSurface:'road'};
  const u=clamp((t-stage.start)/(stage.end-stage.start)),blend=smooth(u),lift=index===1&&stage.start===17.25?rightOutsideLift(t):Math.sin(Math.PI*u)*stage.lift,from=stage.from,to=stage.to;
  const height=from===null&&blend<1||to===null&&blend>0?null:(from??0)*(1-blend)+(to??0)*blend+lift+.0001;
  return {height,lift,planted:u===0||u===1,surface:u>0&&u<1?'swing':u===0?stage.fromSurface:stage.toSurface};
 }
 // Reuse only within this synchronous extraction. Preserve the first vertex-before-
 // root-refresh order and both original matrix applications. Return fresh vectors.
 function localShoePoint(){let inverse=null;const points=new Map();return id=>{if(!points.has(id)){const point=vertex(shoes,id);if(!inverse){root.updateWorldMatrix(true,false);inverse=root.matrixWorld.clone().invert();}points.set(id,point.applyMatrix4(inverse));}return points.get(id).clone();};}
 function solePoints(){updateMatrices(root);const point=localShoePoint();return soleVertices.map(vertices=>vertices.map(point).reduce((a,b)=>a.y<b.y?a:b));}
 function retainFootYaw(s){
  const worldUp=UP.clone().applyQuaternion(root.getWorldQuaternion(new THREE.Quaternion()));
  for(const [i,side]of ['L','R'].entries()){
   const foot=actor.root.getObjectByName('foot1'+side),yaw=s.mikeFootYaws?.[i]??s.mikeYaw;
   const turn=new THREE.Quaternion().setFromAxisAngle(worldUp,yaw-s.mikeYaw),world=turn.multiply(foot.getWorldQuaternion(new THREE.Quaternion()));
   const pitchAxis=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw)).applyQuaternion(root.getWorldQuaternion(new THREE.Quaternion()));world.premultiply(new THREE.Quaternion().setFromAxisAngle(pitchAxis,-(s.mikeFootPitches?.[i]??0)));
   foot.quaternion.copy(foot.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(world));foot.updateWorldMatrix(false,true);
  }
 }
 function supportReach(targets){return ['L','R'].map((side,i)=>{const p=['legup','leglo','foot1'].map(n=>root.worldToLocal(actor.root.getObjectByName(n+side).getWorldPosition(new THREE.Vector3()))),a=p[0].distanceTo(p[1]),b=p[1].distanceTo(p[2]),requested=p[0].distanceTo(new THREE.Vector3(...targets[i])),minimum=Math.abs(a-b)+.0001,maximum=a+b-.0001;return {requested,minimum,maximum,geometricallyClamped:requested<minimum||requested>maximum,actualAnkleError:p[2].distanceTo(new THREE.Vector3(...targets[i]))};});}
 function poseBaseSupportedBody(s){
  const cabin=actualFloorHeights(s.passengerFloor),road=exteriorHeights(s),paths=[0,1].map(i=>solePath(s,i,cabin,road));
  if(paths.some(p=>p.height===null)){
   actor.pose({mode:s.time<=16&&s.chapter!=='custody'?'seated':'exit',time:s.time,reduced:true,exitPose:{time:1.6,transfer:s.transfer,footTargets:s.mikeFootTargets}});
   return {resolvedFootTargets:s.mikeFootTargets.map(p=>[...p]),soleSupport:{status:'UNVERIFIED_MISSING_FLOOR',sides:[]}};
  }
  const targets=s.mikeFootTargets.map((p,i)=>[p[0],paths[i].height+.04,p[2]]);let points,baseReachErrors=[0,0],baseReach=[],baseIterations=0;
  for(let iteration=0;iteration<4;iteration++){baseIterations=iteration+1;
   actor.pose({mode:'exit',time:s.time,reduced:true,crouch:.03*s.transfer+(s.bodyFitCrouch||0),exitPose:{time:1.6,transfer:s.transfer,footTargets:targets}});retainFootYaw(s);points=solePoints();baseReach=supportReach(targets);baseReachErrors=baseReach.map(r=>r.actualAnkleError);if(baseReach.some(r=>r.geometricallyClamped||r.actualAnkleError>.005))break;
   if(iteration<3)for(let i=0;i<2;i++)targets[i][1]+=paths[i].height-points[i].y;
  }
  return {baseFit:{iterations:baseIterations,reachErrors:baseReachErrors,reach:baseReach,actualAnkleTolerance:.005,status:baseReach.some(r=>r.geometricallyClamped||r.actualAnkleError>.005)?'UNREACHABLE_ANKLE':'REACHABLE'},resolvedFootTargets:targets.map(p=>[...p]),soleSupport:{status:'SAMPLED_ACTUAL_SOLES',floorSupplied:!!s.passengerFloor,roadHeight:road,sides:paths.map((path,i)=>({side:i?'R':'L',surface:path.surface,planted:path.planted,lift:path.lift,targetHeight:path.height,surfaceHeight:path.height-path.lift-.0001,intendedClearance:.0001,actualPoint:points[i].toArray(),heightError:points[i].y-path.height}))}};
 }
 const shoeTriangleIds=[[],[]];
 const shoeIndex=shoes.geometry.index,shoeCount=shoeIndex?.count||shoes.geometry.attributes.position.count;
 for(let offset=0;offset<shoeCount;offset+=3){const ids=[0,1,2].map(k=>shoeIndex?shoeIndex.getX(offset+k):offset+k);
  for(const [i,side]of ['L','R'].entries())if(ids.every(id=>{let own=0;for(let k=0;k<4;k++)if(new RegExp('(hip|legup|leglo|foot[12])'+side+'$').test(shoes.skeleton.bones[shoeIndices.getComponent(id,k)].name.replaceAll('.','')))own+=shoeWeights.getComponent(id,k);return own>.5;}))shoeTriangleIds[i].push({index:offset/3,ids});
 }
 if(shoeTriangleIds.reduce((n,a)=>n+a.length,0)!==shoeCount/3)throw new Error('Unclassified shoe triangle in material-anchor reconstruction');
 const supportFaceCache=new WeakMap();
 function supportVisible(mesh){for(let p=mesh;p;p=p.parent)if(!p.visible)return false;return true;}
 function supportFaces(s){
  const floor=s.passengerFloor,mat=floor?.parent?.getObjectByName('InteriorFloormats'),triangles=[];
  for(const mesh of [floor,mat,...(s.groundSupports||[])].filter(m=>m?.isMesh&&supportVisible(m))){
   const ranges=renderedSupportRanges(mesh);if(!ranges.length)continue;mesh.updateWorldMatrix(true,false);const matrix=root.matrixWorld.clone().invert().multiply(mesh.matrixWorld),g=mesh.geometry,position=g.attributes.position,index=g.index,old=supportFaceCache.get(mesh);let faces;
   if(old&&old.geometry===g&&old.position===position&&old.positionVersion===position.version&&old.index===index&&old.indexVersion===index?.version&&sameSupportRanges(old.ranges,ranges)&&old.matrix.equals(matrix))faces=old.faces;
   else{const points=Array.from({length:position.count},(_,i)=>mesh.getVertexPosition(i,new THREE.Vector3()).applyMatrix4(matrix).toArray());faces=[];for(const[lo,hi]of ranges)for(let n=lo;n+2<hi;n+=3){const p=[0,1,2].map(k=>points[index?index.getX(n+k):n+k]);faces.push({mesh:mesh.name,index:n/3,points:p,bounds:{minX:Math.min(...p.map(v=>v[0])),maxX:Math.max(...p.map(v=>v[0])),minZ:Math.min(...p.map(v=>v[2])),maxZ:Math.max(...p.map(v=>v[2]))}});}supportFaceCache.set(mesh,{geometry:g,position,positionVersion:position.version,index,indexVersion:index?.version,ranges:ranges.map(range=>[...range]),matrix,faces});}
   triangles.push(...faces);
  }return triangles;
 }
 function exteriorHeights(s){const faces=supportFaces(s),points=[EXIT_FEET[0],RIGHT_PLANT,EXIT_FEET[1]];return points.map(p=>fullShoeSupport([{points:[p,p,p]}],faces)?.height??null);}
 function shoeFaces(side){const point=localShoePoint();return shoeTriangleIds[side].map(tri=>({...tri,points:tri.ids.map(id=>point(id).toArray())}));}
 function materialPoint(anchor){const point=localShoePoint();return anchor.ids.map(point).reduce((p,v,i)=>p.addScaledVector(v,anchor.weights[i]),new THREE.Vector3());}
 function authoredPlantStart(time,index){
  if(time>22)return w1PlantStart(time,index);
  if(index===0){if(time<=16.65)return 0;if(time>=17.1&&time<=18.05)return 17.1;if(time>=19.05)return 19.05;}
  else{if(time<=16.35)return 0;if(time>=16.6&&time<=17.25)return 16.6;if(time>=18.0&&time<=19.1)return 18.0;if(time>=19.75)return 19.75;}
  return null;
 }
 function poseAnchoredBody(s,canonicalReuse=null){
  if(!s.passengerFloor?.isMesh)return poseBaseSupportedBody(s);
  const time=absoluteTime(s),starts=[0,1].map(i=>authoredPlantStart(time,i)),faces=supportFaces(s),anchors=[null,null],canonical=new Map(),canonicalFailures=[];
  for(const [side,start]of starts.entries())if(start!==null){
   // This map belongs to one synchronous update only. Keys include the authored
   // reference and surface identities. Reuse also requires identical immutable
   // support-face records from the validated support extractor; shoe vertices are
   // never reused. Every current-body solve below still restores and poses afresh.
   const reuseKey=canonicalReuse?JSON.stringify([start,start>22?side:null,s.roadHeight??null,s.passengerFloor.uuid,(s.groundSupports||[]).map(mesh=>mesh.uuid)]):null;
   let records=canonical.get(start),cached=!records&&canonicalReuse?.get(reuseKey);
   if(cached&&cached.faces.length===faces.length&&faces.every((face,i)=>face===cached.faces[i])){records=structuredClone(cached.records);canonicalFailures.push(...structuredClone(cached.failures));canonical.set(start,records);}
   const failureStart=canonicalFailures.length;
   if(!records){const ref={...absoluteSample(start),passengerFloor:s.passengerFloor,groundSupports:s.groundSupports,roadHeight:s.roadHeight};if(start===19.05)ref.mikeFootPitches=[0,ref.mikeFootPitches[1]];actor.restorePoseState(bodyStates);actor.root.position.fromArray(ref.mike);actor.root.rotation.set(0,ref.mikeYaw,0);const refBase=poseBaseSupportedBody(ref);updateMatrices(root);
    const fitSide=start===19.05?0:start>22?side:null;
    if(fitSide!==null){
     // Each owned W1 landing retains nominal X/Z before choosing material.
     // Fit the complete sole in Y only; later poses retain this canonical point.
     const targets=refBase.resolvedFootTargets.map(point=>[...point]);let settled=false,lastFit=null;
     for(let iteration=0;iteration<10;iteration++){
      targets[fitSide][0]=ref.mikeFootTargets[fitSide][0];targets[fitSide][2]=ref.mikeFootTargets[fitSide][2];
      actor.pose({mode:'exit',time:ref.time,reduced:true,crouch:.03*ref.transfer+(ref.bodyFitCrouch||0),exitPose:{time:1.6,transfer:ref.transfer,footTargets:targets}});retainFootYaw(ref);updateMatrices(root);
      const reach=supportReach(targets)[fitSide];if(reach.actualAnkleError>.005)throw new Error('Canonical neutral ankle exceeds existing 5 mm solve bound');
      const support=fullShoeSupport(shoeFaces(fitSide),faces);if(!support||!Number.isFinite(support.gap))throw new Error('Canonical neutral full-face support unavailable');
      const correction=.0001-support.gap;lastFit={start,side:fitSide,iteration:iteration+1,target:[...targets[fitSide]],gap:support.gap,correction,actualAnkleError:reach.actualAnkleError};if(Math.abs(correction)<1e-11){settled=true;break;}
      if(iteration<9)targets[fitSide][1]+=correction;
     }
     if(!settled)throw new Error('Canonical Y-only support did not converge within ten iterations: '+JSON.stringify(lastFit));
    }
    records=[0,1].map(i=>{if(refBase.baseFit&&refBase.baseFit.reachErrors[i]>.005){canonicalFailures.push({time:start,side:i,reason:'UNREACHABLE_CANONICAL_ANKLE',error:refBase.baseFit.reachErrors[i]});return null;}const triangles=shoeFaces(i),support=fullShoeSupport(triangles,faces);if(!support)throw new Error('Canonical material support unavailable');const tri=triangles.find(t=>t.index===support.shoeTriangle),weights=new THREE.Triangle(...tri.points.map(p=>new THREE.Vector3(...p))).getBarycoord(new THREE.Vector3(...support.point),new THREE.Vector3()).toArray();return {start,index:support.shoeTriangle,ids:tri.ids,weights,target:[support.point[0],support.height+(start===18.0&&i===1?.001:.0001),support.point[2]],surface:support.supportMesh,canonicalGap:support.gap};});canonical.set(start,records);if(canonicalReuse)canonicalReuse.set(reuseKey,{faces:[...faces],records:structuredClone(records),failures:structuredClone(canonicalFailures.slice(failureStart))});
   }anchors[side]=records[side];
  }
  for(const change of [{start:16.35,end:16.65}])if(time>change.start&&time<=change.end&&starts[0]!==null){
   const handover={...sampleRecovery(change.start),passengerFloor:s.passengerFloor,groundSupports:s.groundSupports},previous=poseAnchoredBody(handover,canonicalReuse),ids=[125,136,0],weights=[0,0,1],index=6,actual=shoeTriangleIds[0].find(t=>t.index===index);
   if(!actual||!actual.ids.every((id,i)=>id===ids[i]))throw new Error('Retained left toe0 face identity changed');
   const target=materialPoint({ids,weights}).toArray(),support=fullShoeSupport([{index,points:[target,target,target]}],faces);if(!support)throw new Error('Left toe0 handover support unavailable');
   anchors[0]={start:change.start,index,ids,weights,target,surface:support.supportMesh,canonicalGap:support.gap,previousSupport:previous.materialAnchors[0]};
  }
  // Neutral reference is independently route-bound; rendered entry pivots about
  // its exact final toe. The corresponding test contract is pending review.
  if(starts[0]===19.05&&!s.neutralLeftLandingReference){
   const reference={...sampleRecovery(19.05),passengerFloor:s.passengerFloor,groundSupports:s.groundSupports,neutralLeftLandingReference:true};reference.mikeFootPitches=[0,reference.mikeFootPitches[1]];
   const previous=poseAnchoredBody(reference,canonicalReuse),ids=[125,136,0],weights=[0,0,1],index=6,actual=shoeTriangleIds[0].find(t=>t.index===index);
   if(!actual||!actual.ids.every((id,i)=>id===ids[i]))throw new Error('Retained final left toe face identity changed');
   const target=materialPoint({ids,weights}).toArray(),support=fullShoeSupport([{index,points:[target,target,target]}],faces);if(!support)throw new Error('Final left toe support unavailable');
   anchors[0]={start:19.05,index,ids,weights,target,surface:support.supportMesh,canonicalGap:support.gap,canonicalNeutralReference:{time:19.05,footPitch:0,nominalAnkleXZ:[reference.mikeFootTargets[0][0],reference.mikeFootTargets[0][2]]}};
  }
  if(time>17.35&&time<=18.05&&starts[0]!==null){
   const handover={...sampleRecovery(17.35),passengerFloor:s.passengerFloor,groundSupports:s.groundSupports,roadHeight:s.roadHeight};
   const previous=poseAnchoredBody(handover,canonicalReuse),ids=[120,124,38],weights=[0,0,1],index=12;
   const actual=shoeTriangleIds[0].find(t=>t.index===index);if(!actual||!actual.ids.every((id,i)=>id===ids[i]))throw new Error('Retained forefoot face identity changed');
   const target=materialPoint({ids,weights}).toArray(),support=fullShoeSupport([{index,points:[target,target,target]}],faces);if(!support)throw new Error('Forefoot handover support unavailable');
   anchors[0]={start:17.35,index,ids,weights,target,surface:support.supportMesh,canonicalGap:support.gap,previousSupport:previous.materialAnchors[0]};
  }
  if(time>18.0&&time<=19.1&&starts[1]!==null){
   const handover={...sampleRecovery(18.0),passengerFloor:s.passengerFloor,groundSupports:s.groundSupports};const previous=poseAnchoredBody(handover,canonicalReuse),pointId=186,face=shoeTriangleIds[1].find(t=>t.ids.includes(pointId));if(!face)throw new Error('Right toe material identity unavailable');
   const weights=face.ids.map(id=>id===pointId?1:0),target=materialPoint({ids:face.ids,weights}).toArray(),support=fullShoeSupport([{points:[target,target,target]}],faces);if(!support)throw new Error('Actual right forefoot ground unavailable');
   anchors[1]={start:18.0,index:face.index,ids:face.ids,weights,target,surface:support.supportMesh,canonicalGap:support.gap,previousSupport:previous.materialAnchors[1]};
  }
  // Canonical shared-contact handovers use measured existing pure-foot material.
  // The exact landing belongs to the arriving heel; no hold can reseed its point.
  for(const mode of [{boundary:3,index:24,ids:[129,52,142]},{boundary:5,index:6,ids:[125,136,0]},{boundary:7,index:6,ids:[125,136,0]},{boundary:9,index:6,ids:[125,136,0]}])if(time>w1Boundary(mode.boundary)&&time<=w1Boundary(mode.boundary+1)&&starts[0]===w1Boundary(mode.boundary)){
   const handover={...absoluteSample(w1Boundary(mode.boundary)),passengerFloor:s.passengerFloor,groundSupports:s.groundSupports,roadHeight:s.roadHeight};
   const previous=poseAnchoredBody(handover,canonicalReuse),{index,ids}=mode,weights=[0,0,1],actual=shoeTriangleIds[0].find(t=>t.index===index);
   if(!actual||!actual.ids.every((id,i)=>id===ids[i]))throw new Error('Retained W1 left pure-foot identity changed');
   const target=materialPoint({ids,weights}).toArray(),support=fullShoeSupport([{index,points:[target,target,target]}],faces);if(!support||!Number.isFinite(support.gap)||support.gap<0||support.gap>.005)throw new Error('W1 pure-foot handover is not actually contact-eligible');
   anchors[0]={start:w1Boundary(mode.boundary),index,ids,weights,target,surface:support.supportMesh,canonicalGap:support.gap,previousSupport:previous.materialAnchors[0]};
  }
  actor.restorePoseState(bodyStates);actor.root.position.fromArray(s.mike);actor.root.rotation.set(0,s.mikeYaw,0);const base=poseBaseSupportedBody(s),targets=base.resolvedFootTargets.map((p,i)=>p.map((v,k)=>v+(s.airborneEndpointOffsets?.[i]?.[k]??0)));let iterations=0,materialResiduals=[Infinity,Infinity],reachErrors=[Infinity,Infinity],reachBranches=[],convergenceStatus='ITERATION_LIMIT';
  for(;iterations<24;iterations++){
   actor.pose({mode:'exit',time:s.time,reduced:true,crouch:.03*s.transfer+(s.bodyFitCrouch||0),exitPose:{time:1.6,transfer:s.transfer,footTargets:targets}});retainFootYaw(s);updateMatrices(root);
   const deltas=anchors.map(anchor=>anchor?new THREE.Vector3(...anchor.target).sub(materialPoint(anchor)):new THREE.Vector3());materialResiduals=deltas.map(d=>d.length());reachBranches=supportReach(targets);reachErrors=reachBranches.map(r=>r.actualAnkleError);
   if(reachBranches.some(r=>r.geometricallyClamped)){convergenceStatus='GEOMETRIC_CLAMP';break;}
   if(reachErrors.some(error=>error>.005)){convergenceStatus='ACTUAL_ANKLE_SOLVE_FAILURE';break;}
   if(canonicalFailures.length){convergenceStatus='INVALID_CANONICAL_ANCHOR';break;}
   if(deltas.every(d=>d.length()<1e-11)){convergenceStatus='CONVERGED';break;}
   if(iterations<23)for(let i=0;i<2;i++)if(anchors[i])for(let axis=0;axis<3;axis++)targets[i][axis]+=deltas[i].getComponent(axis);
  }
  const points=solePoints(),fullFaceSupport=[0,1].map(i=>fullShoeSupport(shoeFaces(i),faces)),materialAnchors=anchors.map(anchor=>anchor?{...anchor,actual:materialPoint(anchor).toArray(),error:materialPoint(anchor).distanceTo(new THREE.Vector3(...anchor.target))}:null);
  return {...base,baseResolvedFootTargets:base.resolvedFootTargets.map(p=>[...p]),resolvedFootTargets:targets,materialAnchors,fullFaceSupport,materialIterations:iterations,materialConvergence:{status:convergenceStatus,iterations:Math.min(iterations+1,24),iterationCap:24,numericalObjective:1e-11,actualAnkleAcceptanceTolerance:.005,numericalObjectiveIsNotAnAcceptanceGate:true,geometricClampIsNotAnAcceptanceGate:true,materialResiduals,reachErrors,reachBranches,canonicalFailures},soleSupport:{...base.soleSupport,sides:base.soleSupport.sides.map((path,i)=>({...path,actualPoint:points[i].toArray(),heightError:points[i].y-path.targetHeight,fullFaceGap:fullFaceSupport[i]?.gap,materialAnchor:materialAnchors[i]}))}};
 }
 const authoredSwings=[[[16.65,17.1],[18.05,19.05],...w1Swings(0)],[[16.35,16.6],[17.25,18.0],[19.1,19.75],...w1Swings(1)]];
 function poseSupportedBodyDetailed(s){
  if(!s.passengerFloor?.isMesh)return poseBaseSupportedBody(s);
  const t=absoluteTime(s),offsets=[null,null],boundaryCorrections=[],canonicalReuse=reuseFootCalculations?new Map():null;
  for(let side=0;side<2;side++){
   const swing=authoredSwings[side].find(([a,b])=>t>a&&t<b);if(!swing)continue;
   const endpoint=swing.map(time=>{const sample={...absoluteSample(time),passengerFloor:s.passengerFloor,groundSupports:s.groundSupports,roadHeight:s.roadHeight};const solved=poseAnchoredBody(sample,canonicalReuse);return solved.resolvedFootTargets[side].map((v,k)=>v-solved.baseResolvedFootTargets[side][k]);});
   const u=ease(t,...swing);offsets[side]=mix(endpoint[0],endpoint[1],u);boundaryCorrections.push({side,swing,endpoint,u});
  }
  const result=poseAnchoredBody({...s,airborneEndpointOffsets:offsets},canonicalReuse);return {...result,boundaryCorrections};
 }

 function poseSupportedBody(s){
  if(![...s.mike,s.mikeYaw,s.time,s.transfer,...s.mikeFootTargets.flat(),s.bodyFitCrouch||0].every(Number.isFinite))throw Error('Invalid MVP Mike pose inputs');
  actor.pose({mode:'exit',time:s.time,reduced:true,crouch:.03*s.transfer+(s.bodyFitCrouch||0),exitPose:{time:1.6,transfer:s.transfer,footTargets:s.mikeFootTargets}});retainFootYaw(s);updateMatrices(root);
  actor.root.traverse(o=>{if(![...o.position.toArray(),...o.quaternion.toArray(),...o.scale.toArray(),...o.matrixWorld.elements].every(Number.isFinite)||o.quaternion.lengthSq()===0||o.matrixWorld.determinant()===0)throw Error('Invalid MVP Mike transform '+o.name);});
  return{resolvedFootTargets:s.mikeFootTargets.map(p=>[...p]),soleSupport:{status:'OWNER_DEFERRED_NOT_PASSED',sides:[],solver:'existing authored actor pose and IK; cosmetic sole refinement bypassed'}};
 }

 function collarGap(item,elbow){
  const positions=shirt.geometry.attributes.position,indices=shirt.geometry.index,points=Array.from({length:positions.count},(_,i)=>vertex(shirt,i)),triangles=[];
  for(let i=0;i<(indices?.count||points.length);i+=3){const p=[0,1,2].map(j=>points[indices?indices.getX(i+j):i+j]);if(p.some(v=>v.distanceToSquared(elbow)<.0121))triangles.push(new THREE.Triangle(...p));}
  let gap=Infinity,delta=new THREE.Vector3();const closest=new THREE.Vector3();
  for(const {mesh}of item.fit.records)for(let i=0;i<mesh.geometry.attributes.position.count;i++){const p=vertex(mesh,i);if(p.distanceToSquared(elbow)>.0049)continue;for(const triangle of triangles){triangle.closestPointToPoint(p,closest);const d=p.distanceTo(closest);if(d<gap){gap=d;delta.copy(closest).sub(p);}}}
  return {gap,delta};
 }

 function solveArm(side,desired){
  // Each solve starts from this absolute sample, rather than repeatedly
  // re-solving a nonuniformly scaled result and accumulating round-trip drift.
  restorePose(armBases[side]);updateMatrices(root);
  const j=joints[side],a=j.upper.getWorldPosition(new THREE.Vector3()),b=j.lower.getWorldPosition(new THREE.Vector3()),c=j.hand.getWorldPosition(new THREE.Vector3()),lengthA=a.distanceTo(b),lengthB=b.distanceTo(c);
  const direction=desired.clone().sub(a),reach=THREE.MathUtils.clamp(direction.length(),Math.abs(lengthA-lengthB)+.0001,lengthA+lengthB-.0001);direction.normalize();
  const end=a.clone().addScaledVector(direction,reach),pole=actor.root.localToWorld(new THREE.Vector3(side==='R'?.13:.43,1.05,.26)).sub(a);pole.addScaledVector(direction,-pole.dot(direction));if(pole.lengthSq()<1e-10)pole.set(0,1,0);pole.normalize();
  const along=(lengthA*lengthA-lengthB*lengthB+reach*reach)/(2*reach),elbow=a.clone().addScaledVector(direction,along).addScaledVector(pole,Math.sqrt(Math.max(0,lengthA*lengthA-along*along)));
  const rotate=(bone,from,to)=>{const q=new THREE.Quaternion().setFromUnitVectors(from.normalize(),to.normalize()).multiply(bone.getWorldQuaternion(new THREE.Quaternion()));bone.quaternion.copy(bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(q));bone.updateWorldMatrix(false,true);};
  const lowerAxis=c.clone().sub(b).applyQuaternion(j.lower.getWorldQuaternion(new THREE.Quaternion()).invert());
  rotate(j.upper,b.clone().sub(a),elbow.clone().sub(a));j.lower.position.copy(j.lower.parent.worldToLocal(elbow.clone()));j.lower.updateWorldMatrix(false,true);
  rotate(j.lower,lowerAxis.applyQuaternion(j.lower.getWorldQuaternion(new THREE.Quaternion())),end.clone().sub(elbow));j.hand.position.copy(j.hand.parent.worldToLocal(end));updateMatrices(root);
  return {elbow:j.lower.getWorldPosition(new THREE.Vector3()),wrist:j.hand.getWorldPosition(new THREE.Vector3()),error:j.hand.getWorldPosition(new THREE.Vector3()).distanceTo(desired),lengthA,lengthB};
 }
 function fitArm(side,desired,rotation=null){
  const item=arms[side],contact=solveArm(side,desired);item.root.position.copy(root.worldToLocal(contact.wrist.clone()));
  const q=rotation||new THREE.Quaternion().setFromUnitVectors(Z,contact.elbow.clone().sub(contact.wrist).normalize());
  item.root.quaternion.copy(root.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(q));if(!rotation)item.root.rotateZ(side==='R'?.35:-.35);updateMatrices(root);item.fit.fit(contact.elbow);updateMatrices(root);
  // Existing owned-forearm fitting meets the actual upper-arm triangles. This
  // millimetre-scale collar correction changes neither source rig nor bones.
  const endpoint=contact.elbow.clone();let seam=collarGap(item,contact.elbow);
  for(let i=0;i<4&&seam.gap>.00045;i++){if(seam.delta.length()>.01)break;endpoint.add(seam.delta);item.fit.fit(endpoint);updateMatrices(root);seam=collarGap(item,contact.elbow);}
  return {...contact,seamGap:seam.gap,collarOffset:endpoint.distanceTo(contact.elbow)};
 }
 function poseLatchFingers(weight){
  if(weight<=0)return;
  const item=arms.R,saved=copyPose(item.arm);applyHandGrip(item.arm,'pistol','R');
  // Extend only the existing index chain; the remaining fingers fold safely
  // behind it. Joint rotations retain the imported rig and every bone length.
  const direction=TIP_AXIS.clone().applyQuaternion(item.root.getWorldQuaternion(new THREE.Quaternion()));
  for(let n=1;n<=3;n++){
   const bone=item.arm.getObjectByName(`f_index0${n}R`),child=bone?.children.find(o=>o.isBone);if(!child)continue;
   const origin=bone.getWorldPosition(new THREE.Vector3()),axis=child.getWorldPosition(new THREE.Vector3()).sub(origin).normalize(),delta=new THREE.Quaternion().setFromUnitVectors(axis,direction);
   bone.quaternion.copy(bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(delta).multiply(bone.getWorldQuaternion(new THREE.Quaternion())));bone.updateWorldMatrix(false,true);
  }
  for(const {o,q}of saved)o.quaternion.copy(q.clone().slerp(o.quaternion,weight));updateMatrices(root);
 }
 function topHandleSurface(handle){
  handle.updateWorldMatrix(true,false);let frame=handle;while(frame.parent&&frame.name!=='Passenger door hinge')frame=frame.parent;
  if(frame.name!=='Passenger door hinge'||handle.name!=='InteriorDoorR06'||handle.geometry.attributes.position.count!==448||handle.geometry.index?.count!==1647)throw new Error('Actual passenger handle identity unavailable');
  const world=Array.from({length:handle.geometry.attributes.position.count},(_,i)=>vertex(handle,i)),points=world.map(p=>frame.worldToLocal(p.clone()));let index=0;
  for(let i=1;i<points.length;i++)if(points[i].y>points[index].y+1e-10)index=i;
  if(Math.abs(points[index].y-.3558973967817458)>1e-6)throw new Error('Verified inherited handle top changed');
  return {point:world[index],normal:new THREE.Vector3(0,1,0).transformDirection(frame.matrixWorld),vertex:index,highestHingeY:points[index].y};
 }
 function verifyLatchSupport(item,contact){
  if(contact.mesh.name!=='RightArmSkin'||contact.index!==41||contact.mesh.geometry.attributes.position.count!==2107||contact.mesh.geometry.index?.count!==11190)throw new Error('Verified inherited latch hand identity changed');
  const pivotPoint=item.root.worldToLocal(vertex(contact.mesh,contact.index)),down=new THREE.Quaternion().setFromUnitVectors(TIP_AXIS,new THREE.Vector3(0,-1,0)),angle=309*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);let extent=-Infinity;
  // The fixed inward roll was measured against the unchanged actual hand.
  // Verify its support extent once; do not search collisions during playback.
  for(const {mesh}of item.fit.records)for(let i=0;i<mesh.geometry.attributes.position.count;i++){
   const local=item.root.worldToLocal(vertex(mesh,i));if(local.z>.025)continue;local.sub(pivotPoint).applyQuaternion(down);extent=Math.max(extent,c*local.x+s*local.z);
  }
  if(Math.abs(extent-.008600015202929032)>1e-6)throw new Error('Verified inherited latch support pose changed');return {angle,extent};
 }
 function chooseWholeHandSupport(item){
  updateMatrices(item.root);let best=null,score=-Infinity;
  for(const {mesh}of item.fit.records)for(let i=0;i<mesh.geometry.attributes.position.count;i++){
   const p=item.root.worldToLocal(vertex(mesh,i)),value=p.dot(TIP_AXIS);if(value>score){score=value;best={mesh,index:i};}
  }return best;
 }
 function placeOnSurface(mesh,s,offset=.00035){mesh.position.copy(root.worldToLocal(s.point.clone().addScaledVector(s.normal,offset)));mesh.quaternion.copy(new THREE.Quaternion().setFromUnitVectors(Z,s.normal).premultiply(root.getWorldQuaternion(new THREE.Quaternion()).invert()));}
 function update(sample=sampleRecovery(0)){
  if(disposed)return;const s=sample,pick=s.picking||pickingAt(22);actor.restorePoseState(bodyStates);
  actor.root.position.fromArray(s.mike);actor.root.rotation.set(0,s.mikeYaw,0);const support=poseSupportedBody(s);
  // Canonical calculation frame prevents previous-sample rotation round trips.
  for(const side of ['L','R']){arms[side].root.position.set(0,0,0);arms[side].root.quaternion.identity();}
  restorePose(arms.L.rest);restorePose(arms.R.rest);updateMatrices(root);poseLatchFingers(s.doorHand||0);
  for(const side of ['L','R'])armBases[side]=Object.values(joints[side]).map(o=>({o,p:o.position.clone(),q:o.quaternion.clone(),s:o.scale.clone()}));
  // Rest on the forward lap, clear of the cushion, before raising the glass.
  const resting={};for(const side of ['L','R'])resting[side]=actor.root.localToWorld(new THREE.Vector3(side==='L'?.13:-.13,.90,.32));
  const weight=pick.weight,leftTarget=resting.L.clone().lerp(toWorld([.38,.79,.13]),weight),left=fitArm('L',leftTarget);
  const targetSurfaces=anchors.map(surface),active=pick.fragments[pick.index],target=targetSurfaces[pick.index];
  const progress=active.approach,release=active.release,approachPoint=target.point.clone().addScaledVector(target.normal,.075*(1-progress)+.075*active.extract);
  approachPoint.add(toWorld([.10*release,.025*release,0]).sub(toWorld([0,0,0])));
  const palmNormal=target.normal.clone();
  if(pick.index<2){const next=targetSurfaces[pick.index+1],nextPoint=next.point.clone().addScaledVector(next.normal,.075),blend=ease(s.time,active.start+3.5,active.start+5);approachPoint.lerp(nextPoint,blend);palmNormal.lerp(next.normal,blend).normalize();}
  // The distal index surface, never the wrist, is the extraction contact.
  const naturalRotation=new THREE.Quaternion().setFromUnitVectors(Z,joints.R.lower.getWorldPosition(new THREE.Vector3()).sub(resting.R).normalize());
  const rightRotation=naturalRotation.slerp(new THREE.Quaternion().setFromUnitVectors(TIP_AXIS,palmNormal.clone().negate()),weight);
  const desired=resting.R.clone().lerp(toWorld([.65,.78,.16]),weight);let right=fitArm('R',desired,rightRotation);
  let requested=desired.clone();for(let i=0;i<3&&weight>0;i++){const actual=vertex(tip.mesh,tip.index),delta=approachPoint.clone().sub(actual).multiplyScalar(weight);requested.add(delta);right=fitArm('R',requested,rightRotation);}
  let handleError=null,handleTarget=null;
  if(s.doorHand>0&&s.passengerHandle){
   // Contact the actual handle support plane from above. The highest
   // vertex is selected in the rigid hinge frame, independent of sample order.
   const handleSurface=topHandleSurface(s.passengerHandle),goal=handleSurface.point,start=vertex(latchTip.mesh,latchTip.index),desiredPoint=start.lerp(goal.clone().addScaledVector(handleSurface.normal,.002),s.doorHand).addScaledVector(handleSurface.normal,.10*Math.sin(Math.PI*s.doorHand));requested=right.wrist.clone();for(let i=0;i<3;i++){requested.add(desiredPoint.clone().sub(vertex(latchTip.mesh,latchTip.index)));right=fitArm('R',requested,rightRotation.clone().slerp(new THREE.Quaternion().setFromUnitVectors(TIP_AXIS,handleSurface.normal.clone().negate()).premultiply(new THREE.Quaternion().setFromAxisAngle(handleSurface.normal,latchRoll)),s.doorHand));}
   handleError=vertex(latchTip.mesh,latchTip.index).distanceTo(goal);handleTarget=root.worldToLocal(goal.clone()).toArray();
  }
  const actualTip=vertex(tip.mesh,tip.index),contacts=[];
  for(let i=0;i<3;i++){
   const fragment=pick.fragments[i],skin=targetSurfaces[i],shard=shards[i];placeOnSurface(cuts[i],skin);cuts[i].rotateZ(i*.8);placeOnSurface(shard,skin,0);
   if(fragment.extract>0){const removed=skin.point.clone().addScaledVector(skin.normal,.075*fragment.extract);shard.position.copy(root.worldToLocal(removed));}
   if(fragment.held&&i===pick.index)shard.position.copy(root.worldToLocal(actualTip.clone()));
   if(fragment.dropAge>0){const age=fragment.dropAge,saved=releaseSurfaces?.[i],origin=saved?toWorld(saved.point).addScaledVector(new THREE.Vector3().fromArray(saved.normal).transformDirection(root.matrixWorld),.075):skin.point.clone().addScaledVector(skin.normal,.075),p=root.worldToLocal(origin);p.x+=Math.min(age,.5)*.08;p.y=Math.max(.17,p.y-.5*9.8*age*age);p.z+=Math.min(age,.5)*.03;shard.position.copy(p);shard.rotation.set(1.1,0,i);}
   contacts.push({index:i,contact:fragment.contact,removed:fragment.removed,skin:root.worldToLocal(skin.point.clone()).toArray(),glass:shard.position.toArray(),skinGap:fragment.extract===0?0:null});
  }
  fingertipBlood.visible=s.time>=2||s.chapter==='custody';fingertipBlood.position.copy(root.worldToLocal(actualTip.clone().addScaledVector(target.normal,.0003)));fingertipBlood.quaternion.copy(new THREE.Quaternion().setFromUnitVectors(Z,target.normal).premultiply(root.getWorldQuaternion(new THREE.Quaternion()).invert()));updateMatrices(root);
  lastReport={time:s.time,chapter:s.chapter,identity:'existing headless Mike',firstPerson:true,bodyAnchor:[...s.mike],eye:[...s.eye],bodyVisible:actor.root.visible,arms:{L:left,R:right},picking:{active:pick.active,index:pick.index,contact:active.contact,error:actualTip.distanceTo(target.point),surface:'actual distal index skin to deformed forearm triangle',contacts},feet:actor.diagnostics().feet,materialAnchors:support.materialAnchors,fullFaceSupport:support.fullFaceSupport,materialIterations:support.materialIterations,materialConvergence:support.materialConvergence,boundaryCorrections:support.boundaryCorrections,baseFit:support.baseFit,resolvedFootTargets:support.resolvedFootTargets,soleSupport:support.soleSupport,handle:{latchRoll,latchOutboardExtent,surface:'whole-hand support above actual highest handle vertex',extractionVertex:tip.index,latchVertex:latchTip?.index,required:s.doorHand>0,supplied:!!s.passengerHandle,weight:s.doorHand,error:handleError,target:handleTarget,verified:s.doorHand>=1&&handleError!==null&&handleError<=.005},evidence:{visualQA:'NOT RUN',sweptCollision:'NOT RUN',skinSeams:'NOT RUN',footSupport:support.soleSupport.status,measuredPerformance:'UNMEASURED'}};
  return lastReport;
 }
 // Cache releases from the deterministic full raised-arm pose, independent of
 // the first caller timestamp, then restore the exact initial seated sample.
 poseLatchFingers(1);latchTip=chooseWholeHandSupport(arms.R);({angle:latchRoll,extent:latchOutboardExtent}=verifyLatchSupport(arms.R,latchTip));restorePose(arms.R.rest);updateMatrices(root);
 update(sampleRecovery(2));releaseSurfaces=anchors.map(a=>{const s=surface(a);return {point:root.worldToLocal(s.point.clone()).toArray(),normal:s.normal.clone().transformDirection(root.matrixWorld.clone().invert()).toArray()};});update(sampleRecovery(0));
 return {root,update,diagnostics:()=>lastReport,dispose(){if(disposed)return;disposed=true;actor.dispose();for(const resource of [...geometries,...materials,...skeletons])resource.dispose();root.clear();root.removeFromParent();}};
}

// Shared exact complete-shoe support helper; stateless conservative bounds.
// Exact affine surface-height comparison over the common projected footprint.
// Support selection only: full car/terrain collision retains every triangle,
// including vertical faces that cannot supply a single-valued support height.
const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
const xz=p=>[p[0],p[2]];
const minus=(a,b)=>a.map((v,i)=>v-b[i]);
const clip=(poly,distance)=>{const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=distance(a),db=distance(b),ina=da>=-1e-12,inb=db>=-1e-12;if(ina)out.push(a);if(ina!==inb){const u=da/(da-db);out.push(a.map((v,k)=>v+(b[k]-v)*u));}}return out;};
export function projectedSupportGap(shoe,support,{maxSupportY=Infinity}={}){
 const a=support[0],u=minus(support[1],a),v=minus(support[2],a),det=cross(xz(u),xz(v));
 if(Math.abs(det)<1e-12)return null; // A vertical face is still a collision obstacle.
 const height=p=>{const q=minus(p,a),s=cross(xz(q),xz(v))/det,t=cross(xz(u),xz(q))/det;return a[1]+s*u[1]+t*v[1];};
 let overlap=shoe.map(p=>p.slice());
 for(let i=0;i<3&&overlap.length;i++){const e0=xz(support[i]),e=minus(xz(support[(i+1)%3]),e0);overlap=clip(overlap,p=>Math.sign(det)*cross(e,minus(xz(p),e0)));}
 if(Number.isFinite(maxSupportY)&&overlap.length)overlap=clip(overlap,p=>maxSupportY-height(p));
 if(!overlap.length)return null;
 let minimum=null;for(const point of overlap){const y=height(point),gap=point[1]-y;if(!minimum||gap<minimum.gap)minimum={gap,point,height:y};}
 return{...minimum,overlap};
}
export const projectedBounds=p=>({minX:Math.min(...p.map(v=>v[0])),maxX:Math.max(...p.map(v=>v[0])),minZ:Math.min(...p.map(v=>v[2])),maxZ:Math.max(...p.map(v=>v[2]))});
// Stateless conservative prefilter. Invalid/unavailable aggregate bounds retain the original path.
const finiteBounds=b=>b&&Number.isFinite(b.minX)&&Number.isFinite(b.maxX)&&Number.isFinite(b.minZ)&&Number.isFinite(b.maxZ)&&b.minX<=b.maxX&&b.minZ<=b.maxZ;
function wholeShoeBounds(shoeTriangles){
 try{let union=null;for(const s of shoeTriangles){const b=s.bounds||projectedBounds(s.points||s);if(!finiteBounds(b))return null;if(!union)union={minX:b.minX,maxX:b.maxX,minZ:b.minZ,maxZ:b.maxZ};else{union.minX=Math.min(union.minX,b.minX);union.maxX=Math.max(union.maxX,b.maxX);union.minZ=Math.min(union.minZ,b.minZ);union.maxZ=Math.max(union.maxZ,b.maxZ);}}return union;}catch{return null;}
}
export function fullShoeSupport(shoeTriangles,supportTriangles,{maxSupportY=Infinity}={}){
 let minimum=null,overlaps=0;const floor=supportTriangles.map((t,index)=>({t,index,b:t.bounds||projectedBounds(t.points||t)}));
 const union=wholeShoeBounds(shoeTriangles),candidates=union?floor.filter(f=>!finiteBounds(f.b)||!(union.maxX<f.b.minX-1e-12||union.minX>f.b.maxX+1e-12||union.maxZ<f.b.minZ-1e-12||union.minZ>f.b.maxZ+1e-12)):floor;
 for(const[shoeTriangle,s]of shoeTriangles.entries()){const p=s.points||s,b=s.bounds||projectedBounds(p);for(const f of candidates){if(b.maxX<f.b.minX-1e-12||b.minX>f.b.maxX+1e-12||b.maxZ<f.b.minZ-1e-12||b.minZ>f.b.maxZ+1e-12)continue;const result=projectedSupportGap(p,f.t.points||f.t,{maxSupportY});if(!result)continue;overlaps++;if(!minimum||result.gap<minimum.gap)minimum={...result,shoeTriangle:s.index??shoeTriangle,supportTriangle:f.t.index??f.index,supportMesh:f.t.mesh??null};}}
 return minimum?{...minimum,overlapCount:overlaps,shoeTriangleCount:shoeTriangles.length,supportTriangleCount:supportTriangles.length}:null;
}

// Existing rendered-support contract; shared by full-face fitting and floor rays.
// Proposed in-module helper. Mirrors Three's retained rendered-range contract.
export function visibleSupport(mesh){for(let p=mesh;p;p=p.parent)if(!p.visible)return false;return true;}
export function renderedSupportRanges(mesh){
 if(!mesh?.isMesh||!visibleSupport(mesh))return [];
 const geometry=mesh.geometry,position=geometry?.attributes?.position;
 if(!position)throw new Error('Selected support lacks position attribute: '+mesh.name);
 const count=geometry.index?.count??position.count,rawStart=geometry.drawRange.start||0,start=Math.max(0,rawStart),end=Math.min(count,rawStart+(geometry.drawRange.count??Infinity));
 const ranges=Array.isArray(mesh.material)?geometry.groups.filter(group=>mesh.material[group.materialIndex]?.visible).map(group=>[Math.max(start,group.start),Math.min(end,group.start+group.count)]):mesh.material?.visible?[[start,end]]:[];
 return ranges.filter(([lo,hi])=>hi-lo>=3);
}
export const sameSupportRanges=(a,b)=>!!a&&a.length===b.length&&a.every((range,i)=>range[0]===b[i][0]&&range[1]===b[i][1]);

