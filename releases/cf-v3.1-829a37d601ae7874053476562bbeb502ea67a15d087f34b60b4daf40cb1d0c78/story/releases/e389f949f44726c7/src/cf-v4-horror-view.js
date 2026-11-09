import * as THREE from 'three';
import {sampleCrawlingHand,sampleWayneHandPath,HORROR_TIMING,RANDALL_AMBUSH_SITE} from './cf-v4-scripted-horror.js';
import {wetGroundHeight} from './environment-materials.js';

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
export function createHorrorSet({kind='wayne',ambusher=null} = {}) {
  if(!['wayne','patrol','randall','hand'].includes(kind))throw new TypeError('Unknown horror set');
  const group=new THREE.Group();group.name=`V4_${kind.toUpperCase()}_SET`;
  const geometries=new Set(),materials=new Map(),colliders=[],cleanups=[];
  let disposed=false;
  function material(color){if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.92}));return materials.get(color);}
  function box(name,w,h,d,x,y,z,color=0x747875,solid=false,parent=group){
    const g=new THREE.BoxGeometry(w,h,d);geometries.add(g);const m=new THREE.Mesh(g,material(color));m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);
    if(solid)colliders.push({id:name,minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});return m;
  }
  function sphere(name,r,x,y,z,color,parent=group){const g=new THREE.SphereGeometry(r,10,8);geometries.add(g);const m=new THREE.Mesh(g,material(color));m.name=name;m.position.set(x,y,z);parent.add(m);return m;}
  const hand=createV4CrawlingHand();cleanups.push(()=>hand.dispose());group.add(hand.root);
  let bounds,anchor,interactionTargets=[],brad=null,dog=null,creature=null,coolerHinge=null,pistol=null;
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
    interactionTargets=[{id:'wayne-container',action:'examine-container',position:{x:0,y:1,z:.25},proximityPoint:{x:0,y:0,z:1.2},radius:1.25}];
    hand.update({position:{x:0,y:1.19,z:.25}});
  } else {
    bounds={polyline:[[19,7],[24,7],[27,10],[30,10]],halfWidth:.9};
    anchor={id:'RANDALL_PATROL',position:{x:24,y:0,z:7},lookTarget:{x:27,y:1.58,z:10},eyeHeight:1.58};
    // The containing view supplies original cornfield geometry and terrain.
    hand.root.visible=kind==='hand';
    hand.update({position:{x:28.7,y:.03,z:9.4}});
    if(kind!=='hand'){
      brad=new THREE.Group();brad.name='BRAD_IRIS';group.add(brad);
      box('Brad uniform torso',.43,.6,.24,0,1.12,0,0x263c4d,false,brad);
      sphere('Brad face',.15,0,1.59,0,0xa98268,brad);
      box('Brad cap',.34,.1,.3,0,1.75,0,0x263c4d,false,brad);
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
        creature=ambusher||new THREE.Group();creature.name='SCRIPTED_AMBUSHER_ONLY';creature.visible=false;
        if(!ambusher){
          group.add(creature);
          box('creature torso',.5,.75,.3,0,1.13,0,0x737970,false,creature);sphere('creature head',.2,0,1.7,0,0x858b80,creature);
          for(const side of [-1,1]){box('creature leg',.15,.75,.17,side*.15,.42,0,0x606a60,false,creature);const arm=box('reaching arm',.13,.8,.13,side*.3,1.15,-.32,0x737970,false,creature);arm.rotation.x=-.9;}
        }
      }
      brad.position.set(25.2,0,7.2);dog.position.set(25.7,0,7.6);
    }
  }
  function update(snapshot={}, {player=null,reducedEffects=false,time=0,prelude=false}={}) {
    if(disposed)return;
    if(kind==='wayne'){
      const elapsed=Number.isFinite(snapshot.elapsed)?snapshot.elapsed:0;
      const phase=snapshot.phase||'prelude';const hunting=!prelude&&['hunt','capture'].includes(phase);
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
      hand.update({activeSeconds:prelude?time:elapsed,moving:hunting||phase==='examined',captureProgress:snapshot.captureProgress||0,reducedEffects,position:hunting?base:{x:0,y:1.19,z:.25},yaw:0});
    }else if(brad){
      const phase=snapshot.phase||'patrol',attack=['grab','bite','retreat'].includes(phase);
      const seconds=snapshot.phaseTime||0;
      const origin=snapshot.ambushOrigin||player;
      if(creature&&origin){
        creature.visible=attack;
        const yaw=Number.isFinite(origin.yaw)?origin.yaw:0;
        const retreat=unit((seconds-HORROR_TIMING.randallRetreat)/(HORROR_TIMING.randallMedic-HORROR_TIMING.randallRetreat));
        const lowering=phase==='bite'?unit((seconds-HORROR_TIMING.randallBite)/.55):phase==='retreat'?1-retreat:0;
        const distance=phase==='grab'?THREE.MathUtils.lerp(1.35,.58,unit(seconds/.46)):phase==='bite'?.72:THREE.MathUtils.lerp(.72,4.5,retreat);
        const x=origin.x-Math.sin(yaw)*distance,z=origin.z-Math.cos(yaw)*distance;
        creature.position.set(x,wetGroundHeight(x,z)-.47*lowering,z);
        creature.rotation.set(-1.02*lowering,yaw,0,'YXZ');
      }
      // Keep companions on the authored route without sharing player collision.
      const trailProgress=origin?unit((origin.x-24+origin.z-7)/6):0;
      const bradX=THREE.MathUtils.lerp(25.2,RANDALL_AMBUSH_SITE.x-.9,trailProgress);
      const bradZ=THREE.MathUtils.lerp(7.2,RANDALL_AMBUSH_SITE.z+.65,trailProgress);
      brad.position.set(bradX,wetGroundHeight(bradX,bradZ),bradZ);
      brad.rotation.y=attack?Math.atan2(bradX-creature.position.x,bradZ-creature.position.z):-Math.PI*.7;
      pistol.visible=attack;pistol.parent.rotation.x=attack?1.4+.12*Math.sin(seconds*16):0;
      const dogRetreat=kind==='randall'?unit(seconds/2):0;
      const dogX=THREE.MathUtils.lerp(25.7,RANDALL_AMBUSH_SITE.x+.85,trailProgress)-dogRetreat;
      const dogZ=THREE.MathUtils.lerp(7.6,RANDALL_AMBUSH_SITE.z-.45,trailProgress)+dogRetreat*.5;
      dog.position.set(dogX,wetGroundHeight(dogX,dogZ),dogZ);
      dog.rotation.y=(dogRetreat>0?1.4:-Math.PI*.65)+Math.sin(time*.6)*.12;
      const stride=reducedEffects?.12:.4;
      const gait=phase==='patrol'?(snapshot.walked||0)*9:0;
      bradLegs.forEach((leg,index)=>{leg.rotation.x=Math.sin(gait+index*Math.PI)*stride;});
      dogLegs.forEach((leg,index)=>{leg.rotation.x=Math.sin(gait+dogRetreat*10+index*Math.PI*.5)*stride;});
    }
  }
  function dispose(){if(disposed)return;disposed=true;for(const fn of cleanups)fn();for(const g of geometries)g.dispose();for(const m of materials.values())m.dispose();group.removeFromParent();}
  return {group,bounds,anchor,anchors:[anchor],colliders,interactionTargets,hand,update,dispose,requiresVisualQA:true};
}
