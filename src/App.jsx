import { useState } from "react";
import "./App.css";
import { AppRouter } from "./routers/AppRouter";
import { useAuthStore } from "./store/useAuthStore";
import {
  useAccountStore,
  watchAccount,
} from "./store/useAccountStore";

const StatusScreen = ({ children }) => (
  <div
    style={{
      display: "grid",
      placeItems: "center",
      minHeight: "100svh",
      padding: "24px",
      boxSizing: "border-box",
      background: "#1b1b1b",
      color: "#fff",
      textAlign: "center",
    }}
  >
    <div style={{ maxWidth: "480px" }}>
      {children}
    </div>
  </div>
);

function App() {
  const user = useAuthStore((state) => state.user);
  const authReady = useAuthStore((state) => state.authReady);
  const authError = useAuthStore((state) => state.authError);

  const uid = useAccountStore((state) => state.uid);
  const ready = useAccountStore((state) => state.ready);
  const error = useAccountStore((state) => state.error);

  const [actionError, setActionError] = useState("");

  const handleLogout = async () => {
    setActionError("");

    try {
      await useAuthStore.getState().onLogout();
    } catch {
      setActionError("로그아웃하지 못했어요. 다시 시도해주세요.");
    }
  };

  if (!authReady) {
    return (
      <StatusScreen>
        <p role="status">로그인 상태를 확인하고 있어요.</p>
      </StatusScreen>
    );
  }

  if (authError) {
    return (
      <StatusScreen>
        <p role="alert">{authError}</p>
      </StatusScreen>
    );
  }

  if (user && error) {
    return (
      <StatusScreen>
        <p role="alert">{error}</p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          <button
            type="button"
            onClick={() => watchAccount(user.uid)}
          >
            다시 시도
          </button>

          <button type="button" onClick={handleLogout}>
            로그아웃
          </button>
        </div>

        {actionError && <p role="alert">{actionError}</p>}
      </StatusScreen>
    );
  }

  if (user && (uid !== user.uid || !ready)) {
    return (
      <StatusScreen>
        <p role="status">
          내 프로필과 기록을 불러오고 있어요.
        </p>
      </StatusScreen>
    );
  }

  return <AppRouter />;
}

export default App;