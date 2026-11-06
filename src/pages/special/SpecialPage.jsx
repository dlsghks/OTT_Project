import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { specialPages } from '../../data/specialPages';
import { SpecialHero } from '../../components/special/SpecialHero';
import { SectionRenderer } from '../../components/wavve/SectionRenderer';
import { CollectionRow } from '../../components/wavve/CollectionRow';

import '../../styles/components/Home.scss';
import '../../styles/pages/Category.scss';
import '../../styles/pages/Special.scss';

// 스페셜 페이지 본문
// - filters 가 있으면 CategoryPage 와 같은 필터 버튼(.category-filter) 표시
//   · filter.link: 해당 화면으로 이동 (뉴스 탭 화면)
//   · filter.sections: 해당 섹션만 표시 / filter.items: 콘텐츠 그리드 표시
const SpecialContent = ({ page }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();
  const filter = page.filters?.find((item) => item.id === activeFilter);

  const renderSections = () => {
    if (!filter || filter.id === 'all') return <SectionRenderer sections={page.sections} />;

    if (filter.items) {
      return <CollectionRow title={`${page.title} · ${filter.label}`} items={filter.items} />;
    }

    return <SectionRenderer sections={page.sections.filter((section) => filter.sections?.includes(section.id))} />;
  };

  return (
    <div className="wavve-home category-page special-page">
      <SpecialHero
        title={page.title}
        description={page.description}
        hero={page.hero}
        tags={page.tags}
      />

      {page.filters && (
        <nav className="category-filter" aria-label={`${page.title} 필터`}>
          {page.filters.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`category-filter__button ${activeFilter === item.id ? 'is-active' : ''}`}
              aria-pressed={activeFilter === item.id}
              onClick={() => (item.link ? navigate(item.link) : setActiveFilter(item.id))}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}

      <div className="category-page__sections">{renderSections()}</div>
    </div>
  );
};

// 홈 카테고리 버튼 → 스페셜 페이지 공통 템플릿 (/special/:slug)
export const SpecialPage = () => {
  const { slug } = useParams();
  const page = specialPages[slug];

  if (!page) return <Navigate to="/" replace />;

  // slug 가 바뀌면 필터 · 슬라이더 상태 초기화
  return <SpecialContent key={slug} page={page} />;
};
