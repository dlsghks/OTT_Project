// 레트로브 프로그램 ↔ TMDB 고유 id 연결 (무한도전은 엑셀의 유튜브 videoId 를 쓰므로 제외)
// - 키: 프로그램 id → 시즌 id(retrov 데이터의 seasons[].id), 시즌이 없으면 "default"
// - id: TMDB TV 고유 id / season: TMDB 시즌 번호 / searchTitle: 유튜브 검색어 앞부분
// TMDB 에서 확인: https://www.themoviedb.org/tv/{id}
export const retrovTmdb = {
  "high-kick": {
    // 하이킥 시리즈는 TMDB 에서 작품이 각각 따로 등록돼 있음
    "season-1": { id: 3729, season: 1, searchTitle: "거침없이 하이킥" },
    "season-2": { id: 83518, season: 1, searchTitle: "지붕뚫고 하이킥" },
    "season-3": { id: 88131, season: 1, searchTitle: "하이킥 짧은 다리의 역습" },
  },
  "we-got-married": {
    "season-1": { id: 7677, season: 1, searchTitle: "우리 결혼했어요 시즌1" },
    "season-2": { id: 7677, season: 2, searchTitle: "우리 결혼했어요 시즌2" },
    "season-3": { id: 7677, season: 3, searchTitle: "우리 결혼했어요 시즌3" },
    "season-4": { id: 7677, season: 4, searchTitle: "우리 결혼했어요 시즌4" },
  },
  "boys-over-flowers": {
    default: { id: 16420, season: 1, searchTitle: "꽃보다 남자" },
  },
  "full-house": {
    "season-1": { id: 3504, season: 1, searchTitle: "풀하우스" },
    "season-2": { id: 46540, season: 1, searchTitle: "풀하우스 TAKE 2" },
  },
  "dad-where-are-we-going": {
    "season-1": { id: 57616, season: 1, searchTitle: "아빠 어디가 시즌1" },
    "season-2": { id: 57616, season: 2, searchTitle: "아빠 어디가 시즌2" },
  },
};

// 프로그램·시즌에 맞는 TMDB 정보 (시즌 id 가 없거나 못 찾으면 첫 번째 = 기본 시즌)
export function getTmdbTarget(programId, seasonId) {
  const map = retrovTmdb[programId];
  if (!map) return null;
  return map[seasonId] ?? map.default ?? Object.values(map)[0];
}

// 프로그램·시즌·회차 → 재생용 source (useRetrovPlayer / onResolveVideo 에서 사용)
export function getEpisodeSource(programId, seasonId, episode) {
  const target = getTmdbTarget(programId, seasonId);
  if (!target || !episode) return null;
  return { tmdbId: target.id, season: target.season, episode, query: `${target.searchTitle} ${episode}회` };
}

// 영상 제목에서 회차 번호 꺼내기: "63화", "[1회] …", "1화_최악의 첫 만남", "에피소드 7" → 63, 1, 1, 7
// (video.episode 가 있으면 그 값을 우선 사용, "[1~2회]"처럼 범위면 첫 회차)
export function getEpisodeNumber(video) {
  if (Number.isInteger(video.episode)) return video.episode;
  const match = video.title?.match(/(\d+)\s*(?:~\s*\d+\s*)?(?:화|회)/) ?? video.title?.match(/에피소드\s*(\d+)/);
  return match ? Number(match[1]) : null;
}
