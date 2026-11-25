import {createMaze, moveBody, lineOfSight} from './maze.js';
import {blocksFor, createGame, startGame, updateGame} from './game.js';
import {advanceDoors, gateAt, openDoor, toggleDoor} from './corn-world.js';
import {enterOpenField} from './corridor-run.js';
import {fieldPortalCrossing} from './field-portal.js';
import {distance} from './game-config.js';

export const SCHOOL_CHASE_SECONDS = 60;
const SCREAM_SECONDS = .85;
const RUSH_SECONDS = .55;
const RUN_CARD_SECONDS = 1;
const SADIE_SPEED = 1.8;
const PURSUIT_SPEED = 1.65;
const SPRINT_SPEED = 2.05;
const sourceMaze = createMaze({corridors:true});

const world = sourceMaze.cornWorld;
const tiles = [];
const walls = [];
for (let z = 0; z < world.height; z++) {
  let first = -1;
  for (let x = 0; x <= world.width; x++) {
    const walkable = x < world.width && world.walk[z * world.width + x];
    if (walkable && first === -1) first = x;
    if (walkable) {
      for (const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nx = x + dx, nz = z + dz;
        if (nx >= 0 && nx < world.width && world.walk[nz * world.width + nx]) continue;
        walls.push({x:(x+.5+dx*.5)*world.size,z:(z+.5+dz*.5)*world.size,dx,dz,length:world.size});
      }
    } else if (first !== -1) {
      tiles.push({x:(first+x)*world.size/2,z:(z+.5)*world.size,width:(x-first)*world.size});
      first = -1;
    }
  }
}
const doors = world.doors.filter(door => door.fieldEntrance);
const rooms = [1,4,7].map((slot,index) => ({
  id:index+1, x:doors[slot].x, z:doors[slot].z + world.size*1.87
}));
const entrance = world.doors[sourceMaze.corridorLayout.entrance];
const exit = world.doors[sourceMaze.corridorLayout.exit];
const start = {...sourceMaze.spawn,y:0,yaw:Math.PI,pitch:0};
const chaseStart = {x:rooms[2].x,z:rooms[2].z,y:0,yaw:0,pitch:0};
export const SCHOOL_HALL = Object.freeze({
  tiles, walls, doors, rooms, exit, start, chaseStart, cell:world.size,
  bounds:{x:[0,world.width*world.size],z:[0,world.height*world.size]}
});

function turnToward(from,to) {
  return Math.atan2(from.x-to.x,from.z-to.z);
}

export function createSchoolHallEncounter({token,retry=false,random=Math.random}={}) {
  const game = createGame(sourceMaze,{unarmed:true,playerSpeed:SADIE_SPEED,pursuerSpeed:.62});
  const cornDoors = game.maze.cornDoors;
  game.maze.cornDoors = cornDoors.map(door => door.fieldEntrance ? {...door,permanentOpen:false} : door);
  game.maze.cornWorld.doors = game.maze.cornDoors;
  for (const door of doors) Object.assign(game.cornDoors[door.index],{amount:0,target:0});
  Object.assign(game.cornDoors[entrance.index],{amount:1,target:1});
  game.enemies = [game.enemy];
  game.enemy.active = false;
  game.corridorRun.scripted=true;
  game.uprightChase=true;
  game.player.flashlightOn = false;
  Object.assign(game.player,retry?chaseStart:start);
  startGame(game);

  const checked = new Set(retry ? rooms.map(room => room.id) : []);
  const flipDelay = 4 + Math.max(0,Math.min(1,random())) * 5;
  let phase = 'explore', phaseTime = 0, activeTime = 0, remaining = SCHOOL_CHASE_SECONDS;
  let flipAt = retry ? flipDelay : null, portal = null;
  let exitReady = false, disposed = false, status = 'running', events = [];
  let chaseStarted = 0, sprintUntil = 0, nextSprint = 0, windup = null;
  const emit = (type,position=game.player,detail={}) => events.push({type,x:position.x,z:position.z,...detail});
  function enter(next) { phase = next; phaseTime = 0; }
  function offeredDoor() {
    if (phase !== 'explore' || status !== 'running') return null;
    const door=gateAt(game);
    return door?.fieldEntrance ? door : null;
  }
  function snapshot() {
    const offer = offeredDoor();
    const {player,enemy} = game;
    return {
      status, phase, phaseTime, world:phase === 'explore' ? 'school' : 'corn',
      canMove:status === 'running' && (phase === 'explore' || phase === 'chase'),
      hunting:phase === 'chase', elapsed:activeTime, checkedRooms:[...checked],
      exitUnlocked:exitReady, chaseRemaining:remaining, portal, zone:player.zone,
      player:{...player,y:0}, offer:offer?{id:offer.id,open:game.cornDoors[offer.index].target>.5}:null,
      doors:doors.map(door => {
        const {amount,swing} = game.cornDoors[door.index];
        return {id:door.id,amount,swing:swing||1};
      }),
      zombie:{x:enemy.x,z:enemy.z,yaw:enemy.yaw,state:enemy.state,visible:enemy.visible,pursuitSpeed:game.pursuitSpeed??0},
      events:[...events]
    };
  }

  function prepareCorn(door, crossing) {
    game.maze.cornDoors = cornDoors;
    game.maze.cornWorld.doors = cornDoors;
    for (const entry of doors) Object.assign(game.cornDoors[entry.index],{amount:1,target:1});
    game.movingDoors.clear();
    // Use the original field-side landing and yaw transform at the matched door.
    const original = cornDoors[door.index], p = game.player;
    const x = crossing?.x ?? original.x;
    Object.assign(p,{x,z:original.z+.32,yaw:0,pitch:.03,moving:false});
    if (!enterOpenField(game,original,{x,z:original.z-.23})) throw new Error('Sadie cornfield landing unavailable');
    p.z = 2.25;
    const facing = Math.PI, gap = 4.55;
    Object.assign(p,{yaw:facing,pitch:.04});
    Object.assign(game.enemy,{x:p.x,z:p.z+gap,zone:'field',yaw:0,active:true,visible:true,state:'detection_tell',stateStartedAt:game.elapsed});
    windup = {pursuerZ:p.z+gap, playerZ:p.z};
    portal = original.id;
    enter('scream');emit('world-flip');emit('detection',game.enemy);
    game.events.length=0;
  }

  function explore(dt,controls) {
    const p = game.player;
    if (Number.isFinite(controls.yaw)) p.yaw = controls.yaw;
    if (Number.isFinite(controls.pitch)) p.pitch = controls.pitch;
    blocksFor(game);
    const offer = controls.interact && offeredDoor();
    if (offer) {
      toggleDoor(game,offer);
      emit('door',offer,{open:game.cornDoors[offer.index].target===1});
    }
    advanceDoors(game,dt);
    const before = {x:p.x,z:p.z};
    const f = controls.forward||0, r = controls.strafe||0;
    const amount = dt * (controls.quiet?1.15:SADIE_SPEED) / Math.max(1,Math.hypot(f,r));
    moveBody(game.maze,p,(-Math.sin(p.yaw)*f+Math.cos(p.yaw)*r)*amount,
      (-Math.cos(p.yaw)*f-Math.sin(p.yaw)*r)*amount,blocksFor(game));
    const walked = distance(before,p);
    p.moving = walked>.0001;
    game.steps += walked;
    for (const room of rooms) {
      if (!checked.has(room.id) && Math.abs(p.x-room.x)<.70 && Math.abs(p.z-room.z)<.78) {
        checked.add(room.id);
        emit('room-checked',room,{room:room.id});
        if (checked.size===rooms.length) flipAt=activeTime+flipDelay;
      }
    }
    const armReady = flipAt !== null && activeTime + 1e-8 >= flipAt;
    for (const door of doors) {
      if (game.cornDoors[door.index].amount < .96) continue;
      const crossing = fieldPortalCrossing({...door,z:door.z-world.size*.67},before,p,p.radius);
      if (!crossing) continue;
      if (armReady) { prepareCorn(door,crossing);return; }
      const next = doors[(door.slot+4)%doors.length];
      Object.assign(p,{x:next.x-(crossing.x-door.x),z:next.z+world.size*1.62,yaw:p.yaw+Math.PI,pitch:p.pitch});
      portal = next.id;
      emit('portal',next,{source:door.id,destination:next.id});
      return;
    }
    if (armReady && activeTime>=flipAt+2) {
      const door = doors.reduce((nearest,entry)=>distance(p,entry)<distance(p,nearest)?entry:nearest);
      prepareCorn(door);
    }
  }

  function prepareChase() {
    const p = game.player, e = game.enemy;
    // The black card covers resetting the chase gap and turning Sadie toward cover.
    Object.assign(p,{yaw:-Math.PI/2,pitch:0,hidden:false,stillSince:game.elapsed});
    Object.assign(e,{z:windup.playerZ+4.2,state:'chase',stateStartedAt:game.elapsed,timer:12,
      target:{x:p.x,z:p.z},reason:'school_chase'});
    Object.assign(e.memory,{lastKnown:{x:p.x,z:p.z},lastSeen:{x:p.x,z:p.z},lastSeenAt:game.elapsed});
    game.grace = .7;
    game.entered = true;
    chaseStarted = game.elapsed;
    nextSprint = game.elapsed+1.2;
    enter('chase'); emit('chase-start');
  }

  function playChase(dt,controls) {
    const {player,enemy} = game;
    const before = {x:player.x,z:player.z,zone:player.zone};
    if (game.elapsed>=nextSprint) {
      nextSprint = game.elapsed+3.1;
      if (player.zone===enemy.zone && lineOfSight(game.maze,player,enemy,blocksFor(game))) sprintUntil=game.elapsed+.66;
    }
    game.pursuitSpeed = game.elapsed<sprintUntil?SPRINT_SPEED:PURSUIT_SPEED;
    game.playerSpeed = controls.quiet?1.15:SADIE_SPEED;
    updateGame(game,dt,{forward:controls.forward,strafe:controls.strafe,yaw:controls.yaw,pitch:controls.pitch});
    const simulationEvents = game.events.splice(0);
    remaining = Math.max(0,SCHOOL_CHASE_SECONDS-(game.elapsed-chaseStarted));
    if (remaining<1e-7) remaining=0;
    if (game.mode==='dead') {status='captured';emit('captured',enemy);return;}
    if (!exitReady && remaining===0) {
      exitReady=true;
      game.cornDoors[exit.index].locked=false;
      emit('exit-unlocked',exit);
    }
    if (exitReady && player.zone==='corridor') {
      openDoor(game,exit,'player');
      if (before.zone==='corridor' && before.z<=exit.z+.30 && player.z>exit.z+.30 &&
        Math.abs(player.x-exit.x)<exit.width/2-player.radius && game.cornDoors[exit.index].amount>.94) {
        status='survived';enemy.active=false;enemy.visible=false;emit('escaped',exit);
      }
    }
    if (simulationEvents.some(event=>event.type==='hide'||event.type==='leave')) {
      portal=game.fieldTrip.doorId;
    }
  }

  function update(dt,controls={}) {
    events=[];
    if (disposed || status!=='running' || !Number.isFinite(dt) || dt<0) return snapshot();
    const beforeSteps = game.steps;
    activeTime += dt;
    phaseTime += dt;
    if (phase==='explore') explore(dt,controls);
    else if (phase==='chase') playChase(dt,controls);
    else {
      game.elapsed+=dt;
      if (phase==='scream' && phaseTime+1e-8>=SCREAM_SECONDS) {
        Object.assign(game.enemy,{state:'chase',stateStartedAt:game.elapsed});
        enter('rush');emit('rush',game.enemy);
      } else if (phase==='rush') {
        const progress=Math.min(1,phaseTime/RUSH_SECONDS), e=game.enemy;
        const previous=e.z;
        e.z=windup.pursuerZ+(windup.playerZ+1.08-windup.pursuerZ)*progress;
        e.step+=Math.abs(e.z-previous);
        e.yaw=turnToward(e,game.player);
        if (phaseTime+1e-8>=RUSH_SECONDS) enter('run-card');
      } else if (phase==='run-card' && phaseTime+1e-8>=RUN_CARD_SECONDS) prepareChase();
    }
    if (Math.floor(game.steps/.78)>Math.floor(beforeSteps/.78)) emit('footsteps');
    return snapshot();
  }

  return {game,token,update,snapshot,dispose(){disposed=true;}};
}
