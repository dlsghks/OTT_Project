import { Children, isValidElement, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useEditorPicks, saveEditorPick } from '../../utils/profileEditorPicks';
import { getImagePath } from '../../utils/imagePath';
import { Heart } from 'lucide-react';
import { ContentCard } from '../home/ContentCard';
import '../../styles/pages/category/SeeAllPage.scss';

const plainText = (node) => Children.toArray(node).map(child => {
  if (typeof child === 'string' || typeof child === 'number') return String(child);
  if (isValidElement(child)) return child.type === 'br' ? ' ' : plainText(child.props.children);
  return '';
}).join('');

// The page heart bookmarks this entire collection for the selected profile.
export const PosterGridPage = ({ title, description, items = [], loading = false }) => {
  const { pathname, search } = useLocation();
  const { liked, profileId, ownerId } = useEditorPicks();
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [saveError, setSaveError] = useState('');
  const to = pathname + search;
  const coverItem = items[0];
  const coverKey = `${to}:${coverItem?.id ?? coverItem?.title ?? ''}:${coverItem?.poster || coverItem?.image || ''}`;
  const [loadedCover, setLoadedCover] = useState(null);
  const cover = loadedCover?.key === coverKey
    ? loadedCover.url : getImagePath(coverItem?.poster || coverItem?.image || '');
  const descriptionText = plainText(description);
  const record = useMemo(() => ({ id: to, to, title, description: descriptionText, cover, firstItem: coverItem }),
    [to, title, descriptionText, cover, coverItem]);
  const isLiked = liked.some(item => item.id === to);

  const toggleLike = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setSaveError('');
    try { await saveEditorPick(profileId, record, 'like', ownerId); }
    catch { setSaveError('에디터 Pick을 저장하지 못했어요. 연결을 확인하고 다시 시도해주세요.'); }
    finally { busyRef.current = false; setBusy(false); }
  };
  const headingId = 'see-all-heading';

  return (
    <div className="see-all-page">
      <section className="see-all-page__inner" aria-labelledby={headingId}>
        <header className="see-all-page__heading">
          <div className="see-all-page__title-group">
            <h1 id={headingId}>{title}</h1>
            {description && <p>{description}</p>}
          </div>

          <button
            type="button"
            className={`see-all-page__like${isLiked ? ' is-active' : ''}`}
            aria-label={isLiked ? '페이지 좋아요 취소' : '페이지 좋아요'}
            aria-pressed={isLiked}
            disabled={busy || loading}
            onClick={toggleLike}
          >
            <Heart size={28} strokeWidth={1.5} fill={isLiked ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>
        </header>

        {saveError && <p className="see-all-page__message" role="status">{saveError}</p>}
        {loading ? (
          <p className="see-all-page__message" role="status">콘텐츠를 불러오는 중입니다.</p>
        ) : items.length ? (
          <ul className="see-all-page__grid" aria-label={`${title} 콘텐츠 목록`}>
            {items.map((item, index) => (
              <li key={`${item.id ?? item.tmdbId ?? item.title}-${index}`} className="see-all-page__grid-item">
                <ContentCard item={item} onPosterLoad={index === 0
                  ? url => setLoadedCover(previous => previous?.key === coverKey && previous.url === url
                    ? previous : { key: coverKey, url })
                  : undefined} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="see-all-page__message" role="status">등록된 콘텐츠가 없습니다.</p>
        )}
      </section>
    </div>
  );
};
