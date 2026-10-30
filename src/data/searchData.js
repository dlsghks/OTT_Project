import { withContent } from './contentCatalog';


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

// 하단 추천 콘텐츠 (임시 데이터)
export const searchContents = [
    { id: 1, title: '그 해 우리는', image: '', badge: '독점', isOriginal: false },
    { id: 2, title: '낭만닥터 김사부', image: '', badge: '', isOriginal: false },
    { id: 3, title: '커넥션', image: '', badge: '', isOriginal: true },
    { id: 4, title: '수사반장 1958', image: '', badge: '', isOriginal: false },
    { id: 5, title: '우리들의 블루스', image: '', badge: '', isOriginal: false },
    { id: 6, title: '악귀', image: '', badge: '독점', isOriginal: false },
].map((entry) => withContent(entry, 'search'));
