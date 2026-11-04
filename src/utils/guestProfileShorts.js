import { useSyncExternalStore } from "react";

const PROFILE_KEY = "wavve-active-profile";
const CHANGE_EVENT = "wavve-profile-shorts-change";
const LIKE_PREFIX = "wavve-shorts-liked:";
const HISTORY_PREFIX = "wavve-shorts-history:";

const readJSON = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
};

const readProfile = () => {
  const saved = readJSON(PROFILE_KEY, null);
  return {
    id: typeof saved?.id === "string" && saved.id.trim()
      ? saved.id.trim() : "profile1",
    name: typeof saved?.name === "string" ? saved.name.trim() : "",
    image: typeof saved?.image === "string" ? saved.image.trim() : "",
  };
};

const readIds = (key) => {
  const saved = readJSON(key, []);
  return Array.isArray(saved)
    ? [...new Set(saved.filter((id) => typeof id === "string" && id))]
    : [];
};

// 문자열 스냅샷을 사용해 내용이 같으면 React가 다시 갱신하지 않습니다.
const getSnapshot = () => {
  const profile = readProfile();
  return JSON.stringify({
    profile,
    likedIds: readIds(`${LIKE_PREFIX}${profile.id}`),
    watchedIds: readIds(`${HISTORY_PREFIX}${profile.id}`),
  });
};

const subscribe = (refresh) => {
  const handleStorage = (event) => {
    if (
      event.key === null || event.key === PROFILE_KEY ||
      event.key?.startsWith(LIKE_PREFIX) ||
      event.key?.startsWith(HISTORY_PREFIX)
    ) refresh();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener("focus", refresh);
  window.addEventListener(CHANGE_EVENT, refresh);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("focus", refresh);
    window.removeEventListener(CHANGE_EVENT, refresh);
  };
};

const writeIds = (key, ids) => {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
};

export const toggleShortsLike = (profileId, id) => {
  // 프로필 전환 직전 화면에서 발생한 클릭으로 다른 기록을 바꾸지 않습니다.
  if (readProfile().id !== profileId || !id) return false;
  const key = `${LIKE_PREFIX}${profileId}`;
  const saved = readIds(key);
  return writeIds(key, saved.includes(id)
    ? saved.filter((savedId) => savedId !== id)
    : [...saved, id]);
};

export const saveShortsHistory = (profileId, id) => {
  // 이전 프로필에서 시작된 타이머가 새 프로필에 기록하지 않도록 확인합니다.
  if (readProfile().id !== profileId || !id) return false;
  const key = `${HISTORY_PREFIX}${profileId}`;
  return writeIds(key, [...new Set([id, ...readIds(key)])].slice(0, 100));
};

export const useProfileShorts = () => {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot);
  return JSON.parse(snapshot);
};
