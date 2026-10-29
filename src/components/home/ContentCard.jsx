import { Link } from 'react-router-dom';
import { getImagePath } from '../../utils/imagePath';
import '../../styles/components/ContentCard.scss';

export const ContentCard = ({ item, rank }) => {
  return (
    <Link
      to={`/programdetail/${item.id}`}
      className={`content-card ${rank ? 'content-card--ranked' : ''}`}
    >
      <div className="content-card__thumbnail">

        {/* 프로그램 썸네일 */}
        {item.poster && (
          <img
            src={getImagePath(item.poster)}
            alt={item.title}
          />
        )}

        {/* 좌측 상단 상태 배지 */}
        {item.badge && (
          <span
            className={`content-card__badge ${
              item.badge === '개별구매'
                ? 'content-card__badge--purchase'
                : 'content-card__badge--new'
            }`}
          >
            {item.badge}
          </span>
        )}

        {/* 우측 상단 웨이브 오리지널 로고 */}
        {item.isOriginal && (
          <img
            className="content-card__original"
            src={getImagePath('/images/W-icon.svg')}
            alt="Wavve Original"
          />
        )}

        {/* 이미지가 없을 때 임시 제목 */}
        {!item.poster && (
          <span className="content-card__placeholder">
            {item.title}
          </span>
        )}

      </div>

      <div className="content-card__info">
        <h3>{item.title}</h3>
      </div>

      {/* TOP 20 순위 숫자 이미지 (public/images/rank/wavve_rank1~20.svg) */}
      {rank && rank <= 20 && (
        <img
          className="content-card__rank"
          src={getImagePath(`/images/rank/wavve_rank${rank}.svg`)}
          alt={`${rank}위`}
          draggable="false"
        />
      )}
    </Link>
  );
};