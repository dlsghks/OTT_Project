import { categoryPages, weekdays } from './categoryData';
import { weeklyContentByDay } from './home/weeklyContentData';
import { homeSections, hopeItems, rankingItems } from './home/homeData';
import { homeContentBySection } from './home/requestedHomeSections';
import { discoverySections, additionalSections, getCategoryItems, loadAllDiscoveryItems } from './home/homeSeeAll';
import { fillSectionItems, MIN_SUB_SECTION_ITEMS } from '../utils/sectionItems';

export const categoryCollectionLink = (category, section) => `/collection/category--${category}--${section}`;
export const homeCollectionLink = id => `/collection/home--${id}`;
export const homeCollectionTitle = section => section.id === 'travel' ? '일상을 벗어나는 여행 예능'
  : section.id === 'music-entertainment' ? '듣고 웃고 즐기는 음악 예능' : section.title;

// One source for list headings, More pages and saved collection cards.
export const findEditorCollection = (to) => {
  const [path, query = ''] = to.split('?');
  const id = decodeURIComponent(path.split('/').filter(Boolean).at(-1) || '');
  const discovery = discoverySections.find(section => section.id === id);
  if (discovery) return { title: discovery.title, loadItems: () => loadAllDiscoveryItems(discovery) };
  const additional = additionalSections.find(section => section.id === id);
  if (additional) return { title: additional.title, items: getCategoryItems(additional.category, additional.genres) };
  if (id === 'home--ranking') return { title: '오늘의 TOP 랭킹', items: rankingItems };
  if (id === 'home--hope') return { title: '티모시 샬라메 필모그래피', items: hopeItems };
  if (id === 'home--weekly') {
    const day = new URLSearchParams(query).get('day');
    const weekday = weekdays.find(entry => entry.id === day);
    return { title: '요일별 콘텐츠' + (weekday ? ` · ${weekday.label}요일` : ''),
      items: weekday ? weeklyContentByDay[day] : Object.values(weeklyContentByDay).flat() };
  }
  if (id.startsWith('home--')) {
    const section = homeSections.find(section => `home--${section.id}` === id);
    if (section) return { title: homeCollectionTitle(section), items: homeContentBySection[section.id] ?? section.items ?? [] };
  }
  if (id.startsWith('category--')) {
    const [, category, sectionId] = id.split('--');
    const page = categoryPages[category];
    const section = page?.sections.find(section => section.id === sectionId);
    if (!section) return null;
    const day = new URLSearchParams(query).get('day');
    const weekday = weekdays.find(entry => entry.id === day);
    const primary = section.type === 'weekday' && weekday
      ? (section.items ?? []).filter(item => item.days?.includes(day)) : section.items ?? [];
    return {
      title: section.title + (section.type === 'weekday' && weekday ? ` · ${weekday.label}요일` : ''),
      items: fillSectionItems(primary, page.items ?? [], MIN_SUB_SECTION_ITEMS),
    };
  }
  if (path.endsWith('/all')) {
    const category = path.split('/').filter(Boolean).at(-2);
    const page = categoryPages[category];
    if (page) return { title: `${page.name} 전체보기`, items: page.items ?? [] };
  }
  return null;
};
