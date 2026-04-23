import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const logout = async () => {
        const auth = getAuth();
        try {
            await signOut(auth);
            setIsAdmin(false);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ isAdmin, loading, setLoading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}