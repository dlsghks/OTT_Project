// 실제 포스터 이미지 URL을 넣으면 바로 표시됩니다. 현재는 이미지 없는 카드도 동작합니다.
const item = (id, title, kind = 'series', image = '') => ({ id, title, kind, image });
export const heroItems = [
  { id: 'hero-1', title: '오늘의 추천 콘텐츠', subtitle: '웨이브에서 만나는 다양한 이야기', image: '', link: '/drama' },
  { id: 'hero-2', title: '놓치면 아쉬운 화제작', subtitle: '지금 인기 있는 작품을 만나보세요', image: '', link: '/movie' },
  { id: 'hero-3', title: '레트로브', subtitle: '그때 그 시절의 프로그램을 다시', image: '', link: '/retrov' },
];
export const categories = [
  { label: '전체', path: '/' }, { label: '예능', path: '/entertainment' },
  { label: '드라마', path: '/drama' }, { label: '영화', path: '/movie' },
  { label: '애니', path: '/animation' }, { label: '라이브', path: '/live' },
  { label: '쇼츠', path: '/shorts' }, { label: '레트로브', path: '/retrov' },
];
const samples = [
  item('101', '지금 뜨는 드라마'), item('102', '화제의 예능'), item('103', '주말 추천 영화'),
  item('104', '정주행 추천작'), item('105', '새로운 이야기'), item('106', '인기 시리즈'),
  item('107', '오늘의 발견'), item('108', '추억의 프로그램'),
];
export const homeSections = [
  { id: 'today', title: '오늘의 추천', items: samples },
  { id: 'drama', title: '인기 드라마', items: samples.slice(2).concat(samples.slice(0, 2)) },
  { id: 'movie', title: '인기 영화', items: samples.slice(4).concat(samples.slice(0, 4)) },
  { id: 'original', title: '웨이브 오리지널', items: samples },
  { id: 'retro', title: '레트로브 추천 콘텐츠', items: samples, more: '/retrov' },
  { id: 'animation', title: '애니메이션 추천', items: samples },
  { id: 'shorts', title: '지금 볼 만한 쇼츠', items: samples, more: '/shorts' },
];
export const rankingItems = [
  { id: 1, title: '프로그램 1', image: '' },
  { id: 2, title: '프로그램 2', image: '' },
  { id: 3, title: '프로그램 3', image: '' },
  { id: 4, title: '프로그램 4', image: '' },
  { id: 5, title: '프로그램 5', image: '' },
  { id: 6, title: '프로그램 6', image: '' },
  { id: 7, title: '프로그램 7', image: '' },
  { id: 8, title: '프로그램 8', image: '' },
  { id: 9, title: '프로그램 9', image: '' },
  { id: 10, title: '프로그램 10', image: '' },
  { id: 11, title: '프로그램 11', image: '' },
  { id: 12, title: '프로그램 12', image: '' },
  { id: 13, title: '프로그램 13', image: '' },
  { id: 14, title: '프로그램 14', image: '' },
  { id: 15, title: '프로그램 15', image: '' },
  { id: 16, title: '프로그램 16', image: '' },
  { id: 17, title: '프로그램 17', image: '' },
  { id: 18, title: '프로그램 18', image: '' },
  { id: 19, title: '프로그램 19', image: '' },
  { id: 20, title: '프로그램 20', image: '' },
];
export const eventBanners = [
  { id: 'event-1', title: '이달의 이벤트', subtitle: '웨이브 이벤트를 확인해 보세요', link: '/event' },
  { id: 'event-2', title: '레트로브 스페셜', subtitle: '추억의 콘텐츠를 다시 만나보세요', link: '/retrov' },
];
