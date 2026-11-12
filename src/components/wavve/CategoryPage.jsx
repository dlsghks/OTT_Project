import { categoryPages } from '../../data/categoryData';
import { categoryCollectionLink } from '../../data/editorCollections';
import { useState } from 'react';
import { BrowsePageHeader } from '../common/BrowsePageHeader';
import { SubPageHeader } from './SubPageHeader';
import { SectionRenderer } from './SectionRenderer';
import { CollectionRow } from './CollectionRow';

import { filterItems } from '../../data/categoryData';

import {
  fillSectionItems,
  MIN_SUB_SECTION_ITEMS,
} from '../../utils/sectionItems';

import '../../styles/pages/home/Home.scss';
import '../../styles/pages/category/Category.scss';
import '../../styles/components/home/HomeResponsive.scss';
import '../../styles/responsive/CategoryResponsive.scss';
import '../../styles/pages/category/CategoryFilterResults.scss';

export const CategoryPage = ({ page }) => {
  const [activeFilter, setActiveFilter] = useState('home');

  const category = Object.keys(categoryPages).find(key => categoryPages[key] === page || categoryPages[key].name === page.name);
  const pageItems = page.items ?? [];
  // 홈은 큐레이션, 전체는 모든 콘텐츠를 표시합니다.
  const filters = [
    { id: 'home', label: `${page.name} 홈` },
    { id: 'all', label: `${page.name} 전체` },
    ...(page.filters ?? []).filter((item) => item.id !== 'home' && item.id !== 'all'),
  ];

  const sections = (page.sections ?? []).map((section) => {
    // 요일 선택 후 WeekdayRow에서 최소 개수 적용
    if (section.type === 'weekday') {
      return {
        ...section,
        moreLink: categoryCollectionLink(category, section.id),
        fallbackItems: pageItems,
        minimum: MIN_SUB_SECTION_ITEMS,
      };
    }

    return {
      ...section,
      moreLink: categoryCollectionLink(category, section.id),
      items: fillSectionItems(
        section.items ?? [],
        pageItems,
        MIN_SUB_SECTION_ITEMS
      ),
    };
  });

  return (
    <div className="wavve-home category-page">
      <BrowsePageHeader title={page.name} />
      <SubPageHeader
        heroItems={page.heroItems}
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <div className={`category-page__sections${activeFilter !== 'home' ? ' category-page__sections--filtered' : ''}`}>
        {activeFilter === 'home' ? (
          <SectionRenderer sections={sections} />
        ) : (
          <CollectionRow
            items={filterItems(pageItems, activeFilter)}
          />
        )}
      </div>
    </div>
  );
};