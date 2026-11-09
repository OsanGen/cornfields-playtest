import {WOODLAND_LAYOUT,WOODLAND_REVEAL_SECONDS,sampleWoodlandEscape} from './cf-v4-woodland.js';
import {installZombie} from './zombie.js';
// Presentation helper only: caller retains renderer/camera/input/clock ownership.
// Bicycle and refuge geometry are original native substitutes, not recovered assets.
export function createWoodlandView({THREE,parent,layout=WOODLAND_LAYOUT,assetBindings}={}){
  if(!THREE||!parent)throw new Error('Woodland view requires existing THREE and parent');
  const group=new THREE.Group();group.name='V4 woodland original substitute';parent.add(group);
  const geometries=new Set(),materials=new Set(),wheels=[];
  const material=(color)=>{const m=new THREE.MeshStandardMaterial({color,roughness:.94});materials.add(m);return m;};
  const bark=material(0x252d24),leaves=material(0x10201b),wood=material(0x403d32),metal=material(0x546564),rubber=material(0x141817),gray=material(0x777c78);
  function mesh(g,m,p,owner=group){geometries.add(g);const o=new THREE.Mesh(g,m);o.position.set(...p);owner.add(o);return o;}
  const box=(w,h,d,p,m=wood,owner=group)=>mesh(new THREE.BoxGeometry(w,h,d),m,p,owner);
  const tube=(a,b,r,m,owner)=>{const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a)),o=mesh(new THREE.CylinderGeometry(r,r,v.length(),6),m,[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],owner);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;};
  box(25,.12,44,[0,-.06,-9],material(0x18231d));
  for(const c of layout.colliders){box(c.maxX-c.minX,c.id.startsWith('rock')?1.2:2.3,c.maxZ-c.minZ,[(c.minX+c.maxX)/2,c.id.startsWith('rock')?.6:1.15,(c.minZ+c.maxZ)/2]);}
  box(6.4,.16,6.4,[-2,2.36,0]); // Two opposite open doorways, never a sealed safe room.
  const treePositions=[[-10,-11],[-11,-4],[-10,4],[-9,10],[5,10],[10,9],[11,-3],[10,-12],[-4,-12],[2,-10],[-10,-18],[5,-20],[11,-24]];
  for(const [x,z]of treePositions){mesh(new THREE.CylinderGeometry(.2,.32,4.5,6),bark,[x,2.25,z]);mesh(new THREE.ConeGeometry(1.8,4,6),leaves,[x,4.7,z]);}
  const bike=new THREE.Group();bike.name='Original low-poly bicycle';bike.position.set(layout.bike.x,0,layout.bike.z);group.add(bike);
  for(const x of [-.65,.65]){const wheel=mesh(new THREE.TorusGeometry(.34,.045,5,14),rubber,[x,.38,0],bike);wheels.push(wheel);for(const angle of [0,Math.PI/3,Math.PI*2/3])tube([x-Math.cos(angle)*.3,.38-Math.sin(angle)*.3,0],[x+Math.cos(angle)*.3,.38+Math.sin(angle)*.3,0],.009,metal,bike);}
  for(const [a,b]of [[[ -.65,.38,0],[-.2,.85,0]],[[-.2,.85,0],[0,.38,0]],[[0,.38,0],[-.65,.38,0]],[[-.2,.85,0],[.42,.88,0]],[[.42,.88,0],[0,.38,0]],[[.42,.88,0],[.65,.38,0]],[[.42,.88,0],[.36,1.12,0]],[[-.2,.85,0],[-.2,1,0]]])tube(a,b,.035,metal,bike);
  box(.28,.055,.16,[-.2,1.02,0],rubber,bike);tube([.36,1.12,-.28],[.36,1.12,.28],.03,metal,bike);
  const mountedBars=new THREE.Group();mountedBars.name='Mounted bicycle handlebars';group.add(mountedBars);mountedBars.visible=false;
  tube([-.38,0,0],[.38,0,0],.025,metal,mountedBars);tube([0,0,0],[0,-.3,.2],.025,metal,mountedBars);
  const hands=new THREE.Group();hands.name='Woodland shove hands';hands.visible=false;group.add(hands);
  const skin=material(0x986b4d),sleeve=material(0x494737);
  const arms=[-1,1].map(side=>{
    const arm=new THREE.Group();hands.add(arm);
    tube([side*.12,-.23,.32],[0,-.035,0],.053,sleeve,arm);
    box(.091,.11,.048,[0,.007,0],skin,arm);
    box(.029,.052,.042,[-side*.054,.025,0],skin,arm).rotation.z=-side*.35;
    for(let finger=0;finger<4;finger++)box(.02,.061-(finger===0||finger===3?.012:0),.035,[(finger-1.5)*.023,.077,0],skin,arm);
    return {arm,side};
  });
  const threat=new THREE.Group();threat.name='Woodland gray figure';group.add(threat);
  const fallback=new THREE.Group();fallback.name='Gray figure loading fallback';threat.add(fallback);
  const jacket=material(0x454947);
  box(.45,.72,.24,[0,1.02,0],jacket,fallback);box(.26,.3,.24,[0,1.56,0],gray,fallback);
  const limbs=[];
  for(const side of [-1,1]){
    for(const [x,y,color,swing] of [[side*.14,.7,gray,side],[side*.3,1.27,jacket,-side]]){
      const pivot=new THREE.Group();pivot.position.set(x,y,0);fallback.add(pivot);
      box(.15,.65,.18,[0,-.28,0],color,pivot);limbs.push({pivot,swing,arm:color===jacket});
    }
  }
  const fill=new THREE.HemisphereLight(0x687e87,0x0b140b,.65);group.add(fill);
  const lamp=new THREE.SpotLight(0xffe5b3,3.2,22,.5,.55,1.3);lamp.name='Child flashlight';group.add(lamp, lamp.target);
  let disposed=false,zombie=null;
  if(assetBindings)void installZombie(threat,[],{assetBindings,cinematic:true,isCurrent:()=>!disposed}).then(model=>{
    if(disposed)model.dispose();else zombie=model;
  }).catch(()=>{if(!disposed)fallback.visible=true;});
  return {group,bike,threat,colliders:layout.colliders,bounds:layout.bounds,interactionTarget:{id:'woodland-bicycle',position:{...layout.bike,y:.6},radius:layout.bike.radius,action:'mount-bicycle'},
    update(snapshot,{player,flashlight=true,reduced=false,eyeDrop=0}={}){
      if(disposed)return;
      const {state,enemy,phaseTime=0,presses=0,targetPresses=8,pushImpulse=0}=snapshot;
      const mounted=['mounted','escaped'].includes(state),pushedBack=mounted||state==='free';
      const scare=state==='scare'&&snapshot.scareVisible;
      const grapple=state==='grab'||state==='struggle',shoving=state==='shove';
      const reaching=scare||grapple||shoving;
      const pose=mounted?sampleWoodlandEscape(snapshot.escapeElapsed,{enemy,reduced}):null;
      const p=pose?{...pose.position,yaw:pose.yaw,pitch:pose.pitch}:player;
      bike.visible=!mounted;mountedBars.visible=mounted;hands.visible=grapple||shoving;
      threat.visible=snapshot.scareVisible!==false&&(state!=='searching'||snapshot.elapsed>=WOODLAND_REVEAL_SECONDS);
      threat.position.set(enemy.x,0,enemy.z);
      const turn=p?Math.atan2(p.x-enemy.x,p.z-enemy.z):threat.rotation.y;
      const recoil=shoving?Math.min(1,phaseTime/.22)*(reduced?.3:.67):0;
      threat.rotation.set(-recoil,turn,0,'YXZ');
      if(threat.visible){
        const time=snapshot.elapsed+snapshot.escapeElapsed;
        const interaction=state==='grab'?{phase:'tackle',phaseStartedAt:time-phaseTime}:
          reaching?{phase:'qte',presses,targetPresses}:undefined;
        if(zombie){
          zombie.update({enemy:{...enemy,state:pushedBack?'staggered':'chase',stateStartedAt:pushedBack?time-.52:0,timer:1.4},interaction},time,{reduced});
        }else{
          fallback.rotation.x=pushedBack?-.55:reaching?.24:0;
          for(const {pivot,swing,arm} of limbs){
            const walkSwing=pushedBack||reduced?0:Math.sin(time*7)*swing*.48;
            pivot.rotation.x=arm&&reaching?-1.35:walkSwing;
          }
        }
      }
      if(p){const y=(p.y||0)+(pose?pose.eyeHeight:layout.eyeHeight)-eyeDrop;lamp.position.set(p.x,y-.1,p.z);lamp.target.position.set(p.x-Math.sin(p.yaw||0)*10,y+Math.sin(p.pitch||0)*10,p.z-Math.cos(p.yaw||0)*10);lamp.visible=!!flashlight||reaching;
        if(hands.visible){
          hands.position.set(p.x,y,p.z);hands.rotation.set(p.pitch||0,p.yaw||0,0,'YXZ');
          const reach=shoving?Math.max(0,1-phaseTime/.55):pushImpulse*(reduced?.35:1);
          const lift=state==='grab'?Math.min(1,phaseTime/.35):shoving?Math.max(0,1-phaseTime/.68):1;
          for(const {arm,side} of arms){arm.position.set(side*(.24-.035*reach),-.245+.07*reach-.18*(1-lift),-.41-.22*reach);arm.rotation.z=side*.15;}
        }
        if(mounted){mountedBars.position.set(p.x-Math.sin(p.yaw||0)*.55,y-.4,p.z-Math.cos(p.yaw||0)*.55);mountedBars.rotation.y=p.yaw||0;for(const wheel of wheels)wheel.rotation.z=pose.wheelRotation;}}
      return pose;
    },
    dispose(){if(disposed)return;disposed=true;zombie?.dispose();parent.remove(group);for(const g of geometries)g.dispose();for(const m of materials)m.dispose();lamp.dispose?.();group.clear();}
  };
}
