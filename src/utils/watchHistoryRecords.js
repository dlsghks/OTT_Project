const safeText = (value) => typeof value === "string" ? value.trim() : "";
export const normalizeWatchHistory = (value) => {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value.flatMap((item) => {
    const id = safeText(item?.id);
    const title = safeText(item?.title);
    const to = safeText(item?.to);
    if (!id || !title || !["program", "movie"].includes(item?.type) ||
        !to.startsWith("/") || to.startsWith("//") || seen.has(id)) return [];
    seen.add(id);
    return [{ id, title, type: item.type, to, image: safeText(item.image),
      videoId: safeText(item.videoId),
      episodeTitle: safeText(item.episodeTitle),
      thumbnailUrl: safeText(item.thumbnailUrl),
      position: Number.isFinite(item.position) && item.position > 0 ? item.position : 0,
      duration: Number.isFinite(item.duration) && item.duration > 0 ? item.duration : 0,
      watchedAt: Number.isFinite(item.watchedAt) && item.watchedAt > 0 ? item.watchedAt : 0 }];
  }).sort((a, b) => b.watchedAt - a.watchedAt).slice(0, 200);
};
export const updateWatchHistory = (value, item) => {
  const [record] = normalizeWatchHistory([item]);
  if (!record) throw new Error("시청한 작품 정보를 확인해주세요.");
  return [{ ...record, watchedAt: Date.now() },
    ...normalizeWatchHistory(value).filter((previous) => previous.id !== record.id)].slice(0, 200);
};
