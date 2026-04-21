import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Hero from "./components/Hero/hero";
import Products from "./components/Products/products";
import Details from "./components/Details/details";
import Login from "./pages/Login/login";
import Admin from "./pages/Admin/admin";
import "./App.css";

import { collection, addDoc } from "firebase/firestore"; 


function App() {
    const [isVisible, setIsVisible] = useState(false);

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
                            <Products />
                        </>
                    }
                />
                <Route path="/product/:id" element={<Details />} />
                <Route path="/admin" element={<Login />} />
                <Route path="/admin/dashboard" element={<Admin />} />
            </Routes>
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
