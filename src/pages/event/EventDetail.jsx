import { Link, useParams } from "react-router-dom";
import { eventPages } from "../../data/eventPages";

import "../../styles/components/special/HomeShared.scss";
import "../../styles/pages/shared/Category.scss";
import "../../styles/pages/event/EventDetail.scss";

// /eventdetail/:eventId → 이벤트별 컴포넌트 선택
export const EventDetail = () => {
  const { eventId } = useParams();

  const event = Object.hasOwn(eventPages, eventId)
    ? eventPages[eventId]
    : null;

  if (!event) {
    return (
      <div className="event-detail__empty">
        <p>존재하지 않는 이벤트입니다.</p>
        <Link to="/event">이벤트 목록으로</Link>
      </div>
    );
  }

  const { Component, ...meta } = event;

  return <Component key={eventId} {...meta} />;
};