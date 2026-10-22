
import '../../styles/components/ContentCard.scss';

export const ContentCard = ({ item, rank }) => {

  // poster가 있으면 poster 사용, 없으면 image 사용
  const poster = item.poster || item.image;

  return (
    <div className="content-card">

      {/* 썸네일 영역 */}
      <div className="content-card__thumbnail">

        {/* 프로그램 포스터 */}
        {poster ? (
          <img
            className="content-card__poster"
            src={poster}
            alt={item.title}
            draggable={false}
          />
        ) : (
          <div className="content-card__placeholder">
            {item.title}
          </div>
        )}

        {/* 좌측 상단 상태 배지 */}
        {item.badge && (
          <span
            className={`content-card__badge ${item.badge === '새로운'
              ? 'content-card__badge--new'
              : item.badge === '개별구매'
                ? 'content-card__badge--purchase'
                : ''
              }`}
          >
            {item.badge}
          </span>
        )}

        {/* 우측 상단 웨이브 오리지널 로고 */}
        {item.isOriginal && (
          <img
            className="content-card__original"
            src="/images/W-icon.svg"
            alt="Wavve Original"
            draggable={false}
          />
        )}

        {/* 랭킹 숫자 */}
        {rank != null && (
          <span className="content-card__rank">
            {rank}
          </span>
        )}

      </div>

      {/* 프로그램 제목 */}
      <div className="content-card__info">
        <h3>{item.title}</h3>
      </div>

    </div>
  );
};
