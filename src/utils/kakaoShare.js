const SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.8.4/kakao.min.js';
const SDK_INTEGRITY = 'sha384-BGX7Wb16GmRFagri4bLJV2DgipVZaU2AI812GZtHtHzzDQJnfHasDXN5houxv45w';
let pendingSdk;

// The JavaScript key is a public, domain-restricted browser key, never an Admin/REST key.
export async function getKakaoShareClient() {
  if (window.Kakao?.isInitialized?.()) return window.Kakao;
  const key = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;
  if (!key) return null;

  if (!window.Kakao) {
    pendingSdk ??= new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SDK_URL;
      script.integrity = SDK_INTEGRITY;
      script.crossOrigin = 'anonymous';
      script.async = true;
      const timeout = setTimeout(() => fail(), 15000);
      const fail = () => {
        clearTimeout(timeout);
        script.remove();
        pendingSdk = undefined;
        reject(new Error('Kakao share SDK is unavailable'));
      };
      script.onerror = fail;
      script.onload = () => {
        clearTimeout(timeout);
        if (window.Kakao) resolve();
        else fail();
      };
      document.head.append(script);
    });
    await pendingSdk;
  }

  if (!window.Kakao.isInitialized()) window.Kakao.init(key);
  return window.Kakao;
}
