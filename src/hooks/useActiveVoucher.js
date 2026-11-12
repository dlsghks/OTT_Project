import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { getActiveDemoVoucher, getDemoVoucherPurchases } from '../utils/demoVoucherPurchases';

const CHANGE_EVENT = 'ott:voucher-updated';
const subscribe = (refresh) => {
  window.addEventListener(CHANGE_EVENT, refresh);
  window.addEventListener('storage', refresh);
  window.addEventListener('focus', refresh);
  return () => {
    window.removeEventListener(CHANGE_EVENT, refresh);
    window.removeEventListener('storage', refresh);
    window.removeEventListener('focus', refresh);
  };
};

export const useActiveVoucher = () => {
  const uid = useAuthStore((state) => state.user?.uid);
  const getSnapshot = useCallback(() => JSON.stringify(
    getActiveDemoVoucher(getDemoVoucherPurchases(uid)),
  ), [uid]);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => 'null');
  const voucher = JSON.parse(snapshot);
  const expiresAt = voucher?.expiresAt;

  useEffect(() => {
    if (!expiresAt) return;
    let timer;
    const refreshAtExpiry = () => {
      const remaining = expiresAt - Date.now() + 1;
      if (remaining <= 0) {
        window.dispatchEvent(new Event(CHANGE_EVENT));
        return;
      }
      timer = setTimeout(refreshAtExpiry, Math.min(remaining, 2147483647));
    };
    refreshAtExpiry();
    return () => clearTimeout(timer);
  }, [expiresAt]);

  return voucher;
};
