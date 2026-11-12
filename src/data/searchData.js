import { categoryPages } from './categoryData';


export const popularKeywords = [
    { rank: 1, keyword: '나의 완벽한 비서', change: 'same' },
    { rank: 2, keyword: '런닝맨', change: 'same' },
    { rank: 3, keyword: '귀궁', change: 'same' },
    { rank: 4, keyword: '미지의 서울', change: 'up' },
    { rank: 5, keyword: '신병3', change: 'new' },
    { rank: 6, keyword: '틈만 나면,', change: 'up' },
    { rank: 7, keyword: '너 말고 다른 연애', change: 'new' },
    { rank: 8, keyword: '인턴', change: 'up' },
    { rank: 9, keyword: '미운 우리 새끼', change: 'new' },
    { rank: 10, keyword: '꼬리에 꼬리를 무는 그날 이야기', change: 'up' },
];

// 상세 페이지와 동일한 드라마 데이터를 사용해 포스터와 이동 경로를 함께 유지합니다.
export const searchContents = categoryPages.drama.items.slice(0, 6);
