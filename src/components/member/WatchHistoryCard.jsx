import { useState } from "react";
import { Link } from "react-router-dom";
import { getImagePath } from "../../utils/imagePath";
import emptyImage from "../../assets/mypage/empty-play.png";

const formatTime = (value) => {
  const seconds = Math.max(0, Math.floor(value));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60) % 60;
  const rest = String(seconds % 60).padStart(2, "0");
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}` : `${minutes}:${rest}`;
};
export const WatchHistoryCard = ({ item, onOpenContent }) => {
  const [imageIndex, setImageIndex] = useState(0);
  const videoThumb = item.videoId ? `https://i.ytimg.com/vi/${encodeURIComponent(item.videoId)}/hqdefault.jpg` : "";
  const images = [...new Set([item.thumbnailUrl, videoThumb, item.image, emptyImage].filter(Boolean))];
  const duration = Number.isFinite(item.duration) ? Math.max(0, item.duration) : 0;
  const position = Number.isFinite(item.position) ? Math.max(0, item.position) : 0;
  const progress = duration ? Math.min(100, position / duration * 100) : 0;
  const title = item.episodeTitle || item.title;
  const body = <>
    <span className="mypage__history-thumbnail">
      <img src={getImagePath(images[Math.min(imageIndex, images.length - 1)])} alt="" loading="lazy"
        onError={() => setImageIndex((index) => Math.min(index + 1, images.length - 1))} />
      {duration > 0 && <span className="mypage__history-duration">{formatTime(duration)}</span>}
      {duration > 0 && <span className="mypage__history-progress" role="progressbar"
        aria-label={`${item.title} 시청 진행률`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
        <span style={{ width: `${progress}%` }} />
      </span>}
    </span>
    <strong className="mypage__history-title">{title}</strong>
    <span className="mypage__history-program">{item.title}</span>
  </>;
  return onOpenContent ? (
    <button className="mypage__history-card" type="button" onClick={() => onOpenContent(item)} aria-label={`${item.title} 상세 보기`}>{body}</button>
  ) : <Link className="mypage__history-card" to={item.to} aria-label={`${item.title} 상세 보기`}>{body}</Link>;
};
