import { useCallback, useEffect, useRef, useState } from 'react';
import { createMobileLandscapePlayback } from '../utils/mobileLandscapePlayback';
import '../styles/components/common/MobileLandscapePlayback.scss';

export const useMobileLandscapePlayback = (ref, enabled, sessionKey, onExit) => {
  const controller = useRef(null);
  const onExitRef = useRef(onExit);
  useEffect(() => { onExitRef.current = onExit; }, [onExit]);
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    const player = createMobileLandscapePlayback(ref.current, () => {
      if (mounted) {
        setActive(false);
        onExitRef.current?.();
      }
    });
    controller.current = player;
    const enter = () => {
      const result = player.enter();
      setActive(ref.current?.classList.contains('mobile-landscape-player') || false);
      return result;
    };
    enter();
    return () => {
      mounted = false;
      player.dispose();
      controller.current = null;
    };
  }, [ref, enabled, sessionKey]);
  const enter = useCallback(() => {
    const result = controller.current?.enter();
    setActive(ref.current?.classList.contains('mobile-landscape-player') || false);
    return result;
  }, [ref]);
  const exit = useCallback(() => { controller.current?.exit(); setActive(false); }, []);
  return { active: enabled && active, enter, exit };
};
