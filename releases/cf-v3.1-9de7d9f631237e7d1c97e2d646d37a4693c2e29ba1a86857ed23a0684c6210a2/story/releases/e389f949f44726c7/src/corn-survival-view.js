import * as THREE from 'three';
import {SURVIVAL_VIEW_BOUNDS as B} from './corn-layout.js';
import {cornNode,cornPath} from './corn-world.js';
import {createReturnGlow,createReturnHaloTexture,returnBeaconPose} from './return-beacon.js';

// Fixed instance capacity; a topology revision only updates matrices/counts.
export function createSurvivalView(scene,maze,{compact=false}={}){
  if(!maze.survivalLayout)return {update(){},setCorn(){},stats:{enabled:false}};
  const group=new THREE.Group();group.name='Streamed corn sections';scene.add(group);
  const capacity=B.width*B.height,cell=maze.cornWorld.size,dummy=new THREE.Object3D();
  const backing=new THREE.InstancedMesh(new THREE.BoxGeometry(cell,2.7,cell),
    new THREE.MeshStandardMaterial({color:compact?0x0c1410:0x152017,roughness:1}),capacity);
  backing.instanceMatrix.setUsage(THREE.DynamicDrawUsage);group.add(backing);
  const fallback=new THREE.ConeGeometry(.23,2.8,5).translate(0,1.4,0);
  const material=new THREE.MeshStandardMaterial({color:0x485038,roughness:1});
  const plants=Array.from({length:3},()=>{
    const mesh=new THREE.InstancedMesh(fallback,material,capacity);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);group.add(mesh);return mesh;
  });
  let previous='',force=true;
  const stats={enabled:true,capacityPerBatch:capacity,batches:4,plants:0,solids:0,updates:0};
  return {
    stats,
    dispose(){group.removeFromParent();for(const mesh of [backing,...plants])mesh.dispose();backing.geometry.dispose();backing.material.dispose();fallback.dispose();material.dispose();},
    setCorn(models){models?.forEach((source,i)=>{plants[i].geometry=source.geometry;plants[i].material=source.material;});force=true;},
    update(game){
      const w=game.maze.cornWorld,revision=`${game.runId}:${w.revision||0}`;
      if(!force&&previous===revision)return;previous=revision;force=false;
    let boxes=0;const counts=[0,0,0];
      for(let z=B.z;z<B.z+B.height;z++)for(let x=B.x;x<B.x+B.width;x++){
        const id=z*w.width+x,solid=!w.walk[id],cover=!!w.corn[id];
        if(!solid&&!cover)continue;
        const exposed=!compact||cover||w.walk[id-1]||w.walk[id+1]||w.walk[id-w.width]||w.walk[id+w.width];
        if(solid){
          const height=compact?(exposed?.39:.78):1;
          dummy.position.set((x+.5)*cell,1.35*height,(z+.5)*cell);dummy.rotation.set(0,0,0);
          dummy.scale.set(compact?.98:1,height,compact?.98:1);dummy.updateMatrix();backing.setMatrixAt(boxes++,dummy.matrix);
        }
        const copies=compact?(exposed?2:1):3;
        for(let j=0;j<copies;j++){
          const i=compact?(x+z*2+j)%3:j;
          dummy.position.set((x+(compact?.30+j*.41:.22+i*.25))*cell,0,(z+(compact?.30+((x+j)%2)*.37:.24+((x+i)%3)*.24))*cell);
          dummy.rotation.set(0,(x*13+z*7+i)*.67,0);
          if(compact)dummy.scale.set(cover?.69:.65,cover?.82:1.10,cover?.69:.65);
          else dummy.scale.setScalar(cover?.8:1.04);
          dummy.updateMatrix();
          plants[i].setMatrixAt(counts[i]++,dummy.matrix);
        }
      }
      backing.count=boxes;backing.instanceMatrix.needsUpdate=true;backing.computeBoundingSphere();
      plants.forEach((mesh,i)=>{mesh.count=counts[i];mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();});
      Object.assign(stats,{plants:counts.reduce((sum,n)=>sum+n,0),solids:boxes,updates:stats.updates+1});
    },
  };
}

/** Signs follow the walkable route through the original gate, even after a row changes. */
export function createSurvivalExitSigns(scene,game,camera){
  const world=game.maze.cornWorld,layout=game.maze.survivalLayout,door=world.doors[layout.inner];
  const group=new THREE.Group();group.visible=false;scene.add(group);
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=112;
  const pen=canvas.getContext('2d');
  pen.fillStyle='#37090b';pen.fillRect(0,0,256,112);
  pen.strokeStyle='#ff4c44';pen.lineWidth=4;pen.strokeRect(5,5,246,102);
  pen.font='bold 43px monospace';pen.fillStyle='#ffe7ca';pen.textAlign='center';pen.fillText('EXIT HERE',128,52,234);
  pen.beginPath();pen.moveTo(128,62);pen.lineTo(152,88);pen.lineTo(138,88);pen.lineTo(138,98);
  pen.lineTo(118,98);pen.lineTo(118,88);pen.lineTo(104,88);pen.closePath();pen.fill();
  const label=new THREE.CanvasTexture(canvas);label.colorSpace=THREE.SRGBColorSpace;
  const material=new THREE.MeshBasicMaterial({map:label,side:THREE.DoubleSide,toneMapped:false});
  const boards=Array.from({length:6},()=>{const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1.3,.57),material);group.add(mesh);return mesh;});
  const [gateSign,outerSign,...trail]=boards;
  gateSign.position.set(door.x,2.74,door.z+.06);
  const outer=world.doors[layout.outer];outerSign.position.set(outer.x,2.74,outer.z+.06);
  const lantern=new THREE.Mesh(new THREE.BoxGeometry(.16,.18,.16),new THREE.MeshStandardMaterial());
  lantern.position.set(door.hinge.x,2.26,door.z+.18);group.add(lantern);
  const light=new THREE.PointLight();light.position.copy(lantern.position);group.add(light);
  const glow=createReturnGlow(lantern,light,{intensity:14,distance:8});
  const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:createReturnHaloTexture(),color:0xff2319,opacity:.52,transparent:true,depthWrite:false,depthTest:false,fog:false,blending:THREE.AdditiveBlending}));
  halo.renderOrder=2;group.add(halo);
  let previous='';
  return {update(reduced){
    group.visible=game.cornSurvival.exitReady;if(!group.visible)return;
    const beam=returnBeaconPose(game.player,door,camera.far);halo.position.set(beam.x,4.7,beam.z);halo.scale.set(2.8,8,1);
    halo.material.opacity=glow(game.elapsed,reduced)*.56;
    const key=`${cornNode(world,game.player)}:${world.revision}:${game.doorRevision}`;
    if(key===previous)return;previous=key;
    const path=cornPath(world,game.player,{x:door.x-world.size/2,z:door.z+.85},game.blocks,{allowDoors:true});
    const marks=[];
    for(let i=2;i<path.length-1&&marks.length<trail.length;i++){
      const from=path[i-1],point=path[i],to=path[i+1];
      const dx=to.x-point.x,dz=to.z-point.z;
      if(Math.abs((point.x-from.x)*dz-(point.z-from.z)*dx)>.02||i===3)marks.push({x:point.x+(point.x-from.x)*.26,z:point.z+(point.z-from.z)*.26});
    }
    trail.forEach((sign,i)=>{
      const mark=marks[i];sign.visible=!!mark;if(!mark)return;
      sign.position.set(mark.x,2.14,mark.z);
      sign.scale.set(.84,.86,1);
      sign.rotation.y=Math.atan2(game.player.x-mark.x,game.player.z-mark.z);
    });
  }};
}
