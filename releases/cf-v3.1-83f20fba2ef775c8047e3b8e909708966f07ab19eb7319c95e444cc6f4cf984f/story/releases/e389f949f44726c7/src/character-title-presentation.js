import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {collectVisualResources,createVisualResourceDisposer} from '../../../../shared/runtime/visual-resources.js';
import {runCleanups} from '../../../../shared/runtime/resource-scope.js';

const WORDMARKS=Object.freeze({
  CLARENCE:'CT_CLARENCE',SADIE:'CT_SADIE','WAYNE PROBST':'CT_WAYNE_PROBST',
  'SEARCH TEAM':'CT_SEARCH_TEAM',ELSEWHERE:'CT_ELSEWHERE','DALE ARKINS':'CT_DALE_ARKINS','PAM ARKINS':'CT_PAM_ARKINS',
});

// Optional artwork consumes the existing title frame. It never joins readiness,
// starts audio, advances a cursor or owns a presentation clock.
export function createCharacterTitlePresentation(renderer,{loadPack=()=>new GLTFLoader().loadAsync(new URL('../assets/titles/character-wordmarks.glb',import.meta.url).href)}={}) {
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,.01,100);
  camera.position.set(0,0,10);
  const ambient=new THREE.AmbientLight(0xd7d3ca,1.5),side=new THREE.DirectionalLight(0xf2ded1,2);
  side.position.set(-3,2,5);scene.add(ambient,side);
  const disposeResource=createVisualResourceDisposer(),resources=new Set(),marks=new Map(),nativeKeys=new Set();
  let disposed=false,current=null,key=null;
  const cssSize=new THREE.Vector2(),bufferSize=new THREE.Vector2(),box=new THREE.Box3(),extent=new THREE.Vector3(),center=new THREE.Vector3();
  const viewport=new THREE.Vector4(),scissor=new THREE.Vector4(),clearColor=new THREE.Color();
  function detach(){if(current){scene.remove(current);current=null;}}
  function retire(){if(key)nativeKeys.add(key);detach();key=null;}
  function release(root){if(!root)return;const owned=collectVisualResources([root]);runCleanups([...owned].map(resource=>()=>disposeResource(resource)));}
  // A failed or late optional pack leaves the already selected native occurrence
  // intact. Catch only loading/validation, never renderer failures.
  Promise.resolve().then(()=>disposed?null:loadPack()).then(pack=>{
    const root=pack?.scene||pack;if(!root)return;
    if(disposed){release(root);return;}
    try{
      root.updateMatrixWorld(true);
      for(const [text,name] of Object.entries(WORDMARKS)){
        const object=root.getObjectByName(name);if(!object)continue;
        box.setFromObject(object);box.getSize(extent);box.getCenter(center);
        if(![...extent.toArray(),...center.toArray()].every(Number.isFinite)||extent.x<=0||extent.y<=0||extent.z<=0)continue;
        marks.set(text,{object,width:extent.x,height:extent.y,depth:extent.z,center:center.clone()});
      }
      collectVisualResources([root],resources);
    }catch(_){marks.clear();release(root);}
  },()=>{});

  function dimensions(){
    renderer.getSize(cssSize);renderer.getDrawingBufferSize(bufferSize);
    const ratio=renderer.getPixelRatio();
    return [cssSize.x,cssSize.y,bufferSize.x,bufferSize.y,ratio].every(n=>Number.isFinite(n)&&n>0);
  }
  function render(mark,textSize,reducedMotion,elapsed){
    const target=renderer.getRenderTarget(),alpha=renderer.getClearAlpha(),autoClear=renderer.autoClear,
      scissorTest=renderer.getScissorTest(),tone=renderer.toneMapping,exposure=renderer.toneMappingExposure;
    renderer.getViewport(viewport);renderer.getScissor(scissor);renderer.getClearColor(clearColor);
    try{
      renderer.setRenderTarget(null);renderer.setViewport(0,0,cssSize.x,cssSize.y);
      renderer.setScissor(0,0,cssSize.x,cssSize.y);renderer.setScissorTest(false);
      renderer.autoClear=true;
      renderer.setClearColor(0x030404,1);
      const scale=textSize/mark.height;
      // Orthographic size stays fixed while enlarged accessible text can have a
      // deeper extrusion. Keep both faces in front of the camera's near plane.
      camera.position.z=Math.max(10,mark.depth*scale/2+10);camera.far=2*camera.position.z+10;
      camera.left=-cssSize.x/2;camera.right=cssSize.x/2;camera.top=cssSize.y/2;camera.bottom=-cssSize.y/2;camera.updateProjectionMatrix();
      current.scale.setScalar(scale);current.position.copy(mark.center).multiplyScalar(-scale);
      side.intensity=reducedMotion?1.5:1.8+.2*Math.sin(Math.min(2,Math.max(0,elapsed||0))*1.4);
      renderer.render(scene,camera);
    }finally{
      runCleanups([()=>renderer.setRenderTarget(target),()=>renderer.setViewport(viewport),()=>renderer.setScissor(scissor),
        ()=>renderer.setScissorTest(scissorTest),()=>renderer.setClearColor(clearColor,alpha),
        ()=>{renderer.autoClear=autoClear;renderer.toneMapping=tone;renderer.toneMappingExposure=exposure;}]);
    }
  }
  return Object.freeze({
    present(frame,{reducedMotion=false,hidden=false,error=null,blockingError=null,textSize}={}){
      const title=frame?.title,nextKey=typeof title?.key==='string'&&title.key?title.key:null;
      if(disposed||!nextKey||title.kind!=='character'||title.acknowledged||frame.state?.status!=='active'||frame.presentation?.ready!==true||hidden||frame.hidden||error||blockingError||frame.error||frame.blockingError){retire();return {mode:'hidden',key:nextKey};}
      if(key!==nextKey){retire();key=nextKey;const mark=marks.get(title.main);if(!mark)nativeKeys.add(key);else if(!nativeKeys.has(key)){current=mark.object;scene.add(current);}}
      if(nativeKeys.has(key))return {mode:'native',key};
      const mark=marks.get(title.main);
      const validSize=dimensions(),desired=Number.isFinite(textSize)&&textSize>0?textSize:Math.min(96,Math.max(36,cssSize.x*.08));
      const margin=Math.max(24,cssSize.x*.06);
      if(!validSize||!mark||current!==mark.object||mark.width/mark.height*desired>cssSize.x-2*margin||desired>cssSize.y*.5){nativeKeys.add(key);detach();return {mode:'native',key};}
      render(mark,desired,reducedMotion, title.elapsed);
      return {mode:'artwork',key};
    },
    hide:retire,
    dispose(){if(disposed)return;disposed=true;retire();marks.clear();runCleanups([...resources].map(resource=>()=>disposeResource(resource)));resources.clear();},
  });
}
