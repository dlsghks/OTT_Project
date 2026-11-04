import { useParams } from 'react-router-dom';
import { TvDetail } from '../../components/detail/TvDetail';

// 시사교양 상세 페이지 설정
// - discover: 방영 중 · 요즘 인기 섹션의 TMDB 조건 (다큐멘터리(99) · 뉴스(10763), 한국)
// - personExcludeGenres: 배우 출연작에서 뺄 TMDB 장르 id (뉴스 10763 · 리얼리티 10764 · 토크 10767)
const config = {
  category: 'currentaffairs',
  name: '시사교양',
  basePath: '/currentaffairsdetail',
  backLink: '/currentaffairs',
  discover: { with_genres: '99|10763', with_origin_country: 'KR' },
  personExcludeGenres: [],
};

export const CurrentaffairsDetail = () => {
  const { programId } = useParams();
  // 다른 프로그램으로 이동하면 시즌 · 관심 상태를 새로 시작
  return <TvDetail key={programId} programId={programId} config={config} />;
};
