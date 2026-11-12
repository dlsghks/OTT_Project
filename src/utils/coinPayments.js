import { voucherGroups } from "../data/voucherData";
import { getIndividualPurchaseContent } from "../data/individualPurchaseMovies";
import { formatCoinDate, getCoinTotal } from "./coinRecords";

export const deductPurchaseCoins = (records, amount, now = formatCoinDate(new Date())) => {
  if (!Number.isSafeInteger(amount) || amount <= 0 || getCoinTotal(records, now) < amount) {
    throw new Error("보유 코인이 부족합니다. 코인 잔액을 다시 확인해주세요.");
  }
  let remaining = amount;
  const deductions = new Map();
  [...records].filter((item) => item.expiresAt > now && item.remaining > 0)
    .sort((a, b) => a.expiresAt.localeCompare(b.expiresAt))
    .forEach((item) => {
      const used = Math.min(item.remaining, remaining);
      deductions.set(item.id, used);
      remaining -= used;
    });
  return records.map((item) => ({ ...item, remaining: item.remaining - (deductions.get(item.id) || 0) }));
};

export const createCoinPurchase = (type, purchase, coinsUsed, id, now = new Date()) => {
  if (!/^[0-9a-f-]{36}$/.test(id || "")) throw new Error("결제 정보를 다시 확인해주세요.");
  let originalAmount, item;
  if (type === "voucher") {
    const plan = voucherGroups.wavve.plans.find((entry) => entry.id === purchase.planId);
    if (!plan || ![1, 12].includes(purchase.months)) throw new Error("웨이브 단독 이용권만 코인을 사용할 수 있어요.");
    originalAmount = purchase.months === 12 ? plan.annual : plan.monthly;
    const expires = new Date(now);
    const day = expires.getDate();
    expires.setDate(1);
    expires.setMonth(expires.getMonth() + purchase.months);
    expires.setDate(Math.min(day, new Date(expires.getFullYear(), expires.getMonth() + 1, 0).getDate()));
    item = { id, planId: plan.id, name: plan.name, months: purchase.months,
      purchasedAt: now.getTime(), expiresAt: expires.getTime() };
  } else if (type === "content") {
    const offer = getIndividualPurchaseContent(purchase.tmdbId, purchase, purchase.kind);
    if (!offer) throw new Error("개별구매 콘텐츠를 확인해주세요.");
    originalAmount = offer.price;
    item = { ...offer, image: typeof purchase.image === "string" ? purchase.image : "" };
  } else {
    throw new Error("결제 대상을 확인해주세요.");
  }
  if (!Number.isSafeInteger(originalAmount) || originalAmount <= 0
      || !Number.isSafeInteger(coinsUsed) || coinsUsed <= 0 || coinsUsed > originalAmount) {
    throw new Error("사용할 코인 금액을 다시 확인해주세요.");
  }
  return { id, type, purchase: { ...item, amount: originalAmount - coinsUsed, coinsUsed },
    coinsUsed, originalAmount, amount: originalAmount - coinsUsed, purchasedAt: now.getTime() };
};


// 기존 결제도 표시하며, 이전 기록의 잔액은 남아 있는 적립/사용 기록을 시간순으로 재계산합니다.
export const getCoinUsageRecords = (purchases = [], profileId, records = []) => {
  const payments = purchases.filter(entry => entry?.profileId === profileId
    && Number.isSafeInteger(entry.coinsUsed) && entry.coinsUsed > 0
    && Number.isFinite(entry.purchasedAt) && entry.purchase)
    .sort((a, b) => a.purchasedAt - b.purchasedAt);
  let balances = records.map(record => ({ ...record, remaining: record.amount }));
  let completeHistory = true;
  return payments.map(payment => {
    const usedAt = formatCoinDate(new Date(payment.purchasedAt));
    const available = balances.filter(record => record.chargedAt <= usedAt);
    let balanceAfter = null;
    try {
      const deducted = deductPurchaseCoins(available, payment.coinsUsed, usedAt);
      const byId = new Map(deducted.map(record => [record.id, record]));
      balances = balances.map(record => byId.get(record.id) ?? record);
      if (completeHistory) balanceAfter = getCoinTotal(deducted, usedAt);
    } catch {
      completeHistory = false;
    }
    return {
      id: payment.id,
      name: payment.type === "voucher"
        ? `${payment.purchase.name} ${payment.purchase.months}개월 이용권 구매`
        : `${payment.purchase.title} 개별구매`,
      amount: payment.coinsUsed,
      balanceAfter: Number.isSafeInteger(payment.balanceAfter) && payment.balanceAfter >= 0
        ? payment.balanceAfter : balanceAfter,
      usedAt,
      purchasedAt: payment.purchasedAt,
    };
  }).reverse();
};
