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
}

export function getDemoVoucherPurchases(uid) {
  if (!uid) return [];

  try {
    const prefix = purchasePrefix(uid);
    return Object.keys(localStorage)
      .filter((key) => key.startsWith(prefix))
      .flatMap((key) => {
        try {
          const purchase = JSON.parse(localStorage.getItem(key));
          return purchase ? [purchase] : [];
        } catch {
          return [];
        }
      })
      .sort((a, b) => b.purchasedAt - a.purchasedAt);
  } catch {
    return [];
  }
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
