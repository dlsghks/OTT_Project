import { Link } from 'react-router-dom';
export const EventBanner = ({ items = [] }) => <section className="home-events" aria-label="이벤트">
 {items.map((item,index) => <Link key={item.id} to={item.link} className={`home-events__banner home-events__banner--${index % 2}`}><strong>{item.title}</strong><span>{item.subtitle}</span></Link>)}
</section>;
