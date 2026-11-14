import * as THREE from 'three';
export function createInput() {
  const held=new Set(); let active=false;
  return {held,get active(){return active;},setActive(value){active=Boolean(value);held.clear();},clear(){held.clear();},
    down(code,repeat=false){if(!active||repeat||held.has(code))return false;held.add(code);return true;},up(code){held.delete(code);},has(code){return active&&held.has(code);}};
}
export function createPlayer(world) {
  const config=world.layout.player;const camera=new THREE.PerspectiveCamera(70,1,0.05,80);camera.rotation.order='YXZ';
  const state={...world.layout.spawn,pitch:0}; let sensitivity=0.002;
  function sync(){camera.position.set(state.x,config.eyeHeight,state.z);camera.rotation.set(state.pitch,state.yaw,0,'YXZ');camera.updateMatrixWorld(true);}
  function place(p){if(!p||![p.x,p.z,p.yaw].every(Number.isFinite)||!world.isSafe(p))return false;Object.assign(state,{x:p.x,z:p.z,yaw:p.yaw,pitch:Number.isFinite(p.pitch)?Math.max(-1.35,Math.min(1.35,p.pitch)):0});sync();return true;}
  if(!place(state))throw new Error('Unsafe initial position');
  return {camera,state,sync,place,
    look(dx,dy){if(!Number.isFinite(dx)||!Number.isFinite(dy))return;state.yaw-=Math.max(-1000,Math.min(1000,dx))*sensitivity;state.yaw=((state.yaw+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;state.pitch=Math.max(-1.35,Math.min(1.35,state.pitch-dy*sensitivity));sync();},
    setSensitivity(value){if(!Number.isFinite(value))return false;sensitivity=Math.max(0.0005,Math.min(0.006,value));return true;},
    setFov(value){if(!Number.isFinite(value))return false;camera.fov=Math.max(50,Math.min(95,value));camera.updateProjectionMatrix();return true;},
    move(input,dt){if(!input.active||!Number.isFinite(dt)||dt<=0)return;const forward=Number(input.has('KeyW'))-Number(input.has('KeyS')),side=Number(input.has('KeyD'))-Number(input.has('KeyA'));const length=Math.hypot(forward,side);if(!length)return;const speed=input.has('ShiftLeft')||input.has('ShiftRight')?config.fastSpeed:config.speed;const distance=speed*Math.min(dt,0.25),steps=Math.max(1,Math.ceil(distance/0.06));const dx=(-Math.sin(state.yaw)*forward+Math.cos(state.yaw)*side)/length*distance/steps,dz=(-Math.cos(state.yaw)*forward-Math.sin(state.yaw)*side)/length*distance/steps;
      for(let i=0;i<steps;i++){if(world.isSafe({...state,x:state.x+dx}))state.x+=dx;if(world.isSafe({...state,z:state.z+dz}))state.z+=dz;}sync();},
    near(target,maxDistance=1.65){if(!target)return false;const dx=target.x-state.x,dz=target.z-state.z,dist=Math.hypot(dx,dz);return dist<=maxDistance&&(dist<0.2||(-Math.sin(state.yaw)*dx-Math.cos(state.yaw)*dz)/dist>0.35)&&world.lineClear({...state,y:config.eyeHeight},target);}
  };
}
