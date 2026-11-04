// 시리즈 회차 영상 유튜브 검색 설정 (TMDB 에 회차 영상이 없을 때 사용)
// - 검색 결과는 브라우저(localStorage)에 저장해 재사용 (유튜브 검색은 하루 사용량이 적음)
// - 검색이 엉뚱한 영상을 찾으면 episodeVideoOverrides 에 직접 videoId 를 넣어 고정

// 카테고리별 검색어 설정
// - unit: 회차 단위 (예능 "회", 드라마 "화")
// - keyword: 검색어 끝에 붙일 단어
export const episodeSearchConfig = {
  entertainment: { unit: '회', keyword: '하이라이트' },
  drama: { unit: '화', keyword: '하이라이트' },
  currentaffairs: { unit: '회', keyword: '' },
  animation: { unit: '화', keyword: '' },
  global: { unit: '화', keyword: '예고편' },
};

// 회차 검색어 만들기
// 예) "놀면 뭐하니? 1회 하이라이트", "모범택시 시즌3 1화 하이라이트"
export const buildEpisodeQuery = ({ category, title, seasonNumber, episodeNumber, hasSeasons }) => {
  const { unit = '화', keyword = '' } = episodeSearchConfig[category] ?? {};
  const season = hasSeasons ? `시즌${seasonNumber} ` : '';
  return `${title} ${season}${episodeNumber}${unit} ${keyword}`.trim();
};

// 시청하기(예고편) 검색어 – TMDB 에 예고편이 없을 때
// 예) "서울의 봄 예고편"
export const trailerSearchKeyword = '예고편';
export const buildTrailerQuery = (title) => `${title} ${trailerSearchKeyword}`;

// 직접 지정한 회차 영상 (검색보다 우선)
// key: `${TMDB id}-${시즌 번호}-${회차 번호}` → 유튜브 videoId
// 예) '94997-1-1': 'dQw4w9WgXcQ',
export const episodeVideoOverrides = {};
