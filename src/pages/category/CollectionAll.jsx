import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PosterGridPage } from '../../components/wavve/PosterGridPage';
import {
  discoverySections,
  additionalSections,
  getCategoryItems,
  loadAllDiscoveryItems,
} from '../../data/home/homeSeeAll';

// 메인 각 섹션의 '더보기' → /collection/:sectionId
// 홈과 동일한 카탈로그와 TMDB 캐시를 사용하므로 다른 작품이 섞이지 않습니다.
export const CollectionAll = () => {
  const { sectionId } = useParams();
  const discovery = discoverySections.find((section) => section.id === sectionId);
  const additional = additionalSections.find((section) => section.id === sectionId);
  const section = discovery ?? additional;

  const [remote, setRemote] = useState({ id: null, items: [] });

  useEffect(() => {
    if (!discovery) return;
    let active = true;
    loadAllDiscoveryItems(discovery).then((items) => {
      if (active) setRemote({ id: sectionId, items });
    });
    return () => { active = false; };
  }, [sectionId, discovery]);

  if (!section) {
    return (
      <div className="see-all-page see-all-page--missing">
        <p>요청한 더보기 섹션을 찾을 수 없습니다.</p>
        <Link to="/">메인으로 돌아가기</Link>
      </div>
    );
  }

  const isLoading = Boolean(discovery) && remote.id !== sectionId;
  const items = additional
    ? getCategoryItems(additional.category, additional.genres)
    : isLoading ? [] : remote.items;

return (
  <PosterGridPage
    key={sectionId}
    title={section.title}
    description={
      <>
        주요 Line-up이나 화제작들을
        <br />
        웨이브에서 만나보세요
      </>
    }
    items={items}
    loading={isLoading}
  />
);};
