import { useCallback, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronDown, Heart, Share2 } from 'lucide-react';

import { programs, programDetails, eventBanners } from '../../data/retrov';
import { characterQuizzes } from '../../data/characterQuizzes';

import RetroVideoRow from '../../components/retrov/RetroVideoRow';
import YoutubePlayerModal from '../../components/retrov/YoutubePlayerModal';
import CharacterQuiz from '../../components/retrov/CharacterQuiz';
import CharacterImagePanel from '../../components/retrov/CharacterImagePanel';

import '../../styles/RetrovDetail.scss';
import '../../styles/Retrov.scss';

export const RetrovDetail = () => {
  const { programId } = useParams();
  const program = programDetails[programId];

  if (!program) {
    return (
      <div className="rv-detail">
        <div className="rv-container rv-empty">
          <h1>준비 중인 프로그램입니다.</h1>
          <p>다른 레트로브 프로그램을 만나보세요.</p>
          <Link to="/retrov">레트로브 메인으로 →</Link>
        </div>
      </div>
    );
  }

  // programId가 바뀌면 key로 내부 상태(선택 캐릭터, 배너 위치)를 초기화
  return <ProgramFanPage key={programId} programId={programId} program={program} />;
};

function ProgramFanPage({ programId, program }) {
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null); // 재생 중인 영상
  const closePlayer = useCallback(() => setPlayingVideo(null), []);

  const seasons = program.seasons ?? [];
  const [seasonId, setSeasonId] = useState(seasons[0]?.id);
  const season = seasons.find((item) => item.id === seasonId);
  const playLabel = season?.playLabel ?? program.playLabel;

  // 캐릭터 클릭 시: "quiz"(무도 퀴즈) | "image"(이미지 카드 — 우결 청첩장, 하이킥·꽃남·풀하우스)
  const isImagePanel = program.characterMode === "image";
  const panelLabel = program.panelLabel ?? "소개";
  // 시즌이 있으면 시즌별 캐릭터(커플), 없으면 프로그램 공통 캐릭터
  const characters = season?.characters ?? program.characters ?? [];
  const sections = program.sections ?? [];
  const otherPrograms = programs.filter((item) => item.id !== programId);
  const castRef = useRef(null);

  const selectedCharacter = characters.find(
    (character) => character.id === selectedCharacterId
  );

  function handleCharacterClick(characterId) {
    setSelectedCharacterId((previousId) =>
      previousId === characterId ? null : characterId
    );
  }

  // 퀴즈 닫고 캐릭터 목록으로 돌아가기
  function backToCharacterList() {
    const previousId = selectedCharacterId;
    setSelectedCharacterId(null);
    castRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    castRef.current?.querySelector(`[data-character="${previousId}"]`)?.focus({ preventScroll: true });
  }

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: program.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert("링크가 복사되었습니다.");
      }
    } catch {
      // 공유 취소 시 무시
    }
  }

  return (
    <div className="rv-detail" style={program.pageBackground ? { background: program.pageBackground } : undefined}>
      {/* 프로그램 배너 */}
      <section
        className="rv-hero"
        style={{ backgroundImage: `url("${program.hero}")` }}
        aria-labelledby="rv-program-title"
      >
        <div className="rv-hero__content">
          <h1 id="rv-program-title" className="rv-hero__logo">
            {program.logo ? <img src={program.logo} alt={program.title} /> : program.title}
          </h1>

          <p className="rv-hero__meta">
            {program.rating && (
              <span className="rv-hero__rating" aria-label={`${program.rating}세 이상 관람가`}>
                {program.rating}
              </span>
            )}
            <span>· {program.genre}</span>
          </p>

          <div className="rv-hero__actions">
            {seasons.length > 0 && (
              <label className="rv-hero__season">
                <span className="sr-only">시즌 선택</span>
                <select
                  value={seasonId}
                  onChange={(e) => {
                    setSeasonId(e.target.value);
                    setSelectedCharacterId(null); // 시즌이 바뀌면 열려 있던 청첩장/퀴즈 닫기
                  }}
                >
                  {seasons.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={22} aria-hidden="true" />
              </label>
            )}

            <button type="button" className="rv-hero__play">
              {playLabel}
            </button>

            <button
              type="button"
              className="rv-hero__icon-btn"
              aria-pressed={isLiked}
              onClick={() => setIsLiked((prev) => !prev)}
            >
              <Heart size={28} strokeWidth={1.5} fill={isLiked ? "currentColor" : "none"} />
              <span>찜</span>
            </button>

            <button type="button" className="rv-hero__icon-btn" onClick={handleShare}>
              <Share2 size={28} strokeWidth={1.5} />
              <span>공유</span>
            </button>
          </div>

          <div className="rv-hero__desc">
            {program.description.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          {program.cast && (
            <p className="rv-hero__cast">
              출연 : {program.cast.join(", ")}
            </p>
          )}
        </div>
      </section>

      {/* 이벤트 배너 */}
      <EventCarousel banners={eventBanners} />


      <div className="rv-container">
        {/* 캐릭터 선택 (해당 시즌 캐릭터가 없으면 숨김) */}
        {characters.length > 0 && (
          <nav
            ref={castRef}
            className="rv-cast"
            aria-label={`${program.title} ${isImagePanel ? panelLabel : "캐릭터 퀴즈"} 선택`}
          >
            {characters.map((character) => (
              <button
                key={character.id}
                type="button"
                className="rv-cast__item"
                data-character={character.id}
                aria-expanded={selectedCharacterId === character.id}
                aria-controls={selectedCharacterId === character.id ? "character-panel" : undefined}
                onClick={() => handleCharacterClick(character.id)}
              >
                <img src={character.image} alt="" />
                <span>{character.name}</span>
              </button>
            ))}
          </nav>
        )}

        {/* 캐릭터 아래에 이미지 카드(우결·하이킥·꽃남·풀하우스) 또는 퀴즈(무도) 표시 */}
        {selectedCharacter && isImagePanel && (
          <CharacterImagePanel key={selectedCharacter.id} character={selectedCharacter} label={panelLabel} />
        )}
        {selectedCharacter && !isImagePanel && (
          <CharacterQuiz
            key={selectedCharacter.id}
            character={selectedCharacter}
            quiz={characterQuizzes[selectedCharacter.id]}
            onClose={() => setSelectedCharacterId(null)}
            onBackToList={backToCharacterList}
          />
        )}

        {/* 테마별 영상 목록 */}
        {sections.map((section) => (
          <RetroVideoRow
            key={section.id}
            id={section.id}
            title={section.title}
            videos={section.videos}
            frame={program.tvFrame}
            onPlay={setPlayingVideo}
          />
        ))}

        {/* 다른 프로그램 */}
        <section className="rv-section rv-others" aria-labelledby="rv-others-title">
          <h2 id="rv-others-title" className="rv-section__title">
            {program.othersTitle ?? "또 다른 그때 그시절 프로그램보기"}
          </h2>

          <ul className="rv-others__list">
            {otherPrograms.slice(0, 5).map((item) => (
              <li key={item.id}>
                <Link to={`/retrov/${item.id}`} className="rv-others__item">
                  <img src={item.thumbnail ?? item.image} alt={item.title} loading="lazy" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 유튜브 재생 팝업 */}
      {playingVideo && <YoutubePlayerModal video={playingVideo} onClose={closePlayer} />}
    </div>
  );
}

// 가운데 배너 + 양옆 배너가 살짝 보이는 캐러셀
function EventCarousel({ banners }) {
  const [current, setCurrent] = useState(0);
  const total = banners.length;
  if (total === 0) return null;

  const move = (step) => setCurrent((prev) => (prev + step + total) % total);
  const getBanner = (offset) => banners[(current + offset + total) % total];

  const slots = total > 1 ? [-1, 0, 1] : [0];

  return (
    <section className="rv-event" aria-roledescription="carousel" aria-label="레트로브 이벤트">
      <div className="rv-event__track">
        {slots.map((offset) => {
          const banner = getBanner(offset);
          const isCenter = offset === 0;
          const [before, highlight, after] = banner.title;

          return (
            <article
              key={`${banner.id}-${offset}`}
              className={`rv-event__slide rv-event__slide--${banner.theme} ${isCenter ? "is-active" : offset < 0 ? "is-prev" : "is-next"
                }`}
              aria-hidden={!isCenter}
              onClick={isCenter ? undefined : () => move(offset)}
            >
              <span className="rv-event__deco rv-event__deco--left" aria-hidden="true">
                ❤
              </span>
              <div className="rv-event__text">
                <p className="rv-event__label">{banner.label}</p>
                <strong className="rv-event__title">
                  {before}
                  <em>{highlight}</em>
                  {after}
                </strong>
                <p className="rv-event__desc">{banner.description}</p>
              </div>
              <span className="rv-event__deco rv-event__deco--right" aria-hidden="true">
                ❤
              </span>
            </article>
          );
        })}
      </div>

      {total > 1 && (
        <>
          <button type="button" className="rv-event__nav rv-event__nav--prev" onClick={() => move(-1)} aria-label="이전 이벤트">
            ‹
          </button>
          <button type="button" className="rv-event__nav rv-event__nav--next" onClick={() => move(1)} aria-label="다음 이벤트">
            ›
          </button>
        </>
      )}
    </section>
  );
}
