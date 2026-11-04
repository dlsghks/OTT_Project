import { useParams } from 'react-router-dom';
import { TvDetail } from '../../components/detail/TvDetail';

// 해외시리즈 상세 페이지 설정
// - discover: 방영 중 · 요즘 인기 섹션의 TMDB 조건 (미국 시리즈 (애니 · 뉴스 · 예능 제외))
// - personExcludeGenres: 배우 출연작에서 뺄 TMDB 장르 id (뉴스 10763 · 리얼리티 10764 · 토크 10767)
const config = {
  category: 'global',
  name: '해외시리즈',
  basePath: '/globaldetail',
  backLink: '/global',
  discover: { with_origin_country: 'US', without_genres: '16|10763|10764|10767' },
  personExcludeGenres: [10763, 10764, 10767],
};

export const GlobalDetail = () => {
  const { programId } = useParams();
  // 다른 프로그램으로 이동하면 시즌 · 관심 상태를 새로 시작
  return <TvDetail key={programId} programId={programId} config={config} />;
};
