import { useState, useCallback } from "react";
import { PopupContext } from "./popupContext.js";
import { PopupContainer } from "../components/popups/popups.jsx";

// App-wide replacement for window.alert(): any component can call
// usePopup().showPopup(type, message) instead of mounting its own popup
// stack, so toasts never end up duplicated or overlapping across sections.
export function PopupProvider({ children }) {
    const [popups, setPopups] = useState([]);

    const showPopup = useCallback((type, message) => {
        const id = Date.now() + Math.random();
        setPopups((prev) => [...prev, { id, type, message }]);
    }, []);

    const removePopup = useCallback((id) => {
        setPopups((prev) => prev.filter((p) => p.id !== id));
    }, []);

    return (
        <PopupContext.Provider value={{ showPopup }}>
            {children}
            <PopupContainer popups={popups} removePopup={removePopup} />
        </PopupContext.Provider>
    );
}
