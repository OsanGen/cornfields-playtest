import * as THREE from 'three';
import {runCleanups} from '../../../../shared/runtime/resource-scope.js';

// Original atlas pixels are sampled only inside an opaque fabric swatch. Face
// cutouts use separate alpha PNGs and stay on curved three-dimensional heads.
const imageURL=name=>new URL('../assets/characters/r1/'+name,import.meta.url).href;
const availableLoader=()=>typeof document!=='undefined'&&typeof document.createElementNS==='function'?new THREE.TextureLoader():null;
export function characterSwatch(texture,rect,width=1536,height=1024){
  const [x,y,w,h]=rect;
  if(![x,y,w,h,width,height].every(Number.isFinite)||x<0||y<0||w<1||h<1||x+w>width||y+h>height)throw new Error('Invalid character atlas swatch');
  const view=texture.clone();
  // Half-texel inset prevents adjacent labels/checkerboard entering the crop.
  view.offset.set((x+.5)/width,1-(y+h-.5)/height);view.repeat.set((w-1)/width,(h-1)/height);
  return view;
}
const configure=texture=>{
  texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=texture.minFilter=THREE.NearestFilter;
  texture.generateMipmaps=false;texture.wrapS=texture.wrapT=THREE.ClampToEdgeWrapping;texture.needsUpdate=true;return texture;
};

export function curvedCharacterFace({width,height,center=[0,0,0],radiusX=width/2,radiusY=height/2,depth=.07,profile=null,segments=12}){
  const positions=[],uvs=[],indices=[];
  const radiusAt=y=>{
    if(!profile)return radiusX*Math.sqrt(Math.max(0,1-((y-center[1])/radiusY)**2));
    for(let i=1;i<profile.length;i++)if(y<=profile[i][1]){const [r0,y0]=profile[i-1],[r1,y1]=profile[i],t=Math.max(0,Math.min(1,(y-y0)/(y1-y0)));return r0+(r1-r0)*t;}
    return profile.at(-1)[0];
  };
  for(let row=0;row<=segments;row++)for(let column=0;column<=segments;column++){
    const u=column/segments,v=row/segments,x=(u-.5)*width,y=center[1]+(v-.5)*height,r=radiusAt(y);
    const z=profile?Math.sqrt(Math.max(0,r*r-x*x))*depth:depth*Math.sqrt(Math.max(0,1-(x/radiusX)**2-((y-center[1])/radiusY)**2));
    const nose=.010*Math.exp(-(((u-.5)*15)**2+((v-.35)*15)**2));
    positions.push(center[0]+x,y,center[2]+z+.002+nose);uvs.push(u,v);
    if(row<segments&&column<segments){const a=row*(segments+1)+column,b=a+1,c=a+segments+1,d=c+1;indices.push(a,b,c,b,d,c);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}

export function installCharacterSurfaces({atlas,bindings=[],face=null,loader=availableLoader(),deadlineMs=8000,setTimer=globalThis.setTimeout,clearTimer=globalThis.clearTimeout,onChange=()=>{}}={}){
  let disposed=false;const textures=new Set(),released=new WeakSet(),closedImages=new WeakSet(),pending=new Set();
  const stats={atlas:loader&&atlas?'loading':'disabled',face:loader&&face?'loading':'disabled',disposed:false};
  const release=texture=>{
    if(!texture?.isTexture)return;textures.delete(texture);if(!released.has(texture)){released.add(texture);try{texture.dispose();}catch{}}
    const image=texture.image;if(image&&typeof image==='object'&&!closedImages.has(image)){closedImages.add(image);try{image.close?.();}catch{}}
    // GPU disposal alone retains decoded image data on a reachable actor.
    texture.image=null;
  };
  const own=texture=>{if(texture?.isTexture&&!released.has(texture))textures.add(texture);return texture;};
  function load(kind,name,apply){
    if(!loader||!name)return Promise.resolve('disabled');
    return new Promise(resolve=>{
      let complete=false,returned=null,timer=null;
      const finish=status=>{if(complete)return;complete=true;if(timer!==null)clearTimer(timer);pending.delete(cancel);stats[kind]=status;resolve(status);};
      const cancel=()=>{finish('disposed');release(returned);};pending.add(cancel);
      timer=setTimer(()=>{finish('fallback');release(returned);},deadlineMs);timer?.unref?.();
      const loaded=texture=>{
        own(texture);if(disposed||complete){release(texture);return;}
        try{apply(configure(texture));}catch{finish('fallback');release(texture);return;}
        finish('ready');try{onChange();}catch{}
      };
      const failed=()=>{finish('fallback');release(returned);};
      try{
        if(typeof loader.load==='function'){returned=own(loader.load(imageURL(name),loaded,undefined,failed));if(complete&&stats[kind]!=='ready')release(returned);}
        else Promise.resolve(loader.loadAsync(imageURL(name))).then(loaded,failed);
      }catch{failed();}
    });
  }
  let faceMesh=null,faceMaterial=null,faceGeometry=null,basePositions=null,lastSpeech=0;
  if(face){
    faceGeometry=curvedCharacterFace(face.geometry);basePositions=faceGeometry.attributes.position.array.slice();
    faceMaterial=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.94,alphaTest:.5,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
    faceMaterial.name='PNG facial surface';faceMaterial.userData.ps2Exclude=true;
    faceMesh=new THREE.Mesh(faceGeometry,faceMaterial);faceMesh.name='PNG curved face';faceMesh.visible=false;face.parent.add(faceMesh);
  }
  const atlasReady=load('atlas',atlas,texture=>{
    for(const binding of bindings){const view=own(configure(characterSwatch(texture,binding.rect)));binding.material.map=view;binding.material.color.setHex(0xffffff);binding.material.needsUpdate=true;}
  });
  const faceReady=load('face',face?.file,texture=>{
    texture.offset.set(.14,.05);texture.repeat.set(.72,.91);faceMaterial.map=texture;faceMaterial.needsUpdate=true;faceMesh.visible=true;
    for(const fallback of face.fallback||[])fallback.visible=false;
  });
  return Object.freeze({stats,ready:Promise.all([atlasReady,faceReady]),snapshot:()=>({...stats}),
    setSpeech(value=0){
      if(disposed||!faceMesh?.visible)return;const amount=Math.max(0,Math.min(1,Number(value)||0));if(Math.abs(amount-lastSpeech)<.005)return;lastSpeech=amount;
      const positions=faceGeometry.attributes.position,uv=faceGeometry.attributes.uv;
      for(let i=0;i<positions.count;i++)positions.setY(i,basePositions[i*3+1]-Math.max(0,(.38-uv.getY(i))/.38)*amount*.006);
      positions.needsUpdate=true;
    },
    dispose(){
      if(disposed)return;disposed=true;stats.disposed=true;for(const cancel of [...pending])cancel();
      for(const binding of bindings)if(textures.has(binding.material.map)){binding.material.map=null;binding.material.needsUpdate=true;}
      if(faceMaterial)faceMaterial.map=null;for(const texture of [...textures])release(texture);
      return runCleanups([()=>faceMesh?.removeFromParent(),()=>faceGeometry?.dispose(),()=>faceMaterial?.dispose()]);
    },
  });
}
