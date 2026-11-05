import '../../styles/components/SpecialHero.scss';

// 스페셜 페이지 상단 hero (웨이브 special 페이지 w-special-title 구조)
// - 기본형: 1920×1080 배경 + 가운데 로고 · 설명 (높이 540px 기준)
// - short : 1920×380 배경 + 왼쪽 로고만 (골프 · 뉴스, 웨이브 short-header)
// - tag   : 로고 위 작은 태그 이미지
// - tags  : 해시태그 칩, 누르면 SectionRenderer 가 부여한 section-{id} 앵커로 스크롤
export const SpecialHero = ({ title, description, hero = {}, tags = [] }) => {
  const { background, logo, tag, short = false } = hero;

  const scrollTo = (id) =>
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <header className={`special-hero ${short ? 'special-hero--short' : ''}`}>
      {background && (
        <div
          className="special-hero__background"
          style={{ backgroundImage: `url(${background})` }}
          aria-hidden="true"
        />
      )}

      <div className="special-hero__inner">
        {tag && !short && <img className="special-hero__tag" src={tag} alt="" draggable={false} />}

        <h1 className="special-hero__title">
          {logo ? <img className="special-hero__logo" src={logo} alt={title} draggable={false} /> : title}
        </h1>

        {description && !short && <p className="special-hero__description">{description}</p>}

        {tags.length > 0 && (
          <nav className="special-hero__tags" aria-label={`${title} 바로가기`}>
            {tags.map((item) => (
              <button key={item.target} type="button" onClick={() => scrollTo(item.target)}>
                #{item.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};
