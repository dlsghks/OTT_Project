import { useParams } from 'react-router-dom'
import { eventPages } from '../../data/eventPages'

import '../../styles/components/Home.scss'
import '../../styles/pages/Category.scss'
import '../../styles/pages/Event.scss'

// /event/:eventId → 레지스트리에서 전용 컴포넌트 선택
export const EventDetail = () => {
  const { eventId } = useParams()
  const event = eventPages[eventId]

  // 기존 /eventdetail 주소는 그대로 유지
  if (!event) {
    return (
      <div>
        이벤트 상세 페이지
      </div>
    )
  }

  const { Component, ...meta } = event
  return <Component key={eventId} {...meta} />
}
