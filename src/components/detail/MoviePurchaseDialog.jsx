import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/pages/contents/MoviePurchaseDialog.scss';

export const MoviePurchaseDialog = ({ movie, onPurchase, onClose }) => {
  const dialog = useRef(null);
  const titleId = useId();
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const element = dialog.current;
    if (!element.open) element.showModal();
  }, []);

  const approvePurchase = (event) => {
    event.preventDefault();
    try {
      onPurchase();
      setCompleted(true);
    } catch {
      setError('구매 내역을 저장하지 못했어요. 로그인 상태와 브라우저 저장 공간을 확인해주세요.');
    }
  };

  return (
    <dialog ref={dialog} className="movie-purchase-dialog" aria-labelledby={titleId} onClose={onClose}>
      <h2 id={titleId}>{completed ? '영화 구매 완료' : '영화 개별구매'}</h2>
      {completed ? (
        <form method="dialog">
          <p>{movie.title} 가상결제가 완료됐어요.</p>
          <div className="movie-purchase-dialog__actions">
            <Link to="/mypage?tab=purchases">구매 콘텐츠 보기</Link>
            <button type="submit" autoFocus>확인</button>
          </div>
        </form>
      ) : (
        <form onSubmit={approvePurchase}>
          <p>시연용 결제이며 실제 청구는 발생하지 않아요.</p>
          <dl>
            <div><dt>영화</dt><dd>{movie.title}</dd></div>
            <div><dt>결제 금액</dt><dd>{movie.price.toLocaleString('ko-KR')}원</dd></div>
          </dl>
          {error && <p role="alert">{error}</p>}
          <div className="movie-purchase-dialog__actions">
            <button type="button" onClick={() => dialog.current.close()} autoFocus>취소</button>
            <button type="submit">가상결제 승인</button>
          </div>
        </form>
      )}
    </dialog>
  );
};
