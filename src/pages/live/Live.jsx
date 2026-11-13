import styles from '../../styles/pages/live/LivePage.module.scss';
import { useEffect, useState } from 'react';
import { BrowsePageHeader } from '../../components/common/BrowsePageHeader';
import { LiveHero } from '../../components/live/LiveHero';
import { CategoryFilter } from '../../components/common/CategoryFilter';
import { LiveSection } from '../../components/live/LiveSection';
import { LiveCard } from '../../components/live/LiveCard';
import gridStyles from '../../styles/pages/live/LiveFilterGrid.module.scss';
import { livePrograms, liveTop10, liveCategories } from '../../data/live/liveData';


const LIVE_FILTERS = ['라이브 홈', '라이브 전체', '정주행 채널', '홈쇼핑', '지상파', '뉴스', '종합편성', '종합 엔터테인먼트', '영화/해외', '키즈/애니', '라디오/음악', '스포츠', '경제'];

const LIVE_FILTER_OPTIONS = LIVE_FILTERS.map((label) => ({ id: label, label }));

// 화면의 필터 이름과 기존 데이터의 분류 이름을 연결합니다.
const CATEGORY_NAMES = { 뉴스: '24시간 뉴스 채널' };

export const Live = () => {
  const [now, setNow] = useState(() => Date.now());
  const [selectedCategory, setSelectedCategory] = useState('라이브 홈');
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const getProgress = (program) => {
    const start = new Date(program.start).getTime();
    const end = new Date(program.end).getTime();
    const duration = end - start;
    if (!Number.isFinite(duration) || duration <= 0 || now < start) return 0;

    // 데모 편성은 같은 길이의 다음 방송으로 이어집니다.
    const elapsed = program.repeatSchedule
      ? (now - start) % duration
      : now - start;
    return Math.max(0, Math.min(100, elapsed / duration * 100));
  };
  const isHome = selectedCategory === '라이브 홈';
  const dataCategory = CATEGORY_NAMES[selectedCategory] ?? selectedCategory;
  const categories = liveCategories;
  const filteredPrograms = selectedCategory === '라이브 전체'
    ? livePrograms
    : livePrograms.filter((program) => program.category === dataCategory);
  const getCategoryTitle = (category) => category === '24시간 뉴스 채널' ? '뉴스' : category;
  return (
    <div className={styles.page} aria-label="라이브">
      <BrowsePageHeader title="라이브" />
      <LiveHero programs={liveTop10} getProgress={getProgress} />
      <CategoryFilter
        filters={LIVE_FILTER_OPTIONS}
        activeFilter={selectedCategory}
        onFilterChange={setSelectedCategory}
        ariaLabel="라이브 카테고리"
      />
      {isHome ? <div className={styles.sections}>
        {categories.length === 0 && <p role="status">현재 등록된 라이브 채널이 없어요.</p>}
        {categories.slice(0, 1).map((category) => <LiveSection key={category} title={getCategoryTitle(category)}
          items={livePrograms.filter((program) => program.category === category)} />)}
        <LiveSection title="실시간 채널 TOP 10" items={liveTop10} ranked />
        {categories.slice(1).map((category) => <LiveSection key={category} title={getCategoryTitle(category)}
          items={livePrograms.filter((program) => program.category === category)} />)}
      </div> : filteredPrograms.length > 0 ? (
        <ul className={gridStyles.grid} aria-label={`${selectedCategory} 채널 목록`}>
          {filteredPrograms.map((program) => (
            <li key={program.id}>
              <LiveCard program={program} compact />
            </li>
          ))}
        </ul>
      ) : <p className={gridStyles.empty} role="status">현재 등록된 라이브 채널이 없어요.</p>}
    </div>
  );
};
