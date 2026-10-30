import { create } from "zustand";

// 레트로브 TMDB · 유튜브 데이터 (무한도전 제외 프로그램)
// .env: VITE_TMDB_API_KEY, VITE_YOUTUBE_API_KEY
const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY;
const YOUTUBE_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const TMDB_URL = "https://api.themoviedb.org/3";
export const TMDB_IMG = "https://image.tmdb.org/t/p/";

// 유튜브 검색은 하루 사용량(quota)이 적어서 찾은 결과를 브라우저에 저장해 재사용
const YOUTUBE_CACHE_KEY = "retrov-youtube-cache";

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

async function fetchTmdb(path) {
  if (!TMDB_KEY) {
    console.warn("VITE_TMDB_API_KEY 가 없어 TMDB 를 불러올 수 없습니다.");
    return null;
  }
  const res = await fetch(`${TMDB_URL}${path}${path.includes("?") ? "&" : "?"}api_key=${TMDB_KEY}`);
  if (!res.ok) return null;
  return res.json();
}

// 같은 요청이 동시에 여러 번 들어와도 한 번만 보내기
const inflight = new Map();
function once(key, task) {
  if (!inflight.has(key)) {
    inflight.set(key, task().finally(() => inflight.delete(key)));
  }
  return inflight.get(key);
}

// TMDB 영상 목록에서 유튜브 영상 고르기 (예고편 > 티저 > 아무 유튜브 영상)
function pickYoutubeKey(videos = []) {
  const youtube = videos.filter((v) => v.site === "YouTube");
  const pick =
    youtube.find((v) => v.type === "Trailer") ??
    youtube.find((v) => v.type === "Teaser") ??
    youtube[0];
  return pick?.key ?? null;
}

export const useRetrovTmdbStore = create((set, get) => ({
  // ######### TV 상세 (배경 이미지·포스터·시즌 정보)
  tvDetail: {}, // key: tmdbId
  onFetchTvDetail: (id) => {
    if (!id || get().tvDetail[id]) return Promise.resolve(get().tvDetail[id]);
    return once(`tv_${id}`, async () => {
      const data = await fetchTmdb(`/tv/${id}?language=ko-KR`);
      if (data) set((state) => ({ tvDetail: { ...state.tvDetail, [id]: data } }));
      return data;
    });
  },

  // ######### 시즌별 에피소드 (회차 제목·줄거리·방영일·장면 사진)
  episodes: {}, // key: `${tmdbId}_${season}`
  onFetchEpisodes: (id, season) => {
    const key = `${id}_${season}`;
    if (!id || get().episodes[key]) return Promise.resolve(get().episodes[key]);
    return once(`ep_${key}`, async () => {
      const data = await fetchTmdb(`/tv/${id}/season/${season}?language=ko-KR`);
      const list = data?.episodes ?? [];
      set((state) => ({ episodes: { ...state.episodes, [key]: list } }));
      return list;
    });
  },

  // ######### 에피소드 영상 (TMDB 에 등록된 유튜브 영상)
  episodeVideos: {}, // key: `${tmdbId}_${season}_${episode}`
  onFetchEpisodeVideo: (id, season, episode) => {
    const key = `${id}_${season}_${episode}`;
    if (get().episodeVideos[key]) return Promise.resolve(get().episodeVideos[key]);
    return once(`epv_${key}`, async () => {
      // 한국어 영상이 없으면 언어 구분 없이 한 번 더
      const ko = await fetchTmdb(`/tv/${id}/season/${season}/episode/${episode}/videos?language=ko-KR`);
      const all = ko?.results?.length ? ko : await fetchTmdb(`/tv/${id}/season/${season}/episode/${episode}/videos`);
      const list = all?.results ?? [];
      set((state) => ({ episodeVideos: { ...state.episodeVideos, [key]: list } }));
      return list;
    });
  },

  // ######### 유튜브 검색 (TMDB 에 영상이 없을 때)
  youtubeVideos: loadYoutubeCache(), // key: 검색어 → videoId
  onFetchYoutubeSearch: (searchQuery) => {
    const cached = get().youtubeVideos[searchQuery];
    if (cached !== undefined) return Promise.resolve(cached);
    if (!YOUTUBE_KEY) {
      console.warn("VITE_YOUTUBE_API_KEY 가 없어 유튜브를 검색할 수 없습니다.");
      return Promise.resolve(null);
    }
    return once(`yt_${searchQuery}`, async () => {
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
        const youtubeVideos = { ...get().youtubeVideos, [searchQuery]: videoId };
        set({ youtubeVideos });
        saveYoutubeCache(youtubeVideos);
        return videoId;
      } catch (error) {
        console.error("유튜브 검색 에러:", error);
        return null;
      }
    });
  },

  // ######### 고유 id 로 재생할 유튜브 영상 찾기
  // source: { tmdbId, season, episode, query }
  //   1) TMDB 에피소드 영상 → 2) 유튜브 검색(query)
  onResolveVideo: async (source) => {
    if (!source) return null;
    const { tmdbId, season, episode, query } = source;

    if (tmdbId && episode) {
      const videos = await get().onFetchEpisodeVideo(tmdbId, season, episode);
      const key = pickYoutubeKey(videos);
      if (key) return key;
    }

    if (query) return get().onFetchYoutubeSearch(query);
    return null;
  },
}));

// TMDB 이미지 주소 (size: w300, w500, w780, original …)
export function tmdbImage(path, size = "w780") {
  return path ? `${TMDB_IMG}${size}${path}` : null;
}
