import { useCallback, useState } from 'react';
import YoutubePlayerModal from '../common/YoutubePlayerModal';
import { ContentSection } from './ContentSection';
import { WatchHistoryCard } from '../member/WatchHistoryCard';
import { useProfileWatchHistory } from '../../utils/profileWatchHistory';
import { useProfileShorts } from '../../utils/profileShorts';
import { useAuthStore } from '../../store/useAuthStore';

// 메인과 마이페이지가 같은 프로필별 시청 기록을 공유합니다.
export const ContinueWatchingSection = () => {
  const user = useAuthStore((state) => state.user);
  const { history, profileId, ownerId } = useProfileWatchHistory();
  const { profile } = useProfileShorts();
  const name = profile.name?.trim() || '프로필';
  const items = history.slice(0, 20);
  // 로그아웃 후 남아 있는 비로그인용 로컬 기록은 계정의 시청 목록으로 표시하지 않습니다.
  if (!user || ownerId !== user.uid || !items.length) return null;

  return (
    <ContinueWatchingContent
      key={JSON.stringify([ownerId, profileId])}
      name={name}
      items={items}
    />
  );
};

function ContinueWatchingContent({ name, items }) {
  const [video, setVideo] = useState(null);
  const closeVideo = useCallback(() => setVideo(null), []);

  const play = (item) => {
    const startSeconds = item.duration > 0 && item.position >= item.duration
      ? 0
      : item.position;

    setVideo({
      videoId: item.videoId,
      title: item.episodeTitle || item.title,
      thumbnailUrl: item.thumbnailUrl,
      historyItem: item,
      startSeconds,
    });
  };

  return (
    <div className="home-continue-watching">
      <ContentSection
        title={`${name}님이 시청중인 컨텐츠`}
        items={items}
        cardType="wide"
        appResponsive
        moreLink="/mypage"
        renderCard={(item) => (
          <WatchHistoryCard
            key={`${item.id}:${item.thumbnailUrl || item.videoId || item.image}`}
            item={item}
            onPlay={item.videoId ? play : undefined}
          />
        )}
      />
      {video && <YoutubePlayerModal video={video} onClose={closeVideo} />}
    </div>
  );
}
