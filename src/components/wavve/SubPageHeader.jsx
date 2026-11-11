import { HomeHero } from '../home/HomeHero';
import { CategoryFilter } from '../common/CategoryFilter';

export const SubPageHeader = ({
  heroItems = [],
  filters = [],
  activeFilter,
  onFilterChange,
}) => (
  <>
    <HomeHero items={heroItems} appResponsive />
    <CategoryFilter
      filters={filters}
      activeFilter={activeFilter}
      onFilterChange={onFilterChange}
    />
  </>
);
