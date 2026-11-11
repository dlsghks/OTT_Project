import { useState } from "react";
import { Navigate } from "react-router-dom";
import { CircleAlert } from "lucide-react";

import ticketIcon from "../../assets/coupon/ticket.png";
import { CouponRegisterModal } from "../../components/member/CouponRegisterModal";
import { redeemCoupon, registerCoupon } from "../../store/useAccountStore";
import { useAuthStore } from "../../store/useAuthStore";
import { getOwnedCoupons, getUsedCoupons } from "../../utils/couponRecords";
import { useProfileShorts } from "../../utils/profileShorts";

import "../../styles/pages/member/Coin.scss";
import "../../styles/pages/member/Coupon.scss";

const PAGE_SIZE = 4;
const TABS = [
  { id: "owned", label: "보유 쿠폰" },
  { id: "used", label: "이용 쿠폰" },
];

// 쿠폰내역 (/coupon): 코인내역과 같은 머리글 · 빈 화면 · 페이지 번호 구조를 사용 (쿠폰은 프로필별 저장)
export default function Coupon() {
  const user = useAuthStore((state) => state.user);
  const authReady = useAuthStore((state) => state.authReady);
  const { profile, ownerId } = useProfileShorts();
  const [tab, setTab] = useState("owned");
  const [page, setPage] = useState(1);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [usingId, setUsingId] = useState("");
  const [notice, setNotice] = useState("");

  if (authReady && !user) {
    return <Navigate to="/login" replace state={{ returnTo: "/coupon" }} />;
  }

  const records = user ? profile.couponRecords ?? [] : [];
  const ownedCoupons = getOwnedCoupons(records);
  const rows = tab === "owned" ? ownedCoupons : getUsedCoupons(records);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const tabLabel = TABS.find((item) => item.id === tab).label;

  const changeTab = (id) => {
    setTab(id);
    setPage(1);
    setNotice("");
  };

  const handleRegister = async (code) => {
    const registered = await registerCoupon(profile.id, code, ownerId);
    if (registered) changeTab("owned");
    return registered;
  };

  const handleUse = async (coupon) => {
    if (usingId || !window.confirm("쿠폰을 사용하시겠습니까?")) return;

    setUsingId(coupon.id);
    setNotice("");
    try {
      await redeemCoupon(profile.id, coupon.id, ownerId);
      changeTab("used");
    } catch {
      setNotice("쿠폰을 사용하지 못했어요. 다시 시도해 주세요.");
    } finally {
      setUsingId("");
    }
  };

  return (
    <div className="coin coupon">
      <header className="coin__header">
        <h1>쿠폰내역</h1>
      </header>

      <button type="button" className="coupon__register" onClick={() => setRegisterOpen(true)}>
        <img src={ticketIcon} alt="" />
        등록하기
      </button>

      <div className="coupon__tabs">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? "is-active" : ""}
            aria-pressed={tab === item.id}
            onClick={() => changeTab(item.id)}
          >
            {item.label}
            {item.id === "owned" && <span>{ownedCoupons.length}</span>}
          </button>
        ))}
      </div>
      {notice && <p className="coin__notice" role="status">{notice}</p>}

      {rows.length === 0 ? (
        <div className="coin__empty">
          <CircleAlert size={56} strokeWidth={1.5} aria-hidden="true" />
          <p>{tabLabel}이 없어요</p>
        </div>
      ) : (
        <>
          <ul className="coupon__list">
            {pageRows.map((coupon) => (
              <li key={coupon.id} className="coupon__item">
                <img className="coupon__icon" src={ticketIcon} alt="" />
                <div className="coupon__info">
                  <strong>{coupon.name}</strong>
                  <p>지급 사유 · {coupon.reason}</p>
                </div>
                <div className="coupon__expire">
                  <span>유효기간</span>
                  <p>{coupon.expiresAt}까지</p>
                </div>
                {coupon.status === "owned" ? (
                  <button
                    type="button"
                    className="coupon__use"
                    disabled={Boolean(usingId)}
                    onClick={() => handleUse(coupon)}
                  >
                    사용하기
                  </button>
                ) : (
                  <span className="coupon__used">사용 완료</span>
                )}
              </li>
            ))}
          </ul>

          <nav className="coin__pagination" aria-label={`${tabLabel} 페이지`}>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
              <button
                key={number}
                type="button"
                className={number === currentPage ? "is-active" : ""}
                aria-current={number === currentPage ? "page" : undefined}
                onClick={() => setPage(number)}
              >
                {number}
              </button>
            ))}
          </nav>
        </>
      )}

      {registerOpen && (
        <CouponRegisterModal onRegister={handleRegister} onClose={() => setRegisterOpen(false)} />
      )}
    </div>
  );
}
