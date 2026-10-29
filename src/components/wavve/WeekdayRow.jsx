import { useState } from 'react';
import { CategorySlider } from './CategorySlider';
import { weekdays } from '../../data/categoryData';

// 오늘 요일 (월요일 시작)
const getToday = () => weekdays[(new Date().getDay() + 6) % 7].id;

// 요일별 콘텐츠: 요일 버튼으로 방영 요일 필터
export const WeekdayRow = ({ title, items = [] }) => {
  const [activeDay, setActiveDay] = useState(getToday);
  const dayItems = items.filter((item) => item.days?.includes(activeDay));

  const dayButtons = (
    <div className="weekday-filter" role="tablist" aria-label="요일 선택">
      {weekdays.map((day) => (
        <button
          key={day.id}
          type="button"
          role="tab"
          className={`weekday-filter__button ${activeDay === day.id ? 'is-active' : ''}`}
          aria-selected={activeDay === day.id}
          onClick={() => setActiveDay(day.id)}
        >
          {day.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="weekday-row">
      <CategorySlider
        key={activeDay}
        title={title}
        items={dayItems}
        headerExtra={dayButtons}
      />
      {!dayItems.length && <p className="weekday-row__empty">이 요일에 방영하는 콘텐츠가 없습니다.</p>}
    </div>
  );
};
