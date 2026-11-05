import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import youtubeIcon from "../../assets/mobile/d8a7e.png";
import instagramIcon from "../../assets/mobile/454a8.png";
import divider from "../../assets/mobile/f73c7.svg";
import noticeIcon from "../../assets/mobile/86f00.svg";
import "../../styles/components/MobileFooter.scss";

const DEFAULT_NOTICES = [
  { id: 5, title: "[작업공지] 11/5 KT 휴대폰 본인확인 서비스 작업 안내" },
  { id: 6, title: "Wavve 개인정보 처리방침 개정안 공지 (2026년 10월 28일 시행)" },
  { id: 2, title: "[안내] '멀티뷰', '채팅', <웨이브 필드캠> 오픈 안내" },
];

const Divider = () => (
  <span className="wavve-mobile-footer__divider" aria-hidden="true"><img src={divider} alt="" width="13" height="0.7" /></span>
);

export const MobileFooter = ({
  notices = DEFAULT_NOTICES,
  noticeInterval = 3500,
  noticeText,
  noticeTo = "/notice",
  termsTo = "/terms",
  privacyTo = "/terms?type=privacy",
  supportTo = "/support",
  inquiryTo = "/inquiry",
  youtubeUrl = "https://www.youtube.com/c/wavve",
  instagramUrl = "https://www.instagram.com/wavve.official/",
} = {}) => {
  const [noticeIndex, setNoticeIndex] = useState(0);
  const [pointerInside, setPointerInside] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const noticeItems = noticeText
    ? [{ title: noticeText, to: noticeTo }]
    : Array.isArray(notices)
      ? notices.filter((notice) => typeof notice?.title === "string" && notice.title.trim())
      : [];
  const currentNotice = noticeItems.length
    ? noticeItems[noticeIndex % noticeItems.length]
    : undefined;
  const paused = pointerInside || focusInside || manuallyPaused;

  useEffect(() => {
    if (noticeItems.length < 2 || paused) return;

    const mobile = window.matchMedia("(max-width: 768px)");
    const delay = Number.isFinite(noticeInterval) ? Math.max(1000, noticeInterval) : 3500;
    let timer;

    const updateTimer = () => {
      window.clearInterval(timer);
      if (!mobile.matches || document.visibilityState !== "visible") return;
      timer = window.setInterval(() => {
        setNoticeIndex((index) => (index + 1) % noticeItems.length);
      }, delay);
    };

    updateTimer();
    document.addEventListener("visibilitychange", updateTimer);
    mobile.addEventListener("change", updateTimer);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", updateTimer);
      mobile.removeEventListener("change", updateTimer);
    };
  }, [noticeItems.length, noticeInterval, paused]);

  return (
  <footer className="wavve-mobile-footer" aria-label="모바일 서비스 안내">
    <div
      className="wavve-mobile-footer__notice"
      onMouseEnter={() => setPointerInside(true)}
      onMouseLeave={() => setPointerInside(false)}
      onFocusCapture={() => setFocusInside(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocusInside(false);
      }}
    >
      <Link
        className="wavve-mobile-footer__notice-link"
        to={currentNotice?.to || (currentNotice?.id != null ? `/notice/${currentNotice.id}` : noticeTo)}
        title={currentNotice?.title || "공지사항"}
      >
        <img className="wavve-mobile-footer__notice-icon" src={noticeIcon} alt="" width="18" height="18" />
        <span className="wavve-mobile-footer__notice-window">
          <span key={`${noticeIndex}-${currentNotice?.id ?? "notice"}`} className="wavve-mobile-footer__notice-title">
            {currentNotice?.title || "공지사항"}
          </span>
        </span>
      </Link>
      {noticeItems.length > 1 && (
        <button
          className="wavve-mobile-footer__notice-toggle"
          type="button"
          aria-label={manuallyPaused ? "공지 자동 전환 재생" : "공지 자동 전환 일시정지"}
          onClick={() => setManuallyPaused((value) => !value)}
        >
          <span aria-hidden="true">{manuallyPaused ? "▶" : "Ⅱ"}</span>
        </button>
      )}
    </div>

    <div className="wavve-mobile-footer__body">
      <div className="wavve-mobile-footer__social" aria-label="웨이브 SNS">
        <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="웨이브 유튜브, 새 창">
          <img src={youtubeIcon} alt="" width="41.548" height="41.548" />
        </a>
        <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="웨이브 인스타그램, 새 창">
          <img src={instagramIcon} alt="" width="41.548" height="41.548" />
        </a>
      </div>

      <nav className="wavve-mobile-footer__legal" aria-label="약관 및 고객센터">
        <Link to={termsTo}>이용약관</Link>
        <Divider />
        <Link className="wavve-mobile-footer__privacy" to={privacyTo}>개인정보 처리방침</Link>
        <Divider />
        <Link to={supportTo}>고객센터</Link>
      </nav>

      <div className="wavve-mobile-footer__details">
        <p>콘텐츠 웨이브 주식회사 /대표이사 : 이양기</p>
        <p>주소: 서울특별시 영등포구 여의나루로 60 포스트타워 15층</p>
        <p>사업자등록번호: 220-88-38020</p>
        <p>통신판매입 신고번호 : 제2021-서울영등포-0585호</p>
        <p className="wavve-mobile-footer__disclosure">
          통신판매업 정보 공개 : <a href="https://www.ftc.go.kr/bizCommPop.do?wrkr_no=2208838020" target="_blank" rel="noopener noreferrer">https://www.ftc.go.kr/bizCommPop.do?wrkr_no=2208838020</a>
        </p>
        <p>호스팅서비스제공자 : 마이크로소프트 유한회사, 구글클라우드코리아 유한회사, 아마존웹서비스코리아 유한회사</p>
        <p className="wavve-mobile-footer__customer">
          고객센터 <a href="tel:15993709">1599-3709</a> (평일 09:00~17:00 / 점심시간 12:00~13:00 / 주말 및 공휴일 휴무) / <Link to={inquiryTo}>1:1 문의</Link>
        </p>
        <p>전자우편주소 : <a href="mailto:helpdesk@wavve.com">helpdesk@wavve.com</a></p>
        <p>Copyright© 콘텐츠웨이브(주) All rights reserved.</p>
      </div>
    </div>
  </footer>
  );
};

export default MobileFooter;
