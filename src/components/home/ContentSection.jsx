
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';

import { ContentCard } from './ContentCard';
import '../../styles/components/ContentSection.scss';

// 카드 종류별 설정
const CARD_TYPES = {
    default: {
        width: 318,
        group: 5
    },
    wide: {
        width: 379,
        group: 4
    },
    'coming-soon': {
        width: 407,
        group: 4
    }
};

export const ContentSection = ({
    title,
    items = [],
    moreLink,
    more,
    cardType = 'default'
}) => {
    const swiperRef = useRef(null);

    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(false);

    const config = CARD_TYPES[cardType] || CARD_TYPES.default;

    // 이전/다음 버튼 표시 여부 확인
    const updateNavigation = (swiper) => {
        if (!swiper) return;

        setCanPrev(!swiper.isBeginning && !swiper.isLocked);
        setCanNext(!swiper.isEnd && !swiper.isLocked);
    };

    return (
        <section
            className={`content-section content-section--${cardType}`}
            style={{
                '--content-card-width': `${config.width}px`
            }}
        >
            {/* 섹션 제목 */}
            <div className="content-section__header">
                <div className="content-section__title">
                    <h2>{title}</h2>

                    {(moreLink || more) && (
                        <Link to={moreLink || more}>
                            더보기
                        </Link>
                    )}
                </div>
            </div>

            {/* Swiper 슬라이드 영역 */}
            <div className="content-section__slider">
                <Swiper
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                        updateNavigation(swiper);
                    }}
                    onSlideChange={updateNavigation}
                    onResize={updateNavigation}
                    onBreakpoint={updateNavigation}
                    onReachBeginning={updateNavigation}
                    onReachEnd={updateNavigation}

                    // 카드 크기 및 이동 설정
                    slidesPerView="auto"
                    slidesPerGroup={2}
                    spaceBetween={18}
                    speed={500}

                    // 마우스 드래그
                    grabCursor={true}
                    simulateTouch={true}
                    longSwipesRatio={0.1}
                    shortSwipes={true}

                    // 슬라이드 개수가 적을 때 이동 방지
                    watchOverflow={true}

                    // 반응형 슬라이드 이동 개수
                    breakpoints={{
                        640: {
                            slidesPerGroup: 3,
                        },
                        1024: {
                            slidesPerGroup: 4,
                        },
                        1440: {
                            slidesPerGroup: config.group,
                        }
                    }}

                    className="content-section__swiper"
                >
                    {items.map((item, index) => (
                        <SwiperSlide
                            key={item.id ?? index}
                            className="card-slide"
                        >
                            <ContentCard item={item} />
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* 이전 버튼 */}
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

                {/* 다음 버튼 */}
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
