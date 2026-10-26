const images = [
  '/images/live/C5202.jpg',
  '/images/live/K01.jpg',
  '/images/live/K31.jpg',
  '/images/live/M08_main_20250826141358.jpg',
  '/images/live/S27.jpg',
  '/images/live/Y01.jpg',
  '/images/live/C2101.jpg',
  '/images/live/F2101.jpg',
  '/images/live/M14.jpg',
  '/images/live/PM1.jpg',
];
const definitions = [
  ['정주행 채널', ['JTBC', '채널A', 'MBC', 'KBS2', 'SBS'], ['예능 몰아보기', '인기 드라마 정주행', '레전드 예능', '주말 특집', '명작 다시보기']],
  ['홈쇼핑', ['현대홈쇼핑', 'GS SHOP', 'CJ ONSTYLE', '롯데홈쇼핑', 'KT알파 쇼핑'], ['오늘의 쇼핑 라이브', '인기 상품 특가', '패션 라이브', '생활용품 특집', '쇼핑 베스트']],
  ['지상파', ['KBS1', 'KBS2', 'MBC', 'EBS1', 'EBS2'], ['TV쇼 진품명품', '주말 드라마 스페셜', '교양 프로그램', '세계테마기행', '가족 프로그램']],
  ['24시간 뉴스 채널', ['YTN', '연합뉴스TV', 'SBS Biz', 'KBS NEWS', 'MBC NEWS'], ['뉴스퀘어', '뉴스24', '경제 뉴스', '주요 뉴스', '시사 브리핑']],
  ['종합편성', ['MBN', 'TV CHOSUN', 'JTBC', '채널A', '연합뉴스TV'], ['뉴스와이드', '시사 토크', '교양 특집', '오늘의 이슈', '종합뉴스']]
];
const current = new Date();
const base = new Date(current.getFullYear(), current.getMonth(), current.getDate(), current.getHours(), 0, 0);
const stamp = minutes => new Date(base.getTime() + minutes * 60000).toISOString();
export const livePrograms = definitions.flatMap(([category, channels, titles], ci) =>
  Array.from({ length: 15 }, (_, i) => ({
    id: `${ci}-${i}`, channelId: channels[i % 5].toLowerCase().replace(/\s/g, '-'),
    channel: channels[i % 5], title: titles[i % 5], category,
    image: images[(ci * 3 + i) % images.length], start: stamp(-25 - i * 2), end: stamp(35 + i * 2),
    rank: ci * 15 + i + 1, rating: undefined
  }))
);
export const liveCategories = definitions.map(([category]) => category);
export const liveBanner = { title: 'LIVE 스페셜', subtitle: '지금 방송 중인 콘텐츠를 만나보세요', link: '/schedule', image: '' };
