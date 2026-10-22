import React from 'react'
import { Link } from 'react-router-dom'

//메인메뉴
const mainMenu = [
  { id: 1, menu: "예능", path: "/entertainment" },
  { id: 2, menu: "드라마", path: "/drama" },
  { id: 3, menu: "영화", path: "/movie" },
  { id: 4, menu: "시사교양", path: "/currentaffairs" },
  { id: 5, menu: "애니", path: "/animation" },
  { id: 6, menu: "해외시리즈", path: "/global" },
  { id: 7, menu: "라이브", path: "/live" },
  { id: 8, menu: "쇼츠", path: "/shorts" },
  { id: 9, menu: "레트로브", path: "/retrov" }
]
export const Header = () => {
  return (
    <header>
      <div className="inner">
        <div className="header-left">
          <h1><Link to="/">wavve</Link></h1>
          <ul>
            {mainMenu.map((menu) => (
              <li key={menu.id}>
                <Link to={menu.path}>{menu.menu}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="header-right">
          <ul>
            <li>알림</li>
            <li><Link to='/search'>검색</Link></li>
            <li>프로필</li>
          </ul>
        </div>
      </div>
    </header>
  )
}
