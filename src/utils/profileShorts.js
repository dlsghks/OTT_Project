import { useAuthStore } from "../store/useAuthStore";
import { useAccountStore, changeShortsRecord } from "../store/useAccountStore";
import {
  useProfileShorts as useGuestShorts,
  toggleShortsLike as toggleGuestLike,
  saveShortsHistory as saveGuestHistory,
} from "./guestProfileShorts";

export const useProfileShorts = () => {
  const user = useAuthStore((state) => state.user);
  const account = useAccountStore();
  const guest = useGuestShorts();
  if (!user) return { ...guest, ownerId: "guest" };
  const profile = account.profiles.find((p) => p.id === account.selectedProfileId);
  return {
    profile,
    likedIds: profile.likedIds,
    watchedIds: profile.watchedIds,
    ownerId: user.uid,
  };
};

const validateOwner = (ownerId) => {
  const uid = useAuthStore.getState().user?.uid || "guest";
  if (uid !== ownerId) throw new Error("계정이 변경됐어요. 다시 시도해주세요.");
  return uid;
};

export const toggleShortsLike = async (profileId, id, ownerId) => {
  const uid = validateOwner(ownerId);
  if (uid === "guest") return toggleGuestLike(profileId, id);
  return changeShortsRecord(profileId, id, "like", uid);
};

export const saveShortsHistory = async (profileId, id, ownerId) => {
  const uid = validateOwner(ownerId);
  if (uid === "guest") return saveGuestHistory(profileId, id);
  return changeShortsRecord(profileId, id, "history", uid);
};
