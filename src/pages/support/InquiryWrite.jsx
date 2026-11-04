
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import "../../styles/pages/InquiryWrite.scss";
import wavveLogo from "../../assets/wavve_logo_w.svg";

const questionTypes = [
    "설치/작동오류",
    "이용권/결제",
    "로그인/회원",
    "서비스/콘텐츠",
    "재생",
    "기타",
];

const serviceTypes = [
    "LIVE",
    "VOD",
    "영화",
    "타임머신",
    "다운로드",
    "기타",
];

const deviceTypes = [
    "PC web",
    "안드로이드 폰",
    "아이폰",
    "안드로이드 태블릿",
    "아이패드",
    "스마트TV",
    "기타",
];

const initialForm = {
    name: "",
    email: "",
    phone: "",
    questionType: "설치/작동오류",
    services: [],
    programInfo: "",
    devices: [],
    environment: "",
    title: "",
    content: "",
    agree: false,
};

export const InquiryWrite = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState(initialForm);
    const [authLoading, setAuthLoading] = useState(true);
    const [message, setMessage] = useState("");

    // Firebase 로그인 상태 확인
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setForm((prev) => ({
                ...prev,
                name: user?.displayName || "",
                email: user?.email || "",
                phone: user?.phoneNumber || "",
            }));

            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 일반 입력값 변경
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // 체크박스 복수 선택
    const handleCheckbox = (field, value) => {
        setForm((prev) => {
            const selected = prev[field];

            return {
                ...prev,
                [field]: selected.includes(value)
                    ? selected.filter((item) => item !== value)
                    : [...selected, value],
            };
        });
    };

    // 등록 버튼
    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage("");

        if (
            !form.name.trim() ||
            !form.email.trim() ||
            !form.phone.trim() ||
            !form.questionType ||
            form.services.length === 0 ||
            form.devices.length === 0 ||
            !form.title.trim() ||
            !form.content.trim()
        ) {
            setMessage("필수 입력 항목을 모두 작성해 주세요.");
            return;
        }

        if (!form.agree) {
            setMessage("개인정보 수집 및 이용에 동의해 주세요.");
            return;
        }

        // 실제 저장 기능은 추후 Firebase 연동
        setMessage(
            "입력 내용이 확인되었습니다. 문의 등록 기능은 아직 준비 중입니다."
        );
    };

    return (
        <div className="inquiry-write">
            <div className="inquiry-write__inner">

                {/* 로고 */}
                <header className="inquiry-write__header">
                    <button
                        type="button"
                        className="inquiry-write__logo"
                        onClick={() => navigate("/")}
                        aria-label="웨이브 홈으로 이동"
                    >
                        <img src={wavveLogo} alt="wavve" />
                    </button>
                </header>

                {/* 페이지 소개 */}
                <div className="inquiry-write__intro">
                    <h1>1:1 문의하기</h1>

                    <p>
                        Wavve 서비스 이용 시 불편사항이나 문의사항을
                        보내주시면 신속하고 친절하게 안내해 드리겠습니다!
                        <br />
                        사용환경 및 상세사항을 적어주시면 정확하고 빠른
                        답변이 가능하며,
                        <br />
                        비회원일 경우 메일을 보내시기 전, 이름, 이메일,
                        질문유형이 정확한지 다시 한번 확인해주세요!
                    </p>
                </div>

                <form
                    className="inquiry-write__form"
                    onSubmit={handleSubmit}
                >
                    <p className="inquiry-write__required-info">
                        <span>•</span> 항목은 필수 입력 항목입니다.
                    </p>

                    {/* 이름 */}
                    <div className="inquiry-write__field">
                        <label htmlFor="inquiry-name" className="required">
                            이름
                        </label>

                        <div className="inquiry-write__control">
                            <input
                                id="inquiry-name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="이름을 입력해 주세요.(특수문자 입력 불가)"
                                maxLength={50}
                                required
                                disabled={authLoading}
                            />
                        </div>
                    </div>

                    {/* 이메일 */}
                    <div className="inquiry-write__field">
                        <label htmlFor="inquiry-email" className="required">
                            이메일 주소
                        </label>

                        <div className="inquiry-write__control">
                            <input
                                id="inquiry-email"
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="이메일을 입력해 주세요"
                                required
                                disabled={authLoading}
                            />

                            <p className="inquiry-write__hint">
                                ※ 위 이메일로 답변을 드리기 때문에, 정확히
                                입력해 주시길 바랍니다.
                            </p>
                        </div>
                    </div>

                    {/* 연락처 */}
                    <div className="inquiry-write__field">
                        <label htmlFor="inquiry-phone" className="required">
                            연락처
                        </label>

                        <div className="inquiry-write__control">
                            <input
                                id="inquiry-phone"
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="연락처를 입력해주세요."
                                required
                                disabled={authLoading}
                            />
                        </div>
                    </div>

                    {/* 질문 구분 */}
                    <div className="inquiry-write__field">
                        <label htmlFor="inquiry-type" className="required">
                            질문 구분
                        </label>

                        <div className="inquiry-write__control">
                            <select
                                id="inquiry-type"
                                name="questionType"
                                value={form.questionType}
                                onChange={handleChange}
                                required
                            >
                                {questionTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 서비스 구분 */}
                    <div className="inquiry-write__field">
                        <span className="inquiry-write__label required">
                            서비스구분
                        </span>

                        <div className="inquiry-write__checks">
                            {serviceTypes.map((type) => (
                                <label key={type}>
                                    <input
                                        type="checkbox"
                                        checked={form.services.includes(type)}
                                        onChange={() =>
                                            handleCheckbox("services", type)
                                        }
                                    />
                                    <span>{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 프로그램 정보 */}
                    <div className="inquiry-write__field">
                        <label htmlFor="inquiry-program">
                            프로그램 정보
                        </label>

                        <div className="inquiry-write__control">
                            <textarea
                                id="inquiry-program"
                                name="programInfo"
                                value={form.programInfo}
                                onChange={handleChange}
                                className="inquiry-write__textarea--small"
                                placeholder={
                                    "회차, 방송일, 시간 등\n예) 11월 11일 사랑의 온도 오후 10시경, 무한도전 12월 4일 416회 등!"
                                }
                            />
                        </div>
                    </div>

                    {/* 디바이스 */}
                    <div className="inquiry-write__field">
                        <span className="inquiry-write__label required">
                            사용환경1 (디바이스)
                        </span>

                        <div className="inquiry-write__checks">
                            {deviceTypes.map((type) => (
                                <label key={type}>
                                    <input
                                        type="checkbox"
                                        checked={form.devices.includes(type)}
                                        onChange={() =>
                                            handleCheckbox("devices", type)
                                        }
                                    />
                                    <span>{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* OS / 브라우저 */}
                    <div className="inquiry-write__field">
                        <label htmlFor="inquiry-environment">
                            사용환경2 (OS, 브라우저)
                        </label>

                        <div className="inquiry-write__control">
                            <textarea
                                id="inquiry-environment"
                                name="environment"
                                value={form.environment}
                                onChange={handleChange}
                                className="inquiry-write__textarea--small"
                                placeholder="예) 윈도우7 IE 8, 안드로이드 4.2.2, iOS 9.1 등"
                            />
                        </div>
                    </div>

                    {/* 문의 제목 및 내용 */}
                    <div className="inquiry-write__field">
                        <span className="inquiry-write__label required">
                            문의하기
                        </span>

                        <div className="inquiry-write__control inquiry-write__control--stack">
                            <input
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="문의 제목을 입력해 주세요."
                                aria-label="문의 제목"
                                maxLength={200}
                                required
                            />

                            <textarea
                                name="content"
                                value={form.content}
                                onChange={handleChange}
                                className="inquiry-write__textarea--large"
                                placeholder="문의 내용을 입력해 주세요. 욕설·비속어가 포함된 게시글의 경우 답변이 제한될 수 있습니다."
                                aria-label="문의 내용"
                                required
                            />
                        </div>
                    </div>

                    {/* 개인정보 동의 */}
                    <div className="inquiry-write__field inquiry-write__field--privacy">
                        <span className="inquiry-write__label required">
                            개인정보 수집 이용에 대한 동의
                        </span>

                        <div className="inquiry-write__privacy">
                            <p>
                                수집 항목 : 이름(실명), 이메일주소,
                                연락처(휴대전화 등), 문의 내용
                                <br />
                                수집 목적 : 서비스 이용에 따른 고객 문의,
                                불편처리, 오류 해결 등 문의 처리 및 결과 회신
                                <br />
                                보유 및 이용 기간 : 문의 처리 목적 달성 후
                                관련 법령 및 내부 정책에 따라 처리
                            </p>

                            <p className="inquiry-write__privacy-note">
                                ※ 개인정보 수집 및 이용 동의를 거부할 권리가
                                있으며, 동의를 거부하실 경우에는 1:1 문의가
                                제한될 수 있습니다.
                            </p>

                            <label className="inquiry-write__agree">
                                <input
                                    type="checkbox"
                                    checked={form.agree}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            agree: e.target.checked,
                                        }))
                                    }
                                />
                                <span>
                                    개인정보 수집 및 이용에 대해 동의합니다.
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* 검증 안내 */}
                    {message && (
                        <p className="inquiry-write__message" role="status">
                            {message}
                        </p>
                    )}

                    {/* 하단 버튼 */}
                    <div className="inquiry-write__actions">
                        <button
                            type="button"
                            className="inquiry-write__cancel"
                            onClick={() => navigate("/inquiry")}
                        >
                            취소
                        </button>

                        <button
                            type="submit"
                            className="inquiry-write__submit"
                            disabled={authLoading}
                        >
                            등록
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InquiryWrite;
