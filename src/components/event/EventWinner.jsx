import { Link } from "react-router-dom";
import { List } from "lucide-react";

import "../../styles/components/event/EventWinner.scss";

export const EventWinner = ({
  title,
  announcedAt,
  period,
  prize,
  winnerGroups = [],
  deliveryNotice,
}) => {
  const hasWinners = winnerGroups.some(
    (group) => group.numbers?.length > 0
  );

  return (
    <article className="event-winner">
      <header className="event-winner__header">
        <div>
          <h1>{title}</h1>
          <p className="event-winner__date">{announcedAt}</p>
        </div>

        <Link
          to="/event?tab=winners"
          className="event-winner__list-link"
        >
          <span>
            <List size={22} aria-hidden="true" />
          </span>
          목록
        </Link>
      </header>

      <dl className="event-winner__summary">
        <div>
          <dt>이벤트명</dt>
          <dd>{title}</dd>
        </div>

        <div>
          <dt>이벤트 기간</dt>
          <dd>{period || "확인 중"}</dd>
        </div>

        <div className="event-winner__prize-row">
          <dt>경품내용</dt>
          <dd>{prize || "확인 중"}</dd>
        </div>
      </dl>

      <div className="event-winner__body">
        <p>
          안녕하세요, Wavve입니다.
          <br />
          {title} 당첨자 발표 및 추가 안내 드립니다.
        </p>

        {hasWinners ? (
          <>
            {winnerGroups.map((group, index) => (
              <section
                key={`${group.prize}-${index}`}
                className="event-winner__group"
                aria-label={`${group.prize} 당첨자`}
              >
                <h2>[경품]</h2>
                <p>{group.prize}</p>

                <ul className="event-winner__numbers">
                  {group.numbers.map((number, numberIndex) => (
                    <li key={`${number}-${numberIndex}`}>
                      {number}
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {deliveryNotice && (
              <p className="event-winner__delivery">
                {deliveryNotice}
              </p>
            )}
          </>
        ) : (
          <p className="event-winner__pending">
            당첨자 정보는 준비 중입니다.
          </p>
        )}

        <p className="event-winner__thanks">
          다시 한 번 이벤트에 참여해 주신 분들께 진심으로 감사드리며,
          <br />
          앞으로도 Wavve에서 진행될 다양한 이벤트에도
          많은 참여와 관심 부탁드립니다. 감사합니다!
        </p>
      </div>

      <div className="event-winner__bottom">
        <Link
          to="/event?tab=winners"
          className="event-winner__list-link"
        >
          <span>
            <List size={22} aria-hidden="true" />
          </span>
          목록
        </Link>
      </div>
    </article>
  );
};

export default EventWinner;