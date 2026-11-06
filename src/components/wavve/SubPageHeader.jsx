import { HomeHero } from '../home/HomeHero';

// 카테고리 페이지 상단: 히어로 배너 + 장르 필터 버튼
export const SubPageHeader = ({ heroItems = [], filters = [], activeFilter, onFilterChange }) => {
  return (
    <>
      <HomeHero items={heroItems} appResponsive />
      <nav className="category-filter-app" aria-label="장르 필터">
        <div className="category-filter-app__rows">
          {[filters.slice(0, Math.ceil(filters.length / 2)), filters.slice(Math.ceil(filters.length / 2))].map((row, index) => (
            <div className="category-filter-app__row" key={index}>
              {row.map(filter => <button key={filter.id} type="button" className={`category-filter__button ${activeFilter === filter.id ? 'is-active' : ''}`} aria-pressed={activeFilter === filter.id} onClick={() => onFilterChange(filter.id)}>{filter.label}</button>)}
            </div>
          ))}
        </div>
      </nav>
      {/* 장르 필터 버튼 영역 */}
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
