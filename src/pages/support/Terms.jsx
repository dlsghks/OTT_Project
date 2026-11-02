
import { useState } from "react";
import { Link } from "react-router-dom";
import {
    termsTabs,
    termsVersions,
    termsContents,
} from "../../data/termData";
import "../../styles/pages/Terms.scss";

const supportTabs = [
    { label: "공지사항", path: "/notice" },
    { label: "자주 묻는 질문 FAQ", path: "/support" },
    { label: "1:1 문의", path: "/inquiry" },
    { label: "이용약관", path: "/terms" },
];

export const Terms = () => {
    const [activeTab, setActiveTab] = useState("service");
    const [selectedVersions, setSelectedVersions] = useState({});

    const currentTab = termsTabs.find(
        (tab) => tab.id === activeTab
    );

    const versions = termsVersions[activeTab] || [];

    const selectedVersion =
        selectedVersions[activeTab] || versions[0]?.value || "";

    const content = termsContents[activeTab] || "";

    const handleVersionChange = (e) => {
        setSelectedVersions((prev) => ({
            ...prev,
            [activeTab]: e.target.value,
        }));
    };

    const handlePrint = () => {
        const printWindow = window.open(
            "",
            "_blank",
            "width=900,height=700"
        );

        if (!printWindow) {
            alert("팝업 차단을 해제해 주세요.");
            return;
        }

        const title = currentTab?.label || "이용약관";

        // React에서 생성된 본문 DOM을 복사
        const contentElement = document.querySelector(
            ".terms-page__document"
        );

        const contentHTML = contentElement?.innerHTML || "";

        printWindow.document.open();
        printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ko">
        <head>
          <meta charset="UTF-8" />
          <title>${title}</title>
          <style>
            body {
              margin: 0;
              padding: 40px;
              color: #333;
              background: #fff;
              font-family: "Noto Sans KR", sans-serif;
              font-size: 12px;
              line-height: 1.8;
            }

            h1 {
              font-size: 22px;
              margin-bottom: 30px;
            }

            h2 {
              font-size: 16px;
              margin: 30px 0 12px;
            }

            h3 {
              font-size: 14px;
              margin: 20px 0 10px;
            }

            p {
              margin: 6px 0;
            }

            .terms-page__document {
              white-space: pre-wrap;
              overflow-wrap: anywhere;
            }

            @page {
              size: A4;
              margin: 20mm;
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="terms-page__document">
            ${contentHTML}
          </div>
        </body>
      </html>
    `);
        printWindow.document.close();

        printWindow.addEventListener("load", () => {
            printWindow.focus();
            printWindow.print();
        });
    };

    return (
        <div className="terms-page">
            <div className="terms-page__header">
                <h1>고객센터</h1>
            </div>

            <div className="terms-page__inner">
                <nav className="terms-page__support-tabs">
                    {supportTabs.map((tab) => (
                        <Link
                            key={tab.path}
                            to={tab.path}
                            className={
                                tab.path === "/terms" ? "active" : ""
                            }
                        >
                            {tab.label}
                        </Link>
                    ))}
                </nav>

                <div className="terms-page__tabs">
                    {termsTabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            className={
                                activeTab === tab.id ? "active" : ""
                            }
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="terms-page__title-row">
                    <div className="terms-page__title">
                        <h2>{currentTab?.label}</h2>
                        <span>
                            시행일자 : {selectedVersion}
                        </span>
                    </div>

                    <button
                        type="button"
                        className="terms-page__print"
                        onClick={handlePrint}
                    >
                        인쇄하기 &gt;
                    </button>
                </div>

                <div className="terms-page__document">
                    {content}
                </div>

                {/* 비공식 프로젝트 안내 문구 */}
                <p className="terms-page__disclaimer">
                    본 페이지는 UI/UX 학습을 위한 비공식 Wavve 리디자인
                    프로젝트의 일부입니다.
                    약관 및 정책 내용은 콘텐츠웨이브(주)의 공개 자료를
                    참고하였으며, 실제 서비스 이용 및 법적 효력에 관한
                    사항은 Wavve 공식 홈페이지를 확인해 주세요.
                </p>

                <div className="terms-page__version">
                    <select
                        value={selectedVersion}
                        onChange={handleVersionChange}
                        aria-label="약관 버전 선택"
                    >
                        {versions.map((version) => (
                            <option
                                key={version.value}
                                value={version.value}
                            >
                                {version.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default Terms;
