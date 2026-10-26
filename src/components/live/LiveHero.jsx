import { Link } from 'react-router-dom';

export const LiveHero = ({ programs, getProgress }) => (
  <section className="live-hero" aria-label="인기 라이브 방송">
    {programs.slice(0,2).map(program => (
      <article className="live-hero__slide" key={program.id} style={program.image ? {backgroundImage:`url("${program.image}")`}:undefined}>
        <div className="live-hero__info">
          <span className="live-hero__badge">● 라이브</span>
          <strong className="live-hero__rank">{program.rank}</strong>
          <h2>{program.channel}</h2>
          <p>{program.title}</p>
          <small>시청률 {program.rating}</small>
          <div className="live-hero__progress"><span style={{width:`${getProgress(program)}%`}} /></div>
          <Link to={`/livechannel?channel=${encodeURIComponent(program.channelId)}`}>시청하기</Link>
        </div>
      </article>
    ))}
  </section>
);
