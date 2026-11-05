// 카테고리 히어로 6개 작품의 검증된 보충 메타데이터.
// TMDB 검색/상세 데이터가 비어 있거나 일부 시즌 회차가 누락됐을 때만 사용한다.
// episodeCounts 는 '제공 영상 수'가 아닌, 외부 편성 정보로 확인한 회차 수다.
// 제목이 확인되지 않은 회차는 숫자와 '상세 정보 미제공'으로만 표시한다.
const bloodyGame3Titles = [
  '피의 게임에 오신 여러분 환영합니다',
  '신이 점지한 운명이죠',
  '강자를 탈락시켜야해',
  '나는 지고는 못 사는 사람이야',
  '모든 선택에는 반드시 대가가 따른다',
  '우주의 기운이 우리에게 왔어',
  '난 더 이상 두려운 게 없어',
  '한 배를 탄다는 것',
  '영원한 비무장지대는 없어',
  '타고난 것이 가장 중요하다',
  '잡고 있던 걸 놓을 뿐이야',
  '신이 나에게 거짓말을 했어',
  '지금까지 쌓아온 모든 걸 쏟아부어야 해',
  '파이널 매치를 시작하겠습니다',
  '피의게임3 야미야미 토크쇼',
];

export const tvHeroOverrides = {
  'ent-14': {
    tmdbTitle: '피의 게임',
    defaultSeason: 3,
    age: '15',
    genres: '리얼리티 · 서바이벌',
    episodeCounts: { 3: 15 },
    episodeTitles: { 3: bloodyGame3Titles },
    episodeSource: 'https://www.justwatch.com/kr/TV-프로그램/bloody-game/시즌-3',
  },
  'ent-16': {
    title: '여행 설계자들',
    defaultSeason: 1,
    // 공식 방송사 자료에 등급 표기가 확인되지 않아 숫자를 추정하지 않는다.
    genres: '예능 · 여행 · 리얼리티',
    episodeCounts: { 1: 4 },
    episodeSource: 'https://ichannela.com/program/detail/program_title_renew.do?cateCode=0500AC',
  },
  'dra-13': {
    age: '19',
    genres: '드라마 · 서스펜스',
  },
  'cur-01': {
    defaultSeason: 1,
    genres: '시사교양 · 탐사보도',
    // 2026-08 기준 JustWatch에 등록된 시즌1의 편성 회차 수.
    episodeCounts: { 1: 710 },
    episodeSource: 'https://www.justwatch.com/kr/TV-프로그램/geugeosi-algosipda',
  },
  'ani-11': {
    defaultSeason: 1,
    age: '7', // 시즌1 기준 (다른 시즌의 실제 등급은 다를 수 있음)
    genres: '애니메이션 · 키즈 · 판타지',
    episodeCounts: { 1: 52 },
    episodeSource: 'https://thetvdb.com/series/catch-teenieping/seasons/official/1',
  },
  'glo-10': {
    defaultSeason: 1,
    age: '15',
    genres: '드라마 · 시대극',
    episodeCounts: { 1: 46 },
    episodeSource: 'https://www.justwatch.com/kr/TV-프로그램/gyeongyeonyeon/시즌-1',
  },
};

// TMDB의 시즌 상세 API는 작품에 따라 회차를 일부만 제공할 수 있다.
// 검증된 편성 회차 수까지 부족한 번호를 채우되, 회차 제목·방영일·줄거리는 추정하지 않는다.
export const combineVerifiedEpisodes = (tmdbEpisodes, metadata, seasonNumber) => {
  const episodes = Array.isArray(tmdbEpisodes) ? tmdbEpisodes : [];
  const count = metadata?.episodeCounts?.[seasonNumber] ?? 0;
  if (!count) return tmdbEpisodes;

  const knownByNumber = new Map(episodes.map((episode) => [episode.episode_number, episode]));
  const knownTitles = metadata.episodeTitles?.[seasonNumber] ?? [];
  // 오래 방영된 프로그램은 회차 번호가 1500을 넘어도 시즌의 실제 항목 수는
  // 710건일 수 있다. 최고 번호를 회차 개수로 오인하지 않는다.
  let number = 1;
  while (knownByNumber.size < count) {
    if (!knownByNumber.has(number)) {
      knownByNumber.set(number, {
        id: `verified-${seasonNumber}-${number}`,
        episode_number: number,
        name: knownTitles[number - 1] ?? '상세 정보 미제공',
        overview: '',
        air_date: '',
        still_path: null,
        isVerifiedScheduleOnly: true,
      });
    }
    number += 1;
  }

  return [...knownByNumber.values()].sort((a, b) => a.episode_number - b.episode_number);
};
