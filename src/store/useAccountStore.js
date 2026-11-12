import { createCoinPurchase, deductPurchaseCoins } from "../utils/coinPayments";
import { normalizeWatchHistory, updateWatchHistory } from "../utils/watchHistoryRecords";
import { normalizeContentFavorites, toggleContentFavorite } from "../utils/contentFavoriteRecords";
import { normalizeEditorPicks, updateEditorPicks, refreshEditorPick } from "../utils/editorPickRecords";
import { createAttendanceCoin, createCoinCharge, formatCoinDate, getCoinTotal, normalizeCoinRecords } from "../utils/coinRecords";
import { createCouponBenefit, createCouponRecord, isCouponValid, markCouponUsed, reconcileCouponBenefits } from "../utils/couponRecords";
import { create } from "zustand";
import { deleteField, doc, onSnapshot, runTransaction } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

const PROFILE_IDS = ["profile1", "profile2", "profile3", "profile4"];
export const MAX_PROFILES = PROFILE_IDS.length;
const getProfileIds = (data) => {
  if (Array.isArray(data.profileIds)) {
    const savedIds = [...new Set(data.profileIds.filter((id) =>
      PROFILE_IDS.includes(id) || (typeof id === "string" && /^profile-[0-9a-f-]{36}$/.test(id))
    ))].slice(0, MAX_PROFILES);
    if (savedIds.length) return savedIds;
  }
  return PROFILE_IDS.filter((id) =>
    id === "profile1" || id === data.selectedProfileId || Boolean(data.profiles?.[id])
  );
};
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
  name: PROFILE_IDS.includes(id) ? `프로필${id.slice(-1)}` : "프로필",
  image: `${import.meta.env.BASE_URL}images/profiles/${PROFILE_IDS.includes(id) ? id : "profile1"}.png`,
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
  const profileIds = getProfileIds(data);
  const currentProfileId = profileIds.includes(data.selectedProfileId) ? data.selectedProfileId : null;
  const profiles = profileIds.map((id) => {
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
      couponRecords: reconcileCouponBenefits(saved?.couponRecords, saved?.coinRecords, data.couponVoucherPurchases, profile.id),
      pinSalt,
      pinHash,
      locked: Boolean(pinSalt && pinHash),
    };
  });
  return {
    profiles,
    currentProfileId,
    coinPurchases: Array.isArray(data.coinPurchases) ? data.coinPurchases.filter((entry) =>
      entry && ["voucher", "content"].includes(entry.type) && entry.purchase
      && typeof entry.id === "string" && Number.isFinite(entry.purchasedAt)) : [],
    couponVoucherPurchases: Array.isArray(data.couponVoucherPurchases)
      ? data.couponVoucherPurchases.filter((item) => item && typeof item.id === "string"
        && ["wavve-standard", "double-basic"].includes(item.planId)
        && Number.isFinite(item.purchasedAt) && Number.isFinite(item.expiresAt))
      : [],
    selectedProfileId: currentProfileId ?? (profiles.find((profile) => !profile.locked) ?? profiles[0]).id,
  };
};

const initial = () => ({
  uid: null,
  ready: false,
  error: "",
  profiles: [defaultProfile("profile1")],
  currentProfileId: null,
  couponVoucherPurchases: [],
  coinPurchases: [],
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

const getProfileDetails = (name, image) => {
  const imageFile = image.split("/").pop();
  const trimmedName = name.trim();
  if (!trimmedName || trimmedName.length > 12 || !/^profile[1-4]\.png$/.test(imageFile)) {
    throw new Error("프로필 이름과 이미지를 확인해주세요.");
  }
  return { name: trimmedName, imageFile };
};

// 이전 버전에서 선택만 했던 프로필도 다른 프로필로 전환하기 전에 기록합니다.
const getLegacySelectedProfile = (data) => {
  const id = data.selectedProfileId;
  if (id === "profile1" || !PROFILE_IDS.includes(id) || data.profiles?.[id]) return null;
  return defaultProfile(id);
};

export const chooseProfile = async (profileId, ownerId) => {
  const uid = requireAccount(profileId, ownerId);
  const ref = doc(db, "users", uid);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    requireAccount(profileId, uid);
    const data = snapshot.data() ?? {};
    if (!getProfileIds(data).includes(profileId)) {
      throw new Error("선택한 프로필을 다시 확인해주세요.");
    }
    const legacy = getLegacySelectedProfile(data);
    const patch = { selectedProfileId: profileId };
    if (legacy) patch.profiles = { [legacy.id]: getProfileDetails(legacy.name, legacy.image) };
    transaction.set(ref, patch, { merge: true });
  });
};

const getExistingProfileData = (snapshot, profileId) => {
  const data = snapshot.data() ?? {};
  if (!getProfileIds(data).includes(profileId)) {
    throw new Error("삭제된 프로필이에요. 다른 프로필을 선택해주세요.");
  }
  return data.profiles?.[profileId];
};

export const updateProfile = async (profileId, name, image, ownerId) => {
  const uid = requireAccount(profileId, ownerId);
  const profile = getProfileDetails(name, image);
  const ref = doc(db, "users", uid);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    requireAccount(profileId, uid);
    getExistingProfileData(snapshot, profileId);
    transaction.set(ref, { profiles: { [profileId]: profile } }, { merge: true });
  });
};

export const addProfile = async (name, image, ownerId) => {
  const uid = requireAccount(null, ownerId);
  const profile = getProfileDetails(name, image);
  const profileId = `profile-${crypto.randomUUID()}`;
  const ref = doc(db, "users", uid);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    requireAccount(null, uid);
    const data = snapshot.data() ?? {};
    const existingIds = getProfileIds(data);
    if (existingIds.length >= MAX_PROFILES) throw new Error("프로필은 최대 4개까지 추가할 수 있어요.");

    const legacy = getLegacySelectedProfile(data);
    const profiles = { [profileId]: profile };
    if (legacy) profiles[legacy.id] = getProfileDetails(legacy.name, legacy.image);
    transaction.set(ref, {
      profiles,
      profileIds: [...existingIds, profileId],
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
    const saved = getExistingProfileData(snapshot, profileId);
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

export const removeProfile = async (profileId, pin, ownerId) => {
  const uid = requireAccount(profileId, ownerId);
  const ref = doc(db, "users", uid);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    requireAccount(profileId, uid);
    const profile = getExistingProfileData(snapshot, profileId);
    const data = snapshot.data() ?? {};
    const remaining = getProfileIds(data).filter((id) => id !== profileId);
    if (!remaining.length) throw new Error("프로필은 하나 이상 남겨야 해요.");
    if (!remaining.includes(data.selectedProfileId) && remaining.every((id) => {
      const other = data.profiles?.[id];
      return other?.pinSalt && other?.pinHash;
    })) {
      throw new Error("다른 프로필로 전환한 뒤 이 프로필을 삭제해주세요.");
    }
    if (profile?.pinHash && profile?.pinSalt &&
        (!/^\d{4}$/.test(pin) || await hashPin(pin, profile.pinSalt) !== profile.pinHash)) {
      throw new Error("프로필 PIN이 맞지 않아요.");
    }

    requireAccount(profileId, uid);
    transaction.update(ref, {
      profileIds: remaining,
      [`profiles.${profileId}`]: deleteField(),
      ...(data.selectedProfileId === profileId ? { selectedProfileId: null } : {}),
    });
  });
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
    const current = getExistingProfileData(snapshot, profileId);
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
    const profile = getExistingProfileData(snapshot, profileId);
    const current = profile?.[field];
    const records = updateEditorPicks(current, record, kind);
    const changes = { [field]: records };
    if (kind === 'view') changes.likedEditorPicks = refreshEditorPick(
      profile?.likedEditorPicks, record
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
    const likedContents = toggleContentFavorite(getExistingProfileData(snapshot, profileId)?.likedContents, record);
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
    const saved = getExistingProfileData(snapshot, profileId);
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
    const saved = getExistingProfileData(snapshot, profileId);
    const records = normalizeCoinRecords(saved?.coinRecords, attendanceDates(saved?.attendanceDays));
    const existing = records.find((item) => item.id === record.id);
    if (existing) return existing.amount;

    const coinRecords = normalizeCoinRecords([record, ...records]);
    transaction.set(ref, { profiles: { [profileId]: { coinRecords } } }, { merge: true });
    return record.amount;
  });
};

// 코인 차감과 구매 권한을 같은 계정 트랜잭션에서 확정합니다.
export const saveCoinPurchase = async (profileId, type, purchase, coinsUsed, requestId, ownerId) => {
  const uid = requireSelectedProfile(profileId, ownerId);
  const payment = { ...createCoinPurchase(type, purchase, coinsUsed, requestId), profileId };
  const ref = doc(db, "users", uid);
  const result = await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    requireSelectedProfile(profileId, uid);
    const saved = getExistingProfileData(snapshot, profileId);
    const previous = Array.isArray(snapshot.data()?.coinPurchases)
      ? snapshot.data().coinPurchases.filter((entry) => entry && entry.purchase) : [];
    const existing = previous.find((entry) => entry.id === requestId
      || (type === "content" && entry.type === "content" && entry.purchase?.id === payment.purchase.id));
    if (existing) {
      if (existing.profileId !== profileId || existing.type !== type
        || existing.purchase.id !== payment.purchase.id) throw new Error("결제 요청이 변경됐어요.");
      return existing;
    }
    const coins = normalizeCoinRecords(saved?.coinRecords, attendanceDates(saved?.attendanceDays));
    const coinRecords = deductPurchaseCoins(coins, coinsUsed);
    const completedPayment = { ...payment, balanceAfter: getCoinTotal(coinRecords) };
    transaction.set(ref, {
      coinPurchases: [completedPayment, ...previous],
      profiles: { [profileId]: { coinRecords } },
    }, { merge: true });
    return completedPayment;
  });
  // 스냅샷 수신 전에도 구매 완료 화면과 권한이 같은 결제를 읽도록 합니다.
  if (useAccountStore.getState().uid === uid) {
    useAccountStore.setState((state) => ({
      coinPurchases: [result, ...(state.coinPurchases ?? []).filter((entry) => entry.id !== result.id)],
    }));
  }
  return result;
};

const hasExistingVoucher = (data, uid) => {
  const purchases = [...(data.couponVoucherPurchases ?? []),
    ...(data.coinPurchases ?? []).filter((entry) => entry.type === "voucher").map((entry) => entry.purchase)];
  try {
    const prefix = `ott:demo-voucher:${encodeURIComponent(uid)}:`;
    Object.keys(localStorage).filter((key) => key.startsWith(prefix)).forEach((key) => {
      try { const value = JSON.parse(localStorage.getItem(key)); if (value) purchases.push(value); } catch { /* 잘못된 기록 제외 */ }
    });
  } catch { /* 서버에 저장된 이용권으로 확인 */ }
  purchases.sort((a, b) => b.purchasedAt - a.purchasedAt);
  return purchases[0]?.expiresAt > Date.now();
};

// 쿠폰 효과와 사용 상태를 함께 저장해 중복 적립·중복 사용을 막습니다.
const couponBenefitPatch = (snapshot, saved, records, coupon, profileId) => {
  const benefit = createCouponBenefit(coupon, profileId);
  const profilePatch = { couponRecords: markCouponUsed(records, coupon.id)
    .map((item) => item.id === coupon.id ? { ...item, benefitApplied: true } : item) };
  const patch = { profiles: { [profileId]: profilePatch } };
  if (benefit.coin) {
    const coins = normalizeCoinRecords(saved?.coinRecords, attendanceDates(saved?.attendanceDays));
    profilePatch.coinRecords = normalizeCoinRecords([
      benefit.coin, ...coins.filter((item) => item.id !== benefit.coin.id),
    ]);
  }
  if (benefit.voucher) {
    const previous = snapshot.data()?.couponVoucherPurchases;
    patch.couponVoucherPurchases = [
      benefit.voucher,
      ...(Array.isArray(previous) ? previous : []).filter((item) => item.id !== benefit.voucher.id),
    ];
  }
  return patch;
};

// 등록은 보유 쿠폰 추가만 수행합니다. 혜택은 사용하기에서 지급합니다.
export const registerCoupon = async (profileId, code, ownerId) => {
  const record = createCouponRecord(code);
  if (!record || !isCouponValid(record)) return false;
  const uid = requireSelectedProfile(profileId, ownerId);
  const ref = doc(db, "users", uid);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    requireSelectedProfile(profileId, uid);
    const saved = getExistingProfileData(snapshot, profileId);
    const records = reconcileCouponBenefits(saved?.couponRecords, saved?.coinRecords,
      snapshot.data()?.couponVoucherPurchases, profileId);
    if (records.some((item) => item.id === record.id)) return false;
    const next = [record, ...records];
    const patch = { profiles: { [profileId]: { couponRecords: next } } };
    transaction.set(ref, patch, { merge: true });
    return true;
  });
};

export const redeemCoupon = async (profileId, couponId, ownerId) => {
  const uid = requireSelectedProfile(profileId, ownerId);
  const ref = doc(db, "users", uid);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    requireSelectedProfile(profileId, uid);
    const saved = getExistingProfileData(snapshot, profileId);
    const records = reconcileCouponBenefits(saved?.couponRecords, saved?.coinRecords,
      snapshot.data()?.couponVoucherPurchases, profileId);
    const coupon = records.find((item) => item.id === couponId && item.status === "owned");
    if (!coupon || !isCouponValid(coupon)) return false;
    if (coupon.kind === "voucher" && hasExistingVoucher(snapshot.data() ?? {}, uid)) {
      throw new Error("이용권이 없을 때만 이용권 쿠폰을 사용할 수 있습니다.");
    }
    transaction.set(ref, couponBenefitPatch(snapshot, saved, records, coupon, profileId), { merge: true });
    return true;
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

    const records = normalize(getExistingProfileData(snapshot, profileId)?.[field]);
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
    const watchHistory = updateWatchHistory(getExistingProfileData(snapshot, profileId)?.watchHistory, item);
    transaction.set(ref, { profiles: { [profileId]: { watchHistory } } }, { merge: true });
  });
};
