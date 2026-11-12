import { useCallback, useSyncExternalStore } from 'react';
import { getIndividualPurchaseMovie } from '../data/individualPurchaseMovies.js';

const PREFIX = 'ott:demo-movie:';
const CHANGE_EVENT = 'ott:demo-movie-change';
const accountPrefix = (uid) => `${PREFIX}${encodeURIComponent(uid)}:`;

const resolveOffer = (value) => typeof value === 'object' && value
  ? value : getIndividualPurchaseMovie(value);
const storageId = (offer) => offer.kind === 'program' ? offer.id : String(offer.tmdbId);

function readPurchases(uid) {
  if (!uid) return [];

  try {
    const prefix = accountPrefix(uid);
    return Object.keys(localStorage).flatMap((key) => {
      if (!key.startsWith(prefix)) return [];
      try {
        const record = JSON.parse(localStorage.getItem(key));
        const stored = record?.offer;
        const validStored = stored && ['movie', 'program'].includes(stored.kind)
          && Number.isSafeInteger(stored.tmdbId) && stored.tmdbId > 0
          && stored.id === `${stored.kind}:${stored.tmdbId}`
          && typeof stored.title === 'string'
          && (stored.kind === 'movie'
            ? stored.link === `/moviedetail/${stored.tmdbId}`
            : /^\/(entertainment|drama|currentaffairs|animation|global)detail\/\d+$/.test(stored.link)
              && stored.link.endsWith(`/${stored.tmdbId}`))
          && storageId(stored) === key.slice(prefix.length);
        const movie = getIndividualPurchaseMovie(key.slice(prefix.length))
          ?? (validStored ? stored : null);
        if (!movie) return [];
        if (!Number.isFinite(record?.savedAt)) return [];
        return [{
          id: movie.id,
          title: movie.title,
          type: movie.kind === 'program' ? 'program' : 'movie',
          to: movie.link,
          image: typeof record.image === 'string' ? record.image : '',
          savedAt: record.savedAt,
          downloadedAt: Number.isFinite(record.downloadedAt) ? record.downloadedAt : null,
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
  const movie = resolveOffer(tmdbId);
  if (!uid || !movie) throw new Error('구매할 영화와 계정을 확인해주세요.');

  const key = `${accountPrefix(uid)}${storageId(movie)}`;
  if (readPurchases(uid).some((record) => record.id === movie.id)) return;

  localStorage.setItem(key, JSON.stringify({ image, offer: movie, amount: movie.price, savedAt: Date.now() }));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function saveDemoMovieDownload(uid, tmdbId) {
  const movie = resolveOffer(tmdbId);
  if (!uid || !movie) throw new Error('구매한 영화를 확인해주세요.');

  const key = `${accountPrefix(uid)}${storageId(movie)}`;
  const record = JSON.parse(localStorage.getItem(key));
  if (!Number.isFinite(record?.savedAt)) throw new Error('구매 기록이 없어요.');

  localStorage.setItem(key, JSON.stringify({ ...record, downloadedAt: Date.now() }));
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
