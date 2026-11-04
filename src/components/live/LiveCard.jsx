
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getImagePath } from '../../utils/imagePath';

export const LiveCard = ({ program, progress }) => {
  const [imageError, setImageError] = useState(false);

  // 이미지가 변경되면 오류 상태 초기화
  useEffect(() => {
    setImageError(false);
  }, [program.image]);

  const imageSrc = program.image
    ? getImagePath(program.image)
    : null;

  const showImage = imageSrc && !imageError;

  return (
    <Link
      className="live-card"
      to={`/livechannel?channel=${encodeURIComponent(
        program.channelId
      )}`}
    >
      <div className="live-card__thumb">
        {showImage ? (
          <img
            src={imageSrc}
            alt={program.title || program.channel}
            draggable={false}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="live-card__placeholder">
            {program.channel}
          </span>
        )}

        <span className="live-card__badge">
          무료
        </span>

        <div className="live-card__progress">
          <span
            style={{
              width: `${progress ?? 0}%`,
            }}
          />
        </div>
      </div>

      <strong className="live-card__channel">
        {program.channel}
      </strong>

      <span className="live-card__title">
        {program.title}
      </span>
    </Link>
  );
};
