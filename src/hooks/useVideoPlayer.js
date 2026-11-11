import { useRef, useState } from 'react';
import { formatDate, pickYoutubeVideo } from '../services/tmdbDetail';
import { searchYoutube } from '../services/youtubeSearch';
import { buildTrailerQuery } from '../data/episodeYoutube';

// 상세 페이지 유튜브 영상 팝업 (YoutubePlayerModal) 상태
// - openVideo: 바로 재생할 영상 (관련영상)
// - openTrailer: 시청하기 – TMDB 예고편 > 없으면 유튜브 검색
// - openSearch: 영상을 찾는 동안 팝업을 먼저 열고(찾는 중) 찾으면 재생 (회차 영상)
export const useVideoPlayer = () => {
  const [video, setVideo] = useState(null);
  const requestRef = useRef(0);

  const closeVideo = () => { requestRef.current++; setVideo(null); };
  const openVideo = (nextVideo) => { requestRef.current++; setVideo(nextVideo); };

  // findVideoId: videoId 를 찾아 돌려주는 함수 (못 찾으면 null)
  const openSearch = async (info, findVideoId) => {
    const requestId = ++requestRef.current;
    setVideo({ ...info, requestId, status: 'loading' });

    let videoId;
    try { videoId = await findVideoId(); }
    catch { videoId = null; }
    if (requestId !== requestRef.current) return;

    // 찾는 사이 다른 영상을 눌렀거나 팝업을 닫았으면 무시
    setVideo((current) => current?.requestId === requestId
      ? { ...current, videoId, status: videoId ? 'ready' : 'notFound' }
      : current);
  };

  // videos: TMDB 영상 목록 (movie.videos.results / tv.videos.results)
  const openTrailer = ({ title, videos }) => {
    const trailer = pickYoutubeVideo(videos);
    if (trailer) {
      openVideo({ videoId: trailer.key, title: trailer.name, date: formatDate(trailer.published_at) });
      return;
    }

    const query = buildTrailerQuery(title);
    openSearch({ title: `${title} 예고편`, source: { query } }, () => searchYoutube(query));
  };

  return { video, openVideo, openSearch, openTrailer, closeVideo };
};
