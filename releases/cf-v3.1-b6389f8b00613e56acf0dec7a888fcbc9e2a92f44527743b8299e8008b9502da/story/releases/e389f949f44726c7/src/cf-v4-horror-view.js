import * as THREE from 'three';
import {SAFE_LOWER_SECONDS} from './cf-v4-finale.js';
import {PATROL_LANDMARK,SEARCH_TRAIL_BOUNDS,patrolLead} from './cf-v4-patrol-layout.js';
import {sampleCrawlingHand,sampleWayneHandPath,RANDALL_AMBUSH_SITE} from './cf-v4-scripted-horror.js';
import {wetGroundHeight} from './environment-materials.js';
import {sampleSpeech} from './prologue-speech.js';

const unit=value=>Math.max(0,Math.min(1,value));

// Small original native hand presentation. Caller owns the scene and camera.
// No borrowed model, asynchronous load, second renderer, clock or collision loop.
// This must receive rendered visual QA before being called final art.
export function createV4CrawlingHand({color=0x747875} = {}) {
  const root = new THREE.Group(); root.name = 'V4_GRAY_HAND';
  const material = new THREE.MeshStandardMaterial({color,roughness:.96});
  const geometries = new Set(), fingers = [];
  const box = (name,w,h,d,x,y,z,parent=root) => {
    const geometry=new THREE.BoxGeometry(w,h,d);geometries.add(geometry);
    const mesh=new THREE.Mesh(geometry,material);mesh.name=name;mesh.position.set(x,y,z);
    mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  };
  box('palm',.16,.045,.18,0,.045,0);
  box('wrist',.10,.04,.07,0,.045,.115);
  for(let i=0;i<5;i++) {
    const finger=new THREE.Group();finger.name=`finger-${i}`;
    const thumb=i===0;
    finger.position.set(thumb?-.10:-.065+(i-1)*.043,.045,thumb?.015:-.095);
    if(thumb)finger.rotation.y=-.8;
    root.add(finger);
    const length=thumb?.085:[.13,.15,.14,.11][i-1];
    box('proximal',.029,.028,length*.55,0,0,-length*.275,finger);
    const tip=new THREE.Group();tip.position.z=-length*.55;finger.add(tip);
    box('distal',.024,.025,length*.45,0,0,-length*.225,tip);
    fingers.push({finger,tip});
  }
  let disposed=false;
  function update({activeSeconds=0,moving=false,captureProgress=0,reducedEffects=false,position=null,yaw=0}={}) {
    if(disposed)return;
    const pose=sampleCrawlingHand(activeSeconds,{captureProgress,reducedEffects});
    if(position&&['x','y','z'].every(k=>Number.isFinite(position[k])))root.position.set(position.x,position.y,position.z);
    root.rotation.y=Number.isFinite(yaw)?yaw:0;
    root.rotation.x=moving?pose.lunge*.85:0;
    for(let i=0;i<fingers.length;i++) {
      const bend=moving?pose.fingers[i]:.04;
      fingers[i].finger.rotation.x=bend;
      fingers[i].tip.rotation.x=moving?Math.max(0,-bend)*1.4:.08;
    }
    // Bob only the palm actor's children, never add offsets cumulatively.
    root.userData.v4Hand={moving,pose,requiresVisualQA:true};
    return pose;
  }
  function dispose() {
    if(disposed)return;disposed=true;root.removeFromParent();
    for(const g of geometries)g.dispose();material.dispose();
  }
  update();return {root,update,dispose};
}

// Native functional encounter staging. Patrol props use existing SEARCH_TRAIL
// world coordinates and do not create a replacement cornfield or gameplay loop.
export function createHorrorSet({kind='wayne',ambushers=[],patrolBounds=SEARCH_TRAIL_BOUNDS} = {}) {
  if(!['wayne','patrol','randall','hand'].includes(kind))throw new TypeError('Unknown horror set');
  const group=new THREE.Group();group.name=`V4_${kind.toUpperCase()}_SET`;
  const geometries=new Set(),materials=new Map(),colliders=[],cleanups=[];
  let disposed=false;
  function material(color){if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.92}));return materials.get(color);}
  function box(name,w,h,d,x,y,z,color=0x747875,solid=false,parent=group){
    const g=new THREE.BoxGeometry(w,h,d);geometries.add(g);const m=new THREE.Mesh(g,material(color));m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);
    if(solid)colliders.push({id:name,minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});return m;
  }
  function sphere(name,r,x,y,z,color,parent=group){const g=new THREE.IcosahedronGeometry(r,1);geometries.add(g);const m=new THREE.Mesh(g,material(color));m.name=name;m.position.set(x,y,z);parent.add(m);return m;}
  const hand=createV4CrawlingHand();cleanups.push(()=>hand.dispose());group.add(hand.root);
  let bounds,anchor,interactionTargets=[],brad=null,dog=null,coolerHinge=null,pistol=null,bradMouth=null,encounterLight=null,shotLight=null;
  let handScuffs=null;
  const scuffTimes=[4.5,8,11.5,15,18.5,22,25.5];
  const bradLegs=[],dogLegs=[];
  if(kind==='wayne') {
    bounds={x:[-3.7,3.7],z:[-5.7,3.7]};
    anchor={id:'WAYNE_LAB_ENTRY',position:{x:0,y:0,z:2.8},lookTarget:{x:0,y:.9,z:.2},eyeHeight:1.58};
    box('lab floor',8,.12,10,0,-.06,-1,0x777c75);
    box('lab ceiling',8,.12,10,0,2.85,-1,0xc4c2ad);
    for(const x of [-4,4])box('outer lab wall',.15,2.8,10,x,1.4,-1,0xa1aaa1,true);
    for(const z of [-6,4])box('outer lab end',8,2.8,.15,0,1.4,z,0xa1aaa1,true);
    // Main lab z>-1, connector -3<z<-1, bathroom z<-3. Two
    // offset openings make hiding spatially readable without a maze subsystem.
    box('lab divider left',3,2.8,.14,-2.5,1.4,-1,0xa1aaa1,true);
    box('lab divider right',3,2.8,.14,2.5,1.4,-1,0xa1aaa1,true);
    box('lab door lintel',2,.6,.14,0,2.5,-1,0xa1aaa1);
    box('bathroom divider left',5,2.8,.14,-1.5,1.4,-3,0xb8b9ac,true);
    box('bathroom divider right',1,2.8,.14,3.5,1.4,-3,0xb8b9ac,true);
    box('bathroom lintel',2,.6,.14,2,2.5,-3,0xb8b9ac);
    box('examination table',1.5,.10,.9,0,.83,.25,0x8a9690,true);
    for(const x of [-.65,.65])for(const z of [-.1,.6])box('table leg',.07,.8,.07,x,.4,z,0x535d59);
    box('transport cooler',.48,.30,.36,0,1.03,.25,0xadb9b1);
    coolerHinge=new THREE.Group();coolerHinge.position.set(0,1.20,.055);group.add(coolerHinge);
    box('cooler lid',.51,.05,.39,0,0,.195,0x435952,false,coolerHinge);
    box('case notebook',.24,.025,.30,.5,.90,.25,0xc1bd9d);
    box('examination overhead lamp',.65,.10,.38,0,2.4,.25,0xe5dec0);
    box('storage cabinet',.7,1.65,1,-3.45,.825,1.8,0x697970,true);
    box('bathroom sink',.65,.95,.55,-2.8,.475,-5.2,0xc2c4bb,true);
    box('sink backing',.75,.65,.04,-2.8,1.38,-5.68,0x84958e);
    box('toilet base',.55,.5,.72,.3,.25,-5.2,0xc2c4bb,true);
    box('toilet tank',.6,.65,.25,.3,.68,-5.55,0xc2c4bb);
    box('bathroom concealment fixture',.8,1.45,.8,3.15,.725,-4.85,0x737d74,true);
    const light=new THREE.HemisphereLight(0xe8e3c9,0x333a38,1.6);group.add(light);
    const scuffGeometry=new THREE.BoxGeometry(.045,.002,.19);
    geometries.add(scuffGeometry);
    handScuffs=new THREE.InstancedMesh(scuffGeometry,material(0x505852),scuffTimes.length);
    handScuffs.name='Hand trail scuffs';
    const scratch=new THREE.Object3D();
    for(const [index,time] of scuffTimes.entries()){
      const p=sampleWayneHandPath(time),next=sampleWayneHandPath(time+.1);
      scratch.position.set(p.x,.004,p.z);
      scratch.rotation.y=Math.atan2(next.x-p.x,next.z-p.z)+.22;
      scratch.updateMatrix();
      handScuffs.setMatrixAt(index,scratch.matrix);
    }
    handScuffs.computeBoundingSphere();
    handScuffs.count=0;group.add(handScuffs);
    cleanups.push(()=>handScuffs.dispose());
    interactionTargets=[{id:'wayne-container',action:'examine-container',position:{x:0,y:1,z:.25},proximityPoint:{x:0,y:0,z:1.2},radius:1.25}];
    hand.update({position:{x:0,y:1.19,z:.25}});
  } else {
    bounds=patrolBounds;
    anchor={id:'RANDALL_PATROL',position:{x:24,y:0,z:7},lookTarget:{x:27,y:1.58,z:10},eyeHeight:1.58};
    // The containing view supplies original cornfield geometry and terrain.
    hand.root.visible=kind==='hand';
    hand.update({position:{x:28.7,y:.03,z:9.4}});
    if(kind==='patrol'){
      const {x,z}=PATROL_LANDMARK,y=wetGroundHeight(x,z);
      const stake=box('Split field marker',.085,1.15,.08,x,y+.575,z,0x60554a);
      stake.rotation.z=-.11;
      const cloth=box('Torn cloth on field marker',.19,.12,.02,x+.04,y+1.02,z,0xafae8a);
      cloth.rotation.set(.17,.7,-.32);
    }
    if(kind!=='hand'){
      brad=new THREE.Group();brad.name='BRAD_IRIS';group.add(brad);
      box('Brad uniform torso',.43,.6,.24,0,1.12,0,0x263c4d,false,brad);
      sphere('Brad face',.15,0,1.59,0,0xa98268,brad);
      bradMouth=box('Brad mouth',.072,.016,.013,0,1.54,-.134,0x392523,false,brad);
      box('Brad cap',.34,.1,.3,0,1.75,0,0x263c4d,false,brad);
      box('Brad cap brim',.29,.033,.16,0,1.72,-.18,0x263c4d,false,brad);
      for(const x of [-.058,.058])box('Brad eye',.034,.017,.014,x,1.61,-.128,0x332b24,false,brad);
      for(const side of [-1,1]){
        const leg=new THREE.Group();leg.position.set(side*.11,.81,0);brad.add(leg);bradLegs.push(leg);
        box('Brad leg',.14,.7,.15,0,-.35,0,0x263c4d,false,leg);
        box('Brad shoe',.16,.1,.28,0,-.74,-.045,0x252422,false,leg);
        const arm=new THREE.Group();arm.position.set(side*.29,1.38,0);brad.add(arm);
        box('Brad arm',.12,.6,.12,0,-.3,0,0x263c4d,false,arm);
        if(side===1){pistol=box('Brad service pistol',.08,.14,.24,0,-.63,-.05,0x262727,false,arm);pistol.visible=false;}
      }
      dog=new THREE.Group();dog.name='OLIVE_BLOODHOUND_NATIVE';group.add(dog);
      box('Olive body',.32,.35,.65,0,.45,0,0x805d3d,false,dog);
      box('Olive head',.25,.3,.32,0,.62,-.43,0x805d3d,false,dog);
      box('Olive muzzle',.2,.13,.20,0,.53,-.64,0x352b23,false,dog);
      for(const side of [-1,1]){
        box('Olive drooping ear',.08,.36,.19,side*.17,.49,-.42,0x563f2c,false,dog);
        for(const z of [-.25,.25]){
          const leg=new THREE.Group();leg.position.set(side*.12,.34,z);dog.add(leg);dogLegs.push(leg);
          box('Olive leg',.08,.34,.09,0,-.17,0,0x805d3d,false,leg);
        }
      }
      if(kind==='randall'){
        encounterLight=new THREE.PointLight(0xc6d4c0,1.9,6,2);group.add(encounterLight);
        shotLight=new THREE.PointLight(0xffb478,0,4,2);group.add(shotLight);
      }
      brad.position.set(25.2,0,7.2);dog.position.set(25.7,0,7.6);
    }
  }
  function update(snapshot={}, {player=null,reducedEffects=false,time=0,prelude=false,speechLine=null}={}) {
    if(disposed)return;
    if(kind==='wayne'){
      const elapsed=Number.isFinite(snapshot.elapsed)?snapshot.elapsed:0;
      const phase=snapshot.phase||'prelude';const hunting=!prelude&&['hunt','capture'].includes(phase);
      if(!hunting)handScuffs.count=0;
      else{
       while(handScuffs.count>0&&scuffTimes[handScuffs.count-1]>elapsed)handScuffs.count--;
       while(handScuffs.count<scuffTimes.length&&scuffTimes[handScuffs.count]<=elapsed)handScuffs.count++;
      }
      const target=player&&Number.isFinite(player.x)&&Number.isFinite(player.z)?player:{x:2,z:-4};
      const base=sampleWayneHandPath(elapsed);
      if(phase==='capture'){
        const progress=snapshot.captureProgress||0, approach=unit(progress/.72);
        const path=[base];
        if(target.z>-3)path.push({x:2,z:-3});
        if(target.z>-1)path.push({x:0,z:-1});
        const yaw=target.yaw||0;
        path.push({x:target.x-Math.sin(yaw)*.36,z:target.z-Math.cos(yaw)*.36});
        const step=approach*(path.length-1), index=Math.min(path.length-2,Math.floor(step)),from=path[index],to=path[index+1];
        base.x=THREE.MathUtils.lerp(from.x,to.x,step-index);
        base.z=THREE.MathUtils.lerp(from.z,to.z,step-index);
        base.y=.03+1.45*unit((progress-.62)/.38);
      }
      const open=!prelude||phase==='examined';
      coolerHinge.rotation.x=open?-1.46:0;
      hand.root.visible=open&&phase!=='fatal';
      const drop=Number.isFinite(snapshot.dropAt)?unit((time-snapshot.dropAt)/.42):0;
      hand.update({activeSeconds:prelude?time:elapsed,moving:hunting||drop>=1,captureProgress:snapshot.captureProgress||0,reducedEffects,position:hunting?base:{x:.48*drop,y:1.19-1.16*drop*drop,z:.25+.38*drop},yaw:drop*.65});
    }else if(brad){
      const phase=snapshot.phase||'patrol',seconds=snapshot.phaseTime||0,origin=snapshot.contact||player;
      const attackers=snapshot.attackers||[];
      const contact=snapshot.contact,ankle=contact?.attacker==='flanker';
      const down=ankle?unit((snapshot.elapsed-contact.at)/.3):0;
      const target=attackers[ankle?1:0];
      for(const [index,{root,rig}] of ambushers.entries()){
        const actor=attackers[index];root.visible=!!actor?.visible;
        if(!root.visible)continue;
        root.scale.setScalar(index===0?1.04:.88);
        const low=index===1?down*(phase==='retreat'?1-unit(seconds/.5):1):0;
        const attached=contact?.attacker===actor.id&&phase!=='retreat'&&phase!=='medic';
        root.position.set(actor.x,wetGroundHeight(actor.x,actor.z)-.05*low,actor.z);
        root.rotation.set(.22*low,actor.yaw+Math.PI,0,'YXZ');
        const interaction=attached?{phase:phase==='grab'?'standing_grab':'qte',phaseStartedAt:contact.at,presses:snapshot.struggleCount||0,targetPresses:4}:null;
        rig.update({enemy:{...actor,state:actor.moving?'chase':'cinematic_idle',stateStartedAt:0},interaction},time,{reduced:reducedEffects});
      }
      const trailProgress=origin?unit((origin.x-24+origin.z-7)/6):0;
      const inEncounter=kind==='randall'&&!!origin;
      const patrolBrad=kind==='patrol'&&player?patrolLead(bounds.polyline,player,1.3):null;
      const patrolDog=kind==='patrol'&&player?patrolLead(bounds.polyline,player,1.9):null;
      const yaw=origin?.yaw||0,forwardX=-Math.sin(yaw),forwardZ=-Math.cos(yaw),rightX=Math.cos(yaw),rightZ=-Math.sin(yaw);
      const bradX=patrolBrad?.x??(inEncounter?origin.x+forwardX+rightX*.93:THREE.MathUtils.lerp(25.2,RANDALL_AMBUSH_SITE.x-.9,trailProgress));
      const bradZ=patrolBrad?.z??(inEncounter?origin.z+forwardZ+rightZ*.93:THREE.MathUtils.lerp(7.2,RANDALL_AMBUSH_SITE.z+.65,trailProgress));
      brad.position.set(bradX,wetGroundHeight(bradX,bradZ),bradZ);
      const aim=target&&(phase==='grab'||phase==='run'&&seconds<.65||['command','bite','retreat'].includes(phase));
      brad.rotation.y=patrolBrad?.yaw??(aim?Math.atan2(bradX-target.x,bradZ-target.z):phase==='medic'?Math.atan2(bradX-origin.x,bradZ-origin.z):-Math.PI*.7);
      pistol.visible=!!aim;pistol.parent.rotation.x=aim?(ankle?1.05:1.38):0;
      const speaking=speechLine?.speaker==='BRAD_IRIS'&&speechLine.playing;
      bradMouth.scale.y=speaking&&!reducedEffects?1+sampleSpeech(speechLine.id,speechLine.offsetSeconds)*1.8:1;
      if(encounterLight&&origin){
        encounterLight.position.set(origin.x,wetGroundHeight(origin.x,origin.z)+1.85,origin.z);
        shotLight.position.copy(brad.position);shotLight.position.y+=1.29;
        shotLight.intensity=!reducedEffects&&['run','retreat'].includes(phase)?9*(1-unit(seconds/.11)):0;
      }
      const lunge=phase==='ankle'?Math.sin(Math.PI*unit(seconds/.72)):0;
      const dogOffset=ankle?.98-.49*lunge:.8;
      const dogX=patrolDog?.x??(inEncounter?origin.x+forwardX*.81-rightX*dogOffset:THREE.MathUtils.lerp(25.7,RANDALL_AMBUSH_SITE.x+.85,trailProgress));
      const dogZ=patrolDog?.z??(inEncounter?origin.z+forwardZ*.81-rightZ*dogOffset:THREE.MathUtils.lerp(7.6,RANDALL_AMBUSH_SITE.z-.45,trailProgress));
      dog.position.set(dogX,wetGroundHeight(dogX,dogZ)+lunge*.17,dogZ);
      dog.rotation.y=patrolDog?.yaw??(ankle&&target?Math.atan2(dogX-target.x,dogZ-target.z):-Math.PI*.65);
      const stride=reducedEffects?.12:.4;
      const gait=phase==='patrol'?(snapshot.walked||0)*9:phase==='run'?seconds*12:0;
      bradLegs.forEach((leg,index)=>{leg.rotation.x=Math.sin(gait+index*Math.PI)*stride;});
      dogLegs.forEach((leg,index)=>{leg.rotation.x=Math.sin(gait+lunge*3+index*Math.PI*.5)*stride;});
    }
  }
  function dispose(){if(disposed)return;disposed=true;for(const fn of cleanups)fn();for(const g of geometries)g.dispose();for(const m of materials.values())m.dispose();group.removeFromParent();}
  return {group,bounds,anchor,anchors:[anchor],colliders,interactionTargets,hand,update,dispose,requiresVisualQA:true};
}

function crowdGeometry(){
  const positions=[],colors=[];
  function part(geometry,color,x,y,z,sx=1,sy=1,sz=1,tilt=0){
    const shape=geometry.index?geometry.toNonIndexed():geometry;
    shape.scale(sx,sy,sz).rotateZ(tilt).translate(x,y,z);
    const vertices=shape.getAttribute('position'),tint=new THREE.Color(color);
    for(let i=0;i<vertices.count;i+=3){
      const shade=.78+.20*((i*17)%13)/12;
      for(let j=i;j<i+3;j++){
        positions.push(vertices.getX(j),vertices.getY(j),vertices.getZ(j));
        colors.push(tint.r*shade,tint.g*shade,tint.b*shade);
      }
    }
    shape.dispose();if(shape!==geometry)geometry.dispose();
  }
  part(new THREE.IcosahedronGeometry(.49,0),0x392a32,0,1.22,0,.88,1.34,.62,-.07);
  part(new THREE.IcosahedronGeometry(.22,0),0x6a5651,.065,1.86,.14,.9,1.14,.88,-.14);
  part(new THREE.IcosahedronGeometry(.07,0),0x7f645c,.07,1.81,.30,.72,1.05,.8,-.14);
  for(const side of [-1,1]){
    part(new THREE.BoxGeometry(.19,.87,.22),0x352830,side*.17,.46,0,1,1,1,side*.11);
    part(new THREE.BoxGeometry(.14,.73,.17),0x63504b,side*.41,1.12,.08,1,1,1,side*.23);
    part(new THREE.BoxGeometry(.045,.020,.023),0xffa179,.065+side*.060,1.89,.312);
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  return geometry;
}

// The background is a pool of transforms over one silhouette and one material.
// Foreground rigs and the physical safe are owned by the same scene as the pool.
export function createCreatureRevelation(scene,actors,{getQuality=()=>null,density='standard'}={}){
  const group=new THREE.Group();group.name='Creature safe and horde';scene.add(group);
  const geometry=crowdGeometry(),material=new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false});
  const clock={value:0};
  material.onBeforeCompile=shader=>{
    shader.uniforms.crowdTime=clock;
    shader.vertexShader='uniform float crowdTime;\n'+shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      float swayPhase = instanceMatrix[3].x * 1.31 + instanceMatrix[3].z * .71;
      transformed.x += sin(crowdTime * 1.3 + swayPhase) * .095 * position.y;
      transformed.z += cos(crowdTime * 1.1 + swayPhase) * .048 * position.y;`);
  };
  const pose=new THREE.Object3D(),tint=new THREE.Color();
  const jitter=seed=>((Math.sin(seed*91.713)*43758.5453)%1+1)%1;
  const rowSize=26;
  const batchCount=density==='maximum'?6:density==='dense'?5:4;
  const batches=Array.from({length:batchCount},(_,batch)=>{
    const pool=new THREE.InstancedMesh(geometry,material,rowSize*2);
    pool.name=`Horde rows ${batch*2+1}–${batch*2+2}`;
    for(let i=0;i<pool.count;i++){
      const row=batch*2+Math.floor(i/rowSize),column=i%rowSize,seed=row*rowSize+column+1;
      const height=.77+jitter(seed+210)*.55;
      pose.position.set((column-(rowSize-1)/2)*(1.05+row*.135)+(jitter(seed)-.5)*.68,
        row*.5+Math.max(0,row-5)*.1,-5.1-row*2.32+(jitter(seed+440)-.5)*1.18);
      pose.rotation.set(-.13+jitter(seed+550)*.25,(jitter(seed+660)-.5)*1.55,(jitter(seed+770)-.5)*.22);
      pose.scale.set(.75+jitter(seed+330)*.58,height,.84);
      pose.updateMatrix();pool.setMatrixAt(i,pose.matrix);
      tint.setRGB(.72+jitter(seed+880)*.32,.54+jitter(seed+990)*.4,.61+jitter(seed+115)*.33);
      pool.setColorAt(i,tint);
    }
    pool.computeBoundingSphere();
    // GPU wind bends the silhouette beyond the static instance bounds.
    pool.boundingSphere.radius+=.31;
    group.add(pool);return pool;
  });
  scene.background=new THREE.Color(0x501c24);scene.fog=new THREE.FogExp2(0x501c24,.041);
  const sky=scene.getObjectByName('Shared narrative sky');if(sky)sky.visible=false;
  const rim=new THREE.PointLight(0xff6355,12,13,2);rim.position.set(1.3,2.7,-4.2);group.add(rim);
  const fill=new THREE.PointLight(0xeac9a2,4.3,7,2);fill.position.set(-.55,1.65,.65);group.add(fill);
  const steel=new THREE.MeshStandardMaterial({color:0x504943,roughness:.82,flatShading:true});
  const dark=new THREE.MeshBasicMaterial({color:0x10090c});
  const props=[];
  function box(name,w,h,d,x,y,z,mat=steel,parent=group){
    const shape=new THREE.BoxGeometry(w,h,d),mesh=new THREE.Mesh(shape,mat);
    mesh.name=name;mesh.position.set(x,y,z);parent.add(mesh);props.push(shape);return mesh;
  }
  box('safe shaft',2.05,.03,1.15,0,.015,-2.32,dark);
  for(const side of [-1,1])box('safe side rail',.15,.17,1.38,side*1.03,.09,-2.32);
  for(const z of [-3.02,-1.62])box('safe cross rail',2.2,.17,.17,0,.09,z);
  const hinge=new THREE.Group();hinge.name='Safe lid hinge';hinge.position.set(0,.17,-3.02);group.add(hinge);
  box('heavy safe lid',2.24,.09,1.41,0,0,.705,steel,hinge);
  box('latch handle',.34,.09,.15,0,.08,1.19,steel,hinge);
  const ropeShape=new THREE.BufferGeometry(),ropePoints=new THREE.BufferAttribute(new Float32Array(9),3);
  ropeShape.setAttribute('position',ropePoints);ropeShape.computeBoundingSphere();
  const ropeMat=new THREE.LineBasicMaterial({color:0xcfaa7c});
  const rope=new THREE.Line(ropeShape,ropeMat);rope.name='vermin restraint';rope.frustumCulled=false;group.add(rope);
  const [leader,prisoner,left,right]=actors;
  const leadHand=leader?.rig.model.getObjectByName('Bip01_R_Hand')||leader?.rig.model.getObjectByName('Bip01 R Hand');
  const a=new THREE.Vector3(),b=new THREE.Vector3();
  const lerp=THREE.MathUtils.lerp;
  let disposed=false;
  function update({time=0,reveal=null,reduced=false,speechLine=null}={}){
    if(disposed)return;
    const lowQuality=(getQuality()?.pixelRatio??1)<1;
    for(const [index,pool] of batches.entries()){
      pool.count=lowQuality&&index>1?(index<4?12:0):rowSize*2;
      pool.visible=index<2||reveal?.tugAt!=null&&time-reveal.tugAt>=(index-2)*.18;
    }
    clock.value=reduced?0:time;
    const tug=reveal?.tugAt==null?0:Math.sin(Math.PI*unit((time-reveal.tugAt)/.75));
    rim.intensity=12+(reduced?0:3*tug);
    const sinceLower=reveal?.lowerAt==null?0:Math.max(0,time-reveal.lowerAt);
    const closeStart=1.73;
    const slide=unit(sinceLower/.78),sink=unit((sinceLower-.62)/1.19),close=unit((sinceLower-closeStart)/(SAFE_LOWER_SECONDS-closeStart));
    hinge.rotation.x=lerp(-2.18,0,close*close);
    if(!leader||!prisoner)return;
    leader.root.position.set(-.86-.13*tug,0,-1.37-slide*.28);
    leader.root.rotation.set(.13*tug+.24*slide,1.04,0,'YXZ');
    prisoner.root.position.set(lerp(.58,.08,slide)-.15*tug,-1.66*sink,lerp(-1.23,-2.28,slide));
    const speaking=speechLine?.speaker==='LEASHED_CREATURE'&&speechLine.playing;
    const pleading=speaking&&!reduced?sampleSpeech(speechLine.id,speechLine.offsetSeconds)*.065:0;
    prisoner.root.scale.set(.84,.69,.84);
    prisoner.root.rotation.set(.14+.18*tug+pleading+.28*sink,.05-.45*slide,-.13*tug,'YXZ');
    prisoner.root.visible=sink<1;
    if(left&&right){
      left.root.position.x=-1.74+.28*slide;right.root.position.x=1.68-.37*slide;
      left.root.rotation.x=.17*slide;right.root.rotation.x=.23*slide;
    }
    const lead=leader.root.position;
    if(leadHand)leadHand.getWorldPosition(a);
    else a.set(lead.x+.29,lead.y+.93,lead.z+.17);
    prisoner.rig.getEyeWorld('left',b);b.y-=.16;
    rope.visible=close<.25;
    ropePoints.setXYZ(0,a.x,a.y,a.z);
    ropePoints.setXYZ(1,(a.x+b.x)/2,Math.max(.12,(a.y+b.y)/2-.16+.08*tug),(a.z+b.z)/2+.13);
    ropePoints.setXYZ(2,b.x,b.y,b.z);
    ropePoints.needsUpdate=true;
  }
  update();
  return {update,dispose(){if(disposed)return;disposed=true;group.removeFromParent();for(const pool of batches)pool.dispose();geometry.dispose();material.dispose();steel.dispose();dark.dispose();ropeShape.dispose();ropeMat.dispose();for(const shape of props)shape.dispose();}};
}
