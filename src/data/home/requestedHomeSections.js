import { withContent } from '../contentCatalog';
import { categoryPages } from '../categoryData';

// 요청한 홈 콘텐츠 50개. 표시 제목과 배열 순서는 사용자 목록을 유지한다.
// 아래 homeContentBySection에서 기존 홈 섹션의 성격에 맞는 작품만 선택한다.
// 미확인 작품은 기존 isPlaceholder 처리로 제목 대체 카드를 사용한다.
// 실제 작품을 임시 제목으로 간주하는 뜻이 아니라, 검증 전 동명 작품 검색을 막기 위한 표시다.
// 포스터 식별 정보와 검증 상태는 contentCatalog.js에서 수정한다.
// tmdbSource는 공개 상세 페이지 확인 근거이며 인증 API 응답/이미지 로딩 검증을 뜻하지 않는다.
export const requestedHomeSections = [
  {
    "id": "wavve-only",
    "title": "오직 웨이브에서",
    "items": [
      {
        "id": "home-wavve-only-01",
        "title": "각설탕 소리",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-wavve-only-02",
        "title": "여름방학",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-wavve-only-03",
        "title": "더 커뮤니티 2: 보이지 않는 손",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-wavve-only-04",
        "title": "전설의 수사",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-wavve-only-05",
        "title": "옆자리 프란체스카",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-wavve-only-06",
        "title": "포식자들",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-wavve-only-07",
        "title": "하절기",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-wavve-only-08",
        "title": "연애남매2",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-wavve-only-09",
        "title": "피의 게임X",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-wavve-only-10",
        "title": "비광",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-wavve-only-11",
        "title": "사이비 헌터",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-wavve-only-12",
        "title": "베팅 온 팩트",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-wavve-only-13",
        "title": "스탠바이미",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-wavve-only-14",
        "title": "검사실의 제안",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-wavve-only-15",
        "title": "팬덤 스테이지",
        "image": "",
        "badge": "",
        "isOriginal": false
      }
    ]
  },
  {
    "id": "new-series",
    "title": "새로 올라온 시리즈",
    "items": [
      {
        "id": "home-new-series-01",
        "title": "빌려준 마력은 리볼빙으로 강제징수",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-new-series-02",
        "title": "망량의상자",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-new-series-03",
        "title": "커피 한잔 할까요",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-new-series-04",
        "title": "새우도 도미를 낚고 싶다",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-new-series-05",
        "title": "백수 이세돌",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-new-series-06",
        "title": "동네스타 K3",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-new-series-07",
        "title": "지구마불 세계여행3",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-new-series-08",
        "title": "정형돈의 제목없음 TV",
        "image": "/images/home/section/jung/JungThumbnail.jpg",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-new-series-09",
        "title": "작골",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-new-series-10",
        "title": "퀸덤 2",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-new-series-11",
        "title": "결이 다른 전쟁사",
        "image": "",
        "badge": "",
        "isOriginal": false
      }
    ]
  },
  {
    "id": "new-movies",
    "title": "새로 올라온 영화",
    "items": [
      {
        "id": "home-new-movies-01",
        "title": "마티슈프림",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-new-movies-02",
        "title": "포가튼 아일랜드",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-new-movies-03",
        "title": "인턴",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-new-movies-04",
        "title": "HOPE",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-new-movies-05",
        "title": "짝사랑 세계",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-new-movies-06",
        "title": "에이전트 블랙",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-new-movies-07",
        "title": "인천상륙작전",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-new-movies-08",
        "title": "아가미",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-new-movies-09",
        "title": "포화속으로",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-new-movies-10",
        "title": "배반의 장미",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-new-movies-11",
        "title": "이상한 과자가게 전천당",
        "image": "",
        "badge": "",
        "isOriginal": false
      }
    ]
  },
  {
    "id": "animation",
    "title": "애니메이션",
    "items": [
      {
        "id": "home-animation-01",
        "title": "도원암귀",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-animation-02",
        "title": "담배고양이",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-animation-03",
        "title": "세계 최강의 마녀 시작했습니다.",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-animation-04",
        "title": "반딧불이의 혼례",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-animation-05",
        "title": "블랙 클로버",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-animation-06",
        "title": "터무니없는 스킬로 이세계방랑밥2",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-animation-07",
        "title": "원피스",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-animation-08",
        "title": "먼가작고귀여운녀석",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-animation-09",
        "title": "파마기아",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-animation-10",
        "title": "아르네의 사건부",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-animation-11",
        "title": "청의 엑소시스트",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-animation-12",
        "title": "은혼",
        "image": "",
        "badge": "",
        "isOriginal": false
      },
      {
        "id": "home-animation-13",
        "title": "진격의 거인",
        "image": "",
        "badge": "",
        "isOriginal": false
      }
    ]
  }
].map((section) => ({
  ...section,
  items: section.items.map((entry) => withContent(entry, 'home')),
}));

// 제목을 복사해 새 카드를 만들지 않고, 동일한 데이터 객체를 섹션마다 재사용한다.
// filter는 원본 목록 순서를 보존한다. 미확인 작품은 검색을 강행하지 않는다.
const requestedItems = requestedHomeSections.flatMap((section) => section.items);
const selectItems = (titles) => requestedItems.filter((entry) => titles.includes(entry.title));

const varietyTitles = [
  '더 커뮤니티 2: 보이지 않는 손', '연애남매2', '피의 게임X', '베팅 온 팩트',
  '스탠바이미',
  '백수 이세돌', '동네스타 K3', '지구마불 세계여행3', '정형돈의 제목없음 TV', '퀸덤 2',
];

// 정형돈의 제목없음 TV 전용 썸네일

const jungVideoData = [
  {
    title: '솔직히 중국만 가만히 있었으면 수백만명을 살리는거 아님? 💥 ... 국제정세의 복잡함😮',
    updatedAt: '2026-10-23',
  },
  {
    title: "그런 거 잘 몰라욥! 국어 선생님께 찰지게 듣는 '나쁜 말' 어원!",
    updatedAt: '2023-07-28',
  },
  {
    title: '이게 그런 뜻이었다고...? 국어쌤 킹받게 만든 논란의 말은?',
    updatedAt: '2023-08-04',
  },
  {
    title: '진짜 이거 몰라요?? 국어쌤 vs 정형돈 맞혀야 본전... 자강두천 퀴즈대결!',
    updatedAt: '2023-08-11',
  },
  {
    title: '요즘 이혼 트렌드는 전과자 만들기ㅋㅋ (간통은 되고 사매매는 안되는 이상한 논리?)',
    updatedAt: '2026-08-07',
  },
  {
    title: '사랑 아닙니다 진짜 😣 불륜 전문가들도 경악한 최악의 학체 🚨',
    updatedAt: '2026-08-14',
  },
  {
    title: '우리는 단군의 자손이 아니다!? 😺 단일민족의 함정, 신화의 본질',
    updatedAt: '2026-07-10',
  },
  {
    title: '전 국민이 홍길동전을 최초의 한글 소설로 알게 된 사연은?!! 🤔🔥 촬영 중 전분노 터진 선생님 😡',
    updatedAt: '2026-07-17',
  },
  {
    title: '중국이 은폐한 진실... 👁 한자가 중국 것이 아니라고! 진짜 주인은 누구인가 😲',
    updatedAt: '2026-10-09',
  },

  {
    title: '김진명 曰 "평생 추적, 취재한거 다 말씀드리겠습니다" 📷 이휘소 사망사건/김재규와 CIA/광개토대왕릉비',
    updatedAt: '2026-10-16',
  },

];

const jungEpisodeNumbers = [14, 5, 6, 7, 8, 9, 10, 11, 12, 13];
const jungDurations = ['49분', '18분', '17분', '15분', '44분', '45분', '39분', '38분', '53분', '1시간 1분'];

const jungHyungDonItems = jungVideoData.map((video, index) => {
  const number = index + 1;
  const filename = number === 10
    ? 'jung010.jpg'
    : `jung${String(number).padStart(2, '0')}.jpg`;

  return {
    id: `jung-hyung-don-${number}`,
    link: `/home-content/jung-hyung-don/jung-hyung-don-${number}`,
    title: video.title,
    updatedAt: video.updatedAt,
    episodeNumber: jungEpisodeNumbers[index],
    duration: jungDurations[index],
    kind: 'series',
    image: `/images/home/section/jung/${filename}`,
    badge: '',
    isOriginal: false,
  };
});



// 사용자가 지정한 작품부터 배치하고,
// 기존 같은 장르 작품을 뒤에 추가한다.
const getHomeEntertainmentItems = (genre, titles) => {
  const items = categoryPages.entertainment.items;

  const priorityItems = titles
    .map((title) =>
      items.find((item) => item.title === title)
    )
    .filter(Boolean);

  const candidates = [
    ...priorityItems,
    ...items.filter((item) => item.genre === genre),
  ];

  const seen = new Set();

  return candidates.filter((item) => {
    if (seen.has(item.id)) return false;

    seen.add(item.id);
    return true;
  });
};

export const homeContentBySection = {
  // 요청한 여행 프로그램 우선
  travel: getHomeEntertainmentItems('travel', [
    '어서와 한국은 처음이지?',
    '걸리버 여행기',
    '끝까지 간다 독박투어',
    '남겨서 뭐하게',
    '강철지구',
    '텐트 밖은 유럽',
    '상남자의 여행법',
    '태어난 김에 음악일주',
    '놀러코스터',
    '위대한 가이드',
  ]),

  // 요청한 음악 프로그램 우선
  'music-entertainment': getHomeEntertainmentItems('music', [
    '천만기인쇼',
    '전설의 사내',
    '더 시즌즈',
    '불후의 명곡 전설을 노래하다',
    '전국노래자랑',
    '놀라운 토요일',
    '쇼! 음악중심',
    '스튜디오 K',
    '해피투게더 - 혼자가 아니어서 좋아',
    '놀라운 목요일',
  ]),

  // 요청한 토크 프로그램 우선
  talk: getHomeEntertainmentItems('talk', [
    '라디오스타',
    '심야괴담회',
    '탐정들의 영업비밀',
    '스모킹 건',
    '히든아이',
    '유 퀴즈 온 더 블럭',
    '주주총회',
    '프리한19',
  ]),

  // 정형돈 TV 전용 영상 카드 10개 복구
  'jung-hyung-don': jungHyungDonItems,

  // 기존 버라이어티 연결 복구
  variety: selectItems(varietyTitles).map((entry) => {
    if (entry.id === 'home-new-series-08') {
      return { ...entry, link: '/collection/home--jung-hyung-don' };
    }

    if (entry.tmdbId) {
      return { ...entry, link: `/entertainmentdetail/${entry.tmdbId}` };
    }

    const params = new URLSearchParams({ title: entry.title, kind: 'multi' });
    return { ...entry, link: `/open?${params.toString()}` };
  }),

  // 추가한 프로그램도 예능 전체보기에 포함
  'all-entertainment': categoryPages.entertainment.items,

  // homeData.js의 기존 참조는 유지
  // 중복된 #뮤직 섹션은 Home.jsx에서 출력하지 않는다.
  music: [],
};

