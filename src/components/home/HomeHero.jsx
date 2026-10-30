import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';

import { getImagePath } from '../../utils/imagePath';

import 'swiper/css';
import 'swiper/css/navigation';

export const HomeHero = ({ items = [] }) => {
    const [current, setCurrent] = useState(0);
    const [swiperInstance, setSwiperInstance] = useState(null);

    useEffect(() => {
        if (!swiperInstance) return;

        let frame = null;
        let highlighted = null;
        const updateBrightness = () => {
            frame = null;
            if (swiperInstance.destroyed) return;
            const viewport = swiperInstance.el.getBoundingClientRect();
            const center = viewport.left + viewport.width / 2;
            let nearest = null;
            let distance = Infinity;
            swiperInstance.slides.forEach((slide) => {
                const rect = slide.getBoundingClientRect();
                const offset = Math.abs(rect.left + rect.width / 2 - center);
                if (offset < distance) {
                    nearest = slide;
                    distance = offset;
                }
            });
            // 실제 화면상의 중간 지점을 통과할 때만 밝기 클래스를 전환한다.
            if (nearest !== highlighted) {
                highlighted?.classList.remove('home-hero__bright');
                highlighted = nearest;
            }
            // SwiperSlide가 자체 클래스를 다시 렌더링한 경우에도 복구한다.
            if (nearest && !nearest.classList.contains('home-hero__bright')) {
                nearest.classList.add('home-hero__bright');
            }
            if (swiperInstance.animating || swiperInstance.touchEventsData?.isTouched) {
                frame = requestAnimationFrame(updateBrightness);
            }
        };
        const schedule = () => {
            if (frame === null) frame = requestAnimationFrame(updateBrightness);
        };
        const events = ['setTranslate', 'transitionStart', 'transitionEnd', 'loopFix', 'resize', 'touchEnd'];
        events.forEach((event) => swiperInstance.on(event, schedule));
        schedule();
        return () => {
            events.forEach((event) => swiperInstance.off(event, schedule));
            if (frame !== null) cancelAnimationFrame(frame);
            highlighted?.classList.remove('home-hero__bright');
        };
    }, [swiperInstance]);

    if (!items.length) return null;

    return (
        <section
            className="home-hero hero-full-width"
            aria-label="추천 배너"
        >
            <Swiper
                modules={[Autoplay, Navigation]}
                slidesPerView="auto"
                centeredSlides={true}
                spaceBetween={18}
                loop={items.length > 1}
                speed={600}
                grabCursor={true}
                simulateTouch={true}
                allowTouchMove={items.length > 1}
                autoplay={
                    items.length > 1
                        ? {
                            delay: 5000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }
                        : false
                }
                onSwiper={setSwiperInstance}
                onSlideChange={(swiper) => {
                    setCurrent(swiper.realIndex);
                }}
                className="home-hero__swiper"
            >
                {items.map((item, index) => (
                    <SwiperSlide key={item.id ?? index}>
                        <Link
                            className="home-hero__slide"
                            to={item.link || '/'}
                            aria-label={item.title || `추천 배너 ${index + 1}`}
                        >
                            <img
                                className="home-hero__background"
                                src={getImagePath(item.image)}
                                alt={item.title || `추천 배너 ${index + 1}`}
                                draggable={false}
                            />
                            {item.textImage && (
                                <img
                                    className="home-hero__text"
                                    src={getImagePath(item.textImage)}
                                    alt=""
                                    aria-hidden="true"
                                    draggable={false}
                                />
                            )}
                        </Link>
                    </SwiperSlide>
                ))}
            </Swiper>

            <div className="home-hero__controls">
                <button
                    className="home-hero__arrow home-hero__arrow--prev"
                    type="button"
                    aria-label="이전 배너"
                    disabled={items.length < 2}
                    onClick={() => swiperInstance?.slidePrev()}
                >
                    ‹
                </button>

                <span className="home-hero__counter">
                    {current + 1} / {items.length}
                </span>

                <button
                    className="home-hero__arrow home-hero__arrow--next"
                    type="button"
                    aria-label="다음 배너"
                    disabled={items.length < 2}
                    onClick={() => swiperInstance?.slideNext()}
                >
                    ›
                </button>
            </div>
        </section>
    );
};
