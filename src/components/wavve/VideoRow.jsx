import { Link } from 'react-router-dom';
import { VideoSlider } from '../detail/VideoSlider';
import { getImagePath } from '../../utils/imagePath';

import '../../styles/pages/TotalSubDetail.scss';

// 16:9 영상 카드 행 (상세 페이지 관련영상 · 회차와 같은 VideoSlider + movie-videos__card)
// - ranked: 썸네일 좌측 하단 순위 숫자 (TOP 20 · 인기 라이브)
export const VideoRow = ({ title, items = [], ranked = false }) => {
  if (!items.length) return null;

  return (
    <section className={`category-row video-row ${ranked ? 'video-row--ranked' : ''}`}>
      <div className="category-row__header">
        <div className="category-row__title">
          <h2>{title}</h2>
        </div>
      </div>

      <VideoSlider
        label={title}
        items={items}
        renderItem={(item) => {
          const index = items.indexOf(item);

          return (
            <Link to={item.link ?? '/search'} className="movie-videos__card" draggable={false}>
              <span className="movie-videos__thumb video-row__thumb">
                {item.image && <img src={getImagePath(item.image)} alt="" loading="lazy" draggable={false} />}
                {item.badge && <span className="video-row__badge">{item.badge}</span>}
                {item.duration && <span className="video-row__time">{item.duration}</span>}
                {ranked && index < 20 && (
                  <img
                    className="video-row__rank"
                    src={getImagePath(`/images/rank/wavve_rank${index + 1}.svg`)}
                    alt={`${index + 1}위`}
                    draggable={false}
                  />
                )}
              </span>
              <strong>{item.title}</strong>
              {item.desc && <span className="movie-videos__desc">{item.desc}</span>}
              {item.date && <span className="movie-videos__date">{item.date}</span>}
            </Link>
          );
        }}
      />
    </section>
  );
};
