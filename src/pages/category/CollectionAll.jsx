import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PosterGridPage } from '../../components/wavve/PosterGridPage';
import { findEditorCollection } from '../../data/editorCollections';

export const CollectionAll = () => {
  const { pathname, search } = useLocation();
  const to = pathname + search;
  const section = useMemo(() => findEditorCollection(to), [to]);
  const [remote, setRemote] = useState({ to: '', items: [] });
  useEffect(() => {
    if (!section?.loadItems) return;
    let active = true;
    section.loadItems().then(items => { if (active) setRemote({ to, items }); })
      .catch(() => { if (active) setRemote({ to, items: [] }); });
    return () => { active = false; };
  }, [section, to]);
  if (!section) return <div className="see-all-page see-all-page--missing">
    <p>요청한 더보기 섹션을 찾을 수 없습니다.</p><Link to="/">메인으로 돌아가기</Link>
  </div>;
  const loading = Boolean(section.loadItems) && remote.to !== to;
  return <PosterGridPage key={to} title={section.title}
    description={<>주요 Line-up이나 화제작들을<br />웨이브에서 만나보세요</>}
    items={section.items ?? (loading ? [] : remote.items)} loading={loading} />;
};
