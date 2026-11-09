import { getInfoRows } from '../../services/tmdbDetail';

// 펼치기 상세 정보 목록 (개요 · 장르 · 감독 · 작가) — 예능~해외시리즈 상세 · 레트로브 상세 공통
// - rows: [{ label, value }] (값이 빈 행은 숨김 · getInfoRows)
// - className: 페이지별 디자인 클래스 (행은 `${className}__row`)
export const DetailInfo = ({ rows = [], className = 'detail-info' }) => (
  <dl className={className}>
    {getInfoRows(rows).map((row) => (
      <div key={row.label} className={`${className}__row`}>
        <dt>{row.label}:</dt>
        <dd>{row.value}</dd>
      </div>
    ))}
  </dl>
);
