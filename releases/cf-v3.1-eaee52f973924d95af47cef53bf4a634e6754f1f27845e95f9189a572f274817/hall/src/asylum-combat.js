// Adapted from the existing Cornfields combat.js aim capsule and grapple.js drain arithmetic.
// The context-free game configuration is shared unchanged; no corn-maze or enemy-HP system is imported.
import {GAME_CONFIG as C} from '../../story/releases/e389f949f44726c7/src/game-config.js';
export const COMBAT=Object.freeze({health:C.player.maxHealth,startAmmo:C.player.startAmmo,maxAmmo:C.player.maxAmmo,shotCooldown:C.player.shotCooldown,stagger:C.zombie.staggerSecondsByTier[0],attackRange:C.zombie.attackRange,damagePerSecond:C.player.maxHealth/C.grapple.fullHealthSeconds});
export function createCombatState(){return {health:COMBAT.health,maxHealth:COMBAT.health,ammo:COMBAT.startAmmo,shotCooldown:0,damageCooldown:1.5,muzzleFlash:0,flashlightOn:true,shots:0,hits:0,damageTaken:0,dead:false};}
export function shotHits(player,enemy,lineClear){
 const dx=enemy.x-player.x,dz=enemy.z-player.z,range=Math.hypot(dx,dz);
 if(enemy.visible===false||enemy.foldTarget||enemy.area!==player.area||range>C.gun.maxRange)return false;
 const projection=dx*-Math.sin(player.yaw)+dz*-Math.cos(player.yaw),lateral=Math.abs(dx*Math.cos(player.yaw)-dz*Math.sin(player.yaw));
 const height=C.player.eyeHeight+Math.tan(player.pitch||0)*projection;
 const low=enemy.kind!=='rabbit'&&['chase','rage_chase','corn_rush'].includes(enemy.state),curled=enemy.kind!=='rabbit'&&enemy.state==='staggered';
 const targetHeight=curled?.5:low?.8:C.gun.targetHeight,targetHalfHeight=curled?.48:low?.65:C.gun.targetHalfHeight;
 return projection>=0&&lateral<=C.gun.hitRadius&&Math.abs(height-targetHeight)<=targetHalfHeight&&lineClear({...player,y:C.player.eyeHeight},{...enemy,y:targetHeight});
}
export function fireGun(state,player,enemies,{lineClear,onShot=()=>{},elapsed=0}={}){
 if(state.dead||state.shotCooldown>0)return {fired:false,hit:null};
 if(state.ammo<=0){state.shotCooldown=.2;return {fired:false,hit:null,empty:true};}
 state.ammo--;state.shotCooldown=C.player.shotCooldown;state.muzzleFlash=C.gun.muzzleFlashSeconds;state.shots++;
 const target=enemies.filter(e=>shotHits(player,e,lineClear)).sort((a,b)=>Math.hypot(a.x-player.x,a.z-player.z)-Math.hypot(b.x-player.x,b.z-player.z))[0];
 if(target){if(target.state!=='staggered'){target.state='staggered';target.stateStartedAt=elapsed;target.timer=COMBAT.stagger;target.path=[];}state.hits++;}
 onShot(target);return {fired:true,hit:target?.id??null};
}
export function tickCombat(state,dt){if(!Number.isFinite(dt)||dt<=0||state.dead)return;state.shotCooldown=Math.max(0,state.shotCooldown-dt);state.damageCooldown=Math.max(0,state.damageCooldown-dt);state.muzzleFlash=Math.max(0,state.muzzleFlash-dt);}
export function applyContactDamage(state,dt){if(state.dead||state.damageCooldown>0||!Number.isFinite(dt)||dt<=0)return 0;const damage=Math.min(state.health,Math.max(0,dt)*COMBAT.damagePerSecond);state.health=Math.max(0,state.health-damage);if(state.health<=1e-8)state.health=0;state.damageTaken+=damage;state.dead=state.health===0;return damage;}
export function refillAmmo(state){if(state.dead||state.ammo>=COMBAT.maxAmmo)return false;state.ammo=COMBAT.maxAmmo;return true;}
export function retryCombat(state){const fresh=createCombatState();Object.assign(state,fresh);return state;}
