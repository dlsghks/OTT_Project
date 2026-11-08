import { useEffect, useId, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PLAYBACK_SETTINGS_KEY, readPlaybackSettings, savePlaybackSettings } from "../../utils/playbackSettings";
import "../../styles/pages/member/Settings.scss";

const sections = [
  {
    title: "기본 설정",
    items: [
      {
        key: "continuousPlayback",
        title: "연속재생 설정",
        description: "ON상태일 경우 VOD 연속재생을 허용합니다. 원하지 않으실 경우 설정 OFF 해주세요.",
      },
    ],
  },
  {
    title: "모바일 데이터 사용 설정",
    items: [
      {
        key: "mobilePlayback",
        title: "일반 재생",
        description: "모바일 데이터 사용 시에도 콘텐츠 재생이 가능합니다. OFF로 설정하면 Wi-Fi 에서만 재생됩니다.",
      },
      {
        key: "mobileAutoplay",
        title: "자동 재생",
        description: "모바일 데이터 사용 시에도 탐색 중 미리보기 재생이 가능합니다. OFF로 설정하면 Wi-Fi 에서만 자동 재생됩니다.",
      },
      {
        key: "mobileDownload",
        title: "다운로드",
        description: "모바일 데이터 사용 시에도 콘텐츠 다운로드가 가능합니다. OFF로 설정하면 Wi-Fi 에서만 다운로드됩니다.",
      },
    ],
  },
];

export function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const id = useId();
  const [settings, setSettings] = useState(readPlaybackSettings);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const sync = () => setSettings(readPlaybackSettings());
    const onStorage = event => {
      if (event.key === PLAYBACK_SETTINGS_KEY || event.key === null) sync();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("wavve-playback-settings-change", sync);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("wavve-playback-settings-change", sync);
    };
  }, []);

  const changeSetting = (key, checked) => {
    const next = { ...settings, [key]: checked };
    setSettings(next);
    try {
      savePlaybackSettings(next);
      setMessage("");
    } catch {
      setMessage("설정을 저장하지 못했어요. 브라우저 저장 공간을 확인해주세요.");
    }
  };

  const goBack = () => {
    if (location.state?.from === "/mypage") navigate(-1);
    else navigate("/mypage", { replace: true });
  };

  return (
    <div className="wavve-settings">
      <header className="wavve-settings__header">
        <button className="wavve-settings__back" type="button" aria-label="마이페이지로 돌아가기" onClick={goBack}>
          <span aria-hidden="true" />
        </button>
        <h1>환경설정</h1>
      </header>
      <main className="wavve-settings__main">
        {sections.map((section, index) => (
          <section className="wavve-settings__section" key={section.title} aria-labelledby={`${id}-section-${index}`}>
            <h2 id={`${id}-section-${index}`}>{section.title}</h2>
            <div className="wavve-settings__rows">
              {section.items.map(item => (
                <label className="wavve-settings__row" key={item.key}>
                  <span className="wavve-settings__copy">
                    <span id={`${id}-${item.key}-title`} className="wavve-settings__name">{item.title}</span>
                    <span id={`${id}-${item.key}-description`} className="wavve-settings__description">{item.description}</span>
                  </span>
                  <span className="wavve-settings__switch">
                    <input type="checkbox" role="switch" checked={settings[item.key]}
                      aria-labelledby={`${id}-${item.key}-title`}
                      aria-describedby={`${id}-${item.key}-description`}
                      onChange={event => changeSetting(item.key, event.target.checked)} />
                    <span className="wavve-settings__track" aria-hidden="true" />
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}
        {message && <p className="wavve-settings__message" role="status">{message}</p>}
      </main>
    </div>
  );
}
export default Settings;
