// Modal and fullscreen lifetimes overlap. Restore the original value only after
// the last playback surface releases its lock, regardless of cleanup order.
const locks = new Set();
let previousOverflow;
export const lockPlaybackScroll = () => {
  const token = Symbol('playback-scroll-lock');
  if (!locks.size) previousOverflow = document.body.style.overflow;
  locks.add(token);
  document.body.style.overflow = 'hidden';
  return () => {
    if (!locks.delete(token)) return;
    if (!locks.size) document.body.style.overflow = previousOverflow;
  };
};
