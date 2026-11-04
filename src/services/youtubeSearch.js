// 상세 페이지 유튜브 검색 (TMDB 에 영상이 없을 때 – 회차 영상 · 예고편 공통)
// .env: VITE_YOUTUBE_API_KEY · 검색어 설정은 data/episodeYoutube.js
const YOUTUBE_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
// 유튜브 검색은 하루 사용량(quota)이 적어서 찾은 결과를 브라우저에 저장해 재사용
const YOUTUBE_CACHE_KEY = "detail-episode-youtube-cache";

function loadYoutubeCache() {
  try {
    return JSON.parse(localStorage.getItem(YOUTUBE_CACHE_KEY)) ?? {};
  } catch {
    return {};
  }
}

function saveYoutubeCache(cache) {
  try {
    localStorage.setItem(YOUTUBE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // 저장 공간이 없거나 막힌 경우 무시 (메모리 캐시는 유지)
  }
}

const youtubeVideos = loadYoutubeCache(); // key: 검색어 → videoId (못 찾으면 null)

// 검색어로 유튜브 영상 1개 찾기 → videoId (못 찾으면 null)
export async function searchYoutube(searchQuery) {
  if (searchQuery in youtubeVideos) return youtubeVideos[searchQuery];
  if (!YOUTUBE_KEY) {
    console.warn("VITE_YOUTUBE_API_KEY 가 없어 유튜브를 검색할 수 없습니다.");
    return null;
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&regionCode=KR&q=${encodeURIComponent(
        searchQuery
      )}&key=${YOUTUBE_KEY}`
    );
    const data = await res.json();
    if (data.error) {
      // 사용량 초과 등 — 결과를 저장하지 않아야 나중에 다시 시도 가능
      console.error("유튜브 검색 에러:", data.error.message);
      return null;
    }
    const videoId = data.items?.[0]?.id?.videoId ?? null;
    youtubeVideos[searchQuery] = videoId;
    saveYoutubeCache(youtubeVideos);
    return videoId;
  } catch (error) {
    console.error("유튜브 검색 에러:", error);
    return null;
  }
}
