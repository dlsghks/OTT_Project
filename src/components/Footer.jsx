import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/wavve_logo_w.svg'
import '../styles/components/Footer.scss'

// 상단 공지사항 (이전/다음 버튼으로 넘김)
const notices = [
  { id: 1, title: "[안내] '듣폼' 스페셜관 오픈 및 오디오 모드 개편 안내" },
  { id: 2, title: '[안내] 서비스 이용약관 개정 안내' },
  { id: 3, title: '[점검] 시스템 정기 점검 안내' },
]

const links = [
  { label: '회사소개', href: 'https://www.wavve.com/customer/company' },
  { label: '서비스 소개', href: 'https://www.wavve.com/customer/service' },
  { label: '이용약관', href: 'https://www.wavve.com/customer/agreement' },
  { label: '개인정보 처리방침', href: 'https://www.wavve.com/customer/privacy', privacy: true },
  { label: '고객센터', href: 'https://www.wavve.com/customer' },
  { label: '이벤트', href: 'https://www.wavve.com/customer/event' },
]

// 사업자용 웨이브 가입 메뉴
const businessMenu = [
  { label: '웨이브 온 서비스 소개', href: 'https://www.wavve.com/customer/service' },
  { label: '사업자 가입 문의', href: 'https://www.wavve.com/customer' },
]

export const Footer = () => {
  const [noticeIndex, setNoticeIndex] = useState(0)
  const [isBusinessOpen, setIsBusinessOpen] = useState(false)
  const businessRef = useRef(null)

  const moveNotice = (step) => {
    setNoticeIndex((index) => (index + step + notices.length) % notices.length)
  }

  // 메뉴 밖을 누르거나 ESC 를 누르면 닫기
  useEffect(() => {
    if (!isBusinessOpen) return

    const handleClick = (e) => {
      if (!businessRef.current?.contains(e.target)) setIsBusinessOpen(false)
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') setIsBusinessOpen(false)
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [isBusinessOpen])

  const notice = notices[noticeIndex]

  return (
    <footer className="footer">
      {/* 공지사항 */}
      <div className="footer__notice">
        <div className="footer__notice-inner">
          <Link to="/notice" className="footer__notice-label">공지사항</Link>
          <Link to="/noticeview" state={{ id: notice.id }} className="footer__notice-title">
            {notice.title}
          </Link>

          <div className="footer__notice-controls">
            <button type="button" aria-label="이전 공지" onClick={() => moveNotice(-1)}>
              <svg width="20" height="34" viewBox="0 0 20 34" aria-hidden="true">
                <path d="M17 2 3 17l14 15" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            <button type="button" aria-label="다음 공지" onClick={() => moveNotice(1)}>
              <svg width="20" height="34" viewBox="0 0 20 34" aria-hidden="true">
                <path d="m3 2 14 15L3 32" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="footer__inner">
        <div className="footer__left">
          <nav aria-label="하단 메뉴" className="footer__nav">
            <ul>
              {links.map(({ label, href, privacy }) => (
                <li key={label}>
                  <a href={href} className={privacy ? 'footer__privacy' : undefined}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <address className="footer__info">
            <p>
              <span>콘텐츠웨이브 주식회사</span>
              <span>대표이사 이양기</span>
              <span>
                고객센터 <a href="tel:15993709">1599-3709</a> (평일 09:00~17:00 / 점심시간 12:00~13:00 / 주말 및 공휴일 휴무)
                <span className="footer__slash">/</span>
                <a href="https://www.wavve.com/customer/inquiry" className="footer__inquiry">1:1 문의</a>
              </span>
            </p>
            <p>
              <span>사업자등록번호 220-88-38020</span>
              <span>호스팅서비스제공자 : 마이크로소프트 유한회사, 구글클라우드코리아 유한회사, 아마존웹서비스코리아 유한회사</span>
            </p>
            <p>
              <span>통신판매업 신고번호 : 제 2021-서울영등포-0585호</span>
              <span>
                통신판매업 정보 공개 : <a href="https://www.ftc.go.kr/bizCommPop.do?wrkr_no=2208838020" target="_blank" rel="noopener noreferrer">https://www.ftc.go.kr/bizCommPop.do?wrkr_no=2208838020</a>
              </span>
            </p>
            <p>
              <span>서울특별시 영등포구 여의나루로 60 포스트타워 15층</span>
              <span>전자우편주소 : <a href="mailto:helpdesk@wavve.com">helpdesk@wavve.com</a></span>
            </p>
          </address>

          <p className="footer__copyright">Copyright© 콘텐츠웨이브(주) All rights reserved.</p>
        </div>

        <div className="footer__right">
          {/* 사업자용 웨이브 가입 */}
          <div className={`footer__business ${isBusinessOpen ? 'is-open' : ''}`} ref={businessRef}>
            <span className="footer__business-logo">
              <img src={logo} alt="wavve" width="58" height="16" />
              <span>on</span>
            </span>
            <button
              type="button"
              className="footer__business-toggle"
              aria-haspopup="true"
              aria-expanded={isBusinessOpen}
              onClick={() => setIsBusinessOpen((open) => !open)}
            >
              사업자용 웨이브 가입
              <svg width="16" height="9" viewBox="0 0 16 9" aria-hidden="true">
                <path d="m1 1 7 7 7-7" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>

            {isBusinessOpen && (
              <ul className="footer__business-menu">
                {businessMenu.map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noopener noreferrer">{label}</a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="footer__social">
            <a href="https://www.youtube.com/@wavve" aria-label="웨이브 유튜브 (새 탭)" target="_blank" rel="noopener noreferrer">
              <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden="true">
                <rect width="22" height="16" rx="4.5" fill="currentColor" />
                <path d="m9 4.5 5.5 3.5L9 11.5Z" fill="#252525" />
              </svg>
            </a>
            <a href="https://www.instagram.com/wavve.official/" aria-label="웨이브 인스타그램 (새 탭)" target="_blank" rel="noopener noreferrer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
