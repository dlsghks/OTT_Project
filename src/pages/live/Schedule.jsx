import { useEffect, useMemo, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { getScheduleForDate, localDateKey } from '../../data/live/scheduleData';
import '../../styles/pages/live/Schedule.scss';
import '../../styles/pages/live/ScheduleResponsive.scss';
import { useMobileLayout } from '../../hooks/useMobileLayout';
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const pad = value => String(value).padStart(2, '0');
const toMinutes = date =>
  date.getHours() * 60 + date.getMinutes();
const formatMinutes = value =>
  `${pad(Math.floor(value / 60))}:${pad(value % 60)}`;
const dayStart = date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date, count) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + count);
const sameDay = (a, b) =>
  localDateKey(a) === localDateKey(b);
// 선택 시간을 기준으로 표시할 3시간 계산
const getVisibleStart = hour => {
  return Math.max(0, Math.min(21, hour - 1));
};
function ScheduleDialog({ onClose, program, reserved = false, onConfirm }) {
  const ref = useRef(null);
  useEffect(() => {
    const previousFocus = document.activeElement;
    const dialog = ref.current;
    dialog.showModal();
    return () => { dialog.close(); if (previousFocus?.isConnected) previousFocus.focus(); };
  }, []);
  return createPortal(
    <dialog ref={ref} className="schedule-replay-notice" aria-labelledby="schedule-replay-notice-title" aria-describedby="schedule-replay-notice-description" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
    }}>
      <button type="button" className="schedule-replay-notice__close" aria-label={program ? '시청 예약 닫기' : '다시보기 안내 닫기'} onClick={onClose}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg></button>
      <h2 id="schedule-replay-notice-title">{program ? '시청 예약' : '다시보기 안내'}</h2>
      <p id="schedule-replay-notice-description">{program ? <><strong>〈{program.title}〉</strong><br />{reserved ? '이미 예약된 프로그램이에요. 시청 예약을 취소할까요?' : '시청 예약을 설정할까요? 예약한 콘텐츠가 시작되면 알림을 받을 수 있도록 추후 알림 기능과 연동할 수 있어요.'}</> : '다시보기가 불가한 방송이에요.'}</p>
      <div className="schedule-replay-notice__actions">{program && <button type="button" className="schedule-replay-notice__cancel" onClick={onClose} autoFocus>취소</button>}<button type="button" className="schedule-replay-notice__confirm" onClick={program ? onConfirm : onClose} autoFocus={!program}>확인</button></div>
    </dialog>, document.body
  );
}
export const Schedule = () => {
  const isAppLayout = useMobileLayout();
  const navigate = useNavigate();
  const swiperRef = useRef(null);
  const timelineDragRef = useRef(null);
  const timelineDraggedRef = useRef(false);
  const startTimelineDrag = (event) => {
    timelineDraggedRef.current = false;
    if (!isAppLayout || event.pointerType !== 'mouse' || event.button !== 0) return;
    timelineDragRef.current = {
      pointerId: event.pointerId, startX: event.clientX,
      startY: event.clientY, scrollLeft: event.currentTarget.scrollLeft,
    };
  };
  const moveTimelineDrag = (event) => {
    const drag = timelineDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const target = event.currentTarget;
    const distance = event.clientX - drag.startX;
    if (!timelineDraggedRef.current) {
      if (Math.abs(distance) < 6 || Math.abs(distance) <= Math.abs(event.clientY - drag.startY)) return;
      if (target.scrollWidth <= target.clientWidth + 1) return;
      timelineDraggedRef.current = true;
      target.setPointerCapture?.(event.pointerId);
      target.dataset.dragging = 'true';
    }
    event.preventDefault();
    target.scrollLeft = drag.scrollLeft - distance;
  };
  const endTimelineDrag = (event) => {
    timelineDragRef.current = null;
    delete event.currentTarget.dataset.dragging;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };
  // 페이지 진입 시각
  const [enteredAt] = useState(() => new Date());
  // 현재 시각
  const [now, setNow] = useState(() => new Date());
  // 선택 날짜
  const [selectedDate, setSelectedDate] = useState(
    () => dayStart(new Date())
  );
  // 선택 시간
  const [selectedHour, setSelectedHour] = useState(
    () => new Date().getHours()
  );
  // 팝업 관련 상태
  const [replayNoticeOpen, setReplayNoticeOpen] = useState(false);
  const [reservationTarget, setReservationTarget] = useState(null);
  const [toast, setToast] = useState('');
  const [reservations, setReservations] = useState([]);
  // 1분마다 현재 시각 갱신
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60_000);
    return () => clearInterval(timer);
  }, []);
  // 이번 주 월요일
  const weekStart = useMemo(() => {
    const today = dayStart(enteredAt);
    return addDays(
      today,
      -((today.getDay() + 6) % 7)
    );
  }, [enteredAt]);
  // 이번 주 날짜 7개
  const days = useMemo(() => {
    return Array.from(
      { length: 7 },
      (_, i) => addDays(weekStart, i)
    );
  }, [weekStart]);
  // 선택 시간 기준 3시간 범위
  const visibleStart = getVisibleStart(selectedHour);
  const visibleEnd = visibleStart + 3;
  const visibleHours = [
    visibleStart,
    visibleStart + 1,
    visibleStart + 2
  ];
  const visibleStartMinute = visibleStart * 60;
  const visibleEndMinute = visibleEnd * 60;
  // 선택 날짜의 편성표
  const rows = useMemo(() => {
    return getScheduleForDate(selectedDate);
  }, [selectedDate]);
  // 시간 선택
  const handleSelectHour = hour => {
    setSelectedHour(hour);
    swiperRef.current?.slideTo(hour);
  };
  // 1시간 이전
  const handlePrevHour = () => {
    swiperRef.current?.slidePrev();
  };
  // 1시간 다음
  const handleNextHour = () => {
    swiperRef.current?.slideNext();
  };
  // 프로그램 방송 상태 확인
  const statusOf = program => {
    const todayKey = localDateKey(now);
    if (program.dateKey < todayKey) return 'past';
    if (program.dateKey > todayKey) return 'future';
    const minute = toMinutes(now);
    if (program.end <= minute) return 'past';
    if (program.start > minute) return 'future';
    return 'live';
  };
  // 하단 알림 메시지
  const showToast = message => {
    setToast(message);
    window.setTimeout(() => {
      setToast('');
    }, 2500);
  };
  // 다시보기
  const handleReplay = program => {
    // 상세 경로에 실제 콘텐츠 ID가 있어야 이동할 수 있습니다.
    const path = program.detailPath || '';
    const hasDetailPath = /^\/(?:programdetail|entertainmentdetail|dramadetail|moviedetail|currentaffairsdetail|animationdetail|globaldetail)\/[^/?#]+(?:[?#].*)?$/.test(path);
    if (!program.replayAvailable || !hasDetailPath) {
      setReplayNoticeOpen(true);
      return;
    }
    navigate(program.detailPath);
  };
  // 실시간 시청
  const handleWatch = program => {
    navigate(
      `/livechannel?channel=${encodeURIComponent(program.channelId)}`
    );
  };
  // 시청예약
  const handleReservation = program => {
    setReservationTarget(program);
  };
  const handleProgramClick = (program) => {
    const status = statusOf(program);
    if (status === 'past') handleReplay(program);
    else if (status === 'live') handleWatch(program);
    else handleReservation(program);
  };
  // 프로그램 상태별 버튼
  const programAction = (program, status) => {
    if (status === 'past') {
      return (
        <button
          type="button"
          className="schedule-action schedule-action--replay"
          onClick={e => {
            e.stopPropagation();
            handleReplay(program);
          }}
        >
          다시보기
        </button>
      );
    }
    if (status === 'live') {
      return (
        <button
          type="button"
          className="schedule-action schedule-action--watch"
          onClick={e => {
            e.stopPropagation();
            handleWatch(program);
          }}
        >
          시청하기
        </button>
      );
    }
    return (
      <button
        type="button"
        className={`schedule-action schedule-action--bell ${reservations.includes(program.id) ? 'is-reserved' : ''}`}
        aria-label={`${program.title} ${reservations.includes(program.id) ? '시청예약 취소' : '시청예약'}`}
        aria-pressed={reservations.includes(program.id)}
        onClick={e => {
          e.stopPropagation();
          handleReservation(program);
        }}
      >
        <span className="schedule-bell-icon" aria-hidden="true" />
      </button>
    );
  };
  return (
    <main className="schedule-page">
      {/* 페이지 상단 */}
      <div className="schedule-page__top">
        <div>
          <h1>
            {enteredAt.getMonth() + 1}월{' '}
            {enteredAt.getDate()}일{' '}
            {WEEKDAYS[enteredAt.getDay()]}요일
          </h1>
          <p>
            현재{' '}
            {pad(enteredAt.getHours())}:
            {pad(enteredAt.getMinutes())}
          </p>
        </div>
        <button
          type="button"
          className="schedule-page__refresh"
          onClick={() => window.location.reload()}
          aria-label="편성표 새로고침"
        >
          NOW
        </button>
      </div>
      {/* 날짜 선택 */}
      <div
        className="schedule-days"
        role="group"
        aria-label="날짜 선택"
      >
        {days.map(date => (
          <button
            key={localDateKey(date)}
            type="button"
            className={
              sameDay(date, selectedDate)
                ? 'is-active'
                : ''
            }
            onClick={() => {
              setSelectedDate(date);
                      }}
          >
            <span>
              {WEEKDAYS[date.getDay()]}
            </span>
            <strong>
              {date.getMonth() + 1}/{date.getDate()}
            </strong>
          </button>
        ))}
      </div>
      {/* 00~23시 시간 선택 */}
      <div
        className="schedule-hours"
        role="group"
        aria-label="시간 선택"
      >
        {Array.from({ length: 24 }, (_, hour) => (
          <button
            key={hour}
            type="button"
            className={
              visibleHours.includes(hour)
                ? 'is-active'
                : ''
            }
            aria-pressed={hour === selectedHour}
            onClick={() => handleSelectHour(hour)}
          >
            {pad(hour)}
          </button>
        ))}
      </div>
      {/* 편성표: 한 슬라이드가 3시간 범위의 전체 채널을 표시 */}
      <div className="schedule-guide">
        <div className="schedule-guide__fixed-column" aria-label="채널 목록">
          <div className="schedule-guide__fixed-heading" />
          {rows.map(channel => <div className="schedule-guide__fixed-channel" key={channel.id}>{channel.name}</div>)}
        </div>
        <div className="schedule-guide__content" data-native-scroll={isAppLayout ? "true" : undefined}
          onPointerDown={startTimelineDrag} onPointerMove={moveTimelineDrag}
          onPointerUp={endTimelineDrag} onPointerCancel={endTimelineDrag} onLostPointerCapture={endTimelineDrag}
          onClickCapture={(event) => {
            if (!timelineDraggedRef.current || event.detail === 0) return;
            event.preventDefault(); event.stopPropagation();
            timelineDraggedRef.current = false;
          }}>
        <Swiper
          onSwiper={swiper => {
            swiperRef.current = swiper;
            swiper.slideTo(selectedHour, 0);
          }}
          onSlideChange={swiper => {
            setSelectedHour(swiper.activeIndex);
          }}
          slidesPerView={1}
          slidesPerGroup={1}
          speed={500}
          grabCursor={!isAppLayout}
          simulateTouch={!isAppLayout}
          allowTouchMove={!isAppLayout}
          shortSwipes={true}
          longSwipesRatio={0.1}
          watchOverflow={true}
          nested={true}
          noSwipingSelector='[data-native-scroll="true"]' 
          className="schedule-guide__swiper"
        >
          {Array.from({ length: 24 }, (_, slideHour) => {
            const slideStart = getVisibleStart(slideHour);
            const slideStartMinute = slideStart * 60;
            const slideEndMinute = (slideStart + 3) * 60;
            const slideVisibleHours = [slideStart, slideStart + 1, slideStart + 2];
            return (
              <SwiperSlide key={slideHour}>
                <div className="schedule-guide__header">
                  <div className="schedule-guide__time-area">
                    <div className="schedule-guide__hours">
                      {slideVisibleHours.map(hour => (
                        <div key={hour} className="schedule-guide__hour-label">
                          {pad(hour)}:00
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
        {/* 채널별 편성표 */}
        {rows.map(channel => (
          <div
            className="schedule-guide__row"
            key={channel.id}
          >
            <div className="schedule-guide__timeline" aria-label={`${channel.name} 방송 목록`}>
              {channel.programs
                .filter(program =>
                  program.end > slideStartMinute &&
                  program.start < slideEndMinute
                )
                .map(program => {
                  const clippedStart = Math.max(
                    program.start,
                    slideStartMinute
                  );
                  const clippedEnd = Math.min(
                    program.end,
                    slideEndMinute
                  );
                  const left =
                    (clippedStart - slideStartMinute) /
                    180 * 100;
                  const width =
                    (clippedEnd - clippedStart) /
                    180 * 100;
                  const status = statusOf(program);
                  return (
                    <div
                      key={program.id}
                      className={`schedule-program schedule-program--${status}`}
                      style={{
                        left: `${left}%`,
                        width: `${width}%`
                      }}
                      onClick={() => handleProgramClick(program)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.target !== e.currentTarget) return;
                        if (
                          e.key === 'Enter' ||
                          e.key === ' '
                        ) {
                          e.preventDefault();
                          handleProgramClick(program);
                        }
                      }}
                    >
                      <div className="schedule-program__text">
                        <span title={program.title}>
                          {program.title}
                        </span>
                        <small>
                          {formatMinutes(program.start)}
                          {' ~ '}
                          {formatMinutes(program.end)}
                        </small>
                      </div>
                      <div className="schedule-program__action">
                        {programAction(program, status)}
                      </div>
                      {status === 'live' && (
                        <div
                          className="schedule-program__progress"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                (toMinutes(now) - program.start) /
                                (program.end - program.start) *
                                100
                              )
                            )
                              }%`
                          }}
                        />
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
              </SwiperSlide>
            );
          })}
        </Swiper>
        </div>
        <button
          type="button"
          className="schedule-guide__arrow schedule-guide__arrow--prev"
          onClick={handlePrevHour}
          disabled={selectedHour === 0}
          aria-label="1시간 이전"
        >‹</button>
        <button
          type="button"
          className="schedule-guide__arrow schedule-guide__arrow--next"
          onClick={handleNextHour}
          disabled={selectedHour === 23}
          aria-label="1시간 다음"
        >›</button>
      </div>
      {replayNoticeOpen && <ScheduleDialog onClose={() => setReplayNoticeOpen(false)} />}
      {/* 시청예약 팝업 */}
      {reservationTarget && <ScheduleDialog program={reservationTarget} reserved={reservations.includes(reservationTarget.id)} onClose={() => setReservationTarget(null)} onConfirm={() => {
        const id = reservationTarget.id;
        setReservations(previous => previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id]);
        setReservationTarget(null);
      }} />}
      {/* 하단 알림 */}
      {toast && (
        <div
          className="schedule-toast"
          role="status"
        >
          {toast}
        </div>
      )}
    </main>
  );
};
