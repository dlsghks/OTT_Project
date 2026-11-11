import { VoucherWatchActions } from '../../components/common/VoucherWatchActions';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DetailHero } from '../../components/detail/DetailHero';
import { DetailLayout } from '../../components/detail/DetailLayout';
import { DetailMessage } from '../../components/detail/DetailMessage';
import { homeSections } from '../../data/home/homeData';
import { homeContentBySection } from '../../data/home/requestedHomeSections';
import { useDetailActions } from '../../hooks/useDetailActions';
import { getImagePath } from '../../utils/imagePath';
import '../../styles/pages/homeContent/HomeContentDetail.scss';
import { useVideoPlayer } from '../../hooks/useVideoPlayer';
import { searchYoutube } from '../../services/youtubeSearch';

const comingSoonItems =
    homeSections.find((section) => section.id === 'coming-soon')?.items ?? [];

const mySonVideos = [
    { title: '티저4', duration: '1분' },
    { title: '티저3', duration: '6분' },
    { title: '티저2', duration: '1분 미만' },
    { title: '티저1', duration: '1분 미만' },
];

const jungEpisodes = [...homeContentBySection['jung-hyung-don']]
    .sort((a, b) => b.episodeNumber - a.episodeNumber)
    .map((episode) => ({
        ...episode,
        title: `${episode.episodeNumber}. ${episode.title}`,
        date: episode.updatedAt,
        searchQuery: episode.title,
    }));

const JUNG_CHANNEL_ID = 'UCsbNh54XE17pOZrdqW3VyXQ';

const videoLists = {
    'coming-soon-01': {
        episodes: [
            { title: '26년 11월 먼슬리웨이브', duration: '1분 미만', date: '2026-10-30' },
            { title: '26년 10월 먼슬리웨이브', duration: '1분 미만', date: '2026-09-30' },
            { title: '26년 9월 먼슬리웨이브', duration: '1분 미만', date: '2026-09-01' },
            { title: '26년 8월 먼슬리웨이브', duration: '1분 미만', date: '2026-08-03' },
            { title: '26년 7월 먼슬리웨이브', duration: '1분 미만', date: '2026-07-01' },
            { title: '26년 6월 먼슬리웨이브', duration: '1분 미만', date: '2026-06-01' },
            { title: '26년 5월 먼슬리웨이브', duration: '1분 미만', date: '2026-04-30' },
            { title: '26년 4월 먼슬리웨이브', duration: '1분 미만', date: '2026-04-01' },
            { title: 'Wavve golf', duration: '1분 미만', date: '2026-03-27' },
            { title: '26년 3월 먼슬리웨이브', duration: '1분 미만', date: '2026-02-27' },
        ].map((episode, index) => ({
            ...episode,
            image: `/images/home/section/comingSoon/comingsoon${String(index + 1).padStart(2, '0')}.jpg`,
        })),
    },
    'coming-soon-02': {
        trailers: [{ title: '티저1', duration: '1분 미만' }],
    },
    'coming-soon-my-son': {
        trailers: mySonVideos,
    },
    'coming-soon-04': {
        episodes: [
            {
                title: '1부 <문무>의 시대가 온다',
                duration: '31분',
                date: '2026-11-07',
                description: '문무 스페셜 1부',
            },
            {
                title: '2부 영웅들이 깨어난다',
                duration: '31분',
                date: '2026-11-08',
                description: '문무 스페셜 2부',
            },
        ],
        trailers: [{ title: '티저1. 너의 뜻은 어디를 향하고 있느냐' }],
    },
    'coming-soon-05': {
        trailers: [{ title: '티저', duration: '1분 미만' }],
    },
};

export const HomeContentDetail = () => {
    const { sectionId, contentId } = useParams();

    const items =
        sectionId === 'coming-soon'
            ? comingSoonItems
            : sectionId === 'jung-hyung-don'
                ? homeContentBySection['jung-hyung-don']
                : undefined;

    const item = items?.find((entry) => entry.id === contentId);

    if (!item) {
        return (
            <DetailMessage
                message="콘텐츠를 찾을 수 없어요."
                backLink="/"
                backLabel="홈으로 돌아가기"
            />
        );
    }

    return <HomeContentBody key={`${sectionId}:${item.id}`} item={item} sectionId={sectionId} />;
};

const HomeContentBody = ({ item, sectionId }) => {
    const actions = useDetailActions({
        id: item.id,
        title: item.title,
        image: item.image,
        type: 'program',
    });

    const isComingSoon = sectionId === 'coming-soon';
    const isLineup = isComingSoon && item.id === 'coming-soon-01';
    const isMunmu = isComingSoon && item.id === 'coming-soon-04';
    const isJung = sectionId === 'jung-hyung-don';
    const { episodes = [], trailers = [] } = isJung
        ? { episodes: jungEpisodes }
        : videoLists[item.id] ?? {};

    const player = useVideoPlayer();

    const playComingSoonVideo = () => {
        player.openVideo({
            videoId: 'UWeMT61VgwQ',
            title: '먼슬리 웨이브 · 11월 라인업',
        });
    };

    const playJungEpisode = (episode) => {
        if (episode.id === 'jung-hyung-don-1') {
            player.openVideo({
                videoId: 'Yd-1nb4iPGo',
                title: episode.title,
                date: episode.date,
            });
            return;
        }
        player.openSearch(
            { title: episode.title, source: { query: episode.searchQuery } },
            () => searchYoutube(episode.searchQuery, JUNG_CHANNEL_ID)
        );
    };
    const upcomingWatchAction = isComingSoon && episodes.length === 0 ? (
        <button
            type="button"
            className="movie-hero__buy home-content-watch--upcoming"
            disabled
        >
            공개 예정
        </button>
    ) : undefined;

    const [activeTab, setActiveTab] = useState(
        episodes.length ? 'episodes' : trailers.length ? 'trailers' : 'recommendations'
    );

    const showEpisodes = () => {
        setActiveTab('episodes');
        document.getElementById('home-content-sections')?.scrollIntoView({
            block: 'start',
        });
    };

    const showVideos = () => {
        setActiveTab(isMunmu ? 'trailers' : 'episodes');
        document.getElementById('home-content-sections')?.scrollIntoView({
            block: 'start',
        });
    };

    return (
        <DetailLayout
            actions={actions}
            player={player}
            hero={
                <DetailHero
                    title={isJung ? '정형돈의 제목없음 TV' : item.title}
                    logo={isJung ? getImagePath('/images/home/section/jung/jungTitle.png') : undefined}
                    backdrop={getImagePath(isComingSoon ? '/images/home/section/comingSoon/coming-soon-hero.jpg' : isJung ? '/images/home/section/jung/jungHero.jpg' : item.image)}
                    meta={isComingSoon ? 'Coming Soon' : '정형돈의 제목없음 TV'}
                    overview={isComingSoon ? item.description : `업로드 ${item.updatedAt}`}
                    showWatch={false}
                    watchActions={isLineup || isMunmu || isJung ? (
                        <div className="home-lineup-actions">
                            {actions.hasVoucher ? (
                                <button
                                    type="button"
                                    className="movie-hero__buy"
                                    onClick={showVideos}
                                >
                                    {isMunmu ? '에피소드 티저1 보기' : '에피소드 보기'}
                                </button>
                            ) : (
                                <VoucherWatchActions
                                    onPurchase={actions.onPurchaseVoucher}
                                />
                            )}
                        </div>
                    ) : upcomingWatchAction}
                    actions={actions}
                />
            }
        >
            {(isComingSoon || isJung) && (
                <ComingSoonSections
                    item={item}
                    episodes={episodes}
                    trailers={trailers}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onPlay={isJung ? playJungEpisode : playComingSoonVideo}
                    playEntireRow={isComingSoon}
                />
            )}
        </DetailLayout>
    );
};

const ComingSoonSections = ({ item, episodes, trailers, activeTab, setActiveTab, onPlay, playEntireRow }) => {
    const tabs = [
        ...(episodes.length ? [{ id: 'episodes', label: '에피소드' }] : []),
        ...(trailers.length ? [{ id: 'trailers', label: '관련영상' }] : []),
        { id: 'recommendations', label: '추천' },
        { id: 'info', label: '상세정보' },
    ];
    const activeLabel = tabs.find((tab) => tab.id === activeTab).label;
    const videos = activeTab === 'episodes' ? episodes : trailers;

    return (
        <div id="home-content-sections" className="home-content-sections">
            <div className="home-content-sections__tabs" role="group" aria-label="콘텐츠 정보">
                {tabs.map(({ id, label }) => (
                    <button
                        key={id}
                        type="button"
                        aria-pressed={activeTab === id}
                        onClick={() => setActiveTab(id)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <section className="home-content-sections__panel" aria-label={activeLabel}>
                {(activeTab === 'episodes' || activeTab === 'trailers') && (
                    <ul className={`home-content-sections__list home-content-sections__list--${activeTab}`}>
                        {videos.map((video) => (
                            <li
                                key={video.title}
                                className={`home-content-sections__item${playEntireRow ? ' home-content-sections__item--playable' : ''}`}
                            >
                                {onPlay ? (
                                    <button
                                        type="button"
                                        className="home-content-sections__play"
                                        aria-label={`${video.title} 재생`}
                                        onClick={() => onPlay(video)}
                                    >
                                        <img src={getImagePath(video.image ?? item.image)} alt="" loading="lazy" />
                                    </button>
                                ) : (
                                    <img src={getImagePath(video.image ?? item.image)} alt="" loading="lazy" />
                                )}
                                <div>
                                    <h3>{video.title}</h3>
                                    {(video.duration || video.date) && (
                                        <p>{[video.duration, video.date].filter(Boolean).join(' · ')}</p>
                                    )}
                                    {video.description && <p>{video.description}</p>}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {activeTab === 'recommendations' && (
                    <ul className="home-content-sections__list home-content-sections__list--trailers">
                        {comingSoonItems.filter((entry) => entry.id !== item.id).map((entry) => (
                            <li key={entry.id} className="home-content-sections__item">
                                <Link to={`/home-content/coming-soon/${entry.id}`}>
                                    <img src={getImagePath(entry.image)} alt="" loading="lazy" />
                                    <h3>{entry.title}</h3>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}

                {activeTab === 'info' && (
                    <div className="home-content-sections__info">
                        <h3>{item.title}</h3>
                        {item.description && <p>{item.description}</p>}
                    </div>
                )}
            </section>
        </div>
    );
};