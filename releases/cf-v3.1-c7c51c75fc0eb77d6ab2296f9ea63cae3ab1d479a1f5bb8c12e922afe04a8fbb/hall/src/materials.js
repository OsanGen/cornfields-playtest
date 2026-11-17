import * as THREE from 'three';

// Original integer-seeded patterns, generated exclusively in memory.
export function pattern(kind, size = 128, seed = 1812) {
  if (!['tile', 'plaster', 'floor', 'metal'].includes(kind) || !Number.isInteger(size) || size < 8 || size > 256 || !Number.isFinite(seed)) throw new Error('Invalid material pattern');
  let state = seed >>> 0;
  const random = () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296);
  const base = { tile: [109, 128, 119], plaster: [177, 175, 157], floor: [96, 100, 94], metal: [46, 55, 53] }[kind];
  const bytes = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const n = random(); let delta = (n - 0.5) * 13;
    if (kind === 'tile' && (x % 32 < 2 || y % 16 < 2)) delta -= 30;
    if (kind === 'plaster') delta -= 17 * Math.max(0, Math.sin(x * 0.19 + seed) * Math.cos(y * 0.03));
    if (kind === 'floor') delta += n > 0.96 ? 37 : n < 0.04 ? -23 : 0;
    if (kind === 'metal') delta += Math.sin(x * 0.4) * 6;
    const i = (y * size + x) * 4;
    for (let c = 0; c < 3; c++) bytes[i + c] = Math.max(0, Math.min(255, base[c] + delta));
    bytes[i + 3] = 255;
  }
  return bytes;
}
export function createMaterials() {
  const textures = [], materials = {};
  for (const kind of ['tile', 'plaster', 'floor', 'metal']) {
    const map = new THREE.DataTexture(pattern(kind), 128, 128, THREE.RGBAFormat);
    map.wrapS = map.wrapT = THREE.RepeatWrapping; map.colorSpace = THREE.SRGBColorSpace; map.needsUpdate = true;
    textures.push(map);
    materials[kind] = new THREE.MeshStandardMaterial({ map, roughness: kind === 'tile' ? 0.53 : kind === 'metal' ? 0.8 : 0.93, metalness: kind === 'metal' ? 0.27 : 0 });
  }
  materials.skylight = new THREE.MeshStandardMaterial({ color: 0xa4bdb6, emissive: 0x94aca5, emissiveIntensity: 0.48, roughness: 1 });
  materials.sign = new THREE.MeshBasicMaterial({ color: 0xd7dfd0 });
  materials.locked = new THREE.MeshStandardMaterial({ color: 0x927668, roughness: 0.8 });
  materials.open = new THREE.MeshStandardMaterial({ color: 0x739d83, roughness: 0.8 });
  return { ...materials, dispose() { textures.forEach(t => t.dispose()); Object.values(materials).forEach(m => m.dispose()); } };
}
export function stripAngle(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return 0;
  return Math.sin((seconds % 12) * Math.PI / 6) * 0.065;
}
export function createStripMotion(mesh) {
  let elapsed = 0, frozen = false;
  return {
    setComfort(value) { frozen = Boolean(value); },
    update(dt) { if (!frozen && Number.isFinite(dt) && dt > 0) elapsed = (elapsed + dt % 12) % 12; mesh.rotation.y = stripAngle(elapsed); return mesh.rotation.y; },
    reset() { elapsed = 0; mesh.rotation.y = 0; },
    get elapsed() { return elapsed; }
  };
}
