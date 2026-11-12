// 시연용 영화 구매 목록과 가격
export const individualPurchaseMovies = [
  [1058424, 'HOPE'],
  [1317288, '마티 슈프림'],
  [542178, '프렌치 디스패치'],
  [438631, '듄'],
  [661539, '컴플리트 언노운'],
  [693134, '듄: 파트2'],
  [787699, '웡카'],
  [331482, '작은 아씨들'],
  [391713, '레이디 버드'],
  [157336, '인터스텔라'],
].map(([tmdbId, title]) => ({
  id: `movie:${tmdbId}`,
  tmdbId,
  title,
  kind: 'movie',
  badge: '개별구매',
  price: 5500,
  link: `/moviedetail/${tmdbId}`,
}));

export const getIndividualPurchaseMovie = (tmdbId) =>
  individualPurchaseMovies.find((movie) => movie.tmdbId === Number(tmdbId));


// 배지가 있는 영화·프로그램도 메인과 같은 시연용 구매 조건을 사용합니다.
export const getIndividualPurchaseContent = (tmdbId, item, type = 'movie') => {
  const id = Number(tmdbId);
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  const listed = type === 'movie' ? getIndividualPurchaseMovie(id) : null;
  if (listed) return listed;
  const badges = [...(Array.isArray(item?.badges) ? item.badges : []), item?.badge];
  if (!badges.includes('개별구매') || !item?.title) return null;
  return {
    id: `${type}:${id}`, tmdbId: id, title: item.title,
    kind: type, badge: '개별구매', price: 5500,
    link: type === 'movie' ? `/moviedetail/${id}` : item.link,
  };
};
