import { getAuth, onAuthStateChanged, signOut, signInAnonymously } from "firebase/auth";
import { useState, useEffect } from "react";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isAnon, setIsAnon] = useState(false);

    useEffect(() => {
        const auth = getAuth();
        
        signInAnonymously(auth).then(() => {
            setIsAnon(true);
            console.log("Signed in anonymously");
        }).catch((error) => {
            console.error("Error signing in anonymously:", error);
        });
    }, []);

    useEffect(() => {
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && !user.isAnonymous) {
                setIsAnon(false);
                setIsAdmin(true);
            } else {
                setIsAdmin(false);

                if (user && user.isAnonymous) {
                    setIsAnon(true);
                }
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