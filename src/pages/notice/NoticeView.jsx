
import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { List } from "lucide-react";
import { notices } from "../../data/support/noties";
import "../../styles/pages/support/Notice.scss";
import "../../styles/pages/support/NoticeView.scss";

const supportTabs = [
  { label: "공지사항", path: "/notice" },
  { label: "자주 묻는 질문 FAQ", path: "/support" },
  { label: "1:1 문의", path: "/inquiry" },
  { label: "이용약관", path: "/terms" },
];

export const NoticeView = () => {
  const { id } = useParams();

  const sortedNotices = [...notices].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const currentIndex = sortedNotices.findIndex(
    (notice) => String(notice.id) === String(id)
  );

  const notice = sortedNotices[currentIndex];

  const prevNotice =
    currentIndex >= 0 &&
      currentIndex < sortedNotices.length - 1
      ? sortedNotices[currentIndex + 1]
      : null;

  const nextNotice =
    currentIndex > 0
      ? sortedNotices[currentIndex - 1]
      : null;

  // 상세 페이지 이동 시 상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // 공지사항을 찾지 못한 경우
  if (!notice) {
    return (
      <div className="notice-page notice-view">
        <div className="notice-page__header">
          <h1>고객센터</h1>
        </div>

        <div className="notice-page__inner">
          <div className="notice-view__empty">
            <p>존재하지 않는 공지사항입니다.</p>
            <Link to="/notice">목록으로 돌아가기</Link>
          </div>
        </div>
      </div>
    );
  }

  const categoryName =
    notice.category === "service"
      ? "서비스공지"
      : "콘텐츠공지";

  return (
    <div className="notice-page notice-view">
      {/* 고객센터 헤더 */}
      <div className="notice-page__header">
        <h1>고객센터</h1>
      </div>

      <div className="notice-page__inner">
        {/* 상단 탭 */}
        <nav className="notice-page__tabs">
          {supportTabs.map((tab) => (
            <Link
              key={tab.label}
              to={tab.path}
              className={
                tab.path === "/notice" ? "active" : ""
              }
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        {/* 공지사항 상세 */}
        <section className="notice-view__detail">
          {/* 테이블 헤더 */}
          <div className="notice-view__table-head">
            <span>구분</span>
            <span>제목</span>
            <span>등록일</span>
          </div>

          {/* 공지사항 정보 */}
          <div className="notice-view__info">
            <span className="notice-view__type">
              {categoryName}
            </span>

            <h2 className="notice-view__title">
              {notice.isNew && (
                <em className="notice-page__new">
                  신규
                </em>
              )}
              {notice.title}
            </h2>

            <span className="notice-view__date">
              {notice.date}
            </span>
          </div>

          {/* 공지사항 본문 */}
          <div className="notice-view__content">
            {notice.content ? (
              <div className="notice-view__text">
                {notice.content}
              </div>
            ) : (
              <p className="notice-view__no-content">
                등록된 상세 내용이 없습니다.
              </p>
            )}
          </div>

          {/* 이전글 / 다음글 */}
          <div className="notice-view__navigation">
            <div className="notice-view__nav-item">
              <strong>이전글</strong>

              {prevNotice ? (
                <Link to={`/notice/${prevNotice.id}`}>
                  <span>{prevNotice.title}</span>
                  <small>{prevNotice.date}</small>
                </Link>
              ) : (
                <p>이전글이 없습니다.</p>
              )}
            </div>

            <div className="notice-view__nav-item">
              <strong>다음글</strong>

              {nextNotice ? (
                <Link to={`/notice/${nextNotice.id}`}>
                  <span>{nextNotice.title}</span>
                  <small>{nextNotice.date}</small>
                </Link>
              ) : (
                <p>다음글이 없습니다.</p>
              )}
            </div>
          </div>

          {/* 목록 버튼 */}
          <div className="notice-view__bottom">
            <Link
              to="/notice"
              className="notice-view__list-button"
            >
              <span className="notice-view__list-icon">
                <List size={22} strokeWidth={1.8} />
              </span>
              <span>목록</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
