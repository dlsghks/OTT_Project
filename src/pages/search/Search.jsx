
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import searchIcon from '../../assets/responsive/search.svg';
import desktopSearchIcon from '../../assets/responsive/search-desktop.svg';
import closeIcon from '../../assets/responsive/search-close.svg';
import { categoryPages } from '../../data/categoryData';
import { getLocalSearchMatches, getTmdbSearchMatches, normalizeSearchKeyword } from '../../services/searchCatalog';

import { ContentCard } from '../../components/home/ContentCard';
import { popularKeywords, searchContents } from '../../data/searchData';

import '../../styles/pages/search/Search.scss';
import '../../styles/responsive/SearchResponsive.scss';

const STORAGE_KEY = 'wavve-recent-searches';
const POPULAR_ROTATION_MS = 2000;

export const Search = () => {
  const [popularExpanded, setPopularExpanded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isApp, setIsApp] = useState(
    () => window.matchMedia('(max-width: 1024px)').matches
  );

  // 접힌 목록: 앱 3개, PC 5개. 펼치면 전체 검색어를 순환합니다.
  const visibleCount = Math.min(
    popularKeywords.length,
    popularExpanded ? popularKeywords.length : isApp ? 3 : 5
  );

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1024px)');
    const handleChange = () => setIsApp(media.matches);

    handleChange();
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
    if (visibleCount <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex(prev => (prev + 1) % visibleCount);
    }, POPULAR_ROTATION_MS);

    return () => window.clearInterval(timer);
  }, [visibleCount]);


  // 검색창 입력값과 실제 제출된 검색어는 별도로 관리
  const [keyword, setKeyword] = useState('');
  const [searchedKeyword, setSearchedKeyword] = useState('');

  const localMatches = getLocalSearchMatches(searchedKeyword);
  const [remoteSearch, setRemoteSearch] = useState({ keyword: '', items: [], loading: false, failed: false });

  useEffect(() => {
    const value = searchedKeyword.trim();
    if (!value) return;

    let cancelled = false;
    setRemoteSearch({ keyword: value, items: [], loading: true, failed: false });
    getTmdbSearchMatches(value).then(({ items, failed }) => {
      if (!cancelled) setRemoteSearch({ keyword: value, items, loading: false, failed });
    }).catch(() => {
      if (!cancelled) setRemoteSearch({ keyword: value, items: [], loading: false, failed: true });
    });
    return () => { cancelled = true; };
  }, [searchedKeyword]);

  // 로컬 목록 우선 표시. TMDB에서 같은 작품이 조회되면 제목과 미디어 유형으로 중복 제거.
  const localTitles = new Set(localMatches.programs.map(item =>
    `${normalizeSearchKeyword(item.title)}:${item.kind === 'movie' ? 'movie' : 'tv'}`
  ));
  const remoteReady = remoteSearch.keyword === searchedKeyword;
  const remoteItems = remoteReady ? remoteSearch.items.filter(item =>
    !localTitles.has(`${normalizeSearchKeyword(item.title)}:${item.kind}`)
  ) : [];
  const results = [...localMatches.programs, ...remoteItems];
  const totalResults = results.length + localMatches.categories.length + localMatches.upcoming.length;
  const loading = Boolean(searchedKeyword) && (!remoteReady || remoteSearch.loading);

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

    setKeyword(value);
    setSearchedKeyword(value);
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
        

        <h1>보고싶은 콘텐츠를 찾아보세요</h1>

        <form
          className="search-page__form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <span className="search-page__search-icon"><img className="search-page__desktop-icon" src={desktopSearchIcon} alt="" /><img src={searchIcon} alt="" /></span>

          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="제목, 장르, 배우로 찾아보세요."
            aria-label="콘텐츠 검색"
          />

          <button type="submit">
            검색
          </button>
        </form>
      </section>

      {searchedKeyword && (
        <section className="search-page__results" aria-live="polite">
          <div className="search-page__results-header">
            <h2>‘{searchedKeyword}’ 검색 결과 <span>{totalResults}개{loading ? ' · 검색 중' : ''}</span></h2>
            <button type="button" onClick={() => {
              setSearchedKeyword('');
              setKeyword('');
            }}>검색 초기화</button>
          </div>

          {localMatches.upcoming.length > 0 && (
            <div className="search-page__result-group">
              <h3>공개 예정 <span>{localMatches.upcoming.length}</span></h3>
              <div className="search-page__results-grid">
                {localMatches.upcoming.map(item => (
                  <div className="content-card search-page__upcoming-card" key={item.id}>
                    <div className="content-card__thumbnail">
                      <img src={item.image} alt={item.title} loading="lazy" />
                    </div>
                    <div className="content-card__info">
                      <h3>{item.title}</h3>
                      {item.description && <p className="content-card__date">{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {localMatches.categories.length > 0 && (
            <div className="search-page__result-group">
              <h3>카테고리 <span>{localMatches.categories.length}</span></h3>
              <div className="search-page__category-results">
                {localMatches.categories.map(item => (
                  <Link className="search-page__category-result" key={item.path} to={item.path}>
                    <span>{item.name}</span>
                    <strong>{item.label}</strong>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="search-page__result-group">
              <h3>프로그램 <span>{results.length}{loading ? '+' : ''}</span></h3>
              <div className="search-page__results-grid">
                {results.map(item => (
                  <ContentCard key={`${item.link}-${item.id}`} item={item} />
                ))}
              </div>
            </div>
          )}

          {totalResults === 0 && !loading && (
            <p className="search-page__results-empty">
              검색 결과가 없습니다. 다른 검색어를 입력해 주세요.
            </p>
          )}
          {loading && <p className="search-page__results-notice">TMDB에서 추가 콘텐츠를 검색하고 있습니다.</p>}
          {remoteReady && remoteSearch.failed && (
            <p className="search-page__results-notice">TMDB 검색을 불러오지 못해 등록된 콘텐츠만 표시합니다. API 키와 네트워크를 확인해 주세요.</p>
          )}
          {!loading && remoteReady && !remoteSearch.failed && remoteItems.length > 0 && (
            <p className="search-page__results-notice">TMDB에서 찾은 작품도 포함되어 있으며, 실제 Wavve 제공 여부와는 다를 수 있습니다.</p>
          )}
        </section>
      )}

      {!searchedKeyword && <>
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
                    <img src={closeIcon} alt="" />
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
        <div className={`popular-searches${popularExpanded ? " is-expanded" : ""}`}>
          <div className="search-page__section-head">
            <h2>실시간 인기 검색어</h2>
            <button className="popular-searches__expand" type="button" aria-expanded={popularExpanded} onClick={() => setPopularExpanded(value => !value)}>{popularExpanded ? "접기" : "전체 보기"}</button>
            <span className="popular-searches__time">
              예시 순위
            </span>
          </div>

          <div className="popular-searches__list">
            {popularKeywords.map((item, index) => (
              <button
                type="button"
                className={`popular-searches__item${activeIndex % Math.max(1, visibleCount) === index ? " is-active" : ""}`}
                style={activeIndex % Math.max(1, visibleCount) === index ? {
                  backgroundColor: '#1351f9',
                  borderColor: '#1351f9',
                } : undefined}
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
          <h2>인기 시리즈</h2>
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

      <section className="search-page__movies" aria-labelledby="search-movies-title">
        <h2 id="search-movies-title">인기 영화</h2>
        <div className="search-page__movie-list">
          {categoryPages.movie.items.slice(0, 10).map(item => <ContentCard key={item.id} item={item} />)}
        </div>
      </section>
      </>}

    </div>
  );
};
