import { useState } from 'react';
import { ContentSection } from './ContentSection';
import { weekdays, weeklyContentByDay } from '../../data/weeklyContentData';
import '../../styles/components/WeeklyContentSection.scss';

export const WeeklyContentSection = ({ itemsByDay = weeklyContentByDay }) => {
  const [selectedDay, setSelectedDay] = useState(
    () => weekdays[(new Date().getDay() + 6) % 7].id
  );
  const items = itemsByDay[selectedDay] || [];

  return (
    <section className="weekly-content" aria-labelledby="weekly-content-title">
      <div className="content-section__header">
        <div className="content-section__title">
          <h2 id="weekly-content-title">요일별 콘텐츠</h2>
        </div>
      </div>
      <div className="weekly-content__days" role="group" aria-label="콘텐츠 업데이트 요일">
        {weekdays.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className="weekly-content__day"
            aria-label={`${label}요일`}
            aria-pressed={selectedDay === id}
            aria-controls="weekly-content-list"
            onClick={() => setSelectedDay(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div id="weekly-content-list" className="weekly-content__list">
        {items.length ? (
          // 요일별로 다시 마운트해 카드 위치와 화살표 상태를 함께 초기화한다.
          <ContentSection key={selectedDay} items={items} cardType="default" showHeader={false} />
        ) : (
          <p className="weekly-content__empty" role="status">등록된 콘텐츠가 없습니다.</p>
        )}
      </div>
    </section>
  );
};
