import { Link } from 'react-router-dom';

// 상세 페이지 불러오는 중 / 찾을 수 없음 안내
export const DetailMessage = ({ message, backLink, backLabel }) => {
  return (
    <div className="movie-detail movie-detail--empty">
      {backLink ? (
        <>
          <h2>{message}</h2>
          <Link to={backLink}>{backLabel}</Link>
        </>
      ) : (
        <p role="status">{message}</p>
      )}
    </div>
  );
};
