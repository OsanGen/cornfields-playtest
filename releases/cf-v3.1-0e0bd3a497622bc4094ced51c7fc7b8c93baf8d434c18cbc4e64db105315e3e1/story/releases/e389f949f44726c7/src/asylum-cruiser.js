import * as THREE from 'three';
import {prepareCruiser,sampleCruiserLampState} from './prologue-assets.js';
import {smooth,clamp} from './asylum-crash.js';
export function box(parent,name,size,position,material){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);m.name=name;m.position.fromArray(position);parent.add(m);return m;}
export function actualVertices(mesh){mesh.updateWorldMatrix(true,false);mesh.skeleton?.update();return Array.from({length:mesh.geometry.attributes.position.count},(_,i)=>mesh.getVertexPosition(i,new THREE.Vector3()).applyMatrix4(mesh.matrixWorld));}
export function meshBounds(root){root.updateWorldMatrix(true,true);const b=new THREE.Box3();root.traverse(o=>{if(o.isMesh&&o.visible)for(const p of actualVertices(o))b.expandByPoint(p);});return b;}
export const REAR_CABIN=Object.freeze({seam:1.48,extension:.85,aperture:[1.54,2.48],doorX:1.11,floorTop:.16,seatZ:2.4,roofBottom:1.4825});
/** Clip and interpolate the inherited render triangles at the conversion seam.
 * Front cabin/doors stay in place; wheels/arches/deck move as intact assemblies.
 * Rear cabin panels are replaced by a complete framed opening, not invisible collision exemptions.
 */
function convertRearBody(root,car,owned){
 root.updateMatrixWorld(true);const protectedRoots=[car.door,car.driverDoor,car.steering,...car.tires.map(t=>t.hub)];
 const under=(o,p)=>{for(let x=o;x;x=x.parent)if(x===p)return true;return false;};
 const clip=(poly,axis,value,above)=>{const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=(a.p[axis]-value)*(above?1:-1),db=(b.p[axis]-value)*(above?1:-1);if(da>=0)out.push(a);if((da>=0)!==(db>=0)){const u=da/(da-db),v={p:a.p.clone().lerp(b.p,u),attr:{}};for(const k of Object.keys(a.attr))v.attr[k]=a.attr[k].map((n,j)=>n+(b.attr[k][j]-n)*u);out.push(v);}}return out;};
 car.model.traverse(o=>{if(!o.isMesh||protectedRoots.some(p=>under(o,p)))return;const source=o.geometry,position=source.attributes.position;if(!position)return;const points=actualVertices(o).map(p=>root.worldToLocal(p));if(Math.max(...points.map(p=>p.z))<=REAR_CABIN.seam)return;
  if(/Squared municipal wheel arch|Sedan rear trunk deck/.test(o.name)){o.position.z+=REAR_CABIN.extension;return;}
  const interior=(()=>{for(let p=o;p&&p!==car.model;p=p.parent)if(/^Interior/.test(p.name))return true;return false;})();
  const inverse=o.matrixWorld.clone().invert(),attributes=Object.fromEntries(Object.keys(source.attributes).map(k=>[k,[]])),groups=[],index=source.index,count=index?index.count:position.count;
  function emit(poly,materialIndex,shift=false){if(poly.length<3)return;const start=attributes.position.length/3;for(let i=1;i<poly.length-1;i++)for(const v of [poly[0],poly[i],poly[i+1]]){const p=v.p.clone();if(shift)p.z+=REAR_CABIN.extension;p.applyMatrix4(root.matrixWorld).applyMatrix4(inverse);for(const[k,a]of Object.entries(attributes)){if(k==='position')a.push(...p.toArray());else a.push(...v.attr[k]);}}groups.push({start,count:attributes.position.length/3-start,materialIndex});}
  for(let i=0;i<count;i+=3){const materialIndex=source.groups.find(g=>i>=g.start&&i<g.start+g.count)?.materialIndex||0,tri=[0,1,2].map(j=>{const id=index?index.getX(i+j):i+j;return{p:points[id],attr:Object.fromEntries(Object.entries(source.attributes).map(([k,a])=>[k,Array.from({length:a.itemSize},(_,n)=>a.getComponent(id,n))]))};});
   emit(clip(tri,'z',REAR_CABIN.seam,false),materialIndex);
   let aft=clip(tri,'z',REAR_CABIN.seam,true);if(aft.length<3||interior)continue;
   // The old low roof/windows are replaced through the aft-cabin back edge;
   // retain its lower underbody/deck and visible rear quarter/wheel surfaces.
   const cabinEnd=3.06-REAR_CABIN.extension,doorEnd=2.52-REAR_CABIN.extension;
   const tail=clip(aft,'z',cabinEnd,true);emit(tail,materialIndex,true);
   const cabin=clip(aft,'z',cabinEnd,false),lower=clip(cabin,'y',.99,false);
   // New opening occupies the gap and adjacent narrow quarter-panel strip.
   // Keep rocker/bottom, plus quarter panels behind the door and central floor.
   emit(clip(lower,'z',doorEnd,true),materialIndex,true);
   const doorway=clip(lower,'z',doorEnd,false);emit(clip(doorway,'y',.16,false),materialIndex,true);
   let middle=clip(clip(doorway,'y',.16,true),'x',-.84,true);middle=clip(middle,'x',.84,false);emit(middle,materialIndex,true);
  }
  const geometry=new THREE.BufferGeometry();for(const[k,a]of Object.entries(attributes))geometry.setAttribute(k,new THREE.Float32BufferAttribute(a,source.attributes[k].itemSize));for(const g of groups)if(g.count)geometry.addGroup(g.start,g.count,g.materialIndex);if(source.attributes.normal)geometry.normalizeNormals();else geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();o.geometry=geometry;owned.push(geometry);
 });
 for(const tire of car.tires)if(!tire.front)tire.hub.position.z+=REAR_CABIN.extension;
 root.updateMatrixWorld(true);
}
/** Runtime-only original rear compartment. Inherited asset bytes and front fit stay owned by their source. */
export function createAsylumCruiser(gltf){
 if(!gltf?.scene?.getObjectByName('BodyWindshield'))throw new Error('Critical cruiser geometry missing');
 const root=new THREE.Group(),car=prepareCruiser(gltf.scene),owned=[];root.add(car.model);convertRearBody(root,car,owned);const rear=new THREE.Group();rear.name='Original secured rear compartment';root.add(rear);rear.visible=true;
 const charcoal=new THREE.MeshStandardMaterial({color:0x172125,roughness:.72}),metal=new THREE.MeshStandardMaterial({color:0x728185,metalness:.65,roughness:.43}),glass=new THREE.MeshStandardMaterial({color:0xb7c4c1,transparent:true,opacity:.14,roughness:.16,depthWrite:false,side:THREE.DoubleSide});
 const floor=box(rear,'Rear floor',[2.12,.06,1.58],[0,.13,2.27],charcoal);
 const seat=box(rear,'Custody seat cushion',[1.48,.14,.38],[0,.203,2.4],charcoal);
 const back=box(rear,'Custody seat back',[1.5,.66,.08],[0,.82,2.67],charcoal);
 const roof=box(rear,'Rear custody roof',[2.24,.055,1.58],[0,1.51,2.27],charcoal);
 const partition=box(rear,'Transparent custody partition',[2.12,1.3,.025],[0,.81,1.48],glass);
 for(const x of [-1.065,1.065])box(rear,'Partition frame',[.028,1.30,.035],[x,.81,1.48],metal);
 const doors=[];for(const side of [-1,1]){
  const pivot=new THREE.Group();pivot.name=`Rear door ${side}`;pivot.position.set(side*1.11,.16,1.52);rear.add(pivot);
  box(pivot,'Rear door lower panel',[.05,.62,.98],[0,.31,.49],charcoal);
  box(pivot,'Rear door glass',[.026,.65,.94],[0,.95,.49],glass);
  box(pivot,'Rear door beltline',[.055,.025,.98],[0,.625,.49],charcoal);
  box(pivot,'Rear door upper frame',[.055,.055,.98],[0,1.3,.49],charcoal);
  for(const z of [.0175,.9625])box(pivot,'Rear door upright',[.055,1.26,.035],[0,.66,z],charcoal);
  const handle=box(pivot,'Rear handle',[.045,.034,.16],[side*.051,.67,.79],metal);doors.push({pivot,handle,side});
 }
 box(rear,'Rear window',[2.20,.57,.026],[0,1.185,3.05],glass);
 for(const side of [-1,1]){for(const z of [1.515,2.525])box(rear,'Rear aperture pillar',[.055,1.30,.035],[side*1.11,.81,z],charcoal);box(rear,'Rear sill',[.075,.08,1.01],[side*1.11,.12,2.02],charcoal);box(rear,'Rear window header',[.06,.04,1.03],[side*1.11,1.465,2.02],charcoal);}
 for(const side of [-1,1]){
  box(rear,'Rear quarter glass',[.028,.43,.49],[side*1.11,1.245,2.79],glass);
  box(rear,'Rear quarter beltline',[.06,.06,.55],[side*1.11,1.005,2.79],charcoal);
  box(rear,'Rear quarter header',[.06,.055,.55],[side*1.11,1.46,2.79],charcoal);
  box(rear,'Rear C pillar',[.06,.51,.045],[side*1.11,1.225,3.055],charcoal);
  box(rear,'Rear wheel-well inner panel',[.045,.82,.55],[side*.81,.57,2.79],charcoal);
  box(rear,'Rear quarter armrest',[.33,.055,.55],[side*.96,.975,2.79],charcoal);
 }
 box(rear,'Front roof join',[2.24,.08,.035],[0,1.46,1.48],charcoal);
 box(rear,'Rear roof join',[2.24,.055,.06],[0,1.48,3.05],charcoal);
 box(rear,'Rear window lower rail',[2.15,.14,.055],[0,.85,3.05],charcoal);
 box(rear,'Rear cabin back panel',[2.13,.64,.05],[0,.48,3.05],charcoal);
 const shards=new THREE.Group();shards.name='Persistent broken windshield';root.add(shards);shards.visible=false;
 const shardMaterial=glass.clone();shardMaterial.opacity=.43;
 // Retained fragments are sampled on actual inherited windshield triangles,
 // transformed once into cruiser coordinates; no unrelated flat glass plane.
 root.updateMatrixWorld(true);
 const windshield=car.model.getObjectByName('BodyWindshield'),points=actualVertices(windshield).map(p=>root.worldToLocal(p)),index=windshield.geometry.index,front=[];
 for(let i=0;i<(index?.count||points.length);i+=3){const tri=[0,1,2].map(j=>points[index?index.getX(i+j):i+j]);if(tri.every(p=>p.z<-.45))front.push(tri);}
 if(front.length<24)throw new Error('Actual windshield fragment surface unavailable');
 for(let i=0;i<24;i++){
  const tri=front[Math.floor(i*(front.length-1)/23)],g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(tri.flatMap(p=>p.toArray()),3));g.computeVertexNormals();const m=new THREE.Mesh(g,shardMaterial);m.userData.rest=m.position.clone();shards.add(m);
 }
 let activated=true,broken=false;
 function activateCustody(){rear.visible=true;}

 return {root,car,rear,doors,seat,back,floor,roof,partition,shards,
  activateCustody,
  update(drive,{time=0,reduced=false,exit=0,custody=null,driverDoor=null,passengerDoor=null}={}){
   root.position.fromArray(drive.position);root.rotation.set(reduced?0:drive.bodyPitch||0,drive.yaw||0,reduced?0:drive.bodyRoll||0,'YXZ');car.update(drive,exit);if(driverDoor!==null)car.driverDoor.rotation.y=-clamp(driverDoor)*1.05;if(passengerDoor!==null)car.door.rotation.y=clamp(passengerDoor)*1.05;car.setLampState(sampleCruiserLampState(time,{reduced}));
   if(drive.brokenGlass){broken=true;car.model.getObjectByName('BodyWindshield').visible=false;}shards.visible=broken;
   if(custody!==null){activateCustody();doors[1].pivot.rotation.y=smooth((custody-20)/1)*(1-smooth((custody-28)/1))*Math.PI/2;doors[0].pivot.rotation.y=0;}
   for(let i=0;i<shards.children.length;i++){const m=shards.children[i],burst=drive.glassBurst||0;m.position.set((i%3-1)*burst*.15,-(1-burst)*burst*.32,burst*.18);}
   root.updateMatrixWorld(true);
  },
  diagnostics:()=>({rearActive:activated,broken,frontFit:'preserved front seam and complete original front doors',rearExtension:REAR_CABIN.extension,clearDoorAperture:REAR_CABIN.aperture[1]-REAR_CABIN.aperture[0],doorAngle:doors[1].pivot.rotation.y}),
  dispose(){for(const g of owned)g.dispose();},
 };
}
