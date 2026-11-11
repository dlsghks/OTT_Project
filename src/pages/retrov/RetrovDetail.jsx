import { VoucherWatchActions } from '../../components/common/VoucherWatchActions';
import { SectionTitle } from '../../components/common/SectionTitle';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { programs, programDetails, eventBanners } from '../../data/retrov/retrov';
import { characterQuizzes } from '../../data/retrov/characterQuizzes';
import { getTmdbTarget, getEpisodeNumber } from '../../data/retrov/retrovTmdb';
import { useRetrovTmdbStore, tmdbImage } from '../../store/useRetrovTmdbStore';
import { useRetrovPlayer } from '../../hooks/useRetrovPlayer';
import { getImagePath } from '../../utils/imagePath';
// 관심 · 공유 아이콘 (레트로브 디자인 시안)
import likeIcon from '../../assets/retrov/icon-like.png';
import likeActiveIcon from '../../assets/retrov/icon-like-active.png';
import shareIcon from '../../assets/retrov/icon-share.png';
import closeIcon from '../../assets/retrov/icon-close.svg'; // 모바일 히어로 닫기 (디자인 시안)
// 예능~해외시리즈 상세와 공통: 로그인 · 관심 · 공유 동작, 로그인 팝업, 펼치기 상세 정보
import { useDetailActions } from '../../hooks/useDetailActions';
import { LoginModal } from '../../components/common/LoginModal';
import { DetailInfo } from '../../components/detail/DetailInfo';
import { getDetailInfo, getInfoRows, getTvInfo } from '../../services/tmdbDetail';

import RetroVideoRow from '../../components/retrov/RetroVideoRow';
import YoutubePlayerModal from '../../components/common/YoutubePlayerModal';
import CharacterQuiz from '../../components/retrov/CharacterQuiz';
import CharacterImagePanel from '../../components/retrov/CharacterImagePanel';
import RetroEventCarousel from '../../components/retrov/RetroEventCarousel';
import { ShareModal } from '../../components/common/ShareModal';

import '../../styles/pages/retrov/RetrovDetail.scss';
import '../../styles/pages/retrov/Retrov.scss';

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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  // 로그인 전: 재생 · 관심 · 공유 버튼 → 로그인 팝업 (예능~해외시리즈 상세와 같은 동작)
  const favoriteProgram = programs.find((item) => item.id === programId);
  const actions = useDetailActions({
    id: `retrov:${programId}`,
    title: program.title,
    type: "program",
    image: favoriteProgram?.thumbnail || program.hero || program.logo,
  });
  const { isLiked, onLike } = actions;

  // 펼치기: 펼치기 직전의 히어로 높이 · 내용 시작 위치 (펼친 뒤에도 로고 · 버튼 자리 고정)
  const [expanded, setExpanded] = useState(false);
  const [heroFrame, setHeroFrame] = useState(null);
  const heroRef = useRef(null);
  const heroContentRef = useRef(null);
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
  // 히어로 배경: 앞 이미지(직접 넣은 히어로)가 없으면 뒤 이미지(TMDB 배경)가 보임
  const heroBackground = [program.hero && `url("${getImagePath(program.hero)}")`, tmdbBackdrop && `url("${tmdbBackdrop}")`]
    .filter(Boolean)
    .join(", ");
  // 펼치기 정보: TMDB 연결 프로그램은 TMDB 정보, 없으면(무한도전) 데이터의 info
  const infoRows = getInfoRows(tmdbShow ? getTvInfo(tmdbShow) : program.info ? getDetailInfo(program.info) : []);

  function expandHero() {
    setHeroFrame({
      heroHeight: heroRef.current?.offsetHeight ?? 0,
      contentTop: heroContentRef.current?.offsetTop ?? 0,
    });
    setExpanded(true);
  }

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
        // firstSeasonOnly: 시즌을 바꿔도 첫 시즌 회차로 고정 (다른 시즌 영상 ID 가 아직 없을 때)
        const target = section.firstSeasonOnly ? baseTmdb : tmdb;
        const list = section.firstSeasonOnly ? baseEpisodes : seasonEpisodes;
        const ids = section.firstSeasonOnly ? baseYoutubeIds : seasonYoutubeIds;
        const common = commonSentences(list); // 매회 반복되는 소개 문구 (설명에서 제외)
        return {
          ...section,
          title: list.length ? `${section.title} ${list.length}회` : section.title,
          videos: list
            .slice(0, section.maxEpisodes ?? list.length) // maxEpisodes: 앞에서부터 N회까지만
            .filter((ep) => !section.onlyWithVideo || ids[ep.episode_number]) // onlyWithVideo: 영상 ID 있는 회차만
            .map((ep) => episodeToVideo(ep, target, tmdbBackdrop, youtubeVideos, ids, common, program.descriptionStrip)),
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
            // 썸네일: 카드에 직접 넣은 클립 videoId → TMDB 장면 사진(고유 id·회차) → 회차별 유튜브 ID → 이미 찾은 유튜브 영상 → 프로그램 배경
            //   (같은 회차의 클립이 여러 개여도 카드마다 다른 썸네일이 나오도록 클립 ID 를 가장 먼저 사용)
            fallbackImage:
              youtubeThumb(video.videoId) ??
              tmdbImage(tmdbEpisode?.still_path, "w500") ??
              youtubeThumb(videoId) ??
              youtubeThumb(youtubeVideos[query]) ??
              tmdbBackdrop,
            source: { tmdbId: baseTmdb.id, season: baseTmdb.season, episode, query },
          };
        }),
      };
    });
  }, [program.sections, program.youtubeIds, program.descriptionStrip, firstSeasonId, seasonId, tmdb, baseTmdb, episodes, youtubeVideos, tmdbBackdrop]);

  // 히어로 재생 버튼: playVideoId 가 있으면 테마별 영상 중 그 영상(무한도전), 없으면 선택한 시즌의 1화 (TMDB 프로그램)
  function playFirstEpisode() {
    if (program.playVideoId) {
      const target = sections.flatMap((section) => section.videos).find((video) => video.id === program.playVideoId);
      if (target) play(target);
      return;
    }
    if (season?.firstEpisode) {
      play({ id: `${programId}-${seasonId}-e1`, title: `${season.label} 1회`, ...season.firstEpisode });
      return;
    }
    if (!tmdb) return;
    const first = (episodes[`${tmdb.id}_${tmdb.season}`] ?? [])[0];
    play(first ? episodeToVideo(first, tmdb, tmdbBackdrop, youtubeVideos, program.youtubeIds?.[seasonId], undefined, program.descriptionStrip) : {
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



  return (
    <>
      {/* 배경색은 모든 프로그램 공통: src/styles/retrov/_variables.scss 의 $retrov-detail-bg */}
      <div className="rv-detail">
        {/* 프로그램 배너 */}
        <section
          ref={heroRef}
          className={`rv-hero ${expanded ? "is-expanded" : ""}`}
          style={
            // 펼치면 배경은 펼치기 전 높이에 고정(::after)되고 히어로만 아래로 늘어남
            expanded && heroFrame
              ? { "--hero-bg": heroBackground, "--hero-height": `${heroFrame.heroHeight}px`, "--content-top": `${heroFrame.contentTop}px` }
              : { backgroundImage: heroBackground }
          }
          aria-labelledby="rv-program-title"
        >
          {/* 모바일: 오른쪽 위 닫기 → 레트로브 메인 (PC에서는 숨김) */}
          <Link to="/retrov" className="rv-hero__close" aria-label="레트로브 메인으로 돌아가기">
            <img src={closeIcon} alt="" width="16" height="16" />
          </Link>

          <div ref={heroContentRef} className="rv-hero__content">
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
              {actions.hasVoucher && seasons.length > 0 && (
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

              {actions.hasVoucher ? (
                <button type="button" className="rv-hero__play" onClick={playFirstEpisode} aria-label={playLabel}>
                  <span className="rv-hero__play-label">{playLabel}</span>
                  <span className="rv-hero__play-label rv-hero__play-label--mobile" aria-hidden="true">시청하기</span>
                </button>
              ) : (
                <VoucherWatchActions onPurchase={actions.onPurchaseVoucher} />
              )}

              <button
                type="button"
                className="rv-hero__icon-btn"
                aria-pressed={isLiked}
                disabled={actions.likeBusy}
                onClick={onLike}
              >
                <img className="rv-hero__icon" src={isLiked ? likeActiveIcon : likeIcon} alt="" width="37" height="33" />
                <span>관심</span>
              </button>

              <button
                type="button"
                className="rv-hero__icon-btn"
                onClick={() => setIsShareModalOpen(true)}
              >
                <img className="rv-hero__icon" src={shareIcon} alt="" width="34" height="28" />
                <span>공유</span>
              </button>
            </div>

            {actions.likeError && <p role="alert">{actions.likeError}</p>}

            <div className="rv-hero__desc">
              {program.description.map((line) => (
                <p key={line}>{line}</p>
              ))}
              {/* 모바일: 설명 3줄 + 더보기 → 펼치기와 같은 동작 (PC에서는 숨김) */}
              {!expanded && (
                <button type="button" className="rv-hero__more" aria-expanded={false} onClick={expandHero}>
                  더보기
                </button>
              )}
            </div>

            {program.cast && (
              <p className="rv-hero__cast">
                출연 : {program.cast.join(", ")}
              </p>
            )}

            {/* 펼치기: 출연 아래로 상세 정보(개요 · 장르 · 감독 · 작가) → 아래 내용은 그만큼 밀림 */}
            {expanded && <DetailInfo rows={infoRows} className="rv-hero-info" />}
          </div>

          {/* 펼치기: 히어로 아래 가운데 / 접기: 상세 정보 아래 가운데 */}
          {infoRows.length > 0 && (expanded ? (
            <button type="button" className="rv-hero__toggle rv-hero__toggle--fold" aria-expanded={true} onClick={() => setExpanded(false)}>
              <ChevronUp size={16} aria-hidden="true" />
              접기
            </button>
          ) : (
            <button type="button" className="rv-hero__toggle" aria-expanded={false} onClick={expandHero}>
              <ChevronDown size={16} aria-hidden="true" />
              펼치기
            </button>
          ))}
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
            <SectionTitle id="rv-others-title" className="rv-section__title">
              {program.othersTitle ?? "또 다른 그때 그시절 프로그램보기"}
            </SectionTitle>

            <ul className="rv-others__list">
              {otherPrograms.slice(0, 5).map((item) => (
                <li key={item.id}>
                  <Link to={`/retrov/${item.id}`} className="rv-others__item">
                    <img
                      src={getImagePath(item.another ?? item.thumbnail ?? item.image)}
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

      {/* 로그인 팝업: 레트로브 글씨체가 섞이지 않도록 .rv-detail 바깥에 */}
      <LoginModal isOpen={actions.loginOpen} onClose={actions.onCloseLogin} />
      {isShareModalOpen && (
        <ShareModal
          title={program.title}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </>
  );
}

// 유튜브 영상 썸네일 (API 사용량 없음)
function youtubeThumb(videoId) {
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;
}

// TMDB 에피소드 → 영상 카드 데이터
// ---------- TMDB 회차 제목·줄거리 → 카드용 짧은 제목 / 회차마다 다른 설명 ----------
const normText = (s) => (s || "").replace(/[\s~!?.,'"‘’“”<>♬♪·-]/g, "");
const splitSentences = (s) =>
  (s || "").replace(/\s+/g, " ").trim().split(/(?<=[.!?…♬])\s*/).map((x) => x.trim()).filter(Boolean);
const PART_STORY = /(두|세|네|다섯)\s?번째\s?이야기/;

// 제목: ‘장소’ 또는 <장소> 를 꺼내고, "두 번째 이야기" 같은 회차 구분을 붙임
function shortEpisodeTitle(name) {
  const s = (name || "").replace(/\s+/g, " ").trim();
  const quoted = s.match(/[‘'<]([^’'>]+)(?:[’'>]|$)/);
  let base = quoted ? quoted[1] : s.replace(/^-[^-]+-\s*/, "").split(/[~!]/)[0];
  base = base.replace(/[-–]\s*(두|세|네|다섯)\s?번째\s?이야기.*$/, "").replace(/[!~\s]+$/, "").trim() || s;
  const part = s.match(PART_STORY);
  return part ? `${base} · ${part[1]} 번째 이야기` : base;
}

// 시즌 회차의 20% 이상에서 반복되는 문장 (예: 매회 같은 프로그램 소개 문구)
function commonSentences(episodeList) {
  const count = new Map();
  for (const ep of episodeList) {
    for (const x of new Set(splitSentences(ep.overview).map(normText))) count.set(x, (count.get(x) || 0) + 1);
  }
  const limit = Math.max(3, episodeList.length * 0.2);
  return new Set([...count].filter(([, c]) => c >= limit).map(([x]) => x));
}

// 데이터의 descriptionStrip 문구를 줄거리에서 제거 (띄어쓰기 차이는 무시)
function stripPhrases(text, phrases = []) {
  return phrases.reduce((s, phrase) => {
    const pattern = phrase.trim().split(/\s+/).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s*");
    return s.replace(new RegExp(pattern, "g"), " ");
  }, text || "").replace(/\s+/g, " ").trim();
}

// 설명: 반복 소개 문구 · 제목과 같은 문장 · 장소 소개 문장을 빼고 그 회차만의 내용만
function episodeDescription(ep, common, strip = []) {
  const overview = stripPhrases(ep.overview, strip);
  const title = normText(ep.name);
  const place = normText(shortEpisodeTitle(ep.name).split(" · ")[0]);
  const rest = splitSentences(overview).filter((x) => {
    const n = normText(x);
    return n.length > 3 && !common.has(n) && !title.includes(n) && !(place.length >= 2 && n.includes(place)) && !/번째(여정|여행)/.test(n.slice(0, 16));
  });
  return rest.join(" ").replace(/^[’'>\s]+/, "").trim() || overview;
}

function episodeToVideo(ep, tmdb, fallbackImage, youtubeVideos = {}, youtubeIds = {}, common = new Set(), strip = []) {
  const n = ep.episode_number;
  const query = `${tmdb.searchTitle} ${n}회`;
  const videoId = youtubeIds[n] ?? null; // 확인된 유튜브 영상 ID
  const hasName = ep.name && !/^(에피소드|Episode)\s*\d+$/.test(ep.name); // "에피소드 1" 같은 기본 제목은 생략
  return {
    id: `tmdb-${tmdb.id}-s${tmdb.season}-e${n}`,
    title: hasName ? `[${n}회] ${shortEpisodeTitle(ep.name)}` : `${n}회`,
    description: episodeDescription(ep, common, strip),
    date: ep.air_date?.replaceAll("-", "."),
    videoId,
    fallbackImage: tmdbImage(ep.still_path, "w500") ?? youtubeThumb(videoId) ?? youtubeThumb(youtubeVideos[query]) ?? fallbackImage,
    source: { tmdbId: tmdb.id, season: tmdb.season, episode: n, query },
  };
}
