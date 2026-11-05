import { Link } from 'react-router-dom';
import backIcon from '../../assets/responsive/back.svg';
import '../../styles/responsive/BrowsePageHeader.scss';

export const BrowsePageHeader = ({ title, retro = false }) => (
  <header className={`browse-page-header${retro ? ' browse-page-header--retro' : ''}`}>
    <Link to="/" aria-label="홈으로 돌아가기"><img src={backIcon} alt="" /></Link>
    <h1>{title}</h1>
  </header>
);
