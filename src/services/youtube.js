
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

const CACHE_PREFIX = 'ott-youtube-live-';

// 정상 조회된 라이브 정보는 15분 유지
const CACHE_TIME = 15 * 60 * 1000;

// 라이브 방송이 없는 채널은 5분 뒤 재조회
const EMPTY_CACHE_TIME = 5 * 60 * 1000;

// API 오류 발생 시 2분 동안 재요청 방지
const ERROR_COOLDOWN = 2 * 60 * 1000;

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
export const getYoutubeLive = async (channelId) => {
  if (!API_KEY || !channelId) return null;

  // 1. 기존 캐시가 있으면 API 호출 없이 반환
  const cached = getCache(channelId);

  if (cached) {
    return cached.data;
  }

  // 2. 동일 채널의 요청이 진행 중이면 결과 공유
  if (pendingRequests.has(channelId)) {
    return pendingRequests.get(channelId);
  }

  const request = (async () => {
    try {
      const params = new URLSearchParams({
        part: 'snippet',
        channelId,
        eventType: 'live',
        type: 'video',
        maxResults: '5',
        key: API_KEY,
      });

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${params}`
      );

      if (!response.ok) {
        throw new Error(
          `YouTube API 오류: ${response.status}`
        );
      }

      const data = await response.json();
      const video = data.items?.[0];

      // 3. 현재 라이브 방송이 없는 경우
      if (!video?.id?.videoId) {
        setCache(channelId, null, EMPTY_CACHE_TIME);
        return null;
      }

      // 4. 라이브 정보 정리
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

      // 5. 성공한 조회 결과를 15분간 저장
      setCache(channelId, result, CACHE_TIME);

      return result;
    } catch (error) {
      console.error(
        '유튜브 라이브 조회 실패:',
        error
      );

      // 오류 발생 시 잠시 재요청 방지
      setCache(channelId, null, ERROR_COOLDOWN);

      return null;
    } finally {
      pendingRequests.delete(channelId);
    }
  })();

  pendingRequests.set(channelId, request);

  return request;
};
