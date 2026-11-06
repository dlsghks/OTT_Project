import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

import RetroTvFrame from '../retrov/RetroTvFrame';
import YoutubePlayerModal from '../common/YoutubePlayerModal';
import { programs } from '../../data/retrov/retrov';
import { getEpisodeSource } from '../../data/retrov/retrovTmdb';
import { useRetrovPlayer } from '../../hooks/useRetrovPlayer';
import { useRetrovTmdbStore, tmdbImage } from '../../store/useRetrovTmdbStore';
import { getImagePath } from '../../utils/imagePath';

import nextArt from '../../assets/responsive/quiz-next.png';
import favoriteArt from '../../assets/mypage/quiz-favorite.png';
import nextLineArt from '../../assets/retrov/event-next-line-tv.svg'; // 레트로 TV (명대사 이벤트 디자인)
import logoFullHouse from '../../assets/retrov/logo-full-house.svg'; // 레트로브 상세 hero 로고 (컬러)
import logoHighKick from '../../assets/retrov/logo-high-kick.svg';
import logoWeGotMarried from '../../assets/retrov/logo-we-got-married.svg';

import '../../styles/pages/event/RetroVoteEvent.scss';

// 히어로 일러스트 (레트로브 이벤트 배너와 같은 그림)
const ART = { 'what-next': nextArt, 'favorite-scene': favoriteArt, 'next-line': nextLineArt };
// 하단 프로그램 카드 포스터 (없으면 프로그램 배너 사진)
const LOGOS = { 'full-house': logoFullHouse, 'high-kick': logoHighKick, 'we-got-married': logoWeGotMarried };
// 프로그램 보러 가기 포스터: 레트로브 TOP 랭킹과 같은 디자인 포스터 (public/images/retrov/main/poster)
const posterOf = (programId) => getImagePath(`/images/retrov/main/poster/${programId}.png`);

const CIRCLED = ['①', '②', '③', '④', '⑤'];

// 배경 장식 (반짝이 · 하트, 하이킥은 하트 대신 번개) — 위치는 영역 기준 %, s: 모바일 기준 크기(px)
const DECOS = {
  hero: [
    { shape: 'sparkle', top: '9%', left: '10%', s: 14 },
    { shape: 'sparkle', top: '11%', right: '13%', s: 16 },
    { shape: 'heart', top: '36%', left: '14%', s: 10 },
    { shape: 'heart', top: '42%', right: '17%', s: 10 },
    { shape: 'sparkle', top: '60%', left: '9%', s: 8 },
    { shape: 'sparkle', top: '66%', right: '12%', s: 10 },
  ],
  vote: [
    { shape: 'sparkle', top: '20%', left: '8%', s: 10 },
    { shape: 'heart', top: '13%', right: '13%', s: 9 },
    { shape: 'sparkle', top: '38%', right: '10%', s: 8 },
  ],
};

// 우결 히어로 (디자인: 하트가 많고 흐린 큰 하트가 섞임)
const FAVORITE_DECOS = [
  { shape: 'sparkle', top: '15%', left: '13%', s: 12 },
  { shape: 'sparkle', top: '67%', left: '13%', s: 8 },
  { shape: 'sparkle', top: '73%', right: '11%', s: 11 },
  { shape: 'heart', top: '28%', left: '7%', s: 24 },
  { shape: 'heart', top: '41%', left: '18%', s: 11 },
  { shape: 'heart', top: '44%', right: '14%', s: 11 },
  { shape: 'heart', top: '75%', right: '22%', s: 25 },
];
const SOFT_HEARTS = [
  { top: '52%', left: '9%', s: 32 },
  { top: '79%', left: '45%', s: 30 },
  { top: '68%', right: '-2%', s: 40 },
];

// 장식 모양 (디자인 시안 파일: src/assets/retrov/deco-star.svg · deco-heart.svg) — 색은 테마 변수로 채움
const SHAPES = {
  sparkle: { viewBox: '0 0 19 19', d: 'M9.34375 0L11.375 7.3125L18.6875 9.34375L11.375 11.375L9.34375 18.6875L7.3125 11.375L0 9.34375L7.3125 7.3125L9.34375 0Z' },
  heart: { viewBox: '0 0 9 7', d: 'M4.08297 6.63323L0.691666 3.43033C-1.3808 1.16946 1.6337 -1.46822 4.08297 0.981057C6.53225 -1.46822 9.54674 1.16946 7.47428 3.43033L4.08297 6.63323Z' },
  bolt: { viewBox: '0 0 24 24', d: 'M13 1 3 14h7l-2 9 11-14h-7l1-8z' },
};

function Decorations({ items, theme, soft = false }) {
  return items.map(({ shape, s, ...position }, index) => {
    const type = shape === 'heart' && theme === 'purple' ? 'bolt' : shape;
    const { viewBox, d } = SHAPES[soft ? 'heart' : type];
    return (
      <svg
        key={index}
        className={`rv-vote-event__deco rv-vote-event__deco--${soft ? 'soft' : type}`}
        style={{ ...position, '--s': s }}
        viewBox={viewBox}
        aria-hidden="true"
      >
        <path d={d} />
      </svg>
    );
  });
}

function youtubeThumb(videoId) {
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;
}

// 장면별 썸네일 · 재생 정보
// - videoId: 유튜브 썸네일 + 바로 재생
// - seasonId · episode: TMDB 회차 장면 사진 + source(TMDB → 유튜브 검색)로 재생
// - query: 유튜브 검색 (결과는 브라우저에 저장돼 재사용)
function useSceneMedia(programId, scenes) {
  const { episodes, youtubeVideos, onFetchEpisodes, onFetchYoutubeSearch } = useRetrovTmdbStore();

  const sources = useMemo(
    () =>
      scenes.map((scene) =>
        scene.episode ? getEpisodeSource(programId, scene.seasonId, scene.episode) : scene.query ? { query: scene.query } : null
      ),
    [programId, scenes]
  );

  useEffect(() => {
    scenes.forEach((scene, index) => {
      const source = sources[index];
      if (scene.videoId) return;
      if (source?.tmdbId) onFetchEpisodes(source.tmdbId, source.season);
      else if (scene.query) onFetchYoutubeSearch(scene.query);
    });
  }, [scenes, sources, onFetchEpisodes, onFetchYoutubeSearch]);

  return scenes.map((scene, index) => {
    const source = sources[index];
    const videoId = scene.videoId ?? (scene.query ? youtubeVideos[scene.query] : null) ?? null;
    const still = source?.tmdbId
      ? episodes[`${source.tmdbId}_${source.season}`]?.find((ep) => ep.episode_number === source.episode)?.still_path
      : null;
    return { videoId, source, image: youtubeThumb(videoId) ?? tmdbImage(still, 'w780') };
  });
}

// 레트로브 투표 이벤트 (/event/what-next · /event/favorite-scene · /event/next-line)
// 상단 바 → 히어로 → 참여 방법 → 투표(장면 + 보기) → 투표 결과 → 프로그램 카드 → 유의사항
// 데이터: src/data/retrov/retrovEvents.js
export const RetroVoteEvent = ({ eventId, theme, programId, programTitle, title, period, hero, steps, vote, result, promo, notices = [] }) => {
  const [selected, setSelected] = useState(null); // 고른 보기 (투표 전)
  const [voted, setVoted] = useState(null); // 투표한 보기 → 결과 화면
  const { playingVideo, play, close } = useRetrovPlayer();

  const program = programs.find((item) => item.id === programId);
  // 히어로 '레트로브 × 로고': 컬러 프로그램 로고 (없으면 동그란 아이콘)
  const logo = LOGOS[programId];
  const icon = program?.image;
  const isScenes = vote.type === 'scenes'; // 우결: 장면 카드 3개 중 선택 / 그 외: 장면 1개 + 보기 3개
  const scenes = useMemo(() => (isScenes ? vote.options.map((option) => option.scene) : [vote.scene]), [isScenes, vote]);
  const media = useSceneMedia(programId, scenes);
  const fallbackImage = getImagePath(program?.thumbnail);

  function playScene(index, label) {
    play({
      id: `${eventId}-${index}`,
      title: label ?? `${programTitle} | ${title}`,
      videoId: media[index].videoId,
      source: media[index].source,
    });
  }

  // 득표율: 다른 팬들의 기본 득표 + 내 1표
  const totals = vote.options.map((option) => option.votes * 100 + (voted === option.id ? 1 : 0));
  const sum = totals.reduce((total, count) => total + count, 0);
  const percents = totals.map((count) => Math.round((count / sum) * 100));
  const topIndex = totals.indexOf(Math.max(...totals));

  function handleSubmit(e) {
    e.preventDefault();
    if (selected) setVoted(selected);
  }

  // 결과 버튼: 장면 1개면 그 장면(정답), 장면 카드면 1위 장면
  function playResult() {
    if (isScenes) playScene(topIndex, vote.options[topIndex].label);
    else playScene(0);
  }

  return (
    <div className={`event-page rv-vote-event rv-vote-event--${theme}`}>
      <header className="rv-vote-event__bar">
        <h1>
          [{programTitle}] {title}
        </h1>
        <p>이벤트 기간 {period}</p>
      </header>

      <div className="rv-vote-event__paper">
        {/* 히어로 */}
        <section className="rv-vote-event__hero" aria-label="이벤트 소개">
          <p className="rv-vote-event__brand">
            레트로브 <span aria-hidden="true">×</span>
            {logo ? <img src={logo} alt={programTitle} /> : icon ? <img src={getImagePath(icon)} alt={programTitle} /> : programTitle}
          </p>
          <h2 className="rv-vote-event__headline">
            <span>{hero.title[0]}</span>
            <em>{hero.title[1]}</em>
          </h2>
          <p className="rv-vote-event__lead">{hero.lead}</p>
          <p className="rv-vote-event__desc">
            {hero.description.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
          {theme === 'magenta' ? (
            <>
              {/* 우결: 따옴표 그림을 오른쪽 위 + 좌우 반전해 왼쪽 아래, 하트 · 흐린 큰 하트 */}
              <img className="rv-vote-event__art rv-vote-event__art--top" src={ART[eventId]} alt="" />
              <img className="rv-vote-event__art rv-vote-event__art--bottom" src={ART[eventId]} alt="" />
              <Decorations items={FAVORITE_DECOS} theme={theme} />
              <Decorations items={SOFT_HEARTS} theme={theme} soft />
            </>
          ) : (
            <>
              <img className="rv-vote-event__art" src={ART[eventId]} alt="" />
              <Decorations items={DECOS.hero} theme={theme} />
            </>
          )}
        </section>

        {/* 참여 방법 */}
        <section className="rv-vote-event__section rv-vote-event__section--steps">
          <h2 className="rv-vote-event__title">{steps.title}</h2>
          <p className="rv-vote-event__subtitle">{steps.description}</p>
          <ol className="rv-vote-event__steps">
            {steps.items.map((item, index) => (
              <li key={item.title}>
                <em>step {index + 1}</em>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* 투표 */}
        <section className="rv-vote-event__section rv-vote-event__section--vote">
          <Decorations items={DECOS.vote} theme={theme} />
          <h2 className="rv-vote-event__title">{vote.title}</h2>
          <p className="rv-vote-event__subtitle">{vote.description}</p>

          {!isScenes && (
            <SceneTv
              src={media[0].image ?? fallbackImage}
              label={`${programTitle} 장면 재생`}
              onPlay={() => playScene(0)}
              className="rv-vote-event__tv"
            />
          )}

          {voted ? (
            <div className="rv-vote-event__result" role="status">
              <h3>{result.title}</h3>
              <p>{result.description}</p>
              <ol>
                {vote.options.map((option, index) => (
                  <li key={option.id} className={voted === option.id ? 'is-mine' : ''}>
                    <div className="rv-vote-event__result-label">
                      <span>
                        {CIRCLED[index]} {option.label}
                      </span>
                      <strong>{percents[index]}%</strong>
                      {voted === option.id && <em>나의 선택</em>}
                    </div>
                    <span className="rv-vote-event__bar-track" aria-hidden="true">
                      <span style={{ width: `${percents[index]}%` }} />
                    </span>
                  </li>
                ))}
              </ol>
              <button type="button" className="rv-vote-event__button" onClick={playResult}>
                {result.button} <span aria-hidden="true">▶</span>
              </button>
            </div>
          ) : (
            <form className="rv-vote-event__form" onSubmit={handleSubmit}>
              <fieldset>
                {isScenes ? (
                  <legend className="sr-only">{vote.title}</legend>
                ) : (
                  <legend className="rv-vote-event__question">{vote.question}</legend>
                )}

                {vote.options.map((option, index) =>
                  isScenes ? (
                    <div key={option.id} className={`rv-vote-event__scene ${selected === option.id ? 'is-selected' : ''}`}>
                      <SceneTv
                        src={media[index].image ?? fallbackImage}
                        label={`${option.couple} 장면 재생`}
                        onPlay={() => playScene(index, option.label)}
                      />
                      <label className="rv-vote-event__scene-info">
                        <input
                          type="radio"
                          name={`${eventId}-vote`}
                          value={option.id}
                          checked={selected === option.id}
                          onChange={() => setSelected(option.id)}
                        />
                        <em>scene {index + 1}</em>
                        <strong>{option.label}</strong>
                        <span className="rv-vote-event__couple">{option.couple}</span>
                        <span className="rv-vote-event__scene-text">
                          {option.text.map((line) => (
                            <span key={line}>{line}</span>
                          ))}
                        </span>
                      </label>
                    </div>
                  ) : (
                    <label key={option.id} className="rv-vote-event__option">
                      <input
                        type="radio"
                        name={`${eventId}-vote`}
                        value={option.id}
                        checked={selected === option.id}
                        onChange={() => setSelected(option.id)}
                      />
                      <span>
                        {CIRCLED[index]} {option.label}
                      </span>
                    </label>
                  )
                )}
              </fieldset>

              <button type="submit" className="rv-vote-event__button" disabled={!selected}>
                {vote.submit}
              </button>
            </form>
          )}
        </section>

        {/* 프로그램 카드 */}
        <section className="rv-vote-event__section rv-vote-event__section--promo">
          <h2 className="rv-vote-event__title">{promo.title}</h2>
          <p className="rv-vote-event__subtitle">{promo.description}</p>
          <div className="rv-vote-event__promo">
            <img src={posterOf(programId)} alt={`${programTitle} 포스터`} />
            <div>
              <h3>{programTitle}</h3>
              <p>
                {promo.text.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </p>
              <Link to={`/retrov/${programId}`} className="rv-vote-event__button">
                {promo.button}
              </Link>
            </div>
          </div>
        </section>

        {/* 유의사항 */}
        <section className="rv-vote-event__notice">
          <h2>참여 전 확인해 주세요</h2>
          <ul>
            {notices.map((notice) => (
              <li key={notice}>{notice}</li>
            ))}
          </ul>
        </section>
      </div>

      {playingVideo && <YoutubePlayerModal video={playingVideo} onClose={close} />}
    </div>
  );
};

// 브라운관 TV 속 장면 (누르면 영상 재생)
function SceneTv({ src, label, onPlay, className = '' }) {
  return (
    <button type="button" className={`rv-vote-event__tv-button ${className}`.trim()} onClick={onPlay} aria-label={label}>
      <RetroTvFrame src={src} alt="" />
      <span className="rv-vote-event__play" aria-hidden="true">
        <Play size={22} fill="currentColor" />
      </span>
    </button>
  );
}
