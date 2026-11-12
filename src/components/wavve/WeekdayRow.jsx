import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/components/wavve/WeekdayRow.scss';

import { CategorySlider } from './CategorySlider';
import { weekdays } from '../../data/categoryData';

import {
  fillSectionItems,
  MIN_SUB_SECTION_ITEMS,
} from '../../utils/sectionItems';

// 월요일부터 시작하는 요일 ID
const getToday = () =>
  weekdays[(new Date().getDay() + 6) % 7].id;

export const WeekdayRow = ({
  title,
  moreLink,
  items = [],
  fallbackItems = items,
  minimum = MIN_SUB_SECTION_ITEMS,
}) => {
  const [activeDay, setActiveDay] = useState(getToday);

  const dayItems = items.filter((item) =>
    item.days?.includes(activeDay)
  );

  const uniqueDayItems = fillSectionItems(
    dayItems,
    [],
    0
  );

  const displayItems = fillSectionItems(
    uniqueDayItems,
    fallbackItems,
    minimum
  );

  const dayButtons = (
    <div className="weekday-row__controls">
      <div
        className="weekday-filter"
        role="group"
        aria-label="방영 요일 선택"
      >
        {weekdays.map((day) => (
          <button
            key={day.id}
            type="button"
            className={`weekday-filter__button ${
              activeDay === day.id ? 'is-active' : ''
            }`}
            aria-pressed={activeDay === day.id}
            onClick={() => setActiveDay(day.id)}
          >
            {day.label}
          </button>
        ))}
      </div>
      {moreLink && <Link to={`${moreLink}?day=${activeDay}`}>더보기</Link>}
    </div>
  );

  return (
    <div className="weekday-row">
      <CategorySlider
        key={activeDay}
        title={title}
        items={displayItems}
        headerExtra={dayButtons}
      />

      {!displayItems.length && (
        <p className="weekday-row__empty">
          표시할 콘텐츠가 없습니다.
        </p>
      )}
    </div>
  );
};