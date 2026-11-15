import {canOccupy,hasLineOfSight,moveBounded} from './cf-v4-evasion-geometry.js';
import {createEnemy,transition} from './zombie-ai.js';

export const SCHOOL_CHASE_SECONDS=60;
const size=4, half=size/2, originZ=-6;
const directions=[[0,-1],[1,0],[0,1],[-1,0]];
const key=(x,z)=>`${x},${z}`;
const center=(x,z)=>({x:x*size,z:originZ+z*size});
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const grid=new Map();
const rooms=new Map([['1,2',1],['4,4',2],['2,6',3]]);
const hallway=[];
function link(points,section){
  for(let n=0;n<points.length;n++){
    const [gx,gz]=points[n],id=key(gx,gz);
    const tile=grid.get(id)||{id,gx,gz,...center(gx,gz),links:[],section,room:rooms.get(id)||0};
    if(!grid.has(id)){grid.set(id,tile);hallway.push(tile);}
    if(n){
      const previous=grid.get(key(...points[n-1]));
      if(!previous.links.includes(id)){previous.links.push(id);tile.links.push(previous.id);}
    }
  }
}
const span=(x,z,dx,dz,length)=>Array.from({length},(_,i)=>[x+dx*i,z+dz*i]);
link([[0,-1],[0,0],[0,1],[0,2],[1,2],[2,2],[2,3],[2,4],[3,4],[4,4],[4,5],[4,6],[3,6],[2,6],[2,7]],'rooms');
link([[2,7],...span(2,8,0,1,13),...span(3,20,1,0,7),...span(9,19,0,-1,12),...span(8,8,-1,0,7)],'chase');
link([[9,18],...span(10,18,1,0,7),[16,17],[16,16],[16,15]],'exit');
const escape=grid.get('16,15'), beforeExit=grid.get('16,16');
const exit={x:escape.x,z:escape.z+half,width:1.8};
const exitBranch=grid.get('9,18');
const exitBlock={minX:exit.x-exit.width/2,maxX:exit.x+exit.width/2,minZ:exit.z-.10,maxZ:exit.z+.10};
const start={...center(0,0),y:0,yaw:Math.PI,pitch:0};
const chaseStart={...center(2,7),z:center(2,7).z+.14,y:0,yaw:Math.PI,pitch:0};
const walls=[],portals=[];
const solid=(x,z,dx,dz,a,b,locked,section)=>{
  if(b<=a)return;
  const mid=(a+b)/2,span=(b-a)/2,thickness=.07;
  walls.push({x:x+dz*mid,z:z+dx*mid,dx,dz,length:b-a,locked,section,
    minX:x+dz*mid-(dx?thickness:span),maxX:x+dz*mid+(dx?thickness:span),
    minZ:z+dx*mid-(dz?thickness:span),maxZ:z+dx*mid+(dz?thickness:span)});
};
for(const tile of hallway)for(const [dx,dz] of directions){
  const id=key(tile.gx+dx,tile.gz+dz);
  const other=tile.links.includes(id)?grid.get(id):null;
  const x=tile.x+dx*half,z=tile.z+dz*half;
  if(other){
    if(tile.id>other.id)continue;
    const isExit=(tile===escape&&other===beforeExit)||(tile===beforeExit&&other===escape);
    const width=isExit?exit.width:tile.room||other.room?1.5:3.8;
    if(width<2){
      portals.push({x,z,dx,dz,width,exit:isExit});
      solid(x,z,dx,dz,-half,-width/2,false,tile.section);
      solid(x,z,dx,dz,width/2,half,false,tile.section);
    }
  }else solid(x,z,dx,dz,-half,half,tile.section!=='rooms'&&tile!==escape,tile.section);
}
const layout={bounds:{x:[-half,escape.x+half],z:[center(0,-1).z-half,center(2,20).z+half]},colliders:walls};
const lockedLayout={...layout,colliders:[...walls,exitBlock]};
export const SCHOOL_HALL=Object.freeze({hallway,walls,portals,exit,exitBranch,start,chaseStart,bounds:layout.bounds});
const tileAt=p=>grid.get(key(Math.round(p.x/size),Math.round((p.z-originZ)/size)));
export const schoolHallColliders=(unlocked=false)=>(unlocked?layout:lockedLayout).colliders;

function nextToward(from,to){
  if(!from||!to||from===to)return null;
  const pending=[from],first=new Map([[from.id,null]]);
  for(const tile of pending)for(const id of tile.links){
    if(first.has(id))continue;
    const next=grid.get(id);
    first.set(id,tile===from?next:first.get(tile.id));
    if(next===to)return first.get(id);
    pending.push(next);
  }
  return null;
}

export function createSchoolHallEncounter({token,retry=false}={}){
  let elapsed=0,chase=0,disposed=false,status='running',unlocked=false,hunting=retry,announced=false;
  let player={...(retry?chaseStart:start)};
  const zombie={...createEnemy(),...center(2,6),yaw:0,stateStartedAt:0};
  const ai={runId:token.runId,enemy:zombie,elapsed:0,events:[],eventId:0};
  const patrol=['2,12','2,20','9,20','9,18','9,8'].map(id=>grid.get(id));
  let events=[],lastKnown=null,alertUntil=0,lastTile=grid.get('2,6'),route=[],routeKey='',patrolIndex=0;
  const checked=new Set(retry?[1,2,3]:[]);
  const collision=()=>unlocked?layout:lockedLayout;
  const emit=(type,at=player)=>events.push({type,x:at.x,z:at.z,elapsed});
  const snapshot=()=>({status,elapsed,hunting,checkedRooms:[...checked],exitUnlocked:unlocked,chaseRemaining:Math.max(0,SCHOOL_CHASE_SECONDS-chase),
    player:{...player},zombie:{x:zombie.x,z:zombie.z,yaw:zombie.yaw,state:zombie.state,stateStartedAt:zombie.stateStartedAt,visible:hunting&&status==='running'},events:[...events]});
  function pursue(dt,footstep,quiet){
    const gap=distance(player,zombie);
    const sight=gap<16&&hasLineOfSight(player,zombie,collision().colliders);
    if(sight||(footstep&&gap<(quiet?2.8:7.5))){
      lastKnown={...player};alertUntil=elapsed+9;
    }
    const lastTileSeen=lastKnown&&tileAt(lastKnown);
    if(!sight&&elapsed>=alertUntil&&lastTileSeen&&distance(zombie,lastKnown)<.35)lastKnown=null;
    if(!lastKnown&&distance(zombie,patrol[patrolIndex])<.27)patrolIndex=(patrolIndex+1)%patrol.length;
    const goal=lastKnown&&lastTileSeen||patrol[patrolIndex];
    const current=tileAt(zombie)||lastTile;
    const goalKey=`${current.id}:${goal.id}`;
    if(goalKey!==routeKey){
      routeKey=goalKey;
      const next=nextToward(current,goal);
      route=next?[current,next]:[];
    }
    while(route.length&&distance(zombie,route[0])<.14)route.shift();
    const target=sight?player:route[0]||(current===goal?(lastKnown||goal):null);
    if(target){
      const d=distance(zombie,target),step=Math.min(d,dt*1.22);
      if(d>1e-6){
        zombie.yaw=Math.atan2(zombie.x-target.x,zombie.z-target.z);
        const delta={x:(target.x-zombie.x)*step/d,z:(target.z-zombie.z)*step/d};
        Object.assign(zombie,moveBounded(zombie,delta,collision(),.26));
      }
    }
    lastTile=current;
    if(distance(player,zombie)<.66&&hasLineOfSight(player,zombie,collision().colliders)){
      status='captured';emit('captured',zombie);
    }
  }
  function update(dt,{player:pose,ready=true,controllable=true,pointerReady=true,footstep=false,quiet=false}={}){
    events=[];
    if(disposed||status!=='running'||!ready||!controllable||!pointerReady||!Number.isFinite(dt)||dt<0||!canOccupy(pose,collision()))return snapshot();
    const previous=player;player={...pose};elapsed+=dt;
    ai.elapsed=elapsed;
    const tile=tileAt(player);
    if(tile?.room&&Math.abs(tile.x-player.x)<1.72&&Math.abs(tile.z-player.z)<1.72&&!checked.has(tile.room)){
      checked.add(tile.room);emit('room-checked');
    }
    if(!hunting&&checked.size===3&&player.z>=chaseStart.z-half+.38&&tile?.gz>=7)hunting=true;
    if(hunting){
      if(!announced){
        announced=true;lastKnown={...player};alertUntil=elapsed+9;emit('detection',zombie);
        transition(ai,'detection_tell','three_rooms');
      }
      chase=Math.min(SCHOOL_CHASE_SECONDS,chase+dt);
      if(!unlocked&&chase+1e-8>=SCHOOL_CHASE_SECONDS){unlocked=true;emit('exit-unlocked',exit);}
      if(unlocked&&previous.z>=exit.z-.32&&player.z<exit.z-.32&&Math.abs(player.x-exit.x)<exit.width/2-.25){
        status='survived';emit('escaped',exit);return snapshot();
      }
      if(chase>=1.8){
        if(zombie.state!=='chase')transition(ai,'chase','classroom_pursuit');
        pursue(dt,footstep,quiet);
      }
    }
    if(footstep)emit('footsteps');
    return snapshot();
  }
  return {snapshot,update,move(p,delta){return moveBounded(p,delta,collision());},dispose(){disposed=true;}};
}
