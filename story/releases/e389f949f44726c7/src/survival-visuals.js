import * as THREE from 'three';
import {createBloodRoom} from './blood-room.js';
import {GAME_CONFIG} from './game-config.js';
import {createSadie,createClassroom,classroomBeat} from './sadie-classroom.js';

// Reuses the live field and renderer. Only the memory owns a separate scene.
export function createSurvivalVisuals(view,{touch=false}={}){
  const {renderer}=view;
  let scene=null,camera=null,room=null,veil=null,classroom=null,sadie=null,dead=false;
  const stats={active:false,phase:null,projection:'original procedural face',rain:0,pitPlants:0};
  function release(){
    if(sadie){view.scene.remove(sadie);sadie.userData.dispose();sadie=null;}
    if(classroom){classroom.dispose();classroom=null;}
    else if(scene){const owned=new Set();scene.traverse(o=>{if(o.geometry)owned.add(o.geometry);for(const m of [].concat(o.material||[]))owned.add(m);});for(const r of owned)r.dispose();}
    scene=camera=room=veil=null;stats.active=false;
  }
  function addVeil(){
    veil=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({color:0x510007,transparent:true,opacity:0,depthTest:false,depthWrite:false}));
    veil.position.z=-.08;veil.scale.set(.15,.15,1);veil.renderOrder=1000;camera.add(veil);
  }
  function ensureRoom(){
    if(room)return;release();scene=new THREE.Scene();scene.background=new THREE.Color(0x220003);scene.fog=new THREE.FogExp2(0x380305,.025);
    room=createBloodRoom({rain:true,touch});scene.add(room.group);camera=new THREE.PerspectiveCamera(70,1,.065,150);scene.add(camera);
    const flashlight=new THREE.SpotLight(0xffd9c1,3,12,.5,.65,1.2);flashlight.position.set(.1,-.1,-.1);flashlight.target.position.set(0,0,-9);camera.add(flashlight,flashlight.target);room.flashlight=flashlight;addVeil();
  }
  function ensureClassroom(){
    if(classroom)return;release();scene=new THREE.Scene();scene.background=new THREE.Color(0xc5b99c);
    classroom=createClassroom({cornParts:view.introCorn?.()||[]});scene.add(classroom.group);
    camera=new THREE.PerspectiveCamera(65,1,.065,40);scene.add(camera);
  }
  function aspect(){camera.aspect=Math.max(1,renderer.domElement.clientWidth)/Math.max(1,renderer.domElement.clientHeight);camera.updateProjectionMatrix();}
  function render(game,reduced=false){
    if(dead)return;const s=game.survivalEnding,phase=s.phase;
    if(['entry','room','exit'].includes(phase)){
      ensureRoom();const p=s.roomPlayer;aspect();camera.position.set(p.x,GAME_CONFIG.player.eyeHeight+(reduced||!game.player.moving?0:Math.sin(game.steps*7)*.021),p.z);camera.rotation.set(p.pitch,p.yaw,0,'YXZ');
      room.update(s.time,reduced);room.flashlight.intensity=game.player.flashlightOn?3:0;stats.rain=reduced?24:touch?48:96;
      veil.material.opacity=phase==='entry'?Math.max(0,1-s.time/2):phase==='exit'?Math.min(1,s.time/1.5):0;
      renderer.render(scene,camera);view.renderPrologueEquipment?.(camera,{chapter:'redroom',time:game.elapsed,player:game.player,reduced});
    }else if(phase==='sadie'||phase==='collapse'){
      if(scene)release();
      if(!sadie){sadie=createSadie();sadie.position.set(s.center.x,0,s.center.z);sadie.rotation.y=Math.atan2(s.origin.x-s.center.x,s.origin.z-s.center.z);view.scene.add(sadie);}
      sadie.visible=phase==='sadie';sadie.userData.update(s.time,reduced);
      view.render(game,game.elapsed,reduced);
      if(phase==='collapse'){
        // Clarence falls on the existing ground; Sadie is out of view, not harmed.
        const t=Math.min(1,s.time/2.1);view.camera.position.y=GAME_CONFIG.player.eyeHeight*(1-t)+.22*t;
        view.camera.rotation.z=reduced?0:t*.45;view.camera.rotation.x=-.22*t;
        const prior=view.camera.layers.mask;view.camera.layers.set(0);renderer.render(view.scene,view.camera);view.camera.layers.mask=prior;
      }
    }else if(phase==='classroom'){
      ensureClassroom();aspect();camera.position.copy(classroom.eye);camera.lookAt(classroom.target);
      const initialYaw=camera.rotation.y,initialPitch=camera.rotation.x;
      camera.rotation.set(initialPitch+game.player.pitch,initialYaw+game.player.yaw,0,'YXZ');
      classroom.setEcho(classroomBeat(s.time).echo);renderer.render(scene,camera);
    }else{
      // Identity UI is opaque above this clear while loading/changing viewpoints.
      if(scene||sadie)release();renderer.setClearColor(0x000000,1);renderer.clear();
    }
    stats.active=true;stats.phase=phase;
  }
  return {render,release,dispose(){release();dead=true;},diagnostics:()=>({...stats})};
}
