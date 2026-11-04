import { create } from "zustand";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";

import { TMDB_IMG, fetchTmdb, cleanList, toCard } from "../services/tmdbDetail";

// 영화 상세 페이지 TMDB 데이터 (공통 도우미: services/tmdbDetail.js)
export { TMDB_IMG };

// TMDB 영화 → 카드(ContentCard)용 데이터
export const toMovieCard = (movie) => toCard(movie, "/moviedetail");

// 인물 필모그래피 (출연작 / 감독작) 인기순
async function fetchPersonMovies(personId, excludeId, role) {
  const data = await fetchTmdb(`/person/${personId}/movie_credits`);
  const list = role === "director"
    ? (data?.crew ?? []).filter((movie) => movie.job === "Director")
    : data?.cast ?? [];
  return cleanList([...list].sort((a, b) => b.popularity - a.popularity), excludeId).slice(0, 20);
}

// 같은 영화 상세를 동시에 여러 번 요청하지 않기
const loadingIds = new Set();

export const useMovieStore = create((set, get) => ({
  // 로그인 상태 (Firebase 로그인 사용자)
  user: auth.currentUser,

  // 제목 → TMDB id (카테고리 영화 데이터 연결용)
  movieIds: {},
  onFindMovieId: async (title) => {
    const { movieIds } = get();
    if (movieIds[title]) return movieIds[title];

    const data = await fetchTmdb("/search/movie", { query: title });
    const results = data?.results ?? [];
    const exact = results.find((movie) => movie.title === title || movie.original_title === title);
    const id = (exact ?? results[0])?.id ?? null;
    if (id) set((state) => ({ movieIds: { ...state.movieIds, [title]: id } }));
    return id;
  },

  // 영화 상세 (출연진, 영상, 등급, 로고, 추천작 포함)
  movieDetail: {}, // key: tmdbId (불러오기 실패 시 false)
  onFetchMovieDetail: async (id) => {
    const { movieDetail } = get();
    if (id in movieDetail || loadingIds.has(id)) return;
    loadingIds.add(id);

    const data = await fetchTmdb(`/movie/${id}`, {
      append_to_response: "credits,videos,release_dates,images,recommendations,similar",
      include_image_language: "ko,en,null",
      include_video_language: "ko,en",
    });
    loadingIds.delete(id);

    set((state) => ({ movieDetail: { ...state.movieDetail, [id]: data ?? false } }));
    if (data) get().onFetchMovieSections(data);
  },

  // 하단 섹션 (시리즈, 비슷한 영화, 새로 올라온 영화, 장르, 배우, 감독)
  movieSections: {}, // key: tmdbId
  onFetchMovieSections: async (movie) => {
    const { id, genres = [], credits, belongs_to_collection: collection } = movie;
    const genre = genres[0];
    const actors = (credits?.cast ?? []).slice(0, 2);
    const director = (credits?.crew ?? []).find((person) => person.job === "Director");

    const [series, nowPlaying, genreMovies, actorMovies, directorMovies] = await Promise.all([
      collection ? fetchTmdb(`/collection/${collection.id}`) : null,
      fetchTmdb("/movie/now_playing", { region: "KR" }),
      genre ? fetchTmdb("/discover/movie", { with_genres: genre.id, sort_by: "popularity.desc" }) : null,
      Promise.all(actors.map((actor) => fetchPersonMovies(actor.id, id, "cast"))),
      director ? fetchPersonMovies(director.id, id, "director") : [],
    ]);

    const seriesParts = [...(series?.parts ?? [])]
      .sort((a, b) => (a.release_date || "9999").localeCompare(b.release_date || "9999"));
    const similar = movie.recommendations?.results?.length
      ? movie.recommendations.results
      : movie.similar?.results;

    const sections = [
      { id: "series", title: "시리즈", items: cleanList(seriesParts) },
      { id: "similar", title: "비슷한 영화", items: cleanList(similar, id) },
      { id: "new", title: "새로 올라온 영화", items: cleanList(nowPlaying?.results, id) },
      genre && { id: "genre", title: `요즘 인기 있는 ${genre.name}`, items: cleanList(genreMovies?.results, id) },
      ...actors.map((actor, index) => ({
        id: `actor-${actor.id}`,
        title: `${actor.name} 팬이라면 무조건 PLAY!`,
        items: actorMovies[index],
      })),
      director && { id: "director", title: `${director.name} 감독의 다른 영화`, items: directorMovies },
    ]
      .filter(Boolean)
      .map((section) => ({ ...section, items: section.items.map(toMovieCard) }));

    set((state) => ({ movieSections: { ...state.movieSections, [id]: sections } }));
  },
}));

// 로그인 · 로그아웃 시 user 갱신
onAuthStateChanged(auth, (user) => useMovieStore.setState({ user }));
