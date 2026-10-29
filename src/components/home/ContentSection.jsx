
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';

import { ContentCard } from './ContentCard';

export const ContentSection = ({
    title,
    items = [],
    moreLink
}) => {
    const swiperRef = useRef(null);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(false);

    const updateNavigation = (swiper) => {
        setCanPrev(!swiper.isBeginning);
        setCanNext(!swiper.isEnd);
    };

    return (
        <section className="content-section">
            <div className="content-section__header">
                <div className="content-section__title">
                    <h2>{title}</h2>
                    {moreLink && <Link to={moreLink}>더보기</Link>}
                </div>
            </div>

            <div className="content-section__slider">
                <Swiper
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                        updateNavigation(swiper);
                    }}
                    onSlideChange={updateNavigation}
                    onResize={updateNavigation}
                    // 카드 크기는 공통 변수(--card-w)로 고정, 간격은 .card-slide 의 margin
                    slidesPerView="auto"
                    slidesPerGroup={2}
                    speed={500}
                    grabCursor={true}
                    simulateTouch={true}
                    longSwipesRatio={0.1}
                    shortSwipes={true}
                    watchOverflow={true}
                    breakpoints={{
                        640: {
                            slidesPerGroup: 3,
                        },
                        1024: {
                            slidesPerGroup: 4,
                        },
                        1440: {
                            slidesPerGroup: 5,
                        },
                    }}
                    className="content-section__swiper"
                >
                    {items.map((item, index) => (
                        <SwiperSlide key={item.id ?? index} className="card-slide">
                            <ContentCard item={item} />
                        </SwiperSlide>
                    ))}
                </Swiper>

                {canPrev && (
                    <button
                        type="button"
                        className="content-section__arrow content-section__arrow--prev"
                        aria-label="이전 콘텐츠"
                        onClick={() => swiperRef.current?.slidePrev()}
                    >
                        <span>‹</span>
                    </button>
                )}

                {canNext && (
                    <button
                        type="button"
                        className="content-section__arrow content-section__arrow--next"
                        aria-label="다음 콘텐츠"
                        onClick={() => swiperRef.current?.slideNext()}
                    >
                        <span>›</span>
                    </button>
                )}
            </div>
        </section>
    );
};
