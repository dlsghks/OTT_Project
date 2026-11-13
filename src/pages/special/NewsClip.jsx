import { useMobileLandscapePlayback } from '../../hooks/useMobileLandscapePlayback';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import { getNewsClip, getTabClips } from '../../data/newsClips';
import { findYoutubeVideo } from '../../services/youtubeClip';
import { DetailMessage } from '../../components/detail/DetailMessage';

import '../../styles/pages/shared/TotalSubDetail.scss';
import '../../styles/pages/special/Special.scss';

// 뉴스 클립 재생 (/news/clip/:clipId) — 웨이브 /player/clip 구성
// 제목 · 출처 · 분류 · 날짜 → 영상 + 기사(영상 설명) / 오른쪽 추천 영상(같은 분류)
// - 클립 영상은 유튜브에서 같은 제목의 뉴스를 찾아 재생
// - /news/clip/youtube?v=영상id&title=제목&source=채널 : 시사토크 등 유튜브 영상 바로 재생
export const NewsClip = () => {
  const { clipId } = useParams();
  const [params] = useSearchParams();

  const youtubeId = clipId === 'youtube' ? params.get('v') : null;
  const clip = youtubeId
    ? {
      id: `youtube-${youtubeId}`,
      title: params.get('title') ?? '',
      source: params.get('source') ?? '',
      category: '시사토크',
      tab: 'politics',
    }
    : getNewsClip(clipId);

  if (!clip) {
    return <DetailMessage message="영상 정보를 찾을 수 없습니다." backLink="/special/news" backLabel="뉴스로 돌아가기" />;
  }

  return <NewsClipBody key={clip.id} clip={clip} youtubeId={youtubeId} />;
};

// 골프 클립 재생(GolfClip)에서도 같이 사용
// - recommends: 오른쪽 추천 영상 (없으면 같은 뉴스 분류 클립)
// - fallbackArticle: 유튜브 설명이 없을 때 보여줄 글 (없으면 뉴스 안내 문구)
export const NewsClipBody = ({ clip, youtubeId, recommends: recommendItems, fallbackArticle }) => {
  // undefined: 찾는 중 · null: 못 찾음
  const [video, setVideo] = useState(undefined);
  const [shareMessage, setShareMessage] = useState('');
  const playerRef = useRef(null);
  const landscape = useMobileLandscapePlayback(playerRef, Boolean(video?.videoId), video?.videoId);

  useEffect(() => {
    window.scrollTo(0, 0);
    let cancelled = false;

    // 유튜브 영상 id 를 받았으면 그 영상으로, 아니면 "제목 + 출처"로 검색
    const query = youtubeId ? clip.title : `${clip.title} ${clip.source}`;
    findYoutubeVideo(query).then((result) => {
      if (cancelled) return;
      // 시사토크: 같은 검색어로 찾은 영상이면 설명을 기사로 사용
      setVideo(youtubeId
        ? { videoId: youtubeId, description: result?.videoId === youtubeId ? result.description : '' }
        : result);
    });

    return () => {
      cancelled = true;
    };
  }, [clip, youtubeId]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareMessage('링크가 복사되었습니다.');
    } catch {
      setShareMessage('링크 복사에 실패했습니다.');
    }
  };

  const recommends = recommendItems ?? getTabClips(clip.tab).filter((item) => item.id !== clip.id);
  const meta = [clip.source, clip.category, clip.date].filter(Boolean).join(' · ');
  const article = video?.description?.trim()
    || (video === undefined ? '' : fallbackArticle ?? `${clip.source}${clip.date ? ` ${clip.date}` : ''} ${clip.category} 뉴스 영상입니다.`);

  return (
    <div className="news-clip">
      <header className="news-clip__header">
        <div>
          <h1>{clip.title}</h1>
          <p>{meta}</p>
        </div>

        <button type="button" className="news-clip__share" onClick={handleShare} aria-label="공유하기">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M12 3v12M7 8l5-5 5 5M5 14v6h14v-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {shareMessage && <span className="news-clip__share-message" role="status">{shareMessage}</span>}
      </header>

      <div className="news-clip__body">
        <div className="news-clip__main">
          <div ref={playerRef} className={`news-clip__player${landscape.active ? " mobile-landscape-player" : ""}`}>
            {video?.videoId && <div className="mobile-playback-actions">
              {landscape.active && <button type="button" className="mobile-playback-action" onClick={landscape.exit}>영상에서 나가기</button>}
              <button type="button" className="mobile-playback-action" onClick={landscape.enter}>전체화면</button>
            </div>}
            {video?.videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`}
                title={clip.title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : (
              <>
                {clip.poster && <img src={clip.poster} alt="" />}
                <span className="news-clip__status" role="status">
                  {video === undefined ? '영상을 불러오는 중이에요…' : '재생할 수 있는 영상을 찾지 못했어요.'}
                </span>
              </>
            )}
          </div>

          {article && <p className="news-clip__article">{article}</p>}
        </div>

        <aside className="news-clip__side" aria-label="추천 영상">
          <h2>추천 영상</h2>
          <ul>
            {recommends.map((item) => (
              <li key={item.id}>
                <Link to={item.link} className="news-clip__item">
                  <span className="news-clip__thumb">
                    <img src={item.image} alt="" loading="lazy" />
                    <span className="video-row__badge">{item.badge}</span>
                    <span className="video-row__time">{item.duration}</span>
                  </span>
                  <span className="news-clip__item-text">
                    <strong>{item.title}</strong>
                    <span>{item.source} · {item.date}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
};
