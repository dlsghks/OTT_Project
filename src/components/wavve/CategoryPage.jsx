import { useState } from 'react';
import { BrowsePageHeader } from '../common/BrowsePageHeader';
import { SubPageHeader } from './SubPageHeader';
import { SectionRenderer } from './SectionRenderer';
import { CollectionRow } from './CollectionRow';
import { filterItems } from '../../data/categoryData';

import '../../styles/components/Home.scss';
import '../../styles/pages/Category.scss';
import '../../styles/components/HomeResponsive.scss';
import '../../styles/responsive/CategoryResponsive.scss';

// 예능·드라마·영화·시사교양·애니·해외시리즈 공통 페이지
// 전체 필터: 테마별 섹션 / 장르 필터: 해당 장르 콘텐츠 그리드
export const CategoryPage = ({ page }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const filter = page.filters.find((item) => item.id === activeFilter);

  return (
    <div className="wavve-home category-page">
      <BrowsePageHeader title={page.name} />
      <SubPageHeader
        heroItems={page.heroItems}
        filters={page.filters}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <div className="category-page__sections">
        {activeFilter === 'all' ? (
          <SectionRenderer sections={page.sections} />
        ) : (
          <CollectionRow
            title={`${page.name} · ${filter?.label}`}
            items={filterItems(page.items, activeFilter)}
          />
        )}
      </div>
    </div>
  );
};
