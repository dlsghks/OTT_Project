import { withContent } from './contentCatalog';
import { homeContentBySection } from './requestedHomeSections';

// 실제 포스터 이미지 URL을 넣으면 바로 표시됩니다. 현재는 이미지 없는 카드도 동작합니다.

const item = (
  id,
  title,
  kind = 'series',
  image = '',
  badge = '',
  isOriginal = false
) => ({
  id,
  title,
  kind,
  image,
  badge,
  isOriginal
});

export const heroItems = [
  { id: 'hero-1', title: '오늘의 추천 콘텐츠', subtitle: '웨이브에서 만나는 다양한 이야기', image: '/images/home/hero/main-hero01.jpg', textImage: '/images/home/hero/main-hero-text01.png', link: '/drama' },
  { id: 'hero-2', title: '놓치면 아쉬운 화제작', subtitle: '지금 인기 있는 작품을 만나보세요', image: '/images/home/hero/main-hero02.jpg', textImage: '/images/home/hero/main-hero-text02.png', link: '/movie' },
  { id: 'hero-3', title: '레트로브', subtitle: '그때 그 시절의 프로그램을 다시', image: '/images/home/hero/main-hero03.jpg', textImage: '/images/home/hero/main-hero-text03.png', link: '/retrov' },
  { id: 'hero-4', title: '추천 영화', subtitle: '', image: '/images/home/hero/main-hero04.jpg', textImage: '/images/home/hero/main-hero-text04.png', link: '/movie' },
  { id: 'hero-5', title: '추천 드라마', subtitle: '', image: '/images/home/hero/main-hero05.jpg', textImage: '/images/home/hero/main-hero-text05.png', link: '/drama' },
];

const categoryImage = (name) =>
  `${import.meta.env.BASE_URL}images/category-buttons/${name}.png`;

export const categories = [
  { label: '신인감독 김연경 2', image: categoryImage('rookie-coach-kim-yeon-koung-2') },
  { label: '출석체크', image: categoryImage('attendance-check') },
  { label: '티켓', image: categoryImage('ticket') },
  { label: '골프', image: categoryImage('golf') },
  { label: '영화+', path: '/movie', image: categoryImage('movie-plus') },
  { label: '뉴스', image: categoryImage('news') },
  { label: '그것이 알고 싶다', image: categoryImage('unsolved-mysteries') },
  { label: '너 말고 다른 연애', image: categoryImage('different-love') },
  { label: '포식자들', image: categoryImage('forensic-investigators') },
  { label: 'Wavve only', image: categoryImage('wavve-only') },
  { label: '서바이벌', image: categoryImage('survival') },
  { label: '키즈', image: categoryImage('kids') },
  { label: 'KBS', image: categoryImage('kbs') },
  { label: 'MBC', image: categoryImage('mbc') },
  { label: 'CJ ENM', image: categoryImage('cj-enm') },
  { label: 'JTBC', image: categoryImage('jtbc') },
];



const samples = [
  item('101', '지금 뜨는 드라마', 'series', '', '새로운'),
  item('102', '화제의 예능', 'series', '', '', true),
  item('103', '주말 추천 영화', 'movie', '', '개별구매'),
  item('104', '정주행 추천작', 'series', '', '새로운', true),
  item('105', '새로운 이야기'),
  item('106', '인기 시리즈'),
  item('107', '오늘의 발견'),
  item('108', '추억의 프로그램'),
].map((entry) => ({ ...entry, isPlaceholder: true }));

// 기존에 작성한 드라마 데이터 보존
const dramaItems = [
  {
    id: 'drama-1',
    title: '드라마 제목 1',
    isPlaceholder: true,
    kind: 'series',
    tmdbId: null,
    image: '',
    badge: '',
    isOriginal: false
  },
  {
    id: 'drama-2',
    title: '드라마 제목 2',
    isPlaceholder: true,
    kind: 'series',
    tmdbId: null,
    image: '',
    badge: '',
    isOriginal: false
  }
];

// HOPE 전용 영화 목록. 포스터 미지정 시 ContentCard의 기존 TMDB 조회를 사용한다.
export const hopeItems = [
  { ...item('hope-marty-supreme', '마티 슈프림', 'movie', '', '개별구매'), badges: ['새로운', '개별구매'] },
  item('hope-french-dispatch', '프렌치 디스패치', 'movie', '', '개별구매'),
  // https://www.themoviedb.org/movie/438631-dune?language=en-US (2021)
  item('hope-dune', '듄', 'movie', '', '개별구매'),
  // https://www.themoviedb.org/movie/661539-a-complete-unknown (2024)
  item('hope-complete-unknown', '컴플리트 언노운', 'movie', '', '개별구매'),
  item('hope-dune-part-two', '듄: 파트2', 'movie', '', '개별구매'),
  item('hope-wonka', '웡카', 'movie', '', '개별구매'),
  item('hope-rainy-day', '레이니 데이 인 뉴욕', 'movie'),
  // https://www.themoviedb.org/movie/331482-little-women (2019)
  item('hope-little-women', '작은 아씨들', 'movie', '', '개별구매'),
  item('hope-lady-bird', '레이디 버드', 'movie', '', '개별구매'),
  item('hope-call-me', '콜 미 바이 유어 네임', 'movie', '', '개별구매'),
  item('hope-interstellar', '인터스텔라', 'movie', '', '개별구매'),
].map((entry) => withContent(entry, 'home'));

// 메인 페이지 콘텐츠 섹션
export const homeSections = [
  {
    id: 'weekly',
    title: '요일별 콘텐츠',
    cardType: 'default',
    items: dramaItems
  },
  {
    id: 'travel',
    title: '해외로 떠나는 여행 예능',
    cardType: 'default',
    items: homeContentBySection['travel']
  },
  {
    id: 'music-entertainment',
    title: '걱정은 잠시 잊게 만드는 음악 예능',
    cardType: 'default',
    items: homeContentBySection['music-entertainment']
  },
  {
    id: 'jung-hyung-don',
    title: '정형돈의 제목없음 TV',
    cardType: 'wide',
    items: homeContentBySection['jung-hyung-don']
  },
  {
    id: 'variety',
    title: '#버라이어티',
    cardType: 'default',
    items: homeContentBySection['variety']
  },
  {
    id: 'coming-soon',
    title: '두근두근 Coming Soon',
    cardType: 'coming-soon',
    items: samples
  },
  {
    id: 'talk',
    title: '#토크',
    cardType: 'default',
    items: homeContentBySection['talk']
  },
  {
    id: 'music',
    title: '#뮤직',
    cardType: 'default',
    items: homeContentBySection['music']
  },
  {
    id: 'all-entertainment',
    title: '예능 전체보기',
    cardType: 'default',
    items: homeContentBySection['all-entertainment'],
    more: '/entertainment'
  }
];



export const rankingItems = [
  // MBC 2026년 드라마를 동명 프로그램과 구분한다. 확인하지 못한 TMDB ID는 지정하지 않는다.
  { id: 1, title: "가족관계증명서", kind: "series", image: "", badge: "", isOriginal: false },
  { id: 2, title: "욕망의 덫", kind: "series", image: "", badge: "", isOriginal: false },
  { id: 3, title: "엄마가 미쳤어요", kind: "series", image: "", badge: "", isOriginal: false },
  { id: 4, title: "놀면 뭐하니?", kind: "series", image: "", badge: "", isOriginal: false },
  // https://www.themoviedb.org/tv/65270-radio-star
  { id: 5, title: "라디오스타", kind: "series", image: "", badge: "", isOriginal: false },
  { id: 6, title: "나 혼자 산다", kind: "series", image: "", badge: "", isOriginal: false },
  // KBS의 2023년 과학수사 프로그램. 동명 드라마와 구분할 검색 정보만 추가한다.
  { id: 7, title: "스모킹 건", kind: "series", image: "", badge: "", isOriginal: false },
  { id: 8, title: "심야괴담회", kind: "series", image: "", badge: "", isOriginal: false },
  { id: 9, title: "너 말고 다른 연애", kind: "series", image: "", badge: "", isOriginal: false },
  { id: 10, title: "신인감독 김연경", kind: "series", image: "", badge: "", isOriginal: false },
  { id: 11, title: "이혼숙려캠프", kind: "series", image: "", badge: "", isOriginal: false },
  { id: 12, title: "미스트롯", kind: "series", image: "", badge: "", isOriginal: false },
  { id: 13, title: "유 퀴즈 온 더 블럭", kind: "series", image: "", badge: "", isOriginal: false },
  { id: 14, title: "개와 늑대의 시간", kind: "series", image: "", badge: "", isOriginal: false },
  { id: 15, title: "전지적 참견 시점", kind: "series", image: "", badge: "", isOriginal: false },
  { id: 16, title: "탐정들의 영업비밀", kind: "series", image: "", badge: "", isOriginal: false },
  { id: 17, title: "전설의 사내", kind: "series", image: "", badge: "", isOriginal: false },
  { id: 18, title: "1박 2일", kind: "series", image: "", badge: "", isOriginal: false },
  { id: 19, title: "슈퍼맨이 돌아왔다", kind: "series", image: "", badge: "", isOriginal: false },
  { id: 20, title: "더 커뮤니티", kind: "series", image: "", badge: "", isOriginal: false },
].map((entry) => withContent(entry, 'ranking'));


export const eventBanners = [
  { id: 'event-1', title: '이달의 이벤트', subtitle: '웨이브 이벤트를 확인해 보세요', link: '/event' },
  { id: 'event-2', title: '레트로브 스페셜', subtitle: '추억의 콘텐츠를 다시 만나보세요', link: '/retrov' },
];
