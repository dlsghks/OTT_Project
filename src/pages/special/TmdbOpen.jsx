import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';

import { findTmdbDetailPath } from '../../services/tmdbFind';
import { DetailMessage } from '../../components/detail/DetailMessage';

import '../../styles/pages/TotalSubDetail.scss';

// 스페셜 페이지 콘텐츠 클릭 → TMDB id 확인 → 상세 페이지로 이동 (/open?title=...&kind=movie|multi)
export const TmdbOpen = () => {
  const [params] = useSearchParams();
  const title = params.get('title') ?? '';
  const kind = params.get('kind') ?? 'multi';

  return <TmdbOpenBody key={`${kind}:${title}`} title={title} kind={kind} />;
};

const TmdbOpenBody = ({ title, kind }) => {
  // null: 찾는 중 · string: 상세 경로 · false: 찾지 못함
  const [path, setPath] = useState(null);

  useEffect(() => {
    let cancelled = false;

    findTmdbDetailPath(title, kind).then((result) => {
      if (!cancelled) setPath(result || false);
    });

    return () => {
      cancelled = true;
    };
  }, [title, kind]);

  if (path) return <Navigate to={path} replace />;

  if (path === false) {
    return <DetailMessage message={`'${title}' 작품 정보를 찾을 수 없습니다.`} backLink="/" backLabel="홈으로 돌아가기" />;
  }

  return <DetailMessage message="작품 정보를 불러오는 중이에요…" />;
};
