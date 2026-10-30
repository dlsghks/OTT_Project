
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

const cache = new Map();

export const getTmdbPoster = async (item) => {
  if (!API_KEY || !item.title) return null;

  const mediaType =
    item.kind === "movie" ? "movie" : "tv";

  const cacheKey = `${mediaType}-${item.tmdbId || item.title}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const request = (async () => {
    try {
      const path = item.tmdbId
        ? `/${mediaType}/${item.tmdbId}`
        : `/search/${mediaType}`;

      const url = new URL(`${API_URL}${path}`);

      url.searchParams.set("api_key", API_KEY);
      url.searchParams.set("language", "ko-KR");

      if (!item.tmdbId) {
        url.searchParams.set("query", item.title);
      }

      const response = await fetch(url);

      if (!response.ok) return null;

      const data = await response.json();

      // TMDB ID가 있으면 해당 작품을 직접 조회
      const result = item.tmdbId
        ? data
        : data.results?.find((result) => {
            const name = result.title || result.name;
            return name?.trim() === item.title.trim();
          });

      if (!result?.poster_path) return null;

      return `${IMAGE_URL}${result.poster_path}`;
    } catch (error) {
      console.error("TMDB 이미지 조회 실패:", error);
      return null;
    }
  })();

  cache.set(cacheKey, request);
  return request;
};
