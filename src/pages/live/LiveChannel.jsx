import { useMobileLandscapePlayback } from '../../hooks/useMobileLandscapePlayback';
import { isMobilePlayback } from '../../utils/mobileLandscapePlayback';
import { useMobileLayout } from '../../hooks/useMobileLayout';
import { LiveChannelFilters } from '../../components/live/LiveChannelFilters';
import { SliderArrow } from '../../components/common/SliderArrow';
import { SectionTitle } from '../../components/common/SectionTitle';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { onAuthStateChanged } from 'firebase/auth';

import 'swiper/css';

import { auth } from '../../firebase/firebase';
import { liveChatAdapter, liveReactionAdapter } from '../../services/liveChat';
import { livePrograms, liveTop10 } from '../../data/live/liveData';
// 골프 스페셜 "이번 주 골프 중계" → ?channel=중계 id 로 들어오면 해당 골프 중계 선택
import { golfLivePrograms } from '../../data/golfData';
import { LoginModal } from '../../components/common/LoginModal';
import { ShareModal } from '../../components/common/ShareModal';

import styles from '../../styles/pages/live/LiveChannel.module.scss';
import { liveDetailAssets, liveDetailRanks } from '../../data/live/liveDetailAssets';
import { useLiveArtwork, formatLiveTitle } from '../../hooks/useLiveArtwork';

import { getCachedYoutubeLive, getYoutubeLive } from '../../services/youtube';


const formatTime = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '--:--';

  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const progressOf = (program, now) => {
  const start = new Date(program.start).getTime();
  const end = new Date(program.end).getTime();

  if (end <= start) return 0;

  return Math.max(
    0,
    Math.min(100, ((now - start) / (end - start)) * 100)
  );
};

const getChatName = (user) => {
  try {
    const profile = JSON.parse(
      localStorage.getItem('wavve-active-profile') || 'null'
    );

    if (
      typeof profile?.name === 'string' &&
      profile.name.trim()
    ) {
      return profile.name.trim().slice(0, 40);
    }
  } catch {
    // 프로필을 읽지 못하면 계정 이름 사용
  }

  return user?.displayName?.trim().slice(0, 40) || '사용자';
};

function ChannelImage({ program, className = '' }) {
  const live = getCachedYoutubeLive(program?.youtubeChannelId);
  const { image, logo, failImage } = useLiveArtwork({ ...program, image: program?.image || program?.thumbnail || program?.poster }, live);
  return image ? <img className={className} src={image} alt="" loading="lazy" draggable={false} onError={failImage} />
    : <span className={styles.imageFallback}>{logo ? <img src={logo} alt={program?.channel || ''} /> : program?.channel || 'WAVVE LIVE'}</span>;
}

const DetailIcon = ({ name, className = '' }) => <img className={`${styles.icon} ${className}`} src={liveDetailAssets[name]} alt="" draggable={false} />;

function ReservationDialog({ program, reserved, onClose, onConfirm, notice = false }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const previousFocus = document.activeElement;
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => { dialog.close(); if (previousFocus?.isConnected) previousFocus.focus(); };
  }, []);
  return createPortal(
    <dialog ref={dialogRef} className={styles.reservationDialog} aria-labelledby="live-reservation-title" aria-describedby="live-reservation-description" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose(); } }}>
      <button type="button" className={styles.reservationClose} onClick={onClose} aria-label={notice ? 'VOD 안내 닫기' : '시청 예약 닫기'}><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m5 5 14 14M19 5 5 19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg></button>
      <h2 id="live-reservation-title">{notice ? 'VOD 보기' : '시청 예약'}</h2>
      <div id="live-reservation-description" className={styles.reservationDescription}>
        {!notice && <p>&lt;{formatLiveTitle(program.title)}&gt;</p>}
        <p>{notice ? '현재 채널은 연결된 다시보기 콘텐츠가 없습니다.' : reserved ? '이미 예약된 프로그램이에요. 시청 예약을 취소할까요?' : '시청 예약을 설정할까요? 예약한 콘텐츠가 시작되면 모바일 앱 PUSH로 알려드려요.'}</p>
      </div>
      <div className={styles.reservationActions}>{!notice && <button type="button" onClick={onClose} autoFocus>취소</button>}<button type="button" onClick={notice ? onClose : onConfirm} autoFocus={notice}>확인</button></div>
    </dialog>, document.body
  );
}

export const LiveChannel = ({
  chatAdapter = liveChatAdapter,
  reactionAdapter = liveReactionAdapter,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedId = searchParams.get('channel');

  // 로그인
  const [user, setUser] = useState(auth.currentUser);
  const [authReady, setAuthReady] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const isLoggedIn = authReady && !!user;

  // 채널 선택
  const selected = useMemo(() => {
    return (
      [...liveTop10, ...livePrograms, ...golfLivePrograms].find(
        (program) =>
          String(program.channelId) === requestedId ||
          String(program.id) === requestedId
      ) ||
      liveTop10[0] ||
      livePrograms[0] ||
      null
    );
  }, [requestedId]);

  const channels = useMemo(() => {
    return [
      ...new Map(
        livePrograms.map((program) => [
          String(program.channelId),
          { ...program, youtubeChannelId: program.youtubeChannelId || liveTop10.find((item) => item.channel === program.channel)?.youtubeChannelId },
        ])
      ).values(),
    ];
  }, []);

  const [thumbnailVersion, setThumbnailVersion] = useState(0);
  const [refreshingChannels, setRefreshingChannels] = useState(false);
  const refreshLock = useRef(false);
  const lastChannelRefresh = useRef(0);
  const refreshMounted = useRef(true);
  useEffect(() => { refreshMounted.current = true; return () => { refreshMounted.current = false; }; }, []);

  useEffect(() => {
    const refreshThumbnails = () => {
      setThumbnailVersion((previous) => previous + 1);
    };

    window.addEventListener(
      'ott-live-thumbnails-updated',
      refreshThumbnails
    );
    window.addEventListener('storage', refreshThumbnails);
    window.addEventListener('focus', refreshThumbnails);

    return () => {
      window.removeEventListener(
        'ott-live-thumbnails-updated',
        refreshThumbnails
      );
      window.removeEventListener('storage', refreshThumbnails);
      window.removeEventListener('focus', refreshThumbnails);
    };
  }, []);

  const top10 = useMemo(() => {
    return liveTop10.slice(0, 10).map((program) => {
      const cachedLive = getCachedYoutubeLive(
        program.youtubeChannelId
      );

      return {
        ...program,
        image: cachedLive?.thumbnail || program.image,
      };
    });
  }, [thumbnailVersion]);

  const [category, setCategory] = useState('전체');
  const [now, setNow] = useState(Date.now());

  const categories = useMemo(
    () => [
      '전체',
      '관심',
      ...new Set(
        channels.map((program) => program.category).filter(Boolean)
      ),
    ],
    [channels]
  );

  // 현재 방송 + 다음 방송 5개
  const displaySchedule = useMemo(() => {
    if (!selected) return [];

    const startTime = new Date(selected.start).getTime();
    const endTime = new Date(selected.end).getTime();

    const currentEnd = Number.isFinite(endTime)
      ? endTime
      : Date.now();

    const originalDuration = endTime - startTime;

    const duration = Number.isFinite(originalDuration)
      ? Math.max(30 * 60 * 1000, originalDuration)
      : 60 * 60 * 1000;

    const nextTitles = [
      '이어지는 프로그램',
      '오늘의 스페셜',
      '인기 프로그램 모음',
      '채널 추천 방송',
      '심야 프로그램',
    ];

    const nextPrograms = nextTitles.map((title, index) => ({
      id: `demo-next-${selected.channelId}-${index + 1}`,
      channelId: selected.channelId,
      title,
      start: new Date(
        currentEnd + duration * index
      ).toISOString(),
      end: new Date(
        currentEnd + duration * (index + 1)
      ).toISOString(),
      isDemo: true,
    }));

    return [selected, ...nextPrograms];
  }, [selected]);

  // 플레이어
  const playerRef = useRef(null);
  const videoRef = useRef(null);
  const settingsRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(70);
  const [streamError, setStreamError] = useState('');
  const landscape = useMobileLandscapePlayback(playerRef, isLoggedIn && !streamError, selected?.channelId);
  const [playerSettingsOpen, setPlayerSettingsOpen] = useState(false);

  // 현재 모든 채널에서 동일한 MP4 사용
  const streamUrl = `${import.meta.env.BASE_URL}videos/live-demo.mp4`;

  // 관심 / 알림 / 공유
  const [favoriteChannels, setFavoriteChannels] = useState([]);
  const liked = favoriteChannels.includes(String(selected?.channelId));
  const [reactionCounts, setReactionCounts] = useState({});
  const [flyingHearts, setFlyingHearts] = useState([]);
  const [reactionError, setReactionError] = useState('');
  const reactionSession = useRef(0);
  const reactionSequence = useRef(0);
  const [reservationProgram, setReservationProgram] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [vodNoticeChannel, setVodNoticeChannel] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);

  // 채팅
  const [chatOpen, setChatOpen] = useState(false);
  const isAppLayout = useMobileLayout();
  const [miniPlayer, setMiniPlayer] = useState(false);
  // 실제 영상 대신 원래 자리에 남아 있는 프레임을 관찰해야 전환이 반복되지 않습니다.
  const playerFrameRef = useRef(null);
  const miniDismissedRef = useRef(false);
  const restorePlayer = () => {
    miniDismissedRef.current = true;
    setMiniPlayer(false);
    playerFrameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  useEffect(() => {
    if (!isAppLayout || !isLoggedIn || streamError) {
      setMiniPlayer(false);
      miniDismissedRef.current = false;
      return;
    }
    const frame = playerFrameRef.current;
    if (!frame || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      if (document.fullscreenElement || videoRef.current?.webkitDisplayingFullscreen) return;
      if (entry.isIntersecting) {
        miniDismissedRef.current = false;
        setMiniPlayer(false);
      } else if (entry.boundingClientRect.bottom <= 50 && !miniDismissedRef.current) {
        setMiniPlayer(true);
      }
    }, { root: null, rootMargin: '-50px 0px 0px 0px', threshold: 0 });
    observer.observe(frame);
    return () => observer.disconnect();
  }, [isAppLayout, isLoggedIn, streamError]);
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        miniDismissedRef.current = true;
        setMiniPlayer(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
  const [chatText, setChatText] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatError, setChatError] = useState('');
  const [chatSending, setChatSending] = useState(false);

  const chatBottomRef = useRef(null);
  const chatSessionRef = useRef(0);
  const chatSendLockRef = useRef(null);

  // 레이아웃
  const layoutRef = useRef(null);
  const top10Ref = useRef(null);


  // 스와이퍼
  const scheduleSwiper = useRef(null);
  const topSwiper = useRef(null);

  const [schedulePrev, setSchedulePrev] = useState(false);
  const [scheduleNext, setScheduleNext] = useState(false);
  const [topPrev, setTopPrev] = useState(false);
  const [topNext, setTopNext] = useState(false);

  const onLoginRequired = () => {
    if (!authReady) return;
    setLoginOpen(true);
  };

  const updateScheduleNav = (swiper) => {
    setSchedulePrev(!swiper.isBeginning);
    setScheduleNext(!swiper.isEnd);
  };

  const updateTopNav = (swiper) => {
    setTopPrev(!swiper.isBeginning);
    setTopNext(!swiper.isEnd);
  };

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      setLoginOpen(false);
    });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(
      () => setNow(Date.now()),
      30000
    );

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setReservationProgram(null);
    setFlyingHearts([]);
    setStreamError('');
    setIsPlaying(false);
    setPlayerSettingsOpen(false);

    scheduleSwiper.current?.slideTo(0, 0);
  }, [selected?.channelId]);

  // 로그인 / 채널 변경으로 새 video가 생기면 음량 반영
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = volume / 100;
    video.muted = isMuted;
  }, [volume, isMuted, isLoggedIn, selected?.channelId]);

  // 화질 안내 바깥 클릭 / ESC 닫기
  useEffect(() => {
    if (!playerSettingsOpen) return;

    const handlePointerDown = (event) => {
      if (!settingsRef.current?.contains(event.target)) {
        setPlayerSettingsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setPlayerSettingsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [playerSettingsOpen]);

  // 계정 또는 채널 변경 시 입력 및 전송 상태 초기화
  useEffect(() => {
    chatSessionRef.current += 1;
    chatSendLockRef.current = null;
    setChatText('');
    setChatSending(false);

    return () => {
      chatSessionRef.current += 1;
      chatSendLockRef.current = null;
    };
  }, [selected?.channelId, user?.uid]);

  // 채팅 실시간 구독
  useEffect(() => {
    let active = true;
    let unsubscribe;

    setMessages([]);
    setChatError('');

    if (
      !isLoggedIn ||
      !chatOpen ||
      !selected?.channelId ||
      !chatAdapter?.subscribe
    ) {
      return;
    }

    try {
      unsubscribe = chatAdapter.subscribe(
        String(selected.channelId),
        (nextMessages) => {
          if (!active) return;

          setMessages(
            Array.isArray(nextMessages) ? nextMessages : []
          );
        },
        () => {
          if (!active) return;

          setChatError(
            '채팅에 연결하지 못했습니다. 네트워크와 채팅 권한을 확인해 주세요.'
          );
        }
      );
    } catch {
      setChatError('채팅 연결에 실패했습니다.');
    }

    return () => {
      active = false;

      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [
    selected?.channelId,
    chatAdapter,
    isLoggedIn,
    user?.uid,
    chatOpen,
  ]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({
      block: 'nearest',
    });
  }, [messages, chatOpen]);

  const changeChannel = (program) => {
    setSearchParams({
      channel: String(program.channelId),
    });
  };

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (!video.paused) {
      video.pause();
      return;
    }

    try {
      if (isMobilePlayback()) void landscape.enter();
      await video.play();
    } catch (error) {
      if (error.name === 'AbortError') return;

      setStreamError('영상 재생을 시작할 수 없습니다.');
    }
  };

  // MP4 처음부터 재생
  const restartLive = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, video.currentTime - 10);
  };

  const toggleFullscreen = async () => {
    if (isMobilePlayback()) {
      if (landscape.active) landscape.exit();
      else void landscape.enter();
      return;
    }
    try {
      if (!document.fullscreenElement) {
        await playerRef.current?.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
    } catch {
      // 전체화면 요청이 취소되거나 지원되지 않는 경우
    }
  };

  const sendChat = async (event) => {
    event.preventDefault();

    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }

    const text = chatText.trim();

    if (!text || chatSendLockRef.current !== null) return;

    if (text.length > 300) {
      setChatError('메시지는 300자 이내로 입력해 주세요.');
      return;
    }

    const sendingSession = chatSessionRef.current;
    const requestToken = Symbol('chat-send');

    chatSendLockRef.current = requestToken;
    setChatError('');
    setChatSending(true);

    const message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      uid: user.uid,
      name: getChatName(user),
      text,
      createdAt: Date.now(),
    };

    try {
      if (chatAdapter?.send) {
        await chatAdapter.send(
          String(selected.channelId),
          message
        );
      } else if (chatSessionRef.current === sendingSession) {
        setMessages((previous) => [...previous, message]);
      }

      if (chatSessionRef.current === sendingSession) {
        setChatText('');
      }
    } catch {
      if (chatSessionRef.current === sendingSession) {
        setChatError(
          '메시지를 전송하지 못했습니다. 다시 시도해 주세요.'
        );
      }
    } finally {
      if (chatSendLockRef.current === requestToken) {
        chatSendLockRef.current = null;
      }

      if (chatSessionRef.current === sendingSession) {
        setChatSending(false);
      }
    }
  };

  const toggleLike = () => {
    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }

    const channelId = String(selected.channelId);
    setFavoriteChannels((previous) => previous.includes(channelId) ? previous.filter((id) => id !== channelId) : [...previous, channelId]);
  };

  const toggleReminder = (program) => {
    if (!isLoggedIn) { onLoginRequired(); return; }
    setReservationProgram(program);
  };
  const confirmReservation = () => {
    const id = reservationProgram.id;
    setReminders((previous) => previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id]);
    setReservationProgram(null);
  };
  useEffect(() => {
    const session = ++reactionSession.current;
    setReactionError('');
    setFlyingHearts([]);
    if (!isLoggedIn || !selected?.channelId) return;
    const channelId = String(selected.channelId);
    let previousCount = null;
    let active = true;
    const unsubscribe = reactionAdapter.subscribe(channelId, count => {
      if (!active || !Number.isSafeInteger(count) || count < 0) return;
      setReactionCounts(previous => ({ ...previous, [channelId]: count }));
      if (previousCount !== null && count > previousCount) {
        const hearts = Array.from({ length: Math.min(20, count - previousCount) }, () => ({
          id: ++reactionSequence.current, channelId,
        }));
        setFlyingHearts(previous => [...previous, ...hearts].slice(-20));
      }
      previousCount = count;
    }, () => {
      if (active) setReactionError('하트에 연결하지 못했습니다. 네트워크와 권한을 확인해주세요.');
    });
    return () => {
      active = false;
      if (reactionSession.current === session) reactionSession.current += 1;
      unsubscribe?.();
    };
  }, [selected?.channelId, isLoggedIn, user?.uid, reactionAdapter]);

  const addReaction = async () => {
    if (!isLoggedIn) { onLoginRequired(); return; }
    const session = reactionSession.current;
    setReactionError('');
    try {
      await reactionAdapter.send(String(selected.channelId));
    } catch {
      if (reactionSession.current === session) {
        setReactionError('하트를 전송하지 못했습니다. 잠시 후 다시 눌러주세요.');
      }
    }
  };

  const selectedLive = getCachedYoutubeLive(selected?.youtubeChannelId);
  const selectedArtwork = useLiveArtwork(selected || {}, selectedLive);
  const displayTitle = selectedArtwork.title || formatLiveTitle(selected?.title || '');
  const filteredChannels = category === '관심'
    ? [...new Map([...liveTop10, ...channels].filter((program) => favoriteChannels.includes(String(program.channelId))).map((program) => [String(program.channelId), program])).values()]
    : category === '전체' ? channels : channels.filter((program) => program.category === category);
  const refreshChannels = async () => {
    if (refreshLock.current) return;
    refreshLock.current = true;
    setRefreshingChannels(true);
    const startedAt = Date.now();
    // 연속 클릭 시 API를 다시 호출하지 않고 진행률과 저장된 정보만 갱신합니다.
    const shouldFetch = startedAt - lastChannelRefresh.current >= 30000;
    if (shouldFetch) lastChannelRefresh.current = startedAt;
    try {
      const channelIds = [...new Set([...channels, ...liveTop10].map((program) => program.youtubeChannelId).filter(Boolean))];
      await Promise.allSettled([
        ...(shouldFetch ? channelIds.map((channelId) => getYoutubeLive(channelId, { forceRefresh: true })) : []),
        new Promise((resolve) => window.setTimeout(resolve, 700)),
      ]);
      if (refreshMounted.current) {
        setNow(Date.now());
        setThumbnailVersion((previous) => previous + 1);
      }
    } finally {
      refreshLock.current = false;
      if (refreshMounted.current) setRefreshingChannels(false);
    }
  };
  const filterLabel = (label) => label === '24시간 뉴스 채널' ? '뉴스' : label;

  if (!selected) return <div className={styles.detail}>표시할 라이브 채널이 없습니다.</div>;

  return (
    <div className={styles.detail}>
      <div className={styles.layout} ref={layoutRef}>
        <div className={styles.main}>
          <div className={styles.playerFrame} ref={playerFrameRef}>
          <div className={`${styles.player} ${miniPlayer && isAppLayout && !landscape.active ? styles.miniPlayer : ''} ${landscape.active ? 'mobile-landscape-player' : ''}`}  ref={playerRef} style={{ backgroundImage: !isLoggedIn && selectedArtwork.image ? `url("${selectedArtwork.image}")` : undefined }}>
            {landscape.active && <button type="button" className="mobile-playback-action" onClick={landscape.exit}>영상에서 나가기</button>}
            {isAppLayout && isLoggedIn && !landscape.active && <button type="button" className={styles.miniToggle}
              onClick={() => { if (miniPlayer) restorePlayer(); else { miniDismissedRef.current = false; setMiniPlayer(true); } }} aria-pressed={miniPlayer}
              aria-label={miniPlayer ? '작은 화면 닫고 원래 크기로 보기' : '작은 화면으로 보기'}>
              {miniPlayer ? '원래 크기' : '작은 화면'}
            </button>}
            {isLoggedIn && (
              <video key={`${selected.channelId}-${streamUrl}`} ref={videoRef} className={styles.video}
                src={streamUrl} playsInline autoPlay muted={isMuted} loop preload="metadata"
                onLoadedMetadata={(event) => { event.currentTarget.volume = volume / 100; event.currentTarget.muted = isMuted; }}
                onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)}
                onError={() => setStreamError('영상을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')} />
            )}
            {(!authReady || !isLoggedIn || streamError) && (
              <div className={styles.playerOverlay}>
                {!authReady ? <p>로그인 상태를 확인하고 있어요</p> : !isLoggedIn ? <>
                  <h2>라이브를 시청하려면 로그인이 필요해요</h2>
                  <button type="button" className={styles.loginButton} onClick={onLoginRequired}>로그인</button>
                </> : <><h2>영상을 재생할 수 없습니다</h2><p role="status">{streamError}</p></>}
              </div>
            )}
            {isLoggedIn && !streamError && <>
              <span className={styles.liveBadge}><DetailIcon name="dot" />라이브</span>
              <div className={styles.reactionArea}>
                <div className={styles.flyingHearts} aria-hidden="true">{flyingHearts.filter((heart) => heart.channelId === String(selected.channelId)).map((heart) => <span key={heart.id} className={styles.flyingHeart} style={{ '--heart-drift': `${(heart.id % 5 - 2) * 16}px`, '--heart-color': ['#ff287f', '#ff604c', '#ff438b'][heart.id % 3] }} onAnimationEnd={() => setFlyingHearts((previous) => previous.filter((item) => item.id !== heart.id))}>♥</span>)}</div>
                <button type="button" className={styles.reaction} onClick={addReaction} aria-label="영상 좋아요">
                  <span aria-hidden="true">♥</span><small aria-live="polite" aria-atomic="true">{(reactionCounts[String(selected.channelId)] ?? 0).toLocaleString('ko-KR')}</small>
                </button>
              </div>
              <div className={styles.playerControls} aria-label="영상 플레이어 컨트롤">
                <div className={styles.playerControlsLeft}>
                  <button type="button" onClick={togglePlayback} aria-label={isPlaying ? '일시정지' : '재생'}>
                    {isPlaying ? <svg className={styles.pauseIcon} viewBox="0 0 19 22" fill="none" aria-hidden="true" focusable="false"><path d="M2 1H6V21H2zM13 1H17V21H13z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg> : <DetailIcon name="play" />}
                  </button>
                  <button type="button" onClick={restartLive} aria-label="10초 뒤로 이동"><DetailIcon name="rewind" /></button>
                  <div className={styles.sound}>
                    <button type="button" onClick={() => setIsMuted((previous) => !previous)} aria-label={isMuted ? '음소거 해제' : '음소거'} aria-pressed={isMuted}>
                      <DetailIcon name="volume" />{isMuted && <span className={styles.muteLine} aria-hidden="true" />}
                    </button>
                    <input className={styles.volume} type="range" min="0" max="100" value={isMuted ? 0 : volume} aria-label="볼륨"
                      onChange={(event) => { const value = Number(event.target.value); setVolume(value); setIsMuted(value === 0); }} />
                  </div>
                </div>
                <div className={styles.settings} ref={settingsRef}>
                  <DetailIcon name="settingsAndFullscreen" className={styles.settingsArtwork} />
                  <button className={styles.settingsHit} type="button" onClick={() => setPlayerSettingsOpen((previous) => !previous)} aria-label="화질 설정" aria-expanded={playerSettingsOpen} />
                  <button className={styles.fullscreenHit} type="button" onClick={toggleFullscreen} aria-label="전체화면 전환" />
                  {playerSettingsOpen && <div className={styles.qualityPanel}><strong>화질</strong><span>원본 화질</span><p>방송에서 제공하는 원본 화질로 재생됩니다.</p></div>}
                </div>
              </div>
            </>}
          </div>

          </div>

          {reactionError && <p className={styles.chatError} role="status">{reactionError}</p>}
          <div className={styles.channelInfo}>
            <div className={styles.channelIdentity}>
              <div className={styles.channelLogo}>{selectedArtwork.logo ? <img src={selectedArtwork.logo} alt={selected.channel} /> : <span>{selected.channel}</span>}</div>
              <div className={styles.channelText}><strong title={displayTitle}>{displayTitle}</strong><span>{formatTime(selected.start)} ~ {formatTime(selected.end)}</span></div>
            </div>
            <div className={styles.channelActions}>
              <button type="button" onClick={() => setShareOpen(true)} aria-label="공유하기"><DetailIcon name="share" /><span>보기</span></button>
              <button type="button" className={styles.favoriteButton} onClick={toggleLike} aria-pressed={liked} aria-label="채널 관심"><svg className={styles.favoriteIcon} viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21 3.2 12.5C-2 7.3 4.4.3 10 4.9L12 6.6l2-1.7C19.6.3 26 7.3 20.8 12.5Z" /></svg><span>관심</span></button>
              {selected.vodPath ? <Link to={selected.vodPath}><DetailIcon name="vod" /><span>vod 보기</span></Link>
                : <button type="button" onClick={() => setVodNoticeChannel(selected.channelId)}><DetailIcon name="vod" /><span>vod 보기</span></button>}
            </div>
          </div>

          <section className={styles.schedule} aria-label="선택한 채널 편성표">
            <Swiper key={selected.channelId} className={styles.scheduleSwiper}
              onSwiper={(swiper) => { scheduleSwiper.current = swiper; updateScheduleNav(swiper); }} onSlideChange={updateScheduleNav} onResize={updateScheduleNav}
              slidesPerView="auto" spaceBetween={12} breakpoints={{ 0: { spaceBetween: 8 }, 1025: { spaceBetween: 12 } }} initialSlide={0} speed={500} grabCursor watchOverflow>
              {displaySchedule.map((program, index) => <SwiperSlide className={styles.scheduleSlide} key={program.id}>
                <div
                  className={`${styles.scheduleCard} ${index === 0 ? styles.currentSchedule : ''}`}
                  role={index > 0 ? 'button' : undefined}
                  tabIndex={index > 0 ? 0 : undefined}
                  onClick={() => {
                    if (index > 0) toggleReminder(program);
                  }}
                  onKeyDown={(e) => {
                    if (e.target !== e.currentTarget || index === 0) return;

                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleReminder(program);
                    }
                  }}
                >
                  <div><strong title={formatLiveTitle(program.title)}>{index === 0 && <span className={styles.scheduleLive}><DetailIcon name="dot" />라이브</span>}{formatLiveTitle(program.title)}</strong><small>{formatTime(program.start)} ~ {formatTime(program.end)}</small></div>
                  {index > 0 && <button type="button" className={reminders.includes(program.id) ? styles.reminderActive : ''} onClick={(e) => {
                    e.stopPropagation();
                    toggleReminder(program);
                  }} aria-label={`${program.title} 방송 알림`} aria-pressed={reminders.includes(program.id)}><span className={styles.bellIcon} style={{ maskImage: `url("${liveDetailAssets.bell}")`, WebkitMaskImage: `url("${liveDetailAssets.bell}")` }} aria-hidden="true" /></button>}
                </div>
              </SwiperSlide>)}
            </Swiper>
            {schedulePrev && <SliderArrow thumbnailSelector={`.${styles.scheduleCard}`} direction="prev" onClick={() => scheduleSwiper.current?.slidePrev()} aria-label="이전 편성" />}
            {scheduleNext && <SliderArrow thumbnailSelector={`.${styles.scheduleCard}`} direction="next" onClick={() => scheduleSwiper.current?.slideNext()} aria-label="다음 편성" />}
          </section>

          <section className={styles.top} ref={top10Ref}>
            <SectionTitle>실시간 채널 TOP 10</SectionTitle>
            <div className={styles.topSlider}>
              <Swiper className={styles.topSwiper} onSwiper={(swiper) => { topSwiper.current = swiper; updateTopNav(swiper); }} onSlideChange={updateTopNav} onResize={updateTopNav}
                slidesPerView="auto" spaceBetween={10} breakpoints={{ 0: { spaceBetween: 8 }, 1025: { spaceBetween: 10 } }} speed={500} grabCursor watchOverflow>
                {top10.map((program, index) => <SwiperSlide className={styles.topSlide} key={program.channelId}>
                  <button type="button" className={styles.topCard} onClick={() => changeChannel(program)} aria-label={`${program.channel} 시청하기`}>
                    <div className={styles.topImage}><ChannelImage program={program} /></div>
                    <div className={styles.topMeta}><img className={styles.rank} src={liveDetailRanks[index]} alt={`${index + 1}위`} /><div><strong>{program.channel}</strong><span>{formatLiveTitle(getCachedYoutubeLive(program.youtubeChannelId)?.title || program.title)}</span></div></div>
                  </button>
                </SwiperSlide>)}
              </Swiper>
              {topPrev && <SliderArrow thumbnailSelector={`.${styles.topImage}`} direction="prev" onClick={() => topSwiper.current?.slidePrev()} aria-label="이전 채널" />}
              {topNext && <SliderArrow thumbnailSelector={`.${styles.topImage}`} direction="next" onClick={() => topSwiper.current?.slideNext()} aria-label="다음 채널" />}
            </div>
          </section>
        </div>

        <aside className={`${styles.sidebar} ${chatOpen ? styles.sidebarOpen : ''}`} aria-label="실시간 톡과 라이브 채널">
          <section className={`${styles.chat} ${chatOpen ? styles.chatOpen : ''}`} aria-label="웨이브 실시간 톡">
            <button type="button" className={styles.chatToggle} onClick={() => setChatOpen((previous) => !previous)} aria-expanded={chatOpen} aria-controls="live-talk-content">
              <strong>웨이브 실시간</strong><span className={styles.talkChevron} aria-hidden="true"><DetailIcon name="expand" /></span>
            </button>
            {chatOpen ? <>
              <div className={styles.chatContent} id="live-talk-content">
                <div className={styles.chatNotice}><p>Wavve　{formatTime(selected.start)} ~ {formatTime(selected.end)} {displayTitle}</p><p>실시간 채팅에 참여해보세요. 채팅은 5분 후 사라집니다.</p></div>
                <div className={styles.chatMessages} aria-live="polite">
                  {messages.map((message) => <p key={message.id}><b>{message.name || '사용자'}</b> {message.text}</p>)}
                  <div ref={chatBottomRef} />
                </div>
              </div>
              {chatError && <p className={styles.chatError} role="status">{chatError}</p>}
              <form className={styles.chatForm} onSubmit={sendChat}>
                <input value={chatText} maxLength={300} aria-label="채팅 메시지" onChange={(event) => setChatText(event.target.value)}
                  onFocus={() => { if (!isLoggedIn) onLoginRequired(); }}
                  placeholder={!authReady ? '로그인 상태 확인 중' : isLoggedIn ? '실시간 채팅에 참여해보세요' : '로그인 후 채팅할 수 있어요'} readOnly={!isLoggedIn || chatSending} />
                <button type="submit" disabled={!isLoggedIn || !chatText.trim() || chatSending} aria-label="채팅 전송">↑</button>
              </form>
            </> : <button type="button" id="live-talk-content" className={styles.chatPreview} onClick={() => setChatOpen(true)}>실시간 채팅에 참여해보세요</button>}
          </section>

          <section className={styles.channelList} aria-label="라이브 채널 목록">
            <div className={styles.channelListHeading}>
              <div><strong>라이브 채널</strong><button type="button" className={refreshingChannels ? styles.refreshing : ''} onClick={refreshChannels} disabled={refreshingChannels} aria-busy={refreshingChannels} aria-label="채널 목록 새로고침"><DetailIcon name="refresh" /></button></div>
              <Link to="/schedule">전체 편성표<DetailIcon name="chevron" /></Link>
            </div>
            <LiveChannelFilters
              items={categories}
              value={category}
              onChange={setCategory}
              formatLabel={filterLabel}
            />
            <div className={styles.channelScroll} aria-busy={refreshingChannels}>
              {filteredChannels.length === 0 && <p className={styles.emptyChannels}>관심 채널이 없어요.</p>}
              {filteredChannels.map((program) => <button type="button" key={program.channelId}
                aria-pressed={String(selected.channelId) === String(program.channelId)} className={`${styles.channelItem} ${String(selected.channelId) === String(program.channelId) ? styles.selectedChannel : ''}`} onClick={() => changeChannel(program)}>
                <div className={styles.channelThumb}><ChannelImage program={program} /><span className={styles.channelProgress}><span style={{ width: `${progressOf(program, now)}%` }} /></span></div>
                <div className={styles.channelItemText}><strong>{formatLiveTitle(getCachedYoutubeLive(program.youtubeChannelId)?.title || program.title)}</strong><small>{program.channel}</small></div>
              </button>)}
            </div>
          </section>
        </aside>
      </div>
      {vodNoticeChannel === selected.channelId && <ReservationDialog notice onClose={() => setVodNoticeChannel(null)} />}
      {reservationProgram && <ReservationDialog program={reservationProgram} reserved={reminders.includes(reservationProgram.id)} onClose={() => setReservationProgram(null)} onConfirm={confirmReservation} />}
      {shareOpen && <ShareModal title={`${selected.channel} - ${displayTitle}`} onClose={() => setShareOpen(false)} />}
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
};

export default LiveChannel;
