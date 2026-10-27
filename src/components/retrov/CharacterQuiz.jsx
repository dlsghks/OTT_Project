import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Pencil, X } from "lucide-react";
import { isCorrectAnswer } from "../../data/characterQuizzes";
import "../../styles/components/CharacterQuiz.scss";
import { getImagePath } from "../../utils/imagePath";

// 캐릭터 아이콘 클릭 시 아래에 펼쳐지는 무도 퀴즈
// 흐름: 시작(intro) → 문제 풀기(question: 입력 → 정답 공개) × N → 결과(result)
export default function CharacterQuiz({ character, quiz, onClose, onBackToList }) {
  const [stage, setStage] = useState("intro");
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState([]); // 문제별 { input, correct }

  const questions = quiz?.questions ?? [];
  const total = questions.length;
  const currentQuestion = questions[index];
  const name = quiz?.characterName ?? character.name;
  const profileImage = quiz?.profileImage ?? character.image;

  function start() {
    setStage("question");
    setIndex(0);
    setResults([]);
  }

  function handleSubmit(input) {
    setResults((prev) => [...prev, { input, correct: isCorrectAnswer(currentQuestion, input) }]);
  }

  function handleNext() {
    if (index + 1 < total) setIndex(index + 1);
    else setStage("result");
  }

  return (
    <section id="character-panel" className="mudo-quiz" aria-label={`${name} 무도 퀴즈`}>
      <header className="mudo-quiz__bar">
        <p className="mudo-quiz__brand">
          <span className="mudo-quiz__logo" aria-hidden="true">무</span>
          무도 퀴즈
        </p>
        <p className="mudo-quiz__bar-meta">• {name} 편</p>
      </header>

      <div className="mudo-quiz__body">
        <div className="mudo-quiz__actions">
          <button type="button" className="mudo-quiz__pill" onClick={onBackToList}>
            <ArrowLeft size={14} aria-hidden="true" /> 목록가기
          </button>
          <button type="button" className="mudo-quiz__pill" onClick={onClose}>
            <X size={14} aria-hidden="true" /> 닫기
          </button>
        </div>

        {total === 0 ? (
          <QuizEmpty name={name} image={character.image} />
        ) : stage === "intro" ? (
          <QuizIntro quiz={quiz} image={profileImage} onStart={start} />
        ) : stage === "question" ? (
          <QuizQuestion
            key={currentQuestion.id}
            name={name}
            question={currentQuestion}
            index={index}
            total={total}
            result={results[index]}
            onSubmit={handleSubmit}
            onNext={handleNext}
          />
        ) : (
          <QuizResult
            quiz={quiz}
            image={profileImage}
            total={total}
            correctCount={results.filter((r) => r.correct).length}
            onRetry={start}
            onBackToList={onBackToList}
          />
        )}
      </div>

      <footer className="mudo-quiz__bar mudo-quiz__bar--bottom">
        <p>그때 그 프로, 얼마나 기억하시나요?</p>
        <p>총 {total}문제 · 주관식</p>
      </footer>
    </section>
  );
}

function ProfileCard({ image, name, caption }) {
  return (
    <div className="mudo-quiz__profile">
      <img src={getImagePath(image)} alt="" />
      <strong>{name}</strong>
      {caption && <span>{caption}</span>}
    </div>
  );
}

function QuizIntro({ quiz, image, onStart }) {
  const headingRef = useFocusOnMount();

  return (
    <div className="mudo-quiz__stage mudo-quiz__stage--intro">
      <p className="mudo-quiz__eyebrow">{quiz.eyebrow}</p>
      <h3 ref={headingRef} tabIndex={-1} className="mudo-quiz__title">
        {quiz.title.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </h3>
      <p className="mudo-quiz__desc">
        {quiz.description.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </p>

      <ProfileCard image={image} name={quiz.characterName} caption={quiz.profileCaption} />

      <button type="button" className="mudo-quiz__primary" onClick={onStart}>
        {quiz.characterName} 퀴즈 시작 <ArrowRight size={16} aria-hidden="true" />
      </button>
      {quiz.startHint && <p className="mudo-quiz__hint">{quiz.startHint}</p>}
    </div>
  );
}

function QuizProgress({ name, index, total }) {
  return (
    <div className="mudo-quiz__progress">
      <div className="mudo-quiz__progress-label">
        <span>{name}의 무도 퀴즈</span>
        <span>
          {index + 1}/{total}
        </span>
      </div>
      <ol className="mudo-quiz__progress-bar" aria-label={`${total}문제 중 ${index + 1}번째`}>
        {Array.from({ length: total }, (_, i) => (
          <li key={i} className={i <= index ? "is-done" : ""} />
        ))}
      </ol>
    </div>
  );
}

function QuizQuestion({ name, question, index, total, result, onSubmit, onNext }) {
  const [input, setInput] = useState("");
  const headingRef = useFocusOnMount();
  const nextRef = useRef(null);
  const revealed = Boolean(result);
  const number = String(index + 1).padStart(2, "0");
  const isLast = index + 1 === total;

  // 정답 공개 후 "다음 문제" 버튼으로 포커스 이동
  useEffect(() => {
    if (revealed) nextRef.current?.focus({ preventScroll: true });
  }, [revealed]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    onSubmit(input.trim());
  }

  return (
    <div className="mudo-quiz__stage">
      <QuizProgress name={name} index={index} total={total} />

      <p className="mudo-quiz__eyebrow">
        문제 {number} <span>· {question.type}</span>
      </p>
      <h3 ref={headingRef} tabIndex={-1} className="mudo-quiz__question">
        {question.text}
      </h3>

      <figure className="mudo-quiz__image">
        <img
          src={getImagePath(
            revealed ? question.answerImage : question.questionImage
          )}
          alt={
            revealed
              ? `정답 장면: ${question.answer}`
              : "대사 일부가 가려진 장면"
          }
        />
      </figure>

      {revealed ? (
        <>
          <div className="mudo-quiz__answer" role="status">
            <p className={`mudo-quiz__verdict ${result.correct ? "is-correct" : "is-wrong"}`}>
              • {result.correct ? "정답" : "아쉬워요! 정답은"}
            </p>
            <strong>{question.answer}</strong>
            {!result.correct && <p className="mudo-quiz__my-answer">내 답: {result.input}</p>}
          </div>

          <button ref={nextRef} type="button" className="mudo-quiz__primary" onClick={onNext}>
            {isLast ? "결과 보기" : "다음 문제"} <ArrowRight size={16} aria-hidden="true" />
          </button>
        </>
      ) : (
        <form className="mudo-quiz__form" onSubmit={handleSubmit}>
          <label className="mudo-quiz__input">
            <span className="sr-only">정답 입력</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="정답을 입력해 주세요"
              autoComplete="off"
            />
            <Pencil size={14} aria-hidden="true" />
          </label>

          <button type="submit" className="mudo-quiz__primary" disabled={!input.trim()}>
            정답 제출 <ArrowRight size={16} aria-hidden="true" />
          </button>
        </form>
      )}
    </div>
  );
}

function QuizResult({ quiz, image, total, correctCount, onRetry, onBackToList }) {
  const headingRef = useFocusOnMount();

  return (
    <div className="mudo-quiz__stage mudo-quiz__stage--result">
      <span className="mudo-quiz__check" aria-hidden="true">
        <Check size={26} strokeWidth={3} />
      </span>
      <p className="mudo-quiz__eyebrow">
        {total}/{total} · 퀴즈 완료
      </p>
      <h3 ref={headingRef} tabIndex={-1} className="mudo-quiz__title">
        {quiz.result.title}
      </h3>
      <p className="mudo-quiz__desc">
        {quiz.result.description.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </p>

      <div className="mudo-quiz__summary">
        <img src={getImagePath(image)} alt="" />
        <div>
          <strong>{quiz.characterName} 편</strong>
          <p>
            {total}문제 중 <em>{correctCount}문제</em> 정답!
          </p>
          <p className="mudo-quiz__summary-sub">다른 캐릭터 퀴즈도 도전해 보세요.</p>
        </div>
      </div>

      <button type="button" className="mudo-quiz__primary" onClick={onRetry}>
        다시 도전하기 <ArrowRight size={16} aria-hidden="true" />
      </button>
      <button type="button" className="mudo-quiz__secondary" onClick={onBackToList}>
        다른 캐릭터를 골라보기
      </button>
    </div>
  );
}

function QuizEmpty({ name, image }) {
  const headingRef = useFocusOnMount();

  return (
    <div className="mudo-quiz__stage mudo-quiz__stage--intro">
      <p className="mudo-quiz__eyebrow">무도 좀 보셨습니까?</p>
      <h3 ref={headingRef} tabIndex={-1} className="mudo-quiz__title">
        {name} 퀴즈는 준비 중이에요
      </h3>
      <p className="mudo-quiz__desc">곧 새로운 문제로 찾아올게요. 다른 캐릭터 퀴즈를 먼저 풀어보세요!</p>
      <ProfileCard image={image} name={name} />
    </div>
  );
}

// 화면이 바뀔 때 제목으로 포커스를 옮겨 스크린리더가 새 내용을 읽도록
function useFocusOnMount() {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);
  return ref;
}
