import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/wavve_logo_w.svg";
import "../../styles/components/ProfileSelect.scss";

const PROFILE_KEY = "wavve-active-profile";
const SETTINGS_KEY = "wavve-profile-settings";

const defaultProfiles = [
  { id: "profile1", name: "프로필1", file: "profile1.png" },
  { id: "profile2", name: "프로필2", file: "profile2.png" },
  { id: "profile3", name: "프로필3", file: "profile3.png" },
  { id: "profile4", name: "프로필4", file: "profile4.png" },
].map((profile) => ({
  id: profile.id,
  name: profile.name,
  image: `${import.meta.env.BASE_URL}images/profiles/${profile.file}`,
}));

const readJSON = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
};

// 기본 목록에 저장된 수정 내용을 반영합니다.
const readProfiles = () => {
  const settings = readJSON(SETTINGS_KEY, {});
  const activeProfile = readJSON(PROFILE_KEY, null);

  return defaultProfiles.map((profile) => {
    const saved = settings?.[profile.id];

    // 현재 선택한 프로필 정보도 반영합니다.
    const current =
      activeProfile?.id === profile.id ? activeProfile : null;

    const name = current?.name ?? saved?.name;
    const image = current?.image ?? saved?.image;

    return {
      ...profile,
      name:
        typeof name === "string" && name.trim()
          ? name.trim()
          : profile.name,
      image:
        typeof image === "string" && image.trim()
          ? image
          : profile.image,
    };
  });
};

export const ProfileSelect = () => {
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState(readProfiles);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const refreshProfiles = () => {
      setProfiles(readProfiles());
    };

    const handleStorage = (event) => {
      if (
        event.key === PROFILE_KEY ||
        event.key === SETTINGS_KEY ||
        event.key === null
      ) {
        refreshProfiles();
      }
    };

    window.addEventListener("focus", refreshProfiles);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("focus", refreshProfiles);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const selectProfile = (profile) => {
    try {
      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify({
          id: profile.id,
          name: profile.name,
          image: profile.image,
        })
      );

      navigate("/");
    } catch {
      setMessage("프로필을 저장하지 못했어요. 다시 시도해주세요.");
    }
  };

  return (
    <main className="profile-select">
      <Link
        className="profile-select__logo"
        to="/"
        aria-label="웨이브 홈"
      >
        <img src={logo} alt="wavve" />
      </Link>

      <section
        className="profile-select__content"
        aria-labelledby="profile-select-title"
      >
        <h1 id="profile-select-title">사용자 선택</h1>

        <p className="profile-select__description">
          시청할 프로필을 선택하세요.
        </p>

        <ul className="profile-select__list">
          {profiles.map((profile) => (
            <li key={profile.id}>
              <button
                className="profile-select__profile"
                type="button"
                onClick={() => selectProfile(profile)}
              >
                <span className="profile-select__avatar">
                  <img src={profile.image} alt="" />
                </span>

                <span className="profile-select__name">
                  {profile.name}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <p className="profile-select__notice">
          • 이용권 유/무에 상관없이 프로필 4개가 기본으로 제공됩니다.
        </p>

        {message && (
          <p className="profile-select__message" role="alert">
            {message}
          </p>
        )}
      </section>
    </main>
  );
};

export default ProfileSelect;