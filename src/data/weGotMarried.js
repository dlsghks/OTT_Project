// 우리 결혼했어요 상세페이지 데이터
// 이미지: public/images/retrov/we-got-married/
//   - hero.jpg, logo.png
//   - s{시즌}/couples/{커플id}.png      : 동그란 커플 아이콘 (150x150)
//   - s{시즌}/invitations/{커플id}.png  : 아이콘 클릭 시 보이는 청첩장 카드 (1420x780)
//   - videos/{영상id}.jpg               : 영상 카드 썸네일
// TODO: 영상 링크(videoId)는 아직 없어 null → 카드 클릭 시 재생되지 않음 (엑셀 받으면 채우기)
// TODO: 영상 제목/설명/날짜는 시안 이미지에서 읽은 임시 값 — 실제 데이터로 교체 필요

const IMG = "/images/retrov/we-got-married";

// 시즌별 커플 (아이콘 + 청첩장)
const couple = (season, id, name) => ({
  id,
  name,
  image: `${IMG}/s${season}/couples/${id}.png`,
  panelImage: `${IMG}/s${season}/invitations/${id}.png`, // 클릭 시 보이는 청첩장
});

// 영상 카드: video(id, 제목, 설명, 방영일)
// - 썸네일은 TMDB 고유 id + 회차 번호(제목의 "N화/N회/에피소드 N")로 장면 사진을 찾아 자동 표시
//   5번째 인자 videoId: 유튜브 영상 고유 ID (있으면 그 영상 썸네일·재생), 6번째 인자: 직접 넣을 이미지 경로
// - 영상은 TMDB → 유튜브 검색 순으로 찾아 재생 (src/store/useRetrovTmdbStore.js)
const video = (id, title, description, date, videoId = null, image = null) => ({
  id,
  videoId, // 유튜브 영상 고유 ID → 이 영상의 썸네일 표시 + 바로 재생
  playlistId: null,
  image,
  title,
  description,
  date,
});

export const weGotMarried = {
  title: "우리 결혼했어요",
  logo: `${IMG}/logo.png`,
  hero: `${IMG}/hero.jpg`,
  rating: "15",
  genre: "예능",
  tvFrame: "wgm", // RetroTvFrame 의 TV_FRAMES 키
  characterMode: "image", // 캐릭터 클릭 시: "quiz"(퀴즈) | "image"(이미지 카드)
  panelLabel: "청첩장",
  othersTitle: "또 다른 그 때 그 시절로~",

  // 히어로 시즌 선택 → 선택한 시즌의 재생 버튼 문구와 커플(캐릭터) 필터가 바뀜
  seasons: [
    {
      id: "season-1",
      label: "시즌 1",
      playLabel: "1화 보기",
      characters: [
        couple(1, "crownj-inyoung", "크라운제이♥인영"),
        couple(1, "hyunjoong-hwangbo", "현중♥황보"),
        couple(1, "andy-solbi", "앤디♥솔비"),
        couple(1, "hwanhee-hwayobi", "환희♥화요비"),
        couple(1, "alex-shinae", "알렉스♥신애"),
        couple(1, "hyungdon-taeyeon", "형돈♥태연"),
        couple(1, "marco-dambi", "마르코♥담비"),
        couple(1, "jinjin-siyoung", "전진♥시영"),
      ],
    },
    {
      id: "season-2",
      label: "시즌 2",
      playLabel: "1화 보기",
      characters: [
        couple(2, "yongjun-jungeum", "용준♥정음"),
        couple(2, "jaejung-yumi", "재정♥유미"),
        couple(2, "jokwon-gain", "조권♥가인"),
        couple(2, "sunho-seulhye", "선호♥슬혜"),
        couple(2, "nichkhun-victoria", "닉쿤♥빅토리아"),
        couple(2, "yonghwa-seohyun", "용화♥서현"),
      ],
    },
    {
      id: "season-3",
      label: "시즌 3",
      playLabel: "1화 보기",
      characters: [
        couple(3, "nichkhun-victoria", "닉쿤♥빅토리아"),
        couple(3, "wonjun-soyeon", "원준♥소연"),
        couple(3, "leeteuk-sora", "이특♥소라"),
        couple(3, "jangwoo-eunjung", "장우♥은정"),
        couple(3, "davi-rise", "데이비♥리세"),
        couple(3, "julien-sea", "줄리엔♥세아"),
      ],
    },
    {
      id: "season-4",
      label: "시즌 4",
      playLabel: "1화 보기",
      characters: [
        couple(4, "taemin-naeun", "태민♥나은"),
        couple(4, "jonghyun-yura", "종현♥유라"),
        couple(4, "namgung-jinyoung", "남궁민♥진영"),
        couple(4, "jaerim-soeun", "재림♥소은"),
        couple(4, "sungjae-joy", "성재♥조이"),
        couple(4, "kwanghee-sunhwa", "광희♥선화"),
        couple(4, "siyang-soyeon", "시양♥소연"),
        couple(4, "ericnam-solar", "에릭남♥솔라"),
      ],
    },
  ],

  description: [
    "‘이렇게 결혼해 살아가는구나’ 한번쯤은 고민해보는 보편적 질문, 리얼과 가상을 넘나드는 커플들의 좌충우돌 가상 결혼생활을",
    "통해, 연애와 결혼에 관한 현실적 고민의 해답을 찾아본다. 연애에 대한 공감과 결혼의 설렘을 함께...",
  ],
  cast: ["조혜련", "유세윤", "김신영", "소녀시대", "강인", "이윤지", "전진", "이시영", "솔비", "이국주", "정예성", "공명", "최민"],

  // 회차별 유튜브 영상 ID (시즌 → 회차 번호 → videoId)
  // - 시즌1(2008)은 MBC 공식(MBCentertainment "Just Married … YYYYMMDD")·회차별 업로드 중
  //   제목의 방영일(YYYYMMDD)이 TMDB 방영일과 정확히 같은 영상만 넣음 (나머지 회차는 유튜브에 해당 날짜 영상 없음)
  // - 없는 회차는 TMDB 배경 이미지 + 재생 시 유튜브 검색
  // TODO: 공식 영상(MBC 클래식 등)이 확인되면 회차 번호: "videoId" 로 추가
  youtubeIds: {
    "season-1": {
      1: "DDMMZk49mQc", // yeonwoong109 | 20080316 E01 우결 we got married season1 part 2
      2: "QoQAv8bUMVc", // yeonwoong109 | 20080323 E02 우결 we got married season1 part 4
      3: "uv--zBYvBE8", // yeonwoong109 | 20080330 E03 우결 we got married season1 part 1
      8: "jdaaTEF78X4", // MBCentertainment | Happy Time, Just Married #04, 우리 결혼했어요 20080504
      10: "KrQB7e_q6kE", // Grace Chan | [QUAINTE] 080518 - We Got Married Ep 10 Part 1 (JoongBo cuts
      12: "21IpQMqOWBQ", // 달기현 | [ENGSUB]We Got Married Jo Yeo Jeong Guest Ock Joo Hyun & Par
      15: "WFoJ6JD8hNI", // MBCentertainment | Happy Time, Just Married #05, 우리 결혼했어요 20080622
      17: "lerO7ngLQCY", // MBCentertainment | Happy Time, Just Married #06, 우리 결혼했어요 20080706
      21: "-HhsoDzDYPU", // MBCentertainment | Happy Time, Just Married #03, 우리 결혼했어요 20080803
      23: "NCQ_U2WekLY", // MBCentertainment | Happy Time, Just Married #04, 우리 결혼했어요 20080831
      33: "K_C9OrkGBMA", // MBCentertainment | Happy Time, Just Married #04, 우리 결혼했어요 20081109
      50: "d5LgftV3QjE", // MBCentertainment | Happy Time, Just Married #05, 우리 결혼했어요 20090329
    },
  },

  // 테마별 영상: 방영일이 확인된 시즌1 15개 회차의 클립 21개 (고유 videoId) → 3개 테마 × 7개
  //  - 같은 영상·같은 회차가 여러 테마에 겹치지 않음
  sections: [
    {
      id: "first-flutter",
      title: "💌 처음이라 더 설렜던 순간",
      videos: [
        video("first-e01-1", "1화 · part 2", "웨딩드레스와 턱시도 차림으로 스튜디오에 선 가상 부부, 설렘 가득한 첫 인사", "2008.03.16", "DDMMZk49mQc"),
        video("first-e01-2", "1화 · part 3", "이삿짐 상자가 가득한 신혼집, 어색함이 감도는 가상 부부의 첫 대면", "2008.03.16", "6cI3kfb45z8"),
        video("first-e01-3", "1화 · part 4", "호랑이·토끼 잠옷을 맞춰 입은 가상 부부의 엉뚱한 신혼집 첫날", "2008.03.16", "Zn-zZxuQTkQ"),
        video("first-e01-4", "1화 · part 5", "주방에 선 솔비, 제법 그럴듯한 요리 실력? 앤디·솔비 부부의 첫 식사 준비", "2008.03.16", "FUJLDImGbFc"),
        video("first-e02-1", "2화 · part 4", "침대에서 일어날 줄 모르는 남편과 깨우러 온 아내, 아침부터 티격태격", "2008.03.23", "QoQAv8bUMVc"),
        video("first-e02-2", "2화 · part 5", "“신상이 없다”는 이유로 시작된 크라운제이·서인영 부부의 신경전", "2008.03.23", "XxbUQ9bYvLA"),
        video("first-e02-3", "2화 · part 6", "커플 잠옷에 마스크팩까지, 나란히 앉은 가상 부부의 첫날 밤", "2008.03.23", "QJgWifaBz1s"),
      ],
    },
    {
      id: "newlywed-diary",
      title: "🏡 티격태격, 우리들의 신혼일기",
      videos: [
        video("diary-e03-1", "3화", "크라운제이·서인영, 앤디·솔비, 알렉스·신애의 정형돈 첫 야유회, 각 식사준비 등 이야기", "2008.03.30", "uv--zBYvBE8"),
        video("diary-e08-1", "8화", "정형돈·사오리, 앤디·솔비, 크라운제이·서인영, 알렉스·신애 가상 부부들의 신혼 이야기", "2008.05.04", "jdaaTEF78X4"),
        video("diary-e10-1", "10화", "새 커플 김현중·황보의 본격 신혼생활, 이휘재·조여정 부부의 알콩달콩 일상", "2008.05.18", "KrQB7e_q6kE"),
        video("diary-e12-1", "12화", "[우리 결혼했어요] 휘재·여정 집들이, 위해 친구 이웃, 김현중 방문, 황보·현중 집들이", "2008.06.01", "21IpQMqOWBQ"),
        video("diary-e15-1", "15화", "가상 부부들의 티격태격 신혼 일상과 특별한 미션", "2008.06.22", "WFoJ6JD8hNI"),
        video("diary-e17-1", "17화", "오늘 미션 사랑하는 남편(아내)을 위한 내조(외조) 하기, 인영·크라운제이 부부, 아픈 인영 위해", "2008.07.06", "lerO7ngLQCY"),
        video("diary-e21-1", "21화", "오늘의 미션, 그리고 두 사람의 하루", "2008.08.03", "-HhsoDzDYPU"),
      ],
    },
    {
      id: "laugh-and-tears",
      title: "🥹 웃음부터 눈물까지, 다시 보는 그 순간",
      videos: [
        video("moment-e23-1", "23화", "가상 부부들의 여름날, 함께 만들어 가는 추억", "2008.08.31", "NCQ_U2WekLY"),
        video("moment-e33-1", "33화", "새로운 커플들과 함께하는 가을의 신혼 이야기", "2008.11.09", "K_C9OrkGBMA"),
        video("moment-e42-1", "42화 · 태연♥형돈 첫 만남부터 마지막 촬영까지", "충격적인 남편의 정체부터 처제들과 함께한 웨딩촬영, 파국으로 끝난 가상 결혼까지", "2009.01.25", "M1d-BhqDYZ4"),
        video("moment-e42-2", "42화 · 태연♥형돈 첫 만남과 결혼식", "푸딩♥젤리 커플의 첫 만남과 결혼식, 소녀시대와 함께한 웨딩촬영", "2009.01.25", "SQ_a-U2b46U"),
        video("moment-e50-1", "50화", "시즌1 막바지, 가상 부부들이 함께한 시간을 돌아보며", "2009.03.29", "d5LgftV3QjE"),
        video("moment-e53-1", "53화 · 알쓰 태연 에피소드", "술에 약한 태연, 푸딩♥젤리 커플의 알콩달콩 하루", "2009.04.19", "po01_AH5Wc0"),
        video("moment-e54-1", "54화 · 태연♥형돈 우결 마지막 영상", "태연♥정형돈 커플의 마지막 이야기, 그리고 하차", "2009.04.26", "vGu885XGsf0"),
      ],
    },
  ],
};
