import { useCallback, useSyncExternalStore } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { changeContentFavorite, removeLibraryRecord } from '../store/useAccountStore';
import { useProfileShorts } from './profileShorts';
import { normalizeContentFavorites, toggleContentFavorite } from './contentFavoriteRecords';

const PREFIX = 'wavve-content-favorites:';
const EVENT = 'wavve-content-favorites-change';
const read = profileId => {
  try { return normalizeContentFavorites(JSON.parse(localStorage.getItem(PREFIX + profileId) || '[]')); }
  catch { return []; }
};
const subscribe = refresh => {
  const onStorage = event => { if (!event.key || event.key.startsWith(PREFIX)) refresh(); };
  window.addEventListener('storage', onStorage);
  window.addEventListener(EVENT, refresh);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(EVENT, refresh);
  };
};
export const useProfileFavorites = () => {
  const { profile, ownerId } = useProfileShorts();
  const getSnapshot = useCallback(() => JSON.stringify(read(profile.id)), [profile.id]);
  const guest = JSON.parse(useSyncExternalStore(subscribe, getSnapshot, () => '[]'));
  return { profileId: profile.id, ownerId,
    favorites: ownerId === 'guest' ? guest : normalizeContentFavorites(profile.likedContents) };
};
export const saveContentFavorite = async (profileId, item, ownerId, { remove = false } = {}) => {
  const uid = useAuthStore.getState().user?.uid || 'guest';
  if (uid !== ownerId) throw new Error('계정이 변경됐어요. 다시 시도해주세요.');
  if (uid !== "guest") {
    return remove
      ? removeLibraryRecord(profileId, "likedContents", item.id, ownerId)
      : changeContentFavorite(profileId, item, uid);
  }
  let active;
  try { active = JSON.parse(localStorage.getItem('wavve-active-profile') || '{}'); }
  catch { active = {}; }
  if ((active.id || 'profile1') !== profileId) throw new Error('프로필이 변경됐어요. 다시 시도해주세요.');
  const previous = read(profileId);
  const records = remove
    ? previous.filter((record) => record.id !== item.id)
    : toggleContentFavorite(previous, item);
  localStorage.setItem(PREFIX + profileId, JSON.stringify(records));
  window.dispatchEvent(new Event(EVENT));
};
