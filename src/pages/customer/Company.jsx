import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import '../../styles/pages/Company.scss';

const sections = [
  { id: 'company-about', name: '회사소개' },
  { id: 'company-history', name: '연혁' },
  { id: 'company-bi', name: 'BI' },
  { id: 'company-award', name: 'Award' },
  { id: 'company-location', name: '오시는 길' },
];
const history = [
  { year: '2014', events: ['모바일 콘텐츠 서비스 확대', '새로운 플랫폼 기반 마련'] },
  { year: '2015', events: ['콘텐츠 서비스 개편', '오리지널 콘텐츠 준비'] },
  { year: '2016', events: ['플랫폼 서비스 고도화', '다양한 방송 콘텐츠 확대'] },
  { year: '2017', events: ['프리미엄 콘텐츠 확대', '고객 서비스 강화'] },
  { year: '2018', events: ['서비스 성장 및 콘텐츠 확장', '다양한 디바이스 지원'] },
  { year: '2019', events: ['Wavve 브랜드 출범', '통합 OTT 서비스 시작'] },
  { year: '2020', events: ['오리지널 콘텐츠 투자 확대'] },
  { year: '2021', events: ['콘텐츠 경쟁력 강화'] },
  { year: '2022', events: ['서비스 경험 개선'] },
  { year: '2023', events: ['콘텐츠 라인업 확대'] },
];
const broadcasters = ['SBS', 'KBS', 'MBC', 'SBS Plus', 'EBS', '채널A', 'JTBC', 'TVING', 'Disney+', 'KBS N', 'YTN', 'MBC every1', 'tvN', 'wavve', 'OCN'];

export const Company = () => {
  const [active, setActive] = useState('company-about');
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const moveTo = (id) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <div className="company-page">
      <div className="company-page__hero"><span>JUST DIVE!<br />콘텐츠웨이브</span></div>
      <nav className="company-page__tabs" aria-label="회사소개 섹션">
        {sections.map(({ id, name }) => <button type="button" key={id} className={active === id ? 'is-active' : ''} onClick={() => moveTo(id)}>{name}</button>)}
      </nav>
      <section className="company-page__section company-page__about" id="company-about">
        <h1>프리미엄 콘텐츠 포털, Wavve!</h1>
        <p>다채로운 프리미엄 채널과 VOD를 무제한 즐길 수 있어요.</p>
        <div className="company-page__bubble-cloud" aria-label="다양한 콘텐츠 파트너">
          {broadcasters.map((name, i) => <span key={`${name}-${i}`} className={`company-page__bubble company-page__bubble--${i % 5}`}>{name}</span>)}
        </div>
        <h2>사업영역</h2>
        <div className="company-page__business">
          <div><span aria-hidden="true">▣</span><p>브로드밴드<br />콘텐츠 서비스</p></div>
          <div><span aria-hidden="true">▱</span><p>프리미엄 독점<br />오리지널 콘텐츠</p></div>
          <div><span aria-hidden="true">◎</span><p>글로벌 콘텐츠<br />글로벌 OTT 사업</p></div>
        </div>
      </section>
      <section className="company-page__history" id="company-history">
        <h2>연혁</h2>
        <div className="company-page__history-wrap">
          <button ref={prevRef} type="button" className="company-page__arrow" aria-label="이전 연혁">‹</button>
          <Swiper modules={[Navigation]} spaceBetween={18} slidesPerView={1.3} breakpoints={{ 600: { slidesPerView: 3 }, 1000: { slidesPerView: 5 } }} onBeforeInit={(swiper) => { swiper.params.navigation.prevEl = prevRef.current; swiper.params.navigation.nextEl = nextRef.current; }} navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}>
            {history.map(({ year, events }) => <SwiperSlide key={year}><article className="company-page__history-card"><ul>{events.map((event) => <li key={event}>{event}</li>)}</ul><small>History</small></article><div className="company-page__year"><span className="company-page__dot" />{year}</div></SwiperSlide>)}
          </Swiper>
          <button ref={nextRef} type="button" className="company-page__arrow" aria-label="다음 연혁">›</button>
        </div>
      </section>
      <section className="company-page__section" id="company-bi">
        <h2>BI</h2>
        <div className="company-page__bi"><div className="company-page__brand">wavve</div><div><h3>JUST DIVE!</h3><p>웨이브의 브랜드 아이덴티티는 콘텐츠를 즐기는 새로운 경험과 즐거움을 표현합니다.</p><p>다양한 콘텐츠를 자유롭게 발견하고 몰입하는 순간을 지향합니다.</p></div></div>
      </section>
      <section className="company-page__section" id="company-award"><h2>Award</h2><div className="company-page__awards"><div><strong>BRAND</strong><small>KOREA MARKETING AWARDS</small></div><div><strong>15th</strong><small>KOREA ASSEMBLY GRAND AWARD</small></div></div><p className="company-page__muted">수상 내역의 상세 문구와 원본 이미지가 확보되면 교체할 수 있도록 구성했습니다.</p></section>
      <section className="company-page__section" id="company-location"><h2>오시는 길</h2><div className="company-page__map"><p>콘텐츠웨이브(주)</p><a href="https://map.naver.com/p/search/서울특별시%20영등포구%20여의나루로%2060" target="_blank" rel="noreferrer">지도에서 위치 확인 ↗</a></div><div className="company-page__address"><strong>주소</strong><p>서울특별시 영등포구 여의나루로 60 포스트타워 15층</p></div></section>
      <p className="company-page__disclaimer">본 페이지는 학습용 비공식 Wavve 리디자인입니다. 연혁 및 수상 상세 자료는 예시이며 공식 정보가 아닙니다.</p>
    </div>
  );
};
