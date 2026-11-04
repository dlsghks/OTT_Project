import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { livePrograms } from '../../data/liveData';
import { LoginModal } from '../../components/common/LoginModal';
import { getImagePath } from '../../utils/imagePath';
import '../../styles/pages/LiveChannel.scss';

const formatTime = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '--:--' : date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
};
const progressOf = (program, now) => {
  const start = new Date(program.start).getTime();
  const end = new Date(program.end).getTime();
  return end > start ? Math.max(0, Math.min(100, (now - start) / (end - start) * 100)) : 0;
};

// isLoggedIn: 현재 프로젝트의 로그인/비로그인 테스트 상태를 그대로 사용합니다.
// chatAdapter (선택): { subscribe(channelId, callback) => unsubscribe, send(channelId, message) => Promise }
// 어댑터 없이도 브라우저 내 채팅 UI 테스트는 가능합니다. (다른 사용자에게 전송되지 않음)
const imageSrc = (path) => path ? getImagePath(path) : '';

function ChannelImage({ program, className = '' }) {
  const [failed, setFailed] = useState(false);
  const src = imageSrc(program?.image || program?.thumbnail || program?.poster);
  useEffect(() => { setFailed(false); }, [src]);
  return src && !failed
    ? <img className={className} src={src} alt={program?.title || program?.channel || '채널 이미지'} loading="lazy" onError={() => setFailed(true)} />
    : <span className="live-image-fallback">{program?.channel || program?.title || 'WAVVE LIVE'}</span>;
}

export const LiveChannel = ({ isLoggedIn = false, chatAdapter = null }) => {
  const [loginOpen, setLoginOpen] = useState(false);

  const onLoginRequired = () => {
    setLoginOpen(true);
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedId = searchParams.get('channel');
  const selected = useMemo(() => livePrograms.find(p => String(p.channelId) === requestedId || String(p.id) === requestedId) ?? livePrograms[0], [requestedId]);
  const channels = useMemo(() => [...new Map(livePrograms.map(p => [String(p.channelId), p])).values()], []);
  // 이 페이지에서는 현재 방송 1개 + 다음 방송 5개만 표시합니다.
  // 다음 방송은 UI 확인을 위한 임시 편성 데이터입니다.
  const displaySchedule = useMemo(() => {
    if (!selected) return [];
    // 현재 방송부터 표시합니다. 과거 방송은 편성 리스트에서 제외합니다.
    const currentStart = new Date(selected.start).getTime();
    const currentEnd = new Date(selected.end).getTime();
    const duration = Math.max(30 * 60 * 1000,
      Number.isFinite(currentEnd - currentStart) ? currentEnd - currentStart : 60 * 60 * 1000);
    const nextTitles = ['이어지는 프로그램', '오늘의 스페셜', '인기 프로그램 모음', '채널 추천 방송', '심야 프로그램'];
    const nextPrograms = Array.from({ length: 5 }, (_, i) => ({
      id: `demo-next-${selected.channelId}-${i + 1}`,
      channelId: selected.channelId,
      title: nextTitles[i],
      start: new Date(currentEnd + duration * i).toISOString(),
      end: new Date(currentEnd + duration * (i + 1)).toISOString(),
      isDemo: true,
    }));
    return [selected, ...nextPrograms];
  }, [selected]);
  const displayCurrentIndex = 0;
  const [now, setNow] = useState(Date.now());
  const [liked, setLiked] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatText, setChatText] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatError, setChatError] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [category, setCategory] = useState('전체');
  const [adComplete, setAdComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(70);
  const [playerSettingsOpen, setPlayerSettingsOpen] = useState(false);
  const scheduleSwiper = useRef(null);
  const playerRef = useRef(null);
  const videoRef = useRef(null);
  const chatBottomRef = useRef(null);
  const [streamError, setStreamError] = useState('');
  const top20Ref = useRef(null);
  const layoutRef = useRef(null);
  const [panelHeight, setPanelHeight] = useState(680);
  const [playerHeight, setPlayerHeight] = useState(440);
  const topSwiper = useRef(null);
  const [topPrev, setTopPrev] = useState(false);
  const [topNext, setTopNext] = useState(false);
  const [schedulePrev, setSchedulePrev] = useState(false);
  const [scheduleNext, setScheduleNext] = useState(false);
  const shareUrl = typeof window === 'undefined' ? '' : window.location.href;
  const updateScheduleNav = swiper => { setSchedulePrev(!swiper.isBeginning); setScheduleNext(!swiper.isEnd); };

  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(id); }, []);
  useEffect(() => { setAdComplete(false); setLiked(false); setIsPlaying(true); setPlayerSettingsOpen(false); setStreamError(''); }, [selected?.channelId]);
  useEffect(() => { scheduleSwiper.current?.slideTo(0, 0); }, [selected?.channelId, displayCurrentIndex]);
  useEffect(() => {
    const measure = () => {
      if (!playerRef.current || !top20Ref.current || !layoutRef.current) return;
      const player = playerRef.current.getBoundingClientRect();
      const top = top20Ref.current.getBoundingClientRect();
      const layout = layoutRef.current.getBoundingClientRect();
      setPlayerHeight(Math.round(player.height));
      setPanelHeight(Math.max(320, Math.round(top.bottom - layout.top)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    [playerRef.current, top20Ref.current, layoutRef.current].filter(Boolean).forEach(el => observer.observe(el));
    window.addEventListener('resize', measure);
    return () => { observer.disconnect(); window.removeEventListener('resize', measure); };
  }, [selected?.channelId]);
  useEffect(() => {
    if (!shareOpen) return;
    const onKey = e => { if (e.key === 'Escape') { setShareOpen(false); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [shareOpen]);
  // 채널을 변경하면 채팅을 초기화하고, 어댑터가 있으면 해당 채널의 메시지를 구독합니다.
  useEffect(() => {
    setMessages([]);
    setChatError('');
    if (!selected?.channelId || !chatAdapter?.subscribe) return;
    try {
      return chatAdapter.subscribe(String(selected.channelId), next => setMessages(Array.isArray(next) ? next : []));
    } catch {
      setChatError('채팅 연결에 실패했습니다.');
    }
  }, [selected?.channelId, chatAdapter]);
  useEffect(() => { chatBottomRef.current?.scrollIntoView({ block: 'nearest' }); }, [messages, chatOpen]);

  const streamUrl = selected?.streamUrl || selected?.videoUrl || '';
  // 실제 라이브 URL이 있어야 재생할 수 있습니다. mp4 및 브라우저 기본 HLS 재생을 지원합니다.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isLoggedIn || !adComplete || !streamUrl) return;
    video.volume = volume / 100;
    video.muted = isMuted;
    if (isPlaying) video.play().catch(() => setIsPlaying(false));
  }, [selected?.channelId, isLoggedIn, adComplete, streamUrl]);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume / 100;
    video.muted = isMuted;
  }, [volume, isMuted]);
  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().then(() => setIsPlaying(true)).catch(() => setStreamError('영상 재생을 시작할 수 없습니다.'));
    else { video.pause(); setIsPlaying(false); }
  };
  const restartLive = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.seekable.length) video.currentTime = video.seekable.end(video.seekable.length - 1);
    video.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  if (!selected) return <main className="live-channel-page">표시할 라이브 채널이 없습니다.</main>;

  const filteredChannels = category === '전체' ? channels : channels.filter(p => p.category === category);
  const categories = ['전체', ...new Set(channels.map(p => p.category).filter(Boolean))];
  const top20 = channels.slice(0, 20);
  const changeChannel = program => { setSearchParams({ channel: String(program.channelId) }); };
  const sendChat = async e => {
    e.preventDefault();
    if (!isLoggedIn) { onLoginRequired(); return; }
    const text = chatText.trim();
    if (!text || chatSending) return;
    if (text.length > 300) { setChatError('메시지는 300자 이내로 입력해 주세요.'); return; }
    setChatError('');
    setChatSending(true);
    const message = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, name: '나', text, createdAt: Date.now() };
    try {
      if (chatAdapter?.send) await chatAdapter.send(String(selected.channelId), message);
      else setMessages(prev => [...prev, message]); // 프런트엔드 테스트 모드
      setChatText('');
    } catch {
      setChatError('메시지를 전송하지 못했습니다. 다시 시도해 주세요.');
    } finally { setChatSending(false); }
  };
  const shareTo = (url) => window.open(url, '_blank', 'noopener,noreferrer,width=640,height=520');
  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus('복사되었습니다.');
    } catch {
      setCopyStatus('복사에 실패했어요. 주소를 직접 선택해 복사해 주세요.');
    }
  };
  const toggleLike = () => {
    if (!isLoggedIn) { onLoginRequired(); return; }
    setLiked(v => !v);
  };
  const toggleReminder = (id) => {
    if (!isLoggedIn) { onLoginRequired(); return; }
    setReminders(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };
  const scheduleStatus = (_p, index) => {
    if (index < displayCurrentIndex) return 'past';
    if (index > displayCurrentIndex) return 'future';
    return 'live';
  };


  return (
    <main className="live-channel-page">
      <div className="live-channel-layout" ref={layoutRef}>
        <div className="live-channel-main">
          <div className="live-player" ref={playerRef} style={selected.image ? { backgroundImage: `url("${imageSrc(selected.image)}")` } : undefined}>
            {isLoggedIn && adComplete && streamUrl && (
              <video
                key={`${selected.channelId}-${streamUrl}`}
                ref={videoRef}
                className="live-player__video"
                src={streamUrl}
                playsInline
                autoPlay
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={() => setStreamError('영상 주소를 확인해 주세요. HLS(.m3u8)는 브라우저에 따라 별도 플레이어 연결이 필요합니다.')}
              />
            )}
            <div className="live-player__overlay">
              {!isLoggedIn ? <><h2>라이브를 시청하려면 로그인이 필요해요</h2><button type="button" className="live-player__button" onClick={() => onLoginRequired()}>로그인</button></>
                : !adComplete ? <><h2>광고 시청 후 라이브를 시청할 수 있어요</h2><p>실제 광고 연동 전 미리보기입니다.</p><button className="live-player__button" onClick={() => setAdComplete(true)}>광고 시청 완료 (데모)</button></>
                  : !streamUrl ? <><h2>연결된 라이브 영상이 없습니다</h2><p>liveData에 streamUrl을 등록하면 여기에서 재생됩니다.</p></>
                  : streamError ? <><h2>영상을 재생할 수 없습니다</h2><p>{streamError}</p></>
                  : null}
            </div>
            {isLoggedIn && adComplete && !!streamUrl && !streamError && (
              <>
                <div className="live-player__demo-label">LIVE</div>
                <div className="live-player__controls" aria-label="영상 플레이어 컨트롤">
                  <div className="live-player__controls-top"><span className="live-player__live-badge">● 라이브</span></div>
                  <div className="live-player__controls-bottom">
                    <div className="live-player__controls-left">
                      <button type="button" onClick={togglePlayback} aria-label={isPlaying ? '일시정지' : '재생'}>{isPlaying ? 'Ⅱ' : '▶'}</button>
                      <button type="button" onClick={restartLive} aria-label="실시간 위치로 이동">↶</button>
                      <button type="button" onClick={() => setIsMuted(v => !v)} aria-label={isMuted ? '음소거 해제' : '음소거'}>{isMuted ? '🔇' : '◖))'}</button>
                      <input className="live-player__volume" type="range" min="0" max="100" value={isMuted ? 0 : volume} aria-label="볼륨" onChange={e => { setVolume(Number(e.target.value)); setIsMuted(Number(e.target.value) === 0); }} />
                    </div>
                    <div className="live-player__controls-right">
                      <button type="button" onClick={() => setPlayerSettingsOpen(v => !v)} aria-label="플레이어 설정">⚙</button>
                      <button type="button" onClick={() => { if (!document.fullscreenElement) playerRef.current?.requestFullscreen?.(); else document.exitFullscreen?.(); }} aria-label="전체 화면">⛶</button>
                    </div>
                  </div>
                </div>
                {playerSettingsOpen && <div className="live-player__settings">화질은 방송 스트림에서 제공하는 설정을 따릅니다.</div>}
              </>
            )}
          </div>
          <div className="live-channel-info">
            <div className="live-channel-info__text"><strong>{selected.channel}</strong><div><b>{selected.title}</b><span>{formatTime(selected.start)} ~ {formatTime(selected.end)}</span></div></div>
            <div className="live-channel-info__actions"><button onClick={toggleLike} aria-pressed={liked}>{liked ? '♥' : '♡'} 관심</button><button onClick={() => { setCopyStatus(''); setShareOpen(true); }}>↥ 공유</button></div>
          </div>

          <section className="live-schedule" aria-label="선택한 채널 편성표">
            <div className="live-schedule__heading"><h2>{selected.channel} 편성표</h2><Link to="/schedule">전체 편성표 ›</Link></div>
            <div className="live-schedule__slider">
              <Swiper
                key={selected.channelId}
                onSwiper={s => { scheduleSwiper.current = s; updateScheduleNav(s); s.slideTo(0, 0); }}
                onSlideChange={updateScheduleNav}
                onResize={updateScheduleNav}
                initialSlide={0}
                slidesPerView={1}
                slidesPerGroup={1}
                centeredSlides={false}
                spaceBetween={10}
                speed={500}
                grabCursor={true}
                simulateTouch={true}
                watchOverflow={true}
                breakpoints={{ 640: { slidesPerView: 3, spaceBetween: 10 } }}
              >
                {displaySchedule.map((p, index) => {
                  const status = scheduleStatus(p, index);
                  return <SwiperSlide key={p.id}>
                    <div className={`live-schedule__item ${status === 'live' ? 'is-current' : ''}`}>
                      <div className="live-schedule__item-title">
                        <strong>{status === 'live' && <span className="live-schedule__live">● 라이브</span>}{p.title}{p.isDemo && <span className="live-schedule__demo"> (예시)</span>}</strong>
                        {status === 'past' && !p.placeholder && <button type="button" className="live-schedule__action" onClick={() => alert('다시보기 콘텐츠 연결이 필요합니다.')} aria-label={`${p.title} 다시보기`}>다시보기</button>}
                        {status === 'future' && !p.placeholder && <button type="button" className={`live-schedule__action live-schedule__bell ${reminders.includes(p.id) ? 'is-active' : ''}`} onClick={() => toggleReminder(p.id)} aria-label={`${p.title} 방송 알림`} aria-pressed={reminders.includes(p.id)}>🔔</button>}
                      </div>
                      <small>{p.placeholder ? '편성 데이터 추가 필요' : `${formatTime(p.start)} ~ ${formatTime(p.end)}`}</small>
                    </div>
                  </SwiperSlide>;
                })}
              </Swiper>
              {schedulePrev && <button className="live-schedule__arrow live-schedule__arrow--prev" onClick={() => scheduleSwiper.current?.slidePrev()} aria-label="이전 편성">‹</button>}
              {scheduleNext && <button className="live-schedule__arrow live-schedule__arrow--next" onClick={() => scheduleSwiper.current?.slideNext()} aria-label="다음 편성">›</button>}
            </div>
          </section>

          <section className="live-top20" ref={top20Ref}>
            <h2>실시간 채널 TOP 20</h2>
            <div className="live-top20__slider">
              <Swiper
                onSwiper={s => { topSwiper.current = s; setTopPrev(!s.isBeginning); setTopNext(!s.isEnd); }}
                onSlideChange={s => { setTopPrev(!s.isBeginning); setTopNext(!s.isEnd); }}
                onResize={s => { setTopPrev(!s.isBeginning); setTopNext(!s.isEnd); }}
                slidesPerView={2}
                slidesPerGroup={2}
                spaceBetween={12}
                speed={500}
                grabCursor={true}
                simulateTouch={true}
                longSwipesRatio={0.1}
                shortSwipes={true}
                watchOverflow={true}
                breakpoints={{ 640: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 14 }, 1024: { slidesPerView: 4, slidesPerGroup: 4, spaceBetween: 16 }, 1440: { slidesPerView: 5, slidesPerGroup: 5, spaceBetween: 20 } }}
              >
                {top20.map((p, i) => <SwiperSlide key={p.channelId}>
                  <button className="live-top20__card" onClick={() => changeChannel(p)}>
                    <div className="live-top20__image"><ChannelImage program={p} /></div>
                    <div className="live-top20__meta"><em>{i + 1}</em><div><strong>{p.channel}</strong><span>{p.title}</span></div></div>
                  </button>
                </SwiperSlide>)}
              </Swiper>
              {topPrev && <button type="button" className="live-top20__arrow live-top20__arrow--prev" onClick={() => topSwiper.current?.slidePrev()} aria-label="이전 채널">‹</button>}
              {topNext && <button type="button" className="live-top20__arrow live-top20__arrow--next" onClick={() => topSwiper.current?.slideNext()} aria-label="다음 채널">›</button>}
            </div>
          </section>
        </div>

        <aside className="live-sidebar" style={{ height: panelHeight }}>
          <section className={`live-chat ${chatOpen ? 'is-open' : ''}`} style={chatOpen ? { height: playerHeight } : undefined}>
            <button className="live-sidebar__heading live-chat__toggle" onClick={() => setChatOpen(v => !v)} aria-expanded={chatOpen}><strong>웨이브 실시간</strong><span>{chatOpen ? '⌃' : '⌄'}</span></button>
            {chatOpen ? <><div className="live-chat__messages" aria-live="polite"><p>실시간 채팅에 참여해보세요.</p>{!chatAdapter && <p className="live-chat__demo-note">현재는 화면 테스트용 채팅입니다. 다른 사용자와 대화하려면 채팅 서버를 연결해야 합니다.</p>}{messages.map(m => <p key={m.id}><b>{m.name || '사용자'}</b> {m.text}</p>)}<div ref={chatBottomRef} /></div>{chatError && <p className="live-chat__error" role="status">{chatError}</p>}<form onSubmit={sendChat} className="live-chat__form"><input value={chatText} maxLength={300} onChange={e => setChatText(e.target.value)} onFocus={() => { if (!isLoggedIn) onLoginRequired(); }} placeholder={isLoggedIn ? '메시지를 입력하세요' : '로그인 후 채팅할 수 있어요'} readOnly={!isLoggedIn} /><button type="submit" disabled={!isLoggedIn || !chatText.trim() || chatSending} aria-label="채팅 전송">↑</button></form></> : <button type="button" className="live-chat__preview" onClick={() => setChatOpen(true)}>실시간 채팅에 참여해보세요</button>}
          </section>
          <section className="live-channel-list"><div className="live-sidebar__heading"><strong>전체 채널</strong><Link to="/schedule">전체 편성표 ›</Link></div><div className="live-channel-list__filters">{categories.map(c => <button className={category === c ? 'active' : ''} onClick={() => setCategory(c)} key={c}>{c}</button>)}</div><div className="live-channel-list__scroll">{filteredChannels.map(p => <button className={`live-channel-list__item ${selected.channelId === p.channelId ? 'active' : ''}`} onClick={() => changeChannel(p)} key={p.channelId}><div className="live-channel-list__thumb"><ChannelImage program={p} /><span>무료</span><div className="live-channel-list__progress" style={{ width: `${progressOf(p, now)}%` }} /></div><div><strong>{p.title}{p.isDemo && <span className="live-schedule__demo"> (예시)</span>}</strong><small>{p.channel}</small></div></button>)}</div></section>
        </aside>
      </div>

      {shareOpen && <div className="live-share-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShareOpen(false); }}><div className="live-share-modal" role="dialog" aria-modal="true" aria-label="공유하기"><div className="live-share-modal__heading"><h2>공유</h2><button onClick={() => setShareOpen(false)} aria-label="닫기">×</button></div><div className="live-share-modal__sns"><button onClick={() => shareTo(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`)}>𝕏 <small>X (트위터)</small></button><button onClick={() => shareTo(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`)}>f <small>페이스북</small></button></div><div className="live-share-modal__copy"><input readOnly value={shareUrl} aria-label="공유 주소" /><button onClick={copyShareUrl}>복사</button></div>{copyStatus && <p className="live-share-modal__copy-status" role="status" aria-live="polite">{copyStatus}</p>}<p>카카오톡 공유는 Kakao SDK 연동 후 추가할 수 있어요.</p></div></div>}
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
      />
    </main>
  );
};
