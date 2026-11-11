import { VoucherWatchActions } from '../common/VoucherWatchActions';
import { useRef, useState } from 'react';
import { Heart, Share, ChevronDown, ChevronUp } from 'lucide-react';
import { DetailInfo } from './DetailInfo';
import { getInfoRows } from '../../services/tmdbDetail';
import { ShareModal } from '../common/ShareModal';

// 상세 페이지 상단 히어로 (영화 · 시리즈 공통)
// - select: 시청하기 왼쪽 선택 박스 (영화: 자막, 시리즈: 시즌)
// - info: 펼치기를 누르면 나오는 상세 정보 [{ label, value }] (없으면 펼치기 숨김)
//   펼치면 로고 · 버튼 위치는 그대로, 출연 아래로 상세 정보가 내려오고 아래 테마가 밀림
// - actions: useDetailActions() 결과 (로그인 · 관심 · 공유)
export const DetailHero = ({
  title,
  backdrop,
  logo,
  meta,
  age,
  genres,
  overview,
  cast = [],
  info = [],
  select,
  onWatch,
  showWatch = true,
  watchActions,
  onDownload,
  downloadNotice,
  actions,
  hasWatchAccess = actions.hasVoucher,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  // 펼치기 직전의 히어로 높이 · 내용 시작 위치 (펼친 뒤에도 같은 자리에 고정)
  const [frame, setFrame] = useState(null);
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const { isLiked, onLike } = actions;
  const infoRows = getInfoRows(info);

  const expand = () => {
    setFrame({
      heroHeight: heroRef.current?.offsetHeight ?? 0,
      contentTop: contentRef.current?.offsetTop ?? 0,
    });
    setExpanded(true);
  };

  return (
    <>
      <section
        ref={heroRef}
        className={`movie-hero ${expanded ? 'is-expanded' : ''}`}
        style={expanded && frame
          ? { '--hero-height': `${frame.heroHeight}px`, '--content-top': `${frame.contentTop}px` }
          : undefined}
      >
        {backdrop && <img className="movie-hero__background" src={backdrop} alt="" />}

        <div ref={contentRef} className="movie-hero__content">
          {logo ? (
            <h1 className="movie-hero__logo">
              <img src={logo} alt={title} />
            </h1>
          ) : (
            <h1 className="movie-hero__title">{title}</h1>
          )}

          <p className="movie-hero__meta">
            {meta}
            {age && <span className={`movie-hero__age movie-hero__age--${age.toLowerCase()}`}>{age}</span>}
            {genres}
          </p>

          <div className="movie-hero__actions">
            {watchActions ?? (showWatch && (
              hasWatchAccess ? (
                <>
                  {select}
                  <button type="button" className="movie-hero__buy" onClick={onWatch}>시청하기</button>
                </>
              ) : (
                <VoucherWatchActions onPurchase={actions.onPurchaseVoucher} />
              )
            ))}

            <button
              type="button"
              className={`movie-hero__icon ${isLiked ? 'is-active' : ''}`}
              aria-pressed={isLiked}
              aria-label={isLiked ? "관심 콘텐츠 해제" : "관심 콘텐츠 추가"}
              disabled={actions.likeBusy}
              onClick={onLike}
            >
              <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
              <span>관심</span>
            </button>

            <button type="button" className="movie-hero__icon" onClick={() => setIsShareModalOpen(true)}>
              <Share size={24} />
              <span>공유</span>
            </button>

            {onDownload && (
              <button type="button" className="movie-hero__icon" onClick={onDownload}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 3.5v12m-5-5 5 5 5-5M4 15.5v4.5h16v-4.5"
                    stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>다운로드</span>
              </button>
            )}
          </div>

          {downloadNotice}

          {/* 줄거리: 평소 2줄, 펼치면 전체 (로고 위치는 그대로, 아래로 늘어남) */}
          {overview && (
            <p className={`movie-hero__overview ${expanded ? 'is-expanded' : ''}`}>{overview}</p>
          )}

          {cast.length > 0 && (
            <p className="movie-hero__cast">
              <span>출연 :</span>
              {cast.map((person, index) => (
                <span key={person.id}>
                  <u>{person.name}</u>
                  {index < cast.length - 1 && ', '}
                </span>
              ))}
            </p>
          )}

          {/* 펼치기: 출연 아래로 상세 정보(개요 · 장르 · 감독 · 작가) → 아래 테마는 그만큼 밀림 */}
          {expanded && <DetailInfo rows={infoRows} />}
        </div>

        {/* 펼치기: 히어로 아래 가운데 / 접기: 상세 정보 아래 가운데 */}
        {infoRows.length > 0 && (expanded ? (
          <button
            type="button"
            className="detail-toggle detail-info__fold"
            aria-expanded={true}
            onClick={() => setExpanded(false)}
          >
            <ChevronUp size={16} aria-hidden="true" />
            접기
          </button>
        ) : (
          <button
            type="button"
            className="detail-toggle movie-hero__toggle"
            aria-expanded={false}
            onClick={expand}
          >
            <ChevronDown size={16} aria-hidden="true" />
            펼치기
          </button>
        ))}
      </section>

      {isShareModalOpen && (
        <ShareModal title={title} onClose={() => setIsShareModalOpen(false)} />
      )}
    </>
  );
};
