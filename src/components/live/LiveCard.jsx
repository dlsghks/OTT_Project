import { Link } from 'react-router-dom';

export const LiveCard = ({ program, progress }) => (
  <Link className="live-card" to={`/livechannel?channel=${encodeURIComponent(program.channelId)}`}>
    <div className="live-card__thumb">
      {program.image ? <img src={program.image} alt="" draggable="false" /> : <span className="live-card__placeholder">{program.channel}</span>}
      <span className="live-card__badge">무료</span>
      <div className="live-card__progress"><span style={{width:`${progress}%`}} /></div>
    </div>
    <strong className="live-card__channel">{program.channel}</strong>
    <span className="live-card__title">{program.title}</span>
  </Link>
);
