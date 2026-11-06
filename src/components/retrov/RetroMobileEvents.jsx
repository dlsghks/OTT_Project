import { Link } from 'react-router-dom';
import nextArt from '../../assets/responsive/quiz-next.png';
import favoriteArt from '../../assets/mypage/quiz-favorite.png';
import linesArt from '../../assets/retrov/event-next-line-tv.svg'; // 레트로 TV (명대사 배너 디자인)
import quoteSmall from '../../assets/retrov/event-quote-small.svg'; // 최애 배너 위쪽 작은 따옴표 (디자인 시안)
import accentHeart from '../../assets/retrov/event-heart.svg'; // 명대사 배너 분홍 하트 (디자인 시안)
import heart0 from '../../assets/responsive/heart-0.svg';
import heart1 from '../../assets/responsive/heart-1.svg';
import heart2 from '../../assets/responsive/heart-2.svg';
import heart3 from '../../assets/responsive/heart-3.svg';
import heart4 from '../../assets/responsive/heart-4.svg';

const ART = { 'what-next': nextArt, 'favorite-scene': favoriteArt, 'next-line': linesArt };
const HEARTS = [heart0, heart1, heart2, heart3, heart4];

// 배너별 추가 그림 (디자인 시안): 최애 = 작은 따옴표 1개 더, 명대사 = 분홍 하트 2개
const EXTRAS = {
  'favorite-scene': [{ src: quoteSmall, className: 'quote' }],
  'next-line': [{ src: accentHeart, className: 'accent-heart-0' }, { src: accentHeart, className: 'accent-heart-1' }],
};

// 모바일 배너 문구 (디자인 줄바꿈 · 강조색)
// title: [기본 글자, 강조 글자] / description: 줄 단위
const COPY = {
  'favorite-scene': {
    title: ['나의 ', '최애장면은?!'],
    description: ['잊지 못할 장면에 투표하고,', '다른 팬들의 선택도 만나보세요'],
  },
  'next-line': {
    title: ['다음에 올 명대사는?'],
    description: ['그때 그 대사, 아직 기억하나요?'],
  },
  'what-next': {
    title: ['잠깐! 이다음에', '무슨 일이?'],
    description: ['잊지 못할 장면에 투표하고,', '다른 팬들의 선택도 만나보세요'],
  },
};

// 이벤트 배열의 기존 순서는 유지합니다. 모바일에서는 세 배너를 세로로 표시합니다.
export default function RetroMobileEvents({ banners }) {
  return <div className="rv-mobile-events">{banners.map(banner => {
    const copy = COPY[banner.id];
    const [text, accent] = copy?.title ?? [banner.title];
    const lines = copy?.description ?? [banner.description];

    return (
      <Link to={banner.link ?? "/event"} key={banner.id} className={`rv-mobile-events__banner rv-mobile-events__banner--${banner.id}`} aria-label={banner.title}>
        {HEARTS.map((src, index) => <img key={src} className={`rv-mobile-events__heart rv-mobile-events__heart--${index}`} src={src} alt="" />)}
        <img className="rv-mobile-events__art" src={ART[banner.id]} alt="" />
        {(EXTRAS[banner.id] ?? []).map(({ src, className }) => (
          <img key={className} className={`rv-mobile-events__extra rv-mobile-events__extra--${className}`} src={src} alt="" />
        ))}
        <div className="rv-mobile-events__copy">
          <h2>{text}{accent && <em>{accent}</em>}</h2>
          <p>{lines.map(line => <span key={line}>{line}</span>)}</p>
        </div>
      </Link>
    );
  })}</div>;
}
