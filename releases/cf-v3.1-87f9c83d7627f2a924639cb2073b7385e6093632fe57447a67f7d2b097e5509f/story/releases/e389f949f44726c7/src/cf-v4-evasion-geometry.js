// Pure authored-layout geometry shared by V4 evasion episodes. No runtime owner.
const finite = p => p && Number.isFinite(p.x) && Number.isFinite(p.z);
const dist = (a,b) => Math.hypot(a.x-b.x,a.z-b.z);
export function canOccupy(p,{bounds,colliders=[]},radius=.25){
  if(!finite(p)||!Number.isFinite(radius)||radius<0)return false;
  if(bounds&&(p.x-radius<bounds.x[0]||p.x+radius>bounds.x[1]||p.z-radius<bounds.z[0]||p.z+radius>bounds.z[1]))return false;
  return !colliders.some(c=>p.x>c.minX-radius&&p.x<c.maxX+radius&&p.z>c.minZ-radius&&p.z<c.maxZ+radius);
}
function intersects(a,b,c,pad=0){
  let lo=0,hi=1;
  for(const [axis,min,max] of [['x',c.minX-pad,c.maxX+pad],['z',c.minZ-pad,c.maxZ+pad]]){
    const d=b[axis]-a[axis];
    if(Math.abs(d)<1e-12){if(a[axis]<min||a[axis]>max)return false;continue;}
    let t0=(min-a[axis])/d,t1=(max-a[axis])/d;if(t0>t1)[t0,t1]=[t1,t0];
    lo=Math.max(lo,t0);hi=Math.min(hi,t1);if(lo>hi)return false;
  }return true;
}
export function hasLineOfSight(a,b,colliders=[]){return !!finite(a)&&!!finite(b)&&!colliders.some(c=>intersects(a,b,c));}
const clear=(a,b,layout,r)=>canOccupy(a,layout,r)&&canOccupy(b,layout,r)&&!layout.colliders?.some(c=>intersects(a,b,c,r));
export function moveBounded(point,delta,layout,radius=.25){
  if(!finite(point)||!finite(delta))throw new TypeError('Finite position and delta required');
  const p={x:point.x,z:point.z},n=Math.max(1,Math.ceil(Math.hypot(delta.x,delta.z)/.1));
  if(n>10000)throw new RangeError('Movement delta exceeds bounded simulation');
  for(let i=0;i<n;i++){const x={x:p.x+delta.x/n,z:p.z};if(canOccupy(x,layout,radius))p.x=x.x;const z={x:p.x,z:p.z+delta.z/n};if(canOccupy(z,layout,radius))p.z=z.z;}return p;
}
export function findWaypointPath(from,to,layout,radius=.25){
  if(!canOccupy(from,layout,radius)||!canOccupy(to,layout,radius))return [];
  if(clear(from,to,layout,radius))return [{x:to.x,z:to.z}];
  const nodes=[{id:'@from',...from},...(layout.nodes||[]),{id:'@to',...to}],end=nodes.length-1;
  const allowed=layout.edges?new Set(layout.edges.flatMap(([a,b])=>[`${a}|${b}`,`${b}|${a}`])):null;
  const costs=nodes.map(()=>Infinity),prev=nodes.map(()=>-1),seen=new Set();costs[0]=0;
  while(seen.size<nodes.length){let u=-1;for(let i=0;i<nodes.length;i++)if(!seen.has(i)&&(u<0||costs[i]<costs[u]))u=i;
    if(u<0||!Number.isFinite(costs[u]))break;if(u===end)break;seen.add(u);
    for(let v=0;v<nodes.length;v++){if(v===u||seen.has(v))continue;
      if(allowed&&u!==0&&v!==end&&u!==end&&v!==0&&!allowed.has(`${nodes[u].id}|${nodes[v].id}`))continue;
      if(!clear(nodes[u],nodes[v],layout,radius))continue;const cost=costs[u]+dist(nodes[u],nodes[v]);if(cost<costs[v]){costs[v]=cost;prev[v]=u;}
    }
  }
  if(!Number.isFinite(costs[end]))return [];const path=[];for(let at=end;at>0;at=prev[at]){if(at<0)return [];path.unshift({x:nodes[at].x,z:nodes[at].z});}return path;
}
export function stepPath(position,path,distance,layout,radius=.25){
  let p={x:position.x,z:position.z},remaining=path.map(q=>({...q})),budget=Math.max(0,Number.isFinite(distance)?distance:0);
  while(remaining.length&&budget>0){const target=remaining[0],d=dist(p,target);if(d<1e-7){remaining.shift();continue;}
    const travel=Math.min(budget,d),next=moveBounded(p,{x:(target.x-p.x)*travel/d,z:(target.z-p.z)*travel/d},layout,radius);
    const moved=dist(p,next);p=next;budget-=travel;if(dist(p,target)<1e-6)remaining.shift();if(moved<travel-1e-5)break;
  }return {position:p,path:remaining,arrived:remaining.length===0};
}
