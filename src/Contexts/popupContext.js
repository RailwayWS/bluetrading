import { createContext, useContext } from "react";

export const PopupContext = createContext(null);

export function usePopup() {
    const context = useContext(PopupContext);
    if (!context) {
        throw new Error("usePopup must be used within a PopupProvider");
    }
    return context;
}
