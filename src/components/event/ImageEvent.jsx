import { useState } from "react";
import { Link } from "react-router-dom";

import "../../styles/components/event/ImageEvent.scss";

export const ImageEvent = ({
    title,
    image,
    period,
    imageWidth = 800,
    hotspots = [],
}) => {
    const [message, setMessage] = useState("");

    const imageSrc = `${import.meta.env.BASE_URL}${image.replace(/^\/+/, "")}`;

    return (
        <section className="image-event" aria-label={title}>
            <header className="image-event__header">
                <h1>{title}</h1>
                {period && <p>{period}</p>}
            </header>
            <div
                className="image-event__poster"
                style={{ maxWidth: imageWidth }}
            >
                <img
                    className="image-event__image"
                    src={imageSrc}
                    alt={`${title} 이벤트 상세 안내`}
                />

                {hotspots.map((hotspot) => {
                    const className = "image-event__hotspot";

                    const style = {
                        left: `${hotspot.left}%`,
                        top: `${hotspot.top}%`,
                        width: `${hotspot.width}%`,
                        height: `${hotspot.height}%`,
                    };

                    if (hotspot.to) {
                        return (
                            <Link
                                key={hotspot.id}
                                to={hotspot.to}
                                className={className}
                                style={style}
                                aria-label={hotspot.label}
                            />
                        );
                    }

                    if (hotspot.href) {
                        return (
                            <a
                                key={hotspot.id}
                                href={hotspot.href}
                                className={className}
                                style={style}
                                aria-label={hotspot.label}
                                target="_blank"
                                rel="noopener noreferrer"
                            />
                        );
                    }

                    return (
                        <button
                            key={hotspot.id}
                            type="button"
                            className={className}
                            style={style}
                            aria-label={hotspot.label}
                            onClick={() =>
                                setMessage(
                                    hotspot.message || "해당 페이지는 준비 중입니다."
                                )
                            }
                        />
                    );
                })}
            </div>

            {message && (
                <div className="image-event__message" role="status">
                    <p>{message}</p>
                    <button type="button" onClick={() => setMessage("")}>
                        닫기
                    </button>
                </div>
            )}

            <div className="image-event__actions">
                <Link to="/event">이벤트 목록</Link>
            </div>
        </section>
    );
};

export default ImageEvent;