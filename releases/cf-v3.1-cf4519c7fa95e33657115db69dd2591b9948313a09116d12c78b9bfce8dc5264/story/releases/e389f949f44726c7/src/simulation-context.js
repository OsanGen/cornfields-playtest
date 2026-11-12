/**
 * A scoped game view binds one enemy and world without swapping global state.
 * All other reads/writes retain the authoritative game's ownership. Weak caches
 * keep repeated updates allocation-free for the same game/enemy/world tuple.
 */
const enemyViews = new WeakMap();
export function forEnemy(game, enemy, world = game.maze) {
  if (!game || !enemy || !world) throw new TypeError('Game, enemy and world are required');
  let enemies = enemyViews.get(game);
  if (!enemies) enemyViews.set(game, enemies = new WeakMap());
  let worlds = enemies.get(enemy);
  if (!worlds) enemies.set(enemy, worlds = new WeakMap());
  if (!worlds.has(world)) worlds.set(world, new Proxy(game, {
    get(target, key) {
      if (key === 'enemy') return enemy;
      if (key === 'maze') return world;
      return Reflect.get(target, key, target);
    },
    set(target, key, value) {
      if (key === 'enemy' || key === 'maze') throw new TypeError('Enemy/world bindings are read-only');
      return Reflect.set(target, key, value, target);
    },
  }));
  return worlds.get(world);
}

/**
 * @typedef {object} CollisionContext
 * @property {Array<{x:number,z:number}>} blockedCells
 * @property {Array<object>|undefined} doors
 * @property {number} revision
 * @property {number|undefined} radius
 * @property {boolean} physical
 */
export function collisionContext(source = [], overrides = {}) {
  const blockedCells = Array.isArray(source) ? source : source.blockedCells;
  if (!Array.isArray(blockedCells)) throw new TypeError('Collision context needs blocked cells');
  const context = {
    blockedCells,
    doors: source.doors,
    revision: source.revision ?? 0,
    radius: source.radius,
    physical: source.physical ?? false,
    ...overrides,
    // Compatibility for existing geometry consumers; metadata is now named.
    some(predicate) { return this.blockedCells.some(predicate); },
    [Symbol.iterator]() { return this.blockedCells[Symbol.iterator](); },
  };
  return context;
}
