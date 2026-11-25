import * as THREE from 'three';
import {createSadie} from './sadie-classroom.js';
import {SCHOOL_BELL,SCHOOL_LAYOUT,schoolColliders} from './cf-v4-school-encounter.js';
import {runCleanups} from '../../../../shared/runtime/resource-scope.js';
import {createReturnGlow,createReturnHaloTexture} from './return-beacon.js';
import {installZombie} from './zombie.js';
import {SCHOOL_HALL} from './cf-v4-school-hall.js';
import {doorLeaf} from './corn-world.js';
import {collectVisualResources} from '../../../../shared/runtime/visual-resources.js';

function exitLetterTexture(){
 const pixels=[
  '##### #...# ##### #####',
  '#.... #...# ..#.. ..#..',
  '#.... .#.#. ..#.. ..#..',
  '####. ..#.. ..#.. ..#..',
  '#.... .#.#. ..#.. ..#..',
  '#.... #...# ..#.. ..#..',
  '##### #...# ##### ..#..',
 ];
 const width=pixels[0].length,height=pixels.length,data=new Uint8Array(width*height*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  if(pixels[y][x]==='#')data.fill(255,((height-1-y)*width+x)*4,((height-1-y)*width+x+1)*4);
 }
 const texture=new THREE.DataTexture(data,width,height);texture.needsUpdate=true;return texture;
}

/** Native classroom kit. Caller owns scene, camera, input, clock and rendering. */
export function createSchoolSet({surfaceLoader,assetBindings}={}){
 const group=new THREE.Group();group.name='V4 school: three classrooms and hallway';
 const geometries=new Set(),materials=new Map(),cleanup=[],doorMeshes=new Map();let disposed=false;
 const material=(color)=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.92}));return materials.get(color);};
 function mesh(geometry,color,x,y,z,parent=group){geometries.add(geometry);const m=new THREE.Mesh(geometry,material(color));m.position.set(x,y,z);parent.add(m);return m;}
 const box=(name,w,h,d,x,y,z,color,parent=group)=>{const m=mesh(new THREE.BoxGeometry(w,h,d),color,x,y,z,parent);m.name=name;return m;};
 const sphere=(name,rx,ry,rz,x,y,z,color,parent)=>{const m=mesh(new THREE.SphereGeometry(1,10,8),color,x,y,z,parent);m.scale.set(rx,ry,rz);m.name=name;return m;};
 box('school floor',11,.12,18,3.5,-.06,0,0x81705a);box('school ceiling',11,.12,18,3.5,2.86,0,0xc5baa1);
 for(const wall of SCHOOL_LAYOUT.walls)box(wall.id,wall.maxX-wall.minX,2.8,wall.maxZ-wall.minZ,(wall.minX+wall.maxX)/2,1.4,(wall.minZ+wall.maxZ)/2,0xc5baa1);
 const {exit}=SCHOOL_LAYOUT,doorZ=exit.z+exit.depth/2,landingDepth=exit.endZ-exit.z;
 box('Exit landing',exit.width,.12,landingDepth,exit.x,-.06,exit.z+landingDepth/2,0x463e3b);
 box('Exit lintel',exit.width,.62,exit.depth,exit.x,2.49,doorZ,0xc5baa1);
 const exitDoor=box('School exit door',exit.width,2.18,exit.depth,exit.x,1.09,doorZ,0x48423b);
 box('School exit door handle',.15,.06,.11,.71,-.09,-exit.depth/2-.03,0xa59b83,exitDoor);
 const exitCue=new THREE.Group();exitCue.name='School exit glow';group.add(exitCue);
 box('EXIT sign housing',1.72,.56,.08,exit.x,2.47,exit.z-.07,0x342320,exitCue);
 const signTexture=exitLetterTexture(),signGeometry=new THREE.PlaneGeometry(1.38,.42);
 const signMaterial=new THREE.MeshBasicMaterial({map:signTexture,color:0xffecd0,alphaTest:.5,toneMapped:false});
 const sign=new THREE.Mesh(signGeometry,signMaterial);sign.name='EXIT sign';sign.position.set(exit.x,2.47,exit.z-.115);sign.rotation.y=Math.PI;exitCue.add(sign);
 const lantern=box('School exit lamp',.15,.085,.08,exit.x,2.77,exit.z-.08,0xff2214,exitCue);
 const exitLight=new THREE.PointLight();exitLight.name='School exit light';exitLight.position.set(exit.x,2.3,exit.z-.75);exitCue.add(exitLight);
 const updateExitGlow=createReturnGlow(lantern,exitLight,{intensity:13,distance:7});
 const haloTexture=createReturnHaloTexture();
 const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:haloTexture,color:lantern.material.color,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));
 halo.position.set(exit.x,2.49,exit.z-.18);halo.scale.set(3.6,1.6,1);exitCue.add(halo);
 geometries.add(signGeometry);
 cleanup.push(()=>{signTexture.dispose();signMaterial.dispose();haloTexture.dispose();halo.material.dispose();exitLight.dispose();});
 for(const [i,room]of SCHOOL_LAYOUT.rooms.entries()){
  const z=room.center.z;
  box(`${room.id} doorway header`,.12,.6,1.4,2,2.5,z,0xc5baa1);
  const door=box(room.door.id,.1,2.2,1.4,2,1.1,z,0x92734f);doorMeshes.set(room.door.id,door);
  box(`${room.id} doorway light`,.025,.3,.65,1.86,2.42,z,[0x8ea97d,0x9c8baa,0xad9774][i]);
  // Different repeated geometry symbols identify rooms without external fonts.
  for(let n=0;n<=i;n++)sphere('room identification dot',.045,.045,.025,1.83,2.42,z-.12+i*.06-n*.12,0xe9e1c9);
  box(`${room.id} rug`,2.1,.025,2,4,.016,z,0x665b64);
  for(const dx of [-.5,.5])for(const dz of [-.5,.5]){const disc=mesh(new THREE.CircleGeometry(.25,16),[0x916758,0x627787,0x92845a][i],4+dx,.032,z+dz);disc.rotation.x=-Math.PI/2;}
  // Furniture respects the same collision space used by player and teacher.
  const cover=SCHOOL_LAYOUT.cover[i];
  box(cover.id,cover.maxX-cover.minX,1.15,cover.maxZ-cover.minZ,(cover.minX+cover.maxX)/2,.575,(cover.minZ+cover.maxZ)/2,0x92734f);
  for(let n=0;n<5;n++)box('book on hiding shelf',.12,.22,.13,6.15+n*.25,1.27,z+.95,[0x916758,0x627787,0x92845a][n%3]);
  box('classroom chalkboard',.04,1.05,2,8.88,1.6,z-1.4,0x354b44);
  for(const [index,length] of [.22,.15,.22].entries())box('chalk counting mark',.015,length,.026,8.85,1.6,z-1.82+index*.12,0xe8dfcb);
  box('safety window',.025,1.1,1.25,8.9,1.6,z+1.7,0xadbdb8);
  for(const dz of [-2.3,2.3]){box('child activity desk',1,.07,.65,5,.55,z+dz,0x92734f);for(const dx of [-.4,.4])for(const zz of [-.25,.25])box('desk leg',.05,.52,.05,5+dx,.26,z+dz+zz,0x92734f);}
 }
 function teacherActor(){const root=new THREE.Group();root.name='Ordinary teacher';group.add(root);const skin=0xb98c72,dress=0x627787;
  for(const side of [-1,1]){sphere('shoe',.09,.06,.15,side*.12,.06,0,0x443025,root);box('leg',.11,.6,.12,side*.12,.39,0,skin,root);box('teacher arm',.11,.65,.12,side*.25,1.13,0,skin,root);}
  mesh(new THREE.CylinderGeometry(.2,.29,.63,12),dress,0,.83,0,root);sphere('torso',.23,.3,.14,0,1.17,0,dress,root);sphere('hair',.17,.18,.15,0,1.61,.025,0x3d2920,root);sphere('face',.145,.17,.13,0,1.59,-.035,skin,root);
  for(const side of [-1,1])sphere('eye',.018,.014,.012,side*.055,1.63,-.16,0x211d19,root);sphere('mouth',.035,.007,.01,0,1.54,-.16,0x523b35,root);return root;
 }
 const ordinaryTeacher=teacherActor(),pupils=new THREE.Group();pupils.name='Four visible ordinary pupils';group.add(pupils);
 ordinaryTeacher.position.set(6,0,-6);ordinaryTeacher.rotation.y=Math.PI/2;
 const teacherMaterials=new Map();
 ordinaryTeacher.traverse(child=>{
  if(!child.material)return;
  const source=child.material;
  if(!teacherMaterials.has(source))teacherMaterials.set(source,source.clone());
  child.material=teacherMaterials.get(source);
 });
 const impression=new THREE.Group();impression.name='Faint teacher impression';group.add(impression);
 const impressionMaterial=new THREE.MeshBasicMaterial({color:0x414540,transparent:true,opacity:.19,depthWrite:false});
 const impressionShape=new THREE.Shape();
 impressionShape.moveTo(-.34,.10);impressionShape.lineTo(-.14,.96);impressionShape.quadraticCurveTo(-.27,1.25,-.10,1.43);
 impressionShape.quadraticCurveTo(-.22,1.81,.05,1.80);impressionShape.quadraticCurveTo(.29,1.78,.17,1.40);
 impressionShape.quadraticCurveTo(.36,1.33,.28,1.10);impressionShape.lineTo(.42,.12);impressionShape.lineTo(-.34,.10);
 const impressionGeometry=new THREE.ShapeGeometry(impressionShape,4);
 const impressionMesh=new THREE.Mesh(impressionGeometry,impressionMaterial);
 impressionMesh.position.set(8.985,0,-5.6);impressionMesh.rotation.y=-Math.PI/2;impression.add(impressionMesh);
 const bell=new THREE.Group();bell.name='Classroom bell';bell.position.set(SCHOOL_BELL.x,SCHOOL_BELL.y,SCHOOL_BELL.z);group.add(bell);
 box('Bell backplate',.075,.25,.22,-.033,0,0,0x39372e,bell);
 const bellGeometry=new THREE.CylinderGeometry(.09,.132,.13,8);
 const bellBody=mesh(bellGeometry,0x9f8450,.067,.015,0,bell);
 sphere('Bell striker',.035,.042,.035,.067,-.075,0,0x48362b,bell);
 cleanup.push(()=>{
  for(const material of teacherMaterials.values())material.dispose();
  impressionGeometry.dispose();impressionMaterial.dispose();
 });
 for(let i=0;i<4;i++){const pupil=createSadie({surfaceLoader,faceEnabled:false});pupil.name=`Ordinary pupil ${i+1}`;pupil.position.set(4.5+(i%2)*1.1,0,-8+Math.floor(i/2)*1.1);pupil.scale.setScalar([.94,1,.91,.98][i]);pupil.rotation.y=Math.PI/2;pupil.traverse(o=>{if(o.material?.name==='Sadie mustard')o.material.color.setHex([0x916758,0x627787,0x92845a,0x748068][i]);});pupils.add(pupil);cleanup.push(()=>pupil.userData.dispose?.());}
 const pursuer=new THREE.Group();pursuer.name='School zombie';group.add(pursuer);
 const fallback=new THREE.Group();fallback.name='School zombie loading silhouette';pursuer.add(fallback);
 box('torn shirt',.44,.7,.24,0,1.05,0,0x3f4140,fallback);
 box('gray head',.25,.28,.24,0,1.56,.045,0x827b73,fallback);
 for(const side of [-1,1]){
  box('zombie leg',.15,.72,.16,side*.14,.36,0,0x363636,fallback);
  box('zombie arm',.14,.58,.15,side*.29,1.05,.13,0x6b6862,fallback).rotation.x=-.68;
  box('zombie eye',.045,.025,.015,side*.05,1.59,.17,0xca2923,fallback);
 }
 let model=null;
 if(assetBindings)void installZombie(pursuer,[],{assetBindings,cinematic:true,isCurrent:()=>!disposed}).then(view=>{
  if(disposed)view.dispose();else model=view;
 }).catch(()=>{if(!disposed)fallback.visible=true;});
 cleanup.push(()=>model?.dispose());
 const light=new THREE.HemisphereLight(0xfff0d1,0x777366,2);group.add(light);
 const dormant={...SCHOOL_LAYOUT.zombieStart,state:'concealed_stalk',stateStartedAt:0};
 let dissolving=false;
 function update(snapshot={},options={}){if(disposed)return;const phase=options.phase||'normal',normal=phase==='normal'||phase==='reorientation';
  const dissolve=phase==='transformation'&&!options.reducedMotion;
  if(dissolve!==dissolving){
   dissolving=dissolve;
   for(const material of teacherMaterials.values()){material.alphaHash=dissolve;material.needsUpdate=true;}
  }
  for(const material of teacherMaterials.values())material.opacity=dissolve?1-Math.min(1,options.transition||0):1;
  ordinaryTeacher.visible=normal||dissolve;pupils.visible=normal;pursuer.visible=phase==='nightmare';
  impression.visible=!options.reducedMotion&&((dissolve&&options.transition>.45)||phase==='nightmare');
  bell.visible=options.bell===true&&phase==='nightmare';
  const ring=snapshot.events?.find(event=>event.type==='bell');
  if(ring)bell.userData.rangAt=ring.elapsed;
  const ringAge=(snapshot.elapsed||0)-(bell.userData.rangAt??-1);
  bellBody.rotation.z=options.reducedMotion||ringAge<0||ringAge>.5?0:Math.sin(ringAge*37)*(.5-ringAge)*.4;
  if(pursuer.visible){
   const actor=snapshot.zombie||dormant;
   pursuer.position.set(actor.x,0,actor.z);pursuer.rotation.y=actor.yaw+Math.PI;
   model?.update(actor,snapshot.elapsed??options.time??0,{reduced:!!options.reducedMotion});
  }
  for(const [id,m]of doorMeshes){const open=snapshot.doors?.[id]!==false;m.visible=!open;}
  exitDoor.visible=snapshot.exitUnlocked!==true;
  exitCue.visible=phase==='nightmare'&&snapshot.exitUnlocked===true;
  if(exitCue.visible)halo.material.opacity=.36*updateExitGlow(options.time||0,options.reducedMotion);
   light.intensity=normal?2:options.reducedMotion?1.45:1.3+Math.sin((options.time||0)*.83)*.1;
   light.color.setHex(normal?0xfff0d1:0xa5b3b5);
  // Lighting changes only: layout and colliders never stretch during nightmare.
  if(pupils.visible)for(const child of pupils.children)child.userData.update?.(options.time||0,!!options.reducedMotion);
 }
 update();
 function dispose(){
  if(disposed)return;
  disposed=true;
  const failures=runCleanups([
   ...cleanup,...[...geometries].map(geometry=>()=>geometry.dispose()),
   ...[...materials.values()].map(material=>()=>material.dispose()),()=>group.removeFromParent()
  ]);
  if(failures.length)throw new AggregateError(failures,'School visual cleanup failed');
 }
 return {group,ordinaryTeacher,pupils,bounds:SCHOOL_LAYOUT.bounds,eyeHeight:SCHOOL_LAYOUT.eyeHeight,setupAnchor:SCHOOL_LAYOUT.setupAnchor,anchor:{position:{...SCHOOL_LAYOUT.playerStart,y:0},lookTarget:{x:0,y:.9,z:0},eyeHeight:.9},colliders:schoolColliders,update,dispose};
}

/** The same tile and portal records drive what Sadie sees and where she can walk. */
export function createSchoolHallSet(){
 const group=new THREE.Group(),hall=new THREE.Group();group.add(hall);
 const classroom=createSchoolSet();classroom.group.visible=false;group.add(classroom.group);
 const {tiles,walls,doors,rooms,bounds,start,cell}=SCHOOL_HALL;
 const palette={
  tile:0x565d58,wall:0x9b9a89,base:0x445852,ceiling:0x616d65,wood:0x514337,
  frame:0x493233,desk:0x777056,board:0x26463e,lamp:0xc7d2b2,locker:0x667267,
  room1:0x7a645c,room2:0x626e5c,room3:0x676177
 };
 const geometry=new THREE.BoxGeometry(1,1,1),batches=new Map();
 function block(kind,w,h,d,x,y,z,angle=0){
  const pieces=batches.get(kind)||[];pieces.push([w,h,d,x,y,z,angle]);batches.set(kind,pieces);
 }
 for(const {x,z,width} of tiles){
  block('tile',width,.14,cell-.012,x,-.075,z);
  block('ceiling',width,.15,cell,x,2.86,z);
  if(Math.floor(z/cell)%8===0&&width>=2)block('lamp',.34,.058,.85,x,2.76,z);
 }
 for(const {x,z,dx,length} of walls){
  const angle=dx?Math.PI/2:0;
  block('wall',length+.024,2.8,.10,x,1.4,z,angle);
  block('base',length+.028,.23,.13,x,.115,z,angle);
 }
 for(const room of rooms){
  block('room'+room.id,1.32,.02,1.34,room.x,.01,room.z);
  block('desk',.48,.08,.62,room.x+.68,.74,room.z-.27);
  for(const z of [room.z-.47,room.z-.07])block('wood',.28,.65,.07,room.x+.68,.32,z);
  block('board',1.03,.56,.05,room.x+1.08,1.57,room.z,Math.PI/2);
  block('locker',.46,1.48,.22,room.x+.92,.74,room.z+.53,Math.PI/2);
  for(let n=0;n<room.id;n++)block('lamp',.018,.17,.047,room.x+1.035,1.58,room.z+(n-1)*.12);
 }
 const metal=new THREE.MeshStandardMaterial({color:0x9e9180,roughness:.7});
 const red=new THREE.MeshStandardMaterial({color:0x8c312e,roughness:.8});
 const glowing=new THREE.MeshBasicMaterial({color:0xb32620,toneMapped:false});
 const dark=new THREE.MeshBasicMaterial({color:0x100509});
 const innerTrim=new THREE.MeshBasicMaterial({color:0x862829});
 const glass=new THREE.MeshStandardMaterial({color:0xe1ab9d,roughness:.16,opacity:.28,transparent:true,depthWrite:false});
 function part(parent,material,width,height,depth,x,y,z){
  const mesh=new THREE.Mesh(geometry,material);
  mesh.scale.set(width,height,depth);mesh.position.set(x,y,z);parent.add(mesh);
 }
 const leaves=doors.map(door=>{
  const threshold=door.z-cell*.67;
  for(const z of [door.z,threshold]){
   for(const side of [-1,1])block('frame',.11,2.36,.16,door.x+side*door.width/2,1.18,z);
   block('frame',door.width+.12,.14,.16,door.x,2.31,z);
  }
  part(hall,dark,door.width-.11,2.23,.023,door.x,1.115,threshold-.14);
  for(const side of [-1,1])part(hall,innerTrim,.055,2.22,.042,door.x+side*(door.width/2-.09),1.11,threshold-.085);
  part(hall,innerTrim,door.width-.16,.062,.047,door.x,2.19,threshold-.085);
  const width=door.width-.05,leaf=new THREE.Group();
  leaf.name='Red classroom door '+(door.slot+1);hall.add(leaf);
  part(leaf,red,width,1.21,.09,0,.605,0);
  part(leaf,red,width,.54,.09,0,1.91,0);
  for(const side of [-1,1])part(leaf,red,(width-.69)/2,.44,.09,side*(width+.69)/4,1.43,0);
  part(leaf,metal,.18,.06,.13,-width*.33,1.04,-.06);
  part(leaf,glass,.69,.44,.028,0,1.43,-.046);
  part(leaf,glowing,.65,.41,.022,0,1.43,.066);
  return leaf;
 });
 const pose=new THREE.Object3D();
 for(const [kind,pieces] of batches){
  const material=new THREE.MeshStandardMaterial({color:palette[kind],roughness:.95,emissive:kind==='lamp'?0x606955:0,emissiveIntensity:.7});
  const row=new THREE.InstancedMesh(geometry,material,pieces.length);
  pieces.forEach(([w,h,d,x,y,z,angle],i)=>{
   pose.position.set(x,y,z);pose.scale.set(w,h,d);pose.rotation.y=angle;pose.updateMatrix();row.setMatrixAt(i,pose.matrix);
  });
  row.computeBoundingSphere();hall.add(row);
 }
 const fill=new THREE.PointLight(0xd8e0bd,10,8,1.65);
 hall.add(new THREE.HemisphereLight(0xb7c4b5,0x505045,1.14),fill);
 return {
  group,bounds,colliders:()=>[],setupAnchor:classroom.setupAnchor,
  anchor:{position:{x:start.x,y:0,z:start.z},lookTarget:{x:start.x,y:.9,z:start.z+1},eyeHeight:.9},
  update(snapshot,{phase,time=0,reducedMotion=false,player}={}){
   const recovery=phase==='reorientation';hall.visible=!recovery;classroom.group.visible=recovery;
   if(recovery){classroom.update(snapshot,{phase,time,reducedMotion});return;}
   glowing.color.setRGB(.70+(reducedMotion?0:.15*Math.sin(time*3.2)),.045,.031);
   doors.forEach((door,i)=>{
    const state=snapshot.doors?.[i];
    leaves[i].visible=(state?.amount||0)<.96;
    const {a,b}=doorLeaf(door,(state?.amount||0)*(state?.swing||1));
    leaves[i].position.set((a.x+b.x)/2,0,(a.z+b.z)/2);
    leaves[i].rotation.y=Math.atan2(a.z-b.z,b.x-a.x);
   });
   if(player)fill.position.set(player.x,1.18,player.z);
  },
  dispose(){
   classroom.dispose();
   for(const resource of collectVisualResources([hall]))resource.dispose?.();
   hall.traverse(object=>{if(object.isInstancedMesh||object.isLight)object.dispose?.();});group.removeFromParent();
  }
 };
}
