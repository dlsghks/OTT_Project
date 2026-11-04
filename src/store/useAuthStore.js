import { create } from "zustand";
import {
  browserLocalPersistence, onAuthStateChanged, setPersistence,
  signInWithEmailAndPassword, signOut,
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import { watchAccount } from "./useAccountStore";

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
