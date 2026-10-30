import { categoryPages, weekdays } from './categoryData';

export { weekdays };

// 기존 카테고리에 저장된 요일 정보만 재사용한다. 최신 편성을 새로 추정하지 않는다.
// 실제 목록을 제공받으면 각 키의 배열을 ContentCard 형식의 데이터로 교체할 수 있다.
const programs = [...new Map(
  Object.values(categoryPages).flatMap((page) => page.items).map((program) => [program.id, program])
).values()];

export const weeklyContentByDay = Object.fromEntries(
  weekdays.map(({ id }) => [
    id,
    programs.filter((program) => program.title !== '돈 되는 경제' && program.days?.includes(id))
      .map((program) => ({ ...program, kind: program.kind || 'series' })),
  ])
);
