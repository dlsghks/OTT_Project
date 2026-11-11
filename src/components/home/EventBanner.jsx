import { Link } from 'react-router-dom';
import { getImagePath } from '../../utils/imagePath';

export const EventBanner = ({ items = [] }) => (
    <section
        className="home-events"
        aria-label="이벤트"
        style={{
            display: 'block',
            width: 'calc(100% + var(--app-side, var(--page-side-padding)) * 2)',
            maxWidth: 'none',
            marginLeft: 'calc(var(--app-side, var(--page-side-padding)) * -1)',
            marginRight: 'calc(var(--app-side, var(--page-side-padding)) * -1)',
            padding: 0,
            boxSizing: 'border-box',
            background: 'none',
        }}
    >
        {items.map((item) => (
            <Link
                key={item.id}
                to={item.link}
                className="home-events__banner"
                style={{
                    display: 'block',
                    width: '100%',
                    height: 'var(--home-event-height, auto)',
                    minHeight: 0,
                    margin: 0,
                    padding: 0,
                    border: 0,
                    borderRadius: 0,
                    background: 'none',
                    boxShadow: 'none',
                    overflow: 'hidden',
                }}
            >
                <img
                    src={getImagePath(
                        item.image || '/images/events/event-banner-MMA.jpg'
                    )}
                    alt={item.title || 'MMA 이벤트'}
                    style={{
                        display: 'block',
                        width: 'var(--home-event-image-width, 100%)',
                        maxWidth: 'none',
                        height: 'var(--home-event-height, auto)',
                        maxHeight: 'var(--home-event-max-height, 96px)',
                        objectFit: 'contain',
                        background: '#000',
                        margin: 0,
                        marginLeft: 'var(--home-event-offset, 0px)',
                        padding: 0,
                    }}
                />
            </Link>
        ))}
    </section>
);