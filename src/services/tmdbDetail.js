// 상세 페이지(영화 · 예능 · 드라마 · 시사교양 · 애니 · 해외시리즈) 공통 TMDB 도우미
// .env: VITE_TMDB_API_KEY
const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_URL = "https://api.themoviedb.org/3";
export const TMDB_IMG = "https://image.tmdb.org/t/p/";

export async function fetchTmdb(path, params = {}) {
  if (!TMDB_KEY) {
    console.warn("VITE_TMDB_API_KEY 가 없어 TMDB 를 불러올 수 없습니다.");
    return null;
  }
  const query = new URLSearchParams({ api_key: TMDB_KEY, language: "ko-KR", ...params });
  try {
    const res = await fetch(`${TMDB_URL}${path}?${query}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// TMDB 영화 · TV → 카드(ContentCard)용 데이터
// basePath: 카드를 눌렀을 때 이동할 상세 페이지 (예: /moviedetail, /dramadetail)
export const toCard = (item, basePath) => ({
  id: `tmdb-${item.id}`,
  title: item.title ?? item.name,
  kind: item.title ? "movie" : "tv",
  poster: item.poster_path ? `${TMDB_IMG}w500${item.poster_path}` : "",
  link: `${basePath}/${item.id}`,
});

// 포스터 있는 작품만, 현재 작품 제외, 중복 제거
export const cleanList = (list = [], excludeId) => {
  const seen = new Set();
  return list.filter((item) => {
    if (!item.poster_path || item.id === excludeId || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

// 타이틀 로고 (한국어 > 영어 > 기타)
export const getLogo = (images) => {
  const logos = images?.logos ?? [];
  const logo = logos.find((item) => item.iso_639_1 === "ko")
    ?? logos.find((item) => item.iso_639_1 === "en")
    ?? logos[0];
  return logo ? `${TMDB_IMG}w500${logo.file_path}` : null;
};

// 관람 등급 표시값 (12 · 15 · 19 · ALL)
export const toAgeBadge = (cert) => {
  if (!cert) return null;
  if (cert.includes("12")) return "12";
  if (cert.includes("15")) return "15";
  if (cert.includes("18") || cert.includes("19") || cert.includes("청소년")) return "19";
  return "ALL";
};

// 영화 관람 등급 (release_dates 의 KR 기준)
export const getMovieAge = (releaseDates) => {
  const kr = releaseDates?.results?.find((item) => item.iso_3166_1 === "KR");
  return toAgeBadge(kr?.release_dates?.map((item) => item.certification).find(Boolean));
};

// 시리즈 관람 등급 (content_ratings 의 KR 기준)
export const getTvAge = (contentRatings) => {
  const kr = contentRatings?.results?.find((item) => item.iso_3166_1 === "KR");
  return toAgeBadge(kr?.rating);
};

// 제작진 이름 (중복 제거, 최대 20명)
// - 영화 credits.crew 는 job, 시리즈 aggregate_credits.crew 는 jobs[].job
export const getCrewNames = (crew = [], jobs = []) => {
  const names = crew
    .filter((person) => jobs.includes(person.job) || person.jobs?.some((item) => jobs.includes(item.job)))
    .map((person) => person.name);
  return [...new Set(names)].slice(0, 20).join(", ");
};

export const WRITER_JOBS = ["Writer", "Screenplay", "Story", "Novel"];

// 펼치기 상세 정보 행 (개요 · 장르 · 감독 · 작가) – 값이 비면 DetailHero 에서 숨김
// 줄거리 전체는 펼치면 히어로 줄거리가 늘어나서 보여줌
export const getDetailInfo = ({ summary = [], genres = [], directors, writers }) => [
  { label: "개요", value: summary.filter(Boolean).join(", ") },
  { label: "장르", value: genres.map((genre) => `#${genre.name}`).join(" ") },
  { label: "감독", value: directors },
  { label: "작가", value: writers },
];

// TMDB 영상 목록에서 유튜브 영상 고르기 (예고편 > 티저 > 아무 유튜브 영상)
export const pickYoutubeVideo = (videos = []) => {
  const youtube = videos.filter((video) => video.site === "YouTube");
  return youtube.find((video) => video.type === "Trailer")
    ?? youtube.find((video) => video.type === "Teaser")
    ?? youtube[0]
    ?? null;
};

// 2024-01-31 → 2024.01.31
export const formatDate = (date) => date?.slice(0, 10).replaceAll("-", ".") ?? "";
