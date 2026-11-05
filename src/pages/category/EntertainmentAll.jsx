import { PosterGridPage } from '../../components/wavve/PosterGridPage';
import { categoryPages } from '../../data/categoryData';

// 이전에 완성한 예능 전체보기 주소 /entertainment/all은 그대로 유지합니다.
// 다른 다섯 카테고리와 동일한 Figma 스타일·하트 버튼·카드 로직을 사용합니다.
export const EntertainmentAll = () => (
  <PosterGridPage
    title="믿고 보는 웨이브 에디터 추천작"
    description={<>주요 Line-up이나 화제작들을<br />웨이브에서 만나보세요</>}
    items={categoryPages.entertainment.items}
  />
);
