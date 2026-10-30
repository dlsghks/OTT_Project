import { ContentCard } from '../home/ContentCard';

// 전체 보기: 콘텐츠 그리드
export const CollectionRow = ({ title, items = [] }) => {
  return (
    <section className="category-row collection-row">
      <div className="category-row__header">
        <div className="category-row__title">
          <h2>{title}</h2>
        </div>
      </div>

      {items.length ? (
        <ul className="collection-row__grid">
          {items.map((item) => (
            <li key={item.id}>
              <ContentCard item={item} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="collection-row__empty">해당하는 콘텐츠가 없습니다.</p>
      )}
    </section>
  );
};
