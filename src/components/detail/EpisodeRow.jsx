import { SectionTitle } from '../common/SectionTitle';
import { useState } from 'react';

import { TMDB_IMG, formatDate } from '../../services/tmdbDetail';
import { VideoSlider } from './VideoSlider';

// 시즌별 회차 목록 (첫화부터 / 최신화부터 정렬)
// - 가로 슬라이드는 VideoSlider (관련영상과 공통)
// - fallbackImage: 회차 이미지가 없을 때 보여줄 이미지 (작품 배경)
export const EpisodeRow = ({ title, seasonNumber, episodes, fallbackImage, onSelect, sourceNote }) => {
  const [order, setOrder] = useState('first');
  const [visibleCount, setVisibleCount] = useState(24);
  const changeOrder = (next) => {
    setOrder(next);
    setVisibleCount(24);
  };

  if (!episodes) {
    return <p className="episode-row__status" role="status">회차 정보를 불러오는 중이에요…</p>;
  }
  if (!episodes.length) return null;

  const list = order === 'first' ? episodes : [...episodes].reverse();
  const visibleEpisodes = list.slice(0, visibleCount);

  return (
    <section className="movie-videos episode-row">
      <div className="episode-row__header">
        <SectionTitle className="movie-videos__title">
          {title} 시즌{seasonNumber}
          <span className="episode-row__count">(총 {episodes.length}화)</span>
        </SectionTitle>

        <div className="episode-row__order" role="group" aria-label="회차 정렬">
          <button
            type="button"
            className={order === 'first' ? 'is-active' : ''}
            aria-pressed={order === 'first'}
            onClick={() => changeOrder('first')}
          >
            첫화부터
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            className={order === 'latest' ? 'is-active' : ''}
            aria-pressed={order === 'latest'}
            onClick={() => changeOrder('latest')}
          >
            최신화부터
          </button>
        </div>
      </div>

      {/* {sourceNote && <p className="tv-hero-detail__episode-note">{sourceNote}</p>} */}

      {/* 수백 회차를 한번에 DOM에 생성하지 않도록 24개씩 추가 */}
      <VideoSlider
        key={order}
        label={`${title} 시즌${seasonNumber} 회차`}
        items={visibleEpisodes}
        renderItem={(episode) => {
          const image = episode.still_path ? `${TMDB_IMG}w500${episode.still_path}` : fallbackImage;

          return (
            <button type="button" className="movie-videos__card" onClick={() => onSelect(episode)}>
              <span className="movie-videos__thumb">
                {image && <img src={image} alt="" loading="lazy" />}
              </span>
              <strong>{episode.episode_number}화 {episode.name}</strong>
              {episode.overview && (
                <span className="movie-videos__desc movie-videos__desc--clamp">{episode.overview}</span>
              )}
              <span className="movie-videos__date">
                {[formatDate(episode.air_date), episode.runtime ? `${episode.runtime}분` : null]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </button>
          );
        }}
      />
      {/* {visibleCount < list.length && (
        <button type="button" className="tv-hero-detail__more"
          onClick={() => setVisibleCount((count) => count + 24)}>
          회차 더보기 ({Math.min(visibleCount, list.length)}/{list.length})
        </button>
      )} */}
    </section>
  );
};
