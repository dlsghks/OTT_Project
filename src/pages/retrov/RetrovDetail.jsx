import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { programs, programDetails } from '../data/retrov';
import ProgramNavigation from '../components/retrov/ProgramNavigation';
import "../styles/Retrov.scss";

export const RetrovDetail = () => {
  const { programId } = useParams();
  const program = programDetails[programId];

  if (!program) {
    return (
      <div className="retrov-detail">
        <div className="retrov-container">
          <h1>준비 중인 프로그램입니다.</h1>
          <p>다른 레트로브 프로그램을 만나보세요.</p>

          <Link to="/retrov">
            레트로브 메인으로 →
          </Link>
        </div>
      </div>
    );
  }
  return (
    <ProgramFanPage
      key={programId}
      programId={programId}
      program={program}
    />)

  function ProgramFanPage({ programId, program }) {
    const [selectedCharacterId, setSelectedCharacterId] =
      useState(null);

    const characters = program.characters ?? [];
    const sections = program.sections ?? [];

    const selectedCharacter = characters.find(
      (character) => character.id === selectedCharacterId
    );
    const otherPrograms = programs.filter(
      (item) => item.id !== programId
    );
  }
  function handleCharacterClick(characterId) {
    setSelectedCharacterId((previousId) =>
      previousId === characterId ? null : characterId
    );
  }

  return (
    <div className="retrov-detail">
      {/* 프로그램 배너 */}
      <section
        className="program-hero"
        style={{
          backgroundImage: `url("${program.hero}")`,
        }}
        aria-labelledby="program-title"
      >
        <div className="program-hero__content">
          <Link to="/retrov">← 레트로브</Link>

          <h1 id="program-title">{program.title}</h1>

          <p>{program.description}</p>
        </div>
      </section>

      <div className="retrov-container">
        {/* 이벤트 배너 */}
        <aside className="event-banner">
          <p>최애 장면 선택</p>
          <strong>나의 최애 장면은?!</strong>
          <p>잊지 못할 장면을 다시 만나보세요.</p>
        </aside>

        {/* 캐릭터 선택 */}
        <nav
          className="circle-navigation"
          aria-label={`${program.title} 캐릭터 퀴즈 선택`}
        >
          {characters.map((character) => {
            const isSelected =
              selectedCharacterId === character.id;

            return (
              <button
                key={character.id}
                type="button"
                className="circle-navigation__item"
                aria-expanded={isSelected}
                aria-controls={
                  selectedCharacter
                    ? "character-quiz"
                    : undefined
                }
                onClick={() =>
                  handleCharacterClick(character.id)
                }
              >
                <img src={character.image} alt="" />
                <span>{character.name}</span>
              </button>
            );
          })}
        </nav>

        {/* 캐릭터 아래에 퀴즈 표시 */}
        {/* {selectedCharacter && (
          <CharacterQuiz
            key={selectedCharacter.id}
            character={selectedCharacter}
            onClose={() => setSelectedCharacterId(null)}
          />
        )} */}

        {/* 테마별 영상 목록 */}
        {sections.map((section) => (
          <section
            key={section.id}
            className="video-section"
            aria-labelledby={`section-${section.id}`}
          >
            <h2 id={`section-${section.id}`}>
              {section.title}
            </h2>

            <ul className="video-section__list">
              {section.videos.map((video) => (
                <li
                  className="video-card"
                  key={video.id}
                >
                  <div className="video-card__screen">
                    <img
                      src={video.image}
                      alt={video.title}
                      loading="lazy"
                    />
                  </div>

                  <h3>{video.title}</h3>
                  <p>{video.description}</p>

                  {video.date && (
                    <time
                      dateTime={video.date.replaceAll(".", "-")}
                    >
                      {video.date}
                    </time>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}

        {/* 다른 프로그램 */}
        <section className="video-section">
          <h2>또 다른 그때 그 시절 프로그램 보기</h2>

          <ProgramNavigation programs={otherPrograms} />
        </section>

        <Link to="/retrov">
          레트로브 메인으로 →
        </Link>
      </div>
    </div>
  )
}
