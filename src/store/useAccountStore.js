import { normalizeWatchHistory, updateWatchHistory } from "../utils/watchHistoryRecords";
import { normalizeContentFavorites, toggleContentFavorite } from "../utils/contentFavoriteRecords";
import { normalizeEditorPicks, updateEditorPicks, refreshEditorPick } from "../utils/editorPickRecords";
import { createAttendanceCoin, createCoinCharge, formatCoinDate, normalizeCoinRecords } from "../utils/coinRecords";
import { createCouponRecord, markCouponUsed, normalizeCouponRecords } from "../utils/couponRecords";
import { create } from "zustand";
import { doc, onSnapshot, runTransaction, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

const PROFILE_IDS = ["profile1", "profile2", "profile3", "profile4"];
export const MAX_PROFILES = PROFILE_IDS.length;
const getProfileIds = (data) => PROFILE_IDS.filter((id) =>
  id === "profile1" || id === data.selectedProfileId || Boolean(data.profiles?.[id])
);
const ids = (value) => Array.isArray(value)
  ? [...new Set(value.filter((id) => typeof id === "string" && id))] : [];
const text = (value, fallback) => typeof value === "string" && value.trim()
  ? value.trim() : fallback;
// 출석 날짜 목록: YYYY-MM-DD 형식만 중복 없이 최신순 366일까지
const attendanceDates = (value) => Array.isArray(value)
  ? [...new Set(value.filter((day) => typeof day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(day)))]
    .sort().slice(-366)
  : [];

const defaultProfile = (id) => ({
  id,
  name: `프로필${id.slice(-1)}`,
  image: `${import.meta.env.BASE_URL}images/profiles/${id}.png`,
  likedIds: [],
  watchedIds: [],
  watchHistory: [],
  likedContents: [],
  likedEditorPicks: [],
  viewedEditorPicks: [],
  attendanceDays: [],
  coinRecords: [],
  couponRecords: [],
  pinSalt: "",
  pinHash: "",
  locked: false,
});

const normalize = (data = {}) => {
  const profiles = getProfileIds(data).map((id) => {
    const profile = defaultProfile(id);
    const saved = data.profiles?.[profile.id];
    const pinSalt = typeof saved?.pinSalt === "string" ? saved.pinSalt : "";
    const pinHash = typeof saved?.pinHash === "string" ? saved.pinHash : "";
    const attendanceDays = attendanceDates(saved?.attendanceDays);
    return {
      ...profile,
      name: text(saved?.name, profile.name),
      // 파일명만 저장해 배포 경로가 달라져도 이미지를 찾습니다.
      image: /^profile[1-4]\.png$/.test(saved?.imageFile || "")
        ? `${import.meta.env.BASE_URL}images/profiles/${saved.imageFile}`
        : profile.image,
      likedIds: ids(saved?.likedIds),
      watchedIds: ids(saved?.watchedIds).slice(0, 100),
      watchHistory: normalizeWatchHistory(saved?.watchHistory),
      likedContents: normalizeContentFavorites(saved?.likedContents),
      likedEditorPicks: normalizeEditorPicks(saved?.likedEditorPicks),
      viewedEditorPicks: normalizeEditorPicks(saved?.viewedEditorPicks),
      attendanceDays,
      coinRecords: normalizeCoinRecords(saved?.coinRecords, attendanceDays),
      couponRecords: normalizeCouponRecords(saved?.couponRecords),
      pinSalt,
      pinHash,
      locked: Boolean(pinSalt && pinHash),
    };
  });
  return {
    profiles,
    selectedProfileId: PROFILE_IDS.includes(data.selectedProfileId)
      ? data.selectedProfileId : "profile1",
  };
};

const initial = () => ({
  uid: null,
  ready: false,
  error: "",
  profiles: [defaultProfile("profile1")],
  selectedProfileId: "profile1",
});

export const useAccountStore = create(() => initial());
let stop = null;
let generation = 0;

// 기존 헤더가 읽는 프로필 이름·이미지에만 호환용 사본을 둡니다.
const mirrorProfile = (profile) => {
  try {
    if (profile) {
      localStorage.setItem("wavve-active-profile", JSON.stringify({
        id: profile.id, name: profile.name, image: profile.image,
      }));
    } else {
      localStorage.removeItem("wavve-active-profile");
    }
    window.dispatchEvent(new Event("wavve-profile-shorts-change"));
  } catch {
    // 계정 기록의 원본은 Firestore이므로 브라우저 저장 제한과 분리합니다.
  }
};

export const watchAccount = (uid) => {
  stop?.();
  stop = null;
  const token = ++generation;
  useAccountStore.setState({ ...initial(), uid, ready: !uid });
  mirrorProfile(null);
  if (!uid) return;

  stop = onSnapshot(doc(db, "users", uid), (snapshot) => {
    if (token !== generation) return;
    const next = normalize(snapshot.exists() ? snapshot.data() : {});
    useAccountStore.setState({ ...next, ready: true, error: "" });
    mirrorProfile(next.profiles.find((p) => p.id === next.selectedProfileId));
  }, (error) => {
    if (token !== generation) return;
    useAccountStore.setState({
      ready: false,
      error: error.code === "permission-denied"
        ? "계정 기록에 접근할 수 없어요. Firestore 규칙을 확인해주세요."
        : "계정 기록을 불러오지 못했어요. 연결을 확인하고 다시 시도해주세요.",
    });
  });
};

const requireAccount = (profileId, ownerId) => {
  const state = useAccountStore.getState();
  if (!state.ready || !state.uid || auth.currentUser?.uid !== state.uid ||
      (ownerId && ownerId !== state.uid) ||
      (profileId && !state.profiles.some((profile) => profile.id === profileId))) {
    throw new Error("로그인 계정과 프로필을 다시 확인해주세요.");
  }
  return state.uid;
};

export const chooseProfile = async (profileId, ownerId) => {
  const uid = requireAccount(profileId, ownerId);
  await setDoc(doc(db, "users", uid), { selectedProfileId: profileId }, { merge: true });
};

const getProfileDetails = (name, image) => {
  const imageFile = image.split("/").pop();
  const trimmedName = name.trim();
  if (!trimmedName || trimmedName.length > 12 || !/^profile[1-4]\.png$/.test(imageFile)) {
    throw new Error("프로필 이름과 이미지를 확인해주세요.");
  }
  return { name: trimmedName, imageFile };
};

export const updateProfile = async (profileId, name, image, ownerId) => {
  const uid = requireAccount(profileId, ownerId);
  const profile = getProfileDetails(name, image);
  await setDoc(doc(db, "users", uid), { profiles: { [profileId]: profile } }, { merge: true });
};

export const addProfile = async (name, image, ownerId) => {
  const uid = requireAccount(null, ownerId);
  const profile = getProfileDetails(name, image);
  const ref = doc(db, "users", uid);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    requireAccount(null, uid);
    const existingIds = getProfileIds(snapshot.data() ?? {});
    const profileId = PROFILE_IDS.find((id) => !existingIds.includes(id));
    if (!profileId) throw new Error("프로필은 최대 4개까지 추가할 수 있어요.");

    transaction.set(ref, {
      profiles: { [profileId]: profile },
      selectedProfileId: profileId,
    }, { merge: true });
  });
};

// 트랜잭션으로 최신 서버 목록을 기준으로 변경합니다.
export const changeShortsRecord = async (profileId, id, kind, ownerId) => {
  const uid = requireAccount(profileId, ownerId);
  if (typeof id !== "string" || !id) return false;
  const ref = doc(db, "users", uid);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    requireAccount(profileId, uid);
    const saved = snapshot.data()?.profiles?.[profileId];
    if (kind === "like") {
      const previous = ids(saved?.likedIds);
      const likedIds = previous.includes(id)
        ? previous.filter((value) => value !== id) : [...previous, id];
      transaction.set(ref, { profiles: { [profileId]: { likedIds } } }, { merge: true });
    } else {
      const watchedIds = [...new Set([id, ...ids(saved?.watchedIds)])].slice(0, 100);
      transaction.set(ref, { profiles: { [profileId]: { watchedIds } } }, { merge: true });
    }
  });
  return true;
};

const hashPin = async (pin, salt) => {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(pin), "PBKDF2", false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits({
    name: "PBKDF2", salt: encoder.encode(salt), iterations: 100000, hash: "SHA-256",
  }, key, 256);
  return Array.from(new Uint8Array(bits), (value) => value.toString(16).padStart(2, "0")).join("");
};

export const verifyProfilePin = async (profileId, pin, ownerId) => {
  requireAccount(profileId, ownerId);
  const profile = useAccountStore.getState().profiles.find((p) => p.id === profileId);
  if (!profile.locked) return true;
  if (!/^\d{4}$/.test(pin)) return false;
  const result = await hashPin(pin, profile.pinSalt);
  requireAccount(profileId, ownerId);
  return result === profile.pinHash;
};

export const changeProfileLock = async (profileId, pin, mode, ownerId) => {
  const uid = requireAccount(profileId, ownerId);
  if (!/^\d{4}$/.test(pin)) throw new Error("숫자 4자리를 입력해주세요.");
  const before = useAccountStore.getState().profiles.find((p) => p.id === profileId);
  let pinSalt = "", pinHash = "";
  if (mode === "setup") {
    if (before.locked) throw new Error("이미 잠긴 프로필이에요. 상태를 다시 확인해주세요.");
    pinSalt = Array.from(crypto.getRandomValues(new Uint8Array(16)),
      (value) => value.toString(16).padStart(2, "0")).join("");
    pinHash = await hashPin(pin, pinSalt);
  } else if (!(await verifyProfilePin(profileId, pin, uid))) {
    throw new Error("PIN이 맞지 않아요.");
  }
  requireAccount(profileId, uid);
  const ref = doc(db, "users", uid);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    requireAccount(profileId, uid);
    const current = snapshot.data()?.profiles?.[profileId];
    if ((current?.pinHash || "") !== before.pinHash ||
        (current?.pinSalt || "") !== before.pinSalt) {
      throw new Error("잠금 상태가 변경됐어요. 다시 시도해주세요.");
    }
    transaction.set(ref, { profiles: { [profileId]: { pinSalt, pinHash } } }, { merge: true });
  });
};

// Recommendation-page bookmarks use separate fields from individual Shorts likes.
export const changeEditorPickRecord = async (profileId, entry, kind, ownerId) => {
  const uid = requireAccount(profileId, ownerId);
  const [record] = normalizeEditorPicks([entry]);
  if (!record || !['like', 'view'].includes(kind)) throw new Error('에디터 Pick 정보를 확인해주세요.');
  const field = kind === 'like' ? 'likedEditorPicks' : 'viewedEditorPicks';
  const ref = doc(db, 'users', uid);
  await runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref);
    requireAccount(profileId, uid);
    const current = snapshot.data()?.profiles?.[profileId]?.[field];
    const records = updateEditorPicks(current, record, kind);
    const changes = { [field]: records };
    if (kind === 'view') changes.likedEditorPicks = refreshEditorPick(
      snapshot.data()?.profiles?.[profileId]?.likedEditorPicks, record
    );
    transaction.set(ref, { profiles: { [profileId]: changes } }, { merge: true });
  });
};

// Programme/movie bookmarks are separate from Shorts and Editor Pick records.
export const changeContentFavorite = async (profileId, item, ownerId) => {
  const uid = requireAccount(profileId, ownerId);
  const validateProfile = () => {
    requireAccount(profileId, uid);
    if (useAccountStore.getState().selectedProfileId !== profileId) {
      throw new Error('프로필이 변경됐어요. 다시 시도해주세요.');
    }
  };
  validateProfile();
  const [record] = normalizeContentFavorites([item]);
  if (!record) throw new Error('작품 정보를 확인해주세요.');
  await runTransaction(db, async transaction => {
    const ref = doc(db, 'users', uid);
    const snapshot = await transaction.get(ref);
    validateProfile();
    const likedContents = toggleContentFavorite(snapshot.data()?.profiles?.[profileId]?.likedContents, record);
    transaction.set(ref, { profiles: { [profileId]: { likedContents } } }, { merge: true });
  });
};


// 출석체크: 프로필별 출석 날짜와 코인 적립을 한 번에 저장합니다. 같은 날짜는 한 번만 기록됩니다.
export const saveAttendanceDay = async (profileId, day, ownerId) => {
  const uid = requireAccount(profileId, ownerId);
  const validateProfile = () => {
    requireAccount(profileId, uid);
    if (useAccountStore.getState().selectedProfileId !== profileId) {
      throw new Error("프로필이 변경됐어요. 다시 시도해주세요.");
    }
  };
  validateProfile();
  const ref = doc(db, "users", uid);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    validateProfile();
    const saved = snapshot.data()?.profiles?.[profileId];
    const previous = attendanceDates(saved?.attendanceDays);
    if (previous.includes(day)) return;
    const attendanceDays = attendanceDates([...previous, day]);
    const coinRecords = normalizeCoinRecords(
      [createAttendanceCoin(day, formatCoinDate(new Date())), ...(saved?.coinRecords ?? [])],
      attendanceDays
    );
    transaction.set(ref, { profiles: { [profileId]: { attendanceDays, coinRecords } } }, { merge: true });
  });
};

const requireSelectedProfile = (profileId, ownerId) => {
  const uid = requireAccount(profileId, ownerId);
  if (useAccountStore.getState().selectedProfileId !== profileId) {
    throw new Error("프로필이 변경됐어요. 다시 시도해주세요.");
  }
  return uid;
};

export const saveCoinCharge = async (profileId, amount, requestId, ownerId) => {
  const uid = requireSelectedProfile(profileId, ownerId);
  const record = createCoinCharge(amount, requestId);
  const ref = doc(db, "users", uid);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    requireSelectedProfile(profileId, uid);
    const saved = snapshot.data()?.profiles?.[profileId];
    const records = normalizeCoinRecords(saved?.coinRecords, attendanceDates(saved?.attendanceDays));
    const existing = records.find((item) => item.id === record.id);
    if (existing) return existing.amount;

    const coinRecords = normalizeCoinRecords([record, ...records]);
    transaction.set(ref, { profiles: { [profileId]: { coinRecords } } }, { merge: true });
    return record.amount;
  });
};

// 쿠폰 등록: 번호가 틀렸거나 이 프로필에 이미 등록했으면 false 를 돌려줍니다.
export const registerCoupon = async (profileId, code, ownerId) => {
  const record = createCouponRecord(code);
  if (!record) return false;
  const uid = requireSelectedProfile(profileId, ownerId);
  const ref = doc(db, "users", uid);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    requireSelectedProfile(profileId, uid);
    const records = normalizeCouponRecords(snapshot.data()?.profiles?.[profileId]?.couponRecords);
    if (records.some((item) => item.id === record.id)) return false;
    transaction.set(ref, { profiles: { [profileId]: { couponRecords: [record, ...records] } } }, { merge: true });
    return true;
  });
};

// 쿠폰 사용: 보유 쿠폰을 이용 쿠폰으로 옮깁니다.
export const redeemCoupon = async (profileId, couponId, ownerId) => {
  const uid = requireSelectedProfile(profileId, ownerId);
  const ref = doc(db, "users", uid);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    requireSelectedProfile(profileId, uid);
    const records = normalizeCouponRecords(snapshot.data()?.profiles?.[profileId]?.couponRecords);
    transaction.set(ref, { profiles: { [profileId]: { couponRecords: markCouponUsed(records, couponId) } } }, { merge: true });
  });
};
const libraryNormalizers = new Map([
  ["watchHistory", normalizeWatchHistory],
  ["likedContents", normalizeContentFavorites],
  ["likedEditorPicks", normalizeEditorPicks],
]);

export const removeLibraryRecord = async (profileId, field, itemId, ownerId) => {
  const uid = requireAccount(profileId, ownerId);
  const normalize = libraryNormalizers.get(field);
  if (!normalize || !itemId) throw new Error("삭제할 콘텐츠를 확인해주세요.");

  const ref = doc(db, "users", uid);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    requireAccount(profileId, uid);
    if (useAccountStore.getState().selectedProfileId !== profileId) {
      throw new Error("프로필이 변경됐어요. 다시 시도해주세요.");
    }

    const records = normalize(snapshot.data()?.profiles?.[profileId]?.[field]);
    const remaining = records.filter((record) => record.id !== itemId);
    if (remaining.length === records.length) return;
    transaction.set(ref, { profiles: { [profileId]: { [field]: remaining } } }, { merge: true });
  });
};

// 실제 재생을 시작한 작품만 현재 계정·프로필에 저장합니다.
export const saveWatchHistoryRecord = async (profileId, item, ownerId) => {
  const uid = requireAccount(profileId, ownerId);
  const validate = () => {
    requireAccount(profileId, uid);
    if (useAccountStore.getState().selectedProfileId !== profileId) {
      throw new Error("프로필이 변경됐어요. 다시 재생해주세요.");
    }
  };
  validate();
  const ref = doc(db, "users", uid);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    validate();
    const watchHistory = updateWatchHistory(snapshot.data()?.profiles?.[profileId]?.watchHistory, item);
    transaction.set(ref, { profiles: { [profileId]: { watchHistory } } }, { merge: true });
  });
};
