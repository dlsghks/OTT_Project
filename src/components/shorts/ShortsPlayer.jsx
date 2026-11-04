import { useEffect, useRef, useState } from "react";
import wavveLogo from "../../assets/shorts/wavve-logo.png";

let apiPromise;

// 여러 쇼츠가 같은 YouTube API 스크립트 하나를 공유합니다.
function loadYouTubeAPI() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    let script = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    const created = !script;
    if (!script) {
      script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
    }
    const previous = window.onYouTubeIframeAPIReady;
    let interval;
    let timeout;
    const cleanup = () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
      script.removeEventListener("error", onError);
      if (window.onYouTubeIframeAPIReady === callback) window.onYouTubeIframeAPIReady = previous;
    };
    const onReady = () => {
      if (!window.YT?.Player) return;
      cleanup();
      resolve(window.YT);
    };
    const onError = () => {
      cleanup();
      if (created) script.remove();
      apiPromise = undefined;
      reject(new Error("YouTube API unavailable"));
    };
    const callback = () => {
      try { previous?.(); } finally { onReady(); }
    };
    window.onYouTubeIframeAPIReady = callback;
    script.addEventListener("error", onError, { once: true });
    interval = window.setInterval(onReady, 100);
    timeout = window.setTimeout(onError, 15000);
    if (created) document.head.appendChild(script);
  });
  return apiPromise;
}

export function getYouTubeVideoId(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    let id = "";
    if (host === "youtu.be") id = url.pathname.split("/")[1] || "";
    else if (["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host)) {
      const parts = url.pathname.split("/").filter(Boolean);
      id = ["shorts", "embed", "live"].includes(parts[0]) ? parts[1] : url.searchParams.get("v");
    }
    return /^[A-Za-z0-9_-]{11}$/.test(id || "") ? id : "";
  } catch { return ""; }
}

const initialMedia = { ready: false, playing: false, time: 0, duration: 0 };
const formatTime = (value) => {
  const seconds = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};
const errorMessages = {
  2: "영상 주소가 올바르지 않습니다.",
  5: "이 브라우저에서 영상을 재생하지 못했습니다.",
  100: "삭제되었거나 비공개로 변경된 영상입니다.",
  101: "이 영상은 외부 사이트 재생이 허용되지 않았습니다.",
  150: "이 영상은 외부 사이트 재생이 허용되지 않았습니다.",
  153: "유튜브가 사이트 정보를 확인하지 못했습니다. localhost 개발 서버 주소에서 다시 확인해주세요.",
};

export const ShortsPlayer = ({ item }) => {
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const optionsRef = useRef(null);
  const mutedRef = useRef(true);
  const [media, setMedia] = useState(initialMedia);
  const [muted, setMuted] = useState(true);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const videoId = getYouTubeVideoId(item.youtubeUrl);
  const originalUrl = videoId ? `https://www.youtube.com/shorts/${videoId}` : "";

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let player;
    let poll;
    let readyTimer;
    let ready = false;
    let visible = false;
    let autoStarted = false;
    let errorSeen = false;
    setMedia(initialMedia);
    setOptionsOpen(false);
    setMessage("");
    setFailed(false);
    host.replaceChildren();
    if (!videoId) {
      setMessage("유튜브 영상 링크를 확인해주세요.");
      setFailed(true);
      return;
    }

    const iframe = document.createElement("iframe");
    const query = new URLSearchParams({ enablejsapi: "1", origin: window.location.origin,
      playsinline: "1", controls: "1", rel: "0", autoplay: "0" });
    iframe.src = `https://www.youtube.com/embed/${videoId}?${query}`;
    iframe.title = "YouTube 쇼츠 플레이어";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allowFullscreen = true;
    host.appendChild(iframe);

    const startIfVisible = () => {
      if (cancelled || !ready || !visible || document.hidden || autoStarted || errorSeen) return;
      autoStarted = true;
      player.playVideo();
    };
    const updateVisibility = () => {
      const rect = host.getBoundingClientRect();
      const width = Math.max(0, Math.min(rect.right, innerWidth) - Math.max(0, rect.left));
      const height = Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(0, rect.top));
      visible = rect.width * rect.height > 0 && width * height / (rect.width * rect.height) > .5;
    };
    updateVisibility();
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
      visible = entry.intersectionRatio > .5;
      if (!visible && ready) player.pauseVideo();
      startIfVisible();
    }, { threshold: [0, .5, .51, 1] });
    observer?.observe(host);

    loadYouTubeAPI().then((YT) => {
      if (cancelled) return;
      player = new YT.Player(iframe, {
        events: {
          onReady: (event) => {
            if (cancelled) return;
            window.clearTimeout(readyTimer);
            player = event.target;
            playerRef.current = player;
            ready = true;
            if (!errorSeen) { setFailed(false); setMessage(""); }
            if (mutedRef.current) player.mute(); else player.unMute();
            setMedia((previous) => ({ ...previous, ready: true }));
            startIfVisible();
            poll = window.setInterval(() => {
              if (cancelled || errorSeen) return;
              const time = player.getCurrentTime();
              const duration = player.getDuration();
              setMedia({ ready: true, playing: player.getPlayerState() === 1,
                time: Number.isFinite(time) ? time : 0,
                duration: Number.isFinite(duration) ? duration : 0 });
              const soundOff = player.isMuted();
              mutedRef.current = soundOff;
              setMuted(soundOff);
            }, 250);
          },
          onStateChange: (event) => {
            if (cancelled || errorSeen) return;
            setMedia((previous) => ({ ...previous, playing: event.data === 1 }));
            if (event.data === 1) setMessage("");
            if (event.data === 0 && visible && !document.hidden) {
              event.target.seekTo(0, true);
              event.target.playVideo();
            }
          },
          onAutoplayBlocked: () => {
            if (!cancelled) setMessage("재생 버튼을 눌러 영상을 시작해주세요.");
          },
          onError: (event) => {
            if (cancelled) return;
            window.clearTimeout(readyTimer);
            errorSeen = true;
            setFailed(true);
            setMedia((previous) => ({ ...previous, playing: false }));
            setMessage(errorMessages[event.data] || "유튜브에서 영상을 재생하지 못했습니다.");
          },
        },
      });
      readyTimer = window.setTimeout(() => {
        if (!cancelled && !ready && !errorSeen) {
          setFailed(true);
          setMessage("유튜브 연결이 지연되고 있습니다. 다시 시도하거나 유튜브에서 열어주세요.");
        }
      }, 12000);
    }).catch(() => {
      if (cancelled) return;
      setFailed(true);
      setMessage("유튜브 플레이어를 연결하지 못했습니다. 네트워크 연결을 확인해주세요.");
    });

    const pauseWhenHidden = () => { if (document.hidden && ready) player.pauseVideo(); };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => {
      cancelled = true;
      ready = false;
      window.clearTimeout(readyTimer);
      window.clearInterval(poll);
      observer?.disconnect();
      document.removeEventListener("visibilitychange", pauseWhenHidden);
      if (playerRef.current === player) playerRef.current = null;
      player?.destroy();
      host.replaceChildren();
    };
  }, [videoId, item.id, attempt]);

  useEffect(() => {
    if (!optionsOpen) return;
    const outside = (event) => { if (!optionsRef.current?.contains(event.target)) setOptionsOpen(false); };
    const escape = (event) => { if (event.key === "Escape") setOptionsOpen(false); };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [optionsOpen]);

  const togglePlay = () => {
    const player = playerRef.current;
    if (!player || !media.ready || failed) return;
    setMessage("");
    if (player.getPlayerState() === 1) player.pauseVideo(); else player.playVideo();
  };
  const setSound = () => {
    const player = playerRef.current;
    if (!player || !media.ready || failed) return;
    if (player.isMuted()) player.unMute(); else player.mute();
    mutedRef.current = player.isMuted();
    setMuted(mutedRef.current);
  };
  const seek = (event) => {
    const time = Math.min(media.duration, Math.max(0, Number(event.target.value)));
    playerRef.current?.seekTo(time, true);
    setMedia((previous) => ({ ...previous, time }));
  };
  const progress = media.duration ? Math.min(100, media.time / media.duration * 100) : 0;

  return (
    <div className="shorts-player-wrapper" ref={optionsRef}>
      <article className="shorts-player shorts-player--youtube" aria-label={item.title}>
        <div className="shorts-player__top">
          <div className="shorts-player__brand" aria-label="웨이브 쇼츠">
            <img src={wavveLogo} alt="wavve" width="90" height="19.5" /><span>쇼츠</span>
          </div>
          <div className="shorts-player__options">
            <button className="shorts-player__more" type="button" aria-label="영상 옵션"
              aria-expanded={optionsOpen} onClick={() => setOptionsOpen((open) => !open)}>⋮</button>

          </div>
        </div>
        <div className="shorts-player__media shorts-player__youtube-host" ref={hostRef} />
        <footer className="shorts-player__info">
          <h2 title={item.title}>{item.title}</h2>
          <button className="shorts-player__play" type="button" onClick={togglePlay} disabled={!media.ready || failed}
            aria-label={media.playing ? "일시정지" : "재생"}>
            <span aria-hidden="true">{media.playing ? "Ⅱ" : "▶"}</span><span>{item.episode}</span>
          </button>
          <label className="shorts-player__progress">
            <span className="shorts-page__sr-only">재생 위치</span>
            <input type="range" min="0" max={media.duration || 1} step="0.1" value={Math.min(media.time, media.duration || 0)}
              disabled={!media.ready || !media.duration || failed} onChange={seek}
              aria-valuetext={`${formatTime(media.time)} / ${formatTime(media.duration)}`}
              style={{ "--shorts-progress": `${progress}%` }} />
          </label>
        </footer>
      </article>
      {(optionsOpen || message) && <div className="shorts-player__youtube-feedback">
        {optionsOpen && <div className="shorts-player__youtube-options" aria-label="영상 옵션">
          <button type="button" onClick={setSound} disabled={!media.ready || failed}>{muted ? "소리 켜기" : "소리 끄기"}</button>
          {originalUrl && <a href={originalUrl} target="_blank" rel="noopener">유튜브에서 보기</a>}
        </div>}
        {message && <div className="shorts-player__youtube-notice" role="status">
          <p>{message}</p>
          {failed && <div>
            <button type="button" onClick={() => setAttempt((number) => number + 1)}>다시 시도</button>
            {originalUrl && <a href={originalUrl} target="_blank" rel="noopener">유튜브에서 열기</a>}
          </div>}
        </div>}
      </div>}
    </div>
  );
};
