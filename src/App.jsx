import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Hero from "./components/Hero/hero";
import Products from "./components/Products/products";
import Details from "./components/Details/details";
import "./App.css";

function BackToTop() {
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
        <button
            onClick={scrollToTop}
            className={`back-to-top ${isVisible ? "back-to-top--visible" : ""}`}
            aria-label="Back to top"
        >
            ↑
        </button>
    );
}

function HomePage() {
    return (
        <>
            <Hero />
            <Products />
        </>
    );
}

function App() {
    return (
        <div className="app">
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/product/:id" element={<Details />} />
            </Routes>
            <BackToTop />
        </div>
    );
}

export default App;
