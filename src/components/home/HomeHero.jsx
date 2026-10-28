import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';

import { getImagePath } from '../../utils/imagePath';

import 'swiper/css';
import 'swiper/css/navigation';

export const HomeHero = ({ items = [] }) => {
    const [current, setCurrent] = useState(0);
    const [swiperInstance, setSwiperInstance] = useState(null);

    if (!items.length) return null;

    return (
        <section
            className="home-hero hero-full-width"
            aria-label="추천 배너"
        >
            <Swiper
                modules={[Autoplay, Navigation]}
                slidesPerView={1}
                spaceBetween={0}
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
                        <div
                            className="home-hero__slide"
                            style={
                                item.image
                                    ? {
                                        backgroundImage: `linear-gradient(90deg, #080c16 8%, transparent), url("${getImagePath(item.image)}")`
                                    }
                                    : undefined
                            }
                        >
                            <div className="home-hero__content">
                                <p>WAVVE PICK</p>
                                <h2>{item.title}</h2>
                                <p>{item.subtitle}</p>

                                <Link
                                    className="home-hero__link"
                                    to={item.link || '/'}
                                >
                                    자세히 보기 →
                                </Link>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            <div className="home-hero__controls">
                <button
                    type="button"
                    aria-label="이전 배너"
                    disabled={items.length < 2}
                    onClick={() => swiperInstance?.slidePrev()}
                >
                    ‹
                </button>

                <span>
                    {current + 1} / {items.length}
                </span>

                <button
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