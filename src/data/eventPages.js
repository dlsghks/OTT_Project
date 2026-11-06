import { AttendanceEvent } from '../components/event/AttendanceEvent';
import { MmaEvent } from '../components/event/MmaEvent';
import { categoryPages } from './categoryData';

// 이벤트 레지스트리 (/event/:eventId)
// 화면 구성이 완전히 다른 이벤트만 전용 컴포넌트로 만들고 여기서 연결한다.
// 내용은 2026-11-05 기준 웨이브 이벤트 페이지(11월 출석체크 · MMA2026 티켓 응모 이벤트)를 따른다.
export const eventPages = {
  attendance: {
    title: '출석체크',
    Component: AttendanceEvent,
    // 웨이브 이벤트 안내 이미지
    image: 'https://image.wavve.com/v1/thumbnails/0_0/operation/image/event/202610/1792488565306044996.jpg',
    benefits: [],
    // 출석 일수가 2배로 인정되는 날짜 (웨이브 11월 달력의 x2 표시)
    doubleDays: [1, 6, 8, 13, 14, 15, 21, 22, 27, 28, 29],
    hotItems: [
      ...categoryPages.drama.items.slice(0, 4),
      ...categoryPages.entertainment.items.slice(0, 4),
      ...categoryPages.movie.items.slice(0, 4),
    ],
    notices: [
      '출석은 하루 1회만 인정됩니다.',
      'x2 표시 날짜에 출석하면 출석 일수가 2일로 인정됩니다.',
      '본 이벤트는 사정에 따라 변경 또는 조기 종료될 수 있습니다.',
    ],
  },

  ticket: {
    title: 'MMA2026 티켓 응모 이벤트',
    subtitle: '실시간 스트리밍도 직관도 모두 Wavve에서! Wavve에서 라이브 시청 예약하고 티켓 받자!',
    period: '2026.10.26 - 2026.11.04, 10일간 진행 · 1인 1매',
    Component: MmaEvent,
    winners: [
      { label: '전체 당첨 인원', count: '120명' },
      { label: 'DAY 1 · 2026.11.14 당첨자', count: '60명' },
      { label: 'DAY 2 · 2026.11.15 당첨자', count: '60명' },
    ],
    steps: [
      { title: '이벤트에 참여하여 응모권 모으기', note: '*최대 25장' },
      { title: 'DAY 1, DAY 2 중 희망하는 날짜에 응모하기' },
      { title: '웨이브에서 당첨 결과 안내', note: '*발표 시, 앱 푸시로 안내 / 당첨자는 카카오톡 개별 안내' },
    ],
    lineup: [
      {
        date: '11.14',
        time: '토요일 18:00',
        artists: ['TUIDE (튜이드)', 'IDID (아이딧)', 'HANA', 'Dragon Pony (드래곤포니)', 'aespa', 'AEN (에이엔)', 'I.O.I (아이오아이)', 'TWS (투어스)', 'NCT DREAM', 'ATEEZ (에이티즈)', 'YENA (최예나)', 'RESCENE (리센느)', 'Hearts2Hearts (하츠투하츠)', 'RIIZE'],
      },
      {
        date: '11.15',
        time: '일요일 18:00',
        artists: ['KiiiKiii (키키)', 'IVE (아이브)', 'hrtz.wav (하츠웨이브)', 'CORTIS (코르티스)', 'NCT 127', 'AND2BLE (앤더블)', '82MAJOR (82메이저)', 'ILLIT (아일릿)', 'PLAVE', 'NCT WISH', 'LNGSHOT', 'ALPHA DRIVE ONE (알파드라이브원)'],
      },
    ],
    missions: [
      {
        label: 'EVENT 1 - Share With Friends',
        title: '이벤트 공유하기',
        description: '이벤트를 공유하고 응모권을 받아보세요. 하루 한 번, 기간 내 최대 열 장까지 받을 수 있어요.',
      },
      {
        label: 'EVENT 2 - Get Your Voucher',
        title: '이용권 구매하기',
        description: '이벤트 기간 내 웨이브 이용권 구매하고 응모권을 받아보세요. 첫 구매라면 최대 10장까지 받을 수 있어요.',
        link: '/service',
        button: '이용권 둘러보기',
      },
      {
        label: 'EVENT 3 - Pick Your Bias',
        title: '최애 아이돌 응원하기',
        description: '응원하는 아이돌을 선택하면 응모권 2장을 받을 수 있어요.',
      },
      {
        label: "EVENT 4 - Don't Miss the Live Stream",
        title: '라이브 시청 예약하기',
        description: '지금 시청 예약하면 응모권 2장을 드려요! DAY 1 11.14 토요일 17:00 · DAY 2 11.15 일요일 17:00',
        link: '/live',
        button: '라이브 보러가기',
      },
      {
        label: 'BONUS',
        title: '혜택 알림 받기',
        description: '앱 > 이벤트・혜택 푸시 수신을 설정하면 응모권 1장을 받을 수 있어요.',
      },
    ],
    benefits: [
      '실시간 채팅으로 함께 보는 재미를 느껴보세요',
      '잠시 놓쳐도 괜찮아요, 퀵VOD로 처음부터 생생하게 볼 수 있어요',
      '큰 화면으로 즐기는 MMA, 웨이브라면 TV라도 OK!',
    ],
    faq: [
      { question: '누가 참여할 수 있나요?', answer: '웨이브 회원만 참여할 수 있으며, 14세 미만은 응모할 수 없습니다.' },
      { question: '어떻게 응모하나요?', answer: '이벤트에 참여해 응모권을 모은 뒤, DAY 1 · DAY 2 중 희망하는 날짜에서 [응모하기]를 눌러야 추첨에 반영됩니다.' },
      { question: 'DAY 1, DAY 2 모두 응모할 수 있나요?', answer: 'DAY 1, DAY 2 모두 응모할 수 있으나, 티켓은 1인 1매 지급되어 두 날짜 중 한 날짜만 당첨됩니다.' },
      { question: '응모를 취소하거나 날짜를 바꿀 수 있나요?', answer: '응모한 응모권은 취소하거나 다른 일자로 변경할 수 없습니다.' },
    ],
    notices: [
      '본 이벤트는 웨이브 회원만 참여할 수 있으며, 14세 미만은 응모할 수 없습니다.',
      '이벤트 기간(2026년 10월 26일 09:00:00 ~ 11월 4일 23:59:59) 외의 참여·응모는 처리되지 않습니다.',
      '응모권은 계정 단위로 지급되며, 1인 최대 25장까지 받을 수 있습니다.',
      '받은 응모권은 반드시 [응모하기]를 눌러야 추첨에 반영되며, 응모하지 않은 응모권은 무효 처리되고 이월되지 않습니다.',
      '응모권 1장당 추첨 1회가 적용되며, 응모한 응모권은 취소하거나 다른 일자로 변경할 수 없습니다.',
      'DAY 1, DAY 2 모두 응모할 수 있으나, 티켓은 1인 1매 지급되어 두 날짜 중 한 날짜만 당첨됩니다.',
      '당첨자 발표는 11월 5일(목) 앱 푸시로 안내되며, 웨이브 이벤트 페이지에서 확인할 수 있습니다.',
      '티켓은 공연 당일 현장 수령 부스에서 수령자 신분증과 당첨 안내 메시지를 제시한 후 받을 수 있습니다.',
      '당첨 티켓은 타인에게 양도·선물·판매할 수 없습니다.',
      '개인 사정으로 공연에 참석하지 못한 경우, 티켓 재발급 및 별도 보상은 제공되지 않습니다.',
    ],
  },
};
