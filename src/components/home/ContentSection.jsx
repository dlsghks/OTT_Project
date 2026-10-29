
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';

import { ContentCard } from './ContentCard';
import '../../styles/components/ContentSection.scss';

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

    const updateNavigation = (swiper) => {
        if (!swiper) return;

        setCanPrev(!swiper.isBeginning);
        setCanNext(!swiper.isEnd);
    };

    return (
        <section
            className={`content-section content-section--${cardType}`}
            style={{ '--content-card-width': `${config.width}px` }}
        >
            <div className="content-section__header">
                <div className="content-section__title">
                    <h2>{title}</h2>

                    {(moreLink || more) && (
                        <Link to={moreLink || more}>더보기</Link>
                    )}
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
                    onReachBeginning={updateNavigation}
                    onReachEnd={updateNavigation}
                    slidesPerView="auto"
                    slidesPerGroup={config.group}
                    spaceBetween={18}
                    speed={500}
                    grabCursor={true}
                    simulateTouch={true}
                    longSwipesRatio={0.1}
                    shortSwipes={true}
                    watchOverflow={true}
                    className="content-section__swiper"
                >
                    {items.map((item, index) => (
                        <SwiperSlide key={item.id ?? index}>
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
