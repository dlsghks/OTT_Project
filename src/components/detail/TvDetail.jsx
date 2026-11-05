import { useEffect, useState } from 'react';

import { categoryPages } from '../../data/categoryData';
import { tvHeroOverrides, combineVerifiedEpisodes } from '../../data/tvHeroOverrides';
import { getImagePath } from '../../utils/imagePath';
import { useTvStore, getTvCast } from '../../store/useTvStore';
import {
  TMDB_IMG, getLogo, getTvAge, getCrewNames, getDetailInfo, WRITER_JOBS, formatDate,
} from '../../services/tmdbDetail';
import { buildEpisodeQuery, episodeVideoOverrides } from '../../data/episodeYoutube';
import { useDetailActions } from '../../hooks/useDetailActions';
import { useVideoPlayer } from '../../hooks/useVideoPlayer';
import { DetailLayout } from './DetailLayout';
import { DetailHero } from './DetailHero';
import { EpisodeRow } from './EpisodeRow';
import { DetailSections } from './DetailSections';
import { DetailMessage } from './DetailMessage';

import '../../styles/pages/TvHeroDetail.scss';

// 펼치기 정보 (개요 · 장르 · 감독 · 작가)
const getInfo = (tv) => {
  const crew = tv.aggregate_credits?.crew;
  const start = tv.first_air_date?.slice(0, 4);
  const end = tv.in_production ? '' : tv.last_air_date?.slice(0, 4) ?? '';

  return getDetailInfo({
    summary: [tv.networks?.[0]?.name, start ? `${start}~${end}` : ''],
    genres: tv.genres,
    directors: getCrewNames(crew, ['Director'])
      || (tv.created_by ?? []).map((person) => person.name).join(', '),
    writers: getCrewNames(crew, WRITER_JOBS),
  });
};

// 시리즈 상세 공통 (예능 · 드라마 · 시사교양 · 애니 · 해외시리즈)
// - programId: 카테고리 콘텐츠 id(ent-01) 또는 TMDB id(숫자)
// - config: 카테고리별 설정 (각 페이지 파일에서 전달)
export const TvDetail = ({ programId, config }) => {
  const {
    tvIds, tvDetail, tvSeasons, tvSections,
    onFindTvId, onFetchTvDetail, onFetchTvSeason, onFetchTvSections, onResolveEpisodeVideo,
  } = useTvStore();
  const actions = useDetailActions();
  const player = useVideoPlayer();

  const page = categoryPages[config.category];
  const items = page.items;
  const localItem = items.find((item) => item.id === programId);
  const override = tvHeroOverrides[programId] ?? null;
  // 각 카테고리의 히어로 3개는 원본 배너와 소개 문구를 백업 데이터로 사용한다.
  // TMDB에서 포스터/설명을 못 가져와도 작품 제목과 배너가 있는 상세페이지를 보여준다.
  const heroItem = page.heroItems.find((item) => item.link === `${config.basePath}/${programId}`);
  const heroBackdrop = heroItem?.image ? getImagePath(heroItem.image) : null;
  const tmdbId = localItem ? localItem.tmdbId ?? tvIds[localItem.id] : Number(programId) || null;

  const [searchFailed, setSearchFailed] = useState(false);
  const [season, setSeason] = useState(null);

  const tv = tmdbId ? tvDetail[tmdbId] : null;

  // 시즌 선택 목록 (스페셜 시즌 0 제외) · 기본 시즌
  const apiSeasons = tv
    ? (tv.seasons ?? []).filter((item) => item.season_number > 0 || tv.seasons.length === 1)
    : [];
  // 외부 편성 회차가 확인된 시즌은 TMDB의 시즌 목록이 누락돼도 선택 가능하게 한다.
  const seasons = [...apiSeasons];
  Object.keys(override?.episodeCounts ?? {}).forEach((number) => {
    if (!seasons.some((item) => item.season_number === Number(number))) {
      seasons.push({ id: `verified-season-${number}`, season_number: Number(number) });
    }
  });
  seasons.sort((a, b) => a.season_number - b.season_number);
  const defaultSeason = seasons.find((item) => item.season_number === (override?.defaultSeason ?? localItem?.tmdbSeason))
    ?? seasons[seasons.length - 1];
  const seasonNumber = season ?? defaultSeason?.season_number ?? null;
  const correctedTitle = override?.title ?? localItem?.title;
  const seasonEpisodes = seasonNumber === null ? undefined
    : combineVerifiedEpisodes(
      tmdbId ? tvSeasons[`${tmdbId}-${seasonNumber}`] : undefined, override, seasonNumber,
    );
  const episodeSourceNote = override?.episodeCounts?.[seasonNumber]
    ? 'TMDB에 없는 일부 회차는 외부 편성정보에서 확인된 번호·제목만 표시합니다. 실제 OTT 제공 여부와는 별개입니다.'
    : null;
  // 티니핑 7세 등급은 시즌1에만 적용한다. 시즌별 등급을 일괄 적용하지 않는다.
  const useSeasonOneAge = programId !== 'ani-11' || seasonNumber === 1;
  const displayAge = useSeasonOneAge ? (override?.age ?? getTvAge(tv?.content_ratings)) : null;
  const ageNotice = programId === 'ent-16' && !displayAge
    ? '연령 등급 정보 미확인'
    : programId === 'ani-11' && !useSeasonOneAge ? '시즌별 등급 확인 필요' : null;

  // TMDB id 찾기 → 상세 불러오기
  useEffect(() => {
    window.scrollTo(0, 0);

    if (localItem) {
      onFindTvId(localItem, { exactOnly: Boolean(heroItem) }).then((id) => {
        if (id) onFetchTvDetail(id);
        else setSearchFailed(true);
      });
    } else if (tmdbId) {
      onFetchTvDetail(tmdbId);
    }
  }, [localItem, heroItem, tmdbId, onFindTvId, onFetchTvDetail]);

  // 상세를 불러오면 하단 테마 섹션
  useEffect(() => {
    if (tv) onFetchTvSections(tv, config);
  }, [tv, config, onFetchTvSections]);

  // 선택한 시즌 회차
  useEffect(() => {
    if (tmdbId && seasonNumber !== null) onFetchTvSeason(tmdbId, seasonNumber);
  }, [tmdbId, seasonNumber, onFetchTvSeason]);

  // 모든 상세페이지는 같은 카테고리의 추천작을 사용할 수 있다.
  const others = items.filter((item) => item.id !== localItem?.id);
  const editorPicks = [
    ...others.filter((item) => item.badge || item.isOriginal),
    ...others.filter((item) => !item.badge && !item.isOriginal),
  ].slice(0, 20);

  // 존재하지 않는 경로는 안내 화면, 카테고리 히어로 15개는 오류 시에도 기본 정보를 표시한다.
  if (!localItem && !tmdbId) {
    return (
      <DetailMessage
        message="프로그램 정보를 찾을 수 없습니다."
        backLink={config.backLink}
        backLabel={`${config.name} 페이지로 돌아가기`}
      />
    );
  }

  if (!tv) {
    if (heroItem && localItem) {
      const isLoading = !searchFailed && tv !== false;
      const handleFallbackEpisode = (episode) => {
        if (!actions.user) { actions.onLogin(); return; }
        const query = buildEpisodeQuery({
          category: config.category, title: correctedTitle,
          seasonNumber, episodeNumber: episode.episode_number, hasSeasons: seasons.length > 1,
        });
        player.openSearch(
          { title: `${correctedTitle} ${episode.episode_number}화`, description: '', source: { query } },
          () => onResolveEpisodeVideo({ tmdbId, seasonNumber, episodeNumber: episode.episode_number, query }),
        );
      };
      return (
        <DetailLayout
          player={player}
          actions={actions}
          hero={(
            <DetailHero
              title={correctedTitle}
              backdrop={heroBackdrop}
              overview={heroItem.subtitle}
              age={displayAge}
              meta={ageNotice}
              genres={override?.genres}
              info={override?.genres ? [{ label: '장르', value: override.genres }] : []}
              select={seasons.length > 0 && (
                <select className="movie-hero__select" value={seasonNumber ?? ''}
                  aria-label="시즌 선택" onChange={(event) => setSeason(Number(event.target.value))}>
                  {seasons.map((item) => <option key={item.id} value={item.season_number}>시즌{item.season_number}</option>)}
                </select>
              )}
              onWatch={() => player.openTrailer({ title: correctedTitle, videos: [] })}
              actions={actions}
            />
          )}
        >
          <p className="tv-hero-detail__notice" role="status">
            {isLoading
              ? '상세 정보를 불러오는 중입니다. 현재는 카테고리에 등록된 배너와 소개를 표시합니다.'
              : 'TMDB 상세 정보를 확인할 수 없어 카테고리에 등록된 배너와 소개를 표시합니다. 확인된 편성 회차만 번호로 제공하며, 출연진·회차별 상세 정보는 일부 없을 수 있습니다.'}
          </p>
          {seasonNumber !== null && (
            <div id="detail-episodes">
              <EpisodeRow key={seasonNumber} title={correctedTitle} seasonNumber={seasonNumber}
                episodes={seasonEpisodes} fallbackImage={heroBackdrop}
                onSelect={handleFallbackEpisode} sourceNote={episodeSourceNote} />
            </div>
          )}
          <DetailSections sections={[
            { id: 'editor', title: '믿고 보는 웨이브 에디터 추천작', items: editorPicks },
          ]} />
        </DetailLayout>
      );
    }

    if (searchFailed || tv === false) {
      return (
        <DetailMessage
          message="프로그램 정보를 찾을 수 없습니다."
          backLink={config.backLink}
          backLabel={`${config.name} 페이지로 돌아가기`}
        />
      );
    }

    return <DetailMessage message="프로그램 정보를 불러오는 중이에요…" />;
  }

  const title = correctedTitle ?? tv.name;
  const backdrop = tv.backdrop_path ? `${TMDB_IMG}original${tv.backdrop_path}` : heroBackdrop;
  const episodes = seasonEpisodes;
  const sections = tvSections[`${config.category}-${tv.id}`];

  // 시청하기: 예고편 (TMDB > 없으면 유튜브 검색)
  const handleWatch = () => {
    player.openTrailer({ title, videos: tv.videos?.results });
  };

  // 회차 선택: 로그인 전에는 로그인 팝업
  // 로그인 후에는 영상 팝업을 먼저 열고(찾는 중) 영상을 찾으면 재생
  // 1) data/episodeYoutube.js 직접 지정 → 2) TMDB 회차 영상 → 3) 유튜브 검색
  const handleEpisode = (episode) => {
    if (!actions.user) {
      actions.onLogin();
      return;
    }

    const query = buildEpisodeQuery({
      category: config.category,
      title: tv.name,
      seasonNumber,
      episodeNumber: episode.episode_number,
      hasSeasons: seasons.length > 1,
    });

    player.openSearch(
      {
        title: `${tv.name} ${episode.episode_number}화 ${episode.name}`,
        description: episode.overview,
        date: formatDate(episode.air_date),
        source: { query },
      },
      () => onResolveEpisodeVideo({
        tmdbId,
        seasonNumber,
        episodeNumber: episode.episode_number,
        override: episodeVideoOverrides[`${tmdbId}-${seasonNumber}-${episode.episode_number}`],
        query,
      }),
    );
  };

  return (
    <DetailLayout
      player={player}
      actions={actions}
      hero={(
        // 히어로 (펼치기: 개요 · 장르 · 감독 · 작가)
        <DetailHero
          title={title}
          backdrop={backdrop}
          logo={getLogo(tv.images)}
          age={displayAge}
          meta={ageNotice}
          genres={override?.genres ?? tv.genres?.map((genre) => genre.name).join(' · ')}
          overview={tv.overview || heroItem?.subtitle}
          cast={getTvCast(tv).slice(0, 5)}
          info={getInfo({ ...tv, genres: override?.genres ? override.genres.split(' · ').map((name) => ({ name })) : tv.genres })}
          select={seasons.length > 0 && (
            <select
              className="movie-hero__select"
              value={seasonNumber ?? ''}
              aria-label="시즌 선택"
              onChange={(event) => setSeason(Number(event.target.value))}
            >
              {seasons.map((item) => (
                <option key={item.id} value={item.season_number}>
                  {item.season_number > 0 ? `시즌${item.season_number}` : item.name}
                </option>
              ))}
            </select>
          )}
          onWatch={handleWatch}
          actions={actions}
        />
      )}
    >
      {/* 시즌별 회차 */}
      {seasonNumber !== null && (
        <div id="detail-episodes">
          <EpisodeRow
            key={seasonNumber}
            title={title}
            seasonNumber={seasonNumber}
            episodes={episodes}
            fallbackImage={backdrop}
            onSelect={handleEpisode}
            sourceNote={episodeSourceNote}
          />
        </div>
      )}

      {/* 테마 섹션 */}
      <DetailSections
        sections={[
          sections?.similar,
          sections?.onAir,
          { id: 'editor', title: '믿고 보는 웨이브 에디터 추천작', items: editorPicks },
          sections?.popular,
          ...(sections?.actors ?? []),
        ]}
      />
    </DetailLayout>
  );
};
