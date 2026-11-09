import { couponCatalog } from "../data/couponData";
import { formatCoinDate } from "./coinRecords";

// 쿠폰 기록: 프로필별로 계정(Firestore)에 저장합니다. status 는 owned(보유) / used(이용) 입니다.
const MAX_RECORDS = 200;

export const normalizeCouponCode = (value) => value.trim().toUpperCase();

// 등록 가능한 번호면 기록을 만들고, 아니면 null
export const createCouponRecord = (code, registeredAt = formatCoinDate(new Date())) => {
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
  return [...new Map(saved.map((item) => [item.id, item])).values()].slice(0, MAX_RECORDS);
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
