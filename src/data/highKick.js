// 거침없이 하이킥 상세페이지 데이터
// 이미지: public/images/retrov/high-kick/
//   - hero.jpg, logo.png
//   - s{시즌}/characters/{캐릭터id}.png  : 동그란 캐릭터 아이콘 (150x150)
//   - s{시즌}/panels/{캐릭터id}.png      : 아이콘 클릭 시 보이는 명대사 카드 (1420x780)
//   - videos/{영상id}.jpg                : 영상 카드 썸네일
// TODO: 시즌 2·3 캐릭터, 캐릭터·카드 이미지 받으면 채우기
// TODO: 영상 링크(videoId) 없음 → 카드 클릭 시 재생되지 않음 (엑셀 받으면 채우기)
// TODO: 영상 제목/설명/날짜는 시안 이미지에서 읽은 임시 값 — 실제 데이터로 교체 필요

const IMG = "/images/retrov/high-kick";

const character = (season, id, name) => ({
  id,
  name,
  image: `${IMG}/s${season}/characters/${id}.png`,
  panelImage: `${IMG}/s${season}/panels/${id}.png`,
});

const video = (id, title, description, date) => ({
  id,
  videoId: null,
  playlistId: null,
  image: `${IMG}/videos/${id}.jpg`,
  title,
  description,
  date,
});

export const highKick = {
  title: "거침없이 하이킥",
  logo: `${IMG}/logo.png`,
  hero: `${IMG}/hero.jpg`,
  rating: "12",
  genre: "드라마",
  tvFrame: "high-kick",
  characterMode: "image",
  panelLabel: "명대사 카드",
  pageBackground: "linear-gradient(180deg, #000 0%, #000 900px, #0d1e33 1300px, #060d17 100%)",
  othersTitle: "또 다른 그때 그 시절로~",

  // 시즌 선택 → 재생 버튼 문구와 캐릭터 필터가 바뀜
  seasons: [
    {
      id: "season-1",
      label: "거침없이 하이킥!",
      playLabel: "1화 보기",
      characters: [
        character(1, "leesoonjae", "이순재"),
        character(1, "namoonhee", "나문희"),
        character(1, "parkhaemi", "박해미"),
        character(1, "leejunha", "이준하"),
        character(1, "leeminho", "이민호"),
        character(1, "leeyoonho", "이윤호"),
        character(1, "leeminyong", "이민용"),
        character(1, "shinji", "신지"),
      ],
    },
    { id: "season-2", label: "지붕 뚫고 하이킥!", playLabel: "1화 보기", characters: [] },
    { id: "season-3", label: "하이킥! 짧은 다리의 역습", playLabel: "1화 보기", characters: [] },
  ],

  description: [
    "등장인물들의 일상 공간에서의 엉뚱하고 기발한 일상을 코믹하게 시트콤으로 다룬다. 그러다 어느 순간",
    "부터 이들을 둘러싸고 있는 사람들, 일반 드라마의 평범한 조역인 것 같은 주변 인물들이 ...",
  ],
  cast: ["이순재", "나문희", "박해미", "정준하", "최민용", "신지", "서민정", "김혜성", "정일우", "김범", "박민영"],

  sections: [
    {
      id: "top10",
      title: "금주 TOP10 🏆",
      videos: [
        video("top-63", "63화", "준하의 엉뚱한 실수로 온 가족이 한바탕 소동에 휘말린다.", "2007.02.06"),
        video("top-64", "64화", "순재와 문희, 티격태격 노부부의 하루.", "2007.02.07"),
        video("top-65", "65화", "윤호와 민정, 서로의 마음을 확인하는 순간.", "2007.02.08"),
        video("top-66", "66화", "해미의 잔소리 폭격에 집안이 들썩인다.", "2007.02.09"),
        video("top-67", "67화", "순재의 비밀이 드러나며 가족들이 술렁인다.", "2007.02.10"),
      ],
    },
    {
      id: "from-ep1",
      title: "1화부터 정주행 🚂",
      videos: [
        video("ep-01", "1화", "한 지붕 아래 3대가 모여 사는 이순재 가족의 시끌벅적한 시작.", "2006.11.06"),
        video("ep-02", "2화", "준하와 해미, 아침부터 이어지는 부부의 신경전.", "2006.11.07"),
        video("ep-03", "3화", "순재의 고집에 온 가족이 두 손 두 발 다 든다.", "2006.11.08"),
        video("ep-04", "4화", "문희의 반격, 집안의 실세는 누구인가.", "2006.11.09"),
        video("ep-05", "5화", "민호와 윤호 형제의 엇갈리는 학교 생활.", "2006.11.10"),
      ],
    },
    {
      id: "min-min",
      title: "두근두근 케미모아보기 - 민 & 민 커플 -",
      videos: [
        video("chemi-41", "41화", "민용과 민정, 어색함 속에 피어나는 설렘.", "2007.01.05"),
        video("chemi-47", "47화", "서로를 의식하기 시작한 두 사람의 미묘한 거리.", "2007.01.16"),
        video("chemi-65", "65화", "용기 내 건넨 한마디, 민 & 민 커플의 터닝 포인트.", "2007.02.08"),
        video("chemi-75", "75화", "주변의 방해에도 꿋꿋한 두 사람의 데이트.", "2007.02.26"),
        video("chemi-79", "79화", "다시 마주한 두 사람, 지금의 마음은?", "2007.03.02"),
      ],
    },
  ],
};
