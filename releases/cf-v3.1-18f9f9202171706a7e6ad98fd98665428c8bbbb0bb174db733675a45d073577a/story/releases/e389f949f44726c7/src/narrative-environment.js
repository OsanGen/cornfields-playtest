import * as THREE from 'three';
import {createEnvironmentSkyMaterial} from './environment-sky.js';
import {createWeather} from './weather.js';
import {createWeatherView} from './weather-view.js';
import {runCleanups} from '../../../../shared/runtime/resource-scope.js';

const centers={FARM_FRONT:[[3,6.5]],FARM_YARD:[[17.8,9.3],[18.5,5.7]],SEARCH_TRAIL:[[23.2,7.3],[28.4,9.7]],CREATURE_REVEAL:[]};

/** Existing sky shader and pooled maze weather, driven by narrative time/terrain. */
export async function createNarrativeEnvironment({group,camera,setId,palette,environmentAssets,heightAt=()=>0,isCurrent=()=>true}={}){
 const daylight=setId==='CHILDHOOD_POCKET',wet=!daylight&&setId!=='CREATURE_REVEAL';
 const resources=[],cleanups=[];let disposed=false,skyLease=null;
 const dispose=()=>{if(disposed)return;disposed=true;runCleanups(cleanups.concat(resources.map(resource=>()=>resource.dispose()),[()=>skyLease?.release()]));};
 try{
  group.background=new THREE.Color(daylight?0xb8c7ba:0x19232a);group.fog=new THREE.FogExp2(daylight?0xb8c7ba:0x242d2b,daylight?.018:.045);
  const hemi=group.children.find(o=>o.isHemisphereLight);if(hemi){hemi.color.setHex(daylight?0xffedce:0x9daeb2);hemi.groundColor.setHex(daylight?0x778365:0x5b6054);hemi.intensity=daylight?2.4:1.5;}
  const key=new THREE.DirectionalLight(daylight?0xffe8bc:0xa8c0c8,daylight?2.8:1.6);key.name='Shared narrative outdoor key';key.position.set(-5,9,3);group.add(key);cleanups.push(()=>key.removeFromParent());
  const geometry=new THREE.SphereGeometry(70,32,16),material=createEnvironmentSkyMaterial({daylight});resources.push(geometry,material);
  const sky=new THREE.Mesh(geometry,material);sky.name='Shared narrative sky';sky.renderOrder=-1000;sky.frustumCulled=false;group.add(sky);cleanups.push(()=>sky.removeFromParent());
  if(!daylight){skyLease=environmentAssets.acquire('night-sky.jpg',true);material.uniforms.skyMap.value=await skyLease.ready;material.uniforms.hasMap.value=1;}
  if(!isCurrent())throw Error('Narrative environment owner expired');
  const ground=group.getObjectByName('Narrative terrain')||group.getObjectByName('pocket ground');
  if(!ground)throw Error('Narrative environment ground missing');ground.material=palette.material('mud',{repeat:[48,40],wet,color:daylight?0xc4b797:0xaaa08e});
  const puddleLayout=(centers[setId]||[]).map(([x,z],id)=>({id,x,z,rx:.28,rz:.21,angle:.3,cos:Math.cos(.3),sin:Math.sin(.3)}));
  const weather=createWeather(null,{enabled:wet,puddleLayout});
  const effects=createWeatherView(group,weather,{heightAt});effects.setQuality?.({rain:.5});cleanups.push(()=>effects.dispose());
  if(material.uniforms.skyMap.value)effects.setSky?.(material.uniforms.skyMap.value);
  const baseKey=key.intensity;
  return {requirements:['Shared mud surface','Shared sky and outdoor lighting',...(wet?['Shared rain and grounded puddle effects']:[])],
   update({time=0,player,reduced=false,quality}={}){if(disposed||!isCurrent()||!player)return;sky.position.copy(camera.position);material.uniforms.clock.value=reduced?0:time;
    weather.updatePresentation({time,player,reduced,quiet:setId==='CREATURE_REVEAL',muted:true});
    if(quality)effects.setQuality?.(quality);effects.update(camera,null,{active:true});
    key.intensity=baseKey+(reduced?0:weather.state.lightning)*1.8;
   },dispose,diagnostics:()=>({daylight,wet,weather:weather.snapshot(),disposed})};
 }catch(error){dispose();throw error;}
}
