const messages = {
  "auth/popup-blocked": "브라우저에서 팝업을 허용한 후 다시 시도해주세요.",
  "auth/account-exists-with-different-credential": "이미 가입된 이메일이에요. 기존 로그인 방식으로 로그인해주세요.",
  "auth/operation-not-allowed": "이 로그인 방식은 아직 활성화되지 않았어요.",
  "auth/unauthorized-domain": "이 사이트 주소에서는 소셜 로그인이 허용되지 않았어요.",
  "auth/network-request-failed": "네트워크 연결을 확인해주세요.",
};

export function getSocialLoginError(error) {
  const code = error?.code;
  if (code === "auth/popup-closed-by-user") return "";

  const message = messages[code] ?? "로그인을 완료하지 못했습니다. 다시 시도해주세요.";
  return typeof code === "string" && /^auth\/[a-z0-9-]+$/.test(code)
    ? `${message} (${code})`
    : message;
}
