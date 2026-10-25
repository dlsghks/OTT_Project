// 꽃보다 남자 상세페이지 데이터 (시즌 없음)
// 이미지: public/images/retrov/boys-over-flowers/
//   - hero.jpg, logo.png
//   - characters/{캐릭터id}.png  : 동그란 캐릭터 아이콘 (150x150)
//   - panels/{캐릭터id}.png      : 아이콘 클릭 시 보이는 캐릭터 프로필 카드 (1420x780)
//   - videos/{영상id}.jpg        : 영상 카드 썸네일
// TODO: 캐릭터·카드 이미지 받으면 넣기 (시안에는 구준표만 이름이 보여서 나머지는 극중 이름으로 추정)
// TODO: 영상 링크(videoId) 없음 → 카드 클릭 시 재생되지 않음 (엑셀 받으면 채우기)
// TODO: 영상 제목/설명/날짜는 시안 이미지에서 읽은 임시 값 — 실제 데이터로 교체 필요

const IMG = "/images/retrov/boys-over-flowers";

const character = (id, name) => ({
  id,
  name,
  image: `${IMG}/characters/${id}.png`,
  panelImage: `${IMG}/panels/${id}.png`,
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

export const boysOverFlowers = {
  title: "꽃보다 남자",
  logo: `${IMG}/logo.png`,
  hero: `${IMG}/hero.jpg`,
  rating: "15",
  genre: "드라마",
  playLabel: "1화 보기",
  tvFrame: "boys-over-flowers",
  characterMode: "image",
  panelLabel: "프로필",
  pageBackground: "linear-gradient(180deg, #000 0%, #000 700px, #0f2727 1000px, #0b1d1d 100%)",
  othersTitle: "이런 프로그램은 어때요?",

  description: [
    "“여긴 학교가 아니야. 지옥이야. F4라고 들어봤어? 걔네들한테 레드카드를 받는 순간, 전교생의 사",
    "냥감이 되는 거야.” 세탁소 집 딸이자 평범한 여고생 잔디는 사립재단 신화학원으로 전학 배달...",
  ],
  cast: ["구혜선", "이민호", "김현중", "김범", "김준", "이민정"],

  characters: [
    character("geumjandi", "금잔디"),
    character("gujunpyo", "구준표"),
    character("yunjihoo", "윤지후"),
    character("soyijung", "소이정"),
    character("songwoobin", "송우빈"),
  ],

  sections: [
    {
      id: "new-classic",
      title: "👑 뉴클래식! 새로 즐기는 꽃보다男子",
      videos: [
        video("nc-01", "에피소드 1", "“여긴 학교가 아니야. 지옥이야.” F4에게 레드카드를 받는 순간, 전교생의 사냥감이 된다.", "2024.11.22"),
        video("nc-07", "에피소드 7", "잔디를 향한 준표의 서툰 진심, 그리고 흔들리는 마음.", "2024.11.22"),
        video("nc-09", "에피소드 9", "“이런 기분 처음이야.” 준표와 잔디 사이에 다시 찾아온 위기.", "2024.11.22"),
        video("nc-04", "에피소드 4", "“금잔디, 이제부터 넌 내 거야.” 준표의 일방적인 선언.", "2024.11.22"),
        video("nc-05", "에피소드 5", "뉴칼레도니아로 떠난 F4와 잔디, 섬에서 벌어지는 이야기.", "2024.11.22"),
      ],
    },
    {
      id: "legend-clips",
      title: "🌸 꽃남 레전드 클립 모음!",
      videos: [
        video("clip-f4", "[스페셜] 꽃남 F4 명장면 모음.zip", "이제 꽃남은 다시 봐도 설레는 F4 명장면만 모았다.", "2009.01.05"),
        video("clip-gaeul-2", "[스페셜] 가을♥이정 모음집 2편", "티격태격 가을과 이정, 두 사람의 케미 모음 2편.", "2009.01.05"),
        video("clip-jandi", "[스페셜] 금잔디 명장면 모음.zip", "잡초처럼 씩씩한 금잔디의 명장면을 한 번에.", "2009.01.05"),
        video("clip-gaeul-1", "[스페셜] 가을♥이정 모음집 1편", "가을과 이정, 두 사람의 시작을 다시 보다.", "2009.01.05"),
        video("clip-marry", "[스페셜] 결혼하자 금잔디", "준표의 깜짝 프러포즈, “결혼하자 금잔디”.", "2009.01.05"),
      ],
    },
    {
      id: "ost",
      title: "🎵 그 시절, 우리를 설레게한 OST & 명장면",
      videos: [
        video("ost-01", "에피소드 1", "“여긴 학교가 아니야. 지옥이야.” 모든 이야기의 시작.", "2024.11.22"),
        video("ost-05", "에피소드 5", "“금잔디!” 바닷가에서 울려 퍼진 준표의 외침.", "2024.11.22"),
        video("ost-09", "에피소드 9", "“금잔디... 구준표를 기억해.” OST와 함께 다시 보는 명장면.", "2024.11.22"),
        video("ost-25", "에피소드 25", "“내가 좋아했던, 날 사랑했던 구준표는 이제 없어.” 마지막 이야기.", "2024.11.22"),
      ],
    },
  ],
};
