import { useEffect, useState } from "react";
import "./popups.css";

export function PopupContainer({ popups, removePopup }) {
    return (
        <div className="popups-container">
            {popups.map((p) => (
                <Popups key={p.id} type={p.type} message={p.message} onClose={() => removePopup(p.id)} />
            ))}
        </div>
    );
}

function Popups({ type, message, onClose }) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsExiting(true);
        }, 5000); // Visible for 5 seconds

        return () => clearTimeout(timeout);
    }, []);

    const handleAnimationEnd = (e) => {
        if (isExiting && e.animationName === 'fadeOut') {
            if (onClose) onClose();
        }
    };

    return (
        <div 
            className={`popup popup--${type} ${isExiting ? 'popup--exiting' : ''}`}
            onAnimationEnd={handleAnimationEnd}
        >
            <div className="popup__content">
                <div className="popup__icon">
                    {type === "success" ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    )}
                </div>
                <p className="popup__message">{message}</p>
            </div>
        </div>
    );
}

export default Popups;
