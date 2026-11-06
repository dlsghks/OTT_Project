import { useState } from 'react';
import { Link } from 'react-router-dom';

// MMA2026 티켓 응모 이벤트 (/event/ticket)
// 이벤트 안내 → 참여 방법 → 아티스트 라인업 → 이벤트 1~4 → 시청 혜택 → FAQ → 유의사항
export const MmaEvent = ({
  title,
  subtitle,
  period,
  winners = [],
  steps = [],
  lineup = [],
  missions = [],
  benefits = [],
  faq = [],
  notices = [],
}) => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="event-page mma-event">
      <header className="event-page__header">
        <span className="event-page__label">EVENT</span>
        <h1>{title}</h1>
        {subtitle && <p className="event-page__subtitle">{subtitle}</p>}
        {period && <p className="event-page__period">{period}</p>}
      </header>

      <ul className="mma-event__winners">
        {winners.map((winner) => (
          <li key={winner.label}>
            <span>{winner.label}</span>
            <strong>{winner.count}</strong>
          </li>
        ))}
      </ul>

      <section className="mma-event__section">
        <h2>참여 방법</h2>
        <ol className="mma-event__steps">
          {steps.map((step, index) => (
            <li key={step.title}>
              <em>STEP {index + 1}</em>
              <strong>{step.title}</strong>
              {step.note && <span>{step.note}</span>}
            </li>
          ))}
        </ol>
      </section>

      <section className="mma-event__section">
        <h2>아티스트 라인업</h2>
        <div className="mma-event__lineup">
          {lineup.map((day) => (
            <div key={day.date} className="mma-event__day">
              <h3>
                {day.date} <span>{day.time}</span>
              </h3>
              <ul>
                {day.artists.map((artist) => (
                  <li key={artist}>{artist}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mma-event__section">
        <ul className="mma-event__missions">
          {missions.map((mission) => (
            <li key={mission.label}>
              <em>{mission.label}</em>
              <strong>{mission.title}</strong>
              <p>{mission.description}</p>
              {mission.link && (
                <Link to={mission.link} className="mma-event__button">{mission.button}</Link>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="mma-event__section">
        <h2>MMA, 웨이브에서 보면 더 특별해지는 이유!</h2>
        <ul className="mma-event__benefits">
          {benefits.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
      </section>

      <section className="mma-event__section">
        <h2>FAQ</h2>
        <ul className="mma-event__faq">
          {faq.map((item, index) => (
            <li key={item.question}>
              <button
                type="button"
                aria-expanded={openFaq === index}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                {item.question}
              </button>
              {openFaq === index && <p>{item.answer}</p>}
            </li>
          ))}
        </ul>
      </section>

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
