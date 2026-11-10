const purchasePrefix = (uid) => `ott:demo-voucher:${encodeURIComponent(uid)}:`;

export function saveDemoVoucherPurchase({ uid, id, name, months, amount }) {
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
    id, name, months, amount, purchasedAt, expiresAt: expiresAt.getTime(),
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
