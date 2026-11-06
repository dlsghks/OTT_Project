import { Link } from 'react-router-dom';

// 뉴스 클립 16:9 영상 카드 (상세 페이지 관련영상 카드 movie-videos__card 스타일 재사용)
export const NewsClipCard = ({ clip }) => {
  return (
    <Link to={clip.link} className="movie-videos__card news-clip-card">
      <span className="movie-videos__thumb video-row__thumb">
        <img src={clip.image} alt="" loading="lazy" draggable={false} />
        {clip.badge && <span className="video-row__badge">{clip.badge}</span>}
        {clip.duration && <span className="video-row__time">{clip.duration}</span>}
      </span>
      <strong className="news-clip-card__title">{clip.title}</strong>
      <span className="movie-videos__date">
        {clip.source} · {clip.date}
      </span>
    </Link>
  );
};
