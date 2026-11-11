import { voucherGroups } from '../data/voucherData.js';

const badgeByPlan = {
  'wavve-ad': 'blurb.png',
  'wavve-basic': 'basic.png',
  'wavve-standard': 'standard.png',
  'wavve-premium': 'premium.png',
  'double-ad': 'blurb-T.png',
  'double-slim': 'basic-T.png',
  'double-basic': 'basic-T.png',
  'double-standard': 'standard-T.png',
  'double-premium': 'premium-T.png',
  melon: 'melon.png',
  flo: 'flo.png',
  bugs: 'bugs.png',
};

const englishNameByPlan = {
  'wavve-ad': 'Ad-supported Standard',
  'wavve-basic': 'Basic',
  'wavve-standard': 'Standard',
  'wavve-premium': 'Premium',
  'double-ad': 'Double Ad-supported Standard',
  'double-slim': 'Double Slim',
  'double-basic': 'Double Basic',
  'double-standard': 'Double Standard',
  'double-premium': 'Double Premium',
  melon: 'Wavve × Melon Play Pass',
  flo: 'Basic × FLO Unlimited',
  bugs: 'Basic × Bugs Streaming',
};

function getPlanId(voucher) {
  if (!voucher) return null;
  if (badgeByPlan[voucher.planId]) return voucher.planId;
  const name = voucher.name?.replace(/\s*\(가상결제\)\s*$/, '').trim();
  return Object.values(voucherGroups)
    .flatMap((group) => group.plans)
    .find((entry) => entry.name === name)?.id ?? null;
}

export function getVoucherBadge(voucher) {
  return badgeByPlan[getPlanId(voucher)] ?? null;
}

export function getVoucherEnglishName(voucher) {
  return englishNameByPlan[getPlanId(voucher)] ?? '';
}
