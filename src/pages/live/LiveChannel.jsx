import { SliderArrow } from '../../components/common/SliderArrow';
import { SectionTitle } from '../../components/common/SectionTitle';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { onAuthStateChanged } from 'firebase/auth';

import 'swiper/css';

import { auth } from '../../firebase/firebase';
import { liveChatAdapter } from '../../services/liveChat';
import { livePrograms, liveTop10 } from '../../data/live/liveData';
// 골프 스페셜 "이번 주 골프 중계" → ?channel=중계 id 로 들어오면 해당 골프 중계 선택
import { golfLivePrograms } from '../../data/golfData';
import { LoginModal } from '../../components/common/LoginModal';
import { ShareModal } from '../../components/common/ShareModal';
import { getImagePath } from '../../utils/imagePath';

import '../../styles/pages/live/LiveChannel.scss';

import { getCachedYoutubeLive } from '../../services/youtube';


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

const imageSrc = (path) => (
  path ? getImagePath(path) : ''
);

const playerIcon = (filename) => (
  getImagePath(`/images/live/uibutton/${filename}`)
);

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
  const [failed, setFailed] = useState(false);

  const src = imageSrc(
    program?.image || program?.thumbnail || program?.poster
  );

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <span className="live-image-fallback">
        {program?.channel || program?.title || 'WAVVE LIVE'}
      </span>
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt={program?.title || program?.channel || '채널 이미지'}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export const LiveChannel = ({
  chatAdapter = liveChatAdapter,
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
          program,
        ])
      ).values(),
    ];
  }, []);

  const [thumbnailVersion, setThumbnailVersion] = useState(0);

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
      ...new Set(
        channels.map((program) => program.category).filter(Boolean)
      ),
    ],
    [channels]
  );

  const filteredChannels = category === '전체'
    ? channels
    : channels.filter((program) => program.category === category);

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
  const [playerSettingsOpen, setPlayerSettingsOpen] = useState(false);

  // 현재 모든 채널에서 동일한 MP4 사용
  const streamUrl = `${import.meta.env.BASE_URL}videos/live-demo.mp4`;

  // 관심 / 알림 / 공유
  const [liked, setLiked] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [shareOpen, setShareOpen] = useState(false);

  // 채팅
  const [chatOpen, setChatOpen] = useState(false);
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

  const [panelHeight, setPanelHeight] = useState(680);
  const [playerHeight, setPlayerHeight] = useState(440);

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
    setLiked(false);
    setReminders([]);
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

  useEffect(() => {
    const measure = () => {
      if (
        !playerRef.current ||
        !top10Ref.current ||
        !layoutRef.current
      ) {
        return;
      }

      const player = playerRef.current.getBoundingClientRect();
      const top = top10Ref.current.getBoundingClientRect();
      const layout = layoutRef.current.getBoundingClientRect();

      setPlayerHeight(Math.round(player.height));
      setPanelHeight(
        Math.max(320, Math.round(top.bottom - layout.top))
      );
    };

    measure();

    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(measure)
      : null;

    [
      playerRef.current,
      top10Ref.current,
      layoutRef.current,
    ].filter(Boolean).forEach((element) => {
      observer?.observe(element);
    });

    window.addEventListener('resize', measure);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [selected?.channelId]);

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

    setLiked((previous) => !previous);
  };

  const toggleReminder = (id) => {
    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }

    setReminders((previous) => (
      previous.includes(id)
        ? previous.filter((value) => value !== id)
        : [...previous, id]
    ));
  };

  if (!selected) {
    return (
      <main className="live-channel-page">
        표시할 라이브 채널이 없습니다.
      </main>
    );
  }

  return (
    <main className="live-channel-page">
      <div className="live-channel-layout" ref={layoutRef}>
        <div className="live-channel-main">
          {/* MP4 플레이어 */}
          <div
            className="live-player"
            ref={playerRef}
            style={{
              backgroundColor: '#000',
              backgroundImage:
                !isLoggedIn && selected.image
                  ? `url("${imageSrc(selected.image)}")`
                  : 'none',
            }}
          >
            {isLoggedIn && (
              <video
                key={`${selected.channelId}-${streamUrl}`}
                ref={videoRef}
                className="live-player__video"
                src={streamUrl}
                playsInline
                autoPlay
                muted={isMuted}
                loop
                preload="metadata"
                onLoadedMetadata={(event) => {
                  event.currentTarget.volume = volume / 100;
                  event.currentTarget.muted = isMuted;
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onError={() => {
                  setStreamError(
                    '영상을 불러오지 못했습니다. public/videos/live-demo.mp4 파일을 확인해 주세요.'
                  );
                }}
              />
            )}

            <div className="live-player__overlay">
              {!authReady ? (
                <p>로그인 상태를 확인하고 있어요</p>
              ) : !isLoggedIn ? (
                <>
                  <h2>
                    라이브를 시청하려면 로그인이 필요해요
                  </h2>

                  <button
                    type="button"
                    className="live-player__button"
                    onClick={onLoginRequired}
                  >
                    로그인
                  </button>
                </>
              ) : streamError ? (
                <>
                  <h2>영상을 재생할 수 없습니다</h2>
                  <p>{streamError}</p>
                </>
              ) : null}
            </div>

            {/* 호버 컨트롤 */}
            {isLoggedIn && !streamError && (
              <div
                className="live-player__controls"
                aria-label="영상 플레이어 컨트롤"
              >
                <div className="live-player__controls-left">
                  <img
                    className="live-player__live-image"
                    src={playerIcon('onLive.png')}
                    alt="라이브"
                  />

                  <div className="live-player__button-row">
                    <button
                      type="button"
                      onClick={togglePlayback}
                      aria-label={
                        isPlaying ? '일시정지' : '재생'
                      }
                    >
                      {isPlaying ? (
                        <img
                          src={playerIcon('pause.png')}
                          alt=""
                        />
                      ) : (
                        <svg
                          viewBox="0 0 32 32"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M7 4L27 16L7 28V4Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={restartLive}
                      aria-label="10초 뒤로 이동"
                    >
                      <img
                        src={playerIcon('revert.png')}
                        alt=""
                      />
                    </button>

                    <div className="live-player__sound">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMuted((previous) => !previous);
                        }}
                        aria-label={
                          isMuted ? '음소거 해제' : '음소거'
                        }
                        aria-pressed={isMuted}
                      >
                        <img
                          src={playerIcon('volume.png')}
                          alt=""
                        />

                        {isMuted && (
                          <span
                            className="live-player__mute-line"
                            aria-hidden="true"
                          />
                        )}
                      </button>

                      <input
                        className="live-player__volume"
                        type="range"
                        min="0"
                        max="100"
                        value={isMuted ? 0 : volume}
                        aria-label="볼륨"
                        onChange={(event) => {
                          const nextVolume = Number(
                            event.target.value
                          );

                          setVolume(nextVolume);
                          setIsMuted(nextVolume === 0);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="live-player__controls-right">
                  <div
                    className="live-player__settings-wrap"
                    ref={settingsRef}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setPlayerSettingsOpen(
                          (previous) => !previous
                        );
                      }}
                      aria-label="화질 설정"
                      aria-expanded={playerSettingsOpen}
                    >
                      <img
                        src={playerIcon('setting.png')}
                        alt=""
                      />
                    </button>

                    {playerSettingsOpen && (
                      <div className="live-player__quality-panel">
                        <strong>화질</strong>
                        <span>원본 화질</span>
                        <p>
                          현재 영상은 단일 MP4 파일로
                          재생됩니다.
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    aria-label="전체화면 전환"
                  >
                    <img
                      src={playerIcon('full.png')}
                      alt=""
                    />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 채널 정보 */}
          <div className="live-channel-info">
            <div className="live-channel-info__text">
              <strong>{selected.channel}</strong>

              <div>
                <b>{selected.title}</b>
                <span>
                  {formatTime(selected.start)}
                  {' ~ '}
                  {formatTime(selected.end)}
                </span>
              </div>
            </div>

            <div className="live-channel-info__actions">
              <button
                type="button"
                onClick={toggleLike}
                aria-pressed={liked}
              >
                {liked ? '♥' : '♡'} 관심
              </button>

              <button
                type="button"
                onClick={() => setShareOpen(true)}
              >
                ↥ 공유
              </button>
            </div>
          </div>

          {/* 편성표 */}
          <section
            className="live-schedule"
            aria-label="선택한 채널 편성표"
          >
            <div className="live-schedule__heading">
              <SectionTitle>{selected.channel} 편성표</SectionTitle>
              <Link to="/schedule">전체 편성표 ›</Link>
            </div>

            <div className="live-schedule__slider">
              <Swiper
                key={selected.channelId}
                onSwiper={(swiper) => {
                  scheduleSwiper.current = swiper;
                  updateScheduleNav(swiper);
                }}
                onSlideChange={updateScheduleNav}
                onResize={updateScheduleNav}
                initialSlide={0}
                slidesPerView={1}
                slidesPerGroup={1}
                centeredSlides={false}
                spaceBetween={10}
                speed={500}
                grabCursor
                simulateTouch
                watchOverflow
                breakpoints={{
                  640: {
                    slidesPerView: 3,
                    spaceBetween: 10,
                  },
                }}
              >
                {displaySchedule.map((program, index) => {
                  const isCurrent = index === 0;

                  return (
                    <SwiperSlide key={program.id}>
                      <div
                        className={`live-schedule__item ${isCurrent ? 'is-current' : ''
                          }`}
                      >
                        <div className="live-schedule__item-title">
                          <strong>
                            {isCurrent && (
                              <span className="live-schedule__live">
                                ● 라이브
                              </span>
                            )}

                            {program.title}

                            {program.isDemo && (
                              <span className="live-schedule__demo">
                                {' '}(예시)
                              </span>
                            )}
                          </strong>

                          {!isCurrent && (
                            <button
                              type="button"
                              className={
                                'live-schedule__action ' +
                                'live-schedule__bell ' +
                                (
                                  reminders.includes(program.id)
                                    ? 'is-active'
                                    : ''
                                )
                              }
                              onClick={() => {
                                toggleReminder(program.id);
                              }}
                              aria-label={
                                `${program.title} 방송 알림`
                              }
                              aria-pressed={
                                reminders.includes(program.id)
                              }
                            >
                              🔔
                            </button>
                          )}
                        </div>

                        <small>
                          {formatTime(program.start)}
                          {' ~ '}
                          {formatTime(program.end)}
                        </small>
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>

              {schedulePrev && (
                <SliderArrow direction="prev"
                  onClick={() => {
                    scheduleSwiper.current?.slidePrev();
                  }}
                  aria-label="이전 편성"
                 />
              )}

              {scheduleNext && (
                <SliderArrow direction="next"
                  onClick={() => {
                    scheduleSwiper.current?.slideNext();
                  }}
                  aria-label="다음 편성"
                 />
              )}
            </div>
          </section>

          {/* TOP10: 기존 SCSS 클래스 유지 */}
          <section className="live-top20" ref={top10Ref}>
            <SectionTitle>실시간 채널 TOP 10</SectionTitle>

            <div className="live-top20__slider">
              <Swiper
                onSwiper={(swiper) => {
                  topSwiper.current = swiper;
                  updateTopNav(swiper);
                }}
                onSlideChange={updateTopNav}
                onResize={updateTopNav}
                slidesPerView={2}
                slidesPerGroup={2}
                spaceBetween={12}
                speed={500}
                grabCursor
                simulateTouch
                longSwipesRatio={0.1}
                shortSwipes
                watchOverflow
                breakpoints={{
                  640: {
                    slidesPerView: 3,
                    slidesPerGroup: 3,
                    spaceBetween: 14,
                  },
                  1024: {
                    slidesPerView: 4,
                    slidesPerGroup: 4,
                    spaceBetween: 16,
                  },
                  1440: {
                    slidesPerView: 5,
                    slidesPerGroup: 5,
                    spaceBetween: 20,
                  },
                }}
              >
                {top10.map((program, index) => (
                  <SwiperSlide key={program.channelId}>
                    <button
                      type="button"
                      className="live-top20__card"
                      onClick={() => changeChannel(program)}
                    >
                      <div className="live-top20__image">
                        <ChannelImage program={program} />
                      </div>

                      <div className="live-top20__meta">
                        <em>{index + 1}</em>

                        <div>
                          <strong>{program.channel}</strong>
                          <span>{program.title}</span>
                        </div>
                      </div>
                    </button>
                  </SwiperSlide>
                ))}
              </Swiper>

              {topPrev && (
                <SliderArrow direction="prev"
                  onClick={() => topSwiper.current?.slidePrev()}
                  aria-label="이전 채널"
                 />
              )}

              {topNext && (
                <SliderArrow direction="next"
                  onClick={() => topSwiper.current?.slideNext()}
                  aria-label="다음 채널"
                 />
              )}
            </div>
          </section>
        </div>

        {/* 오른쪽 패널 */}
        <aside
          className="live-sidebar"
          style={{ height: panelHeight }}
        >
          <section
            className={`live-chat ${chatOpen ? 'is-open' : ''}`}
            style={
              chatOpen ? { height: playerHeight } : undefined
            }
          >
            <button
              type="button"
              className="live-sidebar__heading live-chat__toggle"
              onClick={() => {
                setChatOpen((previous) => !previous);
              }}
              aria-expanded={chatOpen}
            >
              <strong>웨이브 실시간</strong>
              <span>{chatOpen ? '⌃' : '⌄'}</span>
            </button>

            {chatOpen ? (
              <>
                <div
                  className="live-chat__messages"
                  aria-live="polite"
                >
                  <p>실시간 채팅에 참여해보세요.</p>

                  {!chatAdapter && (
                    <p className="live-chat__demo-note">
                      현재 화면에서만 보이는 테스트 채팅입니다.
                    </p>
                  )}

                  {messages.map((message) => (
                    <p key={message.id}>
                      <b>{message.name || '사용자'}</b>
                      {' '}
                      {message.text}
                    </p>
                  ))}

                  <div ref={chatBottomRef} />
                </div>

                {chatError && (
                  <p
                    className="live-chat__error"
                    role="status"
                  >
                    {chatError}
                  </p>
                )}

                <form
                  className="live-chat__form"
                  onSubmit={sendChat}
                >
                  <input
                    value={chatText}
                    maxLength={300}
                    aria-label="채팅 메시지"
                    onChange={(event) => {
                      setChatText(event.target.value);
                    }}
                    onFocus={() => {
                      if (!isLoggedIn) onLoginRequired();
                    }}
                    placeholder={
                      !authReady
                        ? '로그인 상태 확인 중'
                        : isLoggedIn
                          ? '메시지를 입력하세요'
                          : '로그인 후 채팅할 수 있어요'
                    }
                    readOnly={!isLoggedIn || chatSending}
                  />

                  <button
                    type="submit"
                    disabled={
                      !isLoggedIn ||
                      !chatText.trim() ||
                      chatSending
                    }
                    aria-label="채팅 전송"
                  >
                    ↑
                  </button>
                </form>
              </>
            ) : (
              <button
                type="button"
                className="live-chat__preview"
                onClick={() => setChatOpen(true)}
              >
                실시간 채팅에 참여해보세요
              </button>
            )}
          </section>

          <section className="live-channel-list">
            <div className="live-sidebar__heading">
              <strong>전체 채널</strong>
              <Link to="/schedule">전체 편성표 ›</Link>
            </div>

            <div className="live-channel-list__filters">
              {categories.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={category === item ? 'active' : ''}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="live-channel-list__scroll">
              {filteredChannels.map((program) => (
                <button
                  type="button"
                  key={program.channelId}
                  className={`live-channel-list__item ${String(selected.channelId) ===
                    String(program.channelId)
                    ? 'active'
                    : ''
                    }`}
                  onClick={() => changeChannel(program)}
                >
                  <div className="live-channel-list__thumb">
                    <ChannelImage program={program} />
                    <span>무료</span>

                    <div
                      className="live-channel-list__progress"
                      style={{
                        width: `${progressOf(program, now)}%`,
                      }}
                    />
                  </div>

                  <div>
                    <strong>
                      {program.title}

                      {program.isDemo && (
                        <span className="live-schedule__demo">
                          {' '}(예시)
                        </span>
                      )}
                    </strong>

                    <small>{program.channel}</small>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {shareOpen && (
        <ShareModal
          title={`${selected.channel} - ${selected.title}`}
          onClose={() => setShareOpen(false)}
        />
      )}

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
      />
    </main>
  );
};

export default LiveChannel;