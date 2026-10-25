
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getScheduleForDate, localDateKey } from '../../data/scheduleData';
import '../../styles/pages/Schedule.scss';

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

export const Schedule = () => {
  const navigate = useNavigate();

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
  const [selectedProgram, setSelectedProgram] = useState(null);
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
    setSelectedProgram(null);
  };

  // 1시간 이전
  const handlePrevHour = () => {
    setSelectedHour(prev => Math.max(0, prev - 1));
    setSelectedProgram(null);
  };

  // 1시간 다음
  const handleNextHour = () => {
    setSelectedHour(prev => Math.min(23, prev + 1));
    setSelectedProgram(null);
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
    if (!program.replayAvailable) {
      showToast('다시보기가 불가한 방송이에요');
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
    setSelectedProgram(null);
    setReservationTarget(program);
  };

  // 프로그램 상태별 버튼
  const programAction = (program, status, inPopover = false) => {
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
        className={`schedule-action ${inPopover
          ? 'schedule-action--reserve'
          : 'schedule-action--bell'
          }`}
        aria-label={`${program.title} 시청예약`}
        onClick={e => {
          e.stopPropagation();
          handleReservation(program);
        }}
      >
        {inPopover ? '시청예약' : '🔔'}
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
              setSelectedProgram(null);
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

      {/* 편성표 */}
      <div className="schedule-guide">

        {/* 편성표 시간 헤더 */}
        <div className="schedule-guide__header">

          {/* 채널 영역 */}
          <div className="schedule-guide__channel-label">

          </div>

          {/* 시간 영역 */}
          <div className="schedule-guide__time-area">

            {/* 이전 시간 버튼 */}
            <button
              type="button"
              className="schedule-guide__arrow schedule-guide__arrow--prev"
              onClick={handlePrevHour}
              disabled={selectedHour === 0}
              aria-label="1시간 이전"
            >
              ‹
            </button>

            {/* 선택한 시간 기준 3시간 */}
            <div className="schedule-guide__hours">
              {visibleHours.map(hour => (
                <div
                  key={hour}
                  className="schedule-guide__hour-label"
                >
                  {pad(hour)}:00
                </div>
              ))}
            </div>

            {/* 다음 시간 버튼 */}
            <button
              type="button"
              className="schedule-guide__arrow schedule-guide__arrow--next"
              onClick={handleNextHour}
              disabled={selectedHour === 23}
              aria-label="1시간 다음"
            >
              ›
            </button>

          </div>
        </div>


        {/* 채널별 편성표 */}
        {rows.map(channel => (
          <div
            className="schedule-guide__row"
            key={channel.id}
          >
            <div className="schedule-guide__channel">
              {channel.name}
            </div>

            <div className="schedule-guide__timeline">
              {channel.programs
                .filter(program =>
                  program.end > visibleStartMinute &&
                  program.start < visibleEndMinute
                )
                .map(program => {
                  const clippedStart = Math.max(
                    program.start,
                    visibleStartMinute
                  );

                  const clippedEnd = Math.min(
                    program.end,
                    visibleEndMinute
                  );

                  const left =
                    (clippedStart - visibleStartMinute) /
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
                      onClick={() =>
                        setSelectedProgram(program)
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => {
                        if (
                          e.key === 'Enter' ||
                          e.key === ' '
                        ) {
                          e.preventDefault();
                          setSelectedProgram(program);
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
      </div>

      {/* 프로그램 상세 팝업 */}
      {selectedProgram && (
        <div
          className="schedule-popover-backdrop"
          onClick={() => setSelectedProgram(null)}
        >
          <div
            className="schedule-popover"
            role="dialog"
            aria-modal="true"
            aria-label="프로그램 정보"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              className="schedule-popover__close"
              onClick={() => setSelectedProgram(null)}
              aria-label="닫기"
            >
              ×
            </button>

            <strong>
              {selectedProgram.channelName}
            </strong>

            <h2>
              {selectedProgram.title}
            </h2>

            <p>
              {formatMinutes(selectedProgram.start)}
              {' ~ '}
              {formatMinutes(selectedProgram.end)}
            </p>

            {programAction(
              selectedProgram,
              statusOf(selectedProgram),
              true
            )}
          </div>
        </div>
      )}

      {/* 시청예약 팝업 */}
      {reservationTarget && (
        <div
          className="schedule-modal-backdrop"
          onClick={() => setReservationTarget(null)}
        >
          <div
            className="schedule-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="schedule-modal-title"
            onClick={e => e.stopPropagation()}
          >
            <h2 id="schedule-modal-title">
              시청 예약
            </h2>

            <p>
              <strong>
                〈{reservationTarget.title}〉
              </strong>
              <br />
              시청 예약을 설정할까요?
              예약한 콘텐츠가 시작되면 알림을 받을 수 있도록
              추후 알림 기능과 연동할 수 있어요.
            </p>

            <div className="schedule-modal__actions">
              <button
                type="button"
                onClick={() => setReservationTarget(null)}
              >
                취소
              </button>

              <button
                type="button"
                onClick={() => {
                  setReservations(prev => [
                    ...prev,
                    reservationTarget.id
                  ]);

                  setReservationTarget(null);

                  showToast(
                    '시청예약을 임시로 등록했어요. 실제 푸시 알림은 연결되지 않았어요.'
                  );
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

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
