import styles from '../../styles/pages/live/LivePage.module.scss';
import gridStyles from '../../styles/pages/live/LiveFilterGrid.module.scss';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveArtwork } from '../../hooks/useLiveArtwork';
import { getCachedYoutubeLive } from '../../services/youtube';
import { liveDesignRanks } from '../../data/live/liveDesignData';

export const LiveCard = ({ program, ranked = false, compact = false }) => {
  const [, setThumbnailVersion] = useState(0);
  useEffect(() => {
    const update = () => setThumbnailVersion((value) => value + 1);
    window.addEventListener('ott-live-thumbnails-updated', update);
    return () => window.removeEventListener('ott-live-thumbnails-updated', update);
  }, []);
  const liveVideo = getCachedYoutubeLive(program.youtubeChannelId);
  const { image, logo, title, failImage } = useLiveArtwork(program, liveVideo);
  const rank = program.viewerRank ?? program.rank;
  const rankImage = liveDesignRanks[rank - 1];
  return (
    <Link className={`${styles.card} ${ranked ? styles.rankedCard : ''} ${compact ? gridStyles.card : ''}`}
      to={`/livechannel?channel=${encodeURIComponent(program.channelId)}`}
      aria-label={`${program.channel} ${title || ''} 시청하기`}>
      <div className={styles.thumb}>
        {image
          ? <img key={image} src={image} alt="" loading="lazy" draggable={false} onError={failImage} />
          : <div className={styles.cardBrandPlaceholder}>
              {logo ? <img className={styles.cardFallbackLogo} src={logo} alt="" loading="lazy" /> : <span>{program.channel}</span>}
            </div>}
      </div>
      <div className={styles.details}>
        {ranked && (rankImage
          ? <img className={styles.cardRank} src={rankImage} alt={`${rank}위`} loading="lazy" />
          : <strong className={`${styles.cardRank} ${styles.number}`}>{rank}</strong>)}
        <div className={`${styles.cardText} ${compact ? gridStyles.text : ''}`}>
          <strong className={`${styles.channel} ${compact ? gridStyles.channel : ''}`}>{program.channel}</strong>
          <span className={`${styles.title} ${compact ? gridStyles.title : ''}`}>{title || '채널 보기'}</span>
        </div>
      </div>
    </Link>
  );
};
