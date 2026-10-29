
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { notices } from "../../data/noties";
import "../../styles/pages/Notice.scss";

const supportTabs = [
  { label: "공지사항", path: "/notice" },
  { label: "자주 묻는 질문 FAQ", path: "/support" },
  { label: "1:1 문의", path: "/inquiry" },
  { label: "이용약관", path: "/terms" },
];

const categories = [
  { label: "전체", value: "all" },
  { label: "서비스공지", value: "service" },
  { label: "콘텐츠공지", value: "content" },
];

const PAGE_SIZE = 10;

export const Notice = () => {
  const [category, setCategory] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
      const matchesCategory =
        category === "all" || notice.category === category;

      const matchesKeyword = notice.title
        .toLowerCase()
        .includes(keyword.toLowerCase());

      return matchesCategory && matchesKeyword;
    });
  }, [category, keyword]);

  const totalPages = Math.ceil(
    filteredNotices.length / PAGE_SIZE
  );

  const currentNotices = filteredNotices.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handleCategory = (value) => {
    setCategory(value);
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setKeyword(searchInput.trim());
    setPage(1);
  };

  return (
    <div className="notice-page">
      <div className="notice-page__header">
        <h1>고객센터</h1>
      </div>

      <div className="notice-page__inner">
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

        <div className="notice-page__toolbar">
          <div className="notice-page__categories">
            {categories.map((item) => (
              <button
                key={item.value}
                type="button"
                className={
                  category === item.value ? "active" : ""
                }
                onClick={() => handleCategory(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <form
            className="notice-page__search"
            onSubmit={handleSearch}
          >
            <input
              type="search"
              placeholder="궁금하신 점을 입력해 주세요"
              aria-label="공지사항 검색"
              value={searchInput}
              onChange={(e) =>
                setSearchInput(e.target.value)
              }
            />
            <button type="submit">검색</button>
          </form>
        </div>

        <div className="notice-page__table">
          <div className="notice-page__table-head">
            <span>구분</span>
            <span>제목</span>
            <span>등록일</span>
          </div>

          <div className="notice-page__table-body">
            {currentNotices.length > 0 ? (
              currentNotices.map((notice) => (
                <Link
                  key={notice.id}
                  to={`/notice/${notice.id}`}
                  className={`notice-page__row ${
                    notice.pinned ? "pinned" : ""
                  }`}
                >
                  <span className="notice-page__type">
                    {notice.category === "service"
                      ? "서비스공지"
                      : "콘텐츠공지"}
                  </span>

                  <span className="notice-page__title">
                    {notice.isNew && (
                      <em className="notice-page__new">
                        신규
                      </em>
                    )}
                    {notice.title}
                  </span>

                  <span className="notice-page__date">
                    {notice.date}
                  </span>
                </Link>
              ))
            ) : (
              <div className="notice-page__empty">
                검색 결과가 없습니다.
              </div>
            )}
          </div>
        </div>

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
      </div>
    </div>
  );
};
