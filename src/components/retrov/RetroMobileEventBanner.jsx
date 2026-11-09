import quoteArt from '../../assets/retrov/mobile-event/quote.svg';
import heartArt from '../../assets/retrov/mobile-event/heart.svg';
import retroTvArt from '../../assets/retrov/mobile-event/retro-tv.svg';
import playArt from '../../assets/retrov/mobile-event/play.svg';

// 배너별 그림 (위치 · 크기는 RetroEventCarousel.scss 의 390 x 80 기준 좌표)
const ART = {
  'favorite-scene': [
    { name: 'heart-blur', src: heartArt },
    { name: 'heart-soft', src: heartArt },
    { name: 'heart', src: heartArt },
    { name: 'quote-small', src: quoteArt },
    { name: 'quote-large', src: quoteArt },
  ],
  'next-line': [
    { name: 'heart-blur', src: heartArt },
    { name: 'tv', src: retroTvArt },
    { name: 'heart', src: heartArt },
  ],
  'what-next': [
    { name: 'heart-blur', src: heartArt },
    { name: 'heart', src: heartArt },
    { name: 'heart-soft', src: heartArt },
    { name: 'play', src: playArt },
  ],
};

// 모바일 이벤트 배너 한 장: 제목 · 내용은 글자, 그림은 SVG 로 그려 어떤 화면 폭에서도 선명합니다.
export default function RetroMobileEventBanner({ banner }) {
  const [text, accent] = banner.mobileTitle;

  return (
    <div className={`rv-event-card rv-event-card--${banner.id}`}>
      {(ART[banner.id] ?? []).map(({ name, src }) => (
        <img key={name} className={`rv-event-card__art rv-event-card__art--${name}`} src={src} alt="" draggable={false} />
      ))}
      <div className="rv-event-card__copy">
        <h2>{text}{accent && <em>{accent}</em>}</h2>
        <p>{banner.mobileDescription.map((line) => <span key={line}>{line}</span>)}</p>
      </div>
    </div>
  );
}
