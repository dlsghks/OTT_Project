import { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import styles from '../../styles/components/live/LiveChannelFilters.module.scss';

export const LiveChannelFilters = ({ items, value, onChange, formatLabel = (label) => label }) => {
  const slider = useRef(null);
  const [navigation, setNavigation] = useState({ prev: false, next: false });
  const update = (swiper) => setNavigation({
    prev: !swiper.isBeginning && !swiper.isLocked,
    next: !swiper.isEnd && !swiper.isLocked,
  });

  return (
    <nav className={styles.root} aria-label="채널 분류">
      <Swiper className={styles.swiper} slidesPerView="auto" spaceBetween={12} speed={350} grabCursor watchOverflow
        onSwiper={(swiper) => { slider.current = swiper; update(swiper); }}
        onSlideChange={update} onResize={update} onUpdate={update} onLock={update} onUnlock={update}>
        {items.map((item) => <SwiperSlide className={styles.slide} key={item}>
          <button type="button" aria-pressed={value === item} onClick={() => onChange(item)}>{formatLabel(item)}</button>
        </SwiperSlide>)}
      </Swiper>
      {navigation.prev && <button type="button" className={`${styles.arrow} ${styles.prev}`} aria-label="이전 채널 분류" onClick={() => slider.current?.slidePrev()}><svg viewBox="0 0 12 20" aria-hidden="true"><path d="m9 2-6 8 6 8" /></svg></button>}
      {navigation.next && <button type="button" className={`${styles.arrow} ${styles.next}`} aria-label="다음 채널 분류" onClick={() => slider.current?.slideNext()}><svg viewBox="0 0 12 20" aria-hidden="true"><path d="m3 2 6 8-6 8" /></svg></button>}
    </nav>
  );
};
