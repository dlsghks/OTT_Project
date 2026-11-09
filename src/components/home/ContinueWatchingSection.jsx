import { ContentSection } from './ContentSection';
import { WatchHistoryCard } from '../member/WatchHistoryCard';
import { useProfileWatchHistory } from '../../utils/profileWatchHistory';
import { useProfileShorts } from '../../utils/profileShorts';

// 메인과 마이페이지가 같은 프로필별 시청 기록을 공유합니다.
export const ContinueWatchingSection = () => {
  const { history, profileId, ownerId } = useProfileWatchHistory();
  const { profile } = useProfileShorts();
  const name = profile.name?.trim() || '프로필';
  const items = history.slice(0, 20);
  if (!items.length) return null;

  return (
    <div className="home-continue-watching">
      <ContentSection
        key={`${ownerId}:${profileId}`}
        title={`${name}님이 시청중인 컨텐츠`}
        items={items}
        cardType="wide"
        appResponsive
        moreLink="/mypage"
        renderCard={(item) => (
          <WatchHistoryCard
            key={`${item.id}:${item.thumbnailUrl || item.videoId || item.image}`}
            item={item}
          />
        )}
      />
    </div>
  );
};
