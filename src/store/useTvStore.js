import { create } from "zustand";
import { fetchTmdb, cleanList, toCard, pickYoutubeVideo } from "../services/tmdbDetail";
import { searchYoutube } from "../services/youtubeSearch";

// 시리즈(예능 · 드라마 · 시사교양 · 애니 · 해외시리즈) 상세 페이지 TMDB 데이터
// 카테고리별 설정(config)은 각 페이지 파일(pages/contents/*Detail.jsx)에 있음

// 오늘 기준 n일 전 날짜 (YYYY-MM-DD), 음수면 n일 후
const daysAgo = (days) => new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);

// 출연진 (전체 시즌 기준 aggregate_credits 우선)
export const getTvCast = (tv) => tv.aggregate_credits?.cast?.length
  ? tv.aggregate_credits.cast
  : tv.credits?.cast ?? [];

// 인물 출연 시리즈 인기순 (excludeGenres: 제외할 TMDB 장르 id)
async function fetchPersonShows(personId, excludeId, excludeGenres = []) {
  const data = await fetchTmdb(`/person/${personId}/tv_credits`);
  const list = (data?.cast ?? [])
    .filter((show) => !show.genre_ids?.some((id) => excludeGenres.includes(id)))
    .sort((a, b) => b.popularity - a.popularity);
  return cleanList(list, excludeId).slice(0, 20);
}

// 같은 요청을 동시에 여러 번 보내지 않기
const loadingKeys = new Set();

export const useTvStore = create((set, get) => ({
  // 카테고리 콘텐츠 id(ent-01) → TMDB id
  tvIds: {},
  onFindTvId: async (item) => {
    if (item.tmdbId) return item.tmdbId;
    const { tvIds } = get();
    if (tvIds[item.id]) return tvIds[item.id];

    const title = item.tmdbTitle || item.title;
    const params = { query: title };
    if (item.tmdbYear) params.first_air_date_year = item.tmdbYear;

    const data = await fetchTmdb("/search/tv", params);
    const results = data?.results ?? [];
    const exact = results.find((show) => show.name === title || show.original_name === title);
    const id = (exact ?? results[0])?.id ?? null;
    if (id) set((state) => ({ tvIds: { ...state.tvIds, [item.id]: id } }));
    return id;
  },

  // 시리즈 상세 (출연진, 제작진, 예고편 영상, 등급, 로고, 추천작 포함)
  tvDetail: {}, // key: tmdbId (불러오기 실패 시 false)
  onFetchTvDetail: async (id) => {
    const key = `detail-${id}`;
    if (id in get().tvDetail || loadingKeys.has(key)) return;
    loadingKeys.add(key);

    const data = await fetchTmdb(`/tv/${id}`, {
      append_to_response: "aggregate_credits,credits,content_ratings,images,videos,recommendations,similar",
      include_image_language: "ko,en,null",
      include_video_language: "ko,en",
    });
    loadingKeys.delete(key);

    set((state) => ({ tvDetail: { ...state.tvDetail, [id]: data ?? false } }));
  },

  // 시즌별 회차 목록
  tvSeasons: {}, // key: `${tmdbId}-${시즌 번호}` (불러오기 실패 시 빈 배열)
  onFetchTvSeason: async (id, seasonNumber) => {
    const key = `${id}-${seasonNumber}`;
    if (key in get().tvSeasons || loadingKeys.has(`season-${key}`)) return;
    loadingKeys.add(`season-${key}`);

    const data = await fetchTmdb(`/tv/${id}/season/${seasonNumber}`);
    loadingKeys.delete(`season-${key}`);

    set((state) => ({ tvSeasons: { ...state.tvSeasons, [key]: data?.episodes ?? [] } }));
  },

  // 회차 영상 (TMDB)
  episodeVideos: {}, // key: `${tmdbId}-${시즌}-${회차}` → TMDB 영상 목록
  onFetchEpisodeVideo: async (id, seasonNumber, episodeNumber) => {
    const key = `${id}-${seasonNumber}-${episodeNumber}`;
    if (key in get().episodeVideos) return get().episodeVideos[key];

    const data = await fetchTmdb(`/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}/videos`, {
      include_video_language: "ko,en",
    });
    const videos = data?.results ?? [];
    set((state) => ({ episodeVideos: { ...state.episodeVideos, [key]: videos } }));
    return videos;
  },

  // 회차를 눌렀을 때 재생할 유튜브 영상 찾기
  // 1) 직접 지정(override) → 2) TMDB 회차 영상 → 3) 유튜브 검색(query)
  onResolveEpisodeVideo: async ({ tmdbId, seasonNumber, episodeNumber, override, query }) => {
    if (override) return override;

    const videos = await get().onFetchEpisodeVideo(tmdbId, seasonNumber, episodeNumber);
    const key = pickYoutubeVideo(videos)?.key;
    if (key) return key;

    return query ? searchYoutube(query) : null;
  },

  // 하단 테마 섹션 (비슷한 프로그램, 방영 중, 요즘 인기, 배우)
  tvSections: {}, // key: `${카테고리}-${tmdbId}`
  onFetchTvSections: async (tv, config) => {
    const key = `${config.category}-${tv.id}`;
    if (key in get().tvSections || loadingKeys.has(`sections-${key}`)) return;
    loadingKeys.add(`sections-${key}`);

    const actors = getTvCast(tv).slice(0, 2);
    const [onAir, popular, actorShows] = await Promise.all([
      fetchTmdb("/discover/tv", {
        ...config.discover,
        sort_by: "popularity.desc",
        "air_date.gte": daysAgo(7),
        "air_date.lte": daysAgo(-7),
      }),
      fetchTmdb("/discover/tv", { ...config.discover, sort_by: "popularity.desc" }),
      Promise.all(actors.map((actor) => fetchPersonShows(actor.id, tv.id, config.personExcludeGenres))),
    ]);
    loadingKeys.delete(`sections-${key}`);

    const similar = tv.recommendations?.results?.length ? tv.recommendations.results : tv.similar?.results;
    const toCards = (list) => list.map((show) => toCard(show, config.basePath));

    const sections = {
      similar: { id: "similar", title: "비슷한 프로그램", items: toCards(cleanList(similar, tv.id)) },
      onAir: { id: "onair", title: `방영 중인 ${config.name}`, items: toCards(cleanList(onAir?.results, tv.id)) },
      popular: { id: "popular", title: `요즘 인기있는 ${config.name}`, items: toCards(cleanList(popular?.results, tv.id)) },
      actors: actors.map((actor, index) => ({
        id: `actor-${actor.id}`,
        title: `${actor.name} 팬이라면 무조건 PLAY!`,
        items: toCards(actorShows[index]),
      })),
    };

    set((state) => ({ tvSections: { ...state.tvSections, [key]: sections } }));
  },
}));
