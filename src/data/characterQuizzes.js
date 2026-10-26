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
};

// 띄어쓰기·문장부호를 지우고 비교
const normalize = (text) => text.toLowerCase().replace(/[\s.,!?~…·'"()（）]/g, "");

export function isCorrectAnswer(question, input) {
  const value = normalize(input);
  if (!value) return false;
  return [question.answer, ...(question.answers ?? [])].some((answer) => normalize(answer) === value);
}
