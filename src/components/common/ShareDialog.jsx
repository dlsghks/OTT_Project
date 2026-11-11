import { getKakaoShareClient } from '../../utils/kakaoShare';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import closeIcon from '../../assets/shorts/share-modal/close.svg';
import glow from '../../assets/shorts/share-modal/glow.svg';
import gmailIcon from '../../assets/share/gmail.png';
import kakaoIcon from '../../assets/share/kakao.png';
import xIcon from '../../assets/share/x.png';
import instagramIcon from '../../assets/share/instagram.png';
import threadsIcon from '../../assets/share/threads.png';
import mailIcon from '../../assets/share/mail.png';
import '../../styles/components/shorts/ShortsShareModal.scss';

// 쓰기에 성공한 경우에만 완료 상태를 표시합니다.
async function copyText(value, input) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // 브라우저가 쓰기를 제한하면 직접 선택한 입력값 복사를 시도합니다.
    }
  }

  input?.focus();
  input?.select();
  input?.setSelectionRange(0, value.length);
  if (!document.execCommand("copy")) {
    throw new Error("COPY_FAILED");
  }
}

export function ShareDialog({ title = "웨이브", url = window.location.href, kakaoUrl = url, onClose }) {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const aliveRef = useRef(true);
  const copyingRef = useRef(false);
  const serviceDragRef = useRef({
    startX: 0,
    startScroll: 0,
    pressed: false,
    moved: false,
  });
  const titleId = useId();
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);
  const [notice, setNotice] = useState("");

  const [activeService, setActiveService] = useState("");
  const body = `${title}\n${url}`;

  useEffect(() => {
    aliveRef.current = true;
    const previousFocus = document.activeElement;
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => {
      aliveRef.current = false;
      dialog.close();
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  const copy = async (successNotice = "") => {
    if (copyingRef.current) return false;
    copyingRef.current = true;
    setCopying(true);
    setCopied(false);
    setNotice("");
    try {
      await copyText(url, inputRef.current);
      if (aliveRef.current) {
        setCopied(true);
        setNotice(successNotice);
      }
      return true;
    } catch {
      if (aliveRef.current) {
        setNotice("자동 복사가 제한되어 있어요. 선택된 링크를 직접 복사해주세요.");
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      return false;
    } finally {
      copyingRef.current = false;
      if (aliveRef.current) setCopying(false);
    }
  };

  const openWeb = (destination) => {
    const popup = window.open(destination, "_blank", "noopener,noreferrer");
    // noopener 창은 열려도 반환값이 null일 수 있으므로 성공 여부로 사용하지 않습니다.
    return popup;
  };

  const shareInstagram = () => {
    // 사용자 클릭 안에서 먼저 창을 열어 팝업 차단 가능성을 줄입니다.
    openWeb("https://www.instagram.com/");
    void copy("인스타그램에서 메시지나 게시물에 복사한 링크를 붙여넣어주세요.");
  };

  useEffect(() => { void getKakaoShareClient().catch(() => {}); }, []);

  const shareKakao = async () => {
    setNotice("");
    try {
      const kakao = await getKakaoShareClient();
      if (kakao?.Share?.sendDefault) {
        await kakao.Share.sendDefault({
          objectType: "text",
          text: body,
          link: { webUrl: kakaoUrl, mobileWebUrl: kakaoUrl },
          buttonTitle: "웨이브에서 보기",
        });
        return;
      }
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
    await copy("카카오톡에서 대화방을 열고 복사한 링크를 붙여넣어주세요.");
  };

  const services = [
    { name: "Gmail", icon: gmailIcon },
    { name: "카카오톡", icon: kakaoIcon },
    { name: "X", icon: xIcon },
    { name: "인스타그램", icon: instagramIcon },
    { name: "Threads", icon: threadsIcon },
    { name: "메일", icon: mailIcon },
  ];

  const selectService = (name) => {
    setActiveService(name);
    switch (name) {
      case "Gmail": openWeb(`https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`); break;
      case "카카오톡": void shareKakao(); break;
      case "X": openWeb(`https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`); break;
      case "인스타그램": shareInstagram(); break;
      case "Threads": openWeb(`https://www.threads.com/intent/post?${new URLSearchParams({ text: body })}`); break;
      case "메일": window.location.assign(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`); break;
    }
  };

  return createPortal(
    <dialog
      className="shorts-share"
      ref={dialogRef}
      aria-labelledby={titleId}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = [...event.currentTarget.querySelectorAll("button:not(:disabled), input:not(:disabled), a[href]")];
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
      }}
    >
      <div className="shorts-share__surface">
        <img className="shorts-share__glow" src={glow} alt="" />
        <button className="shorts-share__close" type="button" aria-label="공유하기 닫기" onClick={onClose} autoFocus>
          <img src={closeIcon} alt="" />
        </button>
        <h2 id={titleId}>공유하기</h2>
        <div
          className="shorts-share__services"
          role="group"
          aria-label="공유 서비스"
          onPointerDown={(event) => {
            if (event.pointerType !== "mouse" || event.button !== 0) return;

            serviceDragRef.current = {
              startX: event.clientX,
              startScroll: event.currentTarget.scrollLeft,
              pressed: true,
              moved: false,
            };
          }}
          onPointerMove={(event) => {
            const drag = serviceDragRef.current;
            if (!drag.pressed) return;

            const distance = event.clientX - drag.startX;

            if (!drag.moved && Math.abs(distance) > 5) {
              drag.moved = true;
              event.currentTarget.setPointerCapture(event.pointerId);
            }

            if (drag.moved) {
              event.preventDefault();
              event.currentTarget.scrollLeft = drag.startScroll - distance;
            }
          }}
          onPointerUp={() => {
            serviceDragRef.current.pressed = false;
          }}
          onPointerCancel={() => {
            serviceDragRef.current.pressed = false;
            serviceDragRef.current.moved = false;
          }}
          onPointerLeave={() => {
            if (!serviceDragRef.current.moved) {
              serviceDragRef.current.pressed = false;
            }
          }}
          onClickCapture={(event) => {
            if (serviceDragRef.current.moved) {
              event.preventDefault();
              event.stopPropagation();
              serviceDragRef.current.moved = false;
            }
          }}
          onDragStart={(event) => event.preventDefault()}
        >
          {services.map((service) => (
            <button
              type="button"
              key={service.name}
              aria-label={`${service.name} 공유`}
              title={service.name}
              className={activeService === service.name ? "is-active" : undefined}
              onClick={() => selectService(service.name)}
            >
              <img src={service.icon} alt="" draggable={false} />
            </button>
          ))}
        </div>
        <div className="shorts-share__link">
          <input ref={inputRef} aria-label="공유할 영상 링크" readOnly value={url} onFocus={(event) => event.target.select()} />
          <button type="button" className={copied ? "is-copied" : undefined} disabled={copying} onClick={() => void copy()}>{copying ? "복사 중" : "복사"}</button>
        </div>
        <div className="shorts-share__status" role="status" aria-live="polite">
          {copied && <><svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="10" fill="#1351f9" /><path d="m5 10 3 3 7-7" fill="none" stroke="#000" strokeWidth="2" /></svg><span>링크가 복사되었습니다.</span></>}
        </div>
      </div>
      {notice && <p className="shorts-share__notice" role="status">{notice}</p>}
    </dialog>,
    document.body
  );
}
