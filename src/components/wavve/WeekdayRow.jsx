import { useState } from 'react';

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

  const recommendationCount =
    displayItems.length - uniqueDayItems.length;

  const activeDayLabel = weekdays.find(
    (day) => day.id === activeDay
  )?.label;

  const dayButtons = (
    <>
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

      {recommendationCount > 0 && (
        <p
          className="weekday-row__recommend-note"
          role="status"
        >
          {activeDayLabel}요일 방영 콘텐츠{' '}
          {uniqueDayItems.length}개와 함께 볼 추천 콘텐츠{' '}
          {recommendationCount}개
        </p>
      )}
    </>
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