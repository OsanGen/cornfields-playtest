import * as THREE from 'three';
import {createStoryApp} from './asylum-story-app.js';
const canvas=document.getElementById('story-canvas');
try{
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;renderer.outputColorSpace=THREE.SRGBColorSpace;
 const app=createStoryApp({canvas,renderer});
 window.addEventListener('pagehide',()=>app.dispose(),{once:true});
}catch(error){document.getElementById('story-error').hidden=false;document.getElementById('error-message').textContent='Graphics could not start: '+error.message;}
