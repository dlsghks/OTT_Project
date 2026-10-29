import { RankRow } from './RankRow';
import { WeekdayRow } from './WeekdayRow';
import { PosterRow } from './PosterRow';
import { CollectionRow } from './CollectionRow';

const sectionTypes = {
  rank: RankRow,
  weekday: WeekdayRow,
  poster: PosterRow,
  collection: CollectionRow,
};

// 섹션 type 에 맞는 컴포넌트로 그리기
export const SectionRenderer = ({ sections = [] }) => {
  return sections.map((section) => {
    const Section = sectionTypes[section.type];
    return Section ? <Section key={section.id} {...section} /> : null;
  });
};
