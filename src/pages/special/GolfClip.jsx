import { useParams } from 'react-router-dom';

import { getGolfClipOrLatest, getGolfClipRecommends } from '../../data/golfData';
import { NewsClipBody } from './NewsClip';
import { DetailMessage } from '../../components/detail/DetailMessage';

import '../../styles/pages/shared/TotalSubDetail.scss';
import '../../styles/pages/special/Special.scss';

// 골프 클립 재생 (/golf/clip/:clipId) — 뉴스 클립 재생 화면(NewsClipBody)을 그대로 사용
// - clipId: 웨이브 콘텐츠 id (예: S31_20261101_KLPGA_FR_H001.1)
// - 영상은 웨이브 재생이 불가해 유튜브에서 같은 제목의 영상을 찾아 재생
// - 오른쪽 추천 영상: 같은 대회 클립 → 같은 분류 클립
export const GolfClip = () => {
  const { clipId } = useParams();
  const clip = getGolfClipOrLatest(clipId);

  if (!clip) {
    return <DetailMessage message="영상 정보를 찾을 수 없습니다." backLink="/special/golf" backLabel="골프로 돌아가기" />;
  }

  return (
    <NewsClipBody
      key={clip.id}
      clip={clip}
      recommends={getGolfClipRecommends(clip)}
      fallbackArticle={`${clip.program} ${clip.category} 영상입니다.`}
    />
  );
};
