import { useAccountStore } from "../store/useAccountStore";
import { voucherGroups } from "../data/voucherData.js";

const purchasePrefix = (uid) => `ott:demo-voucher:${encodeURIComponent(uid)}:`;

export function saveDemoVoucherPurchase({ uid, id, planId, name, months, amount }) {
  const key = `${purchasePrefix(uid)}${id}`;
  if (localStorage.getItem(key) !== null) return;

  const purchasedAt = Date.now();
  const expiresAt = new Date(purchasedAt);
  const day = expiresAt.getDate();
  expiresAt.setDate(1);
  expiresAt.setMonth(expiresAt.getMonth() + months);
  const lastDay = new Date(expiresAt.getFullYear(), expiresAt.getMonth() + 1, 0).getDate();
  expiresAt.setDate(Math.min(day, lastDay));

  localStorage.setItem(key, JSON.stringify({
    id, planId, name, months, amount, purchasedAt, expiresAt: expiresAt.getTime(),
  }));
  window.dispatchEvent(new Event('ott:voucher-updated'));
}

export function getDemoVoucherPurchases(uid) {
  if (!uid) return [];
  const account = useAccountStore.getState();
  const couponPurchases = account.uid === uid ? account.couponVoucherPurchases ?? [] : [];
  let localPurchases = [];
  try {
    const prefix = purchasePrefix(uid);
    localPurchases = Object.keys(localStorage)
      .filter((key) => key.startsWith(prefix))
      .flatMap((key) => {
        try {
          const purchase = JSON.parse(localStorage.getItem(key));
          return purchase ? [purchase] : [];
        } catch {
          return [];
        }
      });
  } catch {
    // Firestore에 저장된 쿠폰 이용권은 브라우저 저장 공간과 관계없이 사용할 수 있습니다.
  }
  const coinPurchases = account.uid === uid ? (account.coinPurchases ?? [])
    .filter((entry) => entry.type === "voucher").map((entry) => entry.purchase) : [];
  return [...couponPurchases, ...coinPurchases, ...localPurchases]
    .sort((a, b) => b.purchasedAt - a.purchasedAt);
}

export function getDemoVoucherPurchasesInPeriod(purchases, months, now) {
  // 결제 표시와 같은 한국시간 기준으로 월말은 대상 월의 마지막 날에 맞춥니다.
  const koreaOffset = 9 * 60 * 60 * 1000;
  const from = new Date(now + koreaOffset);
  const day = from.getUTCDate();
  from.setUTCDate(1);
  from.setUTCMonth(from.getUTCMonth() - months);
  const lastDay = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 0)).getUTCDate();
  from.setUTCDate(Math.min(day, lastDay));
  const start = from.getTime() - koreaOffset;
  return purchases.filter(({ purchasedAt }) => purchasedAt >= start && purchasedAt <= now);
}

// 변경된 이용권은 직전 이용권을 대체합니다. 구매 이력은 그대로 보관합니다.
export function getActiveDemoVoucher(purchases, now = Date.now()) {
  const latest = purchases[0];
  return latest?.expiresAt > now ? latest : null;
}

export function getDemoVoucherSelection(purchase) {
  if (!purchase) return null;

  for (const [tabId, group] of Object.entries(voucherGroups)) {
    const plan = group.plans.find((entry) => purchase.planId
      ? entry.id === purchase.planId
      : entry.name === purchase.name);
    if (plan) {
      return { tabId, planId: plan.id, billing: purchase.months === 12 && plan.annual ? "annual" : "monthly" };
    }
  }

  return null;
}
