import { SectionTitle } from '../../components/common/SectionTitle';

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CircleAlert } from "lucide-react";

import { inquiryData } from "../../data/support/inquiryData";

import { LoginModal } from "../../components/common/LoginModal";

import "../../styles/pages/support/Notice.scss";
import "../../styles/pages/support/Inquiry.scss";

// 테스트 상태
// guest: 비로그인
// empty: 로그인 / 문의 없음
// history: 로그인 / 문의 있음
const TEST_MODE = "history";


const supportTabs = [
    { label: "공지사항", path: "/notice" },
    { label: "자주 묻는 질문 FAQ", path: "/support" },
    { label: "1:1 문의", path: "/inquiry" },
    { label: "이용약관", path: "/terms" },
];

const PAGE_SIZE = 10;

export const Inquiry = () => {
    const navigate = useNavigate();
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [page, setPage] = useState(1);

    const isLoggedIn = TEST_MODE !== "empty";

    const inquiries =
        TEST_MODE === "history" ? inquiryData : [];

    const totalPages = Math.ceil(inquiries.length / PAGE_SIZE);

    const currentInquiries = inquiries.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    const handleInquiry = () => {
        navigate("/inquiry/write");
    };

    return (
        <div className="notice-page inquiry-page">
            {/* 고객센터 헤더 */}
            <div className="notice-page__header">
                <h1>고객센터</h1>
            </div>

            <div className="notice-page__inner">
                {/* 고객센터 탭 */}
                <nav className="notice-page__tabs">
                    {supportTabs.map((tab) => (
                        <Link
                            key={tab.path}
                            to={tab.path}
                            className={
                                tab.path === "/inquiry" ? "active" : ""
                            }
                        >
                            {tab.label}
                        </Link>
                    ))}
                </nav>

                {/* 문의 안내 박스 */}
                <div className="inquiry-page__guide">
                    <p>
                        Wavve 서비스 이용 시 불편사항이나 문의사항을
                        1:1 문의로 보내주시면
                        <br />
                        신속하고 친절하게 안내해 드리겠습니다!
                    </p>

                    <button
                        type="button"
                        className="inquiry-page__write-btn"
                        onClick={handleInquiry}
                    >
                        1:1 문의하기
                    </button>
                </div>

                {/* 로그인 상태에서만 문의 내역 출력 */}
                {isLoggedIn && (
                    <section className="inquiry-page__history">
                        <SectionTitle>나의 문의 내역</SectionTitle>

                        {currentInquiries.length === 0 ? (
                            /* 문의 내역 없음 */
                            <div className="inquiry-page__empty">
                                <CircleAlert
                                    size={58}
                                    strokeWidth={1.3}
                                    aria-hidden="true"
                                />
                                <p>문의 내역이 없어요.</p>
                            </div>
                        ) : (
                            /* 문의 내역 있음 */
                            <>
                                <div className="inquiry-page__table">
                                    <div className="inquiry-page__table-head">
                                        <span>상태</span>
                                        <span>구분</span>
                                        <span>제목</span>
                                        <span>등록일</span>
                                    </div>

                                    <div className="inquiry-page__table-body">
                                        {currentInquiries.map((item) => (
                                            <div
                                                key={item.id}
                                                className="inquiry-page__row"
                                            >
                                                <span>
                                                    <em className="inquiry-page__status">
                                                        {item.status}
                                                    </em>
                                                </span>

                                                <span>{item.category}</span>

                                                <span className="inquiry-page__row-title">
                                                    {item.title}
                                                </span>

                                                <span className="inquiry-page__date">
                                                    {item.date}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 페이지네이션 */}
                                {totalPages > 0 && (
                                    <div className="notice-page__pagination">
                                        {Array.from(
                                            { length: totalPages },
                                            (_, i) => i + 1
                                        ).map((number) => (
                                            <button
                                                key={number}
                                                type="button"
                                                className={
                                                    page === number ? "active" : ""
                                                }
                                                onClick={() => setPage(number)}
                                            >
                                                {number}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                )}
            </div>

            {/* 비로그인 시 기존 공통 로그인 팝업 */}
            <LoginModal
                isOpen={loginModalOpen}
                onClose={() => setLoginModalOpen(false)}
            />
        </div>
    );
};

export default Inquiry;
