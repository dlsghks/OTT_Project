import { useCallback, useSyncExternalStore } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { saveWatchHistoryRecord, removeLibraryRecord } from "../store/useAccountStore";
import { useProfileShorts } from "./profileShorts";
import { normalizeWatchHistory, updateWatchHistory } from "./watchHistoryRecords";

const PREFIX = "wavve-watch-history:";
const EVENT = "wavve-watch-history-change";
const readGuest = (profileId) => {
  try { return normalizeWatchHistory(JSON.parse(localStorage.getItem(PREFIX + profileId) || "[]")); }
  catch { return []; }
};
const subscribe = (refresh) => {
  const onStorage = (event) => { if (!event.key || event.key.startsWith(PREFIX)) refresh(); };
  window.addEventListener("storage", onStorage);
  window.addEventListener(EVENT, refresh);
  return () => { window.removeEventListener("storage", onStorage); window.removeEventListener(EVENT, refresh); };
};
export const useProfileWatchHistory = () => {
  const { profile, ownerId } = useProfileShorts();
  const getSnapshot = useCallback(() => JSON.stringify(readGuest(profile.id)), [profile.id]);
  const guest = JSON.parse(useSyncExternalStore(subscribe, getSnapshot, () => "[]"));
  return { profileId: profile.id, ownerId,
    history: ownerId === "guest" ? guest : normalizeWatchHistory(profile.watchHistory) };
};
export const saveProfileWatchHistory = async (profileId, item, ownerId, { remove = false } = {}) => {
  const uid = useAuthStore.getState().user?.uid || "guest";
  if (uid !== ownerId) throw new Error("계정이 변경됐어요. 다시 재생해주세요.");
  if (uid !== "guest") {
    return remove
      ? removeLibraryRecord(profileId, "watchHistory", item.id, ownerId)
      : saveWatchHistoryRecord(profileId, item, uid);
  }
  let active;
  try { active = JSON.parse(localStorage.getItem("wavve-active-profile") || "{}"); }
  catch { active = {}; }
  if ((active?.id || "profile1") !== profileId) throw new Error("프로필이 변경됐어요. 다시 재생해주세요.");
  const previous = readGuest(profileId);
  const records = remove
    ? previous.filter((record) => record.id !== item.id)
    : updateWatchHistory(previous, item);
  localStorage.setItem(PREFIX + profileId, JSON.stringify(records));
  window.dispatchEvent(new Event(EVENT));
};
