// 시연용 쿠폰 효과. 등록·사용 시 이 목록을 기준으로 검증합니다.
export const couponCatalog = {
  WAVVE2026COUPON: {
    name: "웨이브 스탠다드 한달 이용권 쿠폰", kind: "voucher",
    planId: "wavve-standard", voucherName: "스탠다드", months: 1,
    reason: "쿠폰 등록", expiresAt: "2027.02.28",
  },
  WAVVE2026A: {
    name: "티빙 더블 베이직 한달 이용권 쿠폰", kind: "voucher",
    planId: "double-basic", voucherName: "더블 베이직", months: 1,
    reason: "쿠폰 등록", expiresAt: "2027.02.28",
  },
  WAVVE2026B: {
    name: "5000 코인 쿠폰", kind: "coin", amount: 5000,
    reason: "쿠폰 등록", expiresAt: "2027.02.28",
  },
  WAVVE2026C: {
    name: "3000 코인 쿠폰", kind: "coin", amount: 3000,
    reason: "쿠폰 등록", expiresAt: "2027.02.28",
  },
};
