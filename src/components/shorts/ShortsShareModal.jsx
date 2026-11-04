import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import closeIcon from "../../assets/shorts/share-modal/close.svg";
import glow from "../../assets/shorts/share-modal/glow.svg";
import copiedIcon from "../../assets/shorts/share-modal/copied.png";
import naverIcon from "../../assets/shorts/share-modal/naver.svg";
import kakaoIcon from "../../assets/shorts/share-modal/kakao.svg";
import instagramIcon from "../../assets/shorts/share-modal/instagram.svg";
import xIcon from "../../assets/shorts/share-modal/x.svg";
import gmailIcon from "../../assets/shorts/share-modal/gmail.svg";
import mailIcon from "../../assets/shorts/share-modal/mail.svg";
import messageIcon from "../../assets/shorts/share-modal/message.svg";
import "../../styles/components/ShortsShareModal.scss";

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

export function ShortsShareModal({ item, onClose }) {
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

  const appUrl = new URL(window.location.href);
  appUrl.searchParams.set("short", item.id);

  // 피그마의 URL 입력창처럼 실제 유튜브 영상 링크를 공유합니다.
  const url = item.youtubeUrl || appUrl.toString();
  const title = item.title || "웨이브 쇼츠";
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

  const shareKakao = async () => {
    setNotice("");
    const kakao = window.Kakao;
    if (kakao?.isInitialized?.() && kakao.Share?.sendDefault) {
      try {
        // 카카오 제품 링크에는 등록된 우리 사이트 도메인을 사용합니다.
        await kakao.Share.sendDefault({
          objectType: "text",
          text: body,
          link: { webUrl: appUrl.toString(), mobileWebUrl: appUrl.toString() },
          buttonTitle: "쇼츠 보기",
        });
      } catch {
        if (aliveRef.current) setNotice("카카오 공유를 열지 못했어요. 링크를 복사해 공유해주세요.");
      }
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (error) {
        if (error?.name !== "AbortError" && aliveRef.current) {
          setNotice("기기 공유를 열지 못했어요. 복사 버튼으로 링크를 공유해주세요.");
        }
      }
      return;
    }

    await copy("카카오톡에서 대화방을 열고 복사한 링크를 붙여넣어주세요.");
  };

  const shareMessage = () => {
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = `sms:?body=${encodeURIComponent(body)}`;
    } else if (navigator.share) {
      navigator.share({ title, url }).catch((error) => {
        if (error?.name !== "AbortError" && aliveRef.current) {
          setNotice("메시지 공유를 열지 못했어요. 링크를 복사해 공유해주세요.");
        }
      });
    } else {
      void copy("메시지 앱을 열고 복사한 링크를 붙여넣어주세요.");
    }
  };

  const services = [
    { name: "네이버", icon: naverIcon, action: () => openWeb(`https://share.naver.com/web/shareView?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`) },
    { name: "카카오톡", icon: kakaoIcon, action: shareKakao },
    { name: "인스타그램", icon: instagramIcon, action: shareInstagram },
    { name: "X", icon: xIcon, action: () => openWeb(`https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`) },
    { name: "Gmail", icon: gmailIcon, action: () => openWeb(`https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`) },
    { name: "메일", icon: mailIcon, action: () => { window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`; } },
    { name: "메시지", icon: messageIcon, action: shareMessage },
  ];

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
              onClick={service.action}
            >
              <img src={service.icon} alt="" draggable={false} />
            </button>
          ))}
        </div>
        <div className="shorts-share__link">
          <input ref={inputRef} aria-label="공유할 영상 링크" readOnly value={url} onFocus={(event) => event.target.select()} />
          <button type="button" disabled={copying} onClick={() => void copy()}>{copying ? "복사 중" : "복사"}</button>
        </div>
        <div className="shorts-share__status" role="status" aria-live="polite">
          {copied && <><img src={copiedIcon} alt="" /><span>링크가 복사되었습니다.</span></>}
        </div>
      </div>
      {notice && <p className="shorts-share__notice" role="status">{notice}</p>}
    </dialog>,
    document.body
  );
}
