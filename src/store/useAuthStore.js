import { create } from "zustand";
import {
  browserLocalPersistence, onAuthStateChanged, setPersistence,
  signInWithEmailAndPassword, signOut, OAuthProvider, signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebase";
import { watchAccount } from "./useAccountStore";

const socialProviders = new Map([
  ["google", googleProvider],
  ["kakao", new OAuthProvider("oidc.kakao")],
  ["apple", new OAuthProvider("apple.com")],
]);

export const useAuthStore = create(() => ({
  user: null,
  authReady: false,
  authError: "",
  onLogin: async (email, password) => {
    await setPersistence(auth, browserLocalPersistence);
    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    // 상태 변경·계정 기록 구독은아래의 인증 관찰자 한 곳에서 처리합니다.
    return result.user;
  },

  onSocialLogin: async (key) => {
    const provider = socialProviders.get(key);
    if (!provider) throw new Error("지원하지 않는 로그인 방식입니다.");

    await setPersistence(auth, browserLocalPersistence);
    const result = await signInWithPopup(auth, provider);
    return result.user;
  },

  onLogout: async () => {
    await signOut(auth);
  },
}));

let unsubscribe = null;
export const initAuth = () => {
  if (unsubscribe) return;
  unsubscribe = onAuthStateChanged(auth, (user) => {
    watchAccount(user?.uid || null);
    useAuthStore.setState({ user, authReady: true, authError: "" });
  }, () => {
    watchAccount(null);
    useAuthStore.setState({
      user: null, authReady: true, authError: "로그인 상태를 확인하지 못했어요.",
    });
  });
};
