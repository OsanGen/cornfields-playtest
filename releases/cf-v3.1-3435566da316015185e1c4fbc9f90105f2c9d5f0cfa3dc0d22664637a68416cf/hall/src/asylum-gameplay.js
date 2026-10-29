import {createCombatState,tickCombat,fireGun,applyContactDamage,refillAmmo,retryCombat,COMBAT} from './asylum-combat.js';
import {createEnemyState,updateEnemy} from './asylum-enemy-ai.js';
import {createNavigation} from './asylum-navigation.js';
export function createGameplay(runtime,config){
 if(config?.schema!==1||config.version!=='lean-1'||config.enemies?.length!==1||config.enemies[0]?.kind!=='rabbit'||config.enemies[0]?.id!=='rabbit'||config.floorOnly!==true||config.enemyHP!==false)throw new Error('Invalid asylum gameplay configuration');
 const {world,player,progress}=runtime,navigation=createNavigation(world,progress),combat=createCombatState(),enemies=config.enemies.map(createEnemyState);
 let elapsed=0,ammoReadyAt=0,runId=0,disposed=false,noise=null,visuals=null;
 const playerState=()=>({...player.state,area:world.areaAt(player.state.x,player.state.z)});
 const api={combat,enemies,navigation,config,get elapsed(){return elapsed;},get runId(){return runId;},get disposed(){return disposed;},get ammoCooldown(){return Math.max(0,ammoReadyAt-elapsed);},
  nearAmmo(){return runtime.area==='hall'&&player.near(config.ammoPoint);},
  refill(){if(disposed||combat.dead||!runtime.input.active||runtime.transition.active||!this.nearAmmo()||this.ammoCooldown>0)return false;if(!refillAmmo(combat))return false;ammoReadyAt=elapsed+config.ammoPoint.cooldownActiveSeconds;return true;},
  fire(){if(disposed||!runtime.input.active||runtime.transition.active)return {fired:false,hit:null};return fireGun(combat,playerState(),enemies,{lineClear:world.lineClear,elapsed,onShot:()=>{noise={...player.state};visuals?.shot();}});},
  toggleFlashlight(){if(disposed||combat.dead||!runtime.input.active||runtime.transition.active)return false;combat.flashlightOn=!combat.flashlightOn;return true;},
  step(dt){if(disposed||combat.dead||!runtime.input.active||runtime.transition.active||!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.1);elapsed+=dt;tickCombat(combat,dt);const p=playerState();let touching=false;
   for(const e of enemies){updateEnemy(e,dt,{time:elapsed,player:p,world,navigation,flashlight:combat.flashlightOn,noise});const contact=!e.foldTarget&&e.area===p.area&&['chase','rage_chase'].includes(e.state)&&Math.hypot(e.x-p.x,e.z-p.z)<=COMBAT.attackRange&&world.lineClear({...e,y:1.25},{...p,y:1.62});e.contact=contact?e.contact+dt:0;if(e.contact>.22)touching=true;}
   noise=null;if(touching)applyContactDamage(combat,dt);visuals?.update(dt);if(combat.dead)runtime.pause();
  },
  retry(){if(disposed)return false;retryCombat(combat);for(let i=0;i<enemies.length;i++)Object.assign(enemies[i],createEnemyState(config.enemies[i]));noise=null;runId++;return runtime.safeReturn();},
  reset(){if(disposed)return;elapsed=ammoReadyAt=0;this.retry();},
  async attachVisuals(renderer){const [{createEnemyViews},{createEquipment},{createGuidance}]=await Promise.all([import('./asylum-enemies.js'),import('./asylum-equipment.js'),import('./asylum-guidance.js')]);if(disposed)throw new Error('Gameplay disposed');const views=createEnemyViews(world.scene,enemies),equipment=createEquipment(world.scene,player.camera,renderer),guidance=createGuidance(world,progress,config,player);visuals={shot:()=>equipment.shot(),update(dt){views.update(elapsed,dt);equipment.update(api,runtime.comfort);guidance.update();},render:()=>equipment.render(),dispose(){views.dispose();equipment.dispose();guidance.dispose();}};try{await Promise.all([views.ready,equipment.ready]);if(disposed)throw new Error('Gameplay disposed');visuals.update(0);}catch(error){visuals?.dispose();visuals=null;throw error;}},
  render(renderer){if(visuals)visuals.render();else renderer.render(world.scene,player.camera);},
  dispose(){if(disposed)return;disposed=true;noise=null;navigation.dispose();visuals?.dispose();visuals=null;}
 };return api;
}
