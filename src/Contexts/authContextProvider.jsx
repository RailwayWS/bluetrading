import { getAuth, onAuthStateChanged, signOut, signInAnonymously } from "firebase/auth";
import { useState, useEffect } from "react";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAnon, setIsAnon] = useState(false);
    const [loadingAuth, setLoadingAuth] = useState(true);


    useEffect(() => {
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                if (!user.isAnonymous) {
                    console.log("User is signed in:", user);
                    setIsAdmin(true);
                    setIsAnon(false);
                    setLoadingAuth(false);
                }
                if (user.isAnonymous) {
                    console.log("User is signed in anonymously:", user);
                    setIsAnon(true);
                    setIsAdmin(false);
                    setLoadingAuth(false);
                }
            } else {
                setIsAdmin(false);
                console.log("No user is signed in, signing in anonymously...");
                signInAnonymously(auth).then(() => {
                    console.log("Signed in anonymously");
                    setLoadingAuth(false);
                    setIsAnon(true);
                }).catch((error) => {
                    console.error("Error signing in anonymously:", error);
                });
            }
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
        <AuthContext.Provider value={{ isAdmin, loadingAuth, logout, isAnon }}>
            {children}
        </AuthContext.Provider>
    );
}