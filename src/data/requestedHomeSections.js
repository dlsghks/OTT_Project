import { withContent } from './contentCatalog';

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

const jungHyungDonItems = jungVideoData.map((video, index) => {
  const number = index + 1;
  const filename = number === 10
    ? 'jung010.jpg'
    : `jung${String(number).padStart(2, '0')}.jpg`;

  return {
    id: `jung-hyung-don-${number}`,
    title: video.title,
    updatedAt: video.updatedAt,
    kind: 'series',
    image: `/images/home/section/jung/${filename}`,
    badge: '',
    isOriginal: false,
  };
});



export const homeContentBySection = {
  travel: selectItems(['지구마불 세계여행3']),

  'music-entertainment': selectItems(['동네스타 K3', '퀸덤 2']),

  // 정형돈의 제목없음 TV 전용 썸네일 10개
  'jung-hyung-don': jungHyungDonItems,

  variety: selectItems(varietyTitles),

  talk: selectItems([
    '더 커뮤니티 2: 보이지 않는 손',
    '포식자들',
    '동네스타 K3',
    '정형돈의 제목없음 TV'
  ]),

  music: selectItems(['동네스타 K3', '퀸덤 2']),

  'all-entertainment': selectItems(varietyTitles),
};

