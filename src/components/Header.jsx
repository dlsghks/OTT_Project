import { Link } from 'react-router-dom'
import logo from '../assets/wavve_logo_w.svg'
import bellIcon from '../assets/icons/lyra-icon-bell-02.svg'
import searchIcon from '../assets/icons/lyra-icon-search.svg'
import userIcon from '../assets/icons/lyra-icon-User06.svg'
import '../styles/components/Header.scss'

// 메인 메뉴
const mainMenu = [
  { id: 1, menu: '예능', path: '/entertainment' },
  { id: 2, menu: '드라마', path: '/drama' },
  { id: 3, menu: '영화', path: '/movie' },
  { id: 4, menu: '시사교양', path: '/currentaffairs' },
  { id: 5, menu: '애니', path: '/animation' },
  { id: 6, menu: '해외시리즈', path: '/global' },
  { id: 7, menu: '라이브', path: '/live' },
  { id: 8, menu: '쇼츠', path: '/shorts' },
  { id: 9, menu: '레트로브', path: '/retrov' },
]

export const Header = ({
  onNotificationClick,
  onSearchClick,
  onProfileClick,
}) => {
  return (
    <header>
      <div className="inner">
        <div className="header-left">
          <h1>
            <Link to="/" aria-label="웨이브 홈">
              <img
                src={logo}
                alt="wavve"
                width="144"
                height="40"
              />
            </Link>
          </h1>

          <ul aria-label="메인 메뉴">
            {mainMenu.map((menu) => (
              <li key={menu.id}>
                <Link to={menu.path}>{menu.menu}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="header-right">
          <ul>
            <li>
              <button
                type="button"
                aria-label="알림"
                onClick={onNotificationClick}
              >
                <img src={bellIcon} alt="" width="28" height="28" />
              </button>
            </li>
            <li>
              <Link to='/search'>
                <button
                  type="button"
                  aria-label="검색"
                  onClick={onSearchClick}
                >
                  <img src={searchIcon} alt="" width="28" height="28" />
                </button>
              </Link>
            </li>
            <li>
              <button
                type="button"
                aria-label="프로필"
                onClick={onProfileClick}
              >
                <img src={userIcon} alt="" width="28" height="28" />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  )
}