import tvFrameDefault from "../../assets/retrov/tv-frame.png";
import tvFrameWgm from "../../assets/retrov/tv-frame-wgm.png";
import tvFrameFullHouse from "../../assets/retrov/tv-frame-full-house.png";
import tvFrameHighKick from "../../assets/retrov/tv-frame-high-kick.png";
import tvFrameDadWhere from "../../assets/retrov/tv-frame-dad-where.png";
import tvFrameBoysOverFlowers from "../../assets/retrov/tv-frame-boys-over-flowers.png";
import "../../styles/components/RetroTv.scss";

// 썸네일 위치 (top right bottom left) — 프레임의 투명한 화면 영역보다 살짝 크게 잡아 테두리 아래로 숨김
const INSET_NARROW = "5.6% 6.2% 6.9% 6.2%"; // 무한도전·우결 (화면 영역 6.3% 6.7% 7.5% 6.7%)
const INSET_WIDE = "5.8% 4.8% 5.6% 5.0%"; // 풀하우스·하이킥·아빠어디가·꽃남 (화면 영역 약 6.5% 5.5% 6.5% 5.5%)

// 프로그램별 TV 테두리 (programDetails[id].tvFrame 값으로 선택)
const TV_FRAMES = {
  default: { src: tvFrameDefault, inset: INSET_NARROW }, // 무한도전 (회색)
  wgm: { src: tvFrameWgm, inset: INSET_NARROW }, // 우리 결혼했어요 (보라)
  "full-house": { src: tvFrameFullHouse, inset: INSET_WIDE }, // 풀하우스 (자주)
  "high-kick": { src: tvFrameHighKick, inset: INSET_WIDE }, // 거침없이 하이킥 (브라운)
  "dad-where": { src: tvFrameDadWhere, inset: INSET_WIDE }, // 아빠! 어디가? (블루그레이)
  "boys-over-flowers": { src: tvFrameBoysOverFlowers, inset: INSET_WIDE }, // 꽃보다 남자 (그린)
};

// 브라운관 TV 테두리 + 화면 속 썸네일
export default function RetroTvFrame({ src, alt = "", frame = "default", className = "" }) {
  const tvFrame = TV_FRAMES[frame] ?? TV_FRAMES.default;

  return (
    <div className={`retro-tv ${className}`.trim()} style={{ "--tv-screen-inset": tvFrame.inset }}>
      <div className="retro-tv__screen">
        {src && <img src={src} alt={alt} loading="lazy" draggable="false" />}
      </div>
      <img className="retro-tv__frame" src={tvFrame.src} alt="" aria-hidden="true" draggable="false" />
    </div>
  );
}
