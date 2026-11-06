import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { CircleAlert } from "lucide-react";

import { auth } from "../../firebase/firebase";
import { SectionTitle } from "../../components/common/SectionTitle";
import { LoginModal } from "../../components/common/LoginModal";
import {
    collection,
    getFirestore,
    onSnapshot,
    query,
    where,
} from "firebase/firestore";

import "../../styles/pages/support/Notice.scss";
import "../../styles/pages/support/Inquiry.scss";

const db = getFirestore(auth.app);

const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "등록 중";

    const date = timestamp.toDate();

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join(".");
};

const supportTabs = [
    { label: "공지사항", path: "/notice" },
    { label: "자주 묻는 질문 FAQ", path: "/support" },
    { label: "1:1 문의", path: "/inquiry" },
    { label: "이용약관", path: "/terms" },
];

const PAGE_SIZE = 10;

export const Inquiry = () => {
    const navigate = useNavigate();
    const [inquiryResult, setInquiryResult] = useState({
        uid: null,
        items: [],
        loading: false,
        error: "",
    });

    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
            setPage(1);
            setLoginModalOpen(false);
        });

        return unsubscribe;
    }, []);

    const isLoggedIn = Boolean(user);

    const userId = user?.uid;

    useEffect(() => {
        if (!userId) {
            setInquiryResult({
                uid: null,
                items: [],
                loading: false,
                error: "",
            });
            return;
        }

        setInquiryResult({
            uid: userId,
            items: [],
            loading: true,
            error: "",
        });

        const inquiryQuery = query(
            collection(db, "inquiries"),
            where("uid", "==", userId)
        );

        const unsubscribe = onSnapshot(
            inquiryQuery,
            (snapshot) => {
                const items = snapshot.docs
                    .map((document) => {
                        const data = document.data();

                        // 담당자가 저장한 답변 내용이 있어야 답변완료 표시
                        const hasAnswer =
                            typeof data.answer === "string" &&
                            data.answer.trim().length > 0;

                        return {
                            ...data,
                            id: document.id,
                            status: hasAnswer ? "답변완료" : "접수완료",
                            date: formatDate(data.createdAt),
                        };
                    })
                    .sort(
                        (a, b) =>
                            (b.createdAt?.toMillis?.() ?? 0) -
                            (a.createdAt?.toMillis?.() ?? 0)
                    );
                setInquiryResult({
                    uid: userId,
                    items,
                    loading: false,
                    error: "",
                });
            },
            (error) => {
                console.error("문의 내역 조회 실패:", error);

                setInquiryResult({
                    uid: userId,
                    items: [],
                    loading: false,
                    error: "문의 내역을 불러오지 못했습니다.",
                });
            }
        );

        return unsubscribe;
    }, [userId]);

    // 계정이 변경되는 순간 이전 사용자의 목록을 표시하지 않음
    const isCurrentUser = inquiryResult.uid === userId;

    const inquiries = isCurrentUser ? inquiryResult.items : [];
    const historyLoading =
        Boolean(userId) && (!isCurrentUser || inquiryResult.loading);
    const historyError = isCurrentUser ? inquiryResult.error : "";

    const totalPages = Math.ceil(inquiries.length / PAGE_SIZE);
    const currentPage = Math.min(page, Math.max(1, totalPages));

    const currentInquiries = inquiries.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );


    const handleInquiry = () => {
        if (authLoading) return;

        if (!isLoggedIn) {
            setLoginModalOpen(true);
            return;
        }

        navigate("/inquiry/write");
    };

    return (
        <div className="notice-page inquiry-page">
            <div className="notice-page__header">
                <h1>고객센터</h1>
            </div>

            <div className="notice-page__inner">
                <nav className="notice-page__tabs" aria-label="고객센터 메뉴">
                    {supportTabs.map((tab) => (
                        <Link
                            key={tab.path}
                            to={tab.path}
                            className={tab.path === "/inquiry" ? "active" : ""}
                            aria-current={tab.path === "/inquiry" ? "page" : undefined}
                        >
                            {tab.label}
                        </Link>
                    ))}
                </nav>

                <div className="inquiry-page__guide">
                    <div className="inquiry-page__guide-text">
                        <p>
                            Wavve 서비스 이용 시 불편사항이나 문의사항을
                            1:1 문의로 보내주시면
                            <br />
                            신속하고 친절하게 안내해 드리겠습니다!
                        </p>

                        {!authLoading && !isLoggedIn && (
                            <p className="inquiry-page__login-guide">
                                로그인 후 문의하시면 나의 문의 내역과 처리 상태를
                                확인할 수 있습니다.
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        className="inquiry-page__write-btn"
                        onClick={handleInquiry}
                        disabled={authLoading}
                    >
                        1:1 문의하기
                    </button>
                </div>

                {authLoading ? (
                    <div className="inquiry-page__empty" role="status">
                        <p>로그인 정보를 확인하고 있어요.</p>
                    </div>
                ) : isLoggedIn ? (
                    <section className="inquiry-page__history">
                        <SectionTitle>나의 문의 내역</SectionTitle>

                        {historyLoading ? (
                            <div className="inquiry-page__empty" role="status">
                                <p>문의 내역을 불러오고 있어요.</p>
                            </div>
                        ) : historyError ? (
                            <div className="inquiry-page__empty" role="alert">
                                <p>{historyError}</p>
                            </div>
                        ) : currentInquiries.length === 0 ? (
                            <div className="inquiry-page__empty">
                                <CircleAlert
                                    size={58}
                                    strokeWidth={1.3}
                                    aria-hidden="true"
                                />
                                <p>문의 내역이 없어요.</p>
                            </div>
                        ) : (
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
                                            <Link
                                                key={item.id}
                                                to={`/inquiry/${item.id}`}
                                                className="inquiry-page__row"
                                            >
                                                <span>
                                                    <em
                                                        className={`inquiry-page__status ${item.status === "답변완료"
                                                            ? "inquiry-page__status--answered"
                                                            : "inquiry-page__status--received"
                                                            }`}
                                                    >
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
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {totalPages > 1 && (
                                    <div className="notice-page__pagination">
                                        {Array.from(
                                            { length: totalPages },
                                            (_, index) => index + 1
                                        ).map((number) => (
                                            <button
                                                key={number}
                                                type="button"
                                                className={page === number ? "active" : ""}
                                                aria-label={`${number}페이지`}
                                                aria-current={
                                                    page === number ? "page" : undefined
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
                ) : null}
            </div>

            <LoginModal
                isOpen={loginModalOpen}
                onClose={() => setLoginModalOpen(false)}
            />
        </div>
    );
};

export default Inquiry;