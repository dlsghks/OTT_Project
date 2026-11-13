let latestSession = 0;

// Shorts never opt in to this controller. Desktop playback is left untouched.
export const isMobilePlayback = () => window.matchMedia('(pointer: coarse)').matches
  && window.matchMedia('(max-width: 1024px), (max-height: 600px)').matches;

// Open fullscreen immediately without rotating the page or locking orientation.
export const createMobileLandscapePlayback = (element, onExit = () => {}) => {
  if (!element || !isMobilePlayback()) return { enter() {}, exit() {}, dispose() {} };
  let active = false;
  let disposed = false;
  let pending = false;
  let ownsFullscreen = false;
  let previousOverflow;
  let session = 0;
  const video = element.querySelector('video');
  const fullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement;
  const closeNativeFullscreen = () => {
    try {
      if (fullscreenElement() === element) {
        const result = document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen?.();
        Promise.resolve(result).catch(() => {});
      } else if (video?.webkitDisplayingFullscreen) video.webkitExitFullscreen?.();
    } catch { /* Already closed or unsupported. */ }
  };
  const exit = () => {
    if (!active) return;
    active = false;
    element.classList.remove('mobile-landscape-player');
    document.body.style.overflow = previousOverflow;
    closeNativeFullscreen();
    onExit();
  };
  const enter = async () => {
    if (disposed || !isMobilePlayback()) return;
    if (!active) {
      active = true;
      session = ++latestSession;
      previousOverflow = document.body.style.overflow;
      element.classList.add('mobile-landscape-player');
      document.body.style.overflow = 'hidden';
    }
    if (pending) return;
    pending = true;
    const requestSession = session;
    try {
      if (fullscreenElement() !== element && !video?.webkitDisplayingFullscreen) {
        if (element.requestFullscreen) await element.requestFullscreen();
        else if (element.webkitRequestFullscreen) await element.webkitRequestFullscreen();
        else video?.webkitEnterFullscreen?.();
      }
      if (disposed || !active) {
        if (latestSession === requestSession) closeNativeFullscreen();
        return;
      }
      ownsFullscreen = fullscreenElement() === element || Boolean(video?.webkitDisplayingFullscreen);
    } catch {
      // If the browser requires another tap, keep the player filling the viewport.
      // The fullscreen button retries from a direct user gesture.
    } finally {
      pending = false;
    }
  };
  const onFullscreenChange = () => {
    if (fullscreenElement() === element || video?.webkitDisplayingFullscreen) ownsFullscreen = true;
    else if (ownsFullscreen && active) exit();
  };
  const onKeyDown = (event) => { if (event.key === 'Escape') exit(); };
  document.addEventListener('fullscreenchange', onFullscreenChange);
  document.addEventListener('webkitfullscreenchange', onFullscreenChange);
  document.addEventListener('keydown', onKeyDown);
  video?.addEventListener('webkitendfullscreen', exit);
  return { enter, exit, dispose() {
    disposed = true;
    exit();
    document.removeEventListener('fullscreenchange', onFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    document.removeEventListener('keydown', onKeyDown);
    video?.removeEventListener('webkitendfullscreen', exit);
  } };
};
