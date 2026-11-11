
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

const CACHE_PREFIX = 'ott-youtube-live-embed-v4-';

// 정상 조회된 라이브 정보는 15분 유지
const CACHE_TIME = 15 * 60 * 1000;

// 라이브 방송이 없는 채널은 5분 뒤 재조회
const EMPTY_CACHE_TIME = 5 * 60 * 1000;

// 동시에 같은 채널을 조회하지 않도록 관리
const pendingRequests = new Map();

// 채널별 중복 조회뿐 아니라 모든 라이브 API 요청의 동시 실행도 막습니다.
const COOLDOWN_KEY = 'ott-youtube-live-rate-limit-until-v1';
const REQUEST_INTERVAL = 500;
const STALE_CACHE_TIME = 24 * 60 * 60 * 1000;
let requestQueue = Promise.resolve();
let nextRequestAt = 0;
let cooldownUntil = 0;

const getCooldownUntil = () => {
  try {
    const stored = Number(localStorage.getItem(COOLDOWN_KEY));
    if (Number.isFinite(stored)) cooldownUntil = Math.max(cooldownUntil, stored);
  } catch { /* 저장소를 사용할 수 없어도 현재 탭에서는 요청 제한을 유지합니다. */ }
  return cooldownUntil;
};

const cooldownError = () => {
  const error = new Error('YouTube 요청 제한으로 조회를 잠시 쉬고 있어요. 잠시 후 다시 시도해 주세요.');
  error.silent = true;
  return error;
};

const requestYoutube = (url) => {
  const request = requestQueue.then(async () => {
    if (Date.now() < getCooldownUntil()) throw cooldownError();
    const delay = Math.max(0, nextRequestAt - Date.now());
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    if (Date.now() < getCooldownUntil()) throw cooldownError();
    nextRequestAt = Date.now() + REQUEST_INTERVAL;

    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok || data.error) {
      const reason = data.error?.errors?.[0]?.reason || data.error?.status || 'unknown';
      if (response.status === 429 || reason === 'rateLimitExceeded' || reason === 'userRateLimitExceeded') {
        const retryAfter = response.headers?.get?.('Retry-After');
        const seconds = Number(retryAfter);
        const retryAt = retryAfter && Number.isFinite(seconds)
          ? Date.now() + seconds * 1000
          : Date.parse(retryAfter || '');
        cooldownUntil = Math.max(Date.now() + 60000, Number.isFinite(retryAt) ? retryAt : 0);
        try { localStorage.setItem(COOLDOWN_KEY, String(cooldownUntil)); } catch { /* 메모리의 대기시간 유지 */ }
      }
      throw new Error(`YouTube 조회 실패: HTTP ${response.status} / ${reason}`);
    }
    return data;
  });
  requestQueue = request.then(() => undefined, () => undefined);
  return request;
};

// localStorage에서 캐시 읽기
const getCache = (channelId, { allowStale = false } = {}) => {
  try {
    const stored = localStorage.getItem(
      `${CACHE_PREFIX}${channelId}`
    );

    if (!stored) return null;

    const cache = JSON.parse(stored);

    if (typeof cache.expiresAt !== 'number') return null;
    const age = Date.now() - cache.expiresAt;
    if (age >= 0 && (!allowStale || !cache.data || age > STALE_CACHE_TIME)) return null;
    // 만료된 캐시는 지우지 않아 일시적인 API 오류 시 마지막 정상 이미지를 유지합니다.

    return cache;
  } catch (error) {
    console.warn('유튜브 캐시 읽기 실패:', error);
    return null;
  }
};

// localStorage에 캐시 저장
const setCache = (channelId, data, duration) => {
  try {
    localStorage.setItem(
      `${CACHE_PREFIX}${channelId}`,
      JSON.stringify({
        data,
        expiresAt: Date.now() + duration,
      })
    );
  } catch (error) {
    console.warn('유튜브 캐시 저장 실패:', error);
  }
};

// 유튜브 채널의 현재 라이브 영상 조회
export const getYoutubeLive = async (
  channelId,
  { throwOnError = false } = {}
) => {
  const previous = channelId ? getCache(channelId, { allowStale: true })?.data : null;
  try {
    const cached = channelId ? getCache(channelId) : null;
    if (cached) return cached.data;
    if (Date.now() < getCooldownUntil()) {
      if (throwOnError) throw cooldownError();
      return previous || null;
    }
    if (!API_KEY?.trim()) {
      throw new Error(
        'VITE_YOUTUBE_API_KEY가 없습니다. 환경 변수를 확인한 뒤 개발 서버를 재시작해 주세요. 배포 사이트는 다시 빌드·배포해야 합니다.'
      );
    }

    if (!channelId) {
      throw new Error(
        '이 채널에는 youtubeChannelId가 등록되지 않았습니다.'
      );
    }

    if (!pendingRequests.has(channelId)) {
      const request = (async () => {
        const params = new URLSearchParams({
          part: 'snippet',
          channelId,
          eventType: 'live',
          videoEmbeddable: 'true',
          type: 'video',
          maxResults: '5',
          key: API_KEY.trim(),
        });

        const data = await requestYoutube(
          `https://www.googleapis.com/youtube/v3/search?${params}`
        );

        const video = data.items?.find(
          item => item.id?.videoId
        );

        // 조회는 성공했지만 재생 가능한 라이브가 없는 경우
        if (!video) {
          setCache(channelId, null, EMPTY_CACHE_TIME);
          return null;
        }

        // search 응답에 없는 고해상도 썸네일은 같은 영상의 상세 정보에서 확인합니다.
        // 추가 조회 실패 시 검색 결과의 이미지를 그대로 사용합니다.
        let thumbnails = video.snippet?.thumbnails ?? {};
        if (!thumbnails.maxres?.url) {
          try {
            const detailParams = new URLSearchParams({
              part: 'snippet',
              id: video.id.videoId,
              fields: 'items(snippet(thumbnails))',
              key: API_KEY.trim(),
            });
            const detail = await requestYoutube(
              `https://www.googleapis.com/youtube/v3/videos?${detailParams}`
            );
            thumbnails = {
              ...thumbnails,
              ...detail.items?.[0]?.snippet?.thumbnails,
            };
          } catch {
            // 화질 조회 실패 때문에 기존 라이브 시청까지 막지 않습니다.
          }
        }

        const result = {
          videoId: video.id.videoId,
          title: video.snippet?.title ?? '',
          thumbnail:
            thumbnails.maxres?.url ??
            thumbnails.standard?.url ??
            thumbnails.high?.url ??
            thumbnails.medium?.url ??
            thumbnails.default?.url ??
            null,
        };

        setCache(channelId, result, CACHE_TIME);

        return result;
      })().finally(() => {
        pendingRequests.delete(channelId);
      });

      pendingRequests.set(channelId, request);
    }

    return await pendingRequests.get(channelId);
  } catch (error) {
    const message =
      error instanceof TypeError
        ? '유튜브에 연결하지 못했습니다. 네트워크 또는 요청 차단 여부를 확인해 주세요.'
        : error.message || '유튜브 라이브 조회에 실패했습니다.';

    if (!error.silent && !error.reported) {
      console.error('[YouTube Live]', message);
      error.reported = true;
    }

    if (throwOnError) {
      throw new Error(message);
    }

    // 제한/일시 오류가 발생해도 같은 채널의 마지막 정상 정보는 유지합니다.
    return previous || null;
  }
};

// 추가 API 요청 없이 저장된 라이브 정보만 읽기
export const getCachedYoutubeLive = (channelId) => {
  if (!channelId) return null;

  return getCache(channelId, { allowStale: true })?.data || null;
};
