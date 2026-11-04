import { CategorySlider } from '../wavve/CategorySlider';

// 테마별 포스터 슬라이드 목록 (콘텐츠가 없는 섹션은 숨김)
export const DetailSections = ({ sections = [] }) => {
  return sections
    .filter((section) => section?.items?.length > 0)
    .map((section) => (
      <CategorySlider key={section.id} title={section.title} items={section.items} />
    ));
};
