import { Link } from 'react-router-dom';
import nextArt from '../../assets/responsive/quiz-next.png';
import favoriteArt from '../../assets/mypage/quiz-favorite.png';
import linesArt from '../../assets/mypage/quiz-lines.png';
import heart0 from '../../assets/responsive/heart-0.svg';
import heart1 from '../../assets/responsive/heart-1.svg';
import heart2 from '../../assets/responsive/heart-2.svg';
import heart3 from '../../assets/responsive/heart-3.svg';
import heart4 from '../../assets/responsive/heart-4.svg';

const ART = { 'what-next': nextArt, 'favorite-scene': favoriteArt, 'next-line': linesArt };
const HEARTS = [heart0, heart1, heart2, heart3, heart4];

// 이벤트 배열의 기존 순서는 유지합니다. 모바일에서는 세 배너를 세로로 표시합니다.
export default function RetroMobileEvents({ banners }) {
  return <div className="rv-mobile-events">{banners.map(banner => (
    <Link to="/event" key={banner.id} className={`rv-mobile-events__banner rv-mobile-events__banner--${banner.id}`}>
      <div className="rv-mobile-events__copy"><h2>{banner.title}</h2><p>{banner.description}</p></div>
      <img className="rv-mobile-events__art" src={ART[banner.id]} alt="" />
      {HEARTS.map((src, index) => <img key={src} className={`rv-mobile-events__heart rv-mobile-events__heart--${index}`} src={src} alt="" />)}
    </Link>
  ))}</div>;
}
