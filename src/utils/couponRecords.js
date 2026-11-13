import { couponCatalog } from "../data/couponData";
import { formatCoinDate } from "./coinRecords";

// 쿠폰 기록: 프로필별로 계정(Firestore)에 저장합니다. status 는 owned(보유) / used(이용) 입니다.
const MAX_RECORDS = 200;

export const normalizeCouponCode = (value) => typeof value === "string" ? value.trim().toUpperCase() : "";

// 등록 가능한 번호면 기록을 만들고, 아니면 null
export const createCouponRecord = (code, registeredAt = formatCoinDate(new Date())) => {
  code = normalizeCouponCode(code);
  const coupon = couponCatalog[code];
  return coupon
    ? { id: `coupon-${code}`, code, ...coupon, status: "owned", registeredAt, usedAt: "" }
    : null;
};

export const normalizeCouponRecords = (value) => {
  const saved = (Array.isArray(value) ? value : []).filter((item) => item
    && typeof item.id === "string" && item.id
    && typeof item.code === "string" && typeof item.name === "string"
    && typeof item.reason === "string" && typeof item.expiresAt === "string"
    && ["owned", "used"].includes(item.status));
  return [...new Map(saved.map((item) => [item.id, item])).values()]
    .map((item) => couponCatalog[item.code] ? { ...item, ...couponCatalog[item.code] } : item)
    .slice(0, MAX_RECORDS);
};

// 사용 처리 (보유 쿠폰만 변경)
export const markCouponUsed = (records, couponId, usedAt = formatCoinDate(new Date())) =>
  records.map((item) => (item.id === couponId && item.status === "owned"
    ? { ...item, status: "used", usedAt }
    : item));

// 보유 쿠폰 (쿠폰내역 · 마이페이지 공통)
export const getOwnedCoupons = (records = []) => records.filter((item) => item.status === "owned");

// 이용 쿠폰 (최근 사용순)
export const getUsedCoupons = (records = []) => records
  .filter((item) => item.status === "used")
  .sort((a, b) => String(b.usedAt).localeCompare(String(a.usedAt)));

export const isCouponValid = (coupon, now = new Date()) => {
  const today = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
  return Boolean(couponCatalog[coupon?.code] && coupon.expiresAt >= today);
};

// 쿠폰 사용과 효과를 같은 Firestore 트랜잭션에서 저장하기 위한 기록입니다.
export const createCouponBenefit = (coupon, profileId, now = new Date()) => {
  const benefit = couponCatalog[coupon?.code];
  if (!benefit || !isCouponValid({ ...coupon, ...benefit }, now)) throw new Error("사용 가능한 쿠폰이 아니에요.");
  const id = `coupon-${profileId}-${coupon.code}`;
  const expires = new Date(now);
  if (benefit.kind === "coin") {
    expires.setDate(expires.getDate() + 60);
    expires.setHours(23, 59, 0, 0);
    return { coin: {
      id, kind: "coupon", amount: benefit.amount, remaining: benefit.amount,
      name: benefit.name, reason: "쿠폰 등록",
      chargedAt: formatCoinDate(now), expiresAt: formatCoinDate(expires),
    } };
  }
  const day = expires.getDate();
  expires.setDate(1);
  expires.setMonth(expires.getMonth() + benefit.months);
  const lastDay = new Date(expires.getFullYear(), expires.getMonth() + 1, 0).getDate();
  expires.setDate(Math.min(day, lastDay));
  return { voucher: {
    id, planId: benefit.planId, name: benefit.voucherName, months: benefit.months,
    amount: 0, purchasedAt: now.getTime(), expiresAt: expires.getTime(), source: "coupon",
  } };
};

// 이전 버전에서 사용 표시만 남은 쿠폰은 실제 지급 기록을 확인해 복구합니다.
export const reconcileCouponBenefits = (records, coins = [], vouchers = [], profileId) =>
  normalizeCouponRecords(records).map((coupon) => {
    if (coupon.status !== "used" || coupon.benefitApplied || !couponCatalog[coupon.code]) return coupon;
    const benefitId = `coupon-${profileId}-${coupon.code}`;
    const entries = coupon.kind === "coin" ? coins : vouchers;
    const granted = (Array.isArray(entries) ? entries : []).some((entry) => entry?.id === benefitId);
    return granted ? { ...coupon, benefitApplied: true }
      : { ...coupon, status: "owned", usedAt: "" };
  });
