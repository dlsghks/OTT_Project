import styles from '../../styles/pages/live/LivePage.module.scss';
import { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { SliderArrow } from '../common/SliderArrow';
import { SectionTitle } from '../common/SectionTitle';
import { LiveCard } from './LiveCard';
import 'swiper/css';


export const LiveSection = ({ title, items = [], ranked = false }) => {
  const swiperRef = useRef(null);
  const [navigation, setNavigation] = useState({ prev: false, next: false });
  const update = (swiper) => setNavigation({ prev: !swiper.isBeginning && !swiper.isLocked, next: !swiper.isEnd && !swiper.isLocked });
  return (
    <section className={`${styles.section} ${ranked ? styles.rankedSection : ''}`}>
      <div className={styles.sectionHeader}><SectionTitle>{title}</SectionTitle></div>
      <div className={styles.slider}>
        <Swiper className={styles.cardSwiper} slidesPerView="auto" spaceBetween={18}
          breakpoints={{ 0: { spaceBetween: 8 }, 601: { spaceBetween: 12 }, 1025: { spaceBetween: 18 } }} speed={500} watchOverflow
          onSwiper={(swiper) => { swiperRef.current = swiper; update(swiper); }}
          onSlideChange={update} onResize={update}>
          {items.map((program) => <SwiperSlide className={styles.cardSlide} key={program.id}><LiveCard program={program} ranked={ranked} /></SwiperSlide>)}
        </Swiper>
        {navigation.prev && <SliderArrow thumbnailSelector={`.${styles.thumb}`} direction="prev" aria-label={`${title} 이전 목록`} onClick={() => swiperRef.current?.slidePrev()} />}
        {navigation.next && <SliderArrow thumbnailSelector={`.${styles.thumb}`} direction="next" aria-label={`${title} 다음 목록`} onClick={() => swiperRef.current?.slideNext()} />}
      </div>
    </section>
  );
};
