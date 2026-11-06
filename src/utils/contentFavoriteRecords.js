export const normalizeContentFavorites = value => {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value.flatMap(item => {
    if (!item || !['program', 'movie'].includes(item.type) || typeof item.id !== 'string'
      || !item.id || seen.has(item.id) || typeof item.title !== 'string' || !item.title.trim()
      || typeof item.to !== 'string' || !item.to.startsWith('/') || item.to.startsWith('//')) return [];
    seen.add(item.id);
    return [{ id: item.id, title: item.title.trim(), type: item.type, to: item.to,
      image: typeof item.image === 'string' ? item.image : '' }];
  }).slice(0, 200);
};
export const toggleContentFavorite = (value, item) => {
  const before = normalizeContentFavorites(value);
  const [record] = normalizeContentFavorites([item]);
  if (!record) throw new Error('작품 정보를 확인해주세요.');
  return before.some(item => item.id === record.id)
    ? before.filter(item => item.id !== record.id) : [record, ...before].slice(0, 200);
};
