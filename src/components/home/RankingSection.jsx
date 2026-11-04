import { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { ContentCard } from './ContentCard';

import 'swiper/css';

export const RankingSection = ({ items = [] }) => {
    const swiperRef = useRef(null);

    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(false);

    // 이전/다음 버튼 표시 여부 확인
    const updateNavigation = (swiper) => {
        if (!swiper) return;

        setCanPrev(!swiper.isBeginning && !swiper.isLocked);
        setCanNext(!swiper.isEnd && !swiper.isLocked);
    };

    return (
        <section className="home-section ranking-section">
            {/* 섹션 제목 */}
            <div className="home-section__head">
                <h2>오늘의 TOP 랭킹</h2>
            </div>

            {/* Swiper 슬라이드 영역 */}
            <div className="ranking-section__slider">
                <Swiper
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                        updateNavigation(swiper);
                    }}
                    onSlideChange={updateNavigation}
                    onResize={updateNavigation}
                    onBreakpoint={updateNavigation}

                    slidesPerView="auto"
                    slidesPerGroup={2}
                    spaceBetween={18}
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
                        }
                    }}

                    className="ranking-section__swiper"
                >
                    {items.map((item, index) => (
                        <SwiperSlide
                            key={item.id ?? index}
                            className="card-slide"
                        >
                            <ContentCard
                                item={item}
                                rank={index + 1}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* 이전 버튼 */}
                {canPrev && (
                    <button
                        type="button"
                        className="ranking-section__arrow ranking-section__arrow--prev"
                        aria-label="랭킹 이전"
                        onClick={() => swiperRef.current?.slidePrev()}
                    >
                        <span>‹</span>
                    </button>
                )}

                {/* 다음 버튼 */}
                {canNext && (
                    <button
                        type="button"
                        className="ranking-section__arrow ranking-section__arrow--next"
                        aria-label="랭킹 다음"
                        onClick={() => swiperRef.current?.slideNext()}
                    >
                        <span>›</span>
                    </button>
                )}
            </div>
        </section>
    );
};