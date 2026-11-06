import { useState } from 'react';
import { PosterRow } from '../wavve/PosterRow';

const WEEK_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const pad = (value) => String(value).padStart(2, '0');
const toKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// 출석 기록은 브라우저(localStorage)에 월 단위로 저장
const storageKey = (year, month) => `wavve-attendance-${year}-${pad(month + 1)}`;

const readChecked = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

const writeChecked = (key, list) => {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // 저장소를 사용할 수 없는 환경에서는 화면 상태만 유지
  }
};

// 출석체크 이벤트 (/eventdetail/attendance)
// 혜택 안내 → 달력(x2 날짜) → 출석 버튼 → 공유 → HOT 콘텐츠 → 유의사항
export const AttendanceEvent = ({ title, image, benefits = [], doubleDays = [], hotItems = [], notices = [] }) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const key = storageKey(year, month);
  const todayKey = toKey(today);

  const [checked, setChecked] = useState(() => readChecked(key));
  const [shareMessage, setShareMessage] = useState('');
  const isCheckedToday = checked.includes(todayKey);
  // x2 날짜는 2일로 계산
  const attendanceCount = checked.reduce(
    (count, dayKey) => count + (doubleDays.includes(Number(dayKey.slice(-2))) ? 2 : 1),
    0
  );

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: lastDate }, (_, index) => index + 1),
  ];

  const handleCheck = () => {
    if (isCheckedToday) return;
    const next = [...checked, todayKey];
    setChecked(next);
    writeChecked(key, next);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareMessage('이벤트 링크가 복사되었습니다.');
    } catch {
      setShareMessage('링크 복사에 실패했습니다.');
    }
  };

  return (
    <div className="event-page attendance-event">
      <header className="event-page__header">
        <span className="event-page__label">EVENT</span>
        <h1>{`${month + 1}월 ${title}`}</h1>
        <p className="event-page__period">
          {`${year}.${pad(month + 1)}.01 ~ ${year}.${pad(month + 1)}.${pad(lastDate)}`}
        </p>
      </header>

      {/* 이벤트 안내 이미지 */}
      {image && <img className="attendance-event__image" src={image} alt={`${month + 1}월 ${title} 안내`} />}

      {benefits.length > 0 && (
        <ul className="attendance-event__benefits">
          {benefits.map((benefit) => (
            <li key={benefit.days}>
              <strong>{benefit.days}일 출석</strong>
              <span>{benefit.reward}</span>
            </li>
          ))}
        </ul>
      )}

      <section className="attendance-event__calendar" aria-label={`${month + 1}월 출석 달력`}>
        <div className="attendance-event__summary">
          이번 달 <strong>{attendanceCount}</strong>일 출석
        </div>

        <div className="attendance-event__grid">
          {WEEK_LABELS.map((label) => (
            <span key={label} className="attendance-event__week">{label}</span>
          ))}

          {cells.map((day, index) => {
            if (!day) return <span key={`empty-${index}`} className="attendance-event__day is-empty" />;

            const dayKey = `${year}-${pad(month + 1)}-${pad(day)}`;
            const classNames = [
              'attendance-event__day',
              checked.includes(dayKey) ? 'is-checked' : '',
              dayKey === todayKey ? 'is-today' : '',
            ].join(' ');

            return (
              <span key={dayKey} className={classNames}>
                {day}
                {doubleDays.includes(day) && <em>x2</em>}
              </span>
            );
          })}
        </div>

        <button
          type="button"
          className="attendance-event__button"
          onClick={handleCheck}
          disabled={isCheckedToday}
        >
          {isCheckedToday ? '오늘 출석 완료' : '오늘 출석하기'}
        </button>
      </section>

      <section className="event-page__share">
        <p>친구에게 이벤트를 알려주세요</p>
        <button type="button" onClick={handleShare}>링크 공유하기</button>
        {shareMessage && <span role="status">{shareMessage}</span>}
      </section>

      <div className="event-page__content">
        <PosterRow title={`${month + 1}월 HOT 콘텐츠`} items={hotItems} />
      </div>

      <section className="event-page__notice">
        <h2>유의사항</h2>
        <ul>
          {notices.map((notice) => (
            <li key={notice}>{notice}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};
