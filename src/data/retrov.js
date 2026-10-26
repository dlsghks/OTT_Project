import { infiniteChallengeSections } from "./infiniteChallengeVideos";
import { weGotMarried } from "./weGotMarried";
import { highKick } from "./highKick";
import { boysOverFlowers } from "./boysOverFlowers";
import { fullHouse } from "./fullHouse";
import { dadWhere } from "./dadWhere";

// 이미지 경로: public/images/retrov/ 폴더에 실제 파일을 넣어주세요.
const IMG = "/images/retrov/main";
const IMG2 = "/images/retrov/infinite-challenge";

// 순서: 레트로브 메인 디자인 순서 (동그란 필터·배너)
// image: 레트로브 메인 동그란 필터용 / thumbnail: 상세페이지 하단 "또 다른 프로그램" 사진 썸네일
export const programs = [
  {
    id: "infinite-challenge",
    title: "무한도전",
    image: `${IMG}/infinite-challenge-logo.png`,
    thumbnail: `${IMG}/infinite-challenge-thumb.jpg`,
  },
  {
    id: "high-kick",
    title: "거침없이 하이킥",
    image: `${IMG}/high-kick-logo.png`,
    thumbnail: `${IMG}/high-kick-thumb.jpg`,
  },
  {
    id: "dad-where-are-we-going",
    title: "아빠! 어디가?", 
    image: `${IMG}/dad-where-logo.png`,
    thumbnail: `${IMG}/dad-where-thumb.jpg`,
  },
  {
    id: "we-got-married",
    title: "우리 결혼했어요",
    image: `${IMG}/we-got-married-logo.png`,
    thumbnail: `${IMG}/we-got-married-thumb.jpg`,
  },
  {
    id: "boys-over-flowers",
    title: "꽃보다 남자",
    image: `${IMG}/boys-over-flowers-logo.png`,
    thumbnail: `${IMG}/boys-over-flowers-thumb.jpg`,
  },
  {
    id: "full-house",
    title: "풀하우스",
    image: `${IMG}/full-house-logo.png`,
    thumbnail: `${IMG}/full-house-thumb.jpg`,
  },
];

// 상세페이지 상단 이벤트 배너 (가운데 + 양옆 미리보기)
// title: [앞 문구, 강조 문구, 뒷 문구]
export const eventBanners  = [
  {
    id: "favorite-scene",
    label: "최애장면 선택",
    title: ["나의 ", "최애", " 장면은?!"],
    description: "잊지 못할 장면에 투표하고, 다른 팬들의 선택도 만나보세요",
    theme: "pink",
  },
  {
    id: "character-quiz",
    label: "캐릭터 퀴즈",
    title: ["", "찐팬", " 인증 퀴즈!"],
    description: "멤버를 눌러 퀴즈를 풀고 추억 점수를 확인해보세요",
    theme: "purple",
  },
  {
    id: "retro-shorts",
    label: "레트로브 쇼츠",
    title: ["그때 그 ", "명장면", " 1분 요약"],
    description: "짧게 보고 길게 웃는 레트로브 쇼츠 모아보기",
    theme: "mint",
  },
];

export const programDetails = {
  "infinite-challenge": {
    title: "무한도전",
    logo: `${IMG2}/infinite-challenge-logo.png`,
    hero: `${IMG2}/infinite-challenge-hero.png`,
    rating: "15",
    genre: "예능",
    tvFrame: "default", // RetroTvFrame 의 TV_FRAMES 키
    characterMode: "quiz", // 캐릭터 클릭 시: "quiz"(퀴즈) | "image"(이미지 카드)
    othersTitle: "또 다른 그때 그시절 프로그램보기",
    playLabel: "돈가방을 갖고 튀어라, 2화 보기",
    description: [
      "돈 가방을 갖고 튀어라 특집 금일봉 삼백만원을 차지하기 위한 여섯 남자의 액션 활극이 시작됐다.",
      "서울 시내 한복판에서 펼쳐지는 리얼 코믹 서스펜스!",
    ],
    cast: ["유재석", "박명수", "정준하", "정형돈", "노홍철", "하하"],

    // 퀴즈 데이터: src/data/characterQuizzes.js (키 = id)
    characters: [
      { id: "myungsoo", name: "명수옹", image: `${IMG2}/characters/myungsoo.png` },
      { id: "luckyguy", name: "럭키가이", image: `${IMG2}/characters/luckyguy.png` },
      { id: "doni", name: "도니", image: `${IMG2}/characters/doni.png` },
      { id: "yubujang", name: "유부장", image: `${IMG2}/characters/yubujang.png` },
      { id: "junha", name: "주나", image: `${IMG2}/characters/junha.png` },
      { id: "haha", name: "상꼬맹이", image: `${IMG2}/characters/haha.png` },
      { id: "gil", name: "길", image: `${IMG2}/characters/gil.png` },
    ],

    // 테마별 영상 8개 (src/data/infiniteChallengeVideos.js)
    sections: infiniteChallengeSections,
  },

  "we-got-married": weGotMarried,
  "high-kick": highKick,
  "boys-over-flowers": boysOverFlowers,
  "full-house": fullHouse,
  "dad-where-are-we-going": dadWhere,
};
