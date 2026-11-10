// 레트로브 메인 페이지 데이터 (디자인 기준: 1920px)
// 이미지: public/images/retrov/main/ (로고 -logo-w.png = 흰색 로고, -thumb.jpg = 1920x1080 배너 사진)
import { programs, programDetails } from "./retrov";
import { getTmdbTarget, getEpisodeNumber } from "./retrovTmdb";

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

// 레트로브 TOP 랭킹 (poster = 디자인 포스터 318x464, 없으면 배너 사진 + 흰색 로고 / rankImage = 순위 숫자 이미지)
export const rankings = [
  "infinite-challenge",
  "high-kick",
  "boys-over-flowers",
  "we-got-married",
  "full-house",
  "dad-where-are-we-going",
].map((id, index) => ({
  ...getProgram(id),
  poster: `${IMG}/poster/${id}.png`,
  rankImage: `${IMG}/rank/number-${index + 1}.svg`,
}));

// 레트로브 추천 콘텐츠 — 상세페이지 테마별 영상에서 프로그램마다 골라 20개
// count: 프로그램별 개수 (테마마다 1개씩 돌아가며 뽑음)
const RECOMMEND_COUNT = {
  "infinite-challenge": 5,
  "high-kick": 3,
  "dad-where-are-we-going": 3,
  "we-got-married": 3,
  "boys-over-flowers": 3,
  "full-house": 3,
};

// 테마(section)를 돌아가며 영상 n개 꺼내기 — 무한상사 1편, 추격전 1편, … 처럼 골고루
function pickVideos(sections, count) {
  const lists = sections.map((section) => section.videos ?? []).filter((videos) => videos.length);
  const picked = [];
  for (let i = 0; picked.length < count && lists.some((videos) => videos[i]); i++) {
    lists.forEach((videos) => {
      if (picked.length < count && videos[i]) picked.push(videos[i]);
    });
  }
  return picked;
}

// 영상 → 추천 카드
// - 무한도전: 엑셀 이미지 + 유튜브 id 그대로
// - 그 외: tmdb(고유 id·시즌·회차)로 장면 사진을 찾고(RetroV.jsx), source 로 영상을 찾아 재생
function toRecommendation(programId, video) {
  const program = getProgram(programId);
  const detail = programDetails[programId];
  const target = getTmdbTarget(programId, detail.seasons?.[0]?.id);
  const episode = target ? getEpisodeNumber(video) : null;
  const query = target && (episode ? `${target.searchTitle} ${episode}회` : `${target.searchTitle} ${video.title}`);

  return {
    id: `recommend-${programId}-${video.id}`,
    programId,
    title: programId === "infinite-challenge" ? video.title : `${program.title} ${video.title}`,
    description: video.description,
    image: video.image ?? null,
    fallbackImage: program.thumbnail,
    videoId: video.videoId ?? (episode && detail.youtubeIds?.[detail.seasons?.[0]?.id]?.[episode]) ?? null,
    mbcUrl: video.mbcUrl,
    tmdb: target && episode ? { id: target.id, season: target.season, episode } : null,
    source: target ? { tmdbId: target.id, season: target.season, episode, query } : null,
  };
}

// 테마가 달라도 같은 회차(제목)는 한 번만
const recommendGroups = Object.entries(RECOMMEND_COUNT).map(([programId, count]) =>
  pickVideos(programDetails[programId]?.sections ?? [], count * 3)
    .map((video) => toRecommendation(programId, video))
    .filter((item, index, list) => list.findIndex((other) => other.title === item.title) === index)
    .slice(0, count)
);

// 프로그램이 섞이도록 한 개씩 번갈아 배치
export const recommendations = pickVideos(
  recommendGroups.map((videos) => ({ videos })),
  recommendGroups.reduce((sum, videos) => sum + videos.length, 0)
);

// {userName}님이 시청 중인 콘텐츠 — 상세페이지 테마별 영상에서 프로그램마다 2개씩 12개 (추천 콘텐츠와 겹치지 않게)
// 추천 콘텐츠와 같은 카드 데이터라 누르면 바로 해당 영상 재생 / progress: 시청 진행률 %
const WATCHING_COUNT = 2;
const WATCHING_PROGRESS = [54, 20, 82, 35, 10, 100, 66, 45, 28, 90, 15, 72];
const recommendIds = new Set(recommendations.map((item) => item.id));

const watchingGroups = Object.keys(RECOMMEND_COUNT).map((programId) =>
  pickVideos(programDetails[programId]?.sections ?? [], 30)
    .map((video) => toRecommendation(programId, video))
    .filter((item, index, list) => list.findIndex((other) => other.title === item.title) === index)
    .filter((item) => !recommendIds.has(item.id))
    .slice(0, WATCHING_COUNT)
);

export const watching = pickVideos(
  watchingGroups.map((videos) => ({ videos })),
  watchingGroups.reduce((sum, videos) => sum + videos.length, 0)
).map((item, index) => ({
  ...item,
  id: item.id.replace("recommend-", "watching-"),
  progress: WATCHING_PROGRESS[index % WATCHING_PROGRESS.length],
}));

// 레트로브 쇼츠 모아보기 — wavve 웨이브 유튜브 채널 쇼츠 (프로그램별 2개)
// videoId: 유튜브 쇼츠 ID (누르면 바로 재생) / caption: [윗줄, 파란 강조줄] / title: 유튜브 원래 제목
// 썸네일은 유튜브 쇼츠 세로 이미지 (i.ytimg.com/oar2.jpg, API 사용량 없음)
const short = (videoId, programId, caption, title) => ({
  id: `short-${videoId}`,
  videoId,
  programId,
  caption,
  title,
  image: `https://i.ytimg.com/vi/${videoId}/oar2.jpg`, // 쇼츠 세로 썸네일
});

export const shorts = [
  short("fp-1_FB7MAo", "infinite-challenge", ["무한도전 레전드 감성", "파도처럼 부서진 내 맘"], "[무한도전] 파도처럼 부서진 내 맘"),
  short("EGtuOyzKqcQ", "high-kick", ["거침없이 하이킥", "불꽃 카리스마 민호"], "♨불꽃카리스마 민호♨ | 거침없이 하이킥"),
  short("GxFT_ihiZuI", "boys-over-flowers", ["착한 척은 어려워", "차카니 백 개 먹고 온 구준표"], "차카니 백 개 먹고 온 구준표"),
  short("sbUtM-VmtEg", "we-got-married", ["풋풋함에 설렘 한 스푼", "용서커플"], "풋풋+설렘=용서커플♥️"),
  short("Sbe6nnDzlLs", "dad-where-are-we-going", ["세 살이 어려운", "셋째 다윤이"], "세 살이 어려운 셋째 다윤이 | 아빠 어디가"),
  short("aqxNPGFXc3Q", "full-house", ["송혜교를 위한 노래", "비의 곰 세 마리"], "레전드인 송혜교를 이을 큐티한 비의 곰 세 마리🐻"),
  short("9xcqEQplgEg", "infinite-challenge", ["포즈만 봐도 자동 반응", "레전드는 영원하다"], "레전드는 영원하다🎬📺 무한도전 포즈 보자마자 자동 반응하는 멤버들"),
  short("lUlaYeEULTE", "high-kick", ["러블리함 만땅!", "하이킥 서민정 코어"], "러블리함 만땅! 하이킥 서민정 코어♥️"),
  short("HERZKt_dRnY", "boys-over-flowers", ["재벌 2세의 진심", "계란말이에 진심인 구준표"], "계란말이에 진심인 구준표"),
  short("bS1dbHVvQgc", "we-got-married", ["우리 사랑하게 됐어요", "아담부부"], "아담부부 우리 사랑하게 됐어요🤵👰"),
  short("Q9TEV6JF3S0", "dad-where-are-we-going", ["귀여움 과다", "윤후 사랑의 총알"], "귀여움 과다 윤후 사랑의 총알💘"),
  short("HWtypOqx0rM", "full-house", ["4K로 다시 보는", "송혜교 리즈 시절"], "4K로 보는 송혜교 리즈 시절 대공개! 💕"),
];
