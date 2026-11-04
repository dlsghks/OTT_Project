import { useEffect, useRef, useState } from 'react';

export const YoutubeLivePlayer = ({
  videoId,
  playerRef,
  volume,
  muted,
  onPlayingChange,
  onError,
}) => {
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);

  const latestRef = useRef(null);
  latestRef.current = {
    volume,
    muted,
    onPlayingChange,
    onError,
  };

  useEffect(() => {
    let disposed = false;
    let player = null;
    let timer = null;

    setReady(false);

    const host = document.createElement('div');
    containerRef.current.appendChild(host);

    const createPlayer = () => {
      if (disposed) return;

      player = new window.YT.Player(host, {
        videoId,
        width: '100%',
        height: '100%',

        playerVars: {
          autoplay: 1,
          controls: 0,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },

        events: {
          onReady: (event) => {
            if (disposed) return;

            const current = latestRef.current;

            playerRef.current = event.target;
            event.target.setVolume(current.volume);

            if (current.muted) {
              event.target.mute();
            } else {
              event.target.unMute();
            }

            setReady(true);
            event.target.playVideo();
          },

          onStateChange: (event) => {
            if (disposed) return;

            if (event.data === window.YT.PlayerState.PLAYING) {
              latestRef.current.onPlayingChange(true);
            } else if (
              event.data === window.YT.PlayerState.PAUSED ||
              event.data === window.YT.PlayerState.ENDED
            ) {
              latestRef.current.onPlayingChange(false);
            }
          },

          onAutoplayBlocked: () => {
            if (!disposed) {
              latestRef.current.onPlayingChange(false);
            }
          },

          onError: (event) => {
            if (disposed) return;

            latestRef.current.onError(
              `유튜브 재생 오류 (${event.data}). 영상 공개 상태와 외부 재생 허용 여부를 확인해 주세요.`
            );
          },
        },
      });
    };

    if (window.YT?.Player) {
      createPlayer();
    } else {
      if (
        !document.querySelector(
          'script[src="https://www.youtube.com/iframe_api"]'
        )
      ) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        document.head.appendChild(script);
      }

      const startedAt = Date.now();

      timer = window.setInterval(() => {
        if (window.YT?.Player) {
          window.clearInterval(timer);
          createPlayer();
        } else if (Date.now() - startedAt > 15000) {
          window.clearInterval(timer);

          if (!disposed) {
            latestRef.current.onError(
              '유튜브 플레이어를 불러오지 못했습니다. 네트워크와 콘텐츠 차단 설정을 확인해 주세요.'
            );
          }
        }
      }, 100);
    }

    return () => {
      disposed = true;
      window.clearInterval(timer);

      if (playerRef.current === player) {
        playerRef.current = null;
      }

      player?.destroy();
      host.remove();
    };
  }, [videoId, playerRef]);

  useEffect(() => {
    const player = playerRef.current;

    if (!ready || !player) return;

    player.setVolume(volume);

    if (muted) {
      player.mute();
    } else {
      player.unMute();
    }
  }, [ready, volume, muted, playerRef]);

  return (
    <div
      ref={containerRef}
      className="live-player__youtube"
    />
  );
};