// One record represents a recommendation page, never an individual programme.
export const normalizeEditorPicks = (value) => {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value.flatMap((record) => {
    if (!record || typeof record.to !== 'string' || !record.to.startsWith('/') ||
        record.to.startsWith('//') || typeof record.title !== 'string' || !record.title.trim() || seen.has(record.to)) return [];
    seen.add(record.to);
    return [{
      id: record.to,
      to: record.to,
      title: record.title.trim(),
      description: typeof record.description === 'string' ? record.description : '',
      cover: typeof record.cover === 'string' && !record.cover.includes('empty-play') ? record.cover : '',
      ...(record.firstItem && typeof record.firstItem === 'object' ? {
        firstItem: Object.fromEntries(Object.entries(record.firstItem).filter(([key, value]) =>
          ['id', 'title', 'contentId', 'kind', 'tmdbId', 'tmdbTitle', 'tmdbYear', 'year', 'tmdbSeason', 'poster', 'image', 'isPlaceholder'].includes(key)
          && ['string', 'number', 'boolean'].includes(typeof value)))
      } : {}),
    }];
  }).slice(0, 100);
};

export const updateEditorPicks = (value, entry, kind) => {
  const [record] = normalizeEditorPicks([entry]);
  const previous = normalizeEditorPicks(value);
  if (!record) return previous;
  if (kind === 'like' && previous.some(item => item.id === record.id)) {
    return previous.filter(item => item.id !== record.id);
  }
  return [record, ...previous.filter(item => item.id !== record.id)].slice(0, 100);
};

// Refresh a saved collection's artwork without toggling its heart or changing its order.
export const refreshEditorPick = (value, entry) => normalizeEditorPicks(value).map(previous =>
  previous.id === entry.id ? { ...entry, cover: entry.cover || previous.cover } : previous
);
