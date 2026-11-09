import * as THREE from 'three';
import {createV31View as createLegacyView} from './cf-v31-view.js';
import {V4_SCENES} from './cf-v4-scenes.js';
import {createWoodlandView} from './cf-v4-woodland-view.js';
import {WOODLAND_LAYOUT} from './cf-v4-woodland.js';
import {createSchoolSet} from './cf-v4-school-set.js';
import {createHorrorSet} from './cf-v4-horror-view.js';
import {HORROR_TIMING} from './cf-v4-scripted-horror.js';
import {createV4BedtimeSet} from './cf-v4-finale.js';
import {canOccupy} from './cf-v4-evasion-geometry.js';
import {wetGroundHeight} from './environment-materials.js';
const clone=v=>v==null?v:structuredClone(v);
const same=(a,b)=>!!a&&!!b&&a.runId===b.runId&&a.sceneId===b.sceneId&&a.entryId===b.entryId;
const customIds=new Set(['V4_WOODLAND','V4_SCHOOL','V4_WAYNE','BEDTIME_HOME']);
/** Existing renderer/camera owner, token-remapping facade and native V4 set host.
 * Geometry-ready is not a visual QA receipt. All new native art needs owner QA.
 */
export function createV31View(options={}){
 const {renderer,camera}=options,base=createLegacyView(options);let active=null,serial=0,disposed=false,fadeLayer=null;
 function drawFade(value){if(!renderer||!(value>0))return;if(!fadeLayer){const scene=new THREE.Scene(),material=new THREE.MeshBasicMaterial({color:0x000000,transparent:true,depthTest:false,depthWrite:false}),geometry=new THREE.PlaneGeometry(2,2);scene.add(new THREE.Mesh(geometry,material));fadeLayer={scene,material,geometry,camera:new THREE.OrthographicCamera(-1,1,1,-1,0,1)};}fadeLayer.material.opacity=Math.max(0,Math.min(1,value));const auto=renderer.autoClear;renderer.autoClear=false;try{renderer.render(fadeLayer.scene,fadeLayer.camera);}finally{renderer.autoClear=auto;}}
 function publicFrame(frame){if(!frame||!active)return null;const {group,resources,...safe}=frame;const out={...safe,token:clone(active.token),readiness:frame.readiness?{...frame.readiness,token:clone(active.token)}:undefined};if(active.eyeOverride){out.anchor={...out.anchor,eyeHeight:active.eyeOverride};if(out.cameraPose)out.cameraPose={...out.cameraPose,eyeHeight:active.eyeOverride};}return out;}
 function frame(){if(!active||disposed)return null;if(!active.custom)return publicFrame(base.frame());const {group,...safe}=active.descriptor;return {...safe,token:clone(active.token),cameraPose:clone(active.cameraPose),cameraFov:camera?.fov};}
 function releaseSet(token){if(!active||!same(token,active.token))return false;const previous=active;active=null;serial++;if(previous.custom)previous.helper.dispose();else{previous.overlay?.dispose();base.releaseSet(previous.baseToken);}return true;}
 function setAnchor(id){if(!active)throw new Error('V4 view has no active set');if(!active.custom){const a=base.setAnchor(id);if(active.eyeOverride){camera.position.y=a.position.y+active.eyeOverride;camera.updateMatrixWorld?.(true);return {...a,eyeHeight:active.eyeOverride};}return a;}
  const anchors=active.helper.anchors||[],anchor=anchors.find(a=>a.id===id)||((active.helper.anchor?.id===id||!id)?active.helper.anchor:null);
  if(!anchor)throw new Error(`Unknown V4 anchor ${id}`);if(!camera?.position?.set||!camera?.lookAt)throw new Error('Existing camera required');
  camera.rotation.order='YXZ';camera.position.set(anchor.position.x,anchor.position.y+anchor.eyeHeight,anchor.position.z);camera.lookAt(anchor.lookTarget.x,anchor.lookTarget.y,anchor.lookTarget.z);camera.updateMatrixWorld?.(true);
  active.cameraPose={...anchor.position,yaw:camera.rotation.y,pitch:camera.rotation.x,eyeHeight:anchor.eyeHeight};
  active.descriptor.anchor=clone(anchor);active.descriptor.cameraApplied=true;active.descriptor.readiness={geometryReady:true,cameraApplied:true,token:clone(active.token),environmentId:active.setId,anchorId:id};return clone(anchor);
 }
 async function enterSet({setId,anchorId,period,actors=[],token,collisionOnly=false,...rest}){
  if(disposed)throw new Error('V4 view disposed');if(!token||!Number.isInteger(token.runId)||!Number.isInteger(token.entryId)||!/^CF-S(?:0[1-9]|[12][0-9]|3[0-2])$/.test(token.sceneId))throw new Error('Invalid V4 token');
  if(active)releaseSet(active.token);const generation=++serial,scene=V4_SCENES[token.sceneId];
  if(!customIds.has(setId)){
   const baseToken={...token,sceneId:scene?.source_scene_id||token.sceneId};const entry={token:clone(token),baseToken,custom:false,setId,eyeOverride:Number.isFinite(scene?.eye_height)?scene.eye_height:null};active=entry;
   const openingCompanion=['CF-S03','CF-S04'].includes(token.sceneId);
   const sourceActors=actors.length?actors:(token.sceneId==='CF-S03'&&setId==='FARM_FRONT'?[{role:'MIKE',anchorId:'MIKE_FRONT'},{role:'STANLEY',anchorId:'STANLEY_FRONT'}]:[]);
   const visibleActors=openingCompanion?sourceActors.map(a=>String(a.role).toUpperCase()==='MIKE'?{...a,role:'CLARENCE'}:a):sourceActors;
   try{const result=await base.enterSet({setId,anchorId,period,actors:visibleActors,token:baseToken,collisionOnly,...rest});if(disposed||active!==entry||serial!==generation)throw new Error('V4 view entry superseded');
    if(!collisionOnly&&['patrol','randall'].includes(scene?.encounter_kind)){
     const ambusher=scene.encounter_kind==='randall'?result.group.getObjectByName('Static gray figure 0'):null;
     entry.overlay=createHorrorSet({kind:scene.encounter_kind,ambusher});
     result.group.add(entry.overlay.group);
    }
    if(entry.eyeOverride&&camera?.position){camera.position.y=result.anchor.position.y+entry.eyeOverride;camera.updateMatrixWorld?.(true);}return publicFrame(result);
   }catch(error){if(active===entry){base.releaseSet(baseToken);active=null;}throw error;}
  }
  const group=new THREE.Scene();group.name=`${setId} native V4`;group.background=new THREE.Color(setId==='V4_WOODLAND'?0x050b0e:0x17191a);
  let helper;
  if(setId==='V4_WOODLAND'){
   group.fog=new THREE.FogExp2(0x0a1315,.027);helper=createWoodlandView({THREE,parent:group,assetBindings:options.assetBindings});
   const anchor={id:anchorId||'WOODLAND_START',position:{...WOODLAND_LAYOUT.spawn,y:0},lookTarget:{x:0,y:.95,z:0},eyeHeight:.95};helper.anchor=anchor;helper.anchors=[anchor];helper.targets=[helper.interactionTarget];
  }else if(setId==='V4_SCHOOL'){
   helper=createSchoolSet({assetBindings:collisionOnly?undefined:options.assetBindings});group.add(helper.group);const sourceAnchor=scene?.encounter_kind==='schoolSetup'?helper.setupAnchor:helper.anchor;helper.anchor={...sourceAnchor,id:anchorId||'SCHOOL_START'};helper.anchors=[helper.anchor,{...helper.setupAnchor,id:'SCHOOL_CLASSROOM'}];helper.targets=[];
  }else if(setId==='V4_WAYNE'){
   helper=createHorrorSet({kind:'wayne'});group.add(helper.group);if(anchorId)helper.anchor={...helper.anchor,id:anchorId};helper.anchors=[helper.anchor];helper.targets=helper.interactionTargets||[];
  }else{helper=createV4BedtimeSet(THREE);group.add(helper.group);if(!Array.isArray(helper.anchors))helper.anchors=Object.entries(helper.anchors).map(([id,a])=>({id,...a}));if(!helper.anchor)helper.anchor=helper.anchors.find(a=>a.id===anchorId)||helper.anchors[0];}
  const colliders=typeof helper.colliders==='function'?helper.colliders():helper.colliders||[];
  active={token:clone(token),custom:true,setId,helper,group,descriptor:{setId,period,token:clone(token),group,colliders,bounds:helper.bounds,interactionTargets:helper.targets||helper.interactionTargets||[],collisionRadius:.25,missingAssets:[],ready:false,requiresVisualQA:true,assetStatus:[{kind:'native-geometry',status:'BUILT_NOT_RENDER_VERIFIED'}]}};
  try{setAnchor(anchorId||helper.anchor.id);active.descriptor.ready=true;return frame();}catch(error){releaseSet(token);throw error;}
 }
 function inward(p){return {...p,token:active.baseToken,...(active.eyeOverride&&p.player?{eyeHeight:base.frame().anchor.eyeHeight}:{})};}
 function canPlaceBody(p){if(!active||disposed||!same(p?.token,active.token))return false;if(!active.custom){if(active.eyeOverride&&Math.abs(p.eyeHeight-active.eyeOverride)>1e-6)return false;if(active.token.sceneId==='CF-S21'){if(!p.player)return false;const a=base.frame()?.anchor?.position;if(!a||Math.hypot(p.player.x-a.x,p.player.z-a.z)>1e-6)return false;}return base.canPlaceBody(inward(p));}
  const body=p.player,anchor=active.descriptor.anchor;
  if(!body||!['x','y','z','yaw','pitch'].every(k=>Number.isFinite(body[k]))||Math.abs(body.y-anchor.position.y)>=1e-6||Math.abs(body.pitch)>Math.PI/2||!Number.isFinite(p.eyeHeight)||Math.abs(p.eyeHeight-anchor.eyeHeight)>=1e-6)return false;
  if(active.token.sceneId==='CF-S32')return Math.hypot(body.x-anchor.position.x,body.z-anchor.position.z)<1e-6;
  return canOccupy(body,{bounds:active.descriptor.bounds,colliders:active.descriptor.colliders},.25);
 }
 function render(p,{draw=true}={}){
  if(p?.encounterOptions)p={...p,...p.encounterOptions,reduced:p.encounterOptions.reducedEffects??p.reduced};
  if(!active||disposed||!same(p?.token,active.token))return false;
  const snapshot=p.encounterSnapshot||p.encounter||p.v4Snapshot||{};
  if(active.token.sceneId==='CF-S19'&&p.player&&snapshot.ambushOrigin&&snapshot.phase!=='patrol'){
   active.overlay?.update(snapshot,{player:p.player,time:p.time||0,reducedEffects:!!p.reduced});
   const result=base.prepare(inward(p));
   if(!result)return false;
   const origin=snapshot.ambushOrigin,seconds=snapshot.phaseTime||0;
   const fall=THREE.MathUtils.clamp((seconds-HORROR_TIMING.randallBite)/.55,0,1);
   const yawOffset=Math.atan2(Math.sin(p.player.yaw-origin.yaw),Math.cos(p.player.yaw-origin.yaw));
   camera.position.y-=.64*fall;
   camera.rotation.y=origin.yaw+THREE.MathUtils.clamp(yawOffset,-.44,.44);
   camera.rotation.x=THREE.MathUtils.lerp(THREE.MathUtils.clamp(p.player.pitch,-.37,.38),-.68,fall);
   if(!p.reduced&&snapshot.phase==='grab')camera.rotation.z=Math.sin(seconds*15)*.022*(snapshot.struggleFeedback||0);
   camera.updateMatrixWorld?.(true);
   return draw?base.render({...inward(p),player:undefined}):true;
  }
  if(!active.custom){active.overlay?.update(snapshot,{player:p.player,time:p.time||0,reducedEffects:!!p.reduced});let result;if(active.eyeOverride&&p.player){if(!canPlaceBody(p))throw new Error('V4 fixed POV body/eye contract failed');
   if(active.token.sceneId==='CF-S21')p={...p,player:{...p.player,yaw:Math.max(-.38,Math.min(.38,p.player.yaw)),pitch:Math.max(-.24,Math.min(.27,p.player.pitch))}};
   result=base.prepare(inward(p));camera.position.y=p.player.y+active.eyeOverride;camera.updateMatrixWorld?.(true);if(draw)result=base.render({...inward(p),player:undefined});}else result=draw?base.render(inward(p)):base.prepare(inward(p));if(draw)drawFade(p.fade);return result;}
  const helper=active.helper;
  if(active.setId==='V4_SCHOOL'){
   active.descriptor.colliders=helper.colliders(snapshot.doors,snapshot.exitUnlocked);
   helper.update(snapshot,{phase:p.phase||(V4_SCENES[active.token.sceneId]?.encounter_kind==='schoolSetup'?'normal':'nightmare'),time:p.time||0,reducedMotion:!!p.reduced});
  }else if(active.setId==='V4_WAYNE')helper.update(snapshot,{player:p.player,time:p.time||0,reducedEffects:!!p.reduced,prelude:!!p.prelude});
  else if(active.setId==='BEDTIME_HOME')helper.update?.({sceneId:active.token.sceneId,returnStartedAt:p.bedtimeReturnStarted,returnedToBed:p.returnedToBed,player:p.player,time:p.time||0,speechLine:p.speechLine,reducedEffects:!!p.reduced});
  let pose=p.player,eye=p.eyeHeight??active.descriptor.anchor.eyeHeight,eyeDrop=0;
  if(active.setId==='V4_SCHOOL'&&p.phase==='reorientation'){const a=helper.setupAnchor,dx=a.lookTarget.x-a.position.x,dz=a.lookTarget.z-a.position.z;pose={...a.position,yaw:Math.atan2(-dx,-dz),pitch:Math.atan2(a.lookTarget.y-a.position.y-a.eyeHeight,Math.hypot(dx,dz))};eye=a.eyeHeight;}
  if(active.setId==='V4_WOODLAND'){
   const safeSnapshot={state:'searching',elapsed:0,escapeElapsed:0,enemy:{...WOODLAND_LAYOUT.enemySpawn},...snapshot};
   eyeDrop=THREE.MathUtils.clamp(safeSnapshot.cameraDrop||0,0,.24)*(p.reduced?.35:1);
   const ride=helper.update(safeSnapshot,{player:p.player,flashlight:p.flashlight!==false,reduced:!!p.reduced,eyeDrop});
   if(ride){pose={...ride.position,yaw:ride.yaw,pitch:ride.pitch};eye=ride.eyeHeight;}
  }
  if(pose){
   const cinematic=active.setId==='V4_WOODLAND'&&['mounted','escaped'].includes(snapshot.state);
   if(!cinematic&&!canPlaceBody({...p,player:pose,eyeHeight:eye}))throw new Error('V4 camera outside safe body contract');
   if(!camera?.position?.set||!camera?.rotation?.set)throw new Error('Existing camera required');camera.position.set(pose.x,pose.y+eye-eyeDrop,pose.z);camera.rotation.set(pose.pitch,pose.yaw,0,'YXZ');camera.updateMatrixWorld?.(true);active.cameraPose={...pose,eyeHeight:eye-eyeDrop};
  }
  if(draw&&renderer){
   if(active.setId==='V4_WAYNE'&&snapshot.phase==='fatal'){
    renderer.setClearColor?.(0x000000,1);
    renderer.clear();
   }else{
    renderer.render(active.group,camera);
    drawFade(active.setId==='V4_WAYNE'&&snapshot.phase==='capture'?Math.max(p.fade||0,THREE.MathUtils.clamp((snapshot.captureProgress-.78)/.22,0,1)):p.fade);
   }
  }
  return true;
 }
 function setCue(event){if(!active||!same(event?.token,active.token))return false;if(!active.custom)return base.setCue({...event,token:active.baseToken});active.descriptor.cue={cueId:event.cueId,lineId:event.lineId||null};return true;}
 return {enterSet,setAnchor,setCue,frame,render,groundHeight:(x,z)=>active&&['FARM_FRONT','FARM_YARD','SEARCH_TRAIL'].includes(active.setId)?wetGroundHeight(x,z):0,prepare:p=>render(p,{draw:false}),canPlaceBody,releaseSet,assetCacheDiagnostics:()=>base.assetCacheDiagnostics(),dispose(){if(disposed)return;if(active)releaseSet(active.token);disposed=true;serial++;base.dispose();fadeLayer?.geometry.dispose();fadeLayer?.material.dispose();fadeLayer=null;}};
}
export {createV31View as createV4View};
