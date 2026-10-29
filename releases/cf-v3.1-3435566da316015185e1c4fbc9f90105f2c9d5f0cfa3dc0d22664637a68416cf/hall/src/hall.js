import * as THREE from 'three';
import {applyPS2Materials} from '../../story/releases/e389f949f44726c7/src/ps2-style.js';
import { createMaterials, createStripMotion } from './materials.js';
import { DOOR_NAMES } from './progression.js';

export function validateLayout(l) {
  if (l?.schema !== 1 || l.units !== 'metres' || JSON.stringify(l.hall?.size) !== '[18,6,14]' || JSON.stringify(l.hall?.center) !== '[0,0,0]') throw new Error('Invalid hall layout');
  if (l.vestibules?.length !== 1 || l.vestibules[0].id !== 'A' || JSON.stringify(l.vestibules[0].size) !== '[6,3.5,6]' || JSON.stringify(l.vestibules[0].center) !== '[-12,0,0]') throw new Error('Invalid original room A');
  const spaces=l.mansion?.spaces, ids=['vestibule','foyer','reception','salon','music','kitchen','scullery','nook','powder-west','hallway','conference','office','open-office','entry','powder-east','closet'];
  if(l.mansion?.id!=='Pillsbury-first-floor-v2'||JSON.stringify(spaces?.map(s=>s.id))!==JSON.stringify(ids)||spaces.some(s=>!s.polygon||s.polygon.length<4||s.polygon.some(p=>p.length!==2||!p.every(Number.isFinite))||s.center[0]<30||s.size.some(v=>!Number.isFinite(v)||v<=0)))throw new Error('Invalid approved first floor');
  if(l.mansion.doors?.length!==18||l.mansion.doors.some(d=>!ids.includes(d.rooms?.[0])||!ids.includes(d.rooms?.[1])||!['x','z'].includes(d.axis)||![d.x,d.z,d.width,d.height].every(Number.isFinite)||d.width<1.2))throw new Error('Invalid interior doors');
  if(JSON.stringify(l.mansion.tokenLocations?.map(p=>p.space))!==JSON.stringify(['kitchen','conference','office'])||l.mansion.tokenLocations.some(p=>![p.x,p.y,p.z].every(Number.isFinite)))throw new Error('Invalid deep token locations');
  const doorContract=[['Brasenhill',[-9,0,0],Math.PI/2,'walk'],['Pillsbury',[-4,0,-7],0,'fold'],['Lebold',[4,0,-7],0,'closed'],['Aldrich',[9,0,-2],-Math.PI/2,'closed'],['Winchester',[9,0,3],-Math.PI/2,'closed']];
  if (JSON.stringify(l.doors?.map(d => d.id)) !== JSON.stringify(DOOR_NAMES) || l.doors.some((d,i) => d.label !== 'FUTURE WING' || JSON.stringify(d.center)!==JSON.stringify(doorContract[i][1]) || d.yaw!==doorContract[i][2] || d.mode!==doorContract[i][3])) throw new Error('Invalid entrances');
  if (JSON.stringify(l.doorOpening) !== '[1.8,2.8]') throw new Error('Invalid doorway clearance');
  for (const key of ['spawn','foldHallArrival','foldBayArrival','bayReturn']) if (![l[key]?.x,l[key]?.z,l[key]?.yaw].every(Number.isFinite)) throw new Error('Invalid safe transform');
  if (l.player?.radius !== 0.28 || l.player.height !== 1.75 || l.player.eyeHeight !== 1.62 || l.player.speed !== 2.6 || l.player.fastSpeed !== 4 || l.strip?.cycleSeconds !== 12 || l.strip.maxAngleRadians !== 0.065 || ![l.latch?.x,l.latch?.y,l.latch?.z,...l.strip.position].every(Number.isFinite)) throw new Error('Invalid human-scale contract');
  return true;
}
export function createHall(layout, { document: doc = null, quickplay = false } = {}) {
  validateLayout(layout);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x171f20); scene.fog = new THREE.Fog(0x293533, 13, 38);
  const materials = createMaterials(), solids = [], floors = [], signs = [], doorIndicators = new Map(), resources = [], boxGeometry = new THREE.BoxGeometry(1,1,1);
  function box(name, center, size, material = materials.plaster, solid = true, parent = scene) {
    const mesh = new THREE.Mesh(boxGeometry, material); mesh.name = name; mesh.position.set(...center); mesh.scale.set(...size); parent.add(mesh); if (solid) solids.push(mesh); return mesh;
  }
  function wall(name, center, size, parent = scene) {
    box(name, center, size, materials.plaster, true, parent);
    const lower = [...size]; lower[1] = Math.min(1.2, size[1]);
    if (center[1] - size[1]/2 < 0.01) box(name+'-glazed-tiles', [center[0],lower[1]/2,center[2]], [lower[0]+0.018,lower[1],lower[2]+0.018], materials.tile, true, parent);
  }
  function sign(name, text, position, yaw = 0, width = 2.35, height = 0.64, parent = scene) {
    const group = new THREE.Group(); group.name = name; group.position.set(...position); group.rotation.y = yaw; parent.add(group);
    let material = materials.sign; let canvas, ctx, texture;
    const draw = words => { if (ctx) { ctx.fillStyle = '#182421'; ctx.fillRect(0,0,1024,256); ctx.strokeStyle = '#9cae9f'; ctx.lineWidth = 8; ctx.strokeRect(6,6,1012,244); ctx.textAlign = 'center'; ctx.fillStyle = '#eef2df'; words.split('\n').forEach((line,i,arr) => { ctx.font = i ? 'bold 38px sans-serif' : 'bold 66px sans-serif'; ctx.fillText(line,512,arr.length===1?150:90+i*69,990); }); texture.needsUpdate = true; } };
    if (doc?.createElement) { canvas = doc.createElement('canvas'); canvas.width=1024; canvas.height=256; ctx=canvas.getContext('2d'); if (ctx) { texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; material = new THREE.MeshBasicMaterial({map:texture}); resources.push(texture,material); } }
    box(name+'-board',[0,0,0],[width,height,0.035],material,false,group); const entry={name,text,group,setText(value){this.text=value;draw(value);}}; signs.push(entry); draw(text); return entry;
  }
  for (const room of [layout.hall,...layout.vestibules]) {
    const [x,,z]=room.center,[w,h,d]=room.size;
    const f=box(room.id+'-floor',[x,-0.1,z],[w,0.2,d],materials.floor,false); floors.push({id:layout.mansion.spaces.includes(room)?'B':room.id,space:room.id,mesh:f,minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});
    box(room.id+'-ceiling',[x,h+0.1,z],[w+0.3,0.2,d+0.3],materials.plaster,false);
    if(room.id==='hall'){
      wall('hall-south',[0,3,7.15],[18.3,6,0.3]);wall('hall-north',[0,3,-7.15],[18.3,6,0.3]);wall('hall-east',[9.15,3,0],[0.3,6,14]);
      wall('hall-west-north',[-9.15,3,-3.95],[0.3,6,6.1]);wall('hall-west-south',[-9.15,3,3.95],[0.3,6,6.1]);wall('Brasenhill-header',[-9.15,4.4,0],[0.3,3.2,1.8]);
    } else if(room.id==='A') {
      wall(room.id+'-north',[x,h/2,-3.15],[6.3,h,0.3]);wall(room.id+'-south',[x,h/2,3.15],[6.3,h,0.3]);wall(room.id+'-west',[x-3.15,h/2,0],[0.3,h,6]);
      if(room.id==='B') wall('B-east',[24.15,h/2,0],[0.3,h,6]);
      box(room.id+'-light',[x,h-0.06,0],[1.5,0.08,0.55],materials.skylight,false);
      const light=new THREE.PointLight(0xd0c79f,10,9,2);light.position.set(x,3.1,0);scene.add(light);
      sign(room.id+'-original-label','ORIGINAL TEST VESTIBULE\n'+room.id,[x,2.55,-2.96],0,3.45,0.64);
    }
  }
  // Shared floor and a genuine open wall aperture make A a walk-through route.
  wall('A-screen',[-11.25,1.55,-0.55],[0.24,3.1,2.45]);
  // A floor-specific plan blockout. Wall apertures, panel colliders and navigation share the same data.
  const green=new THREE.MeshStandardMaterial({color:0x54634f,roughness:1}),wood=new THREE.MeshStandardMaterial({color:0x49382a,roughness:.94});resources.push(green,wood);
  const interiorDoors=new Map();let doorVersion=0;
  function segment(name,a,b,height=3.5,y=height/2,material=green){const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);if(length<.001)return;const mesh=box(name,[(a[0]+b[0])/2,y,(a[1]+b[1])/2],[length,height,.18],material);mesh.rotation.y=-Math.atan2(dz,dx);return mesh;}
  for(const room of layout.mansion.spaces){
    const poly=room.polygon,shape=new THREE.Shape();poly.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();const geo=new THREE.ShapeGeometry(shape);resources.push(geo);
    const floor=new THREE.Mesh(geo,materials.floor);floor.name=room.id+'-floor';floor.rotation.x=-Math.PI/2;scene.add(floor);
    const ceiling=new THREE.Mesh(geo,materials.plaster);ceiling.name=room.id+'-ceiling';ceiling.rotation.x=Math.PI/2;ceiling.scale.y=-1;ceiling.position.y=3.5;scene.add(ceiling);
    floors.push({id:'B',space:room.id,mesh:floor,polygon:poly,minX:Math.min(...poly.map(p=>p[0])),maxX:Math.max(...poly.map(p=>p[0])),minZ:Math.min(...poly.map(p=>p[1])),maxZ:Math.max(...poly.map(p=>p[1]))});
    for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),point=t=>[a[0]+dx*t,a[1]+dz*t];
      const openings=layout.mansion.doors.filter(d=>d.rooms.includes(room.id)&&((Math.abs(dx)<.001&&d.axis==='x'&&Math.abs(d.x-a[0])<.001&&d.z>Math.min(a[1],b[1])&&d.z<Math.max(a[1],b[1]))||(Math.abs(dz)<.001&&d.axis==='z'&&Math.abs(d.z-a[1])<.001&&d.x>Math.min(a[0],b[0])&&d.x<Math.max(a[0],b[0])))).map(d=>{const t=((d.x-a[0])*dx+(d.z-a[1])*dz)/(length*length);return {d,lo:t-d.width/2/length,hi:t+d.width/2/length};}).sort((u,v)=>u.lo-v.lo);
      let start=0;for(const {d,lo,hi}of openings){segment(room.id+'-wall-'+i+'-'+start,point(start),point(lo));segment(room.id+'-header-'+d.id,point(lo),point(hi),3.5-d.height,d.height+(3.5-d.height)/2,wood);start=hi;}segment(room.id+'-wall-'+i+'-'+start,point(start),b);
    }
    const [x,,z]=room.center;sign(room.id+'-label',room.label+'\nPILLSBURY · FIRST FLOOR',[x,2.65,z-.5],0,Math.min(3.5,room.size[0]-.3),.55);
    box(room.id+'-light',[x,3.42,z],[Math.min(2,room.size[0]/2),.06,.55],materials.skylight,false);
  }
  for(const d of layout.mansion.doors){const panel=box('interior-door-'+d.id,[d.x,d.height/2,d.z],d.axis==='x'?[.14,d.height,d.width]:[d.width,d.height,.14],wood);interiorDoors.set(d.id,{...d,panel,open:false});}
  for(const link of layout.mansion.blockedLinks){const size=link.axis==='x'?[.24,2.8,link.width]:[link.width,2.8,.24];box(link.id+'-blocked',[link.x,1.4,link.z],size,materials.metal);sign(link.id+'-blocked-label',link.label,[link.x,2.65,link.z+.15],0,2.6,.5);}
  // Large-scale salon landmarks only. Source photography is not packaged.
  box('salon-fireplace',[41.3,1.1,-3],[.5,2.2,2],wood);for(const z of [-7,-3,1])box('salon-wood-beam-'+z,[46.5,3.28,z],[10.5,.25,.25],wood,false);

  for (const z of [-5,-1.65,1.65,5]) {
    box('heavy-rib-'+z,[0,5.65,z],[17.9,0.52,0.28],materials.plaster,false);
    for(const x of [-8.68,8.68]) box('rib-pier-'+x+'-'+z,[x,2.9,z],[0.34,5.8,0.35]);
  }
  box('fixed-dirty-skylight',[0,5.96,0],[3.8,0.05,10.9],materials.skylight,false);
  for(let z=-5;z<=5;z+=1) box('skylight-bar-'+z,[0,5.9,z],[3.82,0.12,0.065],materials.metal,false);
  for (const d of layout.doors) {
    const frame=new THREE.Group();frame.name=d.id+'-frame';frame.position.set(...d.center);frame.rotation.y=d.yaw;scene.add(frame);
    for(const x of [-1.01,1.01]) box(d.id+'-jamb-'+x,[x,1.4,0.08],[0.22,2.8,0.3],materials.metal,true,frame);
    box(d.id+'-lintel',[0,2.93,0.08],[2.24,0.26,0.3],materials.metal,true,frame);
    if(d.mode!=='walk')box(d.id+'-closed-panel',[0,1.4,0.025],[1.8,2.8,0.14],materials.metal,true,frame);
    if(d.id==='Pillsbury') { for(const x of [-0.94,0.94])box('Pillsbury-fixed-extra-reveal-'+x,[x,1.4,0.27],[0.08,2.8,0.12],materials.metal,true,frame);box('Pillsbury-fixed-extra-reveal-top',[0,2.76,0.27],[1.95,0.08,0.12],materials.metal,true,frame); }
    const label=sign(d.id+'-sign',d.id+'\n'+(quickplay&&['Brasenhill','Pillsbury'].includes(d.id)?(d.id==='Brasenhill'?'ORIGINAL TEST ROOM A':'PILLSBURY-INSPIRED LOOP'):'FUTURE WING'),[0,3.48,0.24],0,2.6,0.72,frame);
    const status=sign(d.id+'-state',(d.mode==='walk'?'OPEN ◇':'LOCKED ■'),[0,2.48,0.24],0,1.52,0.26,frame);
    const indicator=box(d.id+'-indicator',[0.72,2.06,0.15],[0.13,0.13,0.05],d.mode==='walk'?materials.open:materials.locked,false,frame);
    doorIndicators.set(d.id,{label,status,indicator,frame});
  }
  // Handrails stop clear of every useful doorway and sit at approximately one metre.
  for(const [name,x,z,w,d] of [['south',0,6.8,16.7,0.1],['west-n',-8.8,-4.1,0.1,4.8],['west-s',-8.8,4.1,0.1,4.8],['north-mid',0,-6.8,4.6,0.1],['east-mid',8.8,0.45,0.1,2.3]])box('handrail-'+name,[x,1,z],[w,0.075,d],materials.metal);
  const entryGate=quickplay?box('quickplay-Brasenhill-locked-gate',[-9.12,1.4,0],[0.22,2.8,1.8],materials.metal):null;
  const items=new Map();
  const latch=box('test-latch',[layout.latch.x,layout.latch.y,layout.latch.z],[0.18,0.28,0.28],materials.locked);
  const latchSign=sign('latch-sign','E · TEST LATCH\nUNLOCK PILLSBURY',[-14.79,1.98,0],Math.PI/2,1.9,0.5);
  if(quickplay){
    solids.splice(solids.indexOf(latch),1); // Collectible is not an obstacle to its own interaction ray.
    const addItem=(id,area,label,position,color,mesh=null,existingSign=null)=>{
      const material=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.22,roughness:.7});resources.push(material);
      mesh??=box(id,position,[.48,.48,.48],material,false);mesh.material=material;mesh.scale.set(.48,.48,.48);
      const title=existingSign??sign(id+'-label',label+'\nE · PICK UP',[position[0],position[1]+.68,position[2]],0,2.3,.5);
      title.setText(label+'\nE · PICK UP');items.set(id,{id,area,label,x:position[0],y:position[1],z:position[2],mesh,sign:title});
    };
    addItem('hall-key','hall','1 · HALL KEY',[0,1.15,2.7],0x66bfe0);
    addItem('room-a-key','A','2 · PILLSBURY KEY',[layout.latch.x,layout.latch.y,layout.latch.z],0xe8ba56,latch,latchSign);
    addItem('room-b-token','B','3 · FINAL TOKEN',[layout.mansion.tokenLocations[0].x,1.15,layout.mansion.tokenLocations[0].z],0x8dd78c);
  }
  const returnFrame=new THREE.Group();returnFrame.name='B-return-frame';returnFrame.position.set(layout.bayReturn.x,0,layout.bayReturn.z+.15);returnFrame.rotation.y=Math.PI;scene.add(returnFrame);
  for(const x of [-1.01,1.01])box('B-return-jamb-'+x,[x,1.4,0.08],[0.22,2.8,0.3],materials.metal,true,returnFrame);
  box('B-return-panel',[0,1.4,0],[1.8,2.8,0.13],materials.metal,true,returnFrame);
  sign('B-return-sign','Pillsbury\nE · RETURN TO HALL',[0,2.48,0.15],0,2.3,0.5,returnFrame);
  const strip=box('one-maintenance-strip',layout.strip.position,[0.09,0.92,0.015],materials.metal,false);
  for(let x=0.55;x<1.7;x+=0.12)box('distant-grille-'+x,[x,4.75,-6.35],[0.026,1.15,0.035],materials.metal,false);
  box('grille-top',[1.1,5.32,-6.35],[1.2,0.04,0.04],materials.metal,false);box('grille-bottom',[1.1,4.18,-6.35],[1.2,0.04,0.04],materials.metal,false);
  scene.add(new THREE.HemisphereLight(0x98b3b1,0x3b4236,.95));
  const sky=new THREE.DirectionalLight(0xb0c3b3,.85);sky.position.set(0,6,1);scene.add(sky);
  for(const [x,color]of[[-7,0xabbcaf],[7,0xc4a36e]]){const l=new THREE.PointLight(color,14,14,2);l.position.set(x,3.6,-3);scene.add(l);}
  // Preserve sign/key emissions and geometry while giving opaque surfaces a shared coarse finish.
  applyPS2Materials(scene,{profile:'environment'});
  scene.updateMatrixWorld(true);
  const bounds=()=>{scene.updateMatrixWorld(true);return solids.filter(mesh=>mesh.visible).map(mesh=>({mesh,box:new THREE.Box3().setFromObject(mesh)}));};
  let colliders=bounds();
  function contains(f,x,z){if(x<f.minX||x>f.maxX||z<f.minZ||z>f.maxZ)return false;if(!f.polygon)return true;let inside=false;const p=f.polygon;for(let i=0,j=p.length-1;i<p.length;j=i++){const [xi,zi]=p[i],[xj,zj]=p[j];const cross=(x-xi)*(zj-zi)-(z-zi)*(xj-xi);if(Math.abs(cross)<1e-7&&x>=Math.min(xi,xj)-1e-7&&x<=Math.max(xi,xj)+1e-7&&z>=Math.min(zi,zj)-1e-7&&z<=Math.max(zi,zj)+1e-7)return true;if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)inside=!inside;}return inside;}
  function spaceAt(x,z){return floors.find(f=>contains(f,x,z))?.space??null;}
  function areaAt(x,z){return floors.find(f=>contains(f,x,z))?.id??null;}
  function isSafe(p,r=layout.player.radius){
    if(!p||![p.x,p.z,r].every(Number.isFinite)||r<=0)return false;
    for(const dx of [-r,r])for(const dz of[-r,r])if(!areaAt(p.x+dx,p.z+dz))return false;
    const cylinderY={min:0.015,max:layout.player.height};
    return !colliders.some(({box:b})=>b.max.y>cylinderY.min&&b.min.y<cylinderY.max&&Math.hypot(p.x-Math.max(b.min.x,Math.min(b.max.x,p.x)),p.z-Math.max(b.min.z,Math.min(b.max.z,p.z)))<r-1e-7);
  }
  function lineClear(a,b){const direction=new THREE.Vector3(b.x-a.x,(b.y??1.15)-(a.y??1.62),b.z-a.z);const distance=direction.length();if(distance<0.01)return true;const ray=new THREE.Raycaster(new THREE.Vector3(a.x,a.y??1.62,a.z),direction.normalize(),0,distance-0.18);return ray.intersectObjects(solids.filter(mesh=>mesh.visible),false).length===0;}
  return {scene,materials,solids,items,entryGate,interiorDoors,get doorVersion(){return doorVersion;},
    setInteriorDoors(ids=[]){const open=new Set(ids);let changed=false;for(const d of interiorDoors.values()){const value=open.has(d.id);if(d.open!==value){d.open=value;d.panel.visible=!value;changed=true;}}if(changed){doorVersion++;colliders=bounds();}},
    nearbyDoor(player){return [...interiorDoors.values()].filter(d=>!d.open&&player.near({...d,y:1.4})).sort((a,b)=>Math.hypot(a.x-player.state.x,a.z-player.state.z)-Math.hypot(b.x-player.state.x,b.z-player.state.z))[0]??null;},createSign:sign,floors,signs,doorIndicators,latch,strip,motion:createStripMotion(strip),layout,areaAt,spaceAt,isSafe,lineClear,
    refreshColliders(){colliders=bounds();return colliders;},get colliders(){return colliders;},
    updateProgress(progress){this.setInteriorDoors(progress.openedDoors??[]);for(const [id,d]of doorIndicators){d.status.setText(progress.doorState(id));d.indicator.material=progress.doorState(id).startsWith('OPEN')?materials.open:materials.locked;}if(!quickplay)latch.material=progress.unlocked?materials.open:materials.locked;else{entryGate.visible=!progress.firstUnlocked;const token=items.get('room-b-token'),p=layout.mansion.tokenLocations[progress.tokenLocation];Object.assign(token,{x:p.x,y:p.y,z:p.z,space:p.space});token.mesh.position.set(p.x,p.y,p.z);token.sign.group.position.set(p.x,p.y+.68,p.z);for(const item of items.values()){item.mesh.visible=!progress.collected(item.id);item.sign.group.visible=!progress.collected(item.id);}colliders=bounds();}},
    dispose(){boxGeometry.dispose();materials.dispose();resources.forEach(r=>r.dispose());scene.clear();}
  };
}
