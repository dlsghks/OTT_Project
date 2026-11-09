// 코인 적립 기록: 프로필별로 계정(Firestore)에 저장합니다. 날짜는 "YYYY-MM-DD HH:mm" 문자열입니다.
export const ATTENDANCE_COIN = 100;
// x2 날짜 (달력 표시 · 출석 일수 · 코인 2배 공통, src/data/eventPages.js 에서 사용)
export const ATTENDANCE_DOUBLE_DAYS = [1, 6, 8, 13, 14, 15, 21, 22, 27, 28, 29];
const VALID_DAYS = 60; // 적립일로부터 유효기간
const MAX_RECORDS = 366;

const pad = (value) => String(value).padStart(2, "0");
const DATE_TIME = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;

export const formatCoinDate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;

// 출석 날짜("YYYY-MM-DD")로 적립 기록 만들기 (만료: 적립일 + 60일 23:59)
export const createAttendanceCoin = (day, chargedAt = `${day} 00:00`) => {
  const [year, month, date] = day.split("-").map(Number);
  const expires = new Date(year, month - 1, date + VALID_DAYS, 23, 59);
  const coin = ATTENDANCE_DOUBLE_DAYS.includes(date) ? ATTENDANCE_COIN * 2 : ATTENDANCE_COIN;
  return {
    id: `attendance-${day}`,
    amount: coin,
    remaining: coin,
    name: "출석 이벤트 지급 코인",
    reason: `${month}월 출석체크`,
    chargedAt,
    expiresAt: formatCoinDate(expires),
  };
};

// 저장값 검증 + 코인 기능 이전에 출석한 날짜도 적립 기록으로 채움 (최신순)
export const normalizeCoinRecords = (value, attendanceDays = []) => {
  const saved = (Array.isArray(value) ? value : []).filter((item) => item
    && typeof item.id === "string" && item.id
    && Number.isFinite(item.amount) && Number.isFinite(item.remaining)
    && typeof item.name === "string" && typeof item.reason === "string"
    && DATE_TIME.test(item.chargedAt) && DATE_TIME.test(item.expiresAt));
  const records = new Map(saved.map((item) => [item.id, item]));
  attendanceDays.forEach((day) => {
    const record = createAttendanceCoin(day);
    if (!records.has(record.id)) records.set(record.id, record);
  });
  return [...records.values()]
    .sort((a, b) => b.chargedAt.localeCompare(a.chargedAt))
    .slice(0, MAX_RECORDS);
};

// 만료되지 않은 잔여 코인
export const getAvailableCoin = (record, now = formatCoinDate(new Date())) =>
  record.expiresAt > now ? record.remaining : 0;
