import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createPrologueActor} from './prologue-actors.js';
import {createTexturedPrologueActor} from './prologue-model-actor.js';
import {createPrologueAssets,sampleCruiserLampState} from './prologue-assets.js';
import {createCabinWheel,createEntertainmentRadio,steeringAngle} from './prologue-cabin.js';
import {createPrologueRain} from './prologue-rain.js';
import {performanceFor,samplePrologueWake} from './prologue-performance.js';
import {samplePrologueBodyReach} from './viewmodel-pose.js';
import {createPrologueEquipment} from './scene.js';
import {installHands} from './hands.js';
import {createMikePerformance,createClaranceContactFit,sampleRecovery,sampleMikeCustody} from './asylum-post-crash.js';
import {createIntroVisuals} from './intro-visuals.js';
import {createCornGeometry,createCornSurfaceAtlas,refineCornKit} from './corn-art.js';
import {createVT1RoadsideGround,treatVT1Cruiser,treatVT1Glazing,replaceVT1RoadsideCorn} from './visual-vt1-roadside.js';
import {applyEnvironmentSurface,wetGroundGeometry,wetGroundHeight,createGroundedPuddles} from './environment-materials.js';
import {grassGeometry} from './ground-details.js';
import {createFoliageMotion} from './foliage-motion.js';
import {createRoadsideDog} from './roadside-dog.js';
import {WEST_APPROACH} from './prologue-layout.js';
import {cornClearsParkedCruiser,PARKED_CRUISER_CLEARANCE} from './prologue-clearance.js';
import {attachLiquidMaterial as attachPrologueLiquid} from './liquid-material.js';
import {createAsylumCruiser,box as addBox} from './asylum-cruiser.js';
import {sampleCrash,sampleEncounter,sampleCrashExit,CRASH} from './asylum-crash.js';
import {createCuffs,sampleCustody,poseCustody,poseOfficerCustody,poseArms,fitHandToHandle,bone} from './asylum-custody.js';
import {createField,sampleField} from './asylum-field.js';
import {createVines,vineClosure} from './asylum-vines.js';
import {createHospital,createWound,attendantTreatment,HOSPITAL} from './asylum-hospital.js';
const clamp=value=>Math.max(0,Math.min(1,Number(value)||0));
const smooth=value=>{const t=clamp(value);return t*t*(3-2*t);};
function canvasTexture(kind) {
  if(typeof document==='undefined'){const texture=new THREE.DataTexture(new Uint8Array([92,94,77,255]),1,1);texture.needsUpdate=true;return texture;}
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = kind === 'wood' ? '#494737' : kind === 'road' ? '#353a3c' : '#444238'; ctx.fillRect(0, 0, 128, 128);
  let seed = 7321;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < 1700; i++) {
    const v = Math.floor(30 + random() * 60); ctx.fillStyle = `rgba(${v + 8},${v + 7},${v},${.1 + random() * .35})`;
    const x = random() * 128, y = random() * 128;
    ctx.fillRect(x, y, kind === 'wood' ? .4 + random() : .5 + random() * 2, kind === 'wood' ? 6 + random() * 55 : .5 + random() * 2);
  }
  if (kind === 'wood') for (let i = 0; i < 8; i++) { ctx.fillStyle = 'rgba(12,15,12,.50)'; ctx.fillRect(i * 16, 0, 1, 128); }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(kind === 'wood' ? 1 : 10, kind === 'wood' ? 2 : 24); return texture;
}

function fallbackCorn() {
  const vertices = [];
  const quad = (a,b,c,d) => vertices.push(...a,...b,...c,...a,...c,...d);
  quad([-.02,0,0],[.02,0,0],[.014,2.8,0],[-.014,2.8,0]);
  for (let i=0;i<7;i++) { const s=i%2?1:-1,y=.40+i*.31; quad([0,y,0],[s*.38,y+.34,.04],[s*.78,y+.10,0],[s*.28,y+.13,-.035]); }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3)); geometry.computeVertexNormals(); return geometry;
}


/** Retained leaf set assembly; no legacy opening, live game, room or enemy factory is initialized. */
export function createStoryView(renderer,{loader=new GLTFLoader(),textureLoader=new THREE.TextureLoader(),touch=false}={}){
 let scene=new THREE.Scene(),location=new THREE.Group(),camera=new THREE.PerspectiveCamera(65,1,.035,175),car,road,field,door,wheel,clarence,stanley,sky,headlight,hemi,moon,asylum;
 let assets=null,cruiser=null,roadMaterial=null,woodMaterial=null,roadMist=null,roadsideSet=null,roadsideFallback=null,streetlight=null,policeSpill=[],fallbackLampMaterials=[];
 let dog=null,porchLight=null,puddleMaterial=null,backgroundTrees=null,vt1Ground=null,rain=null,entertainment=null,groundMaterial=null,groundContactUniforms=null;
 let liquidUniforms=[],foliage=createFoliageMotion({playerPush:false}),borrowed=new Set(),ownedTextures=new Set(),disposed=false,loaded=false,attendant=false;
 const groundSupports=[];
 let cuffs=null,wound=null,hospitalWound=null,attendantActor=null,heldGun=null,mikePerformance=null,mikeAssets=[];
 const stats={status:'loading',error:null,trees:{},castRoles:{},frames:0};const skyNormal=new THREE.Color(0x24313d),fogNormal=new THREE.Color(0x202b2b);
 const cornAtlas=createCornSurfaceAtlas();const kitParts=[0,1,2].map(i=>({geometry:createCornGeometry(i),material:new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,side:THREE.DoubleSide,map:cornAtlas.map,normalMap:cornAtlas.normalMap,roughnessMap:cornAtlas.roughnessMap,normalScale:new THREE.Vector2(.72,.72)})}));
 const getCorn=()=>kitParts;
 const gun=new THREE.Group(),torch=new THREE.Group(),knife=new THREE.Group();
 const hands=installHands({gun,torch,knife,placeholders:[],loader});
 const equipment=createPrologueEquipment(renderer,{gun,torch,bodyLoader:loader,radioLoader:loader});
 const titles=createIntroVisuals(renderer,{getCorn,enhanced:true,touch});
 const storyField=createField(),vines=createVines(),hospital=createHospital();scene.add(location);location.add(camera);scene.background=skyNormal.clone();scene.fog=new THREE.Fog(fogNormal.clone(),14,100);
 const standard=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.85,...extra});
 const mesh=(parent,geometry,material,x=0,y=0,z=0,ry=0)=>{const o=new THREE.Mesh(geometry,material);o.position.set(x,y,z);o.rotation.y=ry;parent.add(o);return o;};
 const box=(parent,material,w,h,d,x=0,y=0,z=0,ry=0)=>mesh(parent,new THREE.BoxGeometry(w,h,d),material,x,y,z,ry);
 const group=(parent,x=0,y=0,z=0)=>{const o=new THREE.Group();o.position.set(x,y,z);parent.add(o);return o;};
  function buildCar() {
    car=group(location);car.name='Cruiser interior, passenger on right';
    const vinyl=standard(0x1d2224,{roughness:.68}), rubber=standard(0x101314),trim=standard(0x4f5656,{metalness:.35,roughness:.46}),body=standard(0x939b96,{metalness:.45,roughness:.47});
    const leather=standard(0x333736,{roughness:.85}),glass=standard(0x9bb5bc,{transparent:true,opacity:.055,roughness:.14,metalness:.05,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true});
    box(car,vinyl,1.72,.22,1.15,0,.68,-.91);box(car,vinyl,1.6,.09,.42,0,.77,-1.20);
    box(car,rubber,1.65,.055,2.6,0,.02,.12);box(car,vinyl,.25,.38,1.05,0,.28,-.19);
    box(car,body,1.83,.065,1.52,0,1.47,.32);box(car,vinyl,1.85,.07,.095,0,1.44,-.53);
    for(const x of [-.86,.86]) {
      const pillar=box(car,vinyl,.065,.79,.07,x,1.10,-.79);pillar.rotation.x=-.40;
      box(car,vinyl,.058,.62,.095,x,1.18,.79);
      box(car,body,.09,.50,2.10,x,.27,.1);
      for(let i=0;i<7;i++)box(car,rubber,.032,.005,.06,x<0?-.67+i*.05:.26+i*.05,.802,-.99);
    }
    const windshield=mesh(car,new THREE.PlaneGeometry(1.62,.67),glass,0,1.11,-.84);windshield.name='Fallback windshield';windshield.rotation.x=-.40;
    rain=createPrologueRain(location,car,{touch});rain.attachWindshield(windshield);
    const rearview=box(car,rubber,.29,.102,.035,0,1.37,-.66);box(rearview,standard(0x4a6269,{metalness:.85,roughness:.22}),.25,.07,.007,0,0,.023);
    for(const x of [-.45,.50]) {
      box(car,leather,.58,.17,.57,x,.33,.26);const back=box(car,leather,.59,.64,.13,x,.67,.58);back.rotation.x=-.10;
      box(car,leather,.28,.17,.11,x,1.08,.62);
      for(let i=0;i<5;i++)box(car,vinyl,.002,.44,.005,x-.19+i*.095,.70,.501);
      box(car,rubber,.035,.14,.03,x+(x<0?.33:-.33),.38,.29);
    }
    // Analog instruments and muted radio light belong to the set, not the HUD.
    const glow=new THREE.MeshBasicMaterial({color:0x738f74}), redGlow=new THREE.MeshBasicMaterial({color:0xa26042});
    box(car,rubber,.47,.17,.027,-.43,.785,-.79);box(car,rubber,.27,.155,.035,.045,.735,-.735);
    for(const x of [-.55,-.31]) {mesh(car,new THREE.CircleGeometry(.065,24),glow,x,.80,-.767);mesh(car,new THREE.CircleGeometry(.057,24),vinyl,x,.80,-.763);const needle=box(car,glow,.003,.049,.003,x,.812,-.758);needle.rotation.z=-.7;}
    box(car,glow,.14,.026,.008,.045,.766,-.711);for(let i=0;i<5;i++)box(car,redGlow,.021,.008,.005,-.039+i*.042,.714,-.711);
    const fitted=createCabinWheel();car.add(fitted.assembly);wheel=fitted.steering;
    entertainment=createEntertainmentRadio();car.add(entertainment.group);
    door=group(car,.86,.45,-.52);box(door,vinyl,.065,.40,1.13,0,-.10,.54);box(door,trim,.10,.035,.33,-.055,.02,.49);box(door,rubber,.08,.035,.17,-.055,.035,.27);
    box(car,vinyl,.065,.42,1.13,-.85,.36,.02);box(car,trim,.09,.035,.33,-.78,.48,.04);
    box(car,body,1.80,.16,1.04,0,.63,-1.85);box(car,body,1.87,.24,.40,0,.42,1.40);
    const dome=new THREE.PointLight(0xe6c49d,.48,2.5,2);dome.position.set(0,1.36,.30);car.add(dome);
    headlight=new THREE.SpotLight(0xffdfa8,6,31,.47,.65,1.3);headlight.name='Cruiser forward headlight spill';headlight.position.set(0,.78,-2.39);headlight.target.position.set(0,0,-20);car.add(headlight,headlight.target);
    const lampLens=standard(0xd9d6bc,{emissive:0xffe4b5,emissiveIntensity:1.8,roughness:.23});
    for(const x of [-.65,.65]){const lens=box(car,lampLens,.28,.085,.023,x,.71,-2.385);lens.name='Fallback illuminated front lamp';}
    box(car,trim,1.27,.055,.26,0,1.50,.85);
    for(const side of [-1,1]){
      const color=side<0?0xa01d26:0x205ba2,material=standard(color,{emissive:color,emissiveIntensity:.35,roughness:.25});fallbackLampMaterials.push(material);
      const lens=box(car,material,.47,.085,.20,side*.34,1.565,.85);lens.name=side<0?'Fallback red lightbar lens':'Fallback blue lightbar lens';
      const spill=new THREE.PointLight(color,0,5.3,2);spill.name=side<0?'Cruiser restrained red spill':'Cruiser restrained blue spill';spill.position.set(side*.48,1.62,.68);spill.castShadow=false;car.add(spill);policeSpill.push(spill);
    }
  }
  function buildLandscape() {
    const groundMap=canvasTexture('earth'), roadMap=canvasTexture('road'),woodMap=canvasTexture('wood');ownedTextures.add(groundMap);ownedTextures.add(roadMap);ownedTextures.add(woodMap);
    const earth=standard(0x77715e,{map:groundMap}),asphalt=standard(0x646a6e,{map:roadMap}),wood=standard(0x8f8b74,{map:woodMap}),post=standard(0x4f5145);
    groundMaterial=earth;earth.color.setHex(0xa29b88);earth.normalScale.set(.54,.54);groundContactUniforms=applyEnvironmentSurface(earth,{kind:'mud',terrainProfile:true});
    vt1Ground=createVT1RoadsideGround(earth);
    woodMaterial=wood;wood.normalScale.set(.35,.35);
    roadMaterial=asphalt;asphalt.color.setHex(0xabb0b1);asphalt.normalScale.set(.33,.33);applyEnvironmentSurface(asphalt,{kind:'mud'});
    const ground=mesh(location,wetGroundGeometry(),earth);ground.name='Continuous graded mud, verge and shallow hollows';groundSupports.push(ground);
    puddleMaterial=standard(0x343d36,{roughness:.24,metalness:.30,transparent:true,opacity:.82,depthWrite:false});
    location.add(createGroundedPuddles(puddleMaterial));
    road=group(location);road.position.x=-4.3;road.name='Continuous roadside';
    const roadPlane=mesh(road,new THREE.PlaneGeometry(6.7,600,2,60),asphalt,0,-.01,120);roadPlane.rotation.x=-Math.PI/2;groundSupports.push(roadPlane);
    const lane=standard(0x8e8762),edge=standard(0x8b9290),reflector=new THREE.MeshBasicMaterial({color:0xa5ae96});
    const markers=new THREE.InstancedMesh(new THREE.BoxGeometry(.07,.006,3.2),lane,160),dummy=new THREE.Object3D();
    for(let i=0;i<80;i++)for(let j=0;j<2;j++){dummy.position.set(j?.10:-.10,0,-176+i*7.5);dummy.scale.set(1,.8,.72+.28*(.5+.5*Math.sin(i*12.7)));dummy.updateMatrix();markers.setMatrixAt(i*2+j,dummy.matrix);}markers.computeBoundingSphere();road.add(markers);
    dummy.scale.setScalar(1);
    for(const x of [-3.1,3.1])box(road,edge,.075,.004,600,x,0,120);
    for(let i=0;i<36;i++)for(const side of [-1,1]){
      const z=-100+i*15,x=side*4.8;box(road,post,.08,1.2,.08,x,.60,z);box(road,reflector,.11,.09,.025,x,1.02,z+.05);
      if(i%3===0){box(road,post,.14,7.5,.14,side*7.1,3.75,z);box(road,post,2.2,.07,.09,side*7.1,7.0,z);}
    }
    field=group(location,0,0,WEST_APPROACH.centerZ);field.rotation.y=WEST_APPROACH.fieldYaw;field.name='Westward cornfield approach and threshold';field.updateMatrix();road.updateMatrix();
    const sources=getCorn();let parts=sources?.length?sources:null;
    if(parts) {for(const item of parts){borrowed.add(item.geometry);for(const mat of Array.isArray(item.material)?item.material:[item.material])borrowed.add(mat);}stats.corn='borrowed game corn';}
    else {parts=[{geometry:fallbackCorn(),material:standard(0x56623b,{side:THREE.DoubleSide})}];stats.corn='original procedural fallback';}
    const total=touch?420:680,count=Math.ceil(total/parts.length);
    for(let part=0;part<parts.length;part++){
      const source=parts[part],material=Array.isArray(source.material)?source.material.map(m=>foliage.material(m)):foliage.material(source.material),plants=new THREE.InstancedMesh(source.geometry,material,count);plants.name='Borrowed corn, own instance buffer';
      // Fallback source material is replaced by the owned wind clone; borrowed
      // kit geometry, textures and source materials remain untouched.
      if(!sources?.length)source.material.dispose();
      let planted=0;
      for(let i=0;i<count;i++){
        const n=i*parts.length+part,side=n%2?1:-1,row=Math.floor(n/2),z=WEST_APPROACH.entranceX-(row%48)*1.08;
        const x=side*(2.10+Math.floor(row/48)*.95+(Math.sin(n*42.4)*.5+.5)*.35);
        const contact=new THREE.Vector3(x,0,z).applyMatrix4(field.matrix);dummy.position.set(x,wetGroundHeight(contact.x,contact.z)-.018,z);dummy.rotation.set(0,Math.sin(n*31.7)*Math.PI,Math.sin(n*7.3)*.018);dummy.scale.setScalar(.90+Math.sin(n*8.1)*.11);dummy.updateMatrix();
        if(cornClearsParkedCruiser(source.geometry,dummy.matrix,field.matrix))plants.setMatrixAt(planted++,dummy.matrix);
      }plants.count=planted;plants.computeBoundingSphere();plants.boundingSphere.radius+=PARKED_CRUISER_CLEARANCE.sway;field.add(plants);
      const roadsideCount=Math.ceil((touch?180:300)/parts.length),roadside=new THREE.InstancedMesh(source.geometry,material,roadsideCount);
      let roadsidePlanted=0;
      for(let i=0;i<roadsideCount;i++){
        const n=i*parts.length+part,side=n%2?1:-1,row=Math.floor(n/2);
        const behind=n>=(touch?120:210),px=behind?19.8+(n%5)*.94:side*(5.4+Math.floor(row/150)*1.1),pz=behind?2.1+Math.floor((n-(touch?120:210))/5)*.78:-105+(row%150)*3.5;const contact=new THREE.Vector3(px,0,pz).applyMatrix4(road.matrix);if(contact.x>-.5&&contact.x<14.7&&contact.z>-1&&contact.z<13)continue;dummy.position.set(px,wetGroundHeight(contact.x,contact.z)-.018,pz);dummy.rotation.set(0,Math.sin(n*7.31)*Math.PI,0);dummy.scale.setScalar(.9+Math.sin(n*4.17)*.1);dummy.updateMatrix();if(cornClearsParkedCruiser(source.geometry,dummy.matrix,road.matrix))roadside.setMatrixAt(roadsidePlanted++,dummy.matrix);
      }roadside.count=roadsidePlanted;roadside.name='Roadside corn with door and leaf clearance';roadside.computeBoundingSphere();roadside.boundingSphere.radius+=PARKED_CRUISER_CLEARANCE.sway;road.add(roadside);
    }
    // A restrained opening in the same wood-panel vocabulary as the live maze.
    for(const side of [-1,1]) {
      box(field,wood,.10,2.65,10,side*1.42,1.325,-56);
      for(let z=-51;z>=-61;z-=2)box(field,post,.15,2.73,.16,side*1.40,1.365,z);
      for(const y of [.55,1.95])box(field,post,.16,.10,10,side*1.37,y,-56);
    }
    roadsideSet=group(location);roadsideSet.name='Rural house driveway mailbox and streetlight';roadsideFallback=group(roadsideSet);roadsideFallback.name='Roadside load-failure silhouette';
    const rural=standard(0x454b41),dark=standard(0x151e20),warm=standard(0xc59150,{emissive:0xd8a15c,emissiveIntensity:.4});
    box(roadsideFallback,rural,5.9,4.65,6.4,10.2,2.355,7);
    const roof=mesh(roadsideFallback,new THREE.ConeGeometry(4.6,1.8,4),dark,10.2,5.55,7);roof.rotation.y=Math.PI/4;
    box(roadsideFallback,dark,.05,1.9,1,7.22,1.3,7);box(roadsideFallback,dark,1.6,.12,4.6,6.46,2.76,7);
    box(roadsideFallback,rural,.12,1.09,.12,1.62,.545,4.14);box(roadsideFallback,dark,.48,.25,.30,1.57,1.23,4.14);
    box(roadsideFallback,dark,.13,4.48,.13,3.02,2.24,3.75);box(roadsideFallback,warm,.34,.10,.52,3.02,4.44,4.61);
    streetlight=new THREE.PointLight(0xe7b976,4.6,10.5,2);streetlight.name='Bounded warm driveway streetlight';streetlight.position.set(3.02,4.38,4.61);streetlight.castShadow=false;roadsideSet.add(streetlight);
    porchLight=new THREE.PointLight(0xffcd8b,3.6,6.8,2);porchLight.name='Warm porch light on boards and ground';porchLight.position.set(6.95,2.38,7.75);porchLight.castShadow=false;roadsideSet.add(porchLight);
    dog=createRoadsideDog(roadsideSet,{heightAt:wetGroundHeight});
    const verge=new THREE.InstancedMesh(grassGeometry(),standard(0x66684b,{vertexColors:true,side:THREE.DoubleSide,roughness:.96}),100);verge.name='Graded verge grass and fallen husks';
    for(let i=0;i<100;i++){const x=i<50?-.72+(i%10)*.66:-10.2-Math.floor(i/10)*1.9,z=i<50?3.5+Math.floor(i/10)*1.03:-8.1+(i%10)*.68;dummy.position.set(x,wetGroundHeight(x,z)+.002,z);dummy.rotation.set(0,i*2.399,0);dummy.scale.setScalar(.62+.3*Math.sin(i*8.1)**2);dummy.updateMatrix();verge.setMatrixAt(i,dummy.matrix);}verge.computeBoundingSphere();location.add(verge);
    backgroundTrees=group(location);backgroundTrees.name='Original broadleaf near middle and far backdrop';
    stats.trees={status:'loading',instances:0,draws:0};
    const lamp=new THREE.PointLight(0xe7b976,.72,7,2);lamp.position.set(-1.3,2.0,-50.8);field.add(lamp);
    const lantern=standard(0xba9d6a,{emissive:0xc5883a,emissiveIntensity:.6});box(field,post,.19,.28,.16,-1.28,2.0,-50.7);box(field,lantern,.115,.15,.01,-1.28,2.0,-50.60);
  }
  function loadSetAssets(){
    const treat=object=>object.traverse(item=>{for(const mat of [item.material].flat().filter(Boolean))if(mat.isMeshStandardMaterial)liquidUniforms.push(attachPrologueLiquid(mat));});
    assets=createPrologueAssets({gltfLoader:loader,textureLoader,
      onRoadside(gltf){gltf.scene.updateMatrixWorld(true);gltf.scene.traverse(o=>{if(!o.isMesh||!o.name.includes('gravel'))return;groundSupports.push(o);const p=o.geometry.attributes.position,inv=o.matrixWorld.clone().invert(),v=new THREE.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);v.y=wetGroundHeight(v.x,v.z)+.002;v.applyMatrix4(inv);p.setXYZ(i,v.x,v.y,v.z);}p.needsUpdate=true;o.geometry.computeVertexNormals();o.geometry.computeBoundingSphere();});roadsideFallback.visible=false;gltf.scene.name='Original roadside exterior shell';roadsideSet.add(gltf.scene);treatVT1Glazing(gltf.scene,puddleMaterial?.envMap);treat(gltf.scene);},
      onCar(gltf){
        asylum=createAsylumCruiser(gltf);const prepared=asylum.car;
        treatVT1Cruiser(prepared.model,puddleMaterial?.envMap);
        prepared.model.traverse(o=>{for(const m of [o.material].flat().filter(Boolean))for(const value of Object.values(m))if(value?.isTexture&&!assets?.owns(value))ownedTextures.add(value);});
        for(const child of car.children)if(!child.isLight&&child!==headlight.target&&child!==entertainment.group)child.visible=false;
        cruiser=prepared;car.add(asylum.root);treat(cruiser.model);headlight.position.set(0,.81,-1.49);
        rain.attachWindshield(cruiser.model.getObjectByName('BodyWindshield'));
      },
      onCast(role,gltf){
        // Each optional role arrives independently; a missing asset retains only
        // that role's procedural fallback. Never replace the other identity.
        const police=role==='clarence';if(!police&&role!=='stanley')return;
        const name=police?'Clarence':'Stanley Yates',old=police?clarence:stanley;
        const actor=createTexturedPrologueActor({name,police,gltf,onMaterial:mat=>liquidUniforms.push(attachPrologueLiquid(mat))});
        actor.root.position.copy(old.root.position);actor.root.quaternion.copy(old.root.quaternion);actor.root.scale.copy(old.root.scale);actor.root.visible=old.root.visible;
        // Keep the hidden fallback owned by this set for deterministic teardown.
        old.root.visible=false;actor.root.add(old.root);location.add(actor.root);
        if(police)clarence=actor;else stanley=actor;
        stats.cast='Distinct Clarence and Stanley identities, adapted from CC0 NPC male Steve';
        stats.castRoles[role]=`cast-${role}.glb`;
      },
      onGround(key,map){groundMaterial[key]=map;groundMaterial.needsUpdate=true;},
      onRoadsideCorn(gltf){stats.roadsideCorn=replaceVT1RoadsideCorn(road,gltf,foliage);for(const batch of road.children)if(batch.userData.cornfieldsVT1)treat(batch);},
      onDog(gltf){dog.accept(gltf);treat(gltf.scene);},
      onTrees(gltf){
        gltf.scene.updateMatrixWorld(true);
        const variants=[0,1,2].map(i=>gltf.scene.getObjectByName('Broadleaf_'+i));
        if(variants.some(v=>!v)){stats.trees.status='failed';return;}
        const matrix=new THREE.Object3D();
        for(const [variant,root]of variants.entries())root.traverse(source=>{
          if(!source.isMesh)return;
          const geometry=source.geometry.clone();geometry.applyMatrix4(source.matrixWorld);
          const material=source.material;material.alphaTest=material.transparent?.45:0;material.transparent=false;material.depthWrite=true;material.side=THREE.DoubleSide;material.needsUpdate=true;
          const batch=new THREE.InstancedMesh(geometry,material,5);batch.name=source.name+' | depth-batched';
          for(let i=0;i<5;i++){
            const x=[17,28,49,-32,-57][i]+variant*4.1,z=[12,-17,-34,18,-22][i]+variant*7.3;
            matrix.position.set(x,wetGroundHeight(x,z),z);matrix.rotation.set(0,variant*.8+i*1.71,0);matrix.scale.setScalar(.82+.25*Math.sin(i*3.1+variant)**2);matrix.updateMatrix();batch.setMatrixAt(i,matrix.matrix);
          }
          batch.computeBoundingSphere();backgroundTrees.add(batch);stats.trees.draws++;
        });
        stats.trees.status='ready';stats.trees.instances=15;treat(backgroundTrees);
      },
      onSky(map){if(puddleMaterial){puddleMaterial.envMap=map;puddleMaterial.envMap.mapping=THREE.EquirectangularReflectionMapping;puddleMaterial.envMapIntensity=.30;puddleMaterial.needsUpdate=true;}if(cruiser)treatVT1Cruiser(cruiser.model,map);if(roadsideSet)treatVT1Glazing(roadsideSet,map);sky.material.uniforms.skyMap.value=map;sky.material.uniforms.hasMap.value=1;},
      onRoad(key,map){roadMaterial[key]=map;roadMaterial.needsUpdate=true;},
      onWood(key,map){woodMaterial[key]=map;if(key==='map')woodMaterial.color.setHex(0xffffff);woodMaterial.needsUpdate=true;},
      onMist(map){
        roadMist=group(location);roadMist.name='Low roadside mist';
        const material=new THREE.MeshBasicMaterial({map,transparent:true,opacity:.11,depthWrite:false,side:THREE.DoubleSide,color:0x819397});
        const geometry=new THREE.PlaneGeometry(20,3);
        for(let i=0;i<(touch?3:6);i++){const sheet=mesh(roadMist,geometry,material,0,.7,0);sheet.userData.index=i;}
      },
    });
  }

 buildLandscape();roadsideSet.position.z=CRASH.frontageOffsetZ;buildCar();clarence=createPrologueActor({name:'Clarence',police:true});stanley=createPrologueActor({name:'Stanley Yates',police:false});location.add(clarence.root,stanley.root);
 hemi=new THREE.HemisphereLight(0xa9b8c4,0x303021,1.12);scene.add(hemi);moon=new THREE.DirectionalLight(0xb3c9db,1.85);moon.position.set(-5,9,3);scene.add(moon);
    sky=new THREE.Mesh(new THREE.SphereGeometry(155,24,12),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{red:{value:0},liquid:{value:0},clock:{value:0},skyMap:{value:null},hasMap:{value:0}},vertexShader:'varying vec3 vWorld; void main(){vWorld=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 vWorld; uniform float red,liquid,clock,hasMap;uniform sampler2D skyMap; void main(){vec3 n=normalize(vWorld);float h=smoothstep(-.1,.6,n.y+liquid*sin(n.x*18.+n.z*11.+clock*.7)*.10);vec3 dusk=mix(vec3(.16,.20,.21),vec3(.021,.035,.064),h);vec3 blood=mix(vec3(.29,.048,.024),vec3(.080,.008,.009),h);vec3 color=mix(dusk,blood,red);color=mix(color,vec3(.17,.29,.28)+color*.3,liquid*.5);vec2 skyUV=vec2(atan(n.z,n.x)/6.2831853+.625,asin(clamp(n.y,-1.,1.))/3.14159265+.5);vec3 photo=texture2D(skyMap,skyUV).rgb;float veil=.5+.5*sin(n.x*5.+sin(n.z*7.+clock*.014)+n.y*9.);color=mix(color,mix(photo*.75,color,.28+veil*.21),hasMap*(1.-red*.7));gl_FragColor=vec4(color,1.);}' }));location.add(sky);

 const poleMat=standard(0x4a4437);const pole=mesh(location,new THREE.CylinderGeometry(.16,.20,8,12),poleMat,...[CRASH.pole[0],4,CRASH.pole[2]]);pole.name='Single standing telephone pole';pole.visible=false;
 box(pole,poleMat,2.1,.11,.14,0,3.2,0);
 storyField.root.position.set(8,0,-15);location.add(storyField.root);storyField.root.add(vines.root);storyField.root.visible=false;hospital.root.visible=false;scene.add(hospital.root);
 loadSetAssets();
 function readyAssets(){return new Promise((resolve,reject)=>{const start=Date.now();function poll(){if(disposed)return reject(new Error('Disposed load'));const keys=['car','cast','road','mist','roadside','roadsideCorn','dog','trees','sky','ground:map','ground:normalMap','ground:roughnessMap'];if(keys.some(k=>assets.stats[k]==='fallback'))return reject(new Error('Critical retained asset failed: '+keys.filter(k=>assets.stats[k]==='fallback').join(', ')));if(keys.every(k=>assets.stats[k]==='ready'))return resolve();if(Date.now()-start>9500)return reject(new Error('Critical retained asset deadline'));setTimeout(poll,35);}poll();});}
 let claranceContactFit;
 const ready=Promise.all([readyAssets(),hands.ready]).then(async()=>{
  if(disposed)throw new Error('Disposed load');if(hands.stats.status!=='ready'||hands.stats.flashlightStatus!=='ready')throw new Error('Critical hands/flashlight unavailable');
  const asset=await loader.loadAsync(new URL('../assets/intro/cast-clarence.glb',import.meta.url).href);if(disposed){disposeTree(asset.scene);throw new Error('Disposed late attendant');}
  attendantActor=createTexturedPrologueActor({name:'Clarance',police:false,gltf:asset,uniformDetails:false});attendantActor.pose({mode:'standing'});attendantTreatment(attendantActor);hospital.root.add(attendantActor.root);hospitalWound=createWound(attendantActor);hospitalWound.setVisible(false);
  const mikeLoaded=await Promise.all([loader.loadAsync(new URL('../assets/intro/mike-body.glb',import.meta.url).href),loader.loadAsync(new URL('../assets/field/player-arms.glb',import.meta.url).href)]);
  if(disposed){for(const asset of mikeLoaded)disposeTree(asset.scene);throw new Error('Disposed late Mike body/arms');}
  mikeAssets=mikeLoaded;mikePerformance=createMikePerformance({bodyGltf:mikeLoaded[0],armsGltf:mikeLoaded[1]});asylum.root.add(mikePerformance.root);mikePerformance.root.visible=false;stats.castRoles.mike='existing first-person body and player arms';
  wound=createWound(clarence);cuffs=createCuffs();location.add(cuffs.root);
  const weapon=gun.getObjectByName('ServicePistol');if(!weapon)throw new Error('Critical existing pistol missing');heldGun=weapon.clone(true);heldGun.name='Stanley one-shot story pistol';heldGun.visible=false;bone(stanley,'handR').add(heldGun);heldGun.position.set(0,.075,0);heldGun.rotation.set(0,0,0);heldGun.scale.setScalar(.8);
  claranceContactFit=createClaranceContactFit({actor:clarence,car:asylum.root,wheel:cruiser.steering,floors:['InteriorFloor','InteriorFloormats'].map(name=>asylum.root.getObjectByName(name)),groundMeshes:groundSupports});
  loaded=true;stats.status='ready';return true;
 }).catch(error=>{stats.status='error';stats.error=error.message;throw error;});
 function openingFrame(frame){
  const f=frame.opening,m=f.motion,b=m.blocking,d=f.driving,wake=samplePrologueWake(f),driver=m.actors.clarence;
  location.visible=true;hospital.root.visible=false;storyField.root.visible=false;car.visible=true;pole.visible=false;cuffs.root.visible=false;mikePerformance.root.visible=false;
  camera.position.fromArray(b.camera);camera.rotation.set(f.player.pitch,f.player.yaw,0,'YXZ');
  car.position.fromArray(d.position);car.rotation.set(d.bodyPitch,d.yaw,d.bodyRoll,'YXZ');car.updateMatrix();
  camera.position.add(new THREE.Vector3().fromArray(samplePrologueBodyReach(wake.reach).eyeOffset)).applyMatrix4(car.matrix);camera.quaternion.premultiply(car.quaternion);
  sky.position.copy(camera.position);rain.update(m.time,camera.position,d,f.reduced,true,true);foliage.update(m.time,null,f.reduced);vt1Ground?.update(d,true);field.visible=f.chapter==='dispatch'&&b.progress>.8;
  cruiser.update(d,0);cruiser.setLampState(sampleCruiserLampState(m.time,{reduced:f.reduced}));headlight.intensity=6;entertainment.update(wake);car.updateWorldMatrix(true,true);
  f.cabinMatrix=car.matrixWorld.toArray();f.locationMatrix=location.matrixWorld.toArray();f.radioKnobQuaternion=entertainment.knob.getWorldQuaternion(new THREE.Quaternion()).toArray();f.radioHandTarget=entertainment.contact.getWorldPosition(new THREE.Vector3()).toArray();f.radioHandReach=wake.reach;f.radioHandTurn=wake.turn;
  clarence.root.visible=true;stanley.root.visible=false;clarence.root.position.fromArray(driver.position).applyMatrix4(car.matrix);clarence.root.rotation.set(0,driver.yaw,0,'YXZ');clarence.root.quaternion.premultiply(car.quaternion);
  const performance=performanceFor(f,'clarence',driver,m.listener?.position||b.camera);cruiser.steering.updateWorldMatrix(true,false);clarence.pose({wheelMatrix:cruiser.steering.matrixWorld,time:m.time,phase:driver.phase,mode:'drive',speaking:f.line?.voice==='clarence',look:performance.look,reduced:f.reduced,steer:d.steer,performance,gait:driver.gait,support:driver.support});stats.clarance=claranceContactFit.fitSeated({armWeight:0});
  dog.update(f,true);for(const [i,l]of policeSpill.entries()){const s=sampleCruiserLampState(m.time,{reduced:f.reduced});l.intensity=i?s.blueSpill:s.redSpill;}
  if(roadMist)for(const sheet of roadMist.children){const i=sheet.userData.index;sheet.position.set(-4.3+(f.reduced?0:Math.sin(m.time*.07+i)*1.2),.65,camera.position.z-12-i*16);}
  renderer.render(scene,camera);equipment.render(camera,f);
 }
 function updateNew(frame){
  const id=frame.scene,t=frame.time,reduced=frame.comfort.reducedMotion;
  equipment.reset();titles.release();mikePerformance.root.visible=['exit','custody'].includes(id);hospital.root.visible=id.startsWith('hospital')||id==='connector'||id==='boundary';location.visible=!hospital.root.visible;scene.fog=location.visible?new THREE.Fog(fogNormal,14,100):new THREE.Fog(0x758177,5,28);scene.background.set(location.visible?skyNormal:0x758177);
  if(hospital.root.visible){attendantActor.root.position.fromArray(HOSPITAL.attendant);attendantActor.root.rotation.y=-Math.PI/2;attendantActor.pose({mode:'standing',time:t,reduced,speaking:frame.line?.speaker==='CLARANCE'});hospitalWound.setVisible(frame.profile!=='original-level-two');if(camera.parent!==scene)scene.add(camera);camera.position.set(frame.player.x,frame.player.y,frame.player.z);camera.rotation.set(frame.player.pitch,frame.player.yaw,0,'YXZ');return;}
  if(camera.parent!==location)location.add(camera);for(const child of [...car.children])if(child.isLight||child===headlight.target)asylum.root.add(child);car.position.set(0,0,0);car.rotation.set(0,0,0);asylum.root.position.set(0,0,0);asylum.root.rotation.set(0,0,0);car.updateWorldMatrix(true,false);
  const fieldScene=['field','closure','return','shot','apology','stanley_engulf','mike_engulf','blackout'].includes(id);storyField.root.visible=fieldScene;car.visible=!fieldScene;road.visible=!fieldScene;roadsideSet.visible=!fieldScene;field.visible=false;pole.visible=!fieldScene;
  sky.position.copy(camera.position);rain.update(t,camera.position,sampleCrash(4),reduced,false,false);cuffs.root.visible=id==='custody';heldGun.visible=false;wound.setVisible(false);
  const moveParent=(actor,parent)=>{if(actor.root.parent!==parent)parent.add(actor.root);};
  if(fieldScene){
   const f=sampleField(id,t,id==='field'?frame.progress:8,frame.player.x);moveParent(clarence,storyField.root);moveParent(stanley,storyField.root);
   clarence.root.visible=!['mike_engulf','blackout'].includes(id);clarence.root.position.fromArray(f.clarance);clarence.root.rotation.y=Math.PI;clarence.pose({mode:f.shotCount?'limp':id==='field'?'walk':'standing',time:t,phase:frame.progress*3,reduced,chapter:'asylum-field',limpWeight:f.shotCount?.85:0});wound.setVisible(!!f.wound);
   stanley.root.visible=f.stanleyVisible&&(id!=='stanley_engulf'||t<4.8);stanley.root.position.fromArray(f.stanley);stanley.root.rotation.y=0;stanley.pose({mode:'standing',time:t,reduced,speaking:frame.line?.speaker==='STANLEY',chapter:'asylum-return'});
   if(['shot','apology'].includes(id)){poseArms(stanley,[[.08,1.35,.38],[-.07,1.36,.55]]);heldGun.visible=true;}
   camera.position.fromArray(f.mike).add(storyField.root.position);camera.rotation.set(frame.player.pitch,frame.player.yaw,0,'YXZ');
   const closing=id==='closure'?vineClosure(t,[f.mike,f.clarance]).amount:id==='field'?0:1;
   vines.update({closure:closing,consumption:f.stanleyConsumed>0&&id!=='mike_engulf'?f.stanleyConsumed:f.mikeConsumed,target:id==='mike_engulf'?[f.mike[0],0,f.mike[2]]:f.stanley});
   return;
  }
  moveParent(clarence,location);moveParent(stanley,location);clarence.root.visible=true;stanley.root.visible=true;
  if(id==='encounter'||id==='crash'){
   const drive=id==='encounter'?sampleEncounter(t,{reduced}):sampleCrash(t,{reduced});asylum.update(drive,{time:t,reduced});camera.position.set(.5,1.13,.35).applyMatrix4(asylum.root.matrixWorld);camera.rotation.set(frame.player.pitch,frame.player.yaw,0,'YXZ');camera.quaternion.premultiply(asylum.root.quaternion);
   clarence.root.position.set(-.45,-.38,.09).applyMatrix4(asylum.root.matrixWorld);clarence.root.rotation.set(0,Math.PI+drive.yaw,0);clarence.pose({mode:'drive',time:t,reduced,wheelMatrix:cruiser.steering.matrixWorld,steer:drive.steer});stats.clarance=claranceContactFit.fitSeated({armWeight:id==='crash'?smooth((t-5.5)/.5):0});stanley.root.position.fromArray(CRASH.stationaryStanley);stanley.root.rotation.y=0;stanley.pose({mode:'standing',time:0,reduced:true,chapter:'asylum-stationary'});
  }else if(id==='exit'){
   const r=sampleRecovery(t);asylum.update(sampleCrash(6),{time:t,reduced,driverDoor:r.driverDoor,passengerDoor:r.passengerDoor});
   moveParent(clarence,asylum.root);clarence.root.position.fromArray(r.driver);clarence.root.rotation.y=r.driverYaw;
   // The driver visibly exits, then settles continuously into the exact next
   // scene's starting pose. The player camera always belongs to Mike.
   stats.clarance=claranceContactFit.pose(t,reduced);
   moveParent(stanley,asylum.root);stanley.root.position.set(CRASH.stationaryStanley[0]-CRASH.parked[0],0,CRASH.stationaryStanley[2]-CRASH.parked[2]);stanley.root.rotation.y=0;stanley.pose({mode:'standing',time:0,reduced:true,chapter:'asylum-custody'});
   const compliance=smooth((t-3)/4);if(compliance>0){const targets=[[.075,1,-.14],[-.075,1,-.14]].map((p,i)=>stanley.root.worldToLocal(bone(stanley,'hand'+(i?'R':'L')).getWorldPosition(new THREE.Vector3())).lerp(new THREE.Vector3(...p),compliance).toArray());poseArms(stanley,targets,compliance,{behind:true});}
   r.passengerHandle=asylum.car.door.getObjectByName('InteriorDoorR06');r.passengerFloor=asylum.car.model.getObjectByName('InteriorFloor');r.groundSupports=groundSupports;stats.mike=mikePerformance.update(r);stats.recovery={driverOut:r.driverFinished,mikeOut:r.mikeFinished,driverDoor:r.driverDoor,passengerDoor:r.passengerDoor,compliance};
   camera.position.fromArray(r.eye).applyMatrix4(asylum.root.matrixWorld);camera.rotation.set(r.cameraPitch+frame.player.pitch,r.cameraYaw+frame.player.yaw,0,'YXZ');camera.quaternion.premultiply(asylum.root.quaternion);
  }else if(id==='custody'){
   if(!frame.facts.includes('mike_out'))throw new Error('Custody view before Mike exits');
   const s=sampleCustody(t),r=sampleMikeCustody(t);asylum.update(sampleCrash(6),{time:t,reduced,custody:t,driverDoor:r.driverDoor,passengerDoor:r.passengerDoor});moveParent(stanley,asylum.root);poseCustody(stanley,s);if(cuffs.root.parent!==asylum.root)asylum.root.add(cuffs.root);cuffs.root.visible=t>=10;cuffs.update(stanley,s.cuffClosure);
   moveParent(clarence,asylum.root);stats.wristContact=poseOfficerCustody(clarence,stanley,s);if(s.doorContact>0)stats.handleContact=fitHandToHandle(clarence,'L',asylum.doors[1].handle,s.doorContact);
   r.groundSupports=groundSupports;r.passengerFloor=asylum.car.model.getObjectByName('InteriorFloor');stats.mike=mikePerformance.update(r);camera.position.fromArray(r.eye).applyMatrix4(asylum.root.matrixWorld);camera.rotation.set(r.cameraPitch+frame.player.pitch,r.cameraYaw+frame.player.yaw,0,'YXZ');camera.quaternion.premultiply(asylum.root.quaternion);
  }
 }
 function render(frame){if(disposed||!loaded)return;const w=Math.max(1,renderer.domElement.clientWidth),h=Math.max(1,renderer.domElement.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();if(frame.scene==='titles'){titles.render(frame.titles);return;}if(frame.scene==='opening')openingFrame(frame);else{updateNew(frame);renderer.render(scene,camera);}stats.frames++;stats.scene=frame.scene;}
 function disposeTree(root){const resources=new Set();root?.traverse(o=>{if(o.geometry)resources.add(o.geometry);o.skeleton&&resources.add(o.skeleton);for(const m of [o.material].flat().filter(Boolean)){resources.add(m);for(const v of Object.values(m))if(v?.isTexture)resources.add(v);}});for(const r of resources)r.dispose();}
 return {ready,render,stats,criticalStatus(profile='asylum-intro-v0.1'){if(profile==='original-level-two')return loaded&&stats.status==='ready'&&!!attendantActor&&!!hospitalWound;if(equipment.stats.body?.status==='failed'||equipment.stats.radio?.status==='fallback')throw new Error('Critical body/radio failed');return equipment.stats.body?.status==='ready'&&equipment.stats.radio?.status==='ready';},dispose(){if(disposed)return;disposed=true;mikePerformance?.dispose();for(const asset of mikeAssets)disposeTree(asset.scene);mikeAssets=[];equipment.dispose();hands.dispose();titles.dispose();assets?.dispose();rain?.dispose();dog?.dispose();asylum?.dispose();clarence?.dispose();stanley?.dispose();attendantActor?.dispose();vines.dispose();hospital.dispose();storyField.dispose();disposeTree(scene);for(const p of kitParts){p.geometry.dispose();p.material.dispose();}for(const t of ownedTextures)t.dispose();for(const t of [cornAtlas.map,cornAtlas.normalMap,cornAtlas.roughnessMap])t.dispose();stats.status='disposed';}};
}
