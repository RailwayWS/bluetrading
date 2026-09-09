import { createContext, useContext } from "react";

export const HomeContentContext = createContext(null);

export function useHomeContent() {
    const context = useContext(HomeContentContext);
    if (!context) {
        throw new Error("useHomeContent must be used within a HomeContentProvider");
    }
    return context;
}
