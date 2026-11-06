import YoutubePlayerModal from '../common/YoutubePlayerModal';
import { LoginModal } from '../common/LoginModal';

import '../../styles/pages/category/Category.scss';
import '../../styles/pages/contents/TotalSubDetail.scss';

// 상세 페이지 공통 틀 (영화 · 시리즈)
// - hero: DetailHero
// - children: 히어로 아래 섹션들 (간격 80px)
// - player: useVideoPlayer() 결과 · actions: useDetailActions() 결과
export const DetailLayout = ({ hero, children, player, actions }) => {
  return (
    <div className="movie-detail">
      {hero}
      {actions.likeError && <p role="status" style={{ padding: "12px 24px", color: "#fff" }}>{actions.likeError}</p>}

      <div className="movie-detail__sections">{children}</div>

      {player.video && <YoutubePlayerModal video={player.video} onClose={player.closeVideo} />}

      <LoginModal isOpen={actions.loginOpen} onClose={actions.onCloseLogin} />
    </div>
  );
};
