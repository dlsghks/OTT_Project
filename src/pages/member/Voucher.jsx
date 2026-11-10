import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { Check, ChevronDown } from "lucide-react";

import { auth } from "../../firebase/firebase";
import { LoginModal } from "../../components/common/LoginModal";
import { voucherGroups, voucherTabs } from "../../data/voucherData";
import {
    getActiveDemoVoucher,
    getDemoVoucherPurchases,
    getDemoVoucherSelection,
    saveDemoVoucherPurchase,
} from "../../utils/demoVoucherPurchases";

import "../../styles/pages/member/Voucher.scss";

const money = (value) => value.toLocaleString("ko-KR");

const voucherBanners = [
    {
        id: "wavve",
        image: "wavve-ticket.jpg",
        alt: "웨이브 첫 달 이용권 100% 페이백",
        background: "#0667ff",
    },
    {
        id: "double",
        image: "tving-ticket.jpg",
        alt: "웨이브 × 티빙 더블 광고형 스탠다드 월 7,000원",
        background: "#a4edf8",
    },
];

const FeatureValue = ({ value }) => {
    if (typeof value === "boolean") {
        return value ? (
            <span className="voucher__check">
                <Check size={20} aria-hidden="true" />
                <span className="voucher__sr-only">있음</span>
            </span>
        ) : (
            <span aria-label="없음">—</span>
        );
    }

    if (Array.isArray(value)) {
        return (
            <div className="voucher__brand-values">
                {value.map((text, index) => (
                    <span key={index}>
                        <b
                            className={`voucher__brand voucher__brand--${index === 0 ? "wavve" : "tving"
                                }`}
                            aria-label={index === 0 ? "웨이브" : "티빙"}
                        >
                            {index === 0 ? "W" : "T"}
                        </b>
                        {text}
                    </span>
                ))}
            </div>
        );
    }

    return value;
};

export const Voucher = () => {
    const [bannerOpen, setBannerOpen] = useState(false);

    const toggleBanner = () => {
        setBannerOpen((previous) => !previous);
    };

    // 펼치기·접기 후 변경된 슬라이드 높이에 맞춰 애니메이션
    const [activeTab, setActiveTab] = useState("double");
    const [selectedId, setSelectedId] = useState(null);
    const [billing, setBilling] = useState("monthly");
    const [showAll, setShowAll] = useState(false);
    const [hoveredId, setHoveredId] = useState(null);

    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [activeVoucher, setActiveVoucher] = useState(null);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [checkout, setCheckout] = useState(null);
    const [checkoutError, setCheckoutError] = useState("");
    const [receipt, setReceipt] = useState(null);
    const checkoutDialog = useRef(null);

    const currentSelection = getDemoVoucherSelection(activeVoucher);
    const group = voucherGroups[activeTab];
    const visiblePlans = group.plans.filter(
        (plan) =>
            activeTab !== "double" ||
            showAll ||
            plan.id === currentSelection?.planId ||
            !plan.hiddenByDefault
    );
    const selectedPlan =
        group.plans.find((plan) => plan.id === selectedId) ?? null;

    const isAnnual =
        billing === "annual" && Boolean(selectedPlan?.annual);

    const isCurrentSelection = Boolean(currentSelection &&
        currentSelection.planId === selectedId &&
        currentSelection.billing === (isAnnual ? "annual" : "monthly"));

    const selectedPrice = selectedPlan
        ? isAnnual
            ? selectedPlan.annual
            : selectedPlan.monthly
        : 0;

    useEffect(() => {
        return onAuthStateChanged(auth, (currentUser) => {
            const voucher = getActiveDemoVoucher(getDemoVoucherPurchases(currentUser?.uid));
            const selection = getDemoVoucherSelection(voucher);

            setUser(currentUser);
            setActiveVoucher(voucher);
            setActiveTab(selection?.tabId ?? "double");
            setSelectedId(selection?.planId ?? null);
            setBilling(selection?.billing ?? "monthly");
            setAuthLoading(false);
            setLoginModalOpen(false);
            setMessage("");
            setReceipt(null);
            checkoutDialog.current?.close();
        });
    }, []);

    const handleTabChange = (id) => {
        const selection = currentSelection?.tabId === id ? currentSelection : null;
        setActiveTab(id);
        setSelectedId(selection?.planId ?? null);
        setBilling(selection?.billing ?? "monthly");
        setBannerOpen(false);
        setShowAll(false);
        setHoveredId(null);
        setMessage("");
    };

    const handlePlanChange = (plan) => {
        setSelectedId((previous) =>
            previous === plan.id && !isCurrentSelection ? null : plan.id
        );

        if (!plan.annual) setBilling("monthly");

        setMessage("");
    };

    const handlePurchase = () => {
        if (authLoading || isCurrentSelection) return;
        if (!selectedPlan) {
            setMessage("이용권을 먼저 선택해 주세요.");
            return;
        }

        if (!user) {
            setLoginModalOpen(true);
            return;
        }

        setMessage("");
        setReceipt(null);
        setCheckoutError("");
        setCheckout({
            uid: user.uid,
            id: crypto.randomUUID(),
            planId: selectedPlan.id,
            isChange: Boolean(activeVoucher),
            name: selectedPlan.name,
            months: isAnnual ? 12 : 1,
            amount: selectedPrice,
        });
    };

    useEffect(() => {
        if (checkout && !checkoutDialog.current.open) checkoutDialog.current.showModal();
    }, [checkout]);

    const approveCheckout = (event) => {
        event.preventDefault();
        if (!checkoutDialog.current.open || !checkout || auth.currentUser?.uid !== checkout.uid) {
            return;
        }

        try {
            saveDemoVoucherPurchase(checkout);
        } catch {
            setCheckoutError("결제 내역을 저장하지 못했습니다. 브라우저 저장 공간을 확인한 뒤 다시 시도해 주세요.");
            return;
        }

        setActiveVoucher(getActiveDemoVoucher(getDemoVoucherPurchases(checkout.uid)));
        setSelectedId(null);
        setCheckout(null);
        setReceipt(checkout);
    };

    return (
        <div className="voucher">
            <header className="voucher__header">
                <h1>이용권</h1>
                <p>방송/영화/해외시리즈 무제한!</p>
            </header>

            <div
                className="voucher__promotion"
                style={{ "--banner-background": group.bannerColor }}
            >
                <div
                    id="voucher-banner-content"
                    className={`voucher__banner-window ${bannerOpen ? "is-open" : ""
                        }`}
                >
                    <img
                        src={`${import.meta.env.BASE_URL}images/voucher/${group.banner}`}
                        alt={group.bannerAlt}
                    />
                </div>

                <button
                    type="button"
                    className="voucher__banner-toggle"
                    aria-expanded={bannerOpen}
                    aria-controls="voucher-banner-content"
                    aria-label={bannerOpen ? "배너 접기" : "배너 전체 보기"}
                    onClick={toggleBanner}
                >
                    <ChevronDown size={24} aria-hidden="true" />
                </button>
            </div>

            <div className="voucher__inner">
                <div className="voucher__tabs" role="tablist" aria-label="이용권 종류">
                    {voucherTabs.map((tab) => (
                        <button
                            key={tab.id}
                            id={`voucher-tab-${tab.id}`}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            aria-controls="voucher-panel"
                            className={activeTab === tab.id ? "is-active" : ""}
                            onClick={() => handleTabChange(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <section
                    id="voucher-panel"
                    role="tabpanel"
                    aria-labelledby={`voucher-tab-${activeTab}`}
                >
                    {activeTab === "wavve" && (
                        <div className="voucher__billing" aria-label="결제 기간">
                            <button
                                type="button"
                                className={billing === "monthly" ? "is-active" : ""}
                                aria-pressed={billing === "monthly"}
                                onClick={() => setBilling("monthly")}
                            >
                                1개월
                            </button>

                            <button
                                type="button"
                                className={billing === "annual" ? "is-active" : ""}
                                aria-pressed={billing === "annual"}
                                onClick={() => {
                                    setBilling("annual");

                                    if (selectedPlan && !selectedPlan.annual) {
                                        setSelectedId(null);
                                    }
                                }}
                            >
                                12개월
                            </button>
                        </div>
                    )}

                    <div className="voucher__table-scroll">
                        <table
                            className="voucher__table"
                            style={{
                                minWidth: visiblePlans.length === 5 ? 1200 : 950,
                            }}
                        >
                            <caption className="voucher__sr-only">
                                {voucherTabs.find((tab) => tab.id === activeTab)?.label}
                                가격과 혜택 비교
                            </caption>

                            <thead>
                                <tr>
                                    <th scope="col" className="voucher__intro">
                                        <strong>이용권 구독</strong>
                                        <p>
                                            이용권을 선택하여
                                            <br />
                                            혜택을 비교해 보세요.
                                        </p>
                                    </th>

                                    {visiblePlans.map((plan) => {
                                        const unavailable = billing === "annual" && !plan.annual;

                                        const price =
                                            billing === "annual" ? plan.annual : plan.monthly;

                                        return (
                                            <th
                                                key={plan.id}
                                                scope="col"
                                                onMouseEnter={() => {
                                                    if (!unavailable) setHoveredId(plan.id);
                                                }}
                                                onMouseLeave={() => setHoveredId(null)}
                                            >
                                                <button
                                                    type="button"
                                                    className={[
                                                        "voucher__plan",
                                                        selectedId === plan.id ? "is-selected" : "",
                                                        hoveredId === plan.id ? "is-hovered" : "",
                                                        unavailable ? "is-disabled" : "",
                                                    ].filter(Boolean).join(" ")}
                                                    disabled={unavailable}
                                                    aria-pressed={selectedId === plan.id}
                                                    onClick={() => handlePlanChange(plan)}
                                                >
                                                    {activeTab === "wavve" && plan.id === "wavve-standard" && (
                                                        <span className="voucher__recommend">추천</span>
                                                    )}
                                                    <span className="voucher__plan-name">
                                                        <span className="voucher__plan-dot" aria-hidden="true" />
                                                        {plan.name}
                                                    </span>

                                                    {plan.originalPrice && (
                                                        <del className="voucher__original-price">
                                                            {money(plan.originalPrice)}원
                                                        </del>
                                                    )}

                                                    <strong className="voucher__plan-price">
                                                        {unavailable
                                                            ? "미제공"
                                                            : `${money(price)}원 / ${billing === "annual" ? "년" : "월"}`}
                                                    </strong>

                                                    <span className="voucher__plan-note">
                                                        {unavailable
                                                            ? "1개월 이용권만 제공"
                                                            : currentSelection?.planId === plan.id && currentSelection.billing === billing
                                                                ? "이용 중인 이용권"
                                                                : selectedId === plan.id
                                                                ? "선택한 이용권"
                                                                : "이용권 선택"}
                                                    </span>
                                                </button>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>

                            <tbody>
                                {group.rows.map((row) => (
                                    <tr key={row.key}>
                                        <th scope="row">{row.label}</th>

                                        {visiblePlans.map((plan) => (
                                            <td
                                                key={plan.id}
                                                className={[
                                                    selectedId === plan.id ? "is-selected" : "",
                                                    hoveredId === plan.id ? "is-hovered" : "",
                                                ].filter(Boolean).join(" ")}
                                                onMouseEnter={() => {
                                                    if (billing !== "annual" || plan.annual) {
                                                        setHoveredId(plan.id);
                                                    }
                                                }}
                                                onMouseLeave={() => setHoveredId(null)}
                                            >
                                                {billing === "annual" && !plan.annual ? (
                                                    <span>-</span>
                                                ) : (
                                                    <FeatureValue value={plan.features[row.key]} />
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {activeTab === "double" && !showAll && (
                        <div className="voucher__all">
                            <button
                                type="button"
                                onClick={() => {
                                    setHoveredId(null);
                                    setShowAll(true);
                                }}
                            >
                                모든 이용권 보기
                            </button>
                        </div>
                    )}

                    {activeTab === "double" && (
                        <section className="voucher__benefits">
                            <h2>더블 이용권 공통혜택</h2>

                            <div className="voucher__benefit-columns">
                                <div>
                                    <h3>웨이브</h3>
                                    <ul>
                                        <li>웨이브 오리지널 콘텐츠</li>
                                        <li>지상파 등 VOD 및 라이브 방송</li>
                                        <li>영화 콘텐츠 시청 · 일부 별도 구매</li>
                                        <li>QVOD 이용</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3>티빙</h3>
                                    <ul>
                                        <li>티빙 오리지널 콘텐츠</li>
                                        <li>방송 프로그램, 영화, 해외 시리즈</li>
                                        <li>스포츠 중계와 라이브 방송</li>
                                        <li>이용권별 제공 범위는 구매 전 확인</li>
                                    </ul>
                                </div>
                            </div>
                        </section>
                    )}

                    <div className="voucher__notices">
                        <details>
                            <summary>
                                서비스 이용 주의사항
                                <ChevronDown size={18} aria-hidden="true" />
                            </summary>
                            <p>
                                일부 콘텐츠는 별도 구매가 필요할 수 있습니다.
                                이용권별 제공 콘텐츠와 지원 환경을 확인해 주세요.
                            </p>
                        </details>

                        <details>
                            <summary>
                                이용권 구매 주의사항
                                <ChevronDown size={18} aria-hidden="true" />
                            </summary>
                            <p>
                                페이백 등 이벤트 혜택은 해당 이벤트의 적용 대상과
                                조건을 확인해 주세요. 이 페이지에서는 시연용 가상결제가 진행됩니다.
                            </p>
                        </details>
                    </div>
                </section>
            </div>

            {message && (
                <div className="voucher__message" role="status">
                    <p>{message}</p>
                    <button type="button" onClick={() => setMessage("")}>
                        닫기
                    </button>
                </div>
            )}

            <div
                className={`voucher__purchase-bar ${selectedPlan ? "is-visible" : ""
                    }`}
                aria-hidden={!selectedPlan}
                inert={!selectedPlan}
            >

                <div className="voucher__purchase-inner">
                    <div className="voucher__selected">
                        <span>
                            {selectedPlan
                                ? `선택한 이용권 · ${isAnnual ? "12개월" : "1개월"}`
                                : "이용권 선택"}
                        </span>
                        <strong>
                            {selectedPlan ? selectedPlan.name : "이용권을 선택해 주세요"}
                        </strong>
                    </div>

                    <strong className="voucher__total">
                        {selectedPlan
                            ? `${isAnnual ? "연" : "월"} ${money(selectedPrice)}원`
                            : "—"}
                    </strong>

                    <button
                        type="button"
                        onClick={handlePurchase}
                        disabled={authLoading || isCurrentSelection}
                    >
                        {isCurrentSelection ? "이용 중인 이용권" : activeVoucher ? "이용권 변경하기" : "이용권 구매하기"}
                    </button>
                </div>
            </div>

            <dialog
                ref={checkoutDialog}
                className="voucher__checkout"
                aria-labelledby="voucher-checkout-title"
                onClose={() => {
                    setCheckout(null);
                    setReceipt(null);
                }}
            >
                <h2 id="voucher-checkout-title">{receipt ? (receipt.isChange ? "이용권 변경 완료" : "이용권 구매 완료") : "가상결제"}</h2>
                {receipt ? (
                    <form method="dialog">
                        <p>{receipt.name} {receipt.months}개월 {receipt.isChange ? "이용권으로 변경됐어요." : "가상결제가 완료됐어요."}</p>
                        <div className="voucher__checkout-actions">
                            <Link to="/mypage?billing=1">결제 내역 보기</Link>
                            <button type="submit" autoFocus>확인</button>
                        </div>
                    </form>
                ) : checkout && (
                    <form onSubmit={approveCheckout}>
                        <p>시연용 결제입니다. 실제 청구는 발생하지 않습니다.</p>
                        <dl>
                            <div><dt>이용권</dt><dd>{checkout.name}</dd></div>
                            <div><dt>이용 기간</dt><dd>{checkout.months}개월</dd></div>
                            <div><dt>결제 금액</dt><dd>{money(checkout.amount)}원</dd></div>
                        </dl>
                        {checkoutError && <p role="alert">{checkoutError}</p>}
                        <div className="voucher__checkout-actions">
                            <button type="button" onClick={() => checkoutDialog.current.close()} autoFocus>취소</button>
                            <button type="submit">가상결제 승인</button>
                        </div>
                    </form>
                )}
            </dialog>

            <LoginModal
                isOpen={loginModalOpen}
                onClose={() => setLoginModalOpen(false)}
            />
        </div>
    );
};

export default Voucher;