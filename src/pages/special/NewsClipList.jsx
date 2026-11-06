import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { newsTabs, getNewsTab, getTabClips } from '../../data/newsClips';
import { NewsClipCard } from '../../components/news/NewsClipCard';

import '../../styles/components/Home.scss';
import '../../styles/pages/Category.scss';
import '../../styles/pages/TotalSubDetail.scss';
import '../../styles/pages/Special.scss';

// 뉴스 > 필터 탭 화면 (/special/news/:tab) — 웨이브 /special/sub?uiCode=SN101 구성
// 상단: "뉴스" + 필터 버튼(CategoryPage 필터 스타일) / 본문: 탭별 클립 그리드
export const NewsClipList = () => {
  const { tab } = useParams();
  const current = getNewsTab(tab);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab]);

  if (!current) return <Navigate to="/special/news" replace />;

  const clips = getTabClips(tab);

  return (
    <div className="wavve-home category-page special-page news-list">
      <header className="news-list__header">
        <Link to="/special/news" className="news-list__title">뉴스</Link>

        <nav className="category-filter news-list__filter" aria-label="뉴스 필터">
          {newsTabs.map((item) => (
            <Link
              key={item.id}
              to={`/special/news/${item.id}`}
              className={`category-filter__button ${item.id === tab ? 'is-active' : ''}`}
              aria-current={item.id === tab ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <ul className="news-list__grid">
        {clips.map((clip) => (
          <li key={clip.id}>
            <NewsClipCard clip={clip} />
          </li>
        ))}
      </ul>
    </div>
  );
};
