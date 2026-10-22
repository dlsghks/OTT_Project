// src/pages/RetroV.jsx
import { Link } from "react-router-dom";

import ProgramNavigation from "../components/retrov/ProgramNavigation";
import { programs } from "../data/retrov";
import "../styles/Retrov.scss";

// 예시 데이터: 실제 이미지 파일명으로 교체해주세요.
const rankings = [
  {
    programId: "infinite-challenge",
    title: "무한도전",
    image: "/images/retrov/poster-infinite-challenge.jpg",
  },
  {
    programId: "high-kick",
    title: "거침없이 하이킥",
    image: "/images/retrov/poster-high-kick.jpg",
  },
  {
    programId: "boys-over-flowers",
    title: "꽃보다 남자",
    image: "/images/retrov/poster-boys-over-flowers.jpg",
  },
  {
    programId: "we-got-married",
    title: "우리 결혼했어요",
    image: "/images/retrov/poster-we-got-married.jpg",
  },
  {
    programId: "full-house",
    title: "풀하우스",
    image: "/images/retrov/poster-full-house.jpg",
  },
];

const watching = [
  {
    id: "watching-1",
    programId: "infinite-challenge",
    title: "무한도전",
    image: "/images/retrov/watching-1.jpg",
    progress: 35,
  },
  {
    id: "watching-2",
    programId: "full-house",
    title: "풀하우스",
    image: "/images/retrov/watching-2.jpg",
    progress: 65,
  },
];

const recommendations = [
  {
    id: "recommend-1",
    programId: "infinite-challenge",
    title: "무한도전 다시 보기",
    image: "/images/retrov/recommend-1.jpg",
    description: "다시 만나도 웃음 나는 그때 그 장면",
  },
  {
    id: "recommend-2",
    programId: "full-house",
    title: "풀하우스 다시 보기",
    image: "/images/retrov/recommend-2.jpg",
    description: "추억 속 드라마를 다시 만나보세요.",
  },
];

const shorts = [
  {
    id: "short-1",
    programId: "infinite-challenge",
    title: "무한도전 명장면",
    image: "/images/retrov/short-1.jpg",
  },
  {
    id: "short-2",
    programId: "full-house",
    title: "풀하우스 명장면",
    image: "/images/retrov/short-2.jpg",
  },
];

export const RetroV = () => {
  return (
    <div className="retrov-detail retrov-main">
      {/* 메인 배너 */}
      <section
        className="program-hero"
        style={{
          backgroundImage:
            'url("/images/retrov/retrov-main-hero.jpg")',
        }}
        aria-labelledby="retrov-title"
      >
        <div className="program-hero__content">
          <p>다시 만나는 우리의 추억</p>

          <h1 id="retrov-title">레트로브</h1>

          <p>그때 우리가 좋아했던 예능과 드라마</p>

          <Link to="/retrov/infinite-challenge">
            무한도전 보러 가기 →
          </Link>
        </div>
      </section>

      <div className="retrov-container">
        {/* 프로그램 선택 */}
        <ProgramNavigation programs={programs} />

        {/* TOP 랭킹 */}
        <section className="video-section">
          <h2>레트로브 TOP 랭킹</h2>

          <ol className="video-section__list">
            {rankings.map((item, index) => (
              <li
                className="video-card"
                key={item.programId}
              >
                <Link to={`/retrov/${item.programId}`}>
                  <div className="video-card__screen">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                    />
                  </div>

                  <h3>
                    {index + 1}. {item.title}
                  </h3>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* 시청 중 콘텐츠 */}
        <section className="video-section">
          <h2>이어서 볼 콘텐츠</h2>

          <ul className="video-section__list">
            {watching.map((item) => (
              <li className="video-card" key={item.id}>
                <Link to={`/retrov/${item.programId}`}>
                  <div className="video-card__screen">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                    />
                  </div>

                  <h3>{item.title}</h3>
                </Link>

                <progress
                  value={item.progress}
                  max="100"
                  aria-label={`${item.title} 시청 진행률`}
                >
                  {item.progress}%
                </progress>
              </li>
            ))}
          </ul>
        </section>

        {/* 추천 콘텐츠 */}
        <section className="video-section">
          <h2>레트로브 추천 콘텐츠</h2>

          <ul className="video-section__list">
            {recommendations.map((item) => (
              <li className="video-card" key={item.id}>
                <Link to={`/retrov/${item.programId}`}>
                  <div className="video-card__screen">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                    />
                  </div>

                  <h3>{item.title}</h3>
                </Link>

                <p>{item.description}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* 쇼츠: 예시에서는 관련 프로그램으로 이동 */}
        <section className="video-section">
          <h2>레트로브 쇼츠 모아보기</h2>

          <ul className="video-section__list">
            {shorts.map((item) => (
              <li className="video-card" key={item.id}>
                <Link to={`/retrov/${item.programId}`}>
                  <div className="video-card__screen">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                    />
                  </div>

                  <h3>{item.title}</h3>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 이벤트 배너 */}
        <aside className="event-banner">
          <p>최애 장면 선택</p>
          <strong>나의 최애 장면은?!</strong>
          <p>잊지 못할 장면을 다시 만나보세요.</p>
        </aside>
      </div>
    </div>
  );
};