import * as THREE from 'three';
import {cornClearsParkedCruiser, PARKED_CRUISER_CLEARANCE} from './prologue-clearance.js';

/** VT1 affects the staged roadside only. No scene clock, movement or collision owner. */
export function createVT1RoadsideGround(material) {
  if (material.userData.vt1RoadsideGround) return material.userData.vt1RoadsideGround;
  const uniforms = {vt1CarContact: {value: new THREE.Vector3()}, vt1CarVisible: {value: 1}};
  const previous = material.onBeforeCompile;
  const priorKey = material.customProgramCacheKey.bind(material);
  const inheritedKey = priorKey();
  material.onBeforeCompile = shader => {
    previous?.(shader);
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = 'varying vec2 vVT1Ground;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvVT1Ground=position.xz;');
    shader.fragmentShader = 'varying vec2 vVT1Ground; uniform vec3 vt1CarContact; uniform float vt1CarVisible;\n' + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      vec2 vt1Delta=vVT1Ground-vt1CarContact.xy;
      float vt1C=cos(vt1CarContact.z),vt1S=sin(vt1CarContact.z);
      vec2 vt1CarUV=mat2(vt1C,-vt1S,vt1S,vt1C)*vt1Delta;
      float vt1UnderCar=exp(-dot(vt1CarUV/vec2(1.03,2.00),vt1CarUV/vec2(1.03,2.00))*1.8)*vt1CarVisible;
      vec2 vt1Porch=(vVT1Ground-vec2(6.52,7.0))/vec2(.91,2.34);
      float vt1UnderPorch=exp(-dot(vt1Porch,vt1Porch)*1.8);
      diffuseColor.rgb*=1.0-.26*max(vt1UnderCar,vt1UnderPorch);
    `);
  };
  material.customProgramCacheKey = () => inheritedKey + '|vt1-roadside-contact-v1';
  const state = {
    uniforms,
    update(drive, visible = true) {
      const p = drive?.position || [0, 0, 0];
      uniforms.vt1CarContact.value.set(p[0] || 0, p[2] || 0, Number(drive?.yaw) || 0);
      uniforms.vt1CarVisible.value = visible ? 1 : 0;
    },
  };
  material.userData.vt1RoadsideGround = state;
  material.needsUpdate = true;
  return state;
}

/** Reuses owned sky data; preserves standard materials, cabin anchors and lamp state. */
export function treatVT1Cruiser(model, skyMap = null) {
  model.traverse(object => {
    for (const material of [object.material].flat().filter(Boolean)) {
      if (!material.isMeshStandardMaterial) continue;
      if (/^Paint/.test(material.name)) {
        material.roughness = Math.max(.31, material.roughness);
        material.metalness = .38;
      } else if (/^Interior/.test(material.name)) {
        material.roughness = Math.max(.68, material.roughness);
      }
      if (skyMap && !/^Interior/.test(material.name)) {
        material.envMap = skyMap;
        material.envMapIntensity = /^Paint/.test(material.name) ? .44 : .24;
      }
      material.userData.cornfieldsVT1Cruiser = true;
      material.needsUpdate = true;
    }
  });
}

/** Recessed glazing reflects the already-owned sky; curtains/backing remain separate geometry. */
export function treatVT1Glazing(model, skyMap = null) {
  model.traverse(object => {
    for (const material of [object.material].flat().filter(Boolean)) {
      if (!material.isMeshStandardMaterial || !/Warm recessed house window glass/.test(material.name)) continue;
      material.transparent = true;
      material.opacity = .24;
      material.depthWrite = false;
      material.roughness = .18;
      material.metalness = .05;
      if (skyMap) { material.envMap = skyMap; material.envMapIntensity = .38; }
      material.needsUpdate = true;
    }
  });
}

/** Replaces only existing roadside batches; all accepted transforms remain unchanged. */
export function replaceVT1RoadsideCorn(road, gltf, foliage) {
  gltf.scene.updateMatrixWorld(true);
  road.updateMatrix();
  const variants = [0, 1, 2].map(i => gltf.scene.getObjectByName('vt1_roadside_corn_' + i));
  if (variants.some(mesh => !mesh?.isMesh)) throw new Error('VT1 roadside corn needs three rooted mesh variants');
  const batches = road.children.filter(mesh => mesh.isInstancedMesh && mesh.name === 'Roadside corn with door and leaf clearance');
  const matrix = new THREE.Matrix4();
  const prepared = [];
  try {
    for (const [index, batch] of batches.entries()) {
      const source = variants[index % variants.length];
      const geometry = source.geometry.clone().applyMatrix4(source.matrixWorld);
      prepared.push({batch, source, geometry});
      geometry.computeBoundingBox();
      if (geometry.boundingBox.min.y < -.005 || geometry.boundingBox.max.y > 3.55) throw new Error('VT1 roadside corn height exceeds the retained scene envelope');
    }
  } catch (error) {
    for (const item of prepared) item.geometry.dispose();
    throw error;
  }
  let plants = 0;
  for (const {batch, source, geometry} of prepared) {
    let accepted = 0;
    for (let i = 0; i < batch.count; i++) {
      batch.getMatrixAt(i, matrix);
      if (cornClearsParkedCruiser(geometry, matrix, road.matrix)) batch.setMatrixAt(accepted++, matrix);
    }
    // Prior resources remain shared by the unchanged field batches and are not disposed here.
    batch.geometry = geometry;
    batch.material = foliage.material(source.material);
    batch.material.side = THREE.DoubleSide;
    batch.count = accepted;
    batch.instanceMatrix.needsUpdate = true;
    batch.userData.cornfieldsVT1 = true;
    batch.computeBoundingSphere();
    batch.boundingSphere.radius += PARKED_CRUISER_CLEARANCE.sway;
    plants += accepted;
  }
  return {variants: variants.length, batches: batches.length, plants};
}
