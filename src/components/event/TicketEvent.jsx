import { Link } from 'react-router-dom';

// 티켓 프로모션 이벤트 (/event/ticket)
export const TicketEvent = ({ title, subtitle, period, tickets = [], notices = [] }) => {
  return (
    <div className="event-page ticket-event">
      <header className="event-page__header">
        <span className="event-page__label">EVENT</span>
        <h1>{title}</h1>
        {subtitle && <p className="event-page__subtitle">{subtitle}</p>}
        {period && <p className="event-page__period">{period}</p>}
      </header>

      <ul className="ticket-event__list">
        {tickets.map((ticket) => (
          <li key={ticket.id} className="ticket-event__card">
            <span className="ticket-event__name">{ticket.name}</span>
            <strong className="ticket-event__price">{ticket.price}</strong>
            <p>{ticket.description}</p>
            <Link to={ticket.link ?? '/live'} className="ticket-event__button">자세히 보기</Link>
          </li>
        ))}
      </ul>

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
