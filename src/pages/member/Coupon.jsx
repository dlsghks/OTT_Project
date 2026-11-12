import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { CircleAlert } from "lucide-react";

import { WavveAccountModal } from "../../components/common/WavveAccountModal";
import { couponCatalog } from "../../data/couponData";
import { useActiveVoucher } from "../../hooks/useActiveVoucher";
import { getActiveDemoVoucher, getDemoVoucherPurchases } from "../../utils/demoVoucherPurchases";
import ticketIcon from "../../assets/coupon/ticket.png";
import { CouponRegisterModal } from "../../components/member/CouponRegisterModal";
import { redeemCoupon, registerCoupon } from "../../store/useAccountStore";
import { useAuthStore } from "../../store/useAuthStore";
import { createCouponRecord, getOwnedCoupons, getUsedCoupons, isCouponValid } from "../../utils/couponRecords";
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
  const [pendingCoupon, setPendingCoupon] = useState(null);
  const activeVoucher = useActiveVoucher();
  const busyRef = useRef(false);
  const scopeRef = useRef("");
  const scope = `${ownerId}:${profile.id}`;
  scopeRef.current = scope;

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    setPendingCoupon(null);
    setRegisterOpen(false);
    setNotice("");
  }, [scope]);

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

  const successMessage = (coupon) => coupon.kind === "coin"
    ? `${coupon.amount.toLocaleString("ko-KR")}코인이 추가되었어요.`
    : `${coupon.name}을 적용했어요.`;

  const applyCoupon = async (request) => {
    if (busyRef.current || request.scope !== scopeRef.current) return;
    busyRef.current = true;
    setUsingId(request.coupon.id);
    setPendingCoupon(null);
    setRegisterOpen(false);
    try {
      const applied = request.code
        ? await registerCoupon(request.profileId, request.code, request.ownerId, true)
        : await redeemCoupon(request.profileId, request.coupon.id, request.ownerId);
      if (request.scope !== scopeRef.current) return;
      if (!applied) throw new Error("이미 사용했거나 사용할 수 없는 쿠폰이에요.");
      setRegisterOpen(false);
      changeTab("used");
      setNotice(successMessage(request.coupon));
    } catch {
      if (request.scope === scopeRef.current) setNotice("쿠폰을 적용하지 못했어요. 쿠폰 상태를 확인하고 다시 시도해주세요.");
    } finally {
      busyRef.current = false;
      setUsingId("");
    }
  };

  const requestApplication = (coupon, code) => {
    const request = { coupon, code, profileId: profile.id, ownerId, scope };
    const current = getActiveDemoVoucher(getDemoVoucherPurchases(user?.uid));
    if (coupon.kind === "voucher" && current) {
      setRegisterOpen(false);
      setPendingCoupon(request);
      return;
    }
    return applyCoupon(request);
  };

  const handleRegister = async (code) => {
    const coupon = createCouponRecord(code);
    if (!coupon || !isCouponValid(coupon) || records.some((item) => item.id === coupon.id)) return false;
    await requestApplication(coupon, code);
    return "handled";
  };

  const handleUse = (coupon) => {
    if (usingId || busyRef.current) return;
    requestApplication({ ...coupon, ...couponCatalog[coupon.code] });
  };

  const cancelApplication = () => {
    if (busyRef.current) return;
    setPendingCoupon(null);
    setNotice("쿠폰 적용을 취소했어요.");
  };

  return (
    <div className="coin coupon">
      <header className="coin__header">
        <h1>쿠폰내역</h1>
      </header>

      <button type="button" className="coupon__register" disabled={Boolean(usingId)} onClick={() => setRegisterOpen(true)}>
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
      {notice && <p className="coupon__toast" role="status">{notice}</p>}

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

      {pendingCoupon && (
        <WavveAccountModal title="쿠폰 적용" busy={Boolean(usingId)} onClose={cancelApplication}>
          {() => (
            <div className="wam-body coupon-apply">
              <p>현재 {activeVoucher?.name || "이용권"}을 사용하고 있습니다. 쿠폰을 적용하시겠습니까?</p>
              <div className="coupon-apply__actions">
                <button type="button" className="coupon-apply__confirm" onClick={() => applyCoupon(pendingCoupon)}>
                  적용하기
                </button>
                <button type="button" onClick={cancelApplication}>취소하기</button>
              </div>
            </div>
          )}
        </WavveAccountModal>
      )}

      {registerOpen && (
        <CouponRegisterModal onRegister={handleRegister} onClose={() => setRegisterOpen(false)} />
      )}
    </div>
  );
}
