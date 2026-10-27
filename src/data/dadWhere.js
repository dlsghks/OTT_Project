// 아빠! 어디가? 상세페이지 데이터
// 이미지: public/images/retrov/dad-where/
//   - hero.jpg, logo.png
//   - s{시즌}/characters/{캐릭터id}.png  : 동그란 아빠×아이 아이콘 (150x150)
//   - s{시즌}/panels/{캐릭터id}.png      : 아이콘 클릭 시 보이는 케미 소개 카드 (1420x780)
//   - videos/{영상id}.jpg                : 영상 카드 썸네일
// TODO: 시즌 2 캐릭터, 캐릭터·카드·영상 이미지 받으면 채우기
// TODO: 영상 링크(videoId) 없음 → 카드 클릭 시 재생되지 않음 (엑셀 받으면 채우기)
// TODO: 영상 제목/설명은 시안에서 읽은 임시 값, 날짜는 1회(2013.01.06)부터 매주 일요일로 계산한 추정값 — 실제 데이터로 교체 필요

const IMG = "/images/retrov/dad-where";

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

const TRIP = "아빠와 아이 단 둘이 떠나는 낯선 곳에서의 하룻밤! 다섯 아빠들과 아이들의 아주 특별한 여행.";

export const dadWhere = {
  title: "아빠! 어디가?",
  logo: `${IMG}/logo.png`,
  hero: `${IMG}/hero.jpg`,
  rating: "15",
  genre: "예능",
  tvFrame: "dad-where", // 블루그레이 TV 테두리
  characterMode: "image",
  panelLabel: "케미 소개",
  pageBackground: "linear-gradient(180deg, #000 0%, #000 900px, #2a2a2a 1150px, #1c1c1c 1500px, #1c1c1c 100%)",
  othersTitle: "또 다른 그때 그시절 프로그램보기",

  // 시즌 선택 → 재생 버튼 문구와 캐릭터 필터가 바뀜
  seasons: [
    {
      id: "season-1",
      label: "시즌1",
      playLabel: "1화 보기",
      characters: [
        character(1, "sungdongil-sungjun", "성동일×성준"),
        character(1, "kimsungju-minguk", "김성주×김민국"),
        character(1, "leejonghyuk-junsu", "이종혁×이준수"),
        character(1, "songjongguk-jia", "송종국×송지아"),
        character(1, "yoonminsu-hoo", "윤민수×윤후"),
      ],
    },
    { id: "season-2", label: "시즌2", playLabel: "1화 보기", characters: [] },
  ],

  description: [
    "‘좋은 아빠란 과연 무엇일까?’ 일하기 바쁜 아빠, 집에서는 피곤한 아빠. 특히 아이 없이 아무것도",
    "할 수 없는 대한민국의 보통 아빠들... 이 아빠들은 가족 안에서 얼마만큼의 ‘자리’를 차지하고 있을까.",
  ],
  // TODO: 시안의 출연자 줄은 풀하우스 문구가 복사돼 있어 실제 출연진으로 넣음 — 확인 필요
  cast: ["성동일", "김성주", "이종혁", "송종국", "윤민수", "성준", "김민국", "이준수", "송지아", "윤후"],

  sections: [
    {
      id: "all-episodes",
      title: "전체 회차 55회",
      videos: [
        video("ep-01", "[1회] 강원도의 아주 작은 마을", TRIP, "2013.01.06"),
        video("ep-02", "[2회] 강원도의 아주 작은 마을 2", TRIP, "2013.01.13"),
        video("ep-03", "[3회] -두번째 여정지- 600년 된 마을", TRIP, "2013.01.20"),
        video("ep-04", "[4회] 600년 된 느티나무가 있는 마을", TRIP, "2013.01.27"),
        video("ep-05", "[5회] -세번째 여정지- 송", TRIP, "2013.02.03"),
      ],
    },
    {
      id: "best-scenes",
      title: "추억의 명장면 편 🎬",
      videos: [
        video("best-07", "[7회] 천혜의 자연 풍경길", TRIP, "2013.02.17"),
        video("best-05", "[5회] -세번째 여정지- 송", TRIP, "2013.02.03"),
        video("best-20", "[20회] -아홉 번째 여정지-", TRIP, "2013.05.19"),
        video("best-13", "[13회] -여섯 번째 여정지-", TRIP, "2013.03.31"),
        video("best-55", "[55회] -스물 세 번째 여행-", TRIP, "2014.01.19"),
      ],
    },
    {
      id: "trips",
      title: "그때 그 여행 🌴",
      videos: [
        video("trip-01", "[1~2회] 품걸리", TRIP, "2013.01.06"),
        video("trip-48", "[48~53회] 제주도", TRIP, "2013.12.01"),
        video("trip-03", "[3회] -두번째 여정지- 600년 된 마을", TRIP, "2013.01.20"),
        video("trip-04", "[4회] 600년 된 느티나무가 있는 마을", TRIP, "2013.01.27"),
        video("trip-05", "[5회] -세번째 여정지- 송", TRIP, "2013.02.03"),
      ],
    },
  ],
};
