import { HomeHero } from '../home/HomeHero';

// 카테고리 페이지 상단: 히어로 배너 + 장르 필터 버튼
export const SubPageHeader = ({ heroItems = [], filters = [], activeFilter, onFilterChange }) => {
  return (
    <>
      <HomeHero items={heroItems} />

      <nav className="category-filter" aria-label="장르 필터">
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={`category-filter__button ${activeFilter === filter.id ? 'is-active' : ''}`}
            aria-pressed={activeFilter === filter.id}
            onClick={() => onFilterChange(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </nav>
    </>
  );
};
