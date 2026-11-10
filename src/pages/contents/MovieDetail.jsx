import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { auth } from '../../firebase/firebase';
import { getIndividualPurchaseMovie } from '../../data/individualPurchaseMovies';
import { saveDemoMovieDownload, saveDemoMoviePurchase, useDemoMoviePurchases } from '../../utils/demoMoviePurchases';
import { MoviePurchaseDialog } from '../../components/detail/MoviePurchaseDialog';
import demoVideoUrl from '../../assets/videos/movie-download-demo.mp4?url';
import { categoryPages } from '../../data/categoryData';
import { useMovieStore } from '../../store/useMovieStore';
import {
  TMDB_IMG, getLogo, getMovieAge, getCrewNames, getDetailInfo, WRITER_JOBS,
} from '../../services/tmdbDetail';
import { useDetailActions } from '../../hooks/useDetailActions';
import { useVideoPlayer } from '../../hooks/useVideoPlayer';
import { DetailLayout } from '../../components/detail/DetailLayout';
import { DetailHero } from '../../components/detail/DetailHero';
import { DetailVideos } from '../../components/detail/DetailVideos';
import { DetailSections } from '../../components/detail/DetailSections';
import { DetailMessage } from '../../components/detail/DetailMessage';

// 펼치기 정보 (개요 · 장르 · 감독 · 작가)
const getInfo = (movie) => getDetailInfo({
  summary: [movie.production_companies?.[0]?.name, movie.release_date?.slice(0, 4)],
  genres: movie.genres,
  directors: getCrewNames(movie.credits?.crew, ['Director']),
  writers: getCrewNames(movie.credits?.crew, WRITER_JOBS),
});

// 영화 상세: 히어로 + 관련영상 + 시리즈 · 추천 테마 섹션을 아래로 나열
export const MovieDetail = () => {
  const { movieId } = useParams();
  // 다른 영화로 이동하면 관심 · 영상 팝업 상태를 새로 시작
  return <MovieDetailBody key={movieId} movieId={movieId} />;
};

const MovieDetailBody = ({ movieId }) => {
  const { movieIds, movieDetail, movieSections, onFindMovieId, onFetchMovieDetail } = useMovieStore();
  const player = useVideoPlayer();

  // 카테고리 영화(mov-01)는 제목으로 TMDB id를 찾고, 숫자는 TMDB id 그대로 사용
  const localMovie = categoryPages.movie.items.find((item) => item.id === movieId);
  const tmdbId = localMovie ? movieIds[localMovie.title] : Number(movieId) || null;

  const [searchFailed, setSearchFailed] = useState(false);
  const [purchaseAccount, setPurchaseAccount] = useState(null);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const [downloadResult, setDownloadResult] = useState(null);

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

  const offer = getIndividualPurchaseMovie(tmdbId);
  const movieData = tmdbId ? movieDetail[tmdbId] : null;
  const movie = movieData === false && offer ? offer : movieData;
  const image = movie?.poster_path ? `${TMDB_IMG}w500${movie.poster_path}` : localMovie?.poster || localMovie?.image || '';
  const actions = useDetailActions(movie ? {
    id: `movie:${tmdbId}`,
    type: 'movie',
    title: localMovie?.title ?? movie.title,
    image,
  } : null);
  const uid = actions.user?.uid;
  const purchases = useDemoMoviePurchases(uid);
  const purchasedMovie = purchases.find((record) => record.id === offer?.id);
  const needsPurchase = offer && !purchasedMovie;
  const sections = tmdbId ? movieSections[tmdbId] ?? [] : [];
  const notFound = searchFailed || (!localMovie && !tmdbId) || movie === false;

  const downloadMovie = async () => {
    if (!purchasedMovie || !uid || downloadBusy) return;
    setDownloadBusy(true);
    setDownloadResult(null);

    try {
      const response = await fetch(demoVideoUrl);
      if (!response.ok) throw new Error('다운로드 파일을 불러오지 못했어요.');
      const file = await response.blob();
      const fileType = await file.slice(4, 8).text();
      if (fileType !== 'ftyp' || auth.currentUser?.uid !== uid) {
        throw new Error('다운로드를 시작할 수 없어요.');
      }

      const downloadUrl = URL.createObjectURL(file);
      try {
        saveDemoMovieDownload(uid, offer.tmdbId);
        const link = document.createElement('a');
        link.href = downloadUrl;
        const filename = purchasedMovie.title.replace(/[<>:"/\\|?*]/g, '-');
        link.download = `${filename}-시연영상.mp4`;
        document.body.appendChild(link);
        try { link.click(); }
        finally { link.remove(); }
      } finally {
        // 브라우저가 다운로드 URL을 읽을 시간을 확보한 뒤 해제합니다.
        window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 60_000);
      }
      setDownloadResult({ uid, success: true });
    } catch {
      setDownloadResult({ uid, success: false });
    } finally {
      setDownloadBusy(false);
    }
  };

  if (notFound) {
    return <DetailMessage message="영화 정보를 찾을 수 없습니다." backLink="/movie" backLabel="영화 페이지로 돌아가기" />;
  }

  if (!movie) {
    return <DetailMessage message="영화 정보를 불러오는 중이에요…" />;
  }

  const title = localMovie?.title ?? movie.title;
  const year = movie.release_date?.slice(0, 4);
  const videos = (movie.videos?.results ?? []).filter((item) => item.site === 'YouTube');

  return (
    <DetailLayout
      player={player}
      actions={actions}
      hero={(
        // 히어로 (펼치기: 개요 · 장르 · 감독 · 작가)
        <DetailHero
          title={title}
          backdrop={movie.backdrop_path ? `${TMDB_IMG}original${movie.backdrop_path}` : null}
          logo={getLogo(movie.images)}
          meta={[year, movie.runtime ? `${movie.runtime}분` : null].filter(Boolean).join(' · ')}
          age={getMovieAge(movie.release_dates)}
          genres={movie.genres?.map((genre) => genre.name).join(' · ')}
          overview={movie.overview}
          cast={(movie.credits?.cast ?? []).slice(0, 5)}
          info={getInfo(movie)}
          select={(
            <select className="movie-hero__select" defaultValue="sub" aria-label="자막 설정">
              <option value="sub">자막 (설정 가능)</option>
              <option value="none">자막 없음</option>
            </select>
          )}
          watchActions={needsPurchase ? (
            <button
              type="button"
              className="movie-hero__buy"
              onClick={uid ? () => setPurchaseAccount(uid) : actions.onLogin}
            >
              구매하기
            </button>
          ) : undefined}
          onWatch={() => player.openTrailer({ title, videos: movie.videos?.results })}
          actions={actions}
          onDownload={purchasedMovie ? downloadMovie : undefined}
          downloadBusy={downloadBusy}
          downloadNotice={downloadResult && downloadResult.uid === uid && (
            <p role="status" className="movie-hero__download-status">
              {downloadResult.success ? (
                <>시연 영상 다운로드를 시작했어요. <Link to="/mypage?tab=downloads">다운로드 콘텐츠 보기</Link></>
              ) : '다운로드를 시작하지 못했어요. 다시 시도해주세요.'}
            </p>
          )}
        />
      )}
    >
      {offer && uid && purchaseAccount === uid && (
        <MoviePurchaseDialog
          movie={offer}
          onClose={() => setPurchaseAccount(null)}
          onPurchase={() => {
            if (auth.currentUser?.uid !== uid) throw new Error('계정이 변경됐어요.');
            saveDemoMoviePurchase(uid, offer.tmdbId, image);
          }}
        />
      )}

      {/* 관련영상 */}
      <DetailVideos title={title} videos={videos} onSelect={player.openVideo} />

      {/* 시리즈 · 비슷한 영화 · 테마 섹션 */}
      <DetailSections sections={sections} />
    </DetailLayout>
  );
};
