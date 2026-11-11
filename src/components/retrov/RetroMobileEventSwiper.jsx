import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import RetroMobileEventBanner from './RetroMobileEventBanner';

import 'swiper/css';
import '../../styles/components/retrov/RetroEventCarousel.scss';

// 모바일 공통 이벤트 배너: 화면 폭에 꽉 차는 390:80 배너, 3초 자동 넘김 · 무한 루프
export default function RetroMobileEventSwiper({ banners = [], className = '' }) {
  if (!banners.length) return null;

  return (
    <section className={`rv-event-mobile ${className}`.trim()} aria-label="추천 이벤트">
      <Swiper
        modules={[Autoplay]}
        slidesPerView={1}
        loop={banners.length > 1}
        speed={500}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <Link
              to={banner.link ?? '/eventdetail'}
              className="rv-event-mobile__link"
              aria-label={[banner.title, banner.description].filter(Boolean).join(' ')}
              draggable={false}
            >
              <RetroMobileEventBanner banner={banner} />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
