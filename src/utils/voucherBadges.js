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

export function getVoucherBadge(voucher) {
  if (!voucher) return null;
  if (badgeByPlan[voucher.planId]) return badgeByPlan[voucher.planId];
  const name = voucher.name?.replace(/\s*\(가상결제\)\s*$/, '').trim();
  const plan = Object.values(voucherGroups)
    .flatMap((group) => group.plans)
    .find((entry) => entry.name === name);
  return plan ? badgeByPlan[plan.id] ?? null : null;
}
