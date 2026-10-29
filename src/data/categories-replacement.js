// homeData.js의 기존 export const categories = [...] 부분만 교체
// 이동 경로가 확인되지 않은 항목은 링크 없이 표시합니다.
const categoryImage = (name) => `/images/category-buttons/${name}.png`;

export const categories = [
  { label: '키즈', image: categoryImage('kids') },
  { label: 'CJ ENM', image: categoryImage('cj-enm') },
  { label: 'MBC', image: categoryImage('mbc') },
  { label: 'KBS', image: categoryImage('kbs') },
  { label: 'JTBC', image: categoryImage('jtbc') },
  { label: '뉴스', image: categoryImage('news') },
  { label: '영화+', path: '/movie', image: categoryImage('movie-plus') },
  { label: 'Wavve only', image: categoryImage('wavve-only') },
  { label: '골프', image: categoryImage('golf') },
  { label: '출석체크', image: categoryImage('attendance-check') },
  { label: '너 말고 다른 연애', image: categoryImage('different-love') },
  { label: '신인감독 김연경 2', image: categoryImage('rookie-coach-kim-yeon-koung-2') },
  { label: '서바이벌', image: categoryImage('survival') },
  { label: '그것이 알고 싶다', image: categoryImage('unsolved-mysteries') },
  { label: '포식자들', image: categoryImage('forensic-investigators') },
  { label: '티켓', image: categoryImage('ticket') },
  { label: '출석체크 2', image: categoryImage('attendance-check-alt') },
];
