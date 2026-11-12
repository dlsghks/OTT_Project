import { useCallback, useSyncExternalStore } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { changeEditorPickRecord, removeLibraryRecord } from '../store/useAccountStore';
import { useProfileShorts } from './profileShorts';
import { normalizeEditorPicks, updateEditorPicks, refreshEditorPick } from './editorPickRecords';

const PREFIX = 'wavve-editor-picks:';
const CHANGE_EVENT = 'wavve-editor-picks-change';
const keyFor = (profileId) => `${PREFIX}${profileId}`;
const readGuest = (profileId) => {
  try {
    const value = JSON.parse(localStorage.getItem(keyFor(profileId)) || '{}');
    return { liked: normalizeEditorPicks(value.liked), viewed: normalizeEditorPicks(value.viewed) };
  } catch { return { liked: [], viewed: [] }; }
};
const subscribe = (refresh) => {
  const onStorage = event => { if (!event.key || event.key.startsWith(PREFIX)) refresh(); };
  window.addEventListener('storage', onStorage);
  window.addEventListener(CHANGE_EVENT, refresh);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(CHANGE_EVENT, refresh);
  };
};

export const useEditorPicks = () => {
  const { profile, ownerId } = useProfileShorts();
  const profileId = profile.id;
  const getSnapshot = useCallback(() => JSON.stringify(readGuest(profileId)), [profileId]);
  const guest = JSON.parse(useSyncExternalStore(subscribe, getSnapshot, () => '{"liked":[],"viewed":[]}'));
  return {
    profileId,
    ownerId,
    liked: ownerId === 'guest' ? guest.liked : normalizeEditorPicks(profile.likedEditorPicks),
    viewed: ownerId === 'guest' ? guest.viewed : normalizeEditorPicks(profile.viewedEditorPicks),
  };
};

export const saveEditorPick = async (profileId, record, kind, ownerId, { remove = false } = {}) => {
  const currentOwner = useAuthStore.getState().user?.uid || 'guest';
  if (kind === 'like' && currentOwner === 'guest') throw new Error('로그인 후 관심 콘텐츠를 저장할 수 있어요.');
  if (currentOwner !== ownerId) throw new Error('계정이 변경됐어요. 다시 시도해주세요.');
  if (currentOwner !== "guest") {
    return remove
      ? removeLibraryRecord(profileId, "likedEditorPicks", record.id, ownerId)
      : changeEditorPickRecord(profileId, record, kind, ownerId);
  }
  let profile;
  try { profile = JSON.parse(localStorage.getItem('wavve-active-profile') || '{}'); }
  catch { profile = {}; }
  if ((profile.id || 'profile1') !== profileId) throw new Error('프로필이 변경됐어요. 다시 시도해주세요.');
  const saved = readGuest(profileId);
  if (remove) {
    saved.liked = saved.liked.filter((item) => item.id !== record.id);
  } else {
    const field = kind === 'like' ? 'liked' : 'viewed';
    saved[field] = updateEditorPicks(saved[field], record, kind);
    if (kind === 'view') saved.liked = refreshEditorPick(saved.liked, record);
  }
  localStorage.setItem(keyFor(profileId), JSON.stringify(saved));
  window.dispatchEvent(new Event(CHANGE_EVENT));
};
