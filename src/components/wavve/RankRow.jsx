import { CategorySlider } from './CategorySlider';

// TOP 20 랭킹 (카드 좌측 하단 순위 숫자)
export const RankRow = ({ title, items = [] }) => {
  return <CategorySlider title={title} items={items} ranked />;
};
