import * as THREE from 'three';
import {createSadie} from './sadie-classroom.js';
import {SCHOOL_LAYOUT,schoolColliders} from './cf-v4-school-encounter.js';
import {createReturnGlow,createReturnHaloTexture} from './return-beacon.js';
import {installZombie} from './zombie.js';

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
 function update(snapshot={},options={}){if(disposed)return;const phase=options.phase||'normal',normal=phase==='normal'||phase==='reorientation';
  ordinaryTeacher.visible=normal;pupils.visible=normal;pursuer.visible=phase==='nightmare';
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
  for(const child of pupils.children)child.userData.update?.(options.time||0,!!options.reducedMotion);
 }
 update();
 function dispose(){if(disposed)return;disposed=true;for(const fn of cleanup)fn();for(const g of geometries)g.dispose();for(const m of materials.values())m.dispose();group.removeFromParent();}
 return {group,bounds:SCHOOL_LAYOUT.bounds,eyeHeight:SCHOOL_LAYOUT.eyeHeight,setupAnchor:SCHOOL_LAYOUT.setupAnchor,anchor:{position:{...SCHOOL_LAYOUT.playerStart,y:0},lookTarget:{x:0,y:.9,z:0},eyeHeight:.9},colliders:schoolColliders,update,dispose};
}
