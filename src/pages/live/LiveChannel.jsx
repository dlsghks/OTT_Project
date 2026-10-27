import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { livePrograms } from '../../data/liveData';
import { LoginModal } from '../../components/common/LoginModal';
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

// 실제 인증 연결 시 아래 prop에 Firebase/Zustand 로그인 상태를 전달하세요.
export const LiveChannel = ({ isLoggedIn = false }) => {
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
  const [category, setCategory] = useState('전체');
  const [adComplete, setAdComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(70);
  const [playerSettingsOpen, setPlayerSettingsOpen] = useState(false);
  const scheduleSwiper = useRef(null);
  const playerRef = useRef(null);
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
  useEffect(() => { setAdComplete(false); setLiked(false); setIsPlaying(true); setPlayerSettingsOpen(false); }, [selected?.channelId]);
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
  if (!selected) return <main className="live-channel-page">표시할 라이브 채널이 없습니다.</main>;

  const filteredChannels = category === '전체' ? channels : channels.filter(p => p.category === category);
  const categories = ['전체', ...new Set(channels.map(p => p.category).filter(Boolean))];
  const top20 = channels.slice(0, 20);
  const changeChannel = program => { setSearchParams({ channel: String(program.channelId) }); };
  const sendChat = e => {
    e.preventDefault();
    if (!isLoggedIn) { onLoginRequired(); return; }
    if (!chatText.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), text: chatText.trim() }]);
    setChatText('');
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
          <div className="live-player" ref={playerRef} style={selected.image ? { backgroundImage: `url(${selected.image})` } : undefined}>
            <div className="live-player__overlay">
              {!isLoggedIn ? <><h2>라이브를 시청하려면 로그인이 필요해요</h2><button type="button" className="live-player__button" onClick={() => onLoginRequired()}>로그인</button></>
                : !adComplete ? <><h2>광고 시청 후 라이브를 시청할 수 있어요</h2><p>실제 광고 연동 전 미리보기입니다.</p><button className="live-player__button" onClick={() => setAdComplete(true)}>광고 시청 완료 (데모)</button></>
                  : null}
            </div>
            {isLoggedIn && adComplete && (
              <>
                <div className="live-player__demo-label">미리보기 · 실제 스트림 미연결</div>
                <div className="live-player__controls" aria-label="영상 플레이어 컨트롤">
                  <div className="live-player__controls-top"><span className="live-player__live-badge">● 라이브</span></div>
                  <div className="live-player__controls-bottom">
                    <div className="live-player__controls-left">
                      <button type="button" onClick={() => setIsPlaying(v => !v)} aria-label={isPlaying ? '일시정지 (데모)' : '재생 (데모)'}>{isPlaying ? 'Ⅱ' : '▶'}</button>
                      <button type="button" onClick={() => window.alert('실제 영상 연결 후 다시보기 기능을 사용할 수 있습니다.')} aria-label="다시보기 (데모)">↶</button>
                      <button type="button" onClick={() => setIsMuted(v => !v)} aria-label={isMuted ? '음소거 해제' : '음소거'}>{isMuted ? '🔇' : '◖))'}</button>
                      <input className="live-player__volume" type="range" min="0" max="100" value={isMuted ? 0 : volume} aria-label="볼륨" onChange={e => { setVolume(Number(e.target.value)); setIsMuted(Number(e.target.value) === 0); }} />
                    </div>
                    <div className="live-player__controls-right">
                      <button type="button" onClick={() => setPlayerSettingsOpen(v => !v)} aria-label="플레이어 설정">⚙</button>
                      <button type="button" onClick={() => { if (!document.fullscreenElement) playerRef.current?.requestFullscreen?.(); else document.exitFullscreen?.(); }} aria-label="전체 화면">⛶</button>
                    </div>
                  </div>
                </div>
                {playerSettingsOpen && <div className="live-player__settings">화질 · 실제 스트림 연결 후 설정 가능</div>}
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
                    <div className="live-top20__image">{p.image && <img src={p.image} alt="" />}</div>
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
            {chatOpen ? <><div className="live-chat__messages" aria-live="polite"><p>실시간 채팅에 참여해보세요.</p>{messages.map(m => <p key={m.id}><b>나</b> {m.text}</p>)}</div><form onSubmit={sendChat} className="live-chat__form"><input value={chatText} onChange={e => setChatText(e.target.value)} placeholder={isLoggedIn ? '메시지를 입력하세요' : '로그인 후 채팅할 수 있어요'} disabled={!isLoggedIn} /><button disabled={!isLoggedIn || !chatText.trim()} aria-label="채팅 전송">↑</button></form></> : <p className="live-chat__preview" onClick={() => setChatOpen(true)}>실시간 채팅에 참여해보세요</p>}
          </section>
          <section className="live-channel-list"><div className="live-sidebar__heading"><strong>전체 채널</strong><Link to="/schedule">전체 편성표 ›</Link></div><div className="live-channel-list__filters">{categories.map(c => <button className={category === c ? 'active' : ''} onClick={() => setCategory(c)} key={c}>{c}</button>)}</div><div className="live-channel-list__scroll">{filteredChannels.map(p => <button className={`live-channel-list__item ${selected.channelId === p.channelId ? 'active' : ''}`} onClick={() => changeChannel(p)} key={p.channelId}><div className="live-channel-list__thumb">{p.image && <img src={p.image} alt="" />}<span>무료</span><div className="live-channel-list__progress" style={{ width: `${progressOf(p, now)}%` }} /></div><div><strong>{p.title}{p.isDemo && <span className="live-schedule__demo"> (예시)</span>}</strong><small>{p.channel}</small></div></button>)}</div></section>
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
