// 뉴스 클립 · 시사토크 유튜브 검색 (제목 → 영상 id + 설명)
// .env: VITE_YOUTUBE_API_KEY
// - 검색(search) 100 · 상세(videos) 1 unit 을 쓰므로 결과를 브라우저에 저장해 재사용한다
const YOUTUBE_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const CACHE_KEY = 'news-clip-youtube-cache';

const loadCache = () => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) ?? {};
  } catch {
    return {};
  }
};

const saveCache = (cache) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // 저장 공간이 없거나 막힌 경우 무시 (메모리 캐시는 유지)
  }
};

const cache = loadCache(); // key: 검색어 → { videoId, title, channel, description } | null
const pending = new Map();

const normalize = (text = '') => text.replace(/[\s:·,.!?'"“”‘’…\-[\]()]/g, '').toLowerCase();

// 유튜브 영상 제목에 검색 키워드가 들어 있는지 (엉뚱한 영상 걸러내기)
export const isRelatedVideo = (video, keyword) =>
  Boolean(video) && normalize(`${video.title} ${video.channel}`).includes(normalize(keyword));

const request = async (query) => {
  const search = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&regionCode=KR&relevanceLanguage=ko&q=${encodeURIComponent(query)}&key=${YOUTUBE_KEY}`
  ).then((res) => res.json());

  if (search.error) {
    // 사용량 초과 등 — 저장하지 않아야 나중에 다시 시도 가능
    console.error('유튜브 검색 에러:', search.error.message);
    return undefined;
  }

  const item = search.items?.[0];
  if (!item) return null;

  const videoId = item.id.videoId;
  // 검색 결과 설명은 잘려 있어서 상세 정보에서 전체 설명을 가져온다
  const detail = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_KEY}`
  ).then((res) => res.json()).catch(() => null);
  const snippet = detail?.items?.[0]?.snippet ?? item.snippet;

  return {
    videoId,
    title: snippet.title,
    channel: snippet.channelTitle,
    description: snippet.description ?? '',
  };
};

// 검색어로 유튜브 영상 1개 찾기 → { videoId, title, channel, description } | null
export const findYoutubeVideo = async (query) => {
  if (!query) return null;
  if (query in cache) return cache[query];
  if (!YOUTUBE_KEY) {
    console.warn('VITE_YOUTUBE_API_KEY 가 없어 유튜브를 검색할 수 없습니다.');
    return null;
  }
  if (pending.has(query)) return pending.get(query);

  const promise = request(query)
    .then((result) => {
      if (result !== undefined) {
        cache[query] = result;
        saveCache(cache);
      }
      return result ?? null;
    })
    .catch((error) => {
      console.error('유튜브 검색 에러:', error);
      return null;
    })
    .finally(() => pending.delete(query));

  pending.set(query, promise);
  return promise;
};
