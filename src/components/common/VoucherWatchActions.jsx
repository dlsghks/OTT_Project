import '../../styles/components/common/VoucherWatchActions.scss';

export const VoucherWatchActions = ({ onPurchase }) => (
  <div className="voucher-watch-actions">
    <button type="button" className="voucher-watch-actions__button voucher-watch-actions__button--purchase" onClick={onPurchase}>
      이용권 구매하기
    </button>
  </div>
);
