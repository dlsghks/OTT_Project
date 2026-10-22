import { Link } from 'react-router-dom';
export const ContentCard = ({ item, rank }) => <Link to={item.link || (item.kind === 'movie' ? '/movie' : '/drama')} className="home-card">
  <div className="home-card__poster">
    {item.image ? <img src={item.image} alt={item.title} loading="lazy" /> : <span className="home-card__placeholder">{item.title}</span>}
    {rank && <strong className="home-card__rank">{rank}</strong>}
  </div>
  <span className="home-card__title">{item.title}</span>
</Link>;
