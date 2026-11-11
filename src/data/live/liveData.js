
const thumbnailPath = '/images/live/thumbnail/';

// 하단 라이브 썸네일 30개
const liveThumbnails = Array.from({ length: 30 }, (_, index) => {
  const number = String(index + 1).padStart(2, '0');

  // 25번만 webp
  const extension = index + 1 === 25 ? 'webp' : 'jpg';

  return `${thumbnailPath}livethumbnail${number}.${extension}`;
});

// API 제한 시에도 채널에 맞는 로컬 이미지를 즉시 표시합니다.
const heroImages = [
  '/images/live/fallback/ytn.svg',
  '/images/live/fallback/mbn.svg',
  '/images/live/fallback/kbs1.svg',
  '/images/live/fallback/yonhap.svg',
  '/images/live/thumbnail/livethumbnail019.jpg',
  '/images/live/K31.jpg',
  '/images/live/PM1.jpg',
  '/images/live/thumbnail/livethumbnail026.jpg',
  '/images/live/fallback/mbc.svg',
  '/images/live/fallback/tv-chosun.svg',
];

const demoRatings = [
  21.7, 7.9, 7.2, 6.5, 5.8,
  5.1, 4.6, 4.2, 3.8, 3.3,
];

const definitions = [
  [
    '정주행 채널',
    ['JTBC', '채널A', 'MBC', 'KBS2', 'SBS'],
    [
      '예능 몰아보기',
      '인기 드라마 정주행',
      '레전드 예능',
      '주말 특집',
      '명작 다시보기',
    ],
  ],
  [
    '홈쇼핑',
    [
      '현대홈쇼핑',
      'GS SHOP',
      'CJ ONSTYLE',
      '롯데홈쇼핑',
      'KT알파 쇼핑',
    ],
    [
      '오늘의 쇼핑 라이브',
      '인기 상품 특가',
      '패션 라이브',
      '생활용품 특집',
      '쇼핑 베스트',
    ],
  ],
  [
    '지상파',
    ['KBS1', 'KBS2', 'MBC', 'EBS1', 'EBS2'],
    [
      'TV쇼 진품명품',
      '주말 드라마 스페셜',
      '교양 프로그램',
      '세계테마기행',
      '가족 프로그램',
    ],
  ],
  [
    '24시간 뉴스 채널',
    ['YTN', '연합뉴스TV', 'SBS Biz', 'KBS NEWS', 'MBC NEWS'],
    [
      '뉴스퀘어',
      '뉴스24',
      '경제 뉴스',
      '주요 뉴스',
      '시사 브리핑',
    ],
  ],
  [
    '종합편성',
    ['MBN', 'TV CHOSUN', 'JTBC', '채널A', '연합뉴스TV'],
    [
      '뉴스와이드',
      '시사 토크',
      '교양 특집',
      '오늘의 이슈',
      '종합뉴스',
    ],
  ],
];

// 방송 시간 생성
const current = new Date();

const base = new Date(
  current.getFullYear(),
  current.getMonth(),
  current.getDate(),
  current.getHours(),
  0,
  0
);

const stamp = (minutes) =>
  new Date(base.getTime() + minutes * 60000).toISOString();

// 전체 라이브 프로그램
export const livePrograms = definitions.flatMap(
  ([category, channels, titles], ci) =>
    Array.from({ length: 15 }, (_, i) => {
      const rank = ci * 15 + i + 1;

      return {
        id: `${ci}-${i}`,

        // 카테고리와 순번을 조합하여 중복 방지
        channelId: `${ci}-${i}`,

        channel: channels[i % 5],
        title: titles[i % 5],
        category,

        // 준비된 30개 이미지 순환 배정
        image: liveThumbnails[(rank - 1) % liveThumbnails.length],

        start: stamp(-25 - i * 2),
        end: stamp(35 + i * 2),

        rank,
        viewerRank: rank,

        rating:
          rank <= 10
            ? demoRatings[rank - 1]
            : undefined,

        // 실제 재생 가능한 영상 주소 연결 시 사용
        streamUrl: null,
        videoUrl: null,
        youtubeLiveId: null,
      };
    })
);

// LIVE 히어로 TOP 10
const top10Data = [
  {
    channel: 'YTN',
    title: '뉴스ON',
    youtubeChannelId: 'UChlgI3UHCOnwUGzWzbJ3H5w',
    youtubeLiveId: null,
    videoUrl: '/videos/live-demo.mp4',
    isDemo: true,
  },
  {
    channel: 'MBN',
    title: 'MBN 뉴스와이드',
    youtubeChannelId: 'UCG9aFJTZ-lMCHAiO1KJsirg',
  },
  {
    channel: 'KBS1',
    title: '사사건건',
    youtubeChannelId: 'UCcQTRi69dsVYHN3exePtZ1A',
  },
  {
    channel: '연합뉴스TV',
    title: '뉴스워치',
    youtubeChannelId: 'UCTHCOPwqNfZ0uiKOvFyhGwg',
  },
  {
    channel: '맛있는 녀석들',
    title: '227회',
    youtubeChannelId: 'UCsOW9TPy2TKkqCchUHL04Fg',
  },
  {
    channel: '사랑과 전쟁 시즌1',
    title: '419회',
    image: '/images/live/K31.jpg',
    youtubeChannelId: null,
  },
  {
    channel: '무한도전',
    title: '463회 - 마션',
    image: '/images/live/PM1.jpg',
    youtubeChannelId: null,
  },
  {
    channel: '1박 2일',
    title: '시즌1 광역시 릴레이 -\n6대 광역시 특집(2)',
    youtubeChannelId: 'UC271vX3c3kYZsgpz7-zPBoA',
  },
  {
    channel: 'MBC',
    title: '기분 좋은 날(재)',
    youtubeChannelId: 'UCF4Wxdo3inmxP-Y59wXDsFw',
  },
  {
    channel: 'TV CHOSUN',
    title: '시사팩트',
    youtubeChannelId: 'UCWlV3Lz_55UaX4JsMj-z__Q',
  },
];

export const liveTop10 = top10Data.map((program, index) => ({
  id: `top-${index + 1}`,

  channelId: program.channel
    .toLowerCase()
    .replace(/\s/g, '-'),

  channel: program.channel,
  title: program.title,
  category: '인기 라이브',

  image: program.image || heroImages[index],
  fallbackImage: program.image || heroImages[index],

  start: stamp(-25 - index * 2),
  end: stamp(35 + index * 2),

  rank: index + 1,
  viewerRank: index + 1,

  rating: demoRatings[index],

  youtubeChannelId: program.youtubeChannelId,
  youtubeLiveId: program.youtubeLiveId || null,

  streamUrl: program.streamUrl || null,
  videoUrl: program.videoUrl || null,
  isDemo: program.isDemo || false,
}));

// 카테고리
export const liveCategories = definitions.map(
  ([category]) => category
);

// 라이브 배너
export const liveBanner = {
  title: 'LIVE 스페셜',
  subtitle: '지금 방송 중인 콘텐츠를 만나보세요',
  link: '/schedule',
  image: '',
};
