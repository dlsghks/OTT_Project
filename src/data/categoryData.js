// 예능·드라마·영화·시사교양·애니·해외시리즈 페이지 데이터
// - filters: 장르 필터 버튼 (첫 번째는 "전체")
// - sections: 테마별 섹션 (type: rank | weekday | poster | collection)
// - 전체 보기도 시안처럼 가로 슬라이드(poster), 장르 필터 결과만 그리드(CollectionRow)
// - 포스터 이미지는 poster 에 경로를 넣으면 표시되고, 없으면 제목 카드로 표시됩니다.

export const weekdays = [
  { id: 'mon', label: '월' },
  { id: 'tue', label: '화' },
  { id: 'wed', label: '수' },
  { id: 'thu', label: '목' },
  { id: 'fri', label: '금' },
  { id: 'sat', label: '토' },
  { id: 'sun', label: '일' },
];

// id, 제목, 장르, 방영 요일, 배지, 오리지널 여부
const program = (id, title, genre, days = [], badge = '', isOriginal = false) => ({
  id,
  title,
  genre,
  days,
  poster: '',
  badge,
  isOriginal,
});

// 섹션별 콘텐츠 고르기
const pick = (items, ids) => ids.map((id) => items.find((item) => item.id === id)).filter(Boolean);
const byGenre = (items, genre) => items.filter((item) => item.genre === genre);

/* =========================
   예능
========================= */
const entertainmentItems = [
  program('ent-01', '런닝맨', 'variety', ['sun'], '', false),
  program('ent-02', '나 혼자 산다', 'reality', ['fri']),
  program('ent-03', '놀면 뭐하니?', 'variety', ['sat']),
  program('ent-04', '전지적 참견 시점', 'reality', ['sat']),
  program('ent-05', '1박 2일 시즌4', 'travel', ['sun']),
  program('ent-06', '미운 우리 새끼', 'family', ['sun']),
  program('ent-07', '라디오스타', 'talk', ['wed']),
  program('ent-08', '불후의 명곡', 'music', ['sat']),
  program('ent-09', '복면가왕', 'music', ['sun']),
  program('ent-10', '살림하는 남자들', 'life', ['wed']),
  program('ent-11', '나는 SOLO', 'reality', ['wed']),
  program('ent-12', '신랑수업', 'reality', ['wed']),
  program('ent-13', '강철부대W', 'survival', ['tue'], '새로운'),
  program('ent-14', '피의 게임 3', 'survival', [], '', true),
  program('ent-15', '좀비버스: 뉴 블러드', 'survival', [], '', true),
  program('ent-16', '여행을 대하는 자세', 'travel', [], '새로운', true),
  program('ent-17', '태어난 김에 세계일주', 'travel', ['sun']),
  program('ent-18', '텐트 밖은 유럽', 'travel', ['thu']),
  program('ent-19', '현지에서 먹힐까?', 'travel', ['tue']),
  program('ent-20', '더 시즌즈', 'music', ['fri']),
  program('ent-21', '싱어게인', 'music', ['mon']),
  program('ent-22', '비긴어게인', 'music', ['thu']),
  program('ent-23', '유 퀴즈 온 더 블럭', 'talk', ['wed']),
  program('ent-24', '아는 형님', 'talk', ['sat']),
  program('ent-25', '동상이몽2', 'family', ['mon']),
  program('ent-26', '슈퍼맨이 돌아왔다', 'family', ['wed']),
  program('ent-27', '동물농장', 'pet', ['sun']),
  program('ent-28', '개는 훌륭하다', 'pet', ['mon']),
  program('ent-29', '골 때리는 그녀들', 'sports', ['wed']),
  program('ent-30', '최강야구', 'sports', ['mon']),
  program('ent-31', '나는 솔로 라이브', 'dating', ['thu']),
  program('ent-32', '연예대상', 'award'),
];

/* =========================
   드라마
========================= */
const dramaItems = [
  program('dra-01', '모범택시 3', 'action', ['fri', 'sat']),
  program('dra-02', '굿파트너', 'law', ['fri', 'sat']),
  program('dra-03', '수사반장 1958', 'thriller', ['fri', 'sat']),
  program('dra-04', '협상의 기술', 'drama', ['sat', 'sun']),
  program('dra-05', '귀궁', 'fantasy', ['fri', 'sat']),
  program('dra-06', '옥씨부인전', 'historical', ['sat', 'sun']),
  program('dra-07', '감사합니다', 'drama', ['sat', 'sun']),
  program('dra-08', '보물섬', 'thriller', ['fri', 'sat']),
  program('dra-09', '우리영화', 'romance', ['fri', 'sat']),
  program('dra-10', '나의 완벽한 비서', 'romance', ['fri', 'sat']),
  program('dra-11', '열혈사제 2', 'comedy', ['fri', 'sat']),
  program('dra-12', '지금 거신 전화는', 'romance', ['fri', 'sat']),
  program('dra-13', '메리 킬즈 피플', 'thriller', ['fri', 'sat'], '새로운'),
  program('dra-14', '약한영웅 Class 1', 'youth', [], '', true),
  program('dra-15', '박하경 여행기', 'drama', [], '', true),
  program('dra-16', '거래', 'thriller', [], '', true),
  program('dra-17', '스위트홈', 'fantasy'),
  program('dra-18', '빛나라 은수', 'daily', ['mon', 'tue', 'wed', 'thu', 'fri']),
  program('dra-19', '친절한 선주씨', 'daily', ['mon', 'tue', 'wed', 'thu', 'fri']),
  program('dra-20', '독수리 5형제를 부탁해!', 'family', ['sat', 'sun']),
  program('dra-21', '낭만닥터 김사부 3', 'medical', ['fri', 'sat']),
  program('dra-22', '슬기로운 의사생활', 'medical', ['thu']),
  program('dra-23', '연인', 'historical', ['fri', 'sat']),
  program('dra-24', '오늘도 사랑스럽개', 'romance', ['wed', 'thu']),
  program('dra-25', '무빙', 'action'),
  program('dra-26', '닥터 차정숙', 'medical', ['sat', 'sun']),
  program('dra-27', '하이퍼나이프', 'medical', ['wed']),
  program('dra-28', '소년시대', 'comedy'),
];

/* =========================
   영화
========================= */
const movieItems = [
  program('mov-01', '범죄도시 4', 'action', [], '개별구매'),
  program('mov-02', '서울의 봄', 'drama'),
  program('mov-03', '파묘', 'horror', [], '개별구매'),
  program('mov-04', '베테랑 2', 'action', [], '개별구매'),
  program('mov-05', '핸섬가이즈', 'comedy'),
  program('mov-06', '탈주', 'thriller'),
  program('mov-07', '파일럿', 'comedy', [], '새로운'),
  program('mov-08', '외계+인 2부', 'sf'),
  program('mov-09', '콘크리트 유토피아', 'sf'),
  program('mov-10', '헤어질 결심', 'romance'),
  program('mov-11', '올빼미', 'thriller'),
  program('mov-12', '밀수', 'action'),
  program('mov-13', '30일', 'romance'),
  program('mov-14', '잠', 'horror'),
  program('mov-15', '노량: 죽음의 바다', 'drama', [], '개별구매'),
  program('mov-16', '스즈메의 문단속', 'animation'),
  program('mov-17', '엘리멘탈', 'animation'),
  program('mov-18', '건국전쟁', 'documentary'),
  program('mov-19', '극한직업', 'comedy'),
  program('mov-20', '기생충', 'drama'),
  program('mov-21', '곤지암', 'horror'),
  program('mov-22', '너의 결혼식', 'romance'),
  program('mov-23', '인사이드 아웃 2', 'animation', [], '개별구매'),
  program('mov-24', '마당을 나온 암탉', 'family'),
];

/* =========================
   시사교양
========================= */
const currentAffairsItems = [
  program('cur-01', '그것이 알고 싶다', 'current', ['sat']),
  program('cur-02', 'PD수첩', 'current', ['tue']),
  program('cur-03', '추적 60분', 'current', ['fri']),
  program('cur-04', '시사기획 창', 'current', ['tue']),
  program('cur-05', '생활의 달인', 'culture', ['mon']),
  program('cur-06', '세상에 이런 일이', 'culture', ['thu']),
  program('cur-07', '꼬리에 꼬리를 무는 그날 이야기', 'history', ['thu']),
  program('cur-08', '선을 넘는 녀석들', 'history', ['sun']),
  program('cur-09', '동물의 왕국', 'nature', ['sat']),
  program('cur-10', 'KBS 스페셜', 'documentary', ['thu']),
  program('cur-11', 'MBC 스페셜', 'documentary', ['mon']),
  program('cur-12', '다큐 인사이트', 'documentary', ['thu'], '새로운'),
  program('cur-13', '걸어서 세계속으로', 'travel', ['sat']),
  program('cur-14', '세계테마기행', 'travel', ['mon', 'tue', 'wed', 'thu']),
  program('cur-15', '한국인의 밥상', 'food', ['thu']),
  program('cur-16', '생로병사의 비밀', 'health', ['wed']),
  program('cur-17', '귀하신 몸', 'health', ['sun']),
  program('cur-18', '극한직업 EBS', 'culture', ['wed']),
  program('cur-19', '나는 자연인이다', 'nature', ['wed']),
  program('cur-20', '역사저널 그날', 'history', ['tue']),
  program('cur-21', '과학하고 앉아있네', 'science', [], '', true),
  program('cur-22', '돈 되는 경제', 'economy', ['fri']),
];

/* =========================
   애니
========================= */
const animationItems = [
  program('ani-01', '명탐정 코난', 'japan', ['sat']),
  program('ani-02', '짱구는 못말려', 'kids', ['mon', 'tue', 'wed', 'thu', 'fri']),
  program('ani-03', '원피스', 'japan', ['sun']),
  program('ani-04', '나 혼자만 레벨업', 'action', ['sat'], '새로운'),
  program('ani-05', '귀멸의 칼날', 'action', ['sun']),
  program('ani-06', '주술회전', 'action', ['fri']),
  program('ani-07', '하이큐!!', 'sports', ['sat']),
  program('ani-08', '스파이 패밀리', 'japan', ['sat']),
  program('ani-09', '뽀롱뽀롱 뽀로로', 'kids', ['mon', 'wed', 'fri']),
  program('ani-10', '신비아파트', 'kids', ['tue', 'thu']),
  program('ani-11', '캐치! 티니핑', 'kids', ['wed']),
  program('ani-12', '안녕 자두야', 'korea', ['mon']),
  program('ani-13', '검정고무신', 'korea', ['thu']),
  program('ani-14', '장송의 프리렌', 'fantasy', ['fri']),
  program('ani-15', '전생했더니 슬라임이었던 건에 대하여', 'fantasy', ['tue']),
  program('ani-16', '약사의 혼잣말', 'romance', ['sat']),
  program('ani-17', '최애의 아이', 'school', ['wed']),
  program('ani-18', '블루 록', 'sports', ['sat']),
  program('ani-19', '극장판 짱구는 못말려', 'theater'),
  program('ani-20', '너의 이름은.', 'theater'),
  program('ani-21', '슬램덩크', 'sports'),
  program('ani-22', '진격의 거인', 'action'),
];

/* =========================
   해외시리즈
========================= */
const globalItems = [
  program('glo-01', '하우스 오브 드래곤', 'us', ['mon']),
  program('glo-02', '왕좌의 게임', 'us'),
  program('glo-03', '더 라스트 오브 어스', 'us', ['mon']),
  program('glo-04', '석세션', 'us'),
  program('glo-05', '화이트 로투스', 'us', ['mon'], '새로운'),
  program('glo-06', '유포리아', 'us'),
  program('glo-07', '셜록', 'uk'),
  program('glo-08', '닥터 후', 'uk', ['sat']),
  program('glo-09', '피키 블라인더스', 'uk'),
  program('glo-10', '경여년', 'china', ['tue', 'wed']),
  program('glo-11', '장상사', 'china', ['thu']),
  program('glo-12', '삼체', 'china'),
  program('glo-13', '고독한 미식가', 'japan', ['fri']),
  program('glo-14', '사랑은 계속될 거야 어디까지나', 'japan'),
  program('glo-15', '상견니', 'taiwan'),
  program('glo-16', '그 시절, 우리가 좋아했던 소녀', 'taiwan'),
  program('glo-17', '트루 디텍티브', 'crime', ['mon']),
  program('glo-18', '더 펭귄', 'crime'),
  program('glo-19', '웨스트월드', 'sf'),
  program('glo-20', '체르노빌', 'thriller'),
  program('glo-21', '빅뱅 이론', 'comedy'),
  program('glo-22', '프렌즈', 'comedy'),
];

// 요일별 섹션이 들어가는 페이지는 weekday 섹션을 포함
export const categoryPages = {
  entertainment: {
    name: '예능',
    heroItems: [
      { id: 'ent-hero-1', title: '런닝맨', subtitle: '일요일 저녁, 웃음 레이스는 계속된다', image: '', link: '/programdetail/ent-01' },
      { id: 'ent-hero-2', title: '피의 게임 3', subtitle: '웨이브 오리지널 서바이벌', image: '', link: '/programdetail/ent-14' },
      { id: 'ent-hero-3', title: '여행을 대하는 자세', subtitle: '지금 떠나고 싶은 여행 예능', image: '', link: '/programdetail/ent-16' },
    ],
    filters: [
      { id: 'all', label: '예능전체' },
      { id: 'original', label: '오리지널' },
      { id: 'family', label: '가족' },
      { id: 'etc', label: '기타' },
      { id: 'life', label: '라이프' },
      { id: 'reality', label: '리얼리티' },
      { id: 'music', label: '뮤직' },
      { id: 'pet', label: '반려동물' },
      { id: 'variety', label: '버라이어티' },
      { id: 'dating', label: '연애' },
      { id: 'survival', label: '서바이벌' },
      { id: 'sports', label: '스포츠' },
      { id: 'award', label: '시상식/행사' },
      { id: 'travel', label: '여행' },
      { id: 'talk', label: '토크' },
    ],
    items: entertainmentItems,
    sections: [
      { id: 'top', type: 'rank', title: '예능 TOP 20', items: entertainmentItems.slice(0, 20) },
      { id: 'weekday', type: 'weekday', title: '요일별 콘텐츠', items: entertainmentItems },
      { id: 'travel', type: 'poster', title: '해외로 떠나는 여행 예능', items: byGenre(entertainmentItems, 'travel') },
      { id: 'music', type: 'poster', title: '걱정은 잠시 잊게 만드는 음악 예능', items: byGenre(entertainmentItems, 'music') },
      { id: 'only', type: 'poster', title: '독점 예능', items: entertainmentItems.filter((item) => item.isOriginal || item.badge) },
      { id: 'tag-variety', type: 'poster', title: '# 버라이어티', items: byGenre(entertainmentItems, 'variety').concat(pick(entertainmentItems, ['ent-05', 'ent-17'])) },
      { id: 'tag-reality', type: 'poster', title: '# 리얼리티', items: byGenre(entertainmentItems, 'reality') },
      { id: 'tag-talk', type: 'poster', title: '# 토크', items: byGenre(entertainmentItems, 'talk') },
      { id: 'tag-music', type: 'poster', title: '# 음악', items: byGenre(entertainmentItems, 'music') },
      { id: 'all', type: 'poster', title: '예능 전체 보기', items: entertainmentItems },
    ],
  },

  drama: {
    name: '드라마',
    heroItems: [
      { id: 'dra-hero-1', title: '모범택시 3', subtitle: '무지개 운수가 돌아왔다', image: '', link: '/programdetail/dra-01' },
      { id: 'dra-hero-2', title: '약한영웅 Class 1', subtitle: '웨이브 오리지널 드라마', image: '', link: '/programdetail/dra-14' },
      { id: 'dra-hero-3', title: '메리 킬즈 피플', subtitle: '새로 공개된 금토 드라마', image: '', link: '/programdetail/dra-13' },
    ],
    filters: [
      { id: 'all', label: '드라마전체' },
      { id: 'original', label: '오리지널' },
      { id: 'romance', label: '로맨스' },
      { id: 'comedy', label: '코미디' },
      { id: 'thriller', label: '스릴러' },
      { id: 'action', label: '액션' },
      { id: 'fantasy', label: '판타지' },
      { id: 'historical', label: '사극' },
      { id: 'family', label: '가족' },
      { id: 'medical', label: '메디컬' },
      { id: 'law', label: '법정' },
      { id: 'youth', label: '청춘' },
      { id: 'daily', label: '일일' },
      { id: 'drama', label: '휴먼' },
    ],
    items: dramaItems,
    sections: [
      { id: 'top', type: 'rank', title: '드라마 TOP 20', items: dramaItems.slice(0, 20) },
      { id: 'weekday', type: 'weekday', title: '요일별 콘텐츠', items: dramaItems },
      { id: 'only', type: 'poster', title: '웨이브에서만 볼 수 있는 독점 드라마', items: dramaItems.filter((item) => item.isOriginal || item.badge) },
      { id: 'thrill', type: 'poster', title: '숨 막히는 긴장감, 스릴러 드라마', items: byGenre(dramaItems, 'thriller').concat(byGenre(dramaItems, 'action')) },
      { id: 'love', type: 'poster', title: '설렘 가득 로맨스 드라마', items: byGenre(dramaItems, 'romance') },
      { id: 'tag-medical', type: 'poster', title: '# 메디컬', items: byGenre(dramaItems, 'medical') },
      { id: 'tag-historical', type: 'poster', title: '# 사극', items: byGenre(dramaItems, 'historical').concat(byGenre(dramaItems, 'fantasy')) },
      { id: 'tag-daily', type: 'poster', title: '# 일일·주말', items: byGenre(dramaItems, 'daily').concat(byGenre(dramaItems, 'family')) },
      { id: 'all', type: 'poster', title: '드라마 전체 보기', items: dramaItems },
    ],
  },

  movie: {
    name: '영화',
    heroItems: [
      { id: 'mov-hero-1', title: '범죄도시 4', subtitle: '지금 바로 구매하고 감상하세요', image: '', link: '/programdetail/mov-01' },
      { id: 'mov-hero-2', title: '서울의 봄', subtitle: '1979년 12월 12일, 그날 밤', image: '', link: '/programdetail/mov-02' },
      { id: 'mov-hero-3', title: '파일럿', subtitle: '새로 들어온 코미디 영화', image: '', link: '/programdetail/mov-07' },
    ],
    filters: [
      { id: 'all', label: '영화전체' },
      { id: 'purchase', label: '개별구매' },
      { id: 'action', label: '액션' },
      { id: 'comedy', label: '코미디' },
      { id: 'drama', label: '드라마' },
      { id: 'romance', label: '로맨스' },
      { id: 'thriller', label: '스릴러' },
      { id: 'horror', label: '공포' },
      { id: 'sf', label: 'SF/판타지' },
      { id: 'animation', label: '애니메이션' },
      { id: 'family', label: '가족' },
      { id: 'documentary', label: '다큐멘터리' },
    ],
    items: movieItems,
    sections: [
      { id: 'top', type: 'rank', title: '영화 TOP 20', items: movieItems.slice(0, 20) },
      { id: 'purchase', type: 'poster', title: '극장 화제작, 지금 집에서', items: movieItems.filter((item) => item.badge === '개별구매') },
      { id: 'action', type: 'poster', title: '스트레스 날리는 액션 영화', items: byGenre(movieItems, 'action').concat(byGenre(movieItems, 'thriller')) },
      { id: 'comedy', type: 'poster', title: '부담 없이 웃고 싶을 때', items: byGenre(movieItems, 'comedy') },
      { id: 'tag-romance', type: 'poster', title: '# 로맨스', items: byGenre(movieItems, 'romance') },
      { id: 'tag-horror', type: 'poster', title: '# 공포', items: byGenre(movieItems, 'horror') },
      { id: 'tag-animation', type: 'poster', title: '# 애니메이션', items: byGenre(movieItems, 'animation').concat(byGenre(movieItems, 'family')) },
      { id: 'all', type: 'poster', title: '영화 전체 보기', items: movieItems },
    ],
  },

  currentaffairs: {
    name: '시사교양',
    heroItems: [
      { id: 'cur-hero-1', title: '그것이 알고 싶다', subtitle: '진실을 향한 끈질긴 추적', image: '', link: '/programdetail/cur-01' },
      { id: 'cur-hero-2', title: '다큐 인사이트', subtitle: '세상을 보는 새로운 시선', image: '', link: '/programdetail/cur-12' },
      { id: 'cur-hero-3', title: '걸어서 세계속으로', subtitle: '화면으로 떠나는 세계 여행', image: '', link: '/programdetail/cur-13' },
    ],
    filters: [
      { id: 'all', label: '시사교양전체' },
      { id: 'current', label: '시사' },
      { id: 'documentary', label: '다큐' },
      { id: 'culture', label: '교양' },
      { id: 'history', label: '역사' },
      { id: 'nature', label: '자연' },
      { id: 'travel', label: '여행' },
      { id: 'food', label: '음식' },
      { id: 'health', label: '건강' },
      { id: 'economy', label: '경제' },
      { id: 'science', label: '과학' },
    ],
    items: currentAffairsItems,
    sections: [
      { id: 'top', type: 'rank', title: '시사교양 TOP 20', items: currentAffairsItems.slice(0, 20) },
      { id: 'weekday', type: 'weekday', title: '요일별 콘텐츠', items: currentAffairsItems },
      { id: 'current', type: 'poster', title: '사건의 진실을 파헤치는 시사 프로그램', items: byGenre(currentAffairsItems, 'current') },
      { id: 'history', type: 'poster', title: '알고 보면 더 재미있는 역사 이야기', items: byGenre(currentAffairsItems, 'history') },
      { id: 'tag-documentary', type: 'poster', title: '# 다큐멘터리', items: byGenre(currentAffairsItems, 'documentary').concat(byGenre(currentAffairsItems, 'nature')) },
      { id: 'tag-travel', type: 'poster', title: '# 여행·음식', items: byGenre(currentAffairsItems, 'travel').concat(byGenre(currentAffairsItems, 'food')) },
      { id: 'tag-health', type: 'poster', title: '# 건강', items: byGenre(currentAffairsItems, 'health') },
      { id: 'all', type: 'poster', title: '시사교양 전체 보기', items: currentAffairsItems },
    ],
  },

  animation: {
    name: '애니',
    heroItems: [
      { id: 'ani-hero-1', title: '나 혼자만 레벨업', subtitle: '최약체 헌터의 성장 스토리', image: '', link: '/programdetail/ani-04' },
      { id: 'ani-hero-2', title: '명탐정 코난', subtitle: '진실은 언제나 하나!', image: '', link: '/programdetail/ani-01' },
      { id: 'ani-hero-3', title: '캐치! 티니핑', subtitle: '아이와 함께 보는 키즈 애니', image: '', link: '/programdetail/ani-11' },
    ],
    filters: [
      { id: 'all', label: '애니전체' },
      { id: 'kids', label: '키즈' },
      { id: 'japan', label: '일본' },
      { id: 'korea', label: '국내' },
      { id: 'action', label: '액션' },
      { id: 'fantasy', label: '판타지' },
      { id: 'romance', label: '로맨스' },
      { id: 'school', label: '학원' },
      { id: 'sports', label: '스포츠' },
      { id: 'theater', label: '극장판' },
    ],
    items: animationItems,
    sections: [
      { id: 'top', type: 'rank', title: '애니 TOP 20', items: animationItems.slice(0, 20) },
      { id: 'weekday', type: 'weekday', title: '요일별 콘텐츠', items: animationItems },
      { id: 'action', type: 'poster', title: '손에 땀을 쥐는 액션 애니', items: byGenre(animationItems, 'action') },
      { id: 'kids', type: 'poster', title: '우리 아이와 함께 보는 키즈 애니', items: byGenre(animationItems, 'kids').concat(byGenre(animationItems, 'korea')) },
      { id: 'tag-fantasy', type: 'poster', title: '# 판타지', items: byGenre(animationItems, 'fantasy').concat(byGenre(animationItems, 'romance')) },
      { id: 'tag-sports', type: 'poster', title: '# 스포츠', items: byGenre(animationItems, 'sports') },
      { id: 'tag-theater', type: 'poster', title: '# 극장판', items: byGenre(animationItems, 'theater') },
      { id: 'all', type: 'poster', title: '애니 전체 보기', items: animationItems },
    ],
  },

  global: {
    name: '해외시리즈',
    heroItems: [
      { id: 'glo-hero-1', title: '하우스 오브 드래곤', subtitle: 'HBO 오리지널 시리즈', image: '', link: '/programdetail/glo-01' },
      { id: 'glo-hero-2', title: '화이트 로투스', subtitle: '새 시즌 공개', image: '', link: '/programdetail/glo-05' },
      { id: 'glo-hero-3', title: '경여년', subtitle: '화제의 중국 드라마', image: '', link: '/programdetail/glo-10' },
    ],
    filters: [
      { id: 'all', label: '해외시리즈전체' },
      { id: 'us', label: '미국' },
      { id: 'uk', label: '영국' },
      { id: 'china', label: '중국' },
      { id: 'japan', label: '일본' },
      { id: 'taiwan', label: '대만' },
      { id: 'crime', label: '범죄' },
      { id: 'thriller', label: '스릴러' },
      { id: 'sf', label: 'SF' },
      { id: 'comedy', label: '시트콤' },
    ],
    items: globalItems,
    sections: [
      { id: 'top', type: 'rank', title: '해외시리즈 TOP 20', items: globalItems.slice(0, 20) },
      { id: 'weekday', type: 'weekday', title: '요일별 콘텐츠', items: globalItems },
      { id: 'us', type: 'poster', title: '전 세계가 열광한 미국 시리즈', items: byGenre(globalItems, 'us') },
      { id: 'asia', type: 'poster', title: '정주행 각! 아시아 드라마', items: byGenre(globalItems, 'china').concat(byGenre(globalItems, 'japan'), byGenre(globalItems, 'taiwan')) },
      { id: 'tag-uk', type: 'poster', title: '# 영국', items: byGenre(globalItems, 'uk') },
      { id: 'tag-crime', type: 'poster', title: '# 범죄·스릴러', items: byGenre(globalItems, 'crime').concat(byGenre(globalItems, 'thriller'), byGenre(globalItems, 'sf')) },
      { id: 'tag-comedy', type: 'poster', title: '# 시트콤', items: byGenre(globalItems, 'comedy') },
      { id: 'all', type: 'poster', title: '해외시리즈 전체 보기', items: globalItems },
    ],
  },
};

// 필터 버튼에 맞는 콘텐츠 (all 은 전체, original / purchase 는 배지 기준)
export const filterItems = (items, filterId) => {
  if (filterId === 'all') return items;
  if (filterId === 'original') return items.filter((item) => item.isOriginal);
  if (filterId === 'purchase') return items.filter((item) => item.badge === '개별구매');
  if (filterId === 'etc') return items.filter((item) => !item.genre || item.genre === 'etc');
  return items.filter((item) => item.genre === filterId);
};
