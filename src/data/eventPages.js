import { AttendanceEvent } from '../components/event/AttendanceEvent';
import { MmaEvent } from '../components/event/MmaEvent';
import { RetroVoteEvent } from '../components/event/RetroVoteEvent';
import { retrovEvents } from './retrov/retrovEvents';
import { categoryPages } from './categoryData';
import { EventWinner } from "../components/event/EventWinner";
import { eventWinnerData } from "./eventWinnerData";
import { ImageEvent } from "../components/event/ImageEvent";
import { ATTENDANCE_DOUBLE_DAYS } from "../utils/coinRecords";

const winnerPages = Object.fromEntries(
  Object.entries(eventWinnerData).map(([id, data]) => [
    id,
    {
      ...data,
      Component: EventWinner,
    },
  ])
);

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
    // 출석 코인을 200코인 지급하는 날짜 (달력의 x2 표시)
    doubleDays: ATTENDANCE_DOUBLE_DAYS,
    hotItems: [
      ...categoryPages.drama.items.slice(0, 4),
      ...categoryPages.entertainment.items.slice(0, 4),
      ...categoryPages.movie.items.slice(0, 4),
    ],
    notices: [
      '출석은 하루 1회만 인정됩니다.',
      '출석체크를 완료하면 100코인을 지급합니다.',
      'x2 표시 날짜에 출석하면 200코인을 지급합니다.',
      '본 이벤트는 사정에 따라 변경 또는 조기 종료될 수 있습니다.',
    ],
  },

  payback: {
    title: "첫 달 이용권 코인 페이백",
    period: "2026-10-30 ~ 2027-01-31",
    Component: ImageEvent,
    image: "images/events/details/payback.jpg",
    imageWidth: 800,
    hotspots: [
      {
        id: "purchase",
        label: "웨이브 이용권 구매하기",
        left: 17,
        top: 24.1,
        width: 66,
        height: 1.45,
        to: "/voucher",
      },
      {
        id: "watch",
        label: "신인감독 김연경 보러가기",
        left: 17,
        top: 49.8,
        width: 66,
        height: 1.55,
        to: "/special/rookie-coach",
      },
    ],
  },

  kidzania: {
    title: "웨이브 유료 회원 키자니아 최대 35% 할인",
    period: "2026-07-15 ~ 2026-12-31",
    Component: ImageEvent,
    image: "images/events/details/kidzania.png",
    imageWidth: 800,
    hotspots: [
      {
        id: "reservation",
        label: "키자니아 사전 예약 입장하기",
        left: 0,
        top: 94.1,
        width: 100,
        height: 5.9,
        href: "https://www.kidzania.co.kr/cusmrSvc/news_view.do?bid=18705",
      },
    ],
  },

  play: {
    title: "웨이브 × 멜론 첫 달 결제 시 다음 달 100원",
    Component: ImageEvent,
    period: "2026-08-13 ~ 2026-11-30",
    image: "images/events/details/melon.jpg",
    imageWidth: 800,
    hotspots: [
      {
        id: "purchase",
        label: "웨이브 멜론 이용권 구매하기",
        left: 8.5,
        top: 27.7,
        width: 83,
        height: 1.9,
        to: "/voucher",
      },
    ],
  },

  trinity: {
    title: "트리니티항공 × 웨이브 이용권 혜택",
    period: "2026-10-01 ~ 2027-03-31",
    Component: ImageEvent,
    image: "images/events/details/trinity.jpg",
    imageWidth: 855,
    hotspots: [
      {
        id: "trinity-link",
        label: "트리니티항공 이벤트 페이지 바로 가기",
        left: 14.3,
        top: 40,
        width: 71.4,
        height: 2.8,
        href: "https://www.trinityairways.com/app/promotion/event/retrieve/3RDnCFufyB_qdk4yJXky9A==/end/n",
      },
    ],
  },

  // 레트로브 투표 이벤트 3종
  ...Object.fromEntries(
    Object.entries(retrovEvents).map(([eventId, event]) => [
      eventId,
      {
        ...event,
        eventId,
        Component: RetroVoteEvent,
      },
    ])
  ),

  evil: {
    title: "<레지던트 이블: 0번째 밤> 론칭 프로모션",
    period: "2026-11-03 ~ 2026-11-16",
    Component: ImageEvent,
    image: "images/events/details/evil.jpg",
    imageWidth: 1240,
    hotspots: [],
  },

  // 당첨자 발표는 마지막에 배치
  ...winnerPages,
};
