import { useEffect, useState } from 'react';

import { PosterRow } from './PosterRow';
import { findTmdbDetailPath } from '../../services/tmdbFind';
import { findYoutubeVideo, isRelatedVideo } from '../../services/youtubeClip';

// 프로그램 하나 → 연결할 콘텐츠 (없으면 null)
// 1) TMDB 에 있으면 상세 페이지 2) 유튜브에 있으면 유튜브 영상 재생 3) 둘 다 없으면 카드 삭제
const resolveItem = async (item) => {
  const path = await findTmdbDetailPath(item.title, 'multi');
  if (path) return { ...item, link: path };

  const video = await findYoutubeVideo(item.title);
  if (isRelatedVideo(video, item.title)) {
    const query = new URLSearchParams({ v: video.videoId, title: item.title, source: video.channel ?? '' });
    return { ...item, link: `/news/clip/youtube?${query}` };
  }

  return null;
};

// 시사토크 (뉴스 페이지 #시사토크)
// - 삭제된 카드 수만큼 fallbackItems(메인 메뉴 시사교양 콘텐츠)로 채운다
export const TalkRow = ({ title, items = [], fallbackItems = [] }) => {
  const [list, setList] = useState(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all(items.map(resolveItem)).then((results) => {
      if (cancelled) return;

      const kept = results.filter(Boolean);
      const fill = fallbackItems
        .filter((item) => !kept.some((keptItem) => keptItem.title === item.title))
        .slice(0, items.length - kept.length);

      setList([...kept, ...fill]);
    });

    return () => {
      cancelled = true;
    };
  }, [items, fallbackItems]);

  return <PosterRow title={title} items={list ?? items} />;
};
