import { Link } from 'react-router-dom';
import '../../styles/components/home/HomeGenreNav.scss';

const GENRES = [
  ['예능', '/entertainment'], ['드라마', '/drama'], ['영화', '/movie'],
  ['시사교양', '/currentaffairs'], ['애니', '/animation'], ['해외시리즈', '/global'],
  ['레트로브', '/retrov'],
];

// 모바일 공통 헤더 아래에 표시되는 메인 전용 장르 메뉴입니다.
export const HomeGenreNav = () => (
  <nav className="home-genre-nav" aria-label="메인 장르">
    <ul>{GENRES.map(([label, to]) => <li key={to}><Link to={to}>{label}</Link></li>)}</ul>
  </nav>
);
