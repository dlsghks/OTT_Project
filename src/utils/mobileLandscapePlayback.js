// Shorts never opt in to this controller. Desktop playback is left untouched.
export const isMobilePlayback = () => window.matchMedia('(pointer: coarse)').matches
  && window.matchMedia('(max-width: 1024px), (max-height: 600px)').matches;

// Rotate the playback surface directly, without changing the device orientation
// or requesting native fullscreen (which can undo or double the CSS rotation).
export const createMobileLandscapePlayback = (element, onExit = () => {}) => {
  if (!element || !isMobilePlayback()) return { enter() {}, exit() {}, dispose() {} };
  let active = false;
  let disposed = false;
  let previousOverflow;
  const exit = () => {
    if (!active) return;
    active = false;
    element.classList.remove('mobile-landscape-player');
    document.body.style.overflow = previousOverflow;
    onExit();
  };
  const enter = () => {
    if (disposed || active || !isMobilePlayback()) return;
    active = true;
    previousOverflow = document.body.style.overflow;
    element.classList.add('mobile-landscape-player');
    document.body.style.overflow = 'hidden';
  };
  const onKeyDown = (event) => { if (event.key === 'Escape') exit(); };
  document.addEventListener('keydown', onKeyDown);
  return { enter, exit, dispose() {
    disposed = true;
    exit();
    document.removeEventListener('keydown', onKeyDown);
  } };
};
