import { SectionTitle } from '../common/SectionTitle';
import { formatDate } from '../../services/tmdbDetail';
import { VideoSlider } from './VideoSlider';

// 관련영상 (유튜브 예고편 등) – 누르면 onSelect 로 재생할 영상 전달
// - 가로 슬라이드는 VideoSlider (시즌별 회차와 공통)
export const DetailVideos = ({ title, videos = [], onSelect }) => {
  if (!videos.length) return null;

  return (
    <section className="movie-videos">
      <SectionTitle className="movie-videos__title">관련영상</SectionTitle>

      <VideoSlider
        label="관련영상"
        items={videos.slice(0, 8)}
        renderItem={(item) => (
          <button
            type="button"
            className="movie-videos__card"
            onClick={() => onSelect({
              videoId: item.key,
              title: item.name,
              date: formatDate(item.published_at),
            })}
          >
            <span className="movie-videos__thumb">
              <img src={`https://i.ytimg.com/vi/${item.key}/hqdefault.jpg`} alt="" loading="lazy" />
            </span>
            <strong>{item.name}</strong>
            <span className="movie-videos__desc">{title} {item.type}</span>
            {item.published_at && (
              <span className="movie-videos__date">{formatDate(item.published_at)}</span>
            )}
          </button>
        )}
      />
    </section>
  );
};
