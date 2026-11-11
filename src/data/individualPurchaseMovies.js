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
