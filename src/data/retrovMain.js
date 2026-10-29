// 레트로브 메인 페이지 데이터 (디자인 기준: 1920px)
// 이미지: public/images/retrov/main/ (로고 -logo-w.png = 흰색 로고, -thumb.jpg = 1920x1080 배너 사진)
import { programs } from "./retrov";
import { infiniteChallengeSections } from "./infiniteChallengeVideos";

const IMG = "/images/retrov/main";

// TODO: 로그인 기능이 생기면 실제 프로필 이름으로 교체
export const userName = "웨이브";

// 프로그램별 공통 정보 (배너·랭킹 포스터에서 같이 사용)
const programInfo = {
  "infinite-challenge": { rating: "12", genre: "예능", logo: `${IMG}/infinite-challenge-logo-w.png` },
  "high-kick": { rating: "12", genre: "예능", logo: `${IMG}/high-kick-logo-w.png` },
  "dad-where-are-we-going": { rating: "12", genre: "예능", logo: `${IMG}/dad-where-logo-w.png` },
  "we-got-married": { rating: "15", genre: "예능", logo: `${IMG}/we-got-married-logo-w.png` },
  "boys-over-flowers": { rating: "15", genre: "드라마", logo: `${IMG}/boys-over-flowers-logo-w.png` },
  "full-house": { rating: "15", genre: "드라마", logo: `${IMG}/full-house-logo-w.png` },
};

const getProgram = (id) => {
  const program = programs.find((item) => item.id === id);
  return { ...program, ...programInfo[id] };
};

// 상단 메인 배너 (가운데 배너 + 양옆 미리보기)
// description: 두 줄 문구
const heroCopy = [
  ["infinite-challenge", ["없는 게 없는 무한도전 세계관", "다시 봐도 배꼽 잡는 레전드 예능"]],
  ["high-kick", ["웃음과 감동이 넘치는 유쾌한 일상", "우리 마음을 사로잡은 레전드 시트콤"]],
  ["dad-where-are-we-going", ["보기만 해도 미소 짓게 되는 아이들", "원조 육아 예능의 따뜻한 여정"]],
  ["we-got-married", ["설렘 가득한 가상 결혼 라이프", "스타들의 진짜 같은 심쿵 로맨스"]],
  ["boys-over-flowers", ["\"흰 캔버스와 바람만 있으면 어디든 가\"", "신화고에서 펼쳐지는 예측불허 스캔들"]],
  ["full-house", ["집을 사수하기 위한 계약 결혼!", "지은과 영재의 티격태격 동거 로맨스"]],
];

export const heroSlides = heroCopy.map(([id, description]) => ({
  ...getProgram(id),
  description,
}));

// 레트로브 TOP 랭킹 (포스터 = 배너 사진 + 흰색 로고)
export const rankings = [
  "infinite-challenge",
  "high-kick",
  "boys-over-flowers",
  "we-got-married",
  "full-house",
  "dad-where-are-we-going",
].map(getProgram);

// 무한도전 테마별 영상에서 n번째 영상 꺼내기
const icVideo = (sectionId, index) => {
  const section = infiniteChallengeSections.find((item) => item.id === sectionId);
  return section?.videos[index];
};

// {userName}님이 시청 중인 콘텐츠 (progress: 시청 진행률 %)
// play: { seasonId, episode } — 무한도전 외 프로그램은 누르면 TMDB 고유 id 로 해당 회차 영상 재생 (없으면 상세페이지로 이동)
export const watching = [
  { id: "watching-1", programId: "infinite-challenge", title: icVideo("office", 1)?.title, image: icVideo("office", 1)?.image, progress: 54 },
  { id: "watching-2", programId: "boys-over-flowers", title: "꽃보다 남자 3화", image: `${IMG}/boys-over-flowers-thumb.jpg`, progress: 20, play: { episode: 3 } },
  { id: "watching-3", programId: "infinite-challenge", title: icVideo("chase", 0)?.title, image: icVideo("chase", 0)?.image, progress: 82 },
  { id: "watching-4", programId: "high-kick", title: "거침없이 하이킥 12화", image: `${IMG}/high-kick-thumb.jpg`, progress: 35, play: { seasonId: "season-1", episode: 12 } },
  { id: "watching-5", programId: "full-house", title: "풀하우스 5화", image: `${IMG}/full-house-thumb.jpg`, progress: 10, play: { seasonId: "season-1", episode: 5 } },
  { id: "watching-6", programId: "infinite-challenge", title: icVideo("game", 0)?.title, image: icVideo("game", 0)?.image, progress: 100 },
];

// 레트로브 추천 콘텐츠
export const recommendations = [
  { ...icVideo("mission", 0), programId: "infinite-challenge" },
  {
    id: "recommend-high-kick",
    programId: "high-kick",
    title: "거침없이 하이킥 Season 2 : 3화",
    description: "거침없이 하이킥 Season 2 : 3화",
    image: `${IMG}/high-kick-thumb.jpg`,
    play: { seasonId: "season-2", episode: 3 },
  },
  {
    id: "recommend-dad-where",
    programId: "dad-where-are-we-going",
    title: "아빠! 어디가? Season 1 : 31화",
    description: "아빠! 어디가? Season 1 : 31화",
    image: `${IMG}/dad-where-thumb.jpg`,
    play: { seasonId: "season-1", episode: 31 },
  },
  {
    id: "recommend-we-got-married",
    programId: "we-got-married",
    title: "우리 결혼했어요 Season 4 : 240화",
    description: "우리 결혼했어요 Season 4 : 240화",
    image: `${IMG}/we-got-married-thumb.jpg`,
    play: { seasonId: "season-4", episode: 240 },
  },
  { ...icVideo("sports", 0), programId: "infinite-challenge" },
  { ...icVideo("tikitaka", 0), programId: "infinite-challenge" },
];

// 레트로브 쇼츠 모아보기 (caption: [윗줄, 파란 강조줄])
export const shorts = [
  { id: "short-1", programId: "infinite-challenge", caption: ["한순간의 표정이 만든 패착", "단번에 읽어낸 유재석"], image: icVideo("chase", 1)?.image },
  { id: "short-2", programId: "infinite-challenge", caption: ["회의 시간에 터진 웃음", "무한상사 레전드 장면"], image: icVideo("office", 2)?.image },
  { id: "short-3", programId: "infinite-challenge", caption: ["눈치 게임의 최후", "끝까지 버틴 단 한 명"], image: icVideo("game", 1)?.image },
  { id: "short-4", programId: "infinite-challenge", caption: ["도전은 계속된다", "무모해서 더 빛난 미션"], image: icVideo("mission", 1)?.image },
  { id: "short-5", programId: "infinite-challenge", caption: ["무대 위의 반전", "가요제 최고의 순간"], image: icVideo("music-festival", 0)?.image },
  { id: "short-6", programId: "infinite-challenge", caption: ["말로 하는 스포츠", "티키타카 명장면 1분 요약"], image: icVideo("tikitaka", 1)?.image },
];
