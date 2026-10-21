import './footer.scss'

const links = [
  { label: '회사소개', href: 'https://www.wavve.com/customer/company' },
  { label: '서비스소개', href: 'https://www.wavve.com/customer/service' },
  { label: '이용약관', href: 'https://www.wavve.com/customer/agreement' },
  { label: '개인정보 처리방침', href: 'https://www.wavve.com/customer/privacy', privacy: true },
  { label: '고객센터', href: 'https://www.wavve.com/customer' },
  { label: '이벤트', href: 'https://www.wavve.com/customer/event' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <nav aria-label="하단 메뉴" className="footer__nav">
          <ul>
            {links.map(({ label, href, privacy }) => (
              <li key={label}>
                <a href={href} className={privacy ? 'footer__privacy' : undefined}>{label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__info">
          <p>
            <span>콘텐츠웨이브 주식회사</span>{' '}
            <span>대표이사 이양기</span>{' '}
            <span>고객센터 <a href="tel:15993709">1599-3709</a></span>{' '}
            <span>(평일 09:00~17:00 / 점심시간 12:00~13:00 / 주말 및 공휴일 휴무)</span>{' '}
            <span>/ <a href="https://www.wavve.com/customer/inquiry">1:1 문의</a></span>
          </p>
          <p>
            <span>사업자등록번호 220-88-38020</span>{' '}
            <span>호스팅서비스제공자 : 마이크로소프트 유한회사, 구글클라우드코리아 유한회사, 아마존웹서비스코리아 유한회사</span>
          </p>
          <p>
            <span>통신판매업 신고번호 : 제 2021-서울영등포-0585호</span>{' '}
            <span>통신판매업 정보 공개 : <a href="https://www.ftc.go.kr/bizCommPop.do?wrkr_no=2208838020" target="_blank" rel="noopener noreferrer">https://www.ftc.go.kr/bizCommPop.do?wrkr_no=2208838020</a></span>
          </p>
          <p>
            <span>서울특별시 영등포구 여의나루로 60 포스트타워 15층</span>{' '}
            <span>전자우편주소 : <a href="mailto:helpdesk@wavve.com">helpdesk@wavve.com</a></span>
          </p>
        </div>

        <p className="footer__copyright">Copyright© 콘텐츠웨이브(주) All rights reserved.</p>

        <div className="footer__social">
          <a href="https://www.youtube.com/@wavve" aria-label="웨이브 유튜브 (새 탭)" target="_blank" rel="noopener noreferrer">
            <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
              <rect x="1" y="5" width="26" height="18" rx="5" fill="currentColor" />
              <path d="m11 9 8 5-8 5Z" fill="#252525" />
            </svg>
          </a>
          <a href="https://www.instagram.com/wavve.official/" aria-label="웨이브 인스타그램 (새 탭)" target="_blank" rel="noopener noreferrer">
            <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  )
}
