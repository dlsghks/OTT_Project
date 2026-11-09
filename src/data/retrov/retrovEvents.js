// 레트로브 투표 이벤트 (/eventdetail/what-next · /eventdetail/favorite-scene · /eventdetail/next-line)
// 레트로브 이벤트 배너(src/data/retrov/retrov.js 의 eventBanners)를 누르면 연결되는 페이지 데이터
// 화면: src/components/event/RetroVoteEvent.jsx / 스타일: src/styles/pages/event/RetroVoteEvent.scss
//
// scene: TV 화면에 보여줄 장면 (누르면 재생)
//   - videoId: 유튜브 영상 ID → 그 영상 썸네일 + 바로 재생
//   - seasonId · episode: TMDB 회차 (src/data/retrov/retrovTmdb.js) → 회차 장면 사진 + TMDB → 유튜브 검색 순으로 영상 찾기
//   - query: 위 둘이 없을 때 유튜브 검색어
// votes: 다른 팬들의 기본 득표수 (내 표가 더해져 득표율 계산)

const NOTICE_PLAY = "콘텐츠 시청은 보유 이용권 및 서비스 정책에 따라 달라질 수 있습니다.";

export const retrovEvents = {
  // 풀하우스 — 잠깐! 이다음에 무슨 일이?
  "what-next": {
    theme: "coral",
    programId: "full-house",
    programTitle: "풀하우스",
    title: "잠깐! 이다음에 무슨 일이?",
    period: "2026.11.01 ~ 2026.11.30",
    hero: {
      title: ["잠깐! 이 다음에", "무슨 일이?"],
      lead: "익숙한 장면도, 다시 보면 설레니까.",
      description: ["다음에 이어질 장면을 고르고", "다른 팬들의 선택도 만나보세요."],
    },
    steps: {
      title: "이벤트 참여 방법",
      description: "장면을 보고 나만의 답을 골라주세요.",
      items: [
        { title: "장면 보기", text: "짧은 영상을 확인해요" },
        { title: "다음 장면 고르기", text: "이어질 장면에 투표해요" },
        { title: "선택 비교하기", text: "팬들의 선택을 확인해요" },
      ],
    },
    vote: {
      type: "question",
      title: "두 사람의 다음 장면은?",
      description: "영상을 확인하고, 이어질 것 같은 장면 하나를 선택해 주세요.",
      question: "Q. 이 장면 다음, 두 사람에게 어떤 일이 일어날까요?",
      scene: { videoId: "WiTlDJ4E1kw" }, // KBS | [풀 하우스] [EP05-01] 곰세마리 노래 선물
      options: [
        { id: "dance", label: "노래와 율동으로 분위기를 바꾼다", votes: 58 },
        { id: "confess", label: "진지하게 자신의 이야기를 털어놓는다", votes: 29 },
        { id: "leave", label: "민망해하며 자리를 피한다", votes: 13 },
      ],
      submit: "이 장면에 투표하기",
    },
    result: {
      title: "다른 팬들은 이렇게 골랐어요",
      description: "실시간 투표 결과",
      button: "정답 장면 확인하기",
    },
    promo: {
      title: "정답 너머의 설렘까지",
      description: "퀴즈로 끝내기 아쉽다면, 풀하우스를 이어서 만나보세요.",
      text: ["티격태격하는 순간에도", "자꾸만 마음이 향하는 두 사람."],
      button: "풀하우스 보러 가기",
    },
    notices: [
      "로그인 후 투표에 참여할 수 있습니다.",
      "투표 결과는 참여 후 확인할 수 있습니다.",
      "정답 확인 시 작품의 일부 내용이 공개될 수 있습니다.",
      NOTICE_PLAY,
    ],
  },

  // 우리 결혼했어요 — 나의 최애 장면은?!
  "favorite-scene": {
    theme: "magenta",
    programId: "we-got-married",
    programTitle: "우리 결혼했어요",
    title: "나의 최애 장면은?!",
    period: "2026.11.01 ~ 2026.11.30",
    hero: {
      title: ["나의", "최애 장면은?!"],
      lead: "다시 봐도, 그때처럼 두근두근.",
      description: ["세 커플, 세 가지 설렘.", "가장 마음에 남는 장면에 한 표를 보내주세요."],
    },
    steps: {
      title: "마음에 남은 순간, 하나만 골라요",
      description: "아담·용서·쿤토리아의 후보 영상을 보고, 최애 장면 하나를 골라주세요.",
      items: [
        { title: "장면 살펴보기", text: "세 커플의 영상을 봐요" },
        { title: "최애 장면 선택", text: "세 장면 중 하나를 선택" },
        { title: "팬들의 픽 확인", text: "다른 팬들의 취향도 만나요" },
      ],
    },
    vote: {
      type: "scenes",
      title: "세 커플의 설렘, 당신의 선택은?",
      description: "후보 장면을 각각 감상한 후, 가장 마음에 남는 장면 하나를 선택해 주세요.",
      options: [
        {
          id: "adam",
          label: "예상 못 해서 더 설레던 순간",
          couple: "조권 ♥ 가인",
          text: ["깜짝 몰래카메라 속,", "가인이 조권에게 건넨 기습 뽀뽀."],
          scene: { videoId: "56c3gSDKGJk" },
          votes: 58,
        },
        {
          id: "yongseo",
          label: "조금 더 가까워진 우리",
          couple: "정용화 ♥ 서현",
          text: ["함께 노래하고 마음을 담아 연주한", "두 사람의 반짝이던 순간."],
          scene: { videoId: "hxd9bvYELbU" },
          votes: 29,
        },
        {
          id: "khuntoria",
          label: "다시 봐도 두근거리는 웨딩",
          couple: "닉쿤 ♥ 빅토리아",
          text: ["결혼 1주년, 드레스와 턱시도를 입고", "함께 남긴 웨딩 촬영의 순간."],
          scene: { videoId: "kVJm4Gnt94A" },
          votes: 13,
        },
      ],
      submit: "투표하기",
    },
    result: {
      title: "다른 팬들은 이렇게 골랐어요",
      description: "투표가 완료됐어요. 나의 선택과 비교해 보세요.",
      button: "1위 장면 다시보기",
    },
    promo: {
      title: "설렘이 계속되는 곳",
      description: "투표로 끝내기 아쉽다면, 우리 결혼했어요에서 그 순간을 다시 만나보세요.",
      text: ["서툰 첫 만남부터 마음이 가까워지는 순간까지.", "당신이 좋아했던 그 커플을 다시 만나보세요."],
      button: "우리 결혼했어요 보러 가기",
    },
    notices: [
      "로그인 후 최애 장면 투표에 참여할 수 있습니다.",
      "후보 장면 중 한 가지를 선택한 후 투표해 주세요.",
      "투표 완료 후 팬들의 선택과 득표율을 확인할 수 있습니다.",
      NOTICE_PLAY,
    ],
  },

  // 거침없이 하이킥 — 다음에 올 명대사는?
  "next-line": {
    theme: "purple",
    programId: "high-kick",
    programTitle: "거침없이 하이킥",
    title: "다음에 올 명대사는?",
    period: "2026.11.01 ~ 2026.11.30",
    hero: {
      title: ["다음에 올", "명대사는?"],
      lead: "웃음 버튼 ON. 기억력도 ON!",
      description: ["보기만 해도 자동 재생되는 그 장면.", "다음 대사를 고르고, 기억력을 확인해 보세요."],
    },
    steps: {
      title: "레전드 대사, 기억나시죠?",
      description: "장면을 보고 이어지는 대사를 맞혀보세요. 정답은 영상으로 확인할 수 있어요.",
      items: [
        { title: "장면 보기", text: "대사 직전까지 집중!" },
        { title: "다음 대사 선택", text: "기억나는 대사를 골라요" },
        { title: "정답 확인하기", text: "원래 장면으로 확인해요" },
      ],
    },
    vote: {
      type: "question",
      title: "여기서 나올 말은 딱 하나!",
      description: "영상이 멈춘 순간, 다음에 이어질 대사를 선택해 주세요.",
      question: "Q. 이 장면 다음에 이어질 명대사는?",
      scene: { videoId: "Q83j5KVHFxs" }, // 거침없이 하이킥 64회
      options: [
        { id: "line-1", label: "알았어. 내가 봐.", votes: 58 },
        { id: "line-2", label: "내가 보고 있었다고.", votes: 29 },
        { id: "line-3", label: "아빠한테 다 말할 거야!", votes: 13 },
      ],
      submit: "선택한 대사로 정답 확인하기",
    },
    result: {
      title: "다른 팬들은 어떤 대사를 골랐을까요?",
      description: "나의 선택과 비교하고, 원래 장면으로 정답을 확인해 보세요.",
      button: "원래 장면으로 정답 확인하기",
    },
    promo: {
      title: "이 웃음, 여기서 끊을 순 없죠",
      description: "명대사 하나로는 아쉽다면, 거침없이 하이킥의 레전드 순간을 이어서 만나보세요.",
      text: ["평범할 틈 없는 가족의 일상,", "다시봐도 웃음이 나는 그 순간들."],
      button: "거침없이 하이킥 보러 가기",
    },
    notices: [
      "로그인 후 명대사 퀴즈에 참여할 수 있습니다.",
      "영상 확인 후 이어질 대사 하나를 선택해 주세요.",
      "정답 확인 시 작품의 일부 내용이 공개될 수 있습니다.",
      NOTICE_PLAY,
    ],
  },
};
