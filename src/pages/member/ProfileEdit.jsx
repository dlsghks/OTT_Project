import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/wavve_logo_w.svg";
import "../../styles/components/ProfileEdit.scss";

const PROFILE_KEY = "wavve-active-profile";

const profileImages = [1, 2, 3, 4].map(
  (number) =>
    `${import.meta.env.BASE_URL}images/profiles/profile${number}.png`
);

const readProfile = () => {
  const fallback = {
    id: "profile1",
    name: "프로필1",
    image: profileImages[0],
  };

  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");

    return {
      id: saved?.id || fallback.id,
      name:
        typeof saved?.name === "string" ? saved.name : fallback.name,
      image:
        typeof saved?.image === "string" && saved.image
          ? saved.image
          : fallback.image,
    };
  } catch {
    return fallback;
  }
};

export const ProfileEdit = () => {
  const navigate = useNavigate();

  const [savedProfile, setSavedProfile] = useState(readProfile);
  const [name, setName] = useState(savedProfile.name);
  const [image, setImage] = useState(savedProfile.image);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [message, setMessage] = useState("");

  const trimmedName = name.trim();
  const changed =
    trimmedName !== savedProfile.name || image !== savedProfile.image;

  const canSave = trimmedName.length > 0 && changed;

  const saveProfile = (event) => {
    event.preventDefault();
    if (!canSave) return;

    const updatedProfile = {
      ...savedProfile,
      name: trimmedName,
      image,
    };

    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));

      // 다른 프로필로 전환해도 수정 내용을 유지할 수 있도록 따로 저장
      const raw = JSON.parse(
        localStorage.getItem("wavve-profile-settings") || "{}"
      );

      const settings =
        raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};

      localStorage.setItem(
        "wavve-profile-settings",
        JSON.stringify({
          ...settings,
          [updatedProfile.id]: updatedProfile,
        })
      );

      setSavedProfile(updatedProfile);
      setName(trimmedName);
      setImagePickerOpen(false);
      setMessage("프로필을 저장했어요.");
    } catch {
      setMessage("저장하지 못했어요. 다시 시도해주세요.");
    }
  };

  return (
    <main className="profile-edit">
      <Link className="profile-edit__logo" to="/" aria-label="웨이브 홈">
        <img src={logo} alt="wavve" />
      </Link>

      <section
        className="profile-edit__content"
        aria-labelledby="profile-edit-title"
      >
        <h1 id="profile-edit-title">프로필 설정</h1>

        <form onSubmit={saveProfile}>
          <img className="profile-edit__avatar" src={image} alt="프로필" />

          <button
            className="profile-edit__change"
            type="button"
            aria-expanded={imagePickerOpen}
            aria-controls="profile-image-picker"
            onClick={() => setImagePickerOpen((open) => !open)}
          >
            프로필 이미지 변경 <span aria-hidden="true">›</span>
          </button>

          {imagePickerOpen && (
            <div
              className="profile-edit__images"
              id="profile-image-picker"
              role="group"
              aria-label="프로필 이미지 선택"
            >
              {profileImages.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  aria-label={`프로필 이미지 ${index + 1}`}
                  aria-pressed={image === src}
                  onClick={() => {
                    setImage(src);
                    setMessage("");
                  }}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}

          <div className="profile-edit__name-row">
            <input
              aria-label="프로필 이름"
              value={name}
              maxLength={12}
              placeholder="프로필 이름"
              onChange={(event) => {
                setName(event.target.value);
                setMessage("");
              }}
            />

            <button type="submit" disabled={!canSave}>
              저장
            </button>
          </div>

          <div className="profile-edit__lock">
            <span>프로필 잠금</span>
            <button
              type="button"
              role="switch"
              aria-checked={false}
              aria-label="프로필 잠금"
              onClick={() => setMessage("프로필 잠금 기능은 준비 중입니다.")}
            >
              <span />
            </button>
          </div>

          {message && (
            <p className="profile-edit__message" role="status">
              {message}
            </p>
          )}
        </form>

        <button
          className="profile-edit__exit"
          type="button"
          onClick={() => navigate("/mypage")}
        >
          나가기
        </button>
      </section>
    </main>
  );
};

export default ProfileEdit;