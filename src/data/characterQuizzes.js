// 무한도전 캐릭터별 퀴즈 데이터 (키 = retrov.js 의 characters[].id)
// 이미지: public/images/retrov/quiz/{캐릭터id}/ 에 넣어주세요.
//   - questionImage: 빈칸이 가려진 문제용 짤
//   - answerImage:   정답 대사가 보이는 짤
// answers: 정답으로 인정할 표현들 (띄어쓰기·문장부호·말줄임표는 무시하고 비교)

const QUIZ_IMG = "/images/retrov/quiz";

export const characterQuizzes = {
  myungsoo: {
    characterName: "명수옹",
    profileCaption: "2인자 전용 · 버럭",
    eyebrow: "무도 좀 보셨습니까?",
    title: ["명수옹과 함께하는", "무도 퀴즈"],
    description: ["레전드 짤 한 마디부터 무도 상식까지,", "다섯 문제로 그때의 웃음을 꺼내 보세요."],
    startHint: "짤 속 빈칸에 들어갈 대사를 맞혀보세요",
    questions: [
      {
        id: "myungsoo-q1",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/myungsoo/q1-question.jpg`,
        answerImage: `${QUIZ_IMG}/myungsoo/q1-answer.jpg`,
        answer: "꿈은 없고요 그냥 놀고 싶습니다",
        answers: ["꿈은 없고요 그냥 놀고 싶습니다", "꿈은 없고요 그냥 놀고 싶어요"],
      },
      {
        id: "myungsoo-q2",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/myungsoo/q2-question.jpg`,
        answerImage: `${QUIZ_IMG}/myungsoo/q2-answer.jpg`,
        answer: "얹어!",
        answers: ["얹어"],
      },
      {
        id: "myungsoo-q3",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/myungsoo/q3-question.jpg`,
        answerImage: `${QUIZ_IMG}/myungsoo/q3-answer.jpg`,
        answer: "아유... 하기 싫어...",
        answers: ["아유 하기 싫어", "아 하기 싫어", "하기 싫어"],
      },
      {
        id: "myungsoo-q4",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/myungsoo/q4-question.jpg`,
        answerImage: `${QUIZ_IMG}/myungsoo/q4-answer.jpg`,
        answer: "아름다운 메리케리 리얼 카인드니스 어라운(???)",
        answers: ["아름다운 메리케리 리얼 카인드니스 어라운", "아름다운 메리케리 리얼 카인드니스 어라운드"],
      },
      {
        id: "myungsoo-q5",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/myungsoo/q5-question.jpg`,
        answerImage: `${QUIZ_IMG}/myungsoo/q5-answer.jpg`,
        answer: "입 닫고 빵이나 먹어",
        answers: ["입 닫고 빵이나 먹어", "입닫고 빵이나 먹어"],
      },
    ],
    result: {
      title: "다섯 문제, 도전 끝!",
      description: ["명수옹과 함께한 무도 퀴즈, 즐거우셨나요?", "정답보다 오래 남는 건 그때의 웃음이죠."],
    },
  },

  doni: {
    characterName: "도니",
    profileCaption: "미존개오 · 웃음 사냥꾼", // TODO: 시안 글씨가 작아 임시 문구 — 실제 문구로 교체
    eyebrow: "무도 좀 보셨습니까?",
    title: ["도니와 함께하는", "무도 퀴즈"],
    description: ["레전드 짤 한 마디부터 무도 상식까지,", "다섯 문제로 그때의 웃음을 꺼내 보세요."],
    startHint: "짤 속 빈칸에 들어갈 대사를 맞혀보세요",
    questions: [
      {
        id: "doni-q1",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/doni/q1-question.jpg`,
        answerImage: `${QUIZ_IMG}/doni/q1-answer.jpg`,
        answer: "이건 뭐하러 들고 다니냐?!",
        answers: ["이건 뭐하러 들고 다니냐", "이건 뭐 하러 들고 다니냐", "이거 뭐하러 들고 다니냐"],
      },
      {
        id: "doni-q2",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/doni/q2-question.jpg`,
        answerImage: `${QUIZ_IMG}/doni/q2-answer.jpg`,
        answer: "아니! 아닌데!",
        answers: ["아니 아닌데", "아닌데"],
      },
      {
        id: "doni-q3",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/doni/q3-question.jpg`,
        answerImage: `${QUIZ_IMG}/doni/q3-answer.jpg`,
        answer: "아이 망했네!",
        answers: ["아이 망했네", "아 망했네", "망했네"],
      },
      {
        id: "doni-q4",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/doni/q4-question.jpg`,
        answerImage: `${QUIZ_IMG}/doni/q4-answer.jpg`,
        answer: "우~~ 정준하~~",
        answers: ["우 정준하", "우정준하"],
      },
      {
        id: "doni-q5",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/doni/q5-question.jpg`,
        answerImage: `${QUIZ_IMG}/doni/q5-answer.jpg`,
        answer: "형이 왜 거기서 나와...?",
        answers: ["형이 왜 거기서 나와", "형이 거기서 왜 나와", "형이 왜 거기서 나와요"],
      },
    ],
    result: {
      title: "다섯 문제, 도전 끝!",
      description: ["도니와 함께한 무도 퀴즈, 즐거우셨나요?", "정답보다 오래 남는 건 그때의 웃음이죠."],
    },
  },

  yubujang: {
    characterName: "유부장",
    profileCaption: "무한상사 부장 · 국민MC", // TODO: 시안 글씨가 작아 임시 문구 — 실제 문구로 교체
    eyebrow: "무도 좀 보셨습니까?",
    title: ["유부장과 함께하는", "무도 퀴즈"],
    description: ["레전드 짤 한 마디부터 무도 상식까지,", "다섯 문제로 그때의 웃음을 꺼내 보세요."],
    startHint: "짤 속 빈칸에 들어갈 대사를 맞혀보세요",
    questions: [
      {
        id: "yubujang-q1",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/yubujang/q1-question.jpg`,
        answerImage: `${QUIZ_IMG}/yubujang/q1-answer.jpg`,
        answer: "이마모티콘!",
        answers: ["이마모티콘"],
      },
      {
        id: "yubujang-q2",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/yubujang/q2-question.jpg`,
        answerImage: `${QUIZ_IMG}/yubujang/q2-answer.jpg`,
        answer: "멤버들 다시 짠다!!",
        answers: ["멤버들 다시 짠다", "멤버 다시 짠다"],
      },
      {
        id: "yubujang-q3",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/yubujang/q3-question.jpg`,
        answerImage: `${QUIZ_IMG}/yubujang/q3-answer.jpg`,
        answer: "싸브레??",
        answers: ["싸브레"],
      },
      {
        id: "yubujang-q4",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/yubujang/q4-question.jpg`,
        answerImage: `${QUIZ_IMG}/yubujang/q4-answer.jpg`,
        answer: "그럴 순 없어",
        answers: ["그럴 순 없어", "그럴수 없어"],
      },
      {
        id: "yubujang-q5",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/yubujang/q5-question.jpg`,
        answerImage: `${QUIZ_IMG}/yubujang/q5-answer.jpg`,
        answer: "후론드라라",
        answers: ["후론드라라"],
      },
    ],
    result: {
      title: "다섯 문제, 도전 끝!",
      description: ["유부장과 함께한 무도 퀴즈, 즐거우셨나요?", "정답보다 오래 남는 건 그때의 웃음이죠."],
    },
  },

  // 럭키가이 = 노홍철 (시안 제목은 "노홍철과 함께하는 무도 퀴즈")
  luckyguy: {
    characterName: "노홍철",
    profileCaption: "럭키가이 · 돌+아이", // TODO: 시안 글씨가 작아 임시 문구 — 실제 문구로 교체
    eyebrow: "무도 좀 보셨습니까?",
    title: ["노홍철과 함께하는", "무도 퀴즈"],
    description: ["레전드 짤 한 마디부터 무도 상식까지,", "다섯 문제로 그때의 웃음을 꺼내 보세요."],
    startHint: "짤 속 빈칸에 들어갈 대사를 맞혀보세요",
    questions: [
      {
        id: "luckyguy-q1",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/luckyguy/q1-question.jpg`,
        answerImage: `${QUIZ_IMG}/luckyguy/q1-answer.jpg`,
        answer: "실례가 안 된다면 아이스크림 하나만 사주십시오",
        answers: ["실례가 안 된다면 아이스크림 하나만 사주십시오", "실례가 안된다면 아이스크림 하나만 사주세요"],
      },
      {
        id: "luckyguy-q2",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/luckyguy/q2-question.jpg`,
        answerImage: `${QUIZ_IMG}/luckyguy/q2-answer.jpg`,
        answer: "집에 가면 개 표정이 딱 저 표정",
        answers: ["집에 가면 개 표정이 딱 저 표정", "집에 가면 개 표정이 저 표정"],
      },
      {
        id: "luckyguy-q3",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/luckyguy/q3-question.jpg`,
        answerImage: `${QUIZ_IMG}/luckyguy/q3-answer.jpg`,
        answer: "양서류는 흔들어야 먹어요",
        answers: ["양서류는 흔들어야 먹어요", "양서류는 흔들어 먹어요"],
      },
      {
        id: "luckyguy-q4",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/luckyguy/q4-question.jpg`,
        answerImage: `${QUIZ_IMG}/luckyguy/q4-answer.jpg`,
        answer: "미친 거야 뭐야?",
        answers: ["미친 거야 뭐야", "미친거야 뭐야"],
      },
      {
        id: "luckyguy-q5",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/luckyguy/q5-question.jpg`,
        answerImage: `${QUIZ_IMG}/luckyguy/q5-answer.jpg`,
        answer: "어~ 그래",
        answers: ["어 그래", "어그래"],
      },
    ],
    result: {
      title: "다섯 문제, 도전 끝!",
      description: ["노홍철과 함께한 무도 퀴즈, 즐거우셨나요?", "정답보다 오래 남는 건 그때의 웃음이죠."],
    },
  },

  // 주나 = 정준하 (이미지 폴더 이름은 "juna")
  junha: {
    characterName: "주나",
    profileCaption: "바보 형 · 쩌리 짱", // TODO: 시안 글씨가 작아 임시 문구 — 실제 문구로 교체
    eyebrow: "무도 좀 보셨습니까?",
    title: ["주나와 함께하는", "무도 퀴즈"],
    description: ["레전드 짤 한 마디부터 무도 상식까지,", "다섯 문제로 그때의 웃음을 꺼내 보세요."],
    startHint: "짤 속 빈칸에 들어갈 대사를 맞혀보세요",
    questions: [
      {
        id: "junha-q1",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/juna/q1-question.jpg`,
        answerImage: `${QUIZ_IMG}/juna/q1-answer.jpg`,
        answer: "이름이 존이냐 박이냐...",
        answers: ["이름이 존이냐 박이냐"],
      },
      {
        id: "junha-q2",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/juna/q2-question.jpg`,
        answerImage: `${QUIZ_IMG}/juna/q2-answer.jpg`,
        answer: "며칠 서 계셔가지고요",
        answers: ["며칠 서 계셔가지고요", "며칠 서 계셔가지고"],
      },
      {
        id: "junha-q3",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/juna/q3-question.jpg`,
        answerImage: `${QUIZ_IMG}/juna/q3-answer.jpg`,
        answer: "근데 저 정도 금액도 뉴스에 나와요...?",
        answers: ["근데 저 정도 금액도 뉴스에 나와요", "저 정도 금액도 뉴스에 나와요"],
      },
      {
        id: "junha-q4",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/juna/q4-question.jpg`,
        answerImage: `${QUIZ_IMG}/juna/q4-answer.jpg`,
        answer: "쩌리 짱",
        answers: ["쩌리짱"],
      },
      {
        id: "junha-q5",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/juna/q5-question.jpg`,
        answerImage: `${QUIZ_IMG}/juna/q5-answer.jpg`,
        answer: "민병관!",
        answers: ["민병관"],
      },
    ],
    result: {
      title: "다섯 문제, 도전 끝!",
      description: ["주나와 함께한 무도 퀴즈, 즐거우셨나요?", "정답보다 오래 남는 건 그때의 웃음이죠."],
    },
  },

  // 상꼬맹이 = 하하
  // TODO: 퀴즈 이미지 아직 없음 → public/images/retrov/quiz/haha/q1~q5-question.jpg, -answer.jpg
  // TODO: 정답은 시안(작은 글씨)에서 읽은 값 — 정답 이미지 받으면 자막으로 확인
  haha: {
    characterName: "하하",
    profileCaption: "상꼬맹이 · 하로로", // TODO: 시안 글씨가 작아 임시 문구 — 실제 문구로 교체
    eyebrow: "무도 좀 보셨습니까?",
    title: ["하하와 함께하는", "무도 퀴즈"],
    description: ["레전드 짤 한 마디부터 무도 상식까지,", "다섯 문제로 그때의 웃음을 꺼내 보세요."],
    startHint: "짤 속 빈칸에 들어갈 대사를 맞혀보세요",
    questions: [
      {
        id: "haha-q1",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/haha/q1-question.jpg`,
        answerImage: `${QUIZ_IMG}/haha/q1-answer.jpg`,
        answer: "정신차려 이 각박한 세상 속에서",
        answers: ["정신차려 이 각박한 세상 속에서", "정신차려 이각박한세상속에서"],
      },
      {
        id: "haha-q2",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/haha/q2-question.jpg`,
        answerImage: `${QUIZ_IMG}/haha/q2-answer.jpg`,
        answer: "우리가 너 좋아하는 거 같냐",
        answers: ["우리가 너 좋아하는 거 같냐", "우리가 너 좋아하는 것 같냐"],
      },
      {
        id: "haha-q3",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/haha/q3-question.jpg`,
        answerImage: `${QUIZ_IMG}/haha/q3-answer.jpg`,
        answer: "장모 거세게 판데라스", // TODO: 확인 필요
        answers: ["장모 거세게 판데라스"],
      },
      {
        id: "haha-q4",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/haha/q4-question.jpg`,
        answerImage: `${QUIZ_IMG}/haha/q4-answer.jpg`,
        answer: "혼자다!",
        answers: ["혼자다"],
      },
      {
        id: "haha-q5",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/haha/q5-question.jpg`,
        answerImage: `${QUIZ_IMG}/haha/q5-answer.jpg`,
        answer: "발루어볼래!", // TODO: 확인 필요
        answers: ["발루어볼래"],
      },
    ],
    result: {
      title: "다섯 문제, 도전 끝!",
      description: ["하하와 함께한 무도 퀴즈, 즐거우셨나요?", "정답보다 오래 남는 건 그때의 웃음이죠."],
    },
  },

  // TODO: 퀴즈 이미지 아직 없음 → public/images/retrov/quiz/gil/q1~q5-question.jpg, -answer.jpg
  // TODO: 정답은 시안(작은 글씨)에서 읽은 값 — 정답 이미지 받으면 자막으로 확인
  gil: {
    characterName: "길",
    profileCaption: "길 · 무도 막내", // TODO: 시안 글씨가 작아 임시 문구 — 실제 문구로 교체
    eyebrow: "무도 좀 보셨습니까?",
    title: ["길과 함께하는", "무도 퀴즈"],
    description: ["레전드 짤 한 마디부터 무도 상식까지,", "다섯 문제로 그때의 웃음을 꺼내 보세요."],
    startHint: "짤 속 빈칸에 들어갈 대사를 맞혀보세요",
    questions: [
      {
        id: "gil-q1",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/gil/q1-question.jpg`,
        answerImage: `${QUIZ_IMG}/gil/q1-answer.jpg`,
        answer: "먹은이는 아는데요 김경식 씨...", // TODO: 확인 필요
        answers: ["먹은이는 아는데요 김경식 씨"],
      },
      {
        id: "gil-q2",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/gil/q2-question.jpg`,
        answerImage: `${QUIZ_IMG}/gil/q2-answer.jpg`,
        answer: "어떻게 됐더라...?",
        answers: ["어떻게 됐더라", "어떻게 되었더라", "어떻게 했더라"],
      },
      {
        id: "gil-q3",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/gil/q3-question.jpg`,
        answerImage: `${QUIZ_IMG}/gil/q3-answer.jpg`,
        answer: "저요? 그럼요...",
        answers: ["저요 그럼요"],
      },
      {
        id: "gil-q4",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/gil/q4-question.jpg`,
        answerImage: `${QUIZ_IMG}/gil/q4-answer.jpg`,
        answer: "나 이런 거 무서워해", // TODO: 확인 필요 (시안에서 "투셔하해"처럼 보임)
        answers: ["나 이런 거 무서워해", "나 이런거 무서워해"],
      },
      {
        id: "gil-q5",
        type: "빈칸 맞히기",
        text: "빈칸에 들어갈 한마디는?",
        questionImage: `${QUIZ_IMG}/gil/q5-question.jpg`,
        answerImage: `${QUIZ_IMG}/gil/q5-answer.jpg`,
        answer: "가권(?)이네 가권(?)", // TODO: 확인 필요
        answers: ["가권이네 가권"],
      },
    ],
    result: {
      title: "다섯 문제, 도전 끝!",
      description: ["길과 함께한 무도 퀴즈, 즐거우셨나요?", "정답보다 오래 남는 건 그때의 웃음이죠."],
    },
  },
};

// 띄어쓰기·문장부호를 지우고 비교
const normalize = (text) => text.toLowerCase().replace(/[\s.,!?~…·'"()（）]/g, "");

export function isCorrectAnswer(question, input) {
  const value = normalize(input);
  if (!value) return false;
  return [question.answer, ...(question.answers ?? [])].some((answer) => normalize(answer) === value);
}
