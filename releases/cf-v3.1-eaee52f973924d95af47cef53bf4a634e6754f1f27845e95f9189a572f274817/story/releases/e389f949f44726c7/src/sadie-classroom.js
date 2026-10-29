import * as THREE from 'three';
import {applyPS2Materials} from './ps2-style.js';

// CF-S1: one shared Sadie design and one look-only classroom. No loaded assets,
// dependencies, child combat, teacher model, or second school environment.
const standard = color => new THREE.MeshStandardMaterial({color,roughness:.92});
function ownedBuilder(root) {
  const geometries=new Set(),materials=new Set();
  const add=(geometry,material,x=0,y=0,z=0,parent=root)=>{
    geometries.add(geometry);materials.add(material);
    const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);parent.add(mesh);return mesh;
  };
  const box=(m,w,h,d,x,y,z,p)=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z,p);
  const ball=(m,rx,ry,rz,x,y,z,p)=>{const mesh=add(new THREE.SphereGeometry(1,12,10),m,x,y,z,p);mesh.scale.set(rx,ry,rz);return mesh;};
  let disposed=false;
  const dispose=()=>{if(disposed)return;disposed=true;geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());root.removeFromParent();};
  return {add,box,ball,dispose};
}

/** Front faces +Z; feet at y=0; ordinary child proportions, approximately 1.22m. */
export function createSadie() {
  const group=new THREE.Group();group.name='Sadie — mustard cardigan and navy dress';
  const {add,ball,dispose}=ownedBuilder(group);
  const skin=standard(0xb98c72),hair=standard(0x29211e),navy=standard(0x243044),mustard=standard(0xa88740),shoe=standard(0x282724),eye=standard(0x211d19),lip=standard(0x80534b);
  const body=new THREE.Group();group.add(body);
  // Rounded limbs, tapered skirt, and a separate cardigan silhouette rather
  // than a box placeholder. One neutral, non-threatening idle pose only.
  for(const x of [-.095,.095]) {
    ball(skin,.043,.18,.048,x,.27,0,body);
    ball(shoe,.064,.047,.105,x,.05,.034,body);
  }
  add(new THREE.CylinderGeometry(.14,.215,.32,16),navy,0,.54,0,body);
  ball(navy,.145,.19,.085,0,.79,0,body);
  ball(mustard,.15,.17,.075,0,.80,-.04,body);
  for(const side of [-1,1]) {
    ball(mustard,.058,.17,.089,side*.112,.80,.032,body);
    const sleeve=ball(mustard,.052,.19,.055,side*.195,.74,0,body);sleeve.rotation.z=side*.10;
    ball(skin,.036,.057,.035,side*.213,.542,.01,body);
  }
  ball(skin,.047,.07,.045,0,.967,0,body);
  ball(hair,.153,.162,.115,0,1.078,-.022,body);
  ball(skin,.123,.142,.098,0,1.066,.035,body);
  // Shoulder-length dark hair framing an unobscured face.
  ball(hair,.135,.135,.058,0,1.056,-.092,body);
  for(const side of [-1,1]) {
    ball(hair,.046,.148,.077,side*.117,1.025,-.008,body);
    const fringe=ball(hair,.085,.032,.045,side*.055,1.18,.074,body);fringe.rotation.z=side*.30;
    ball(skin,.025,.036,.022,side*.121,1.057,.021,body);
    ball(eye,.012,.009,.008,side*.044,1.087,.126,body);
  }
  ball(skin,.016,.023,.017,0,1.054,.132,body);
  ball(lip,.026,.004,.005,0,1.021,.13,body);
  // Keep her mustard/navy silhouette readable; the wrapper only changes surfaces.
  applyPS2Materials(group,{profile:'character'});
  group.userData.character='Sadie';group.userData.targetable=false;
  group.userData.update=(time,reducedMotion=false)=>{body.rotation.z=reducedMotion?0:Math.sin((Number(time)||0)*.8)*.008;};
  group.userData.dispose=dispose;
  return group;
}

/**
 * Local room coordinates: front -Z, shelves left -X, tables +X, door back/right.
 * Pass the existing corn kit {geometry,material} entries. These are borrowed;
 * disposal intentionally never disposes the kit. No echo is visible initially.
 */
export function createClassroom({cornParts=[]}={}) {
  const group=new THREE.Group();group.name='Sadie kindergarten — single reused room';
  const {add,box,dispose}=ownedBuilder(group);
  const cream=standard(0xc5baa1),wood=standard(0x92734f),floor=standard(0x81705a),trim=standard(0xd5ccb6),rug=standard(0x665b64);
  const colors=[0x916758,0x627787,0x92845a,0x748068].map(standard);
  box(floor,7,.12,6,0,-.06,0);
  box(cream,.12,3.1,6,-3.5,1.55,0);box(cream,.12,3.1,6,3.5,1.55,0);
  box(cream,7,3.1,.12,0,1.55,3);box(cream,7,.12,6,0,3.1,0);
  // Real window opening in the front wall, ahead-left from the seated rug.
  box(cream,7,.75,.12,0,.375,-3);
  box(cream,7,.72,.12,0,2.74,-3);
  box(cream,.7,1.63,.12,-3.15,1.565,-3);
  box(cream,3.7,1.63,.12,1.65,1.565,-3);
  const sky=new THREE.MeshBasicMaterial({color:0xadbdb8});
  box(sky,2.6,1.62,.04,-1.5,1.56,-3.8);
  for(const x of [-2.84,-1.5,-.16])box(trim,.065,1.7,.16,x,1.56,-3);
  for(const y of [.73,2.39])box(trim,2.76,.07,.2,-1.5,y,-3);
  box(wood,2.9,.065,.34,-1.5,.71,-2.92);
  // Low repeated cubbies along the left wall, with quiet colored books/toys.
  for(const z of [-1.9,-.45,.99]) {
    box(wood,.46,.64,1.22,-3.17,.34,z);
    for(const y of [.17,.47])for(const dz of [-.39,0,.39]) {
      box(cream,.02,.23,.33,-2.93,y,z+dz);
      box(colors[(Math.round((z+2)*10)+Math.round((dz+.4)*10))%4],.15,.13,.16,-2.83,y-.025,z+dz);
    }
  }
  // Rug uses subdued repeated circles without image-generation or textures.
  box(rug,2.6,.025,2.5,-.5,.016,1);
  for(let row=0;row<3;row++)for(let col=0;col<3;col++) {
    const disc=add(new THREE.CircleGeometry(.30,20),colors[(row+col)%4],-1.3+col*.8,.031,.2+row*.8);disc.rotation.x=-Math.PI/2;
  }
  let tableIndex=0,seatIndex=0;
  for(const x of [1.35,2.65])for(const z of [-1.65,.05]) {
    const table=box(wood,1,.075,.73,x,.55,z);table.name='Child activity table '+(++tableIndex);
    for(const dx of [-.40,.40])for(const dz of [-.25,.25])box(wood,.055,.52,.055,x+dx,.26,z+dz);
    for(const dz of [-.64,.64]) {
      const m=colors[dz<0?1:3],seat=box(m,.36,.055,.33,x,.31,z+dz);seat.name='Child chair seat '+(++seatIndex);
      box(m,.36,.29,.045,x,.47,z+dz+(dz<0?-.16:.16));
      for(const dx of [-.13,.13])for(const s of [-.11,.11])box(wood,.035,.29,.035,x+dx,.145,z+dz+s);
    }
  }
  // Back/right doorway is a closed plain panel; no explorable corridor.
  box(wood,.99,2.05,.06,2.52,1.025,2.91);
  for(const x of [1.99,3.05])box(trim,.065,2.13,.11,x,1.065,2.85);
  box(trim,1.13,.065,.11,2.52,2.13,2.85);
  box(wood,.09,.055,.07,2.84,1.0,2.83);
  // Ordinary early-learning props establish a lived-in classroom before any
  // memory disturbance. All marks are geometry; no fonts, images or lore signs.
  const chalk=standard(0xe8dfcb),boardGreen=standard(0x354b44),paper=standard(0xd6cbb0);
  const board=new THREE.Group();board.name='Classroom chalkboard and learning shapes';group.add(board);
  box(wood,2.55,1.2,.055,1.2,1.72,-2.91,board);
  box(boardGreen,2.4,1.05,.02,1.2,1.72,-2.87,board);
  box(wood,2.58,.045,.16,1.2,1.1,-2.8,board);
  const stroke=(x1,y1,x2,y2)=>{const dx=x2-x1,dy=y2-y1,m=box(chalk,.018,Math.hypot(dx,dy),.012,(x1+x2)/2,(y1+y2)/2,-2.849,board);m.rotation.z=-Math.atan2(dx,dy);return m;};
  const letter=(name,x,segments)=>{const marks=new THREE.Group();marks.name='Chalk letter '+name;board.add(marks);for(const [a,b,c,d]of segments){const m=stroke(x+a,1.82+b,x+c,1.82+d);marks.attach(m);}};
  letter('A',.35,[[-.12,0,0,.31],[0,.31,.12,0],[-.07,.12,.07,.12]]);
  letter('B',.94,[[-.10,0,-.10,.31],[-.10,.31,.06,.31],[.06,.31,.12,.23],[.12,.23,-.10,.16],[-.10,.16,.08,.16],[.08,.16,.12,.07],[.12,.07,.06,0],[.06,0,-.10,0]]);
  letter('C',1.53,[[.12,.29,-.05,.31],[-.05,.31,-.12,.23],[-.12,.23,-.12,.07],[-.12,.07,-.05,0],[-.05,0,.12,.02]]);
  const lessonShapes=new THREE.Group();lessonShapes.name='Chalk circle triangle and square';board.add(lessonShapes);
  const circle=add(new THREE.RingGeometry(.10,.119,16),chalk,.35,1.43,-2.849,lessonShapes);circle.name='Chalk circle';
  for(const [a,b,c,d]of [[.82,1.32,.94,1.56],[.94,1.56,1.06,1.32],[1.06,1.32,.82,1.32],[1.42,1.32,1.64,1.32],[1.64,1.32,1.64,1.54],[1.64,1.54,1.42,1.54],[1.42,1.54,1.42,1.32]])lessonShapes.attach(stroke(a,b,c,d));
  const counting=new THREE.Group();counting.name='Five counting marks';board.add(counting);
  for(let i=0;i<5;i++)add(new THREE.CircleGeometry(.032,10),chalk,1.94+(i%2)*.12,1.87-Math.floor(i/2)*.14,-2.849,counting);
  // Reuse the child-height tables for paper and short crayons, leaving every
  // chair/rug spot clear and the original low look-only camera unchanged.
  let workIndex=0;
  for(const x of [1.35,2.65])for(const z of [-1.65,.05]){
    const work=new THREE.Group();work.name='Table learning papers and crayons '+(++workIndex);group.add(work);
    for(const side of [-1,1]){box(paper,.25,.005,.19,x+side*.22,.591,z,work);for(let i=0;i<3;i++){const crayon=box(colors[i],.025,.013,.12,x+side*.22-.06+i*.055,.601,z+.015,work);crayon.rotation.y=.2*side;}box(colors[(workIndex+1)%4],.12,.007,.08,x+side*.22,.601,z-.035,work);}
  }
  const personal=new THREE.Group();personal.name='Child coat hooks and school satchels';group.add(personal);
  for(let i=0;i<4;i++){const x=-2.25+i*.6;box(wood,.1,.06,.09,x,1.08,2.86,personal);const bag=box(colors[i],.27,.31,.12,x,.8,2.81,personal);bag.name='School satchel '+(i+1);box(trim,.17,.05,.018,x,.85,2.742,personal);}

  // Style owned surfaces only: borrowed corn assets retain their material hooks
  // and lifetime. Warm practical lighting stays intact, not a blackout flashback.
  applyPS2Materials(group,{profile:'environment'});
  const echo=new THREE.Group();echo.name='Brief borrowed corn-window association';echo.visible=false;group.add(echo);
  for(let i=0;i<10&&cornParts.length;i++) {
    const part=cornParts[i%cornParts.length];if(!part?.geometry||!part?.material)continue;
    const stalk=new THREE.Mesh(part.geometry,part.material);stalk.position.set(-2.65+(i%5)*.55,0,-3.35-Math.floor(i/5)*.15);stalk.scale.setScalar(.82);stalk.rotation.y=i*1.91;echo.add(stalk);
  }
  const hemi=new THREE.HemisphereLight(0xfff0d1,0x777366,2);group.add(hemi);
  const sun=new THREE.PointLight(0xffedca,16,12,2);sun.position.set(-1.5,2.6,-2.6);group.add(sun);
  return {group,eye:new THREE.Vector3(-.35,.68,1.4),target:new THREE.Vector3(-1.5,1.25,-2.9),windowTarget:new THREE.Vector3(-1.5,1.56,-3),setEcho:visible=>{echo.visible=Boolean(visible);},dispose};
}

/** Pure timed progression: cannot soft-lock if the player never looks at window. */
export function classroomBeat(elapsed=0) {
  const time=Math.max(0,Number(elapsed)||0);
  return {phase:time<7?'establish':time<14?'stillness':time<19?'window-echo':time<26?'teacher':'complete',echo:time>=14&&time<19,caption:time>=19&&time<25?'Sadie? Circle time is over.':'',done:time>=26};
}
