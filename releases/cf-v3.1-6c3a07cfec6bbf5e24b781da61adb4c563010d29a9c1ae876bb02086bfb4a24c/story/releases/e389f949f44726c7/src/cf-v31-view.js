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
import {createRoadsideDog,ROADSIDE_DOG} from './roadside-dog.js';
import {prepareCruiser} from './prologue-assets.js';
import {sampleV31Exit,V31_EXIT_SECONDS} from './prologue-performance.js';
import {createDecodedAssetStore} from '../../../../shared/runtime/decoded-asset-store.js';
import {collectVisualResources,createVisualResourceDisposer} from '../../../../shared/runtime/visual-resources.js';
import {runCleanups} from '../../../../shared/runtime/resource-scope.js';

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
const parkedExit=sampleV31Exit(V31_EXIT_SECONDS),carExit=parkedExit.position;
const farm = {
 CAR_EXIT:[[carExit[0],0,carExit[2]],[7.18,1.3,7]],
 STANLEY_FRONT:[[6.85,0,7.85],[5.6,1.5,6.9]], MIKE_FRONT:[parkedExit.driver,[parkedExit.driver[0]+Math.sin(parkedExit.driverYaw),1.5,parkedExit.driver[2]+Math.cos(parkedExit.driverYaw)]],
 FARM_FRONT:[[5.9,0,7],[7.18,1.3,7]], FRONT_DOOR:[[7.18,0,7],[9.05,1.4,7]],
 INTERVIEW_ENTRY:[[7.85,0,7],[10.75,1.5,7.55]], INTERVIEW:[[9.05,0,7],[10.75,1.5,7.55]],
 STANLEY_INTERVIEW:[[10.75,0,7.55],[9.05,1.5,7]], MIKE_INTERVIEW:[[8.5,0,8.65],[10.75,1.5,7.55]],
 GLENDA_INTERVIEW:[[11.3,0,6.3],[9.05,1.4,7]], GLENDA_KITCHEN:[[10.95,0,5.55],[11.8,1.4,5.35]], GLENDA_RECOVERY:[[14.3,0,7.9],[15,1.15,8.6]],
 KITCHEN_PRIVATE:[[11.8,0,5.35],[10.95,1.4,5.55]], BACK_DOOR:[[13.2,0,7],[15,1.4,7]],
 YARD_EXIT:[[14,0,7],[19,1.3,7]], YARD_RECOVERY:[[15,0,8.6],[14.3,1.2,7.9]],
 PORCH_STANLEY:[[14,0,6.2],[15.15,1.5,7]], FIELD_EDGE:[[19,0,7],[24,1.2,7]],
 SEARCH_BEND:[[24,0,7],[27,1.2,10]], HAND_APPROACH:[[29,0,10],[30.1,.2,10.35]],
};
const anchors={};
for(const [id,[position,target]] of Object.entries(farm)) anchors[id]={id,position:xyz(position),lookTarget:xyz(target),eyeHeight:GAME_CONFIG.player.eyeHeight};
// Reuse the approved 1.15m seated presentation height, not the standing adult preset.
anchors.YARD_RECOVERY.eyeHeight=1.15;
// The same existing exit sampler owns both the final cruiser eye and walk-in anchor.
anchors.CAR_EXIT.eyeHeight=carExit[1]-wetGroundHeight(carExit[0],carExit[2]);
function local(id,p,t,eye){anchors[id]={id,position:{x:p[0],y:0,z:p[2]},lookTarget:xyz(t),eyeHeight:eye};}
local('CLASSROOM',[-.35,0,1.4],[-1.5,1.25,-2.9],.68);
for(const [id,x] of [['CHILDHOOD_FIXED_VIEWS',0],['CHILDHOOD_LEFT',-1],['CHILDHOOD_RIGHT',1]])local(id,[x,0,3.5],[0,1,-3.5],.95);
local('CREATURE_REVEAL',[0,0,3],[-.15,1,-1.2],1.55);
for(const id of ['HISTORICAL_TABLE','HISTORICAL_DESK','HISTORICAL_STORE_COUNTER'])local(id,[0,0,1.5],[0,.75,0],1.15);
export const V31_ANCHORS=freeze(anchors);
export const V31_SET_BINDINGS=freeze({
 FARM_FRONT:{anchors:['FARM_FRONT','FRONT_DOOR','CAR_EXIT'],bounds:{x:[1.3,7.25],z:[-1.25,8.2]},missingAssets:['A06 exterior shell']},
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
  // Reuse the room's wood, cloth and repeated box furnishings; preserve both walk-through thresholds.
  box('interview rug',2.8,.018,2.5,10.1,.012,7.25,0x685b4f);
  box('sofa seat',1.2,.38,.65,11.75,.30,9.02,0x686451,true);
  box('sofa back',1.2,.75,.13,11.75,.65,9.35,0x686451);
  for(const x of [11.1,12.4])box('sofa arm',.14,.45,.72,x,.48,9.02,0x686451);
  box('side cabinet',.55,.78,.65,8.02,.39,4.93,0x735e48,true);
  for(const y of [.27,.54])box('cabinet drawer',.56,.022,.61,8.02,y,4.93,0x554837);
  box('window glass',1.8,1.2,.025,10.1,1.65,4.38,0xadb7ac);
  for(const x of [9.17,10.1,11.03])box('window frame',.065,1.3,.07,x,1.65,4.41,0x78684f);
  for(const y of [1,1.65,2.3])box('window frame',1.94,.065,.07,10.1,y,4.41,0x78684f);
  for(const x of [8.99,11.21])box('window curtain',.24,1.5,.10,x,1.55,4.5,0x8a806c);
  box('table notebook',.22,.02,.3,10.2,.77,8.8,0xc3b895);
  mesh(new THREE.CylinderGeometry(.055,.055,.09,10),0xb8b19b,9.8,.805,8.8);
  const windowLight=new THREE.PointLight(0xe3ead1,3.5,6);windowLight.name='Window fill on occupied interview';windowLight.position.set(10.1,1.7,4.9);group.add(windowLight);
  const light=new THREE.PointLight(0xffe3b3,8,8);light.position.set(10.2,2.2,7);group.add(light);
 }else if(outside(setId)){
  // Keep the existing exit pose facing real ground and the reused roadside sky.
  if(setId==='FARM_FRONT')group.background=new THREE.Color(0x19232a);
  // Extend only behind the parked car; retain the original .5m terrain grid.
  const ground=setId==='FARM_FRONT'?new THREE.PlaneGeometry(16,24,32,48):new THREE.PlaneGeometry(28,8,56,16);ground.rotateX(-Math.PI/2);if(setId==='FARM_FRONT')ground.translate(7,0,-2);else ground.translate(18,0,8);const points=ground.attributes.position;for(let i=0;i<points.count;i++)points.setY(i,wetGroundHeight(points.getX(i),points.getZ(i)));points.needsUpdate=true;ground.computeVertexNormals();mesh(ground,0x77715a,0,0,0);
  colliders.push({id:'house exterior',minX:7.5,maxX:12.9,minZ:4.3,maxZ:9.7});
  if(setId==='FARM_FRONT'){colliders.push({id:'parked cruiser body',minX:-1.12,maxX:1.12,minZ:-1.8,maxZ:2.8},{id:'open passenger door',minX:1.1,maxX:2.75,minZ:-.6,maxZ:.55},{id:'tethered dog safe space',minX:3.6,maxX:5.0,minZ:3.05,maxZ:5.05});}
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
   if(setId==='HISTORICAL_TABLE'){
    const envelope=new THREE.Group();envelope.name='envelope';envelope.position.set(0,.755,0);group.add(envelope);
    envelope.add(box('plain envelope face',.24,.005,.16,0,0,0,0xddd4b9));
    const reverse=new THREE.Group();reverse.name='envelope reverse photograph';reverse.visible=false;envelope.add(reverse);
    reverse.add(box('reverse photo border',.21,.001,.135,0,-.0035,0,0xd7d2b6));
    reverse.add(box('reverse photo fields',.19,.001,.115,0,-.0045,0,0x758062));
    for(const z of [-.045,-.025,-.005])reverse.add(box('reverse photo corn rows',.19,.001,.004,0,-.0055,z,0x525d3d));
    reverse.add(box('reverse photo farmhouse',.055,.001,.035,0,-.0055,.027,0x655e4d));
    const reverseRoof=mesh(new THREE.BufferGeometry(),0x514b40,0,-.0065,.027);reverseRoof.geometry.setAttribute('position',new THREE.Float32BufferAttribute([-.035,0,-.016,0,0,-.046,.035,0,-.016],3));reverseRoof.geometry.computeVertexNormals();reverse.add(reverseRoof);
    for(const x of [-.35,.35]){
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
 return {group,colliders,dispose(){if(disposed)return;disposed=true;runCleanups([...cleanup,...[...geometries].map(g=>()=>g.dispose()),...[...materials.values()].map(m=>()=>m.dispose()),()=>group.clear()]);}};
}

export function createV31View({renderer,camera,assetBindings=EMPTY_ASSET_VARIANTS,assetVariants=assetBindings,gltfLoader=new GLTFLoader(),assetDeadlineMs=8000,assetCacheLimit=6,assetCacheBytes=64*1024*1024}={}){
 // No derivatives have been reviewed in this pre-art foundation.
 resolveV31Asset('intro/roadside-set.glb',assetVariants);
 let active=null,disposed=false,arrivalFov=null,loadingSources=0;const queuedSources=[];
 const sourceRefs=new WeakMap(),sourceResources=new WeakMap(),sourceImages=new WeakMap(),imageRefs=new WeakMap(),assetRefs=new WeakMap(),closedImages=new WeakSet(),disposeResource=createVisualResourceDisposer();
 const closeImage=image=>{if(image&&typeof image==='object'&&!closedImages.has(image)){closedImages.add(image);try{image.close?.();}catch{}}};
 function retainSource(gltf){
  if(!gltf?.scene)throw new Error('Missing GLTF scene');
  const resources=collectVisualResources([gltf.scene]);sourceResources.set(gltf,resources);
  assetRefs.set(gltf,(assetRefs.get(gltf)||0)+1);
  for(const resource of resources)sourceRefs.set(resource,(sourceRefs.get(resource)||0)+1);
  const images=new Set([...resources].filter(resource=>resource.isTexture&&resource.image&&typeof resource.image==='object').map(resource=>resource.image));sourceImages.set(gltf,images);
  for(const image of images)imageRefs.set(image,(imageRefs.get(image)||0)+1);
  return gltf;
 }
 function disposeSource(gltf){
  const releases=[];
  for(const resource of sourceResources.get(gltf)||[]){const remaining=(sourceRefs.get(resource)||1)-1;if(remaining)sourceRefs.set(resource,remaining);else{sourceRefs.delete(resource);releases.push(()=>disposeResource(resource));}}
  for(const image of sourceImages.get(gltf)||[]){const remaining=(imageRefs.get(image)||1)-1;if(remaining)imageRefs.set(image,remaining);else{imageRefs.delete(image);releases.push(()=>closeImage(image));}}
  const remaining=(assetRefs.get(gltf)||1)-1;if(remaining)assetRefs.set(gltf,remaining);else{assetRefs.delete(gltf);sourceResources.delete(gltf);sourceImages.delete(gltf);}
  runCleanups([...releases,()=>gltf.scene?.removeFromParent()]);
 }
 function sourceBytes(gltf){
  const buffers=new Set(),images=new Set();let bytes=0;
  const add=value=>{const buffer=value?.array?.buffer||value?.buffer;if(buffer&&!buffers.has(buffer)){buffers.add(buffer);bytes+=buffer.byteLength;}};
  for(const resource of sourceResources.get(gltf)||[]){
   if(resource.isBufferGeometry){for(const attribute of Object.values(resource.attributes))add(attribute.isInterleavedBufferAttribute?attribute.data:attribute);add(resource.index);for(const attributes of Object.values(resource.morphAttributes||{}))for(const attribute of attributes)add(attribute);}
   if(resource.isTexture){const image=resource.image;if(image&&!images.has(image)){images.add(image);if(image.data)add(image.data);else if(Number.isFinite(image.width)&&Number.isFinite(image.height))bytes+=image.width*image.height*4;}}
  }
  for(const clip of gltf.animations||[])for(const track of clip.tracks){add(track.times);add(track.values);}
  return bytes;
 }
 function pumpSources(){
  while(!disposed&&loadingSources<2&&queuedSources.length){
   const job=queuedSources.shift();loadingSources++;
   let loading;try{loading=optionalAsset(gltfLoader.loadAsync(job.url),assetDeadlineMs,gltf=>disposeTree(gltf.scene));}catch(error){loading=Promise.reject(error);}
   Promise.resolve(loading).then(retainSource).then(job.resolve,job.reject).finally(()=>{loadingSources--;pumpSources();});
  }
 }
 const assetStore=createDecodedAssetStore({limit:assetCacheLimit,maxBytes:assetCacheBytes,measure:sourceBytes,
  load:url=>new Promise((resolve,reject)=>{queuedSources.push({url,resolve,reject});pumpSources();}),dispose:disposeSource});
 function cloneSource(gltf){
  const scene=cloneSkeleton(gltf.scene),geometries=new Map(),materials=new Map();
  scene.traverse(object=>{
   // Actor shoe fits and the cruiser alter geometry; isolate all entry buffers
   // so future presentation fits cannot mutate the retained decoded source.
   if(object.geometry){if(!geometries.has(object.geometry))geometries.set(object.geometry,object.geometry.clone());object.geometry=geometries.get(object.geometry);}
   if(object.material){const clone=material=>{if(!materials.has(material))materials.set(material,material.clone());return materials.get(material);};object.material=Array.isArray(object.material)?object.material.map(clone):clone(object.material);}
  });
  return {...gltf,scene,animations:(gltf.animations||[]).map(clip=>clip.clone())};
 }
 const requireActive=()=>{if(disposed||!active)throw new Error('V31 view has no active set');};
 function setAnchor(id){requireActive();if(active.setId==='FARM_FRONT'&&camera&&Number.isFinite(camera.fov)){if(arrivalFov===null)arrivalFov=camera.fov;camera.fov=65;camera.updateProjectionMatrix?.();}if(active.setId==='FARM_INTERIOR'&&id==='BACK_DOOR')throw new Error('BACK_DOOR is an occluded exit trigger, not a safe interior body anchor');if(!V31_SET_BINDINGS[active.setId].anchors.includes(id))throw new Error(`Invalid anchor ${id} for ${active.setId}`);const source=V31_ANCHORS[id];const anchor=structuredClone(source);if(outside(active.setId))anchor.position.y=wetGroundHeight(anchor.position.x,anchor.position.z);active.anchor=freeze(anchor);active.cameraApplied=false;if(camera?.position?.set&&camera?.lookAt){camera.rotation.order='YXZ';camera.position.set(anchor.position.x,anchor.position.y+anchor.eyeHeight,anchor.position.z);camera.lookAt(anchor.lookTarget.x,anchor.lookTarget.y,anchor.lookTarget.z);camera.updateMatrixWorld?.(true);active.cameraApplied=true;active.cameraPose=freeze({x:anchor.position.x,y:anchor.position.y,z:anchor.position.z,yaw:camera.rotation.y,pitch:camera.rotation.x,eyeHeight:anchor.eyeHeight});}if(active.readiness)active.readiness=freeze({...active.readiness,anchorId:id,cameraApplied:active.cameraApplied});return active.anchor;}
 function frame(){if(!active||disposed)return null;const {resources,...descriptor}=active;return {...descriptor,cameraFov:camera?.fov};}
 function releaseSet(token){if(!active||!sameToken(token,active.token))return false;active.resources.dispose();active=null;if(arrivalFov!==null&&camera){camera.fov=arrivalFov;camera.updateProjectionMatrix?.();arrivalFov=null;}return true;}

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
 function validPose(presentation){
  return safeBody(presentation?.player)&&Number.isFinite(presentation.eyeHeight)&&Math.abs(presentation.eyeHeight-active.anchor.eyeHeight)<=.000001;
 }
 function canPlaceBody(presentation){
  return !disposed&&!!active?.ready&&sameToken(presentation?.token,active.token)&&validPose(presentation);
 }
 function applyPose(presentation){
  if(!validPose(presentation))throw new Error('V31 camera pose outside safe body/eye-height contract');
  if(!camera?.position?.set||!camera?.rotation?.set)throw new Error('Existing camera required for pose application');
  const p=presentation.player;camera.position.set(p.x,p.y+presentation.eyeHeight,p.z);camera.rotation.set(p.pitch,p.yaw,0,'YXZ');camera.updateMatrixWorld?.(true);
  active.cameraApplied=true;active.cameraPose=freeze({...p,eyeHeight:presentation.eyeHeight});
  active.readiness=freeze({...active.readiness,cameraApplied:true,token:active.token,environmentId:active.setId,anchorId:active.anchor.id});
 }
 function disposeTree(root){
  const gs=new Set(),ms=new Set(),ts=new Set(),ss=new Set();root.traverse(o=>{if(o.geometry)gs.add(o.geometry);for(const m of [].concat(o.material||[])){ms.add(m);for(const v of Object.values(m))if(v?.isTexture)ts.add(v);}if(o.skeleton)ss.add(o.skeleton);});
  runCleanups([
   ...[...ss,...gs,...ms,...ts].filter(resource=>!sourceRefs.has(resource)).map(resource=>()=>disposeResource(resource)),
   ...[...ts].filter(texture=>!sourceRefs.has(texture)&&texture.image&&!imageRefs.has(texture.image)).map(texture=>()=>closeImage(texture.image)),
   ()=>root.removeFromParent(),
  ]);
 }
 async function prepareAssets(owner){
  const owned=new THREE.Group();owned.name='V31 original assets';owner.group.add(owned);
  const previousDispose=owner.resources.dispose;const actorDisposers=[],assetLeases=[],reserved=new Map();owner.resources.actorHandles=new Map();
  owner.resources.dispose=()=>runCleanups([...actorDisposers.splice(0),()=>disposeTree(owned),...assetLeases.splice(0).map(lease=>()=>lease.release()),previousDispose]);
  const current=()=>active===owner&&!disposed;
  function reserve(path){
   if(!reserved.has(path)){const lease=assetStore.acquire(new URL('../assets/'+resolveV31Asset(path,assetVariants),import.meta.url).href);assetLeases.push(lease);reserved.set(path,lease);}
   return reserved.get(path);
  }
  const wanted=[];
  if(['FARM_FRONT','FARM_YARD'].includes(owner.setId))wanted.push('intro/roadside-set.glb');
  if(owner.setId==='FARM_FRONT')wanted.push('intro/roadside-dog-v2.glb','intro/cruiser.glb');
  if(owner.setId==='CHILDHOOD_POCKET')wanted.push('intro/background-trees-v1.glb');
  if(['CHILDHOOD_POCKET','CREATURE_REVEAL'].includes(owner.setId)||(owner.setId==='SEARCH_TRAIL'&&owner.token.sceneId==='CF-S15'))wanted.push('field/zombie.glb');
  for(const binding of owner.actors)if(binding.presentation!=='offscreen'){
   const role=String(binding.role||'').toUpperCase();if(['MIKE','STANLEY'].includes(role))wanted.push('intro/cast-'+(role==='MIKE'?'clarence':'stanley')+'.glb');
  }
  // Acquisition overlaps at most two cold sources; authored attachment remains
  // in the original deterministic order and every source retains an entry lease.
  for(const path of new Set(wanted))try{reserve(path);}catch{/* The consumer retains its existing fallback/error policy. */}
  async function load(path){
   const lease=reserve(path);
   const source=await lease.ready;
   if(!current()){lease.release();throw new Error('Stale V31 asset: '+path);}
   const gltf=cloneSource(source);
   gltf.scene.visible=false;owned.add(gltf.scene);owner.assetStatus.push({path,status:'loaded',decodedReuse:lease.reused});return gltf;
  }
  const addBox=(parent,w,h,d,x,y,z,color)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.95}));m.position.set(x,y,z);parent.add(m);return m;};
  if(['FARM_FRONT','FARM_YARD'].includes(owner.setId)){
   try{const gltf=await load('intro/roadside-set.glb'),exterior=cloneSkeleton(gltf.scene);exterior.visible=true;exterior.name='Arrival roadside exterior shell';exterior.updateMatrixWorld(true);
    // Match the already-shipped prologue terrain fit on a consumer-owned copy.
    exterior.traverse(o=>{if(!o.isMesh||!o.name.includes('gravel'))return;o.geometry=o.geometry.clone();const positions=o.geometry.attributes.position,inverse=o.matrixWorld.clone().invert(),point=new THREE.Vector3();for(let i=0;i<positions.count;i++){point.fromBufferAttribute(positions,i).applyMatrix4(o.matrixWorld);point.y=wetGroundHeight(point.x,point.z)+.002;point.applyMatrix4(inverse);positions.setXYZ(i,point.x,point.y,point.z);}positions.needsUpdate=true;o.geometry.computeVertexNormals();o.geometry.computeBoundingSphere();});owned.add(exterior);}
   catch(error){if(!current())throw error;const shell=new THREE.Group();shell.name='Approved existing exterior silhouette fallback';owned.add(shell);addBox(shell,5.9,4.65,6.4,10.2,2.355,7,0xa99e82);const roof=new THREE.Mesh(new THREE.ConeGeometry(4.6,1.8,4),new THREE.MeshStandardMaterial({color:0x44473f}));roof.position.set(10.2,5.55,7);roof.rotation.y=Math.PI/4;shell.add(roof);addBox(shell,.05,1.9,1,7.22,1.3,7,0x44473f);owner.assetStatus.push({path:'intro/roadside-set.glb',status:'approved-fallback',error:String(error.message)});}
  }
  if(owner.setId==='FARM_FRONT'){
   const dog=createRoadsideDog(owned,{heightAt:wetGroundHeight});owner.resources.frontDog=dog;actorDisposers.push(()=>dog.dispose());
   try{const gltf=await load('intro/roadside-dog-v2.glb'),scene=cloneSkeleton(gltf.scene);scene.visible=true;dog.accept({...gltf,scene});dog.update({chapter:'walk',time:0,player:{x:carExit[0],z:carExit[2]},reduced:true},true);if(dog.stats.status!=='ready')throw new Error('Existing dog presentation unavailable');}
   catch(error){if(!current())throw error;owner.assetStatus.push({path:'intro/roadside-dog-v2.glb',status:'captioned-barks-fallback',error:String(error.message)});}
   try{const gltf=await load('intro/cruiser.glb'),model=cloneSkeleton(gltf.scene);model.visible=true;const cruiser=prepareCruiser(model);cruiser.update({steer:0,wheelRoll:0},1);model.name='Retained parked arrival cruiser';owned.add(model);owner.resources.parkedCruiser=cruiser;}
   catch(error){if(!current())throw error;owner.assetStatus.push({path:'intro/cruiser.glb',status:'parked-car-unavailable',error:String(error.message)});}
   const porch=new THREE.PointLight(0xd4a466,3.6,6.8,2);porch.name='Arrival porch light';porch.position.set(6.95,2.38,7.75);owned.add(porch);
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
   const role=String(binding.role||'').toUpperCase();if(!['MIKE','STANLEY','GLENDA'].includes(role))throw new Error('Unsupported visible V31 actor: '+role);
   const police=role==='MIKE',glenda=role==='GLENDA',legacy=glenda?'code-native:glenda':police?'clarence':'stanley',name=glenda?'Glenda Yates':police?'Mike':'Stanley Yates';let actor;
   if(glenda){actor=createPrologueActor({name,police:false,profile:'glenda'});owner.assetStatus.push({path:null,role:'GLENDA',status:'code-native'});}
   else try{const gltf=await load('intro/cast-'+legacy+'.glb');actor=createTexturedPrologueActor({name,police,gltf});}
   catch(error){if(!current())throw error;actor=createPrologueActor({name,police});owner.assetStatus.push({path:'intro/cast-'+legacy+'.glb',status:'approved-fallback',error:String(error.message)});}
   const anchorId=binding.anchorId||(glenda?(owner.setId==='FARM_YARD'?'GLENDA_RECOVERY':'GLENDA_INTERVIEW'):owner.setId==='FARM_INTERIOR'?(police?'MIKE_INTERVIEW':'STANLEY_INTERVIEW'):(police?'YARD_EXIT':'PORCH_STANLEY'));
   const anchor=V31_ANCHORS[anchorId];if(!anchor)throw new Error('Unknown actor anchor '+anchorId);
   actor.root.position.set(anchor.position.x,outside(owner.setId)?wetGroundHeight(anchor.position.x,anchor.position.z):anchor.position.y,anchor.position.z);
   actor.root.rotation.y=Math.atan2(anchor.lookTarget.x-anchor.position.x,anchor.lookTarget.z-anchor.position.z);
   actor.root.userData.storyIdentity=glenda?'glenda':police?'mike':'stanley';actor.root.userData.legacyAssetIdentity=legacy;actor.root.name='V31 '+role;
   actor.pose?.({time:0,mode:'standing'});owner.resources.actorHandles.set(role,actor);owned.add(actor.root);if(actor.dispose)actorDisposers.push(()=>actor.dispose());
  }
 }
 // Physics preparation retains the same token, bounds and actual camera authority.
 // Only the presentation owner asks this shared path to issue a GPU draw.
 const speechRole=speaker=>{const role=String(speaker||'').toUpperCase();return role==='STANLEY_QUOTING_SADIE'?'STANLEY':['MIKE','STANLEY','GLENDA'].includes(role)?role:null;};
 function render(presentation,{draw=true}={}){
  if(!active||disposed||!sameToken(presentation?.token,active.token))return false;
  if(presentation.player)applyPose(presentation);if(!camera)throw new Error('Existing camera required');
  if(active.resources.frontDog)active.resources.frontDog.update({chapter:'walk',time:presentation.time||0,player:presentation.player,reduced:true},true);
  if(draw){
   const time=Number.isFinite(presentation.time)?presentation.time:0;active.presentationTime=time;
   const line=Object.hasOwn(presentation,'speechLine')?presentation.speechLine:active.speech?.role?{id:active.speech.lineId,start:active.speech.since}:null;
   const role=line&&speechRole(V31_LINES[line.id]?.speaker),start=Number.isFinite(line?.start)?line.start:0;
   const offset=Object.hasOwn(presentation,'speechLine')?line?.offsetSeconds:time-start;
   const speaking=!!role&&Number.isFinite(offset)&&offset>=0&&(!Number.isFinite(line.end)||time<line.end)&&line.playing!==false;
   const previous=active.presentedSpeechRole;
   for(const [actorRole,actor]of active.resources.actorHandles||[]){
    if(!actor.root.visible)continue;
    if(actorRole==='GLENDA'||(speaking&&actorRole===role)||actorRole===previous)actor.pose?.({time,mode:'standing',speaking:speaking&&actorRole===role,reduced:!!presentation.reduced,performance:{lineId:line?.id,lineOffset:Number.isFinite(offset)?Math.max(0,offset):0}});
   }
   active.presentedSpeechRole=speaking?role:null;
   if(renderer)renderer.render(active.group,camera);
  }
  return true;
 }

 return {
  async enterSet({setId,anchorId,period,actors=[],token,collisionOnly=false}){
   if(disposed)throw new Error('V31 view disposed');if(!Object.hasOwn(V31_SET_BINDINGS,setId))throw new Error(`Unknown V31 set ${setId}`);
   if(!token||!Number.isInteger(token.entryId)||!/^CF-S(?:0[1-9]|1[0-9]|2[0-4])$/.test(token.sceneId)||token.runId==null)throw new Error('Invalid V31 entry token');
   const binding=V31_SET_BINDINGS[setId],chosen=anchorId||binding.anchors[0];if(setId==='FARM_INTERIOR'&&chosen==='BACK_DOOR')throw new Error('BACK_DOOR is an exit trigger, not an interior spawn');if(!binding.anchors.includes(chosen))throw new Error(`Invalid anchor ${chosen} for ${setId}`);
   if(active)releaseSet(active.token);
   const resources=build(setId),missingAssets=[...(binding.missingAssets||[])];
   for(const actor of actors)if(actor.presentation!=='offscreen')missingAssets.push(`Actor binding pending: ${actor.role||actor.storyIdentity||'unknown'}`);
   active={setId,period,collisionOnly:!!collisionOnly,token:freeze({...token}),actors:freeze(structuredClone(actors.length?actors:setId==='FARM_FRONT'&&token.sceneId==='CF-S03'?[{role:'MIKE',anchorId:'MIKE_FRONT'},{role:'STANLEY',anchorId:'STANLEY_FRONT'}]:[])),group:resources.group,resources,anchors:freeze([...binding.anchors]),colliders:freeze(resources.colliders),bounds:binding.bounds,interactionTargets:V31_INTERACTION_TARGETS[setId]||freeze([]),collisionRadius:.25,missingAssets:freeze(missingAssets),ready:false,cue:null,assetStatus:[]};setAnchor(chosen);const owner=active;try{if(!collisionOnly)await prepareAssets(owner);}catch(error){if(active===owner){owner.ready=false;owner.error=String(error.message);owner.missingAssets=freeze([String(error.message)]);}throw error;}if(active!==owner||disposed)throw new Error('V31 entry invalidated during asset readiness');owner.missingAssets=freeze([]);owner.ready=owner.cameraApplied===true;owner.readiness=freeze({geometryReady:true,cameraApplied:owner.cameraApplied===true,token:owner.token,environmentId:owner.setId,anchorId:owner.anchor.id});if(!owner.cameraApplied)owner.missingAssets=freeze(['Existing camera not supplied']);return frame();
  },
  setAnchor,
  setCue({cueId,lineId,token}){if(!active||!sameToken(token,active.token))return false;if(typeof cueId!=='string'||!cueId)return false;
   const scene=V31_SCENES[token.sceneId];if(!(scene?.cue_bindings||[]).some(binding=>binding.bound_cue===cueId)&&!(scene?.cues||[]).includes(cueId))return false;
   if(lineId&&!scene.line_ids.includes(lineId))return false;
   const role=speechRole(V31_LINES[lineId]?.speaker),speaking=!!role&&!cueId.startsWith('AFTER_')&&!cueId.endsWith(':complete');const previous=active.speech?.role;active.speech={role:speaking?role:null,lineId,since:active.presentationTime||0};if(previous&&(!speaking||previous!==role))active.resources.actorHandles?.get(previous)?.pose?.({time:active.presentationTime||0,mode:'standing',speaking:false});
   const show=(name,visible)=>{const object=active.group.getObjectByName(name);if(object)object.visible=visible;};
   if(token.sceneId==='CF-S09'&&cueId==='REVEAL')show('Static gray figure 0',true);
   if(token.sceneId==='CF-S13'&&cueId==='AFTER_D06')show('V31 MIKE',false);
   if(token.sceneId==='CF-S15'&&cueId==='D02_TO_D06')show('Static gray figure 0',true);
   if(token.sceneId==='CF-S15'&&cueId==='AFTER_D13')show('V31 STANLEY',false);
   if(token.sceneId==='CF-S21'&&cueId==='INSPECT_ENVELOPE'&&!active.inspectedEnvelope){
    const envelope=active.group.getObjectByName('envelope'),reverse=envelope?.getObjectByName('envelope reverse photograph');
    if(!envelope||!reverse)throw new Error('Envelope photograph presentation unavailable');
    // Turn the physical document toward Dale without taking over the player camera.
    // Its reverse carries only the existing schematic farm/field shapes: no legal text.
    reverse.visible=true;envelope.position.set(0,1.02,.65);envelope.rotation.x=-Math.PI/2;envelope.scale.setScalar(2.5);
    active.inspectedEnvelope=true;
    active.documentInspection=freeze({targetId:'ENVELOPE',presentation:'envelope-reverse-photo',photoVisible:true,cameraOwnedByPlayer:true});
   }
   if((token.sceneId==='CF-S12'&&cueId==='AFTER_D03')||(token.sceneId==='CF-S19'&&cueId==='AFTER_D06')||(token.sceneId==='CF-S09'&&cueId==='RETREAT')){active.group.background=new THREE.Color(0x000000);active.group.children.forEach(child=>{child.visible=false;});active.blackout=true;}
   active.cue=freeze({cueId,lineId:lineId||null});return true;},
  frame,
  render,
  prepare:presentation=>render(presentation,{draw:false}),
  canPlaceBody,
  releaseSet,
  assetCacheDiagnostics:()=>({...assetStore.diagnostics(),loadingSources,queuedSources:queuedSources.length}),
  dispose(){if(disposed)return;if(active)releaseSet(active.token);disposed=true;for(const job of queuedSources.splice(0))job.reject(new Error('V31 decoded acquisition cancelled'));assetStore.dispose();}
 };
}
