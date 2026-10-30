import test from 'node:test';
import { loadData } from './dataModules.js';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Buffer } from 'node:buffer';

let moduleIndex = 0;
const createClient = async (t, respond) => {
  const calls = [];
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    calls.push(new URL(url));
    const data = await respond(new URL(url));
    const status = data?.__httpStatus || (data === null ? 404 : 200);
    return { ok: status === 200, status, json: async () => data };
  };
  t.after(() => { globalThis.fetch = previousFetch; });
  // 테스트는 실제 환경 변수나 API 키를 읽지 않고 모든 네트워크 요청을 대체한다.
  const source = (await readFile(new URL('../src/services/tmdb.js', import.meta.url), 'utf8'))
    .replace(/import .*imagePath';/, 'const getImagePath = (path) => path;')
    .replace('import.meta.env.VITE_TMDB_API_KEY', JSON.stringify('test-only'))
    .replace('import.meta.env.DEV', 'false')
    .replace("'../data/contentCatalog'", JSON.stringify(new URL('../src/data/contentCatalog.js', import.meta.url).href));
  const module = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}#${moduleIndex++}`);
  return { getPoster: module.getTmdbPoster, getResult: module.getTmdbPosterResult, calls };
};

test('표시 제목이 달라도 공통 contentId의 검색과 진행 중 요청을 공유한다', async (t) => {
  const { contentCatalog } = await import('../src/data/contentCatalog.js');
  const id = 'category:ent-07';
  const saved = contentCatalog[id];
  t.after(() => { contentCatalog[id] = saved; });
  contentCatalog[id] = { ...saved, tmdbId: undefined };
  const { getPoster, calls } = await createClient(t, () => ({
    results: [{ name: saved.title, poster_path: '/shared.jpg' }],
  }));
  const items = ['다른 표시 제목 A', '다른 표시 제목 B'].map((title) => ({ title, contentId: id }));
  assert.deepEqual(await Promise.all(items.map((item) => getPoster(item))),
    ['https://image.tmdb.org/t/p/w500/shared.jpg', 'https://image.tmdb.org/t/p/w500/shared.jpg']);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].searchParams.get('query'), saved.title);
});

test('직접 이미지가 있으면 API를 호출하지 않는다', async (t) => {
  const { getPoster, calls } = await createClient(t, () => assert.fail('unexpected request'));
  assert.equal(await getPoster({ poster: '/local.jpg', image: '/other.jpg', tmdbId: 1 }), '/local.jpg');
  assert.equal(calls.length, 0);
});

test('확인된 TV ID와 기존 영화 ID는 제목 검색을 생략한다', async (t) => {
  const { getPoster, calls } = await createClient(t, () => ({ poster_path: '/poster.jpg' }));
  for (const id of [30801, 66046, 64369]) {
    assert.equal(await getPoster({ kind: 'tv', tmdbId: id }), 'https://image.tmdb.org/t/p/w500/poster.jpg');
    assert.equal(calls.at(-1).pathname, `/3/tv/${id}`);
  }
  await getPoster({ kind: 'movie', tmdbId: 693134 });
  assert.equal(calls.at(-1).pathname, '/3/movie/693134');
  assert.equal(calls.length, 4);
});

test('ID 실패 후 별도 검색 제목, 표시 제목 순으로 조회하고 중복 요청을 공유한다', async (t) => {
  const { getPoster, calls } = await createClient(t, (url) => {
    if (url.searchParams.get('query') === '표시 제목') {
      return { results: [{ name: '표시 제목', poster_path: '/found.jpg' }] };
    }
    return { results: [] };
  });
  const item = { kind: 'tv', tmdbId: 99, tmdbTitle: '검색 제목', title: '표시 제목' };
  const results = await Promise.all([getPoster(item), getPoster(item)]);
  assert.ok(results.every((url) => url?.endsWith('/found.jpg')));
  assert.deepEqual(calls.map((url) => url.searchParams.get('query')), [null, '검색 제목', '표시 제목']);
});

test('기존에 표시되던 네 프로그램의 정확한 제목 매칭을 유지한다', async (t) => {
  const { getPoster } = await createClient(t, (url) => ({ results: [{
    name: url.searchParams.get('query'), poster_path: '/existing.jpg',
  }] }));
  for (const title of ['런닝맨', '미운 우리 새끼', '태어난 김에 세계일주', '협상의 기술']) {
    assert.ok((await getPoster({ title, kind: 'series' })).endsWith('/existing.jpg'));
  }
});

test('원제, 공백, 문장부호와 연도를 비교하고 동명이작과 낮은 유사도를 거부한다', async (t) => {
  const { getPoster } = await createClient(t, () => ({ results: [
    { name: '다른 제목', original_name: 'TV 동물농장', first_air_date: '2001-05-01', poster_path: '/right.jpg' },
    { name: 'TV동물농장', first_air_date: '2020-01-01', poster_path: '/wrong.jpg' },
  ] }));
  assert.ok((await getPoster({ title: 'TV: 동물 농장', tmdbYear: 2001 })).endsWith('/right.jpg'));
  assert.equal(await getPoster({ title: '동물농장 특집' }), null);
  assert.equal(await getPoster({ title: 'TV 동물농장', tmdbYear: 1999 }), null);
});

test('동일 제목의 여러 작품은 연도 등 식별 정보가 없으면 선택하지 않는다', async (t) => {
  const { getPoster } = await createClient(t, () => ({ results: [
    { name: '같은 제목', poster_path: '/one.jpg' },
    { name: '같은 제목', poster_path: '/two.jpg' },
  ] }));
  assert.equal(await getPoster({ title: '같은 제목' }), null);
});

test('TV 시즌 표기는 시리즈 검색어에서 분리하고 콘텐츠 종류는 유지한다', async (t) => {
  const { getPoster, calls } = await createClient(t, (url) => ({ results:
    url.searchParams.get('query') === '1박 2일'
      ? [{ name: '1박2일', media_type: 'tv', poster_path: '/series.jpg' }] : [],
  }));
  assert.ok((await getPoster({ title: '1박 2일 시즌4', kind: 'tv' })).endsWith('/series.jpg'));
  assert.equal(calls.length, 2);
  assert.ok(calls.every((url) => url.pathname === '/3/search/tv'));
});

test('포스터 없음과 실패를 캐시하고 즉시 반복 요청하지 않는다', async (t) => {
  const { getPoster, calls } = await createClient(t, (url) => {
    const title = url.searchParams.get('query');
    if (title === 'HTTP 실패') return null;
    if (title === '네트워크 실패') throw new Error('mock network failure');
    return { results: [{ name: title, poster_path: null }] };
  });
  for (const title of ['포스터 없음', 'HTTP 실패', '네트워크 실패']) {
    assert.equal(await getPoster({ title }), null);
    assert.equal(await getPoster({ title }), null);
  }
  assert.equal(calls.length, 4); // 네트워크 오류만 최초 요청에서 1회 추가 시도한다.
});

test('일시적 실패는 1회만 재시도하고 TTL 만료 뒤 성공으로 복구한다', async (t) => {
  const previousNow = Date.now;
  let now = previousNow();
  Date.now = () => now;
  t.after(() => { Date.now = previousNow; });
  let attempts = 0;
  const { getResult, calls } = await createClient(t, () => {
    attempts += 1;
    return attempts <= 2 ? { __httpStatus: 503 } : { poster_path: '/recovered.jpg' };
  });
  const item = { tmdbId: 30801, kind: 'tv' };
  assert.equal((await getResult(item)).status, 'http_error');
  assert.equal(calls.length, 2);
  assert.equal((await getResult(item)).retryable, true);
  assert.equal(calls.length, 2);
  now += 5001;
  assert.equal((await getResult(item)).poster, 'https://image.tmdb.org/t/p/w500/recovered.jpg');
  assert.equal(calls.length, 3);
});

test('429는 즉시 재시도하지 않고 HTTP 상태를 구분한다', async (t) => {
  const { getResult, calls } = await createClient(t, () => ({ __httpStatus: 429 }));
  const result = await getResult({ tmdbId: 1 });
  assert.equal(result.httpStatus, 429);
  assert.equal(result.retryable, true);
  assert.equal(calls.length, 1);
});

test('404, 검색 결과 없음, 포스터 없음, 모호한 검색을 구분한다', async (t) => {
  const { getResult } = await createClient(t, (url) => {
    if (url.pathname.endsWith('/404')) return { __httpStatus: 404 };
    const query = url.searchParams.get('query');
    if (query === '빈 결과') return { results: [] };
    if (query === '포스터 없음') return { results: [{ name: query, poster_path: null }] };
    return { results: [{ name: query, poster_path: '/a.jpg' }, { name: query, poster_path: '/b.jpg' }] };
  });
  assert.equal((await getResult({ tmdbId: 404 })).status, 'not_found');
  assert.equal((await getResult({ title: '빈 결과' })).status, 'search_empty');
  assert.equal((await getResult({ title: '포스터 없음' })).status, 'no_poster');
  assert.equal((await getResult({ title: '동명' })).status, 'ambiguous');
});

test('명시한 시즌 정보가 있는 TV 제목만 끝의 시즌 숫자를 분리한다', async (t) => {
  const { getPoster, calls } = await createClient(t, (url) => {
    const name = url.searchParams.get('query');
    return { results: name === '모범택시' ? [{ name, poster_path: '/taxi.jpg' }] : [] };
  });
  assert.ok((await getPoster({ title: '모범택시 3', tmdbSeason: 3 })).endsWith('/taxi.jpg'));
  await getPoster({ title: '응답하라 1988' });
  assert.ok(!calls.some((url) => url.searchParams.get('query') === '응답하라'));
  await getPoster({ title: '작품 2' });
  assert.ok(!calls.some((url) => url.searchParams.get('query') === '작품'));
});

test('로컬 이미지 실패 시 skipLocal로 TMDB 복구하고 placeholder는 검색하지 않는다', async (t) => {
  const { getPoster, getResult, calls } = await createClient(t, () => ({ poster_path: '/fallback.jpg' }));
  const item = { poster: '/broken.jpg', tmdbId: 66046, kind: 'tv' };
  assert.equal(await getPoster(item), '/broken.jpg');
  assert.equal(calls.length, 0);
  assert.equal(await getPoster(item, { skipLocal: true }), 'https://image.tmdb.org/t/p/w500/fallback.jpg');
  assert.equal((await getResult({ title: '주말 추천 영화', isPlaceholder: true })).status, 'placeholder');
  assert.equal(calls.length, 1);
});

test('실제 TOP 랭킹·요일별 데이터의 누락 5개를 ID 또는 연도로 구분한다 (모의 응답)', async (t) => {
  const { rankingItems } = await loadData('homeData');
  const { weeklyContentByDay } = await loadData('weeklyContentData');
  const weekly = Object.values(weeklyContentByDay).flat();
  const { getPoster, calls } = await createClient(t, (url) => {
    if (!url.pathname.includes('/search/')) return { poster_path: '/fixture-id.jpg' };
    const query = url.searchParams.get('query');
    // 구버전의 첫 결과 선택은 다른 연도의 작품을 고를 수 있었다.
    return { results: [
      { name: query, first_air_date: '2010-01-01', poster_path: '/fixture-wrong.jpg' },
      { name: query, first_air_date: query === '가족관계증명서' ? '2026-07-06' : '2023-03-29', poster_path: '/fixture-year.jpg' },
    ] };
  });
  for (const title of ['가족관계증명서', '라디오스타', '스모킹 건']) {
    const item = rankingItems.find((entry) => entry.title === title);
    const poster = await getPoster(item);
    assert.equal(poster, 'https://image.tmdb.org/t/p/w500/' + (title === '라디오스타' ? 'fixture-id.jpg' : 'fixture-year.jpg'));
  }
  for (const [title, id] of [['보물섬', 271309], ['메리 킬즈 피플', 261190]]) {
    const item = weekly.find((entry) => entry.title === title);
    assert.equal(item.tmdbId, id);
    assert.equal(await getPoster(item), 'https://image.tmdb.org/t/p/w500/fixture-id.jpg');
    assert.equal(calls.at(-1).pathname, `/3/tv/${id}`);
  }
  assert.ok(!calls.some((url) => url.pathname.includes('/search/movie')));
});

test('HOPE의 지정한 세 영화는 검증된 영화 ID로 직접 조회한다 (모의 응답)', async (t) => {
  const { hopeItems } = await loadData('homeData');
  assert.equal(hopeItems.length, 11);
  const { getPoster, calls } = await createClient(t, () => ({ poster_path: '/fixture-hope.jpg' }));
  for (const [title, id, year] of [['듄', 438631, 2021], ['컴플리트 언노운', 661539, 2024], ['작은 아씨들', 331482, 2019]]) {
    const item = hopeItems.find((entry) => entry.title === title);
    assert.equal(item.kind, 'movie');
    assert.equal(item.tmdbId, id);
    assert.equal(item.tmdbYear, year);
    assert.equal(item.badge, '개별구매');
    assert.equal(await getPoster(item), 'https://image.tmdb.org/t/p/w500/fixture-hope.jpg');
    assert.equal(calls.at(-1).pathname, `/3/movie/${id}`);
  }
  assert.equal(calls.length, 3);
});


test('새 홈 분류의 퀸덤은 TV 시리즈 ID로 조회하고 미확인 항목은 검색하지 않는다', async (t) => {
  const { requestedHomeSections, homeContentBySection } = await loadData('requestedHomeSections');
  assert.equal(requestedHomeSections.flatMap((section) => section.items).length, 50);
  assert.equal(homeContentBySection.travel.length, 1);
  assert.equal(homeContentBySection['music-entertainment'].length, 2);
  const queen = homeContentBySection.music.find((entry) => entry.tmdbId === 91678);
  assert.equal(queen.tmdbSeason, 2);
  assert.equal(queen.tmdbYear, 2019);
  const { getPoster, getResult, calls } = await createClient(t, () => ({ poster_path: '/fixture-queen.jpg' }));
  assert.equal(await getPoster(queen), 'https://image.tmdb.org/t/p/w500/fixture-queen.jpg');
  assert.equal(calls[0].pathname, '/3/tv/91678');
  const unknown = homeContentBySection['jung-hyung-don'][0];
  assert.equal((await getResult(unknown)).status, 'placeholder');
  assert.equal(calls.length, 1);
});
