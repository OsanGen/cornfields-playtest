// The standard trail also carries Randall's handoff and the earlier search.
const trail=(points)=>Object.freeze({polyline:Object.freeze(points.map(point=>Object.freeze(point))),halfWidth:.9});
export const SEARCH_TRAIL_BOUNDS=trail([[19,7],[24,7],[27,10],[30,10]]);
const ALTERNATE_PATROL_BOUNDS=trail([[19,7],[24,7],[25.6,7.2],[26.6,8.55],[27,10],[30,10]]);
export const PATROL_LANDMARK=Object.freeze({x:25.6,z:10.25});
export function patrolTrailBounds(layout){
 return layout==='alternate'?ALTERNATE_PATROL_BOUNDS:SEARCH_TRAIL_BOUNDS;
}

function projectOnSegment(x,z,a,b){
 const dx=b[0]-a[0],dz=b[1]-a[1];
 return Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));
}
export function trailDistance(polyline,x,z){
 let nearest=Infinity;
 for(let i=1;i<polyline.length;i++){
  const a=polyline[i-1],b=polyline[i],t=projectOnSegment(x,z,a,b);
  nearest=Math.min(nearest,Math.hypot(x-a[0]-(b[0]-a[0])*t,z-a[1]-(b[1]-a[1])*t));
 }
 return nearest;
}

export function patrolLead(polyline,player,lead){
 let nearest=Infinity,nearestSegment=1,nearestT=0;
 for(let i=1;i<polyline.length;i++){
  const a=polyline[i-1],b=polyline[i],t=projectOnSegment(player.x,player.z,a,b);
  const distance=Math.hypot(player.x-a[0]-(b[0]-a[0])*t,player.z-a[1]-(b[1]-a[1])*t);
  if(distance<nearest){nearest=distance;nearestSegment=i;nearestT=t;}
 }
 for(let i=nearestSegment;i<polyline.length;i++){
  const a=polyline[i-1],b=polyline[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
  const start=i===nearestSegment?nearestT:0,remaining=(1-start)*length;
  if(lead<=remaining||i===polyline.length-1){
   const t=start+Math.min(lead,remaining)/length;
   return {x:a[0]+dx*t,z:a[1]+dz*t,yaw:Math.atan2(-dx,-dz)};
  }
  lead-=remaining;
 }
 return null;
}
