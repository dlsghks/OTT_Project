import { useState } from 'react';

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

export const CategoryPage = ({ page }) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const pageItems = page.items ?? [];

  const filter = page.filters.find(
    (item) => item.id === activeFilter
  );

  const sections = (page.sections ?? []).map((section) => {
    // 요일 선택 후 WeekdayRow에서 최소 개수 적용
    if (section.type === 'weekday') {
      return {
        ...section,
        fallbackItems: pageItems,
        minimum: MIN_SUB_SECTION_ITEMS,
      };
    }

    return {
      ...section,
      items: fillSectionItems(
        section.items ?? [],
        pageItems,
        MIN_SUB_SECTION_ITEMS
      ),
    };
  });

  return (
    <div className="wavve-home category-page">
      <SubPageHeader
        heroItems={page.heroItems}
        filters={page.filters}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <div className="category-page__sections">
        {activeFilter === 'all' ? (
          <SectionRenderer sections={sections} />
        ) : (
          <CollectionRow
            title={`${page.name} · ${filter?.label ?? ''}`}
            items={filterItems(pageItems, activeFilter)}
          />
        )}
      </div>
    </div>
  );
};