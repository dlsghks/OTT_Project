import { SectionTitle } from '../../components/common/SectionTitle';

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import {
  faqCategories,
  faqItems,
} from "../../data/support/faqData";

import "../../styles/pages/support/Notice.scss";
import "../../styles/pages/support/Support.scss";

const supportTabs = [
  { label: "공지사항", path: "/notice" },
  { label: "자주 묻는 질문 FAQ", path: "/support" },
  { label: "1:1 문의", path: "/inquiry" },
  { label: "이용약관", path: "/terms" },
];

const PAGE_SIZE = 10;

export const Support = () => {
  const [category, setCategory] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [openId, setOpenId] = useState(null);

  const filteredFaqs = useMemo(() => {
    return faqItems.filter((item) => {
      const matchesCategory =
        category === "all" || item.category === category;

      const matchesKeyword =
        item.title.toLowerCase().includes(keyword.toLowerCase()) ||
        item.answer.toLowerCase().includes(keyword.toLowerCase());

      return matchesCategory && matchesKeyword;
    });
  }, [category, keyword]);

  const visibleFaqs = filteredFaqs.slice(0, visibleCount);

  const handleCategory = (value) => {
    setCategory(value);
    setVisibleCount(PAGE_SIZE);
    setOpenId(null);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setKeyword(searchInput.trim());
    setVisibleCount(PAGE_SIZE);
    setOpenId(null);
  };

  const handleQuickSearch = (word) => {
    setSearchInput(word);
    setKeyword(word);
    setCategory("all");
    setVisibleCount(PAGE_SIZE);
    setOpenId(null);
  };

  const handleToggle = (id) => {
    setOpenId((current) => current === id ? null : id);
  };

  return (
    <div className="notice-page support-page">
      <div className="notice-page__header">
        <h1>고객센터</h1>
      </div>

      <div className="notice-page__inner">
        {/* 상단 탭 */}
        <nav className="notice-page__tabs">
          {supportTabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={tab.path === "/support" ? "active" : ""}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        {/* FAQ 검색 */}
        <div className="support-page__search-box">
          <SectionTitle>무엇을 도와드릴까요?</SectionTitle>

          <form
            className="support-page__search"
            onSubmit={handleSearch}
          >
            <input
              type="search"
              maxLength={50}
              placeholder="궁금하신 점이 있다면 검색 또는 도움말 카테고리를 선택하세요. (최대 50자)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="FAQ 검색"
            />
            <button type="submit">검색</button>
          </form>

          <div className="support-page__popular">
            <span>자주하는 질문</span>

            {[
              "더블 이용권",
              "로그인이 안돼요",
              "자동결제 해지",
            ].map((word) => (
              <button
                key={word}
                type="button"
                onClick={() => handleQuickSearch(word)}
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ 카테고리 */}
        <div className="support-page__categories">
          {faqCategories.map((item) => (
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

        {/* FAQ 목록 */}
        <div className="support-page__list">
          {visibleFaqs.length > 0 ? (
            visibleFaqs.map((item) => {
              const isOpen = openId === item.id;

              const categoryLabel =
                faqCategories.find(
                  (cate) => cate.value === item.category
                )?.label || "";

              return (
                <div
                  key={item.id}
                  className={`support-page__item ${
                    isOpen ? "is-open" : ""
                  }`}
                >
                  <button
                    type="button"
                    className="support-page__question"
                    onClick={() => handleToggle(item.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${item.id}`}
                  >
                    <span className="support-page__type">
                      {categoryLabel}
                    </span>

                    <span className="support-page__question-title">
                      {item.title}
                    </span>

                    <ChevronDown
                      size={20}
                      className="support-page__chevron"
                    />
                  </button>

                  {isOpen && (
                    <div
                      id={`faq-answer-${item.id}`}
                      className="support-page__answer"
                    >
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="support-page__empty">
              검색 결과가 없습니다.
            </div>
          )}
        </div>

        {/* 더보기 */}
        {visibleCount < filteredFaqs.length && (
          <button
            type="button"
            className="support-page__more"
            onClick={() =>
              setVisibleCount((count) => count + PAGE_SIZE)
            }
          >
            더보기
            <ChevronDown size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Support;
