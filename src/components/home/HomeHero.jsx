import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';

import { getImagePath } from '../../utils/imagePath';

import 'swiper/css';
import 'swiper/css/navigation';

export const HomeHero = ({ items = [], appResponsive = false }) => {
    const [current, setCurrent] = useState(0);

    // 가운데 정렬 + 양옆 미리보기에는 실제 배너보다 많은 슬라이드가 필요합니다.
    // 원본 순서를 반복하고 가운데 묶음의 첫 배너에서 시작합니다.
    // 첫 화면부터 양쪽 미리보기를 채우며 카운터는 원본 개수만 표시합니다.
    const repeatCount = items.length > 1 ? Math.max(3, Math.ceil(9 / items.length)) : 1;
    const slides = Array.from({ length: Math.max(1, repeatCount) }, (_, copy) =>
        items.map((item, sourceIndex) => ({ item, sourceIndex, copy }))
    ).flat();
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
                initialSlide={items.length > 1 ? items.length * Math.floor(repeatCount / 2) : 0}
                spaceBetween={18}
                breakpoints={appResponsive ? {
                    0: { spaceBetween: 12 },
                    601: { spaceBetween: 16 },
                    1025: { spaceBetween: 18 },
                } : undefined}
                loop={items.length > 1}
                loopAdditionalSlides={2}
                loopAddBlankSlides={false}
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
                    setCurrent(swiper.realIndex % items.length);
                }}
                className="home-hero__swiper"
            >
                {slides.map(({ item, sourceIndex, copy }) => (
                    <SwiperSlide key={`${item.id ?? sourceIndex}-${copy}`} data-source-index={sourceIndex}>
                        <Link
                            className="home-hero__slide"
                            to={item.link || '/'}
                            aria-label={item.title || `추천 배너 ${sourceIndex + 1}`}
                        >
                            <img
                                className="home-hero__background"
                                src={getImagePath(item.image)}
                                alt={item.title || `추천 배너 ${sourceIndex + 1}`}
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
