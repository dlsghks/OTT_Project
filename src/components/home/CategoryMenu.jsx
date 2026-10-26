import { NavLink } from 'react-router-dom';
export const CategoryMenu = ({ items = [] }) => <nav className="home-categories" aria-label="콘텐츠 카테고리">
  {items.map(item => <NavLink key={item.path} to={item.path} end={item.path === '/'}>{item.label}</NavLink>)}
</nav>;
