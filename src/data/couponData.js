// 등록 가능한 쿠폰번호 샘플 (실제 발급 서버가 생기면 교체)
const standardCoupon = {
  name: "[11번가 그랜드십일절] Standard 12개월",
  reason: "—",
  expiresAt: "2027.02.28",
};

export const couponCatalog = {
  WAVVE2026COUPON: standardCoupon,
  WAVVE2026A: standardCoupon,
  WAVVE2026B: standardCoupon,
  WAVVE2026C: standardCoupon,
};
