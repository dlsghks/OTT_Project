// src/utils/imagePath.js

export const getImagePath = (path) => {
  if (!path || typeof path !== "string") return "";

  // 외부 URL 및 특수 이미지 경로는 그대로 사용
  if (/^(https?:)?\/\//.test(path) || /^(data:|blob:)/.test(path)) {
    return path;
  }

  // Vite의 배포 기본 경로
  const base = import.meta.env.BASE_URL;

  // 이미 base가 적용된 경로라면 중복 적용 방지
  if (path.startsWith(base)) {
    return path;
  }

  // public/images 경로만 변환
  if (path.startsWith("/images/")) {
    return `${base}${path.slice(1)}`;
  }

  // 나머지는 기존 경로 유지
  return path;
};