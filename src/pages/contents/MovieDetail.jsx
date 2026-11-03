import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Share } from 'lucide-react';

import { categoryPages } from '../../data/categoryData';
import { useMovieStore, TMDB_IMG } from '../../store/useMovieStore';
import { CategorySlider } from '../../components/wavve/CategorySlider';
import YoutubePlayerModal from '../../components/retrov/YoutubePlayerModal';
import { LoginModal } from '../../components/common/LoginModal';

import '../../styles/pages/Category.scss';
import '../../styles/pages/MovieDetail.scss';

// 관람 등급 (KR 기준)
const getAge = (releaseDates) => {
  const kr = releaseDates?.results?.find((item) => item.iso_3166_1 === 'KR');
  const cert = kr?.release_dates?.map((item) => item.certification).find(Boolean);
  if (!cert) return null;
  if (cert.includes('12')) return '12';
  if (cert.includes('15')) return '15';
  if (cert.includes('18') || cert.includes('19') || cert.includes('청소년')) return '19';
  return 'ALL';
};

// 타이틀 로고 (한국어 > 영어 > 기타)
const getLogo = (images) => {
  const logos = images?.logos ?? [];
  const logo = logos.find((item) => item.iso_639_1 === 'ko')
    ?? logos.find((item) => item.iso_639_1 === 'en')
    ?? logos[0];
  return logo ? `${TMDB_IMG}w500${logo.file_path}` : null;
};

// 영화 상세: 히어로 + 관련영상 + 시리즈 · 추천 테마 섹션을 아래로 나열
export const MovieDetail = () => {
  const { movieId } = useParams();
  // 다른 영화로 이동하면 관심 · 영상 팝업 상태를 새로 시작
  return <MovieDetailBody key={movieId} movieId={movieId} />;
};

const MovieDetailBody = ({ movieId }) => {
  const { user, movieIds, movieDetail, movieSections, onFindMovieId, onFetchMovieDetail } = useMovieStore();

  // 카테고리 영화(mov-01)는 제목으로 TMDB id를 찾고, 숫자는 TMDB id 그대로 사용
  const localMovie = categoryPages.movie.items.find((item) => item.id === movieId);
  const tmdbId = localMovie ? movieIds[localMovie.title] : Number(movieId) || null;

  const [searchFailed, setSearchFailed] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [video, setVideo] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (localMovie) {
      onFindMovieId(localMovie.title).then((id) => {
        if (id) onFetchMovieDetail(id);
        else setSearchFailed(true);
      });
    } else if (tmdbId) {
      onFetchMovieDetail(tmdbId);
    }
  }, [localMovie, tmdbId, onFindMovieId, onFetchMovieDetail]);

  const movie = tmdbId ? movieDetail[tmdbId] : null;
  const sections = tmdbId ? movieSections[tmdbId] ?? [] : [];
  const notFound = searchFailed || (!localMovie && !tmdbId) || movie === false;

  if (notFound) {
    return (
      <div className="movie-detail movie-detail--empty">
        <h2>영화 정보를 찾을 수 없습니다.</h2>
        <Link to="/movie">영화 페이지로 돌아가기</Link>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="movie-detail movie-detail--empty">
        <p role="status">영화 정보를 불러오는 중이에요…</p>
      </div>
    );
  }

  const title = localMovie?.title ?? movie.title;
  const logo = getLogo(movie.images);
  const age = getAge(movie.release_dates);
  const year = movie.release_date?.slice(0, 4);
  const genres = movie.genres?.map((genre) => genre.name).join(' · ');
  const cast = (movie.credits?.cast ?? []).slice(0, 5);
  const videos = (movie.videos?.results ?? []).filter((item) => item.site === 'YouTube');

  // 관심: 로그인 전에는 로그인 팝업
  const handleLike = () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    setIsLiked((prev) => !prev);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
  };

  return (
    <div className="movie-detail">

      {/* 히어로 */}
      <section className="movie-hero">
        {movie.backdrop_path && (
          <img
            className="movie-hero__background"
            src={`${TMDB_IMG}original${movie.backdrop_path}`}
            alt=""
          />
        )}

        <div className="movie-hero__content">
          {logo ? (
            <h1 className="movie-hero__logo">
              <img src={logo} alt={title} />
            </h1>
          ) : (
            <h1 className="movie-hero__title">{title}</h1>
          )}

          <p className="movie-hero__meta">
            {[year, movie.runtime ? `${movie.runtime}분` : null].filter(Boolean).join(' · ')}
            {age && <span className={`movie-hero__age movie-hero__age--${age.toLowerCase()}`}>{age}</span>}
            {genres}
          </p>

          <div className="movie-hero__actions">
            {/* 로그인 전에는 로그인 버튼만 표시 */}
            {user ? (
              <>
                <select className="movie-hero__select" defaultValue="sub" aria-label="자막 설정">
                  <option value="sub">자막 (설정 가능)</option>
                  <option value="none">자막 없음</option>
                </select>

                <button type="button" className="movie-hero__buy">시청하기</button>
              </>
            ) : (
              <button
                type="button"
                className="movie-hero__buy movie-hero__buy--login"
                onClick={() => setLoginOpen(true)}
              >
                로그인
              </button>
            )}

            <button
              type="button"
              className={`movie-hero__icon ${isLiked ? 'is-active' : ''}`}
              aria-pressed={isLiked}
              onClick={handleLike}
            >
              <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
              <span>관심</span>
            </button>

            <button type="button" className="movie-hero__icon" onClick={handleShare}>
              <Share size={24} />
              <span>공유</span>
            </button>
          </div>

          {movie.overview && <p className="movie-hero__overview">{movie.overview}</p>}

          {cast.length > 0 && (
            <p className="movie-hero__cast">
              <span>출연 :</span>
              {cast.map((person, index) => (
                <span key={person.id}>
                  <u>{person.name}</u>
                  {index < cast.length - 1 && ', '}
                </span>
              ))}
            </p>
          )}
        </div>
      </section>

      <div className="movie-detail__sections">

        {/* 관련영상 */}
        {videos.length > 0 && (
          <section className="movie-videos">
            <h2 className="movie-videos__title">관련영상</h2>

            <ul className="movie-videos__list">
              {videos.slice(0, 8).map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="movie-videos__card"
                    onClick={() => setVideo({
                      videoId: item.key,
                      title: item.name,
                      date: item.published_at?.slice(0, 10).replaceAll('-', '.'),
                    })}
                  >
                    <span className="movie-videos__thumb">
                      <img src={`https://i.ytimg.com/vi/${item.key}/hqdefault.jpg`} alt="" loading="lazy" />
                    </span>
                    <strong>{item.name}</strong>
                    <span className="movie-videos__desc">{title} {item.type}</span>
                    {item.published_at && (
                      <span className="movie-videos__date">
                        {item.published_at.slice(0, 10).replaceAll('-', '.')}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 시리즈 · 비슷한 영화 · 테마 섹션 */}
        {sections
          .filter((section) => section.items.length > 0)
          .map((section) => (
            <CategorySlider key={section.id} title={section.title} items={section.items} />
          ))}
      </div>

      {video && <YoutubePlayerModal video={video} onClose={() => setVideo(null)} />}

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
};
