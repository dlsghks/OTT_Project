import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LiveHero } from '../../components/live/LiveHero';
import { LiveSection } from '../../components/live/LiveSection';
import { livePrograms, liveCategories, liveBanner } from '../../data/liveData';
import '../../styles/pages/Live.scss';

export const Live = () => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(timer); }, []);
  const getProgress = program => {
    const start = new Date(program.start).getTime();
    const end = new Date(program.end).getTime();
    return end > start ? Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100)) : 0;
  };
  return (
    <main className="live-page">
      <div className="live-page__heading"><h1>라이브</h1><Link to="/schedule">편성표 보기 ›</Link></div>
      <LiveHero programs={livePrograms} getProgress={getProgress} />
      <Link to={liveBanner.link} className="live-banner" style={liveBanner.image ? { backgroundImage: `url("${liveBanner.image}")` } : undefined}>
        <strong>{liveBanner.title}</strong><span>{liveBanner.subtitle}</span>
      </Link>
      {liveCategories.map(category => (
        <LiveSection
          key={category}
          title={category}
          items={livePrograms.filter(
            (program) => program.category === category
          )}
          getProgress={getProgress}
        />
      ))}
    </main>
  );
};
