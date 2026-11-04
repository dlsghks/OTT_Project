import { useState } from 'react';

import { TMDB_IMG, formatDate } from '../../services/tmdbDetail';
import { VideoSlider } from './VideoSlider';

// 시즌별 회차 목록 (첫화부터 / 최신화부터 정렬)
// - 가로 슬라이드는 VideoSlider (관련영상과 공통)
// - fallbackImage: 회차 이미지가 없을 때 보여줄 이미지 (작품 배경)
export const EpisodeRow = ({ title, seasonNumber, episodes, fallbackImage, onSelect }) => {
  const [order, setOrder] = useState('first');

  if (!episodes) {
    return <p className="episode-row__status" role="status">회차 정보를 불러오는 중이에요…</p>;
  }
  if (!episodes.length) return null;

  const list = order === 'first' ? episodes : [...episodes].reverse();

  return (
    <section className="movie-videos episode-row">
      <div className="episode-row__header">
        <h2 className="movie-videos__title">
          {title} 시즌{seasonNumber}
          <span className="episode-row__count">(총 {episodes.length}화)</span>
        </h2>

        <div className="episode-row__order" role="group" aria-label="회차 정렬">
          <button
            type="button"
            className={order === 'first' ? 'is-active' : ''}
            aria-pressed={order === 'first'}
            onClick={() => setOrder('first')}
          >
            첫화부터
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            className={order === 'latest' ? 'is-active' : ''}
            aria-pressed={order === 'latest'}
            onClick={() => setOrder('latest')}
          >
            최신화부터
          </button>
        </div>
      </div>

      {/* 정렬을 바꾸면 첫 회차부터 다시 (key) */}
      <VideoSlider
        key={order}
        label={`${title} 시즌${seasonNumber} 회차`}
        items={list}
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
    </section>
  );
};
