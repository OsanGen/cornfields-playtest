import {runCleanups} from '../../../../shared/runtime/resource-scope.js';

/** Browser events have one owner, independent of story and simulation state. */
export function createBrowserSession({document, window, canvas, audio, pause, resetClock, showGraphicsError}) {
  const cleanups = [];
  let disposed = false;
  const listen = (target, type, callback) => {
    const guarded = event => { if (!disposed) runCleanups([()=>callback(event)]); };
    target.addEventListener(type, guarded);
    cleanups.push(() => target.removeEventListener(type, guarded));
  };
  const pauseForLifecycle = () => {
    if (disposed) return;
    runCleanups([pause, ()=>audio.pause(), resetClock]);
  };
  listen(window, 'blur', pause);
  listen(window, 'pagehide', pauseForLifecycle);
  listen(window, 'pageshow', event => { if (event.persisted) pauseForLifecycle(); });
  listen(document, 'visibilitychange', () => { if (document.hidden) pause(); });
  listen(canvas, 'webglcontextlost', event => {
    runCleanups([()=>event.preventDefault(), pause, showGraphicsError]);
  });
  if (audio.onInterruption) cleanups.push(audio.onInterruption(pauseForLifecycle));
  return Object.freeze({
    dispose() {
      if (disposed) return;
      disposed = true;
      runCleanups(cleanups.splice(0).reverse());
    },
  });
}
