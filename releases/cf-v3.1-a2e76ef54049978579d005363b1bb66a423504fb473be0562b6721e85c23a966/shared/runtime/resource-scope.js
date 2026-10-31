/** Attempt every release even when one owner fails. Never retain error values. */
export function runCleanups(cleanups){
  const errors=[];
  for(const cleanup of cleanups)try{cleanup();}catch(error){errors.push(String(error?.name||'Error'));}
  return errors;
}

/** Own a mount's cleanup in reverse acquisition order. Safe to dispose twice. */
export function createResourceScope({onError = () => {}} = {}) {
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const signal = controller?.signal || {aborted: false};
  const pending = new Set();
  let disposed = false;

  function add(cleanup) {
    if (typeof cleanup !== 'function') throw new TypeError('Cleanup must be a function');
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      pending.delete(release);
      try { cleanup(); } catch (error) { onError(error); }
    };
    if (disposed) release();
    else pending.add(release);
    return release;
  }

  return Object.freeze({
    signal,
    get disposed() { return disposed; },
    add,
    own(resource) {
      if (typeof resource?.dispose !== 'function') throw new TypeError('Resource needs dispose()');
      add(() => resource.dispose());
      return resource;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (controller) controller.abort();
      else signal.aborted = true;
      for (const release of [...pending].reverse()) release();
    },
  });
}
