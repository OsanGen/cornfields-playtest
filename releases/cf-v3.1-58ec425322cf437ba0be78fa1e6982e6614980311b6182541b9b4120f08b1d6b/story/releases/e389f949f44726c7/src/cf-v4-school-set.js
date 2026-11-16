import * as THREE from 'three';
import {createSadie} from './sadie-classroom.js';
import {SCHOOL_BELL,SCHOOL_LAYOUT,schoolColliders} from './cf-v4-school-encounter.js';
import {runCleanups} from '../../../../shared/runtime/resource-scope.js';
import {createReturnGlow,createReturnHaloTexture} from './return-beacon.js';
import {installZombie} from './zombie.js';
import {SCHOOL_HALL,schoolHallColliders} from './cf-v4-school-hall.js';
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
export function createSchoolHallSet({assetBindings}={}){
 const group=new THREE.Group(),hall=new THREE.Group();group.add(hall);
 const classroom=createSchoolSet();classroom.group.visible=false;group.add(classroom.group);
 const {hallway,walls,portals,exit,exitBranch,bounds,start}=SCHOOL_HALL;
 const palette={
  tile:0x515853,wall:0x999485,base:0x4e5d58,ceiling:0x676b66,wood:0x453934,
  frame:0x303330,metal:0x8f836b,lamp:0xc8d4b5,red:0xb82a20
 };
 const geometry=new THREE.BoxGeometry(1,1,1),batches=new Map();
 function block(kind,w,h,d,x,y,z,angle=0){
  const pieces=batches.get(kind)||[];pieces.push([w,h,d,x,y,z,angle]);batches.set(kind,pieces);
 }
 const windowPanes=[];
 for(const tile of hallway){
  block('tile',4,.15,4,tile.x,-.075,tile.z);
  block('ceiling',4,.14,4,tile.x,2.87,tile.z);
  block('lamp',.28,.075,1.05,tile.x,2.755,tile.z);
  for(const side of [-1,1])block('base',.11,.006,3.8,tile.x+side*1.15,.008,tile.z);
  if(tile.room){
   const hue=['','room1','room2','room3'][tile.room];
   block(hue,2.2,.022,2.05,tile.x,.02,tile.z);
   block('wood',1.22,.65,.39,tile.x-1.19,.325,tile.z-1.45);
   for(let n=0;n<tile.room;n++)block('lamp',.09,.28,.085,tile.x-.29+n*.15,1.86,tile.z-1.93);
  }
 }
 for(const wall of walls){
  const {x,z,dx,dz,length}=wall,angle=dx?Math.PI/2:0;
  if(!wall.locked){
   block('wall',length,2.8,.14,x,1.4,z,angle);block('base',length,.54,.16,x,.28,z,angle);continue;
  }
  const width=1.08;
  for(const side of [-1,1]){
   const offset=side*(length+width)/4;
   block('wall',(length-width)/2,2.8,.14,x+dz*offset,1.4,z+dx*offset,angle);
   block('frame',.09,2.24,.22,x+dz*side*.54,1.12,z+dx*side*.54,angle);
  }
  block('wall',width,.58,.16,x,2.51,z,angle);
  block('wood',width,1.24,.18,x,.62,z,angle);
  block('wood',width,.55,.18,x,1.95,z,angle);
  for(const side of [-1,1])block('wood',.19,.45,.18,x+dz*side*.445,1.46,z+dx*side*.445,angle);
  block('metal',.16,.04,.16,x+dz*.34-dx*.11,1.04,z+dx*.34-dz*.11,angle);
  const index=windowPanes.length,phase=(index*17%23)/23;
  windowPanes.push({x,z,dx,dz,angle,phase});
 }
 for(const portal of portals){
  const {x,z,dx,dz,width}=portal,angle=dx?Math.PI/2:0;
  block('wall',width,.60,.22,x,2.50,z,angle);
  for(const side of [-1,1])block('frame',.09,2.24,.25,x+dz*width/2*side,1.12,z+dx*width/2*side,angle);
 }
 const pose=new THREE.Object3D();
 function place(mesh,i,[w,h,d,x,y,z,angle=0]){
  pose.position.set(x,y,z);pose.scale.set(w,h,d);pose.rotation.y=angle;pose.updateMatrix();mesh.setMatrixAt(i,pose.matrix);
 }
 for(const [kind,pieces] of batches){
  const value=palette[kind]??{room1:0x776654,room2:0x5a675b,room3:0x665867}[kind];
  const material=new THREE.MeshStandardMaterial({color:value,roughness:.93,emissive:kind==='lamp'?0x666b50:0,emissiveIntensity:kind==='lamp'?.52:0});
  const row=new THREE.InstancedMesh(geometry,material,pieces.length);
  pieces.forEach((piece,i)=>place(row,i,piece));row.computeBoundingSphere();hall.add(row);
 }
 // The panes are translucent, with the red emitters on the room side of the glass.
 const glass=new THREE.InstancedMesh(geometry,new THREE.MeshStandardMaterial({color:0x9ca7a1,roughness:.18,transparent:true,opacity:.23,depthWrite:false}),windowPanes.length);
 const redMaterial=new THREE.MeshBasicMaterial({color:0xff4433,toneMapped:false});
 const emitters=new THREE.InstancedMesh(geometry,redMaterial,windowPanes.length);
 emitters.name='Red lights behind locked classroom windows';glass.name='Locked classroom door glass';
 windowPanes.forEach(({x,z,dx,dz,angle},i)=>{
  place(glass,i,[.70,.46,.025,x,1.46,z,angle]);place(emitters,i,[.69,.44,.04,x+dx*.105,1.46,z+dz*.105,angle]);
  emitters.setColorAt(i,new THREE.Color(0xffffff));
 });
 glass.computeBoundingSphere();emitters.computeBoundingSphere();hall.add(emitters,glass);
 const door=new THREE.Mesh(new THREE.BoxGeometry(exit.width,2.17,.16),new THREE.MeshStandardMaterial({color:0x473337,roughness:.88}));
 door.name='Final school exit door';door.position.set(exit.x,1.085,exit.z);hall.add(door);
 const signTexture=exitLetterTexture(),sign=new THREE.Mesh(new THREE.PlaneGeometry(1.64,.5),new THREE.MeshBasicMaterial({map:signTexture,alphaTest:.5,color:0xff7870,side:THREE.DoubleSide,toneMapped:false}));
 sign.name='Steady red EXIT sign';sign.position.set(exit.x,2.47,exit.z+.14);
 const light=new THREE.PointLight();light.position.set(exit.x,2.21,exit.z+.65);
 const lantern=new THREE.Mesh(new THREE.BoxGeometry(.19,.10,.08),new THREE.MeshStandardMaterial());lantern.position.set(exit.x,2.76,exit.z+.14);
 const glow=createReturnGlow(lantern,light,{intensity:15,distance:9});
 const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:createReturnHaloTexture(),color:0xff251b,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
 halo.position.set(exit.x,2.5,exit.z+.29);halo.scale.set(3.6,1.7,1);
 hall.add(sign,light,lantern,halo);
 const arrow=new THREE.Group();arrow.name='Lit arrow to final hall';arrow.position.set(exitBranch.x,2.32,exitBranch.z-.08);hall.add(arrow);
 const arrowMaterial=new THREE.MeshBasicMaterial({color:0xff6256,toneMapped:false});
 for(const [x,y,w,angle] of [[0,0,.74,0],[.32,.13,.36,-.63],[.32,-.13,.36,.63]]){
  const mesh=new THREE.Mesh(geometry,arrowMaterial);mesh.position.set(x,y,0);mesh.scale.set(w,.095,.06);mesh.rotation.z=angle;arrow.add(mesh);
 }
 hall.add(new THREE.HemisphereLight(0xc3cec3,0x65503f,1.36));
 const fill=new THREE.PointLight(0xbed0cb,7,7,1.8);hall.add(fill);
 const pursuer=new THREE.Group();pursuer.name='Slow school pursuer';hall.add(pursuer);
 const torn=new THREE.MeshStandardMaterial({color:0x4f5047}),skin=new THREE.MeshStandardMaterial({color:0x7f776e});
 for(const [w,h,d,x,y,z,material,pitch] of [
  [.42,.72,.24,0,1.04,0,torn,0],[.23,.29,.22,0,1.55,.04,skin,0],
  [.14,.73,.16,-.14,.38,0,torn,0],[.14,.73,.16,.14,.38,0,torn,0],
  [.14,.60,.15,-.28,1.04,.17,skin,-.7],[.14,.60,.15,.28,1.04,.17,skin,-.7]
 ]){
  const mesh=new THREE.Mesh(geometry,material);mesh.scale.set(w,h,d);mesh.position.set(x,y,z);mesh.rotation.x=pitch;pursuer.add(mesh);
 }
 const fallbackResources=collectVisualResources([pursuer]);
 let disposed=false,model=null,lastLighting=-1;
 if(assetBindings)void installZombie(pursuer,[],{assetBindings,cinematic:true,isCurrent:()=>!disposed}).then(value=>{if(disposed)value.dispose();else model=value;}).catch(()=>{});
 const tint=new THREE.Color();
 return {
  group,bounds,colliders:schoolHallColliders,setupAnchor:classroom.setupAnchor,
  anchor:{position:{x:start.x,y:0,z:start.z},lookTarget:{x:start.x,y:.9,z:start.z+1},eyeHeight:.9},
  update(snapshot,{phase,time=0,reducedMotion=false,player}={}){
   const recovery=phase==='reorientation';hall.visible=!recovery;classroom.group.visible=recovery;
   if(recovery){classroom.update(snapshot,{phase,time,reducedMotion});return;}
   const unlocked=snapshot.exitUnlocked===true;
   door.visible=!unlocked;sign.visible=light.visible=lantern.visible=halo.visible=arrow.visible=unlocked;
   if(unlocked){glow(time,true);halo.material.opacity=.43;}
   const lighting=reducedMotion?0:Math.floor(time*10);
   if(lighting!==lastLighting){
    lastLighting=lighting;
    windowPanes.forEach(({phase},i)=>{
     const pulse=!snapshot.hunting?.06:reducedMotion?.47:.24+.72*Math.max(0,Math.sin(time*4.3+phase*6.28))**1.8;
     tint.setRGB(pulse,pulse*.76,pulse*.62);emitters.setColorAt(i,tint);
    });
    emitters.instanceColor.needsUpdate=true;
   }
   const actor=snapshot.zombie;pursuer.visible=!!actor?.visible;
   if(actor?.visible){pursuer.position.set(actor.x,0,actor.z);pursuer.rotation.y=actor.yaw+Math.PI;model?.update(actor,time,{reduced:reducedMotion});}
   if(player)fill.position.set(player.x,.95,player.z);
  },
  dispose(){
   disposed=true;model?.dispose();classroom.dispose();
   for(const resource of collectVisualResources([hall],fallbackResources))resource.dispose?.();
   hall.traverse(object=>{if(object.isInstancedMesh||object.isLight)object.dispose?.();});group.removeFromParent();
  }
 };
}
