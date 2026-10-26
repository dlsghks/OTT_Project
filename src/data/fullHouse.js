// 풀하우스 상세페이지 데이터
// 이미지: public/images/retrov/full-house/
//   - hero.jpg, logo.png
//   - s{시즌}/characters/{캐릭터id}.png  : 동그란 캐릭터 아이콘 (150x150)
//   - s{시즌}/panels/{캐릭터id}.png      : 아이콘 클릭 시 보이는 미니홈피 카드 (1420x780)
//   - videos/{영상id}.jpg                : 영상 카드 썸네일
// TODO: 시즌 2(풀하우스 TAKE 2) 캐릭터, 캐릭터·카드 이미지 받으면 채우기
// TODO: 영상 링크(videoId) 없음 → 카드 클릭 시 재생되지 않음 (엑셀 받으면 채우기)
// TODO: 영상 제목/설명/날짜는 시안 이미지에서 읽은 임시 값 — 실제 데이터로 교체 필요

const IMG = "/images/retrov/full-house";

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

export const fullHouse = {
  title: "풀하우스",
  logo: `${IMG}/logo.png`,
  hero: `${IMG}/hero.jpg`,
  rating: "15",
  genre: "드라마",
  tvFrame: "full-house",
  characterMode: "image",
  panelLabel: "미니홈피",
  othersTitle: "또 다른 그때 그시절 프로그램보기",

  seasons: [
    {
      id: "season-1",
      label: "시즌1",
      playLabel: "1화 보기",
      characters: [
        character(1, "leeyoungjae", "이영재"),
        character(1, "hanjieun", "한지은"),
        character(1, "yoominhyuk", "유민혁"),
        character(1, "kanghyewon", "강혜원"),
        character(1, "youngjae-jieun", "영재♥지은"),
        character(1, "minhyuk-hyewon", "민혁&혜원"),
        character(1, "heejin-dongwook", "희진&동욱"),
        character(1, "youngjae-family", "영재가족들"),
      ],
    },
    { id: "season-2", label: "시즌2", playLabel: "1화 보기", characters: [] },
  ],

  description: [
    "풀하우스에서 한가롭게 인터넷 소설을 쓰고 있던 지은. 갑작스런 초인종에 나가보니 친구 동욱과 희진이",
    "다. 동욱의 은행에서 주최한 우수고객 경품행사에 당첨됐다며 떠들어대는 동욱과 희진...",
  ],
  cast: ["송혜교", "정지훈", "한은정", "김성수", "이영은", "강도한"],

  sections: [
    {
      id: "best-scenes",
      title: "👑 풀하우스 명장면 다시보기",
      videos: [
        video("best-05", "5화_풀하우스", "온 세상이 다 알게 된 영재와 지은의 계약결혼, 풀하우스에서 벌어지는 일.", "2004.07.28"),
        video("best-03", "3화_우리 결혼할래요?", "영재의 갑작스러운 계약결혼 제안.", "2004.07.28"),
        video("best-last", "마지막화_결국 나였어", "돌고 돌아 결국 서로였던 두 사람.", "2004.07.28"),
        video("best-01", "1화_최악의 첫 만남", "비행기에서 시작된 지은과 영재의 악연.", "2004.07.28"),
        video("best-04", "4화_둘만의 놀이공원", "놀이공원 데이트에서 피어나는 설렘.", "2004.07.28"),
        video("best-17", "17화", "영재가 지은에게 다가가는 순간.", "2004.07.28"),
      ],
    },
    {
      id: "binge",
      title: "풀하우스 처음부터끝까지~정주행가자!",
      videos: [
        video("ep-01", "1화_에피소드1", "풀하우스에서 한가롭게 인터넷 소설을 쓰고 있던 지은, 친구들의 경품 당첨 소식.", "2004.07.28"),
        video("ep-02", "2화_에피소드2", "풀하우스를 떠나 갈 곳 없는 지은, 지은은 영재에게 가사도우미를 자청한다.", "2004.07.28"),
        video("ep-03", "3화_에피소드3", "갑작스런 영재의 결혼 발표, 지은은 계약결혼을 받아들인다.", "2004.07.28"),
        video("ep-04", "4화_에피소드4", "신혼생활 속 티격태격, 두 사람의 동거가 시작된다.", "2004.07.28"),
        video("ep-05", "5화_에피소드5", "풀하우스로 찾아온 손님, 둘의 비밀이 들킬 위기.", "2004.07.28"),
        video("ep-06", "6화_에피소드6", "영재의 마음이 조금씩 흔들리기 시작한다.", "2004.07.28"),
      ],
    },
    {
      id: "chemi",
      title: "💞 지은 × 영재, 꼬꼬케미모음",
      videos: [
        video("chemi-10", "10화_너 지금 질투하는 거야?", "영재에게 지은을 빼앗길까 신경 쓰이는 민혁, 그리고 영재의 질투.", "2004.07.28"),
        video("chemi-03", "3화_계약결혼부터 심상치 않...", "갑작스런 계약결혼부터 심상치 않은 두 사람.", "2004.07.28"),
        video("chemi-08", "8화_질투 아니거든?!", "애써 아닌 척하지만 숨길 수 없는 질투.", "2004.07.28"),
        video("chemi-14", "14화_미운 정이 사랑으로", "티격태격하던 미운 정이 사랑으로 바뀌는 순간.", "2004.07.28"),
        video("chemi-02", "2화_만나기만 하면 티격태격", "만나기만 하면 싸우는 두 사람의 동거 시작.", "2004.07.28"),
        video("chemi-07", "7화", "서로를 향한 마음을 조금씩 알아가는 두 사람.", "2004.07.28"),
      ],
    },
  ],
};
