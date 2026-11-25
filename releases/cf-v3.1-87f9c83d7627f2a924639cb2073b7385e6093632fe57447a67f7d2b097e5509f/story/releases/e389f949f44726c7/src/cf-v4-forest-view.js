import * as THREE from 'three';

const noise=n=>{const v=Math.sin(n*12.9898+78.233)*43758.5453;return v-Math.floor(v);};
const leafName=name=>/foliage|\bleaf\b|\bleaves\b|crown/i.test(name);

// Presentation only. The original maze owns occupancy, doors, visibility and AI.
// Instance buffers, generated geometry and cloned materials belong to this helper;
// the already decoded broadleaf asset and its textures remain with the scene owner.
function forestBatches(parent,asset){
 const source=asset?.scene||asset;
 if(!source?.isObject3D)throw Error('Forest dressing requires the existing broadleaf asset');
 source.updateMatrixWorld(true);
 const root=new THREE.Group();root.name='Clarence low-poly forest';parent.add(root);
 const batches=[],materials=new Set(),geometries=new Set(),parts=[];
 const matrix=new THREE.Matrix4(),pose=new THREE.Object3D();let disposed=false;
 const material=(source,color)=>{
  const m=source?source.clone():new THREE.MeshStandardMaterial({roughness:1,flatShading:true});
  m.color.multiply(new THREE.Color(color));m.roughness=1;materials.add(m);return m;
 };
 try{
  for(let i=0;i<3;i++){
   const tree=source.getObjectByName('Broadleaf_'+i);
   if(!tree)throw Error('Forest dressing requires Broadleaf_0/1/2');
   tree.traverse(mesh=>{
    if(!mesh.isMesh||!mesh.geometry?.attributes.position)return;
    if(Array.isArray(mesh.material))throw Error('Broadleaf forest expects single-material parts');
    const relative=new THREE.Matrix4().copy(tree.matrixWorld).invert().multiply(mesh.matrixWorld);
    parts.push({variant:i,leaf:leafName(mesh.name),geometry:mesh.geometry,relative,material:material(mesh.material,leafName(mesh.name)?0x849b80:0xa09382)});
   });
  }
  if(!parts.some(p=>p.leaf))throw Error('Forest dressing requires broadleaf foliage');
 }catch(error){for(const m of materials)m.dispose();root.removeFromParent();throw error;}
 const shrubGeometry=new THREE.IcosahedronGeometry(1,0),branchGeometry=new THREE.CylinderGeometry(.065,.12,1,5);
 geometries.add(shrubGeometry);geometries.add(branchGeometry);
 const shrubMaterial=material(null,0x263a2b),branchMaterial=material(null,0x3d352b);
 function batch(name,geometry,mat,capacity){
  const mesh=new THREE.InstancedMesh(geometry,mat,capacity);mesh.name=name;mesh.count=0;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.castShadow=false;mesh.receiveShadow=true;root.add(mesh);batches.push(mesh);return mesh;
 }
 const trees=parts.map(part=>({...part,batch:batch('Forest tree '+part.variant+' '+(part.leaf?'canopy':'trunk'),part.geometry,part.material,80)}));
 const shrubs=batch('Packed forest bushes',shrubGeometry,shrubMaterial,640);
 const branches=batch('Forest roots and portal branches',branchGeometry,branchMaterial,160);
 const canopy=parts.filter(p=>p.leaf).map(part=>({...part,batch:batch('Forest overhead canopy '+part.variant,part.geometry,part.material,36)}));
 function write(mesh,placements,relative){
  mesh.count=Math.min(placements.length,mesh.instanceMatrix.count);
  for(let i=0;i<mesh.count;i++){
   const p=placements[i];pose.position.set(p.x,p.y||0,p.z);pose.rotation.set(p.rx||0,p.yaw||0,p.rz||0);
   pose.scale.set(p.sx??p.scale??1,p.sy??p.scale??1,p.sz??p.scale??1);pose.updateMatrix();
   matrix.copy(pose.matrix);if(relative)matrix.multiply(relative);mesh.setMatrixAt(i,matrix);
  }
  mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();
 }
 function update({treePoints=[],bushPoints=[],branchPoints=[],canopyPoints=[]}){
  if(disposed)return;
  for(const part of trees)write(part.batch,treePoints.filter(p=>p.variant===part.variant),part.relative);
  for(const part of canopy)write(part.batch,canopyPoints.filter(p=>p.variant===part.variant),part.relative);
  write(shrubs,bushPoints);write(branches,branchPoints);
 }
 return {root,update,stats:()=>({trees:trees.filter(p=>!p.leaf).reduce((n,p)=>n+p.batch.count,0),bushes:shrubs.count,drawBatches:batches.filter(m=>m.count>0).length}),
  dispose(){if(disposed)return;disposed=true;root.removeFromParent();for(const mesh of batches)mesh.dispose();for(const g of geometries)g.dispose();for(const m of materials)m.dispose();root.clear();}};
}

function arch(x,z,width=1.6){
 const points=[];
 for(const side of [-1,1]){
  points.push({x:x+side*(width/2+.18),y:1.2,z,sy:2.8,sx:2,sz:2,rz:-side*.13});
  points.push({x:x+side*width*.26,y:2.85,z,sy:width*.72,sx:1.5,sz:1.5,rz:side*.9});
 }
 return points;
}
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);

export function createForestMazeView({corridorParent,fieldParent,asset}={}){
 const corridor=forestBatches(corridorParent,asset),field=forestBatches(fieldParent,asset);
 let boundary=[],world=null,revision=-1,key='',disposed=false;
 const stats={theme:'forest',trees:0,bushes:0,drawBatches:0};
 function rebuild(w){
  boundary=[];world=w;revision=w.revision;
  for(let z=0;z<w.height;z++)for(let x=0;x<w.width;x++){
   if(!w.walk[z*w.width+x])continue;
   for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){
    const nx=x+dx,nz=z+dz;
    if(nx>=0&&nx<w.width&&nz>=0&&nz<w.height&&w.walk[nz*w.width+nx])continue;
    boundary.push({x:(x+.5+dx*.5)*w.size,z:(z+.5+dz*.5)*w.size,dx,dz,seed:x*97+z*17+dx*3+dz});
   }
  }
  key='';
 }
 function update(game,{reveal}={}){
  if(disposed)return;
  const w=game.corridorMaze.cornWorld,p=game.player,inField=p.zone==='field';
  corridor.root.visible=!inField;field.root.visible=inField;
  if(world!==w||revision!==w.revision)rebuild(w);
  const next=`${inField}:${Math.floor(p.x/2)}:${Math.floor(p.z/2)}:${reveal?.x??''}:${reveal?.z??''}`;
  if(next===key)return;key=next;
  const treePoints=[],bushPoints=[],branchPoints=[],canopyPoints=[];
  if(!inField){
   // Every opaque hedge sits on the blocked side of the existing grid edge.
   // Rebuild from the current grid when an occluded maze section changes.
   const near=boundary.filter(b=>distance(b,p)<25).sort((a,b)=>distance(a,p)-distance(b,p)).slice(0,210);
   for(const b of near){
    const n=noise(b.seed),yaw=Math.atan2(b.dx,b.dz),depth=.66;
    for(let layer=0;layer<3;layer++)bushPoints.push({x:b.x+b.dx*depth*.95,z:b.z+b.dz*depth*.95,y:.48+layer*.83,
     sx:b.dx?depth:.66,sz:b.dz?depth:.66,sy:.72+n*.15,yaw:0,rx:n*.24,rz:n*.16});
    if(b.seed%4===0)branchPoints.push({x:b.x+b.dx*.23,z:b.z+b.dz*.23,y:1.25,sy:2.8,sx:2,sz:2,rz:(n-.5)*.16});
    if(b.seed%9===0){
     treePoints.push({x:b.x+b.dx*1.3,z:b.z+b.dz*1.3,scale:.68+n*.17,yaw,variant:Math.abs(b.seed)%3});
     canopyPoints.push({x:b.x+b.dx*.5,z:b.z+b.dz*.5,y:1.5,scale:.55,sy:.36,yaw,variant:Math.abs(b.seed)%3});
    }
   }
   for(const door of w.doors)if(door.fieldEntrance&&distance(door,p)<22)branchPoints.push(...arch(door.x,door.z,door.width));
   corridor.update({treePoints,bushPoints,branchPoints:branchPoints.slice(0,160),canopyPoints});
   Object.assign(stats,corridor.stats());
  }else{
   const cx=Math.floor(p.x/5),cz=Math.floor(p.z/5);
   for(let z=cz-6;z<=cz+6;z++)for(let x=cx-6;x<=cx+6;x++){
    const seed=x*97+z*41,n=noise(seed),tx=x*5+n*2.4,tz=z*5+noise(seed+5)*2.4;
    if(Math.hypot(tx-p.x,tz-p.z)>28||Math.hypot(tx,tz)<4||reveal&&Math.hypot(tx-reveal.x,tz-reveal.z)<(reveal.radius??2)+1)continue;
    treePoints.push({x:tx,z:tz,scale:.61+n*.23,yaw:n*6.28,variant:Math.abs(seed)%3});
   }
   treePoints.sort((a,b)=>distance(a,p)-distance(b,p));treePoints.splice(72);
   const bx=Math.floor(p.x/2),bz=Math.floor(p.z/2);
   for(let z=bz-12;z<=bz+12;z++)for(let x=bx-12;x<=bx+12;x++){
    const seed=x*61+z*29,n=noise(seed),tx=x*2+n,tz=z*2+noise(seed+7);
    if(Math.hypot(tx-p.x,tz-p.z)>23||Math.hypot(tx,tz)<2.2||reveal&&Math.hypot(tx-reveal.x,tz-reveal.z)<(reveal.radius??2))continue;
    bushPoints.push({x:tx,z:tz,y:.22+n*.16,sx:.55+n*.3,sy:.35+n*.25,sz:.6+n*.2,yaw:n*6.28});
   }
   branchPoints.push(...arch(0,0));field.update({treePoints,bushPoints,branchPoints});Object.assign(stats,field.stats());
  }
 }
 return {stats,update,setVisible(value){corridor.root.visible=value;field.root.visible=value;key='';},dispose(){if(disposed)return;disposed=true;corridor.dispose();field.dispose();}};
}

export function createForestEscapeView({parent,asset,layout}={}){
 const view=forestBatches(parent,asset),treePoints=[],bushPoints=[],branchPoints=[];
 for(const [index,c]of layout.colliders.entries()){
  if(!c.id.startsWith('corn-'))continue;
  for(let z=c.minZ+.4;z<c.maxZ;z+=.85)for(let x=c.minX+.4;x<c.maxX;x+=.85){
   const n=noise(x*43+z*17);bushPoints.push({x,z,y:.6,sx:.7,sy:.9+n*.15,sz:.7});
   if((Math.round(x*2)+Math.round(z*2)+index)%7===0)treePoints.push({x,z,scale:.66+n*.14,yaw:n*6.28,variant:index%3});
  }
 }
 for(let x=-20;x<=20;x+=5)for(const z of [-26,18])treePoints.push({x,z,scale:.8,yaw:noise(x+z)*6.28,variant:Math.abs(x)%3});
 for(let z=-23;z<=16;z+=5)for(const x of [-20,19])treePoints.push({x,z,scale:.8,yaw:noise(x+z)*6.28,variant:Math.abs(z)%3});
 treePoints.splice(80);branchPoints.push(...arch(layout.bike.x,layout.bike.z+1.8,2.6));
 view.update({treePoints,bushPoints:bushPoints.slice(0,640),branchPoints});
 return view;
}
