import React, { createContext, useState, useContext, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        
        // Check localStorage for persisted admin state
        const isAdminLoggedIn = localStorage.getItem("isAdminLoggedIn") === "true";
        setIsAdmin(isAdminLoggedIn);

        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const logout = async () => {
        const auth = getAuth();
        try {
            await signOut(auth);
            setIsAdmin(false);
            localStorage.removeItem("isAdminLoggedIn");
            setUser(null);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const setAdminState = (adminStatus) => {
        setIsAdmin(adminStatus);
        if (adminStatus) {
            localStorage.setItem("isAdminLoggedIn", "true");
        } else {
            localStorage.removeItem("isAdminLoggedIn");
        }
    };

    return (
        <AuthContext.Provider value={{ isAdmin, user, loading, logout, setAdminState }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
