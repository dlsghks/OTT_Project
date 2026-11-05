import { useState } from 'react';
import { Heart } from 'lucide-react';
import { ContentCard } from '../../components/home/ContentCard';
import { categoryPages } from '../../data/categoryData';
import '../../styles/pages/EntertainmentAll.scss';

// 메인 '예능 전체보기 > 더보기' 전용 페이지.
// 기존 예능 카테고리 데이터를 재사용하면 각 item.link가
// /entertainmentdetail/:programId를 가리켜 기존 상세페이지와 연결됩니다.
const entertainmentItems = categoryPages.entertainment.items;

export const EntertainmentAll = () => {
  const [isLiked, setIsLiked] = useState(false);
  return (
    <div className="entertainment-all-page">
      <section className="entertainment-all-page__inner" aria-labelledby="entertainment-all-title">
        <header className="entertainment-all-page__heading">
          <div className="entertainment-all-page__title-group">
            <h1 id="entertainmet-all-title">
              믿고 보는 웨이브 에디터 추천작
            </h1>
            <p>
              주요 Line-up이나 화제작들을 <br />
              웨이브에서 만나보세요
            </p>
          </div>

          {/* 페이지 자체 좋아요 버튼 */}
          <button
            type='button'
            className={`entertainment-all-page__like ${isLiked ? 'is-active' : ''}`}
            onClick={() => setIsLiked((prev) => !prev)}
            aria-label={isLiked ? '페이지 좋아요 취소' : '페이지 좋아요'}
            aria-pressed={isLiked}>
            <Heart
              size={28}
              strokeWidth={1.5}
              color={isLiked ? '#1351F9' : '#ffffff'}
              fill={isLiked ? '#1351F9' : 'none'}
              aria-hidden={true} />
          </button>
        </header>

        <ul className="entertainment-all-page__grid" aria-label="예능 콘텐츠 목록">
          {entertainmentItems.map((item) => (
            <li key={item.id} className="entertainment-all-page__grid-item">
              <ContentCard item={item} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
