import { useEffect, useId, useRef, useState } from 'react';
import { auth } from '../../firebase/firebase';
import { saveCoinPurchase, useAccountStore } from '../../store/useAccountStore';
import { getCoinTotal } from '../../utils/coinRecords';
import { Link } from 'react-router-dom';
import '../../styles/pages/contents/MoviePurchaseDialog.scss';
import '../../styles/components/common/CoinPayment.scss';

export const MoviePurchaseDialog = ({ movie, image = "", onPurchase, onClose }) => {
  const contentLabel = movie.kind === 'program' ? '프로그램' : '영화';
  const dialog = useRef(null);
  const titleId = useId();
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');
  const account = useAccountStore();
  const owner = useRef({ uid: account.uid, profileId: account.selectedProfileId });
  const requestId = useRef(crypto.randomUUID());
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [useCoins, setUseCoins] = useState(false);
  const [paid, setPaid] = useState(null);
  const profile = account.profiles.find((entry) => entry.id === owner.current.profileId);
  const coinBalance = getCoinTotal(profile?.coinRecords ?? []);
  const coinsUsed = useCoins ? Math.min(coinBalance, movie.price) : 0;

  useEffect(() => {
    const element = dialog.current;
    if (!element.open) element.showModal();
  }, []);

  const approvePurchase = async (event) => {
    event.preventDefault();
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError('');
    try {
      const { uid, profileId } = owner.current;
      if (auth.currentUser?.uid !== uid || account.uid !== uid || account.selectedProfileId !== profileId) {
        throw new Error('계정 또는 프로필이 변경됐어요. 구매 팝업을 다시 열어주세요.');
      }
      if (coinsUsed > 0) {
        const result = await saveCoinPurchase(profileId, 'content', { ...movie, image }, coinsUsed, requestId.current, uid);
        setPaid({ coins: result.coinsUsed, amount: result.amount });
      } else {
        await onPurchase();
        setPaid({ coins: 0, amount: movie.price });
      }
      setCompleted(true);
    } catch (error) {
      setError(error.message || '구매하지 못했어요. 다시 시도해주세요.');
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  return (
    <dialog ref={dialog} className="movie-purchase-dialog" aria-labelledby={titleId} onClose={onClose} onCancel={(event) => { if (busyRef.current) event.preventDefault(); }}>
      <h2 id={titleId}>{`${contentLabel} ${completed ? '구매 완료' : '개별구매'}`}</h2>
      {completed ? (
        <form method="dialog">
          <p>{movie.title} 가상결제가 완료됐어요.</p>
          {paid && <p>사용 코인 {paid.coins.toLocaleString("ko-KR")}코인 · 결제 금액 {paid.amount.toLocaleString("ko-KR")}원</p>}
          <div className="movie-purchase-dialog__actions">
            <Link to="/mypage?tab=purchases">구매 콘텐츠 보기</Link>
            <button type="submit" autoFocus>확인</button>
          </div>
        </form>
      ) : (
        <form onSubmit={approvePurchase}>
          <p>시연용 결제이며 실제 청구는 발생하지 않아요.</p>
          <dl>
            <div><dt>{contentLabel}</dt><dd>{movie.title}</dd></div>
            <div><dt>결제 금액</dt><dd>{movie.price.toLocaleString('ko-KR')}원</dd></div>
          </dl>
          <label className="purchase-coins">
            <input type="checkbox" checked={useCoins} disabled={busy || coinBalance <= 0}
              onChange={(event) => setUseCoins(event.target.checked)} />
            보유 코인 사용 ({coinBalance.toLocaleString('ko-KR')}코인)
          </label>
          <dl>
            <div><dt>사용 코인</dt><dd>{coinsUsed.toLocaleString('ko-KR')}코인</dd></div>
            <div><dt>최종 결제 금액</dt><dd>{(movie.price - coinsUsed).toLocaleString('ko-KR')}원</dd></div>
          </dl>
          {error && <p role="alert">{error}</p>}
          <div className="movie-purchase-dialog__actions">
            <button type="button" disabled={busy} onClick={() => dialog.current.close()} autoFocus>취소</button>
            <button type="submit" disabled={busy}>{busy ? "결제 중…" : "가상결제 승인"}</button>
          </div>
        </form>
      )}
    </dialog>
  );
};
