import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronDown, Heart, Share } from 'lucide-react';

import { programs, programDetails, eventBanners } from '../../data/retrov';
import { characterQuizzes } from '../../data/characterQuizzes';
import { getTmdbTarget, getEpisodeNumber } from '../../data/retrovTmdb';
import { useRetrovTmdbStore, tmdbImage } from '../../store/useRetrovTmdbStore';
import { useRetrovPlayer } from '../../hooks/useRetrovPlayer';
import { getImagePath } from '../../utils/imagePath';

import RetroVideoRow from '../../components/retrov/RetroVideoRow';
import YoutubePlayerModal from '../../components/retrov/YoutubePlayerModal';
import CharacterQuiz from '../../components/retrov/CharacterQuiz';
import CharacterImagePanel from '../../components/retrov/CharacterImagePanel';
import RetroEventCarousel from '../../components/retrov/RetroEventCarousel';

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
  const { playingVideo, play, close: closePlayer } = useRetrovPlayer(); // 영상 재생 (유튜브 팝업)

  const seasons = program.seasons ?? [];
  const [seasonId, setSeasonId] = useState(seasons[0]?.id);
  const season = seasons.find((item) => item.id === seasonId);
  const playLabel = season?.playLabel ?? program.playLabel;

  // ---------- TMDB (무한도전 제외) ----------
  // tmdb: 선택한 시즌의 TMDB 작품 / baseTmdb: 테마별 영상(1시즌 회차)이 속한 TMDB 작품
  const tmdb = getTmdbTarget(programId, seasonId);
  const firstSeasonId = seasons[0]?.id ?? "default"; // 테마별 영상이 속한 시즌
  const baseTmdb = getTmdbTarget(programId, firstSeasonId);
  const { tvDetail, episodes, youtubeVideos, onFetchTvDetail, onFetchEpisodes } = useRetrovTmdbStore();

  useEffect(() => {
    if (!tmdb) return;
    onFetchTvDetail(tmdb.id);
    onFetchEpisodes(tmdb.id, tmdb.season);
    onFetchEpisodes(baseTmdb.id, baseTmdb.season);
  }, [tmdb, baseTmdb, onFetchTvDetail, onFetchEpisodes]);

  const tmdbShow = tmdb ? tvDetail[tmdb.id] : null;
  const tmdbBackdrop = tmdbImage(tmdbShow?.backdrop_path, "original");

  // 캐릭터 클릭 시: "quiz"(무도 퀴즈) | "image"(이미지 카드 — 우결 청첩장, 하이킥·꽃남·풀하우스)
  const isImagePanel = program.characterMode === "image";
  const panelLabel = program.panelLabel ?? "소개";
  // 시즌이 있으면 시즌별 캐릭터(커플), 없으면 프로그램 공통 캐릭터
  const characters = season?.characters ?? program.characters ?? [];
  // 테마별 영상 목록 — TMDB 프로그램이면 영상마다 고유 id·회차(source)와 대체 이미지를 붙임
  const sections = useMemo(() => {
    const list = program.sections ?? [];
    if (!tmdb) return list; // 무한도전: 엑셀 데이터(videoId) 그대로

    const seasonEpisodes = episodes[`${tmdb.id}_${tmdb.season}`] ?? [];
    // 회차별 유튜브 영상 ID (데이터의 youtubeIds) — 테마 영상은 첫 시즌 회차 기준
    const seasonYoutubeIds = program.youtubeIds?.[seasonId] ?? {};
    const baseYoutubeIds = program.youtubeIds?.[firstSeasonId] ?? {};
    const baseEpisodes = episodes[`${baseTmdb.id}_${baseTmdb.season}`] ?? [];

    return list.map((section) => {
      // "tmdb-episodes": TMDB 회차 목록을 그대로 카드로 (선택한 시즌 기준)
      if (section.source === "tmdb-episodes") {
        return {
          ...section,
          title: seasonEpisodes.length ? `${section.title} ${seasonEpisodes.length}회` : section.title,
          videos: seasonEpisodes
            .slice(0, section.maxEpisodes ?? seasonEpisodes.length) // maxEpisodes: 앞에서부터 N회까지만
            .map((ep) => episodeToVideo(ep, tmdb, tmdbBackdrop, youtubeVideos, seasonYoutubeIds)),
        };
      }

      // 직접 고른 테마 영상: 제목의 회차 번호로 TMDB 회차와 연결
      return {
        ...section,
        videos: section.videos.map((video) => {
          const episode = getEpisodeNumber(video);
          const tmdbEpisode = baseEpisodes.find((ep) => ep.episode_number === episode);
          const query = episode ? `${baseTmdb.searchTitle} ${episode}회` : `${baseTmdb.searchTitle} ${video.title}`;
          const videoId = video.videoId ?? baseYoutubeIds[episode] ?? null; // 확인된 유튜브 ID 가 있으면 그 영상으로
          return {
            ...video,
            videoId,
            // 썸네일: TMDB 장면 사진(고유 id·회차) → 확인된 유튜브 ID → 이미 찾은 유튜브 영상 → 프로그램 배경
            fallbackImage: tmdbImage(tmdbEpisode?.still_path, "w500") ?? youtubeThumb(videoId) ?? youtubeThumb(youtubeVideos[query]) ?? tmdbBackdrop,
            source: { tmdbId: baseTmdb.id, season: baseTmdb.season, episode, query },
          };
        }),
      };
    });
  }, [program.sections, program.youtubeIds, firstSeasonId, seasonId, tmdb, baseTmdb, episodes, youtubeVideos, tmdbBackdrop]);

  // 히어로 "1화 보기": 선택한 시즌의 1화 재생 (TMDB 프로그램만)
  function playFirstEpisode() {
    if (!tmdb) return;
    const first = (episodes[`${tmdb.id}_${tmdb.season}`] ?? [])[0];
    play(first ? episodeToVideo(first, tmdb, tmdbBackdrop, youtubeVideos, program.youtubeIds?.[seasonId]) : {
      id: `${tmdb.id}-s${tmdb.season}-e1`,
      title: `${tmdb.searchTitle} 1회`,
      source: { tmdbId: tmdb.id, season: tmdb.season, episode: 1, query: `${tmdb.searchTitle} 1회` },
    });
  }
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
    <div className="rv-detail"
      style={
        program.pageBackground ? { background: program.pageBackground } : undefined}>
      {/* 프로그램 배너 */}
      <section
        className="rv-hero"
        style={{
          // 앞 이미지(직접 넣은 히어로)가 없으면 뒤 이미지(TMDB 배경)가 보임
          backgroundImage: [program.hero && `url("${getImagePath(program.hero)}")`, tmdbBackdrop && `url("${tmdbBackdrop}")`]
            .filter(Boolean)
            .join(", "),
        }}
        aria-labelledby="rv-program-title"
      >
        <div className="rv-hero__content">
          <h1 id="rv-program-title" className="rv-hero__logo">
            {program.logo
              ? <img src={getImagePath(program.logo)} alt={program.title} />
              : program.title}
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

            <button type="button" className="rv-hero__play" onClick={playFirstEpisode}>
              {playLabel}
            </button>

            <button
              type="button"
              className="rv-hero__icon-btn"
              aria-pressed={isLiked}
              onClick={() => setIsLiked((prev) => !prev)}
            >
              <Heart size={32} strokeWidth={1.5} fill={isLiked ? "currentColor" : "none"} />
              <span>관심</span>
            </button>

            <button type="button" className="rv-hero__icon-btn" onClick={handleShare}>
              <Share size={32} strokeWidth={1.5} />
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
      <RetroEventCarousel banners={eventBanners} />


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
                <img src={getImagePath(character.image)} alt="" />
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
            onPlay={play}
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
                  <img
                    src={getImagePath(item.thumbnail ?? item.image)}
                    alt={item.title}
                    loading="lazy"
                  />
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

// 유튜브 영상 썸네일 (API 사용량 없음)
function youtubeThumb(videoId) {
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;
}

// TMDB 에피소드 → 영상 카드 데이터
function episodeToVideo(ep, tmdb, fallbackImage, youtubeVideos = {}, youtubeIds = {}) {
  const n = ep.episode_number;
  const query = `${tmdb.searchTitle} ${n}회`;
  const videoId = youtubeIds[n] ?? null; // 확인된 유튜브 영상 ID
  const hasName = ep.name && !/^(에피소드|Episode)\s*\d+$/.test(ep.name); // "에피소드 1" 같은 기본 제목은 생략
  return {
    id: `tmdb-${tmdb.id}-s${tmdb.season}-e${n}`,
    title: hasName ? `[${n}회] ${ep.name}` : `${n}회`,
    description: ep.overview,
    date: ep.air_date?.replaceAll("-", "."),
    videoId,
    fallbackImage: tmdbImage(ep.still_path, "w500") ?? youtubeThumb(videoId) ?? youtubeThumb(youtubeVideos[query]) ?? fallbackImage,
    source: { tmdbId: tmdb.id, season: tmdb.season, episode: n, query },
  };
}
