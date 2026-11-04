
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

const CACHE_PREFIX = 'ott-youtube-live-embed-v3-';

// 정상 조회된 라이브 정보는 15분 유지
const CACHE_TIME = 15 * 60 * 1000;

// 라이브 방송이 없는 채널은 5분 뒤 재조회
const EMPTY_CACHE_TIME = 5 * 60 * 1000;

// 동시에 같은 채널을 조회하지 않도록 관리
const pendingRequests = new Map();

// localStorage에서 캐시 읽기
const getCache = (channelId) => {
  try {
    const stored = localStorage.getItem(
      `${CACHE_PREFIX}${channelId}`
    );

    if (!stored) return null;

    const cache = JSON.parse(stored);

    if (
      typeof cache.expiresAt !== 'number' ||
      Date.now() >= cache.expiresAt
    ) {
      localStorage.removeItem(
        `${CACHE_PREFIX}${channelId}`
      );
      return null;
    }

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
  try {
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

    const cached = getCache(channelId);

    if (cached) return cached.data;

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

        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?${params}`
        );

        const data = await response.json();

        if (!response.ok || data.error) {
          const reason =
            data.error?.errors?.[0]?.reason ||
            data.error?.status ||
            'unknown';

          throw new Error(
            `YouTube 조회 실패: HTTP ${response.status} / ${reason}`
          );
        }

        const video = data.items?.find(
          item => item.id?.videoId
        );

        // 조회는 성공했지만 재생 가능한 라이브가 없는 경우
        if (!video) {
          setCache(channelId, null, EMPTY_CACHE_TIME);
          return null;
        }

        const result = {
          videoId: video.id.videoId,
          title: video.snippet?.title ?? '',
          thumbnail:
            video.snippet?.thumbnails?.maxres?.url ??
            video.snippet?.thumbnails?.standard?.url ??
            video.snippet?.thumbnails?.high?.url ??
            video.snippet?.thumbnails?.medium?.url ??
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

    console.error('[YouTube Live]', message);

    if (throwOnError) {
      throw new Error(message);
    }

    // 히어로에서는 조회 실패 시 기존 썸네일 유지
    return null;
  }
};

// 추가 API 요청 없이 저장된 라이브 정보만 읽기
export const getCachedYoutubeLive = (channelId) => {
  if (!channelId) return null;

  return getCache(channelId)?.data || null;
};
