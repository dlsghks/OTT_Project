let apiPromise;

// 이미 로드된 숏츠 플레이어 API도 함께 사용합니다.
export function loadYouTubeAPI() {
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

