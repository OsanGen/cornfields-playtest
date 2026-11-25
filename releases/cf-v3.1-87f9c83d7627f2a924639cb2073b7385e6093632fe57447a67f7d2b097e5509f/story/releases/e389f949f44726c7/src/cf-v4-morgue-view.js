import * as THREE from 'three';
import {createV4CrawlingHand} from './cf-v4-horror-view.js';
import {MORGUE_LAYOUT,morgueColliders} from './cf-v4-morgue.js';

// Reuses the native house/classroom room kit, existing articulated hand and one
// renderer. Shared unit geometry/materials keep the six fridges inexpensive.
export function createMorgueView(){
 const group=new THREE.Group();group.name='Wayne mortuary examination room';
 const geometry=new THREE.BoxGeometry(1,1,1),materials=new Map(),ownedTextures=[],drawers=[];
 let disposed=false;
 const mat=(color,extra={})=>{const key=JSON.stringify([color,extra]);if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.93,...extra}));return materials.get(key);};
 const paint=mat(0xa1aaa1),tile=mat(0x777c75),cream=mat(0xc4c2ad),steel=mat(0x82918d,{metalness:.16,roughness:.68}),dark=mat(0x111b19),rubber=mat(0x293631),wood=mat(0x5e5547);
 function box(name,w,h,d,x,y,z,material,parent=group){const mesh=new THREE.Mesh(geometry,material);mesh.name=name;mesh.scale.set(w,h,d);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
 box('lab floor',7,.12,7.6,0,-.06,0,tile);box('lab ceiling',7,.1,7.6,0,2.85,0,cream);
 for(const x of [-3.5,3.5])box('reused painted room wall',.15,2.8,7.6,x,1.4,0,paint);
 for(const z of [-3.8,3.8])box('reused painted room end',7,2.8,.15,0,1.4,z,paint);
 for(const x of [-3.4,3.4])box('mint wall skirting',.05,.26,7.4,x,.14,0,mat(0x4d6960));
 for(let x=-3;x<=3;x++)box('floor tile seam',.008,.002,7.4,x,.003,0,mat(0x535c55));
 for(let z=-3;z<=3;z++)box('floor tile seam',6.8,.002,.008,0,.003,z,mat(0x535c55));
 box('examination table',1.6,.11,1,0,.87,.28,steel);
 for(const x of [-.65,.65])for(const z of [-.1,.65])box('reused table leg',.065,.81,.065,x,.405,z,steel);
 const cooler=mat(0xadb9b1);
 box('transport cooler base',.48,.04,.36,0,.94,.25,cooler);
 for(const x of [-.22,.22])box('transport cooler side',.04,.28,.36,x,1.08,.25,cooler);
 for(const z of [.09,.41])box('transport cooler end',.40,.28,.04,0,1.08,z,cooler);
 const coolerHinge=new THREE.Group();coolerHinge.position.set(0,1.22,.055);group.add(coolerHinge);box('cooler lid',.51,.05,.39,0,0,.195,mat(0x435952),coolerHinge);
 box('case notebook',.24,.025,.30,.5,.945,.25,mat(0xc1bd9d));const pen=box('pen',.012,.012,.26,.34,.963,.25,dark);
 box('reused sink cabinet',.62,.85,.95,-3.04,.425,1.08,cream);box('sink bowl',.56,.06,.65,-3.02,.88,1.08,steel);
 box('reused storage cabinet',.65,1.6,.9,3.06,.8,2.2,paint);box('cabinet handle',.04,.25,.06,2.71,.9,2.2,steel);
 box('closed mortuary entry door',1.15,2.35,.07,-1.7,1.175,3.66,wood);box('entry handle',.18,.04,.08,-1.32,1.1,3.6,steel);
 box('mortuary refrigerator bank',4.7,2.25,1.3,0,1.15,-3.1,steel);
 const plateMaterial=mat(0xe7ddc5);
 for(const d of MORGUE_LAYOUT.drawers){
  box('refrigerator black recess '+d.label,d.width,.80,.045,d.x,d.y,d.z+.015,dark);
  const carriage=new THREE.Group();carriage.name='Mortuary refrigerator '+d.label;carriage.position.set(d.x,d.y,d.z+.05);group.add(carriage);
  const panel=box('refrigerator door '+d.label,d.width-.06,.75,.065,0,0,0,steel,carriage);
  box('fridge gasket '+d.label,d.width-.01,.80,.027,0,0,-.018,rubber,carriage);
  box('fridge handle '+d.label,.29,.055,.105,.19,.035,.08,mat(0xb7c0b9),carriage);
  box('fridge sliding tray '+d.label,d.width-.16,.045,.98,0,-.32,-.49,steel,carriage);
  box('fridge inner tray '+d.label,d.width-.26,.012,.87,0,-.289,-.49,dark,carriage);
  if(typeof document!=='undefined'){
   const canvas=document.createElement('canvas');canvas.width=128;canvas.height=64;const pen=canvas.getContext('2d');
   pen.fillStyle='#d5d5bd';pen.fillRect(0,0,128,64);pen.fillStyle='#253a33';pen.font='bold 42px monospace';pen.textAlign='center';pen.fillText(d.label,64,47);
   const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;ownedTextures.push(map);
   const material=new THREE.MeshBasicMaterial({map});materials.set('label-'+d.index,material);
   const label=new THREE.Mesh(new THREE.PlaneGeometry(.24,.12),material);label.name='fridge label '+d.label;label.position.set(-.36,.17,.038);carriage.add(label);
  }else box('fridge label '+d.label,.24,.12,.005,-.36,.17,.039,plateMaterial,carriage);
  const diode=box('fridge indicator '+d.label,.035,.025,.02,.48,.25,.047,mat(0x76543f,{emissive:0x472217,emissiveIntensity:.5}),carriage);
  drawers.push({carriage,panel,diode});
 }
 const lampMat=mat(0xeee6cb,{emissive:0xe3dfbb,emissiveIntensity:1.1});
 for(const x of [-1.65,1.65]){box('ceiling fluorescent housing',.27,.09,1.5,x,2.74,.2,dark);box('ceiling fluorescent tube',.19,.025,1.35,x,2.68,.2,lampMat);}
 box('examination overhead lamp',.65,.10,.38,0,2.4,.25,lampMat);
 group.add(new THREE.HemisphereLight(0xd9e4d9,0x283d35,1.8));const fill=new THREE.DirectionalLight(0xdfe4ca,1.1);fill.position.set(1.5,5,1);group.add(fill);
 const lamp=new THREE.SpotLight(0xe3ead7,8,8,.65,.7,1.3);lamp.position.set(0,2.45,.3);lamp.target.position.set(0,.8,.25);group.add(lamp,lamp.target);
 const hand=createV4CrawlingHand();group.add(hand.root);
 const arms=new THREE.Group();arms.name='Wayne struggle hands';group.add(arms);
 const ownHands=[-1,1].map(side=>{const rig=createV4CrawlingHand({color:0x9b8066});rig.root.scale.set(side*.82,.82,.82);arms.add(rig.root);
  box('Wayne scrub sleeve',.13,.12,.40,0,.035,.27,mat(0x687d73),rig.root);return {rig,side};});
 const heldPen=box('Wayne writing pen',.014,.19,.014,-.08,.005,-.10,dark,ownHands[1].rig.root);
 const anchor={id:'WAYNE_LAB_ENTRY',position:{x:MORGUE_LAYOUT.start.x,y:0,z:MORGUE_LAYOUT.start.z},lookTarget:{x:0,y:1.03,z:.25},eyeHeight:MORGUE_LAYOUT.eyeHeight};
 function update(snapshot={}, {player,time=0,reducedEffects=false}={}){
  if(disposed)return;
  coolerHinge.rotation.x=-1.46*(snapshot.coolerOpen||0);
  for(const [index,v]of drawers.entries()){
   const state=snapshot.drawers?.[index],amount=snapshot.cinematic?.hand&&snapshot.cinematic.target===index?snapshot.cinematic.drawerAmount:state?.amount||0;
   v.carriage.position.z=MORGUE_LAYOUT.drawers[index].z+.05+amount*.85;
   v.panel.material=state?.checked?mat(0x8b9990,{metalness:.16,roughness:.68}):steel;
   v.diode.visible=!!state?.checked;
  }
  const pose=snapshot.hand;
  hand.root.visible=!!pose?.visible;
  if(hand.root.visible){hand.root.scale.setScalar(1);hand.update({position:pose,yaw:pose.yaw,activeSeconds:time,moving:pose.moving,reducedEffects});hand.root.rotation.x=pose.pitch||0;}
  const attacked=['lunge','struggle'].includes(snapshot.phase),p=player||snapshot.attack?.player,t=snapshot.cinematic?.seconds||0,writing=snapshot.phase==='intro'&&t>=3&&t<6;
  arms.visible=attacked||writing||snapshot.phase==='intro'&&t<2.4;heldPen.visible=writing;pen.visible=!writing;
  if(attacked&&p){
   const d=MORGUE_LAYOUT.drawers[snapshot.attack.drawer],u=snapshot.phase==='lunge'?Math.min(1,snapshot.phaseTime/.65):1;
   const stand=snapshot.phase==='struggle'?snapshot.pushImpulse||0:0,distance=.43+stand*.19;
   const target={x:p.x-Math.sin(p.yaw)*Math.cos(p.pitch)*distance,y:MORGUE_LAYOUT.eyeHeight+Math.sin(p.pitch)*distance-.12-(snapshot.cameraDrop||0),z:p.z-Math.cos(p.yaw)*Math.cos(p.pitch)*distance};
   const from={x:d.x,y:d.y-.2,z:d.z+.6};const pos={x:THREE.MathUtils.lerp(from.x,target.x,u),y:THREE.MathUtils.lerp(from.y,target.y,u),z:THREE.MathUtils.lerp(from.z,target.z,u)};
   hand.root.visible=true;hand.root.scale.setScalar(1.25);hand.update({position:pos,yaw:p.yaw,activeSeconds:time,moving:true,captureProgress:u,reducedEffects});hand.root.rotation.set(Math.PI/2,p.yaw,reducedEffects?0:Math.sin(time*16)*.08,'YXZ');
  }
  if(writing){
   arms.position.set(0,0,0);arms.rotation.set(0,0,0);
   for(const {rig,side}of ownHands){rig.root.visible=side===1;rig.update({moving:false});rig.root.position.set(.52+Math.sin(t*14)*.022,1.035,.29+Math.sin(t*7)*.032);rig.root.rotation.set(0,.1,0);}
  }else if(arms.visible&&p){
   arms.position.set(p.x,MORGUE_LAYOUT.eyeHeight-(snapshot.cameraDrop||0),p.z);arms.rotation.set(p.pitch||0,p.yaw||0,0,'YXZ');
   const lift=attacked?.17+(snapshot.pushImpulse||0)*.10:-.12;
   for(const {rig,side}of ownHands){rig.root.visible=true;rig.update({activeSeconds:time,moving:false});rig.root.position.set(side*.21,-.31+lift,-.42-(snapshot.pushImpulse||0)*.15);rig.root.rotation.set(Math.PI/2,0,side*.16);}
  }
 }
 return {group,anchor,anchors:[anchor],bounds:MORGUE_LAYOUT.bounds,targets:MORGUE_LAYOUT.drawers.map(d=>({id:d.id,position:d,action:'open-fridge',radius:1.65})),
  colliders:snapshot=>morgueColliders(snapshot?.drawers),update,dispose(){if(disposed)return;disposed=true;hand.dispose();for(const {rig}of ownHands)rig.dispose();
   group.traverse(o=>{if(o.isMesh&&o.geometry!==geometry)o.geometry.dispose();});geometry.dispose();for(const m of materials.values())m.dispose();for(const t of ownedTextures)t.dispose();lamp.dispose();group.removeFromParent();group.clear();}};
}
