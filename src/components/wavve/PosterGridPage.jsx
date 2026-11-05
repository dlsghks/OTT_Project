import { useState } from 'react';
import { Heart } from 'lucide-react';
import { ContentCard } from '../home/ContentCard';
import '../../styles/pages/SeeAllPage.scss';

/**
 * Figma 공통 전체보기 화면.
 * 제목/설명/포스터 데이터만 바꿔 6개 카테고리와 홈 섹션에 재사용합니다.
 * 좋아요는 현재 페이지 안에서만 동작하는 UI 상태입니다 (DB 저장 X).
 */
export const PosterGridPage = ({ title, description, items = [], loading = false }) => {
  const [isLiked, setIsLiked] = useState(false);
  const headingId = 'see-all-heading';

  return (
    <div className="see-all-page">
      <section className="see-all-page__inner" aria-labelledby={headingId}>
        <header className="see-all-page__heading">
          <div className="see-all-page__title-group">
            <h1 id={headingId}>{title}</h1>
            {description && <p>{description}</p>}
          </div>

          <button
            type="button"
            className={`see-all-page__like${isLiked ? ' is-active' : ''}`}
            aria-label={isLiked ? '페이지 좋아요 취소' : '페이지 좋아요'}
            aria-pressed={isLiked}
            onClick={() => setIsLiked((prev) => !prev)}
          >
            <Heart size={28} strokeWidth={1.5} fill={isLiked ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>
        </header>

        {loading ? (
          <p className="see-all-page__message" role="status">콘텐츠를 불러오는 중입니다.</p>
        ) : items.length ? (
          <ul className="see-all-page__grid" aria-label={`${title} 콘텐츠 목록`}>
            {items.map((item, index) => (
              <li key={`${item.id ?? item.tmdbId ?? item.title}-${index}`} className="see-all-page__grid-item">
                <ContentCard item={item} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="see-all-page__message" role="status">등록된 콘텐츠가 없습니다.</p>
        )}
      </section>
    </div>
  );
};
