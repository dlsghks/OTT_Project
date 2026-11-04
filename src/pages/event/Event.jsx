import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getImagePath } from '../../utils/imagePath';
import RetroEventCarousel from '../../components/retrov/RetroEventCarousel';
import { eventBanners } from '../../data/retrov';
import '../../styles/Event.scss';

const events = [
  {
    id: 'check',
    title: '11월 출석체크',
    image: 'event-check.jpg',
    period: '2026. 11. 01 ~ 2026. 11. 30',
    reward: '매일 100코인, 특별한 날엔 더블로',
  },
  {
    id: 'payback',
    title: '첫 달 이용권 100% 페이백',
    image: 'event-payback.jpg',
    period: '2026. 10. 30 ~ 2027. 01. 31',
    reward: '없음',
  },
  {
    id: 'mma2026',
    title: 'MMA2026',
    image: 'event-mma.jpg',
    period: '2026. 10. 26 ~ 2026. 11. 04',
    reward: 'MMA2026 초대권',
  },
  {
    id: 'evil',
    title: '<레지던트 이블: 야생의 밤> 론칭 프로모션',
    image: 'event-evil.jpg',
    period: '2026. 11. 03 ~ 2026. 11. 16',
    reward: '오리지널 팝콘통(10명) or 사인 포스터',
  },
  {
    id: 'trinity',
    title: '트리니티항공 이용하면 웨이브 이용권이 무료!',
    image: 'event-trinity.jpg',
    period: '2026. 10. 01 ~ 2026. 12. 31',
    reward: '없음',
  },
  {
    id: 'play',
    title: '[플레이 패스권] 첫달 결제시, 다음달 100원!',
    image: 'event-play.jpg',
    period: '2026. 08. 13 ~ 2026. 11. 30',
    reward: '없음',
  },
  {
    id: 'kidzania',
    title: '웨이브 유료 회원이면 키자니아 최대 35% 할인!',
    image: 'event-kidzania.png',
    period: '2026. 07. 15 ~ 2026. 12. 31',
    reward: '키자니아 최대 35% 할인!',
  },
];

const endedEvents = [
  {
    id: 'ended-01',
    title: '<인턴> 론칭 프로모션',
    announcedAt: '2026. 11. 03',
  },
  {
    id: 'ended-02',
    title: '<스파이더맨 : 브랜드 뉴 데이> 론칭 프로모션',
    announcedAt: '2026. 10. 27',
  },
  {
    id: 'ended-03',
    title: '<하절기> 정주행 프로모션',
    announcedAt: '2026. 10. 13',
  },
  {
    id: 'ended-04',
    title: '<스트레인지 - 이토 준지의 잠 못 이루는 기묘한 이야기> 론칭 프로모션',
    announcedAt: '2026. 10. 06',
  },
  {
    id: 'ended-05',
    title: '<극장판 귀멸의 칼날: 무한성편 제1장> 론칭 프로모션',
    announcedAt: '2026. 08. 13',
  },
  {
    id: 'ended-06',
    title: '<검사실의 제안> 정주행 프로모션',
    announcedAt: '2026. 10. 06',
  },
  {
    id: 'ended-07',
    title: '<만달로리안과 그로구> 론칭 프로모션',
    announcedAt: '2026. 08. 11',
  },
  {
    id: 'ended-08',
    title: '<피의 게임X> X 레드버튼 제휴 이벤트',
    announcedAt: '2026. 08. 10',
  },
  {
    id: 'ended-09',
    title: '당신의 삶은 네버엔딩 스토리 - 이승철',
    announcedAt: '2026. 07. 21',
  },
  {
    id: 'ended-10',
    title: '<악마는 프라다를 입는다 2> 론칭 프로모션',
    announcedAt: '2026. 07. 15',
  },
].map((event, index) => ({
  ...event,
  image: `/images/events/end/ended-event${String(index + 1).padStart(2, '0')}.jpg`,
}));

export const Event = () => {
  const [activeTab, setActiveTab] = useState('ongoing');
  const isOngoing = activeTab === 'ongoing';
  const visibleEvents = isOngoing ? events : endedEvents;

  return (
    <div className="event-page">
      <section className="event-page__hero" aria-label="MMA2026 이벤트">
        <Link to="/eventdetail/mma2026">
          <img
            src={getImagePath('/images/events/event-banner-MMA.jpg')}
            alt="웨이브에서 MMA2026 이벤트 참여하고 직관 티켓 받아보자"
          />
        </Link>
      </section>

      <div className="event-page__content">
        <div className="event-page__tabs" role="tablist" aria-label="이벤트 구분">
          <button
            id="event-tab-ongoing"
            type="button"
            role="tab"
            aria-selected={isOngoing}
            aria-controls="event-panel"
            className={isOngoing ? 'is-active' : ''}
            onClick={() => setActiveTab('ongoing')}
          >
            진행중 이벤트
          </button>

          <button
            id="event-tab-winners"
            type="button"
            role="tab"
            aria-selected={!isOngoing}
            aria-controls="event-panel"
            className={!isOngoing ? 'is-active' : ''}
            onClick={() => setActiveTab('winners')}
          >
            당첨자 발표
          </button>
        </div>

        <section
          id="event-panel"
          role="tabpanel"
          aria-labelledby={`event-tab-${activeTab}`}
        >
          <ul className="event-page__list">
            {visibleEvents.map((event) => (
              <li key={event.id}>
                <Link
                  className="event-page__card"
                  to={`/eventdetail/${event.id}`}
                >
                  <img
                    className="event-page__thumbnail"
                    src={getImagePath(
                      isOngoing
                        ? `/images/events/${event.image}`
                        : event.image
                    )}
                    alt=""
                    loading="lazy"
                  />

                  <div className="event-page__info">
                    <h2>{event.title}</h2>

                    <dl>
                      {isOngoing ? (
                        <>
                          <div>
                            <dt>기간</dt>
                            <dd>{event.period}</dd>
                          </div>
                          <div>
                            <dt>경품</dt>
                            <dd>{event.reward}</dd>
                          </div>
                        </>
                      ) : (
                        <div>
                          <dt>발표</dt>
                          <dd>{event.announcedAt}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <nav
            className="event-page__pagination"
            aria-label={isOngoing ? '진행중 이벤트 페이지' : '당첨자 발표 페이지'}
          >
            <button
              type="button"
              aria-current="page"
              aria-label="1페이지"
            >
              1
            </button>
          </nav>
        </section>
      </div>

      <div className="event-page__bottom">
        <RetroEventCarousel banners={eventBanners} />
      </div>
    </div>
  );
};

export default Event;