import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';

import { getImagePath } from '../../utils/imagePath';

// 채널 로고 박스 가로 슬라이드 (로고 이미지가 없으면 채널명 표시)
export const ChannelRow = ({ title, items = [] }) => {
  if (!items.length) return null;

  return (
    <section className="category-row channel-row">
      <div className="category-row__header">
        <div className="category-row__title">
          <h2>{title}</h2>
        </div>
      </div>

      <div className="category-row__slider">
        <Swiper
          slidesPerView="auto"
          slidesPerGroup={3}
          speed={500}
          grabCursor
          watchOverflow
          className="category-row__swiper"
        >
          {items.map((item) => (
            <SwiperSlide key={item.id} className="channel-row__slide">
              <Link to={item.link ?? '/live'} className={`channel-card ${item.logo ? 'channel-card--logo' : ''}`} aria-label={item.name} draggable={false}>
                {item.logo ? (
                  <img src={getImagePath(item.logo)} alt={item.name} draggable={false} />
                ) : (
                  <span>{item.name}</span>
                )}
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};
