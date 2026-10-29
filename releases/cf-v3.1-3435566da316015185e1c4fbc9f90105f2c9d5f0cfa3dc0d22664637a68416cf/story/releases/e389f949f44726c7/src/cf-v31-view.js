import {EMPTY_ASSET_VARIANTS,resolveV31Asset} from './cf-v31-asset-variants.js';
export {V31_ASSET_VARIANTS} from './cf-v31-asset-variants.js';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone as cloneSkeleton} from 'three/addons/utils/SkeletonUtils.js';
import {createTexturedPrologueActor} from './prologue-model-actor.js';
import {createPrologueActor} from './prologue-actors.js';
import {attachZombieModel} from './zombie.js';
import {optionalAsset} from './asset-safety.js';
import {createClassroom} from './sadie-classroom.js';
import {wetGroundHeight} from './environment-materials.js';
import {V31_SCENES,V31_LINES} from './cf-v31-scenes.js';
import {GAME_CONFIG} from './game-config.js';

// Functional geometry only. No input, route state, asynchronous work or clock.
const freeze = value => { if(value && typeof value==='object') {Object.values(value).forEach(freeze);Object.freeze(value);} return value; };
// Existing paths only; null denotes the approved primitive/caption representation.
export const V31_ASSETS=freeze(Object.fromEntries([
 ['A01','src/game.js','runtime','look-continue'],
 ['A02','assets/intro/cruiser.glb','model','procedural-cruiser'],
 ['A03','assets/intro/cast-clarence.glb','model','procedural-mike'],
 ['A04','assets/intro/cast-stanley.glb','model','procedural-stanley'],
 ['A05',null,'offscreen','captions'],
 ['A06','assets/intro/roadside-set.glb','model','existing-exterior-silhouette'],
 ['A07',null,'primitive','flat-shell'],
 ['A08','src/sadie-classroom.js','primitive','existing-classroom'],
 ['A09',null,'camera','identity-card'],
 ['A10',null,'staged','three-fixed-views'],
 ['A11','assets/field/zombie.glb','model','static-clone'],
 ['A12',null,'primitive','gray-hand-caption'],
 ['A13','assets/intro/roadside-dog-v2.glb','optional-model','captioned-barks'],
 ['A14',null,'primitive','canvas-panel'],
 ['A15',null,'caption','subtitles'],
 ['A16','assets/intro/projector.glb','model','existing-procedural-projector'],
 ['A17','src/game.js','runtime',null],
 ['A18',null,'primitive','two-silhouettes-caption'],
 ['A19',null,'primitive','historical-shell'],
 ['A20',null,'primitive','plain-period-props'],
 ['A21','src/cf-story-memory.js','ui','subtitles'],
 ['A22','src/asylum-main.js','legacy',null]
].map(([id,path,kind,fallbackKey])=>[id,{path,kind,required:!['A13','A22'].includes(id),fallbackKey,provenance:path?'existing-source':'approved-procedural-or-caption'}])));
const xyz = a => ({x:a[0],y:a[1],z:a[2]});
const farm = {
 FARM_FRONT:[[5.9,0,7],[7.18,1.3,7]], FRONT_DOOR:[[7.18,0,7],[9.05,1.4,7]],
 INTERVIEW_ENTRY:[[7.85,0,7],[10.75,1.5,7.55]], INTERVIEW:[[9.05,0,7],[10.75,1.5,7.55]],
 STANLEY_INTERVIEW:[[10.75,0,7.55],[9.05,1.5,7]], MIKE_INTERVIEW:[[8.5,0,8.65],[10.75,1.5,7.55]],
 KITCHEN_PRIVATE:[[11.8,0,5.35],[11.8,1.15,4.65]], BACK_DOOR:[[13.2,0,7],[15,1.4,7]],
 YARD_EXIT:[[14,0,7],[19,1.3,7]], YARD_RECOVERY:[[15,0,8.6],[14.3,1.2,7.9]],
 PORCH_STANLEY:[[14,0,6.2],[15.15,1.5,7]], FIELD_EDGE:[[19,0,7],[24,1.2,7]],
 SEARCH_BEND:[[24,0,7],[27,1.2,10]], HAND_APPROACH:[[29,0,10],[30.1,.2,10.35]],
};
const anchors={};
for(const [id,[position,target]] of Object.entries(farm)) anchors[id]={id,position:xyz(position),lookTarget:xyz(target),eyeHeight:GAME_CONFIG.player.eyeHeight};
// Reuse the approved 1.15m seated presentation height, not the standing adult preset.
anchors.YARD_RECOVERY.eyeHeight=1.15;
function local(id,p,t,eye){anchors[id]={id,position:{x:p[0],y:0,z:p[2]},lookTarget:xyz(t),eyeHeight:eye};}
local('CLASSROOM',[-.35,0,1.4],[-1.5,1.25,-2.9],.68);
for(const [id,x] of [['CHILDHOOD_FIXED_VIEWS',0],['CHILDHOOD_LEFT',-1],['CHILDHOOD_RIGHT',1]])local(id,[x,0,3.5],[0,1,-3.5],.95);
local('CREATURE_REVEAL',[0,0,3],[-.15,1,-1.2],1.55);
for(const id of ['HISTORICAL_TABLE','HISTORICAL_DESK','HISTORICAL_STORE_COUNTER'])local(id,[0,0,1.5],[0,.75,0],1.15);
export const V31_ANCHORS=freeze(anchors);
export const V31_SET_BINDINGS=freeze({
 FARM_FRONT:{anchors:['FARM_FRONT','FRONT_DOOR'],bounds:{x:[4.8,7.25],z:[5.8,8.2]},missingAssets:['A06 exterior shell']},
 FARM_INTERIOR:{anchors:['INTERVIEW','INTERVIEW_ENTRY','STANLEY_INTERVIEW','MIKE_INTERVIEW','KITCHEN_PRIVATE','BACK_DOOR'],bounds:{x:[7.5,12.9],z:[4.3,9.7]}},
 FARM_YARD:{anchors:['YARD_EXIT','YARD_RECOVERY','PORCH_STANLEY','FIELD_EDGE'],bounds:{x:[13.6,19.8],z:[5.4,10]},missingAssets:['A06 exterior shell']},
 SEARCH_TRAIL:{anchors:['FIELD_EDGE','SEARCH_BEND','HAND_APPROACH'],bounds:{polyline:[[19,7],[24,7],[27,10],[30,10]],halfWidth:.9}},
 CLASSROOM:{anchors:['CLASSROOM'],bounds:{x:[-3.5,3.5],z:[-3,3]}},
 CHILDHOOD_POCKET:{anchors:['CHILDHOOD_FIXED_VIEWS','CHILDHOOD_LEFT','CHILDHOOD_RIGHT'],bounds:{x:[-4,4],z:[-6,6]},missingAssets:['A10 six existing trees','A11 static gray figure']},
 CREATURE_REVEAL:{anchors:['CREATURE_REVEAL'],bounds:{x:[-4,4],z:[-4,4]},missingAssets:['A11 two static creature clones']},
 HISTORICAL_TABLE:{anchors:['HISTORICAL_TABLE'],bounds:{x:[-2.7,2.7],z:[-2.7,2.7]}},
 HISTORICAL_WORK_LUNCH:{anchors:['HISTORICAL_DESK','HISTORICAL_TABLE'],bounds:{x:[-2.7,2.7],z:[-2.7,2.7]}},
 HISTORICAL_DINNER:{anchors:['HISTORICAL_TABLE'],bounds:{x:[-2.7,2.7],z:[-2.7,2.7]}},
 HISTORICAL_STORE:{anchors:['HISTORICAL_STORE_COUNTER'],bounds:{x:[-2.7,2.7],z:[-2.7,2.7]}}
});
// Targets are physical descriptions only. Adapters own edge/facing/scene predicates.
export const V31_INTERACTION_TARGETS=freeze({
 FARM_FRONT:[{id:'FRONT_DOOR',kind:'door',position:{x:7.18,y:1.05,z:7},radius:1.25,requiresFacing:true}],
 FARM_INTERIOR:[{id:'BACK_DOOR',kind:'door',position:{x:13.2,y:1.05,z:7},radius:1.25,requiresFacing:true},{id:'INTERVIEW_TABLE',kind:'table',position:{x:10.15,y:.75,z:8.8},radius:1.5,requiresFacing:true}],
 FARM_YARD:[{id:'FIELD_EDGE',kind:'waypoint',position:{x:19,y:0,z:7},radius:1.25,requiresFacing:false}],
 SEARCH_TRAIL:[{id:'HAND_APPROACH',kind:'clue',position:{x:30.1,y:.035,z:10.35},proximityPoint:{x:29,y:0,z:10},radius:1.25,requiresFacing:true}],
 HISTORICAL_TABLE:[{id:'ENVELOPE',kind:'document',position:{x:0,y:.755,z:0},proximityPoint:{x:0,y:0,z:.375},radius:1.5,requiresFacing:true},{id:'PHOTOS',kind:'photos',position:{x:.35,y:.755,z:0},proximityPoint:{x:0,y:0,z:.375},radius:1.5,requiresFacing:true}],
 HISTORICAL_WORK_LUNCH:[{id:'HISTORICAL_TABLE',kind:'table',position:{x:0,y:.75,z:0},proximityPoint:{x:0,y:0,z:.375},radius:1.5,requiresFacing:true}],
 HISTORICAL_DINNER:[{id:'DINNER_TABLE',kind:'table',position:{x:0,y:.75,z:0},proximityPoint:{x:0,y:0,z:.375},radius:1.5,requiresFacing:true}],
 HISTORICAL_STORE:[{id:'PERIOD_RADIO',kind:'radio',position:{x:.4,y:1,z:0},proximityPoint:{x:0,y:0,z:.275},radius:1.5,requiresFacing:true}]
});
const sameToken=(a,b)=>a&&b&&a.runId===b.runId&&a.sceneId===b.sceneId&&a.entryId===b.entryId;
const outside=id=>['FARM_FRONT','FARM_YARD','SEARCH_TRAIL'].includes(id);
function build(setId){
 const group=new THREE.Scene();group.name=`V31:${setId}`;
 const geometries=new Set(),materials=new Map(),colliders=[],cleanup=[];
 const material=color=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.95}));return materials.get(color);};
 const mesh=(geometry,color,x,y,z)=>{geometries.add(geometry);const m=new THREE.Mesh(geometry,material(color));m.position.set(x,y,z);group.add(m);return m;};
 const box=(name,w,h,d,x,y,z,color=0x8d7961,solid=false)=>{const m=mesh(new THREE.BoxGeometry(w,h,d),color,x,y,z);m.name=name;if(solid)colliders.push({id:name,minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});return m;};
 const chair=(x,z)=>{box('chair seat',.45,.08,.45,x,.44,z,0x8d7961,true);box('chair back',.45,.7,.07,x,.65,z-.2);};
 const table=(x,z)=>box('table',1.4,.75,.75,x,.375,z,0x8d7961,true);
 function shell(x,z,doors){
  box('floor',5.4,.12,5.4,x,-.06,z,0x827c6d);box('ceiling',5.4,.1,5.4,x,2.75,z,0xd8d1bc);
  for(const s of [-1,1]) {box('wall',5.4,2.7,.12,x,1.35,z+s*2.7,0xd8d1bc,true);
   if(doors){for(const dz of [-1.625,1.625])box('door side wall',.12,2.7,2.15,x+s*2.7,1.35,z+dz,0xd8d1bc,true);box('door header',.12,.6,1.1,x+s*2.7,2.4,z,0xd8d1bc);}
   else box('wall',.12,2.7,5.4,x+s*2.7,1.35,z,0xd8d1bc,true);
  }
 }
 group.add(new THREE.HemisphereLight(0xfff4dc,0x65625b,1.5));
 if(setId==='CLASSROOM'){const room=createClassroom();room.setEcho(false);group.add(room.group);cleanup.push(room.dispose);}
 else if(setId==='FARM_INTERIOR'){
  shell(10.2,7,true);table(10.15,8.8);chair(9.35,8.8);chair(10.95,8.8);
  box('counter',1.6,.9,.55,11.65,.45,4.7,0x8d7961,true);box('sink',.45,.01,.3,11.65,.905,4.7,0x343a38);
  const light=new THREE.PointLight(0xffe3b3,8,8);light.position.set(10.2,2.2,7);group.add(light);
 }else if(outside(setId)){
  // Match the existing terrain height function, never a flat floor under raised anchors.
  const ground=new THREE.PlaneGeometry(28,8,56,16);ground.rotateX(-Math.PI/2);ground.translate(18,0,8);const points=ground.attributes.position;for(let i=0;i<points.count;i++)points.setY(i,wetGroundHeight(points.getX(i),points.getZ(i)));points.needsUpdate=true;ground.computeVertexNormals();mesh(ground,0x77715a,0,0,0);
  colliders.push({id:'house exterior',minX:7.5,maxX:12.9,minZ:4.3,maxZ:9.7});
  if(setId==='FARM_YARD'){box('rear door dressing',.06,2.1,1.1,13.2,1.05,7);box('threshold',.8,.08,1.4,13.55,.04,7);const canvas=mesh(new THREE.BufferGeometry(),0x999688,15.8,wetGroundHeight(15.8,9.1),9.1);canvas.geometry.setAttribute('position',new THREE.Float32BufferAttribute([-.9,0,-.6,.9,0,-.6,0,.25,.6, .9,0,-.6,.9,0,.6,0,.25,.6],3));canvas.geometry.computeVertexNormals();}
  if(setId==='SEARCH_TRAIL'){
   const y=wetGroundHeight(30.1,10.35)+.035;box('gray palm',.1,.025,.13,30.1,y,10.35,0x7c7d74);
   [.06,.075,.07,.05].forEach((length,i)=>box('gray finger',.018,.018,length,30.065+i*.023,y,10.285-length/2,0x7c7d74));
   box('gray thumb',.018,.018,.045,30.16,y,10.34,0x7c7d74).rotation.y=-.65;box('covered wrist',.13,.012,.07,30.1,y+.016,10.42,0x77715a);
  }
 }else if(setId.startsWith('HISTORICAL_')){
  shell(0,0,false);
  if(setId==='HISTORICAL_STORE'){
   box('store counter',1.6,.9,.55,0,.45,0,0x8d7961,true);
   for(const y of [1.1,1.65])box('shelf',1.5,.06,.25,0,y,-1.8);
   box('paper bag',.22,.34,.12,-.5,1.07,0,0xb7a17b);
   for(let i=0;i<6;i++)box('unbranded grocery',.14,.23,.12,-.55+(i%3)*.45,1.245+Math.floor(i/3)*.55,-1.8,0xb5ac91);
   box('period radio',.32,.2,.14,.4,1,0,0x584d3d);for(const x of [.31,.49]){const knob=mesh(new THREE.CylinderGeometry(.025,.025,.02,6),0x282722,x,1,.08);knob.rotation.x=Math.PI/2;}
  }else{
   table(0,0);
   if(setId==='HISTORICAL_TABLE'){box('envelope',.24,.005,.16,0,.755,0,0xddd4b9);for(const x of [-.35,.35]){
    box('schematic photo',.18,.005,.12,x,.755,0,0xd7d2b6);
    // Flat field/house silhouettes only; no people, text, dates or legal details.
    box('photo field',.16,.001,.05,x,.758,-.025,0x758062);
    box('photo house silhouette',.045,.001,.035,x,.759,.015,0x655e4d);
    const roof=mesh(new THREE.BufferGeometry(),0x514b40,x,.76,.015);roof.geometry.setAttribute('position',new THREE.Float32BufferAttribute([-.029,0,.016,0,0,.042,.029,0,.016],3));roof.geometry.computeVertexNormals();
   }}
   if(setId==='HISTORICAL_WORK_LUNCH'){box('paper',.21,.005,.3,-.25,.755,0,0xe2dcc9);box('menu',.15,.005,.23,.25,.755,0,0xd4c5a4);}
   if(setId==='HISTORICAL_DINNER'){chair(-.85,0);chair(.85,0);for(const x of [-.4,.4])mesh(new THREE.CylinderGeometry(.11,.11,.01,16),0xd6d2bd,x,.76,0);box('plain jug',.12,.18,.12,0,.84,0,0xa69b81);}
  }
 }else{
  box('pocket ground',8,.12,setId==='CHILDHOOD_POCKET'?12:8,0,-.06,0,0x716c55);
  if(setId==='CREATURE_REVEAL'){box('opening',2.4,.01,1.1,0,.006,-2.5,0x080909);for(const x of [-1.26,1.26])box('opening trim',.12,.04,1.1,x,.02,-2.5,0x4c4c42);const geometry=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.8,.9,-1),new THREE.Vector3(-.25,.65,-1.1),new THREE.Vector3(.3,.6,-1.25),new THREE.Vector3(.8,.7,-1.4)]);geometries.add(geometry);const mat=new THREE.LineBasicMaterial({color:0x5c584c});materials.set('leash',mat);group.add(new THREE.Line(geometry,mat));}
 }
 let disposed=false;
 return {group,colliders,dispose(){if(disposed)return;disposed=true;cleanup.forEach(fn=>fn());geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());group.clear();}};
}

export function createV31View({renderer,camera,assetBindings=EMPTY_ASSET_VARIANTS,assetVariants=assetBindings,gltfLoader=new GLTFLoader(),assetDeadlineMs=8000}={}){
 // No derivatives have been reviewed in this pre-art foundation.
 resolveV31Asset('intro/roadside-set.glb',assetVariants);
 let active=null,disposed=false;
 const requireActive=()=>{if(disposed||!active)throw new Error('V31 view has no active set');};
 function setAnchor(id){requireActive();if(active.setId==='FARM_INTERIOR'&&id==='BACK_DOOR')throw new Error('BACK_DOOR is an occluded exit trigger, not a safe interior body anchor');if(!V31_SET_BINDINGS[active.setId].anchors.includes(id))throw new Error(`Invalid anchor ${id} for ${active.setId}`);const source=V31_ANCHORS[id];const anchor=structuredClone(source);if(outside(active.setId))anchor.position.y=wetGroundHeight(anchor.position.x,anchor.position.z);active.anchor=freeze(anchor);active.cameraApplied=false;if(camera?.position?.set&&camera?.lookAt){camera.rotation.order='YXZ';camera.position.set(anchor.position.x,anchor.position.y+anchor.eyeHeight,anchor.position.z);camera.lookAt(anchor.lookTarget.x,anchor.lookTarget.y,anchor.lookTarget.z);camera.updateMatrixWorld?.(true);active.cameraApplied=true;active.cameraPose=freeze({x:anchor.position.x,y:anchor.position.y,z:anchor.position.z,yaw:camera.rotation.y,pitch:camera.rotation.x,eyeHeight:anchor.eyeHeight});}if(active.readiness)active.readiness=freeze({...active.readiness,anchorId:id,cameraApplied:active.cameraApplied});return active.anchor;}
 function frame(){if(!active||disposed)return null;const {resources,...descriptor}=active;return {...descriptor};}
 function releaseSet(token){if(!active||!sameToken(token,active.token))return false;active.resources.dispose();active=null;return true;}

 function safeBody(player){
  if(!player||!['x','y','z','yaw','pitch'].every(key=>Number.isFinite(player[key])))return false;
  if(Math.abs(player.pitch)>Math.PI/2)return false;
  const {x,y,z}=player,bounds=active.bounds,radius=.25;
  const floor=outside(active.setId)?wetGroundHeight(x,z):0;if(Math.abs(y-floor)>.001)return false;
  if(bounds.polyline){
   let nearest=Infinity;for(let i=1;i<bounds.polyline.length;i++){const a=bounds.polyline[i-1],b=bounds.polyline[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));nearest=Math.min(nearest,Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz));}
   if(nearest>bounds.halfWidth-radius)return false;
  }else if(x<bounds.x[0]||x>bounds.x[1]||z<bounds.z[0]||z>bounds.z[1])return false;
  return !active.colliders.some(c=>x>c.minX-radius&&x<c.maxX+radius&&z>c.minZ-radius&&z<c.maxZ+radius);
 }
 function applyPose(presentation){
  if(!safeBody(presentation.player)||!Number.isFinite(presentation.eyeHeight)||Math.abs(presentation.eyeHeight-active.anchor.eyeHeight)>.000001)throw new Error('V31 camera pose outside safe body/eye-height contract');
  if(!camera?.position?.set||!camera?.rotation?.set)throw new Error('Existing camera required for pose application');
  const p=presentation.player;camera.position.set(p.x,p.y+presentation.eyeHeight,p.z);camera.rotation.set(p.pitch,p.yaw,0,'YXZ');camera.updateMatrixWorld?.(true);
  active.cameraApplied=true;active.cameraPose=freeze({...p,eyeHeight:presentation.eyeHeight});
  active.readiness=freeze({...active.readiness,cameraApplied:true,token:active.token,environmentId:active.setId,anchorId:active.anchor.id});
 }
 function disposeTree(root){
  const gs=new Set(),ms=new Set(),ts=new Set(),ss=new Set();root.traverse(o=>{if(o.geometry)gs.add(o.geometry);for(const m of [].concat(o.material||[])){ms.add(m);for(const v of Object.values(m))if(v?.isTexture)ts.add(v);}if(o.skeleton)ss.add(o.skeleton);});
  ss.forEach(v=>v.dispose());gs.forEach(v=>v.dispose());ms.forEach(v=>v.dispose());ts.forEach(v=>v.dispose());root.removeFromParent();
 }
 async function prepareAssets(owner){
  const owned=new THREE.Group();owned.name='V31 original assets';owner.group.add(owned);
  const previousDispose=owner.resources.dispose;const actorDisposers=[];owner.resources.actorHandles=new Map();
  owner.resources.dispose=()=>{actorDisposers.splice(0).forEach(fn=>fn());disposeTree(owned);previousDispose();};
  const current=()=>active===owner&&!disposed;
  async function load(path){
   const gltf=await optionalAsset(gltfLoader.loadAsync(new URL('../assets/'+resolveV31Asset(path,assetVariants),import.meta.url).href),assetDeadlineMs,g=>disposeTree(g.scene));
   if(!current()){disposeTree(gltf.scene);throw new Error('Stale V31 asset: '+path);}
   if(!gltf?.scene)throw new Error('Missing GLTF scene: '+path);
   // Retain source resources until release; actors clone rigs but share original geometry.
   gltf.scene.visible=false;owned.add(gltf.scene);owner.assetStatus.push({path,status:'loaded'});return gltf;
  }
  const addBox=(parent,w,h,d,x,y,z,color)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.95}));m.position.set(x,y,z);parent.add(m);return m;};
  if(['FARM_FRONT','FARM_YARD'].includes(owner.setId)){
   try{const gltf=await load('intro/roadside-set.glb');gltf.scene.visible=true;}
   catch(error){if(!current())throw error;const shell=new THREE.Group();shell.name='Approved existing exterior silhouette fallback';owned.add(shell);addBox(shell,5.9,4.65,6.4,10.2,2.355,7,0xa99e82);const roof=new THREE.Mesh(new THREE.ConeGeometry(4.6,1.8,4),new THREE.MeshStandardMaterial({color:0x44473f}));roof.position.set(10.2,5.55,7);roof.rotation.y=Math.PI/4;shell.add(roof);addBox(shell,.05,1.9,1,7.22,1.3,7,0x44473f);owner.assetStatus.push({path:'intro/roadside-set.glb',status:'approved-fallback',error:String(error.message)});}
  }
  if(owner.setId==='CHILDHOOD_POCKET'){
   const gltf=await load('intro/background-trees-v1.glb');gltf.scene.updateMatrixWorld(true);const variants=[0,1,2].map(i=>gltf.scene.getObjectByName('Broadleaf_'+i));if(variants.some(v=>!v))throw new Error('Existing tree asset missing Broadleaf_0/1/2');
   [[-3,-4],[-3,4],[3,-4],[3,4],[-2.8,0],[2.8,-1]].forEach(([x,z],i)=>{const tree=new THREE.Group();tree.position.set(x,0,z);tree.name='Childhood existing tree '+i;variants[i%3].traverse(source=>{if(!source.isMesh)return;const mesh=new THREE.Mesh(source.geometry,source.material);mesh.applyMatrix4(source.matrixWorld);tree.add(mesh);});owned.add(tree);});
  }
  if(['CHILDHOOD_POCKET','CREATURE_REVEAL'].includes(owner.setId)||(owner.setId==='SEARCH_TRAIL'&&owner.token.sceneId==='CF-S15')){
   const gltf=await load('field/zombie.glb');const positions=owner.setId==='CHILDHOOD_POCKET'?[[0,0,-3.5]]:owner.setId==='SEARCH_TRAIL'?[[27,wetGroundHeight(27,10),10]]:[[-1.1,0,-1],[.8,-.35,-1.4]];
   for(const [i,p] of positions.entries()){
    const root=new THREE.Group();root.name='Static gray figure '+i;root.position.fromArray(p);root.visible=!['CHILDHOOD_POCKET','SEARCH_TRAIL'].includes(owner.setId);owned.add(root);
    const scene=cloneSkeleton(gltf.scene);scene.visible=true;
    // Cinematic presentation explicitly disables live beams; never tick game/AI.
    attachZombieModel(root,{...gltf,scene},{primary:false,cinematic:true});
   }
  }
  if(owner.setId==='SEARCH_TRAIL'&&owner.token.sceneId==='CF-S15'){
   // Bounded prop cluster beside, never inside, the clear center trail.
   for(let i=0;i<3;i++)addBox(owned,.12,.07,.10,26.7+i*.15,wetGroundHeight(26.7+i*.15,10.8)+.035,10.8,0x6d6d62);
   for(let i=0;i<2;i++)addBox(owned,.35,.025,.025,27.05,wetGroundHeight(27.05,10.9+i*.08)+.013,10.9+i*.08,0x635844);
  }
  for(const binding of owner.actors){
   if(binding.presentation==='offscreen')continue;
   const role=String(binding.role||'').toUpperCase();if(!['MIKE','STANLEY'].includes(role))throw new Error('Unsupported visible V31 actor: '+role);
   const police=role==='MIKE',legacy=police?'clarence':'stanley',name=police?'Mike':'Stanley Yates';let actor;
   try{const gltf=await load('intro/cast-'+legacy+'.glb');actor=createTexturedPrologueActor({name,police,gltf});}
   catch(error){if(!current())throw error;actor=createPrologueActor({name,police});owner.assetStatus.push({path:'intro/cast-'+legacy+'.glb',status:'approved-fallback',error:String(error.message)});}
   const anchorId=binding.anchorId||(owner.setId==='FARM_INTERIOR'?(police?'MIKE_INTERVIEW':'STANLEY_INTERVIEW'):(police?'YARD_EXIT':'PORCH_STANLEY'));
   const anchor=V31_ANCHORS[anchorId];if(!anchor)throw new Error('Unknown actor anchor '+anchorId);
   actor.root.position.set(anchor.position.x,outside(owner.setId)?wetGroundHeight(anchor.position.x,anchor.position.z):anchor.position.y,anchor.position.z);
   actor.root.rotation.y=Math.atan2(anchor.lookTarget.x-anchor.position.x,anchor.lookTarget.z-anchor.position.z);
   actor.root.userData.storyIdentity=police?'mike':'stanley';actor.root.userData.legacyAssetIdentity=legacy;actor.root.name='V31 '+role;
   actor.pose?.({time:0,mode:'standing'});owner.resources.actorHandles.set(role,actor);owned.add(actor.root);if(actor.dispose)actorDisposers.push(()=>actor.dispose());
  }
 }
 return {
  async enterSet({setId,anchorId,period,actors=[],token}){
   if(disposed)throw new Error('V31 view disposed');if(!Object.hasOwn(V31_SET_BINDINGS,setId))throw new Error(`Unknown V31 set ${setId}`);
   if(!token||!Number.isInteger(token.entryId)||!/^CF-S(?:0[1-9]|1[0-9]|2[0-4])$/.test(token.sceneId)||token.runId==null)throw new Error('Invalid V31 entry token');
   const binding=V31_SET_BINDINGS[setId],chosen=anchorId||binding.anchors[0];if(setId==='FARM_INTERIOR'&&chosen==='BACK_DOOR')throw new Error('BACK_DOOR is an exit trigger, not an interior spawn');if(!binding.anchors.includes(chosen))throw new Error(`Invalid anchor ${chosen} for ${setId}`);
   if(active)releaseSet(active.token);
   const resources=build(setId),missingAssets=[...(binding.missingAssets||[])];
   for(const actor of actors)if(actor.presentation!=='offscreen')missingAssets.push(`Actor binding pending: ${actor.role||actor.storyIdentity||'unknown'}`);
   active={setId,period,token:freeze({...token}),actors:freeze(structuredClone(actors)),group:resources.group,resources,anchors:freeze([...binding.anchors]),colliders:freeze(resources.colliders),bounds:binding.bounds,interactionTargets:V31_INTERACTION_TARGETS[setId]||freeze([]),collisionRadius:.25,missingAssets:freeze(missingAssets),ready:false,cue:null,assetStatus:[]};setAnchor(chosen);const owner=active;try{await prepareAssets(owner);}catch(error){if(active===owner){owner.ready=false;owner.error=String(error.message);owner.missingAssets=freeze([String(error.message)]);}throw error;}if(active!==owner||disposed)throw new Error('V31 entry invalidated during asset readiness');owner.missingAssets=freeze([]);owner.ready=owner.cameraApplied===true;owner.readiness=freeze({geometryReady:true,cameraApplied:owner.cameraApplied===true,token:owner.token,environmentId:owner.setId,anchorId:owner.anchor.id});if(!owner.cameraApplied)owner.missingAssets=freeze(['Existing camera not supplied']);return frame();
  },
  setAnchor,
  setCue({cueId,lineId,token}){if(!active||!sameToken(token,active.token))return false;if(typeof cueId!=='string'||!cueId)return false;
   const scene=V31_SCENES[token.sceneId];if(!(scene?.cue_bindings||[]).some(binding=>binding.bound_cue===cueId)&&!(scene?.cues||[]).includes(cueId))return false;
   if(lineId&&!scene.line_ids.includes(lineId))return false;
   const speaker=String(V31_LINES[lineId]?.speaker||'').toUpperCase();for(const [role,actor] of active.resources.actorHandles||[])actor.pose?.({time:0,mode:'standing',speaking:!cueId.startsWith('AFTER_')&&(speaker===role||speaker.startsWith(role+' '))});
   const show=(name,visible)=>{const object=active.group.getObjectByName(name);if(object)object.visible=visible;};
   if(token.sceneId==='CF-S09'&&cueId==='REVEAL')show('Static gray figure 0',true);
   if(token.sceneId==='CF-S13'&&cueId==='AFTER_D06')show('V31 MIKE',false);
   if(token.sceneId==='CF-S15'&&cueId==='D02_TO_D06')show('Static gray figure 0',true);
   if(token.sceneId==='CF-S15'&&cueId==='AFTER_D13')show('V31 STANLEY',false);
   if(token.sceneId==='CF-S21'&&cueId==='INSPECT_ENVELOPE'){show('envelope',false);active.inspectedEnvelope=true;}
   if((token.sceneId==='CF-S12'&&cueId==='AFTER_D03')||(token.sceneId==='CF-S19'&&cueId==='AFTER_D06')||(token.sceneId==='CF-S09'&&cueId==='RETREAT')){active.group.background=new THREE.Color(0x000000);active.group.children.forEach(child=>{child.visible=false;});active.blackout=true;}
   active.cue=freeze({cueId,lineId:lineId||null});return true;},
  frame,
  render(presentation){if(!active||disposed||!sameToken(presentation?.token,active.token))return false;if(presentation.player)applyPose(presentation);if(!camera)throw new Error('Existing camera required');if(renderer)renderer.render(active.group,camera);return true;},
  releaseSet,
  dispose(){if(disposed)return;if(active)releaseSet(active.token);disposed=true;}
 };
}
