export const MIN_SUB_SECTION_ITEMS = 10;

const normalizeTitle = (title) =>
  String(title ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\p{P}\p{Z}\s]/gu, '');

export const fillSectionItems = (
  primaryItems = [],
  fallbackItems = [],
  minimum = MIN_SUB_SECTION_ITEMS
) => {
  const result = [];
  const seenIds = new Set();
  const seenTitles = new Set();
  const seenTmdbIds = new Set();

  const addItem = (item) => {
    if (!item) return;

    const id = item.id != null
      ? String(item.id)
      : null;

    const title = normalizeTitle(item.title);

    const tmdbId = item.tmdbId
      ? `${item.kind === 'movie' ? 'movie' : 'tv'}:${item.tmdbId}`
      : null;

    if (
      (id && seenIds.has(id)) ||
      (title && seenTitles.has(title)) ||
      (tmdbId && seenTmdbIds.has(tmdbId))
    ) {
      return;
    }

    result.push(item);

    if (id) seenIds.add(id);
    if (title) seenTitles.add(title);
    if (tmdbId) seenTmdbIds.add(tmdbId);
  };

  primaryItems.forEach(addItem);

  for (const item of fallbackItems) {
    if (result.length >= minimum) break;

    addItem(item);
  }

  return result;
};