import { useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { ChevronRight, CircleAlert, Copyright } from "lucide-react";

import { saveCoinCharge } from "../../store/useAccountStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useProfileShorts } from "../../utils/profileShorts";
import { COIN_CHARGE_OPTIONS, formatCoinDate, getAvailableCoin, getCoinTotal } from "../../utils/coinRecords";

import "../../styles/pages/member/Coin.scss";

const PAGE_SIZE = 10;
const TABS = [
  { id: "earned", label: "적립코인", empty: "적립 코인" },
  { id: "used", label: "소진코인", empty: "소진 코인" },
];
const money = (value) => value.toLocaleString("ko-KR");
// 저장값 "YYYY-MM-DD HH:mm" → 화면 표시 "YYYY. MM. DD | HH:mm"
const displayDate = (value) => value.replace(/^(\d{4})-(\d{2})-(\d{2}) /, "$1. $2. $3 | ");

// 코인내역 (/coin): 보유 코인 요약 + 적립/소진 내역 (출석체크 적립 기록은 프로필별 저장)
export default function Coin() {
  const user = useAuthStore((state) => state.user);
  const authReady = useAuthStore((state) => state.authReady);
  const { profile, ownerId } = useProfileShorts();
  const chargeDialog = useRef(null);
  const chargeRequest = useRef(null);
  const charging = useRef(false);
  const [chargeAmount, setChargeAmount] = useState(COIN_CHARGE_OPTIONS[0]);
  const [isCharging, setIsCharging] = useState(false);
  const [chargeError, setChargeError] = useState("");
  const [tab, setTab] = useState("earned");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState("");

  if (authReady && !user) {
    return <Navigate to="/login" replace state={{ returnTo: "/coin" }} />;
  }

  const records = user ? profile.coinRecords ?? [] : [];
  const now = formatCoinDate(new Date());
  const chargedCoin = getCoinTotal(records.filter((record) => record.kind === "charge"), now);
  const bonusCoin = getCoinTotal(records, now) - chargedCoin;
  const rows = tab === "earned" ? records : []; // 코인 사용 기능이 생기면 소진 내역 연결
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const activeTab = TABS.find((item) => item.id === tab);

  const changeTab = (id) => {
    setTab(id);
    setPage(1);
  };

  const openCharge = () => {
    chargeRequest.current = null;
    setChargeAmount(COIN_CHARGE_OPTIONS[0]);
    setChargeError("");
    setNotice("");
    chargeDialog.current.showModal();
  };

  const confirmCharge = async (event) => {
    event.preventDefault();
    if (charging.current) return;
    charging.current = true;
    setIsCharging(true);
    setChargeError("");
    try {
      chargeRequest.current ??= crypto.randomUUID();
      const amount = await saveCoinCharge(profile.id, chargeAmount, chargeRequest.current, ownerId);
      chargeDialog.current?.close();
      changeTab("earned");
      setNotice(`${money(amount)}코인을 충전했어요.`);
    } catch {
      setChargeError("충전을 완료하지 못했어요. 다시 시도해주세요.");
    } finally {
      charging.current = false;
      setIsCharging(false);
    }
  };

  return (
    <div className="coin">
      <header className="coin__header">
        <h1>코인내역</h1>
      </header>

      <div className="coin__inner">
        <div className="coin__title-row">
          <button type="button" className="coin__charge" onClick={openCharge} disabled={!user} aria-haspopup="dialog">
            <Copyright size={18} aria-hidden="true" />
            코인충전
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
        {notice && <p className="coin__notice" role="status">{notice}</p>}

        <dl className="coin__summary">
          <div>
            <dt>총코인</dt>
            <dd>{money(chargedCoin + bonusCoin)}</dd>
          </div>
          <div>
            <dt>충전 코인</dt>
            <dd>{money(chargedCoin)}</dd>
          </div>
          <div>
            <dt>보너스 코인</dt>
            <dd>{money(bonusCoin)}</dd>
          </div>
        </dl>
      </div>

      <div className="coin__tabs">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? "is-active" : ""}
            aria-pressed={tab === item.id}
            onClick={() => changeTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="coin__empty">
          <CircleAlert size={56} strokeWidth={1.5} aria-hidden="true" />
          <p>{activeTab.empty}이 없어요</p>
        </div>
      ) : (
        <>
          <div className="coin__table-wrap">
            <table className="coin__table">
              <thead>
                <tr>
                  <th scope="col">충전금액</th>
                  <th scope="col">코인명</th>
                  <th scope="col">지급사유</th>
                  <th scope="col">잔여코인</th>
                  <th scope="col">충전일</th>
                  <th scope="col">만료일</th>
                  <th scope="col">결제수단</th>
                  <th scope="col">자동결제</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((record) => (
                  <tr key={record.id}>
                    <td>{record.kind === "charge" ? `${money(record.amount)}원` : money(record.amount)}</td>
                    <td>{record.name}</td>
                    <td>{record.reason}</td>
                    <td>{money(getAvailableCoin(record, now))}</td>
                    <td>{displayDate(record.chargedAt)}</td>
                    <td>{displayDate(record.expiresAt)}</td>
                    <td>{record.kind === "charge" ? "가상 결제" : "-"}</td>
                    <td>자동결제 대상이 아님</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <nav className="coin__pagination" aria-label={`${activeTab.label} 페이지`}>
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
      <dialog
        className="coin__charge-dialog"
        ref={chargeDialog}
        aria-labelledby="coin-charge-title"
        onCancel={(event) => {
          if (charging.current) event.preventDefault();
        }}
      >
        <form onSubmit={confirmCharge} aria-busy={isCharging}>
          <h2 id="coin-charge-title">코인 충전</h2>
          <p>가상 결제로 코인을 충전할 수 있어요. 실제 결제는 이루어지지 않아요.</p>
          <fieldset disabled={isCharging || Boolean(chargeError)}>
            <legend>충전 금액</legend>
            {COIN_CHARGE_OPTIONS.map((amount) => (
              <label key={amount}>
                <input
                  type="radio"
                  name="coin-charge-amount"
                  value={amount}
                  checked={chargeAmount === amount}
                  onChange={() => setChargeAmount(amount)}
                />
                <span>{money(amount)}코인</span>
                <span>{money(amount)}원</span>
              </label>
            ))}
          </fieldset>
          {chargeError && <p role="alert">{chargeError}</p>}
          <div className="coin__charge-actions">
            <button type="button" disabled={isCharging} onClick={() => chargeDialog.current.close()}>취소</button>
            <button type="submit" disabled={isCharging}>{isCharging ? "충전 중…" : "가상 결제로 충전"}</button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
