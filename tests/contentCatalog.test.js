import test from 'node:test';
import assert from 'node:assert/strict';
import { contentCatalog, withContent, getContentPosterItem } from '../src/data/contentCatalog.js';
import { loadData } from './dataModules.js';

test('랭킹·요일별·서브 페이지의 동일 작품은 공통 ID와 TMDB 정보를 공유한다', async () => {
  const { categoryPages } = await loadData('categoryData');
  const { rankingItems } = await loadData('homeData');
  const { weeklyContentByDay } = await loadData('weeklyContentData');
  const radio = categoryPages.entertainment.items.find((item) => item.id === 'ent-07');
  const rank = rankingItems.find((item) => item.id === 5);
  const weekly = Object.values(weeklyContentByDay).flat().find((item) => item.id === 'ent-07');
  assert.equal(radio.contentId, rank.contentId);
  assert.equal(radio.contentId, weekly.contentId);
  for (const entry of [radio, rank, weekly]) assert.equal(entry.tmdbId, 65270);
  assert.equal(rank.id, 5);
  assert.equal(radio.id, 'ent-07');
  const buried = categoryPages.drama.items.find((item) => item.id === 'dra-08');
  assert.equal(buried.tmdbId, 271309);
  const { searchContents } = await loadData('searchData');
  assert.equal(searchContents.find((item) => item.id === 4).contentId,
    categoryPages.drama.items.find((item) => item.id === 'dra-03').contentId);
});

test('홈 목록·애니메이션 페이지는 원피스와 진격의 거인의 동일 작품을 참조한다', async () => {
  const { requestedHomeSections } = await loadData('requestedHomeSections');
  const { categoryPages } = await loadData('categoryData');
  const home = requestedHomeSections.flatMap((section) => section.items);
  for (const id of ['ani-03', 'ani-22']) {
    const category = categoryPages.animation.items.find((item) => item.id === id);
    const entry = home.find((item) => item.contentId === category.contentId);
    assert.ok(entry);
    assert.equal(entry.tmdbId, category.tmdbId);
    assert.equal(entry.kind, 'tv');
  }
  assert.ok(categoryPages.movie.items.every((item) => item.kind === 'movie'));
});

test('공통 포스터 한 곳 변경 시 모든 참조에 적용하며 페이지 고유 필드는 유지한다', (t) => {
  const id = 'category:ent-07';
  const saved = contentCatalog[id];
  t.after(() => { contentCatalog[id] = saved; });
  contentCatalog[id] = { ...saved, poster: '/images/shared-radio.jpg' };
  const original = { id: 5, title: '표시용 별칭', badge: '새로운', isOriginal: true, days: ['wed'], genre: 'talk', link: '/original' };
  const rank = withContent(original, 'ranking');
  const category = withContent({ id: 'ent-07', title: '라디오스타' }, 'category');
  assert.equal(rank.poster, category.poster);
  for (const field of Object.keys(original)) assert.deepEqual(rank[field], original[field]);
  assert.equal(getContentPosterItem(rank).title, saved.title);
  assert.equal(original.poster, undefined);
});

test('공통 이미지 미지정 시 기존 로컬 이미지를 보존하고 동명 작품은 자동 병합하지 않는다', () => {
  const item = { id: 'ent-07', title: '라디오스타', poster: '/images/existing.jpg' };
  assert.equal(withContent(item, 'category').poster, item.poster);
  const movie = { id: 'unknown-movie', title: '극한직업', kind: 'movie', tmdbYear: 2019 };
  const tv = { id: 'unknown-tv', title: '극한직업', kind: 'tv', tmdbYear: 2008 };
  assert.equal(withContent(movie, 'unregistered'), movie);
  assert.equal(withContent(tv, 'unregistered'), tv);
  assert.notEqual(withContent({ id: 'mov-19' }, 'category').contentId,
    withContent({ id: 'cur-18' }, 'category').contentId);
});

test('미확인 카드도 공통 데이터에 검증한 ID를 추가하면 이전 placeholder 상태를 해제한다', (t) => {
  const id = 'home:home-new-series-08';
  const saved = contentCatalog[id];
  t.after(() => { contentCatalog[id] = saved; });
  // 가상의 테스트 ID이며 실제 카탈로그 파일에는 저장하지 않는다.
  contentCatalog[id] = { ...saved, kind: 'tv', tmdbId: 999999999 };
  const resolved = withContent({ id: 'home-new-series-08', isPlaceholder: true }, 'home');
  assert.equal(resolved.isPlaceholder, false);
});

test('이번 홈 목록은 제공한 50개 작품만 사용하고 기존 서브 페이지 작품은 보존한다', async () => {
  const { requestedHomeSections, homeContentBySection } = await loadData('requestedHomeSections');
  const allowed = new Set(requestedHomeSections.flatMap((section) => section.items.map((item) => item.id)));
  assert.equal(allowed.size, 50);
  for (const item of Object.values(homeContentBySection).flat()) assert.ok(allowed.has(item.id));
  const { categoryPages } = await loadData('categoryData');
  assert.equal(categoryPages.entertainment.items.find((item) => item.id === 'ent-16').title, '여행을 대하는 자세');
});

test('검증한 시즌은 시리즈 ID와 분리하고 미확인 작품은 제목 대체 카드를 유지한다', async () => {
  const { requestedHomeSections } = await loadData('requestedHomeSections');
  const items = requestedHomeSections.flatMap((section) => section.items);
  for (const [title, id, season] of [
    ['더 커뮤니티 2: 보이지 않는 손', 244601, 2],
    ['동네스타 K3', 224756, 3],
    ['지구마불 세계여행3', 219465, 3],
  ]) {
    const item = items.find((entry) => entry.title === title);
    assert.equal(item.tmdbId, id);
    assert.equal(item.tmdbSeason, season);
    assert.equal(item.kind, 'tv');
    assert.equal(item.isPlaceholder, false);
  }
  for (const title of ['연애남매2', '정형돈의 제목없음 TV', '아가미', '이상한 과자가게 전천당', '터무니없는 스킬로 이세계방랑밥2']) {
    const item = items.find((entry) => entry.title === title);
    assert.equal(item.tmdbId, undefined);
    assert.equal(item.isPlaceholder, true);
  }
});
