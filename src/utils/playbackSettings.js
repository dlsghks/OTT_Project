export const PLAYBACK_SETTINGS_KEY = "wavve-playback-settings";
export const DEFAULT_PLAYBACK_SETTINGS = Object.freeze({
  continuousPlayback: true,
  mobilePlayback: true,
  mobileAutoplay: true,
  mobileDownload: true,
});

export function readPlaybackSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(PLAYBACK_SETTINGS_KEY) || "null");
    return Object.fromEntries(Object.entries(DEFAULT_PLAYBACK_SETTINGS).map(([key, fallback]) => [
      key, typeof saved?.[key] === "boolean" ? saved[key] : fallback,
    ]));
  } catch {
    return { ...DEFAULT_PLAYBACK_SETTINGS };
  }
}

export function savePlaybackSettings(settings) {
  const next = Object.fromEntries(Object.keys(DEFAULT_PLAYBACK_SETTINGS).map(key => [key, settings[key] === true]));
  localStorage.setItem(PLAYBACK_SETTINGS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("wavve-playback-settings-change"));
}
