import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { deleteDoc, doc, getFirestore, onSnapshot } from "firebase/firestore";
import { List } from "lucide-react";

import { auth } from "../../firebase/firebase";
import { SectionTitle } from "../../components/common/SectionTitle";

import "../../styles/pages/support/Notice.scss";
import "../../styles/pages/support/Inquiry.scss";
import "../../styles/pages/support/InquiryDetail.scss";

const db = getFirestore(auth.app);

const supportTabs = [
    { label: "공지사항", path: "/notice" },
    { label: "자주 묻는 질문 FAQ", path: "/support" },
    { label: "1:1 문의", path: "/inquiry" },
    { label: "이용약관", path: "/terms" },
];

const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "";

    const date = timestamp.toDate();

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join(".");
};

const displayValue = (value) => {
    if (Array.isArray(value)) {
        return value.length ? value.join(", ") : "-";
    }

    return typeof value === "string" && value.trim() ? value : "-";
};

export const InquiryDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const [session, setSession] = useState({
        ready: false,
        uid: null,
    });

    const [result, setResult] = useState({
        key: null,
        item: null,
        error: "",
    });

    useEffect(() => {
        return onAuthStateChanged(auth, (user) => {
            setSession({
                ready: true,
                uid: user?.uid ?? null,
            });
        });
    }, []);

    const userId = session.uid;
    const documentKey = `${userId ?? ""}:${id ?? ""}`;

    useEffect(() => {
        if (!userId || !id) return;

        const key = `${userId}:${id}`;

        return onSnapshot(
            doc(db, "inquiries", id),
            (snapshot) => {
                if (!snapshot.exists()) {
                    setResult({
                        key,
                        item: null,
                        error: "문의 내역을 찾을 수 없습니다.",
                    });
                    return;
                }

                const data = snapshot.data();

                if (data.uid !== userId) {
                    setResult({
                        key,
                        item: null,
                        error: "본인의 문의만 확인할 수 있습니다.",
                    });
                    return;
                }

                setResult({
                    key,
                    item: { ...data, id: snapshot.id },
                    error: "",
                });
            },
            (error) => {
                console.error("문의 상세 조회 실패:", error);

                setResult({
                    key,
                    item: null,
                    error:
                        error.code === "permission-denied"
                            ? "문의를 조회할 권한이 없거나 존재하지 않는 문의입니다."
                            : "문의 내용을 불러오지 못했습니다.",
                });
            }
        );
    }, [userId, id]);

    const isCurrentResult = result.key === documentKey;
    const inquiry =
        session.ready && userId && isCurrentResult ? result.item : null;

    const hasAnswer =
        typeof inquiry?.answer === "string" &&
        inquiry.answer.trim().length > 0;

    const status = hasAnswer ? "답변완료" : "접수완료";

    let message = "";

    if (!session.ready) {
        message = "로그인 정보를 확인하고 있어요.";
    } else if (!userId) {
        message = "로그인 후 문의 내역을 확인해 주세요.";
    } else if (!isCurrentResult) {
        message = "문의 내용을 불러오고 있어요.";
    } else {
        message = result.error;
    }

    const handleDelete = async () => {
        if (!inquiry || isDeleting) return;

        const currentUser = auth.currentUser;

        if (!currentUser || currentUser.uid !== inquiry.uid) {
            setDeleteError("본인의 문의만 삭제할 수 있습니다.");
            return;
        }

        const confirmed = window.confirm(
            "이 문의를 삭제하시겠습니까?\n삭제한 문의와 답변은 복구할 수 없습니다."
        );

        if (!confirmed) return;

        setIsDeleting(true);
        setDeleteError("");

        try {
            await deleteDoc(doc(db, "inquiries", id));

            navigate("/inquiry", { replace: true });
        } catch (error) {
            console.error("문의 삭제 실패:", error);

            setDeleteError(
                "문의 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요."
            );
            setIsDeleting(false);
        }
    };

    const fields = inquiry
        ? [
            ["이름", inquiry.name],
            ["이메일", inquiry.email],
            ["연락처", inquiry.phone],
            ["질문 구분", inquiry.category],
            ["서비스 구분", inquiry.services],
            ["프로그램 정보", inquiry.programInfo],
            ["사용환경1", inquiry.devices],
            ["사용환경2", inquiry.environment],
        ]
        : [];

    return (
        <div className="notice-page inquiry-page inquiry-detail">
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
                    <p>
                        Wavve 서비스 이용 시 불편사항이나 문의사항을
                        1:1 문의로 보내주시면
                        <br />
                        신속하고 친절하게 안내해 드리겠습니다!
                    </p>

                    <Link
                        to={userId ? "/inquiry/write" : "/login"}
                        className="inquiry-page__write-btn inquiry-detail__write-link"
                    >
                        1:1 문의하기
                    </Link>
                </div>

                <section className="inquiry-page__history">
                    <SectionTitle>나의 문의 내역</SectionTitle>

                    {message ? (
                        <div className="inquiry-page__empty" role="status">
                            <p>{message}</p>

                            {session.ready && !userId && (
                                <Link to="/login" className="inquiry-detail__login">
                                    로그인하기
                                </Link>
                            )}
                        </div>
                    ) : inquiry ? (
                        <>
                            <div className="inquiry-page__table">
                                <div className="inquiry-page__table-head">
                                    <span>상태</span>
                                    <span>구분</span>
                                    <span>제목</span>
                                    <span>등록일</span>
                                </div>

                                <div className="inquiry-page__row">
                                    <span>
                                        <em
                                            className={`inquiry-page__status ${hasAnswer
                                                ? "inquiry-page__status--answered"
                                                : "inquiry-page__status--received"
                                                }`}
                                        >
                                            {status}
                                        </em>
                                    </span>

                                    <span>{inquiry.category}</span>

                                    <span className="inquiry-page__row-title">
                                        {inquiry.title}
                                    </span>

                                    <span className="inquiry-page__date">
                                        {formatDate(inquiry.createdAt)}
                                    </span>
                                </div>
                            </div>

                            <div className="inquiry-detail__question">
                                <dl className="inquiry-detail__fields">
                                    {fields.map(([label, value]) => (
                                        <div key={label}>
                                            <dt>{label}</dt>
                                            <dd>{displayValue(value)}</dd>
                                        </div>
                                    ))}
                                </dl>

                                <div className="inquiry-detail__content">
                                    <span>내용 :</span>
                                    <p>{inquiry.content}</p>
                                </div>
                            </div>

                            <div className="inquiry-detail__answer">
                                {hasAnswer ? (
                                    <>
                                        <em className="inquiry-page__status inquiry-page__status--answered">
                                            답변완료
                                        </em>

                                        <p className="inquiry-detail__answer-text">
                                            {inquiry.answer}
                                        </p>

                                        {inquiry.answeredAt?.toDate && (
                                            <p className="inquiry-detail__answer-date">
                                                {formatDate(inquiry.answeredAt)}
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <p className="inquiry-detail__waiting">
                                        문의가 접수되었습니다.
                                        담당자가 확인 후 답변드리겠습니다.
                                    </p>
                                )}
                            </div>
                        </>
                    ) : null}

                    {deleteError && (
                        <p className="inquiry-detail__delete-error" role="alert">
                            {deleteError}
                        </p>
                    )}

                    <div className="inquiry-detail__actions">
                        <Link to="/inquiry" className="inquiry-detail__list">
                            <span>
                                <List size={22} aria-hidden="true" />
                            </span>
                            목록
                        </Link>

                        {inquiry && (
                            <button
                                type="button"
                                className="inquiry-detail__delete"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? "삭제 중..." : "삭제"}
                            </button>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default InquiryDetail;