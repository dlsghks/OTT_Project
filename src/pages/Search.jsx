
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ContentCard } from '../components/home/ContentCard';
import { popularKeywords, searchContents } from '../data/searchData';

import '../styles/pages/Search.scss';

const STORAGE_KEY = 'wavve-recent-searches';

export const Search = () => {
  const navigate = useNavigate();

  // 검색창 입력값
  const [keyword, setKeyword] = useState('');

  // 최근 검색어
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // 최근 검색어 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(recentSearches)
    );
  }, [recentSearches]);

  // 검색 실행
  const handleSearch = (searchWord = keyword) => {
    const value = searchWord.trim();

    if (!value) return;

    // 중복 제거 후 최신 검색어를 맨 앞에 추가
    setRecentSearches(prev => [
      value,
      ...prev.filter(word => word !== value)
    ].slice(0, 10));

    setKeyword("");

    // 추후 실제 검색 결과 페이지와 연결 가능
    // navigate(`/search/result?keyword=${encodeURIComponent(value)}`);
  };

  // 개별 검색어 삭제
  const handleDelete = (word) => {
    setRecentSearches(prev =>
      prev.filter(item => item !== word)
    );
  };

  // 전체 검색어 삭제
  const handleDeleteAll = () => {
    setRecentSearches([]);
  };

  // 인기 검색어 클릭
  const handlePopularClick = (word) => {
    handleSearch(word);
  };

  // 순위 변동 표시
  const renderChange = (change) => {
    switch (change) {
      case 'up':
        return <span className="trend trend--up">▲</span>;

      case 'down':
        return <span className="trend trend--down">▼</span>;

      case 'new':
        return <span className="trend trend--new">NEW</span>;

      default:
        return <span className="trend trend--same">−</span>;
    }
  };

  return (
    <div className="search-page">

      {/* 검색 영역 */}
      <section className="search-page__hero">
        <p className="search-page__eyebrow">SEARCH</p>

        <h1>보고 싶은 콘텐츠를 찾아보세요</h1>

        <form
          className="search-page__form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <span className="search-page__search-icon">
            ⌕
          </span>

          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="제목, 배우, 감독을 검색해보세요"
            aria-label="콘텐츠 검색"
          />

          <button type="submit">
            검색
          </button>
        </form>
      </section>

      {/* 검색어 정보 영역 */}
      <section className="search-page__keywords">

        {/* 최근 검색어 */}
        <div className="recent-searches">
          <div className="search-page__section-head">
            <h2>최근 검색어</h2>

            {recentSearches.length > 0 && (
              <button
                type="button"
                className="recent-searches__clear"
                onClick={handleDeleteAll}
              >
                전체 삭제
              </button>
            )}
          </div>

          {recentSearches.length > 0 ? (
            <div className="recent-searches__list">
              {recentSearches.map((word) => (
                <div
                  className="recent-searches__chip"
                  key={word}
                >
                  <button
                    type="button"
                    className="recent-searches__word"
                    onClick={() => handleSearch(word)}
                  >
                    {word}
                  </button>

                  <button
                    type="button"
                    className="recent-searches__delete"
                    aria-label={`${word} 삭제`}
                    onClick={() => handleDelete(word)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="recent-searches__empty">
              최근 검색 내역이 없습니다.
            </p>
          )}
        </div>

        {/* 실시간 인기 검색어 */}
        <div className="popular-searches">
          <div className="search-page__section-head">
            <h2>실시간 인기 검색어</h2>
            <span className="popular-searches__time">
              예시 순위
            </span>
          </div>

          <div className="popular-searches__list">
            {popularKeywords.map((item) => (
              <button
                type="button"
                className="popular-searches__item"
                key={item.rank}
                onClick={() =>
                  handlePopularClick(item.keyword)
                }
              >
                <span className="popular-searches__rank">
                  {item.rank}
                </span>

                <span className="popular-searches__keyword">
                  {item.keyword}
                </span>

                {renderChange(item.change)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 추천 콘텐츠 영역 */}
      <section className="search-page__contents">
        <div className="search-page__contents-head">
          <h2>지금 많이 찾는 콘텐츠</h2>
          <span>웨이브 시청 데이터 기준 예시</span>
        </div>

        <div className="search-page__contents-grid">
          {searchContents.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
            />
          ))}
        </div>
      </section>

    </div>
  );
};
