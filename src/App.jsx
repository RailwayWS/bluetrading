import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Hero from "./components/Hero/hero";
import Products from "./components/Products/products";
import Details from "./components/Details/details";
import Login from "./pages/Login/login";
import "./App.css";



function App() {
    const [isVisible, setIsVisible] = useState(false);
    const [isAdmin, setIsAdmin] = useState(
        localStorage.getItem("isAdminLoggedIn"),
    );

    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleLogout = () => {
        localStorage.removeItem("isAdminLoggedIn");
        setIsAdmin(false);
    };

    useEffect(() => {
        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    return (
        <div className="app">
            <Routes>
                <Route
                    path="/"
                    element={
                        <>
                            <Hero />
                            <Products isAdmin={isAdmin} />
                        </>
                    }
                />
                <Route path="/product/:id" element={<Details />} />
                <Route
                    path="/admin"
                    element={<Login setIsAdmin={setIsAdmin} />}
                />
            </Routes>
            {isAdmin && (
                <button onClick={handleLogout} className="end-session-btn">
                    End Session
                </button>
            )}
            <button
                onClick={scrollToTop}
                className={`back-to-top ${isVisible ? "back-to-top--visible" : ""}`}
                aria-label="Back to top"
            >
                ↑
            </button>
        </div>
    );
}

export default App;
