import { useState } from 'react';
import { liveChannelAssets } from '../data/live/liveChannelAssets';
import { getImagePath } from '../utils/imagePath';

// YouTube 제목의 문자 코드만 변환합니다. HTML 태그로 렌더링하지 않습니다.
export const formatLiveTitle = (value = '') => {
  const named = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
  let text = String(value ?? '');
  // &amp;#39;처럼 이중으로 인코딩된 제목도 처리합니다.
  for (let pass = 0; pass < 2; pass += 1) {
    text = text.replace(/&(#(?:x[0-9a-f]+|[0-9]+)|amp|quot|apos|lt|gt|nbsp);/gi, (entity, code) => {
      if (code[0] !== '#') return named[code.toLowerCase()] ?? entity;
      const hex = code[1]?.toLowerCase() === 'x';
      const point = Number.parseInt(code.slice(hex ? 2 : 1), hex ? 16 : 10);
      if (point <= 0 || point > 0x10ffff || (point >= 0xd800 && point <= 0xdfff)) return entity;
      return String.fromCodePoint(point);
    });
  }
  return text.replace(/^\s*\[[^\]]*\]\s*/, '');
};

// 방송 사진 로딩에 실패해도 같은 채널의 로고로 돌아갑니다.
export const useLiveArtwork = (program, liveVideo) => {
  const [failedImages, setFailedImages] = useState([]);
  const brand = liveChannelAssets[program.channel];
  const liveImage = getImagePath(liveVideo?.thumbnail || '');
  const candidates = [liveImage, program.fallbackImage, program.image]
    .filter(Boolean)
    .map(getImagePath);
  const image = candidates.find((src) => !failedImages.includes(src)) || '';
  const logo = program.logo || brand?.logo || '';
  const rawTitle = image
    ? (image === liveImage ? liveVideo?.title || program.title : program.title)
    : '';
  // 제목 맨 앞의 대괄호 문구 하나만 제거합니다. 본문 대괄호는 유지합니다.
  const title = formatLiveTitle(rawTitle);
  const failImage = () => {
    if (!image) return;
    setFailedImages((previous) => previous.includes(image) ? previous : [...previous, image]);
  };
  return { image, logo, title, failImage };
};
