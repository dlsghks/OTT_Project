import { Link, useParams } from 'react-router-dom';
import { PosterGridPage } from '../../components/wavve/PosterGridPage';
import { categoryPages } from '../../data/categoryData';

// 헤더 카테고리별 전체보기. 예능은 기존 EntertainmentAll 경로를 유지합니다.
export const CategoryAll = () => {
  const { category } = useParams();
  const page = categoryPages[category];

  if (!page) {
    return (
      <div className="see-all-page see-all-page--missing">
        <p>해당 카테고리를 찾을 수 없습니다.</p>
        <Link to="/">메인으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <PosterGridPage
      key={category}
      title={`${page.name} 전체보기`}
      description={`${page.name}의 다양한 작품을 웨이브에서 만나보세요`}
      items={page.items ?? []}
    />
  );
};
