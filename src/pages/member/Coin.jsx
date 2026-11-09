import { useState } from "react";
import { Navigate } from "react-router-dom";
import { ChevronRight, CircleAlert, Copyright } from "lucide-react";

import { useAuthStore } from "../../store/useAuthStore";
import { useProfileShorts } from "../../utils/profileShorts";
import { formatCoinDate, getAvailableCoin } from "../../utils/coinRecords";

import "../../styles/pages/member/Coin.scss";

const PAGE_SIZE = 10;
const TABS = [
  { id: "earned", label: "적립 코인" },
  { id: "used", label: "소진 코인" },
];
const money = (value) => value.toLocaleString("ko-KR");

// 코인내역 (/coin): 보유 코인 요약 + 적립/소진 내역 (출석체크 적립 기록은 프로필별 저장)
export default function Coin() {
  const user = useAuthStore((state) => state.user);
  const authReady = useAuthStore((state) => state.authReady);
  const { profile } = useProfileShorts();
  const [tab, setTab] = useState("earned");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState("");

  if (authReady && !user) {
    return <Navigate to="/login" replace state={{ returnTo: "/coin" }} />;
  }

  const records = user ? profile.coinRecords ?? [] : [];
  const now = formatCoinDate(new Date());
  const bonusCoin = records.reduce((sum, record) => sum + getAvailableCoin(record, now), 0);
  const chargedCoin = 0; // 코인 충전 기능이 생기면 충전분을 합산
  const rows = tab === "earned" ? records : []; // 코인 사용 기능이 생기면 소진 내역 연결
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const tabLabel = TABS.find((item) => item.id === tab).label;

  const changeTab = (id) => {
    setTab(id);
    setPage(1);
  };

  return (
    <div className="coin">
      <header className="coin__header">
        <h1>코인내역</h1>
      </header>

      <div className="coin__inner">
        <div className="coin__title-row">
          <h2>보유 코인 내역</h2>
          <button type="button" className="coin__charge" onClick={() => setNotice("코인 충전은 준비 중입니다.")}>
            <Copyright size={18} aria-hidden="true" />
            코인 충전
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
            <p>{tabLabel}이 없어요</p>
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
                    <th scope="col">만료일자</th>
                    <th scope="col">결제수단</th>
                    <th scope="col">자동결제</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((record) => (
                    <tr key={record.id}>
                      <td>{money(record.amount)}</td>
                      <td>{record.name}</td>
                      <td>{record.reason}</td>
                      <td>{money(getAvailableCoin(record, now))}</td>
                      <td>{record.chargedAt}</td>
                      <td>{record.expiresAt}</td>
                      <td>-</td>
                      <td>자동결제<br />대상이 아닙니다.</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
      </div>
    </div>
  );
}
