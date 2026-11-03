
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'

import logo from '../assets/wavve_logo_w.svg'
import '../styles/components/Footer.scss'

// 상단 공지사항
const notices = [
  {
    id: 5,
    title: '[작업공지] 11/5 KT 휴대폰 본인확인 서비스 작업 안내',
  },
  {
    id: 6,
    title: 'Wavve 개인정보 처리방침 개정안 공지 (2026년 10월 28일 시행)',
  },
  {
    id: 2,
    title: "[안내] '멀티뷰', '채팅', <웨이브 필드캠> 오픈 안내",
  },
]

// 하단 메뉴
const links = [
  { label: '회사소개', to: '/company' },
  { label: '서비스 소개', to: '/service' },
  { label: '이용약관', to: '/terms' },
  {
    label: '개인정보 처리방침',
    to: '/privacy',
    privacy: true,
  },
  { label: '고객센터', to: '/support' },
  { label: '이벤트', to: '/event' },
]

// 사업자용 웨이브 가입 메뉴
const businessMenu = [
  {
    label: '웨이브 온 서비스 소개',
    href: 'https://www.wavve.com/customer/service',
  },
  {
    label: '사업자 가입 문의',
    href: 'https://www.wavve.com/customer',
  },
]

export const Footer = () => {
  // 공지사항 Swiper 참조
  // React Hook은 반드시 컴포넌트 내부에서 선언
  const noticeSwiperRef = useRef(null)

  // 사업자 메뉴
  const [isBusinessOpen, setIsBusinessOpen] = useState(false)
  const businessRef = useRef(null)

  // 사업자 메뉴 바깥 클릭 또는 ESC 입력 시 닫기
  useEffect(() => {
    if (!isBusinessOpen) return

    const handleClick = (e) => {
      if (!businessRef.current?.contains(e.target)) {
        setIsBusinessOpen(false)
      }
    }

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setIsBusinessOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)

    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [isBusinessOpen])

  // 이전 공지
  const handlePrevNotice = () => {
    noticeSwiperRef.current?.slidePrev()
  }

  // 다음 공지
  const handleNextNotice = () => {
    noticeSwiperRef.current?.slideNext()
  }

  return (
    <footer className="footer">
      {/* =========================
          공지사항
      ========================= */}
      <div className="footer__notice">
        <div className="footer__notice-inner">
          <Link
            to="/notice"
            className="footer__notice-label"
          >
            공지사항
          </Link>

          {/* 공지 제목 세로 슬라이드 */}

          <div className="footer__notice-slider">
            <Swiper
              direction="vertical"
              slidesPerView={1}
              slidesPerGroup={1}
              loop={true}
              speed={500}
              height={50}
              allowTouchMove={true}
              observer={true}
              observeParents={true}
              onSwiper={(swiper) => {
                noticeSwiperRef.current = swiper;
              }}
              className="footer__notice-swiper"
            >
              {notices.map((notice) => (
                <SwiperSlide key={notice.id}>
                  <Link
                    to={`/notice/${notice.id}`}
                    className="footer__notice-title"
                  >
                    {notice.title}
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>


          {/* 좌우 버튼 배치 유지 / 실제 이동은 세로 */}
          <div className="footer__notice-controls">
            <button
              type="button"
              aria-label="이전 공지"
              onClick={handlePrevNotice}
            >
              <svg
                width="20"
                height="34"
                viewBox="0 0 20 34"
                aria-hidden="true"
              >
                <path
                  d="M17 2 3 17l14 15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </button>

            <button
              type="button"
              aria-label="다음 공지"
              onClick={handleNextNotice}
            >
              <svg
                width="20"
                height="34"
                viewBox="0 0 20 34"
                aria-hidden="true"
              >
                <path
                  d="m3 2 14 15L3 32"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* =========================
          하단 정보
      ========================= */}
      <div className="footer__inner">
        <div className="footer__left">
          {/* 하단 메뉴 */}
          <nav
            aria-label="하단 메뉴"
            className="footer__nav"
          >
            <ul>
              {links.map(({ label, to, privacy }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className={
                      privacy ? 'footer__privacy' : undefined
                    }
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 회사 정보 */}
          <address className="footer__info">
            <p>
              <span>콘텐츠웨이브 주식회사</span>
              <span>대표이사 이양기</span>
              <span>
                고객센터{' '}
                <a href="tel:15993709">
                  1599-3709
                </a>{' '}
                (평일 09:00~17:00 / 점심시간 12:00~13:00 / 주말 및 공휴일 휴무)
                <span className="footer__slash">/</span>
                <Link
                  to="/inquiry"
                  className="footer__inquiry"
                >
                  1:1 문의
                </Link>
              </span>
            </p>

            <p>
              <span>사업자등록번호 220-88-38020</span>
              <span>
                호스팅서비스제공자 : 마이크로소프트 유한회사,
                구글클라우드코리아 유한회사,
                아마존웹서비스코리아 유한회사
              </span>
            </p>

            <p>
              <span>
                통신판매업 신고번호 : 제 2021-서울영등포-0585호
              </span>
              <span>
                통신판매업 정보 공개 :{' '}
                <a
                  href="https://www.ftc.go.kr/bizCommPop.do?wrkr_no=2208838020"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://www.ftc.go.kr/bizCommPop.do?wrkr_no=2208838020
                </a>
              </span>
            </p>

            <p>
              <span>
                서울특별시 영등포구 여의나루로 60 포스트타워 15층
              </span>
              <span>
                전자우편주소 :{' '}
                <a href="mailto:helpdesk@wavve.com">
                  helpdesk@wavve.com
                </a>
              </span>
            </p>
          </address>

          <p className="footer__copyright">
            Copyright© 콘텐츠웨이브(주) All rights reserved.
          </p>
        </div>

        {/* =========================
            사업자용 웨이브 가입 + SNS
        ========================= */}
        <div className="footer__right">
          {/* 사업자용 웨이브 가입 */}
          <div
            className={`footer__business ${isBusinessOpen ? 'is-open' : ''
              }`}
            ref={businessRef}
          >
            <span className="footer__business-logo">
              <img
                src={logo}
                alt="wavve"
                width="58"
                height="16"
              />
              <span>on</span>
            </span>

            <button
              type="button"
              className="footer__business-toggle"
              aria-haspopup="true"
              aria-expanded={isBusinessOpen}
              onClick={() => {
                setIsBusinessOpen((open) => !open)
              }}
            >
              사업자용 웨이브 가입
              <svg
                width="16"
                height="9"
                viewBox="0 0 16 9"
                aria-hidden="true"
              >
                <path
                  d="m1 1 7 7 7-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </button>

            {isBusinessOpen && (
              <ul className="footer__business-menu">
                {businessMenu.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* SNS */}
          <div className="footer__social">
            <a
              href="https://www.youtube.com/@wavve"
              aria-label="웨이브 유튜브 (새 탭)"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                width="22"
                height="16"
                viewBox="0 0 22 16"
                aria-hidden="true"
              >
                <rect
                  width="22"
                  height="16"
                  rx="4.5"
                  fill="currentColor"
                />
                <path
                  d="m9 4.5 5.5 3.5L9 11.5Z"
                  fill="#252525"
                />
              </svg>
            </a>

            <a
              href="https://www.instagram.com/wavve.official/"
              aria-label="웨이브 인스타그램 (새 탭)"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="5"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="4"
                />
                <circle
                  cx="17.5"
                  cy="6.5"
                  r="1.2"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
