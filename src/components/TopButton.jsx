import { useEffect, useState } from 'react'
import '../styles/components/TopButton.scss'

// 이 높이 이상 내려가면 버튼 표시
const SHOW_OFFSET = 300

// 화면 오른쪽 아래 상단 이동 버튼
export const TopButton = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > SHOW_OFFSET)

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    // 동작 줄이기 설정이면 바로 이동
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  return (
    <button
      type="button"
      className={`top-button ${isVisible ? 'is-visible' : ''}`}
      aria-label="맨 위로 이동"
      tabIndex={isVisible ? 0 : -1}
      onClick={scrollToTop}
    >
      <svg viewBox="0 0 20 14" aria-hidden="true">
        <path d="M10 1.5c.5 0 .9.2 1.2.6l7.2 9c.6.8.1 1.9-.9 1.9H2.5c-1 0-1.5-1.1-.9-1.9l7.2-9c.3-.4.7-.6 1.2-.6Z" fill="currentColor" />
      </svg>
    </button>
  )
}
