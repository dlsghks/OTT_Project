import { SectionTitle } from '../../components/common/SectionTitle';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { getImagePath } from '../../utils/imagePath';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../../styles/pages/customer/Service.scss';

const image = (name) => getImagePath(`/images/service/${name}`);

const slides = [
  { image: 'intro-slide-01.png', heading: <>재미의 파도를 타다!<br />Wavve</>, description: <>다시 한번 새로워진 Wavve!<br />더욱 다양한 콘텐츠와 혜택,<br />Wavve에서 재미의 파도를 타보세요.</> },
  { image: 'intro-slide-02.png', heading: <>볼만한 콘텐츠,<br />더욱 재미있게<br />만나세요</>, description: <>오직 웨이브에서만 만나볼 수 있는<br />다양한 콘텐츠와 테마별 에디터 픽으로<br />보고싶은 콘텐츠를 만나보세요.</> },
  { image: 'intro-slide-03.png', heading: <>더욱 풍부해진<br />LIVE, VOD, 영화</>, description: <>국내 대표 방송사 포함 LIVE 채널과 방송 VOD,<br />취향저격 해외시리즈와 영화!<br />세상에서 가장 빠른 Quick VOD는 물론,<br />이용권 하나로 영화까지!</> },
  { image: 'intro-slide-04.png', heading: <>더욱 합리적이고<br />새로워진<br />Wavve 이용권</>, description: <>베이직, 스탠다드, 프리미엄<br />어떤 이용권으로든 다양한 기기에서<br />Wavvie 영화까지 자유롭게!</> },
];

export const Service = () => (
  <div className="service-page">
    <section className="service-page__hero" style={{ backgroundImage: `url(${image('hero-background.png')})` }}>
      <div className="service-page__hero-copy">
        <h1>JUST DIVE!<br /><img src={image('wavve-blue-logo.png')} alt="wavve" /></h1>
        <p>즐거운 콘텐츠 경험의 시작<br />다양한 콘텐츠를 내 취향대로 만나보세요.</p>
      </div>
    </section>

    <section className="service-page__intro" aria-label="Wavve 서비스 특징">
      <Swiper modules={[Autoplay, Pagination, Navigation]} autoplay={{ delay: 5000, disableOnInteraction: false }} pagination={{ clickable: true }} navigation loop>
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="service-page__intro-slide">
              <div className="service-page__intro-copy"><SectionTitle>{slide.heading}</SectionTitle><p>{slide.description}</p></div>
              <img className="service-page__intro-image" src={image(slide.image)} alt={`Wavve 서비스 화면 ${index + 1}`} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>

    <section className="service-page__feature">
      <small>Wavve screen</small><SectionTitle>Fit your <em>screen</em></SectionTitle><p>당신의 스크린에 딱 맞추어 Wavve를 즐겨보세요.</p>
      <img className="service-page__devices-image" src={image('screen-devices.png')} alt="PC, 태블릿, 모바일의 Wavve 화면" />
      <div className="service-page__two-col"><div><h3>더 넓게</h3><p>다양한 화면에서 즐기는 콘텐츠</p></div><div><h3>더 편리하게</h3><p>나에게 맞는 디바이스로 즐겨보세요.</p></div></div>
    </section>

    <section className="service-page__feature service-page__style">
      <small>Wavve style</small><SectionTitle>Fit your <em>style</em></SectionTitle><p>당신의 스타일에 맞추어 Wavve를 즐겨보세요!</p>
      <img className="service-page__style-image" src={image('style-phones.png')} alt="콘텐츠, 이용권, 홈 화면의 Wavve 모바일 앱" />
      <div className="service-page__style-grid"><div><h3>영화도 Wavve!</h3><p>취향에 맞는 다양한 콘텐츠</p></div><div><h3>음악도 Wavve!</h3><p>다채로운 콘텐츠를 즐겨보세요</p></div><div><h3>PC와 함께, 더 생생하게</h3><p>큰 화면으로 즐기는 Wavve</p></div></div>
    </section>

    <section className="service-page__download">
      <small>내 마음대로</small><SectionTitle>새로운 Wavve를 만나보세요</SectionTitle><p>더욱 다양한 콘텐츠와 함께, Wavve에서 재미의 파도를 타보세요.</p>
      <div className="service-page__download-art"><img className="service-page__brand-text" src={image('brand-new-text.png')} alt="BRAND NEW" /><img className="service-page__download-phone" src={image('download-phone.png')} alt="Wavve 앱" /></div>
      <div className="service-page__store-links"><a href="https://apps.apple.com/kr/app/wavve-%EC%9B%A8%EC%9D%B4%EB%B8%8C/id987782077" target="_blank" rel="noreferrer"><img src={image('app-store.png')} alt="App Store에서 다운로드" /></a><a href="https://play.google.com/store/apps/details?id=kr.co.captv.pooqV2&hl=ko" target="_blank" rel="noreferrer"><img src={image('google-play.png')} alt="Google Play에서 다운로드" /></a></div>
    </section>

    <section className="service-page__ticket"><small>이용권</small><SectionTitle>어떤 이용권으로든<br />Wavve 영화까지 자유롭게!</SectionTitle><p>원하는 콘텐츠를 내게 맞는 이용권으로 즐겨보세요.</p><Link to="/pay" className="service-page__button">Wavve 이용권 보러가기</Link></section>

    <section className="service-page__social"><div><small>Wavve의 새로운 소식을 가장 먼저 만나보세요</small><h3>SNS에서 “Wavve”를 팔로우하세요!</h3></div><div><a href="https://www.instagram.com/wavve.official/" target="_blank" rel="noreferrer" aria-label="Instagram"><img src={image('instagram.png')} alt="" /></a><a href="https://www.youtube.com/@wavve" target="_blank" rel="noreferrer" aria-label="YouTube"><img src={image('youtube.png')} alt="" /></a><a href="https://www.tiktok.com/@wavve.official" target="_blank" rel="noreferrer" aria-label="TikTok"><img src={image('tiktok.png')} alt="" /></a></div></section>
    <p className="service-page__disclaimer">본 페이지는 학습용 비공식 Wavve 리디자인입니다.</p>
  </div>
);
