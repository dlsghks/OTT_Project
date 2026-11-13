let sessionGeneration = 0;

// Shorts never opt in to this controller. Desktop playback is left untouched.
export const isMobilePlayback = () => window.matchMedia('(pointer: coarse)').matches
  && window.matchMedia('(max-width: 1024px), (max-height: 600px)').matches;

export const createMobileLandscapePlayback = (element, onExit = () => {}) => {
  if (!element || !isMobilePlayback()) return { enter() {}, exit() {}, dispose() {} };
  let active = false;
  let disposed = false;
  let enteredFullscreen = false;
  let pending = false;
  let previousOverflow;
  let generation = 0;
  const fullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement;
  const orientation = window.screen?.orientation;
  const restoreOrientation = () => {
    const restoreGeneration = generation;
    try {
      // Some browsers permit portrait only while still in fullscreen.
      const result = orientation?.lock?.('portrait-primary');
      Promise.resolve(result).catch(() => {}).finally(() => {
        if (sessionGeneration === restoreGeneration) {
          try { orientation?.unlock?.(); } catch { /* Unsupported device. */ }
        }
      });
    } catch {
      try { orientation?.unlock?.(); } catch { /* Unsupported device. */ }
    }
  };
  const exit = () => {
    if (!active) return;
    active = false;
    element.classList.remove('mobile-landscape-player');
    document.body.style.overflow = previousOverflow;
    restoreOrientation();
    if (fullscreenElement() === element) {
      try {
        const result = document.exitFullscreen?.() ?? document.webkitExitFullscreen?.();
        Promise.resolve(result).catch(() => {});
      } catch { /* The browser may already be leaving fullscreen. */ }
    }
    onExit();
  };
  const enter = async () => {
    if (disposed || !isMobilePlayback()) return;
    if (!active) {
      active = true;
      generation = ++sessionGeneration;
      previousOverflow = document.body.style.overflow;
      element.classList.add('mobile-landscape-player');
      document.body.style.overflow = 'hidden';
    }
    if (pending) return;
    pending = true;
    const enterGeneration = generation;
    try {
      if (fullscreenElement() !== element) {
        if (element.requestFullscreen) await element.requestFullscreen();
        else if (element.webkitRequestFullscreen) await element.webkitRequestFullscreen();
      }
      if (disposed || !active) {
        if (sessionGeneration === enterGeneration && fullscreenElement() === element) await document.exitFullscreen?.();
        return;
      }
      enteredFullscreen = fullscreenElement() === element;
      if (enteredFullscreen) await orientation?.lock?.('landscape');
    } catch {
      // The CSS landscape view also works without fullscreen/orientation APIs.
    } finally {
      pending = false;
      if ((disposed || !active) && sessionGeneration === enterGeneration) {
        try { orientation?.unlock?.(); } catch { /* Unsupported device. */ }
      }
    }
  };
  const onFullscreenChange = () => {
    if (fullscreenElement() === element) enteredFullscreen = true;
    else if (enteredFullscreen && active) exit();
  };
  const onKeyDown = (event) => { if (event.key === 'Escape') exit(); };
  document.addEventListener('fullscreenchange', onFullscreenChange);
  document.addEventListener('webkitfullscreenchange', onFullscreenChange);
  document.addEventListener('keydown', onKeyDown);
  return { enter, exit, dispose() {
    disposed = true;
    exit();
    document.removeEventListener('fullscreenchange', onFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    document.removeEventListener('keydown', onKeyDown);
  } };
};
