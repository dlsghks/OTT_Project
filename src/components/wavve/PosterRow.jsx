import { CategorySlider } from './CategorySlider';

// 테마별 포스터 슬라이드 (콘텐츠가 없으면 숨김)
export const PosterRow = ({ title, items = [], moreLink }) => {
  if (!items.length) return null;

  return <CategorySlider title={title} items={items} moreLink={moreLink} />;
};
