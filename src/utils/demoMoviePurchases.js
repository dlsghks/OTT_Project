import { useCallback, useSyncExternalStore } from 'react';
import { getIndividualPurchaseMovie } from '../data/individualPurchaseMovies.js';

const PREFIX = 'ott:demo-movie:';
const CHANGE_EVENT = 'ott:demo-movie-change';
const accountPrefix = (uid) => `${PREFIX}${encodeURIComponent(uid)}:`;

function readPurchases(uid) {
  if (!uid) return [];

  try {
    const prefix = accountPrefix(uid);
    return Object.keys(localStorage).flatMap((key) => {
      if (!key.startsWith(prefix)) return [];
      const movie = getIndividualPurchaseMovie(key.slice(prefix.length));
      if (!movie) return [];

      try {
        const record = JSON.parse(localStorage.getItem(key));
        if (!Number.isFinite(record?.savedAt)) return [];
        return [{
          id: movie.id,
          title: movie.title,
          type: 'movie',
          to: movie.link,
          image: typeof record.image === 'string' ? record.image : '',
          savedAt: record.savedAt,
        }];
      } catch {
        return [];
      }
    }).sort((first, second) => second.savedAt - first.savedAt);
  } catch {
    return [];
  }
}

export function saveDemoMoviePurchase(uid, tmdbId, image) {
  const movie = getIndividualPurchaseMovie(tmdbId);
  if (!uid || !movie) throw new Error('구매할 영화와 계정을 확인해주세요.');

  const key = `${accountPrefix(uid)}${movie.tmdbId}`;
  if (readPurchases(uid).some((record) => record.id === movie.id)) return;

  localStorage.setItem(key, JSON.stringify({ image, amount: movie.price, savedAt: Date.now() }));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

const subscribe = (refresh) => {
  const onStorage = (event) => {
    if (!event.key || event.key.startsWith(PREFIX)) refresh();
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener(CHANGE_EVENT, refresh);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(CHANGE_EVENT, refresh);
  };
};

export function useDemoMoviePurchases(uid) {
  const getSnapshot = useCallback(() => JSON.stringify(readPurchases(uid)), [uid]);
  return JSON.parse(useSyncExternalStore(subscribe, getSnapshot, () => '[]'));
}
