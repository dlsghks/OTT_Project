import { useEffect, useState } from 'react';

import { categoryPages } from '../../data/categoryData';
import { useTvStore, getTvCast } from '../../store/useTvStore';
import {
  TMDB_IMG, getLogo, getTvAge, getTvInfo, formatDate,
} from '../../services/tmdbDetail';
import { buildEpisodeQuery, episodeVideoOverrides } from '../../data/episodeYoutube';
import { useDetailActions } from '../../hooks/useDetailActions';
import { useVideoPlayer } from '../../hooks/useVideoPlayer';
import { DetailLayout } from './DetailLayout';
import { DetailHero } from './DetailHero';
import { EpisodeRow } from './EpisodeRow';
import { DetailSections } from './DetailSections';
import { DetailMessage } from './DetailMessage';

// 시리즈 상세 공통 (예능 · 드라마 · 시사교양 · 애니 · 해외시리즈)
// - programId: 카테고리 콘텐츠 id(ent-01) 또는 TMDB id(숫자)
// - config: 카테고리별 설정 (각 페이지 파일에서 전달)
export const TvDetail = ({ programId, config }) => {
  const {
    tvIds, tvDetail, tvSeasons, tvSections,
    onFindTvId, onFetchTvDetail, onFetchTvSeason, onFetchTvSections, onResolveEpisodeVideo,
  } = useTvStore();
  const player = useVideoPlayer();

  const items = categoryPages[config.category].items;
  const localItem = items.find((item) => item.id === programId);
  const tmdbId = localItem ? localItem.tmdbId ?? tvIds[localItem.id] : Number(programId) || null;

  const [searchFailed, setSearchFailed] = useState(false);
  const [season, setSeason] = useState(null);

  const tv = tmdbId ? tvDetail[tmdbId] : null;
  const actions = useDetailActions(tv ? {
    id: `program:${tmdbId}`,
    type: 'program',
    title: localItem?.title ?? tv.name,
    image: tv.poster_path ? `${TMDB_IMG}w500${tv.poster_path}` : localItem?.poster || localItem?.image || '',
  } : null);

  // 시즌 선택 목록 (스페셜 시즌 0 제외) · 기본 시즌
  const seasons = tv
    ? (tv.seasons ?? []).filter((item) => item.season_number > 0 || tv.seasons.length === 1)
    : [];
  const defaultSeason = seasons.find((item) => item.season_number === localItem?.tmdbSeason)
    ?? seasons[seasons.length - 1];
  const seasonNumber = season ?? defaultSeason?.season_number ?? null;

  // TMDB id 찾기 → 상세 불러오기
  useEffect(() => {
    window.scrollTo(0, 0);

    if (localItem) {
      onFindTvId(localItem).then((id) => {
        if (id) onFetchTvDetail(id);
        else setSearchFailed(true);
      });
    } else if (tmdbId) {
      onFetchTvDetail(tmdbId);
    }
  }, [localItem, tmdbId, onFindTvId, onFetchTvDetail]);

  // 상세를 불러오면 하단 테마 섹션
  useEffect(() => {
    if (tv) onFetchTvSections(tv, config);
  }, [tv, config, onFetchTvSections]);

  // 선택한 시즌 회차
  useEffect(() => {
    if (tmdbId && seasonNumber !== null) onFetchTvSeason(tmdbId, seasonNumber);
  }, [tmdbId, seasonNumber, onFetchTvSeason]);

  const notFound = searchFailed || (!localItem && !tmdbId) || tv === false;

  if (notFound) {
    return (
      <DetailMessage
        message="프로그램 정보를 찾을 수 없습니다."
        backLink={config.backLink}
        backLabel={`${config.name} 페이지로 돌아가기`}
      />
    );
  }

  if (!tv) {
    return <DetailMessage message="프로그램 정보를 불러오는 중이에요…" />;
  }

  const title = localItem?.title ?? tv.name;
  const backdrop = tv.backdrop_path ? `${TMDB_IMG}original${tv.backdrop_path}` : null;
  const episodes = seasonNumber !== null ? tvSeasons[`${tmdbId}-${seasonNumber}`] : [];
  const sections = tvSections[`${config.category}-${tv.id}`];

  // 믿고 보는 웨이브 에디터 추천작: 같은 카테고리 콘텐츠 (배지 · 오리지널 먼저)
  const others = items.filter((item) => item.id !== localItem?.id);
  const editorPicks = [
    ...others.filter((item) => item.badge || item.isOriginal),
    ...others.filter((item) => !item.badge && !item.isOriginal),
  ].slice(0, 20);

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
          age={getTvAge(tv.content_ratings)}
          genres={tv.genres?.map((genre) => genre.name).join(' · ')}
          overview={tv.overview}
          cast={getTvCast(tv).slice(0, 5)}
          info={getTvInfo(tv)}
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
            title={tv.name}
            seasonNumber={seasonNumber}
            episodes={episodes}
            fallbackImage={backdrop}
            onSelect={handleEpisode}
          />
        </div>
      )}

      {/* 테마 섹션 */}
      <DetailSections
        sections={sections && [
          sections.similar,
          sections.onAir,
          { id: 'editor', title: '믿고 보는 웨이브 에디터 추천작', items: editorPicks },
          sections.popular,
          ...sections.actors,
        ]}
      />
    </DetailLayout>
  );
};
