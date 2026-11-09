import { CategorySlider } from './CategorySlider';

// TOP 20 랭킹 (카드 좌측 하단 순위 숫자)
export const RankRow = ({ title, items = [], moreLink }) => {
  return <CategorySlider title={title} items={items} moreLink={moreLink} ranked />;
};
