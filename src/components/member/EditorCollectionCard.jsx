import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { findEditorCollection } from '../../data/editorCollections';
import { getTmdbPoster } from '../../services/tmdb';
import { getImagePath } from '../../utils/imagePath';

export const EditorCollectionCard = ({ collection, variant = "default" }) => {
  const definition = useMemo(() => findEditorCollection(collection.to), [collection.to]);
  const [art, setArt] = useState(null);
  const firstItem = useRef(null);
  const attemptedFallback = useRef(false);
  const source = JSON.stringify(collection.firstItem ?? null);
  useEffect(() => {
    let active = true;
    attemptedFallback.current = false;
    setArt(null);
    const resolve = async () => {
      const items = collection.firstItem ? [collection.firstItem]
        : definition?.loadItems ? await definition.loadItems() : definition?.items ?? [];
      const item = items[0];
      if (!active) return;
      firstItem.current = item;
      const poster = item ? await getTmdbPoster(item) : collection.cover;
      if (active) setArt({ url: poster ? getImagePath(poster) : '', failed: false });
    };
    resolve().catch(() => { if (active) setArt({ url: '', failed: true }); });
    return () => { active = false; };
  }, [collection.to, collection.cover, source, definition]);
  const title = definition?.title || collection.title;
  const retryPoster = async () => {
    if (attemptedFallback.current || !firstItem.current) {
      setArt({ url: '', failed: true }); return;
    }
    attemptedFallback.current = true;
    const poster = await getTmdbPoster(firstItem.current, { skipLocal: true }).catch(() => null);
    setArt({ url: poster || '', failed: !poster });
  };
  if (variant === "poster") {
    return (
      <Link className="mypage__content-card" to={collection.to} aria-label={`${title} 에디터 Pick 열기`}>
        <div className="mypage__poster-frame">
          {art?.url ? (
            <img className="mypage__poster" src={art.url} alt={title}
              loading="lazy" onError={retryPoster} />
          ) : (
            <div className="mypage__collection-poster-status" role="status">
              {title}
            </div>
          )}
        </div>
      </Link>
    );
  }
  return (
    <Link className="mypage__editor-card" to={collection.to} aria-label={`${title} 에디터 Pick 열기`}>
      {art?.url && <>
        <img className="mypage__editor-backdrop" src={art.url} alt="" loading="lazy" />
        <img className="mypage__editor-poster" src={art.url} alt="" loading="lazy" onError={retryPoster} />
      </>}
      {!art?.url && <div className="mypage__editor-art-status" role="status">
        {art ? '포스터를 불러오지 못했어요' : '포스터 불러오는 중'}
      </div>}
      <div className="mypage__editor-copy">
        <h4>{title}</h4>
        {collection.description && <p>{collection.description}</p>}
      </div>
    </Link>
  );
};
