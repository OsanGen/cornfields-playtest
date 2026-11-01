/** Structural validity is independent from the preserved approved R4 baseline. */
const vector=(value,length=3)=>Array.isArray(value)&&value.length===length&&value.every(Number.isFinite);
const positive=value=>Number.isFinite(value)&&value>0;
const unique=values=>new Set(values).size===values.length;
const transform=value=>value&&['x','z','yaw'].every(key=>Number.isFinite(value[key]));
function room(value){return value&&typeof value.id==='string'&&vector(value.center)&&vector(value.size)&&value.size.every(positive);}

export function validateLayoutShape(layout){
  if(layout?.schema!==1||layout.units!=='metres'||!vector(layout.hall?.center)||!vector(layout.hall?.size)||!layout.hall.size.every(positive))throw new Error('Invalid hall structure');
  if(!Array.isArray(layout.vestibules)||!layout.vestibules.length||!layout.vestibules.every(room))throw new Error('Invalid vestibule structure');
  const spaces=layout.mansion?.spaces;
  if(!Array.isArray(spaces)||!spaces.length||!unique(spaces.map(s=>s.id))||spaces.some(s=>!room(s)||!Array.isArray(s.polygon)||s.polygon.length<3||!s.polygon.every(p=>vector(p,2))))throw new Error('Invalid mansion space structure');
  const ids=new Set(spaces.map(s=>s.id)),doors=layout.mansion.doors;
  if(!Array.isArray(doors)||!unique(doors.map(d=>d.id))||doors.some(d=>typeof d.id!=='string'||!Array.isArray(d.rooms)||d.rooms.length!==2||!d.rooms.every(id=>ids.has(id))||!['x','z'].includes(d.axis)||![d.x,d.z,d.width,d.height].every(Number.isFinite)||!positive(d.width)||!positive(d.height)))throw new Error('Invalid interior door structure');
  if(!Array.isArray(layout.mansion.tokenLocations)||layout.mansion.tokenLocations.some(p=>!ids.has(p.space)||![p.x,p.y,p.z].every(Number.isFinite)))throw new Error('Invalid token structure');
  if(!Array.isArray(layout.doors)||!unique(layout.doors.map(d=>d.id))||layout.doors.some(d=>typeof d.id!=='string'||!vector(d.center)||!Number.isFinite(d.yaw)||!['walk','fold','closed'].includes(d.mode)))throw new Error('Invalid entrance structure');
  if(!vector(layout.doorOpening,2)||!layout.doorOpening.every(positive))throw new Error('Invalid doorway structure');
  if(['spawn','foldHallArrival','foldBayArrival','bayReturn'].some(key=>!transform(layout[key])))throw new Error('Invalid safe transform structure');
  if(!layout.player||['radius','height','eyeHeight','speed','fastSpeed'].some(key=>!positive(layout.player[key]))||layout.player.eyeHeight>layout.player.height)throw new Error('Invalid player structure');
  if(!positive(layout.strip?.cycleSeconds)||!positive(layout.strip?.maxAngleRadians)||!vector(layout.strip?.position)||![layout.latch?.x,layout.latch?.y,layout.latch?.z].every(Number.isFinite))throw new Error('Invalid animation structure');
  return true;
}

export function validateRoutesShape(graph){
  if(graph?.schema!==1||!Array.isArray(graph.areas)||!graph.areas.length||graph.areas.some(id=>typeof id!=='string')||!unique(graph.areas)||!Array.isArray(graph.routes)||!Array.isArray(graph.closed))throw new Error('Invalid route graph structure');
  const areas=new Set(graph.areas);
  if(graph.routes.some(route=>!areas.has(route.from)||!areas.has(route.to)||route.from===route.to||typeof route.door!=='string'||!['walk','deliberate-E-fold'].includes(route.mode)||typeof route.requiresUnlock!=='boolean'||typeof route.reversible!=='boolean')||graph.closed.some(id=>typeof id!=='string')||!unique(graph.closed))throw new Error('Invalid route edge structure');
  return true;
}
