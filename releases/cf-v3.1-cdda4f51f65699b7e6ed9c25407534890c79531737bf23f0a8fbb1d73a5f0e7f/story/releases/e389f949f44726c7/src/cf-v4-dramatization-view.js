import * as THREE from 'three';
import {createGlendaActor,createPrologueActor} from './prologue-actors.js';
import {createV4CrawlingHand} from './cf-v4-horror-view.js';
import {wetGroundHeight} from './environment-materials.js';

// Small scene-owned performances, using the existing human and hand rigs.
// No new AI, renderer, imported model or game-wide animation loop.
export function createDramatizationView({sceneId,setId,group,actors=new Map()}={}){
 const root=new THREE.Group();root.name='In-scene story actions';group.add(root);
 const shapes=new Set(),materials=new Set(),textures=new Set(),cast=[],hands=[];
 const geometry=new THREE.BoxGeometry(1,1,1);shapes.add(geometry);
 const mat=color=>{const m=new THREE.MeshStandardMaterial({color,roughness:.95});materials.add(m);return m;};
 const paper=mat(0xe6dfbd),ink=mat(0x292b29),skin=mat(0xb18b70),cloth=mat(0x62654e);
 const box=(name,size,position,material=paper,parent=root)=>{const mesh=new THREE.Mesh(geometry,material);mesh.name=name;mesh.scale.set(...size);mesh.position.set(...position);parent.add(mesh);return mesh;};
 function label(name,lines,{position=[0,.8,0],width=.4,height=.3,rotation=[-Math.PI/2,0,0],portrait=false}={}){
  const m=box(name,[width,height,.003],position,paper);m.rotation.set(...rotation);
  if(typeof document==='undefined')return m;
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=384;
  const c=canvas.getContext('2d');c.fillStyle='#e6dfbd';c.fillRect(0,0,512,384);
  if(portrait){c.fillStyle='#767457';c.fillRect(32,25,448,334);c.fillStyle='#a78365';c.beginPath();c.ellipse(256,145,69,92,0,0,Math.PI*2);c.fill();c.fillStyle='#372a24';c.fillRect(185,60,142,44);c.fillStyle='#635c64';c.beginPath();c.moveTo(120,356);c.lineTo(166,235);c.lineTo(342,235);c.lineTo(395,356);c.fill();}
  c.fillStyle='#242922';c.textAlign='center';c.font='bold 31px monospace';
  lines.forEach((line,i)=>c.fillText(line,256,portrait?365:65+i*61,475));
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;textures.add(texture);
  const material=new THREE.MeshStandardMaterial({map:texture,roughness:1});materials.add(material);m.material=material;return m;
 }
 function person(role,x,z,{female=false,scale=1,y=0,yaw=0}={}){
  const actor=female?createGlendaActor({name:role,faceEnabled:false,faceted:true}):createPrologueActor({name:role,police:false,faceEnabled:false});
  actor.root.name=role;actor.root.position.set(x,y,z);actor.root.rotation.y=yaw;actor.root.scale.setScalar(scale);root.add(actor.root);cast.push({role,actor});return actor;
 }
 const hand=(name,color=0xb18b70)=>{const rig=createV4CrawlingHand({color});rig.root.name=name;rig.root.scale.setScalar(.78);root.add(rig.root);hands.push(rig);return rig;};
 const beat=(p,id)=>p.dramatization?.beats?.find(b=>b.id===id);
 const smooth=t=>{const u=Math.max(0,Math.min(1,t));return u*u*(3-2*u);};
 const lerp=THREE.MathUtils.lerp;
 let mother=null,owen=null,pete=null,pam=null,shopper=null,ownHand=null,otherHand=null,photo=null,results=null,brochure=null,cigarette=null;
 let lastLine=null,lineStarted=0,enteredAt=null,disposed=false;
 if(sceneId==='CF-S07'){
  for(const actor of actors.values())actor.root.visible=false;
  mother=person('DARLENE_MEMORY',11.15,7.08,{female:true,yaw:-Math.PI/2});
  box('Remembered kitchen table',[1.15,.08,.72],[10.4,.75,7.05],mat(0x655041));
  results=label('Clarence academic results',['CLARENCE LEMONS','GPA 4.0','ADVANCED PHYSICS'],{position:[10.36,.798,6.87],rotation:[-Math.PI/2,0,Math.PI/2],width:.44,height:.32});
  brochure=label('MIT brochure',['MIT','YOUR FUTURE'],{position:[10.51,.805,7.27],rotation:[-Math.PI/2,0,Math.PI/2],width:.3,height:.38});
  ownHand=hand('Clarence hesitates over the MIT brochure',0x73523d);
 }
 if(sceneId==='CF-S08')owen=person('OWEN',7.7,7,{scale:.73,yaw:Math.PI/2});
 if(sceneId==='CF-S23'&&setId==='HISTORICAL_CAFE'){
  label('Friendlys counter sign',["FRIENDLY'S"],{position:[-.42,1.42,-1.2],rotation:[0,0,0],width:.8,height:.22});
  photo=label('Dales photograph of Pam',['PAM'],{position:[.1,1.04,-.7],portrait:true,width:.23,height:.3});
  label('Farm envelope carried by Dale',['FARM PHOTOGRAPHS'],{position:[.41,1.04,-.74],width:.31,height:.2});
 }
 if(sceneId==='CF-S23'&&setId==='HISTORICAL_TABLE'){
  pam=person('PAM_MEMORY',0,-.9,{female:true,y:-.15,scale:.94});
  ownHand=hand('Dale slides the envelope');
 }
 if(sceneId==='CF-S24'){
  pete=person('PETE_GATEMAN',-.68,-.55,{yaw:.15});
  label('Legal files',['GATEMAN LAW','CLIENT INDEX','LABELS'],{position:[-.28,.79,.15],width:.39,height:.34});
  otherHand=hand('Petes unwanted hand');ownHand=hand('Pam recoils');
  box('Petes jacket sleeve',[.13,.13,.46],[0,.025,.3],cloth,otherHand.root);
 }
 if(sceneId==='CF-S25'){
  label('DelAmos menu',["DEL'AMO'S",'CLASSIC ITALIAN','NEWTON'],{position:[.25,.78,.22],width:.35,height:.4});
  ownHand=hand('Pam accepts the cigarette');otherHand=hand('Diego offers a cigarette');
  cigarette=box('Offered cigarette',[.009,.009,.095],[0,.01,-.045],paper,otherHand.root);
  box('Cigarette end',[.01,.01,.009],[0,.01,-.094],mat(0x846048),otherHand.root);
 }
 if(sceneId==='CF-S26'){
  const previous=group.getObjectByName('PAM');if(previous)previous.visible=false;
  pam=person('PAM',0,-.8,{female:true,y:-.15,scale:.94});ownHand=hand('Pams hand over her stomach');
 }
 if(['CF-S27','CF-S28'].includes(sceneId)){
  shopper=person('SHOPPER_PASSING',2.3,-.7,{yaw:-Math.PI/2,scale:.94});
  label('Joes market sign',["JOE'S MARKET"],{position:[-.9,2.1,-2.6],rotation:[0,0,0],width:1.15,height:.32});
 }
 if(sceneId==='CF-S29'){
  label('Period radio dial',['AM  WEATHER','MIDNIGHT'],{position:[.4,1.1,-.1],rotation:[0,0,0],width:.45,height:.22});
 }
 if(sceneId==='CF-S20')ownHand=hand('Clarence supports Stanley');
 const initialMike=actors.get('MIKE')?.root.position.clone();
 const initialStanley=actors.get('STANLEY')?.root.position.clone();
 function update(p={}){
  if(disposed)return;
  const time=p.time||0,line=p.speechLine;
  if(line?.id!==lastLine){lastLine=line?.id;lineStarted=time;}
  const offset=Number.isFinite(line?.offsetSeconds)?line.offsetSeconds:time-lineStarted;
  if(enteredAt===null)enteredAt=time;
  const age=time-enteredAt;
  for(const rig of hands)rig.update({activeSeconds:time,moving:false,reducedEffects:!!p.reduced});
  for(const {role,actor}of cast)actor.pose({time,mode:'standing',speaking:line?.speaker===role&&line.playing===true,reduced:!!p.reduced,performance:{lineId:line?.id,lineOffset:offset}});
  if(mother){
   const shoulder=mother.root.getObjectByName('Glenda shoulder 1');
   if(shoulder){const discussing=['CF-DR-S07-03','CF-S10-D04','CF-S10-D07'].includes(line?.id);shoulder.rotation.x=discussing?-.65:-.035;}
   const onTable=line?.id==='CF-DR-S07-03'||line?.id==='CF-S10-D04';
   brochure.position.set(onTable?10.7:10.51,onTable?1.27:.805,onTable?6.93:7.27);brochure.rotation.set(onTable?0:-Math.PI/2,onTable?-Math.PI/2:0,onTable?0:Math.PI/2);
   const withheld=beat(p,'withheld-confession'),u=smooth(withheld?.progress||0);
   ownHand.root.visible=!!withheld;ownHand.root.position.set(lerp(10.25,9.65,u),.91,lerp(7.25,7.1,u));ownHand.root.rotation.y=-Math.PI/2;
  }
  const jacket=beat(p,'jacket-recognition'),clarence=actors.get('CLARENCE');
  if(jacket&&clarence)clarence.pose({time,distress:.5,look:-.3,reduced:!!p.reduced,performance:{lineId:null,lineOffset:0,breath:.01,nod:-.04*Math.sin(jacket.progress*Math.PI)}});
  if(owen){const b=beat(p,'owen-arrival'),u=smooth(b?.progress||0);owen.root.visible=!!b;owen.root.position.set(lerp(7.7,10.23,u),0,lerp(7,7.55,u));owen.root.rotation.y=-Math.PI/2;owen.pose({time,mode:u<1?'walk':'standing',phase:(b?.age||0)*9,speaking:line?.speaker==='OWEN'&&line.playing,reduced:!!p.reduced,performance:{lineId:line?.id,lineOffset:offset}});}
  const entry=beat(p,'mike-entrance');
  if(entry&&actors.get('MIKE')){const actor=actors.get('MIKE'),u=smooth(entry.progress);actor.root.visible=true;actor.root.position.set(lerp(7.9,initialMike?.x||8.52,u),0,lerp(7,initialMike?.z||7,u));actor.pose({time,mode:u<1?'walk':'standing',phase:entry.age*8,speaking:line?.speaker==='MIKE'&&line.playing,performance:{lineId:line?.id,lineOffset:offset},reduced:!!p.reduced});}
  const escort=beat(p,'stanley-escort');
  if(escort&&initialStanley){const actor=actors.get('STANLEY'),u=smooth(escort.progress);actor.root.position.set(lerp(initialStanley.x,13.75,u),wetGroundHeight(lerp(initialStanley.x,13.75,u),initialStanley.z),initialStanley.z);actor.root.rotation.y=-Math.PI/2;actor.pose({time,mode:'walk',phase:escort.age*5,distress:.55,reduced:!!p.reduced});ownHand.root.visible=u<.96;ownHand.root.position.set(actor.root.position.x-.3,1.05,actor.root.position.z-.12);ownHand.root.rotation.set(0,Math.PI/2,-.6);}
  else if(sceneId==='CF-S20')ownHand.root.visible=false;
  if(sceneId==='CF-S23'&&setId==='HISTORICAL_TABLE'){
   const u=smooth(Math.min(1,age/.85));ownHand.root.position.set(lerp(.35,-.25,u),.84,lerp(.68,.15,u));ownHand.root.rotation.y=Math.PI;ownHand.root.visible=age<2.6;
   if(pam){const smile=line?.id==='CF-S21-D05'||line?.id==='CF-S21-D07';pam.root.rotation.z=smile?.035:0;const arm=pam.root.getObjectByName('Glenda shoulder -1');if(arm)arm.rotation.x=smile?-.5:-.05;}
  }
  if(pete){
   const b=beat(p,'pam-recoil'),u=smooth(b?.progress||0),approach=line?.id==='CF-DR-S24-02';
   if(approach||b){const papers=group.getObjectByName('office papers');if(papers){papers.position.set(-.25,.76,0);papers.rotation.x=0;papers.scale.setScalar(1);}}
   const proximity=approach?smooth(Math.min(1,offset/1.2)):b?1-u:0;
   pete.root.position.set(-.9,0,lerp(-.55,.55,proximity));
   const body=p.player||{x:0,z:1.5,yaw:0},yaw=body.yaw||0;
   const target={x:body.x-Math.sin(yaw)*.4-Math.cos(yaw)*.23,y:(p.eyeHeight||1.15)-.32,z:body.z-Math.cos(yaw)*.4+Math.sin(yaw)*.23};
   otherHand.root.visible=approach||!!b&&!b.complete;
   otherHand.root.position.set(lerp(-.67,target.x,proximity),target.y,lerp(.1,target.z,proximity));otherHand.root.rotation.set(.1,yaw+Math.PI,0);
   ownHand.root.visible=!!b&&!b.complete;ownHand.root.position.set(target.x+.18,target.y+.05,target.z+.11-u*.15);ownHand.root.rotation.set(-.2,yaw-Math.PI/2,-.4);
  }
  if(cigarette){
   const accepted=line?.id!=='CF-DR-S25-01',u=smooth(Math.min(1,offset/1.1));
   otherHand.root.position.set(0,.91,accepted?-.25:lerp(-.45,.12,u));otherHand.root.rotation.y=Math.PI;
   ownHand.root.position.set(.2,.91,accepted?lerp(.75,.12,u):.75);ownHand.root.rotation.y=-.4;
   ownHand.root.visible=accepted;otherHand.root.visible=!accepted||offset<1.2;
   if(accepted&&cigarette.parent!==ownHand.root)ownHand.root.add(cigarette);
   cigarette.visible=['CF-DR-S25-01','CF-DR-S25-02'].includes(line?.id);
  }
  if(sceneId==='CF-S26'){
   const b=beat(p,'stomach-gesture'),u=smooth(Math.min(1,(b?.age||0)/.45));
   pam.root.position.y=-.15;
   ownHand.root.visible=!!b;ownHand.root.position.set(lerp(.25,.04,u),lerp(.55,.82,u),-.60);ownHand.root.rotation.set(.1,Math.PI/2,-.6);
   const arm=pam.root.getObjectByName('Glenda shoulder 1');if(arm&&b){arm.rotation.x=-.5*u;arm.rotation.z=-.42*u;}
  }
  if(shopper){
   const b=beat(p,'shopper-passes'),u=sceneId==='CF-S27'?(time%14)/14:b?smooth(b.progress):0;
   shopper.root.visible=sceneId==='CF-S27'||!!b&&!b.complete||line?.id==='CF-DR-S28-01';shopper.root.position.x=lerp(2.3,-2.3,u);
   shopper.pose({time,mode:u>0&&u<1?'walk':'standing',phase:time*6,speaking:line?.speaker==='SHOPPER'&&line.playing,reduced:!!p.reduced,performance:{lineId:line?.id,lineOffset:offset}});
   const hesitation=beat(p,'diego-hesitates'),diego=group.getObjectByName('DIEGO');
   if(hesitation&&diego?.userData.head)diego.userData.head.rotation.x=-.105*Math.sin(Math.PI*hesitation.progress);
  }
 }
 return {update,dispose(){if(disposed)return;disposed=true;for(const {actor}of cast)actor.dispose();for(const h of hands)h.dispose();for(const t of textures)t.dispose();for(const m of materials)m.dispose();for(const g of shapes)g.dispose();root.removeFromParent();root.clear();}};
}

// A brief homecoming tableau after the existing bicycle escape. The same
// childhood eye height and reused mother rig make the possum excuse a scene.
export function createDarleneHome(){
 const group=new THREE.Group();group.name='Clarence childhood homecoming';
 const geometry=new THREE.BoxGeometry(1,1,1),materials=[];
 const box=(name,size,position,color)=>{const material=new THREE.MeshStandardMaterial({color,roughness:1});materials.push(material);const mesh=new THREE.Mesh(geometry,material);mesh.name=name;mesh.scale.set(...size);mesh.position.set(...position);group.add(mesh);return mesh;};
 box('Reused porch floor',[6,.12,5],[0,-.06,0],0x655644);
 box('Reused house wall',[6,2.8,.15],[0,1.4,-2.3],0x8a8272);
 box('Home front door',[1.05,2.2,.07],[.4,1.1,-2.19],0x3e3529);
 box('Home window',[1.15,.85,.05],[-1.5,1.5,-2.19],0x797f73);
 for(const x of [-2.4,2.4])box('Porch post',[.16,2.5,.16],[x,1.25,-.5],0x514532);
 group.add(new THREE.HemisphereLight(0xd4b987,0x222722,1.6));const lamp=new THREE.PointLight(0xffc984,4,7);lamp.position.set(.5,2,-1.5);group.add(lamp);
 const mother=createGlendaActor({name:'Darlene Lemons',faceEnabled:false,faceted:true});mother.root.position.set(.25,0,-1.45);mother.root.rotation.y=.06;group.add(mother.root);
 const anchor={id:'DARLENE_HOME',position:{x:0,y:0,z:1.4},lookTarget:{x:.25,y:1.25,z:-1.45},eyeHeight:.95};
 return {group,anchor,anchors:[anchor],bounds:{x:[-2.7,2.7],z:[-1.9,2.3]},colliders:[],targets:[],update({time=0,speechLine,reduced=false}={}){mother.pose({time,speaking:speechLine?.speaker==='DARLENE_MEMORY'&&speechLine.playing,reduced,performance:{lineId:speechLine?.id,lineOffset:speechLine?.offsetSeconds||0}});},dispose(){mother.dispose();geometry.dispose();for(const m of materials)m.dispose();lamp.dispose();group.clear();group.removeFromParent();}};
}
