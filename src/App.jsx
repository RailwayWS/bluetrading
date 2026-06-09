import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Hero from "./components/Hero/hero";
import Products from "./pages/Products/products";
import Details from "./pages/Details/details";
import Login from "./pages/Login/login";
import { useAuth } from "./Contexts/authContext.js";
import { AuthProvider } from "./Contexts/authContextProvider.jsx";
import "./App.css";
import { ProductProvider } from "./Contexts/productContextProvider.jsx";
import Navbar from "./components/Navbar/navbar.jsx";
import About from "./components/about/about.jsx";
import Contact from "./components/contact/contact.jsx";
import Loading from "./components/loading/loading.jsx";
import { get_hero_slides } from "./database/front_page_queries.js";

function AppContent() {
    const [isVisible, setIsVisible] = useState(false);
    const { isAdmin, logout, loading } = useAuth();

    const [isAppLoading, setIsAppLoading] = useState(true);
    const [heroSlides, setHeroSlides] = useState([
        { sub_title: "", main_title: "" },
        { sub_title: "", main_title: "" },
    ]);

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

    const handleLogout = async () => {
        await logout();
    };

    useEffect(() => {
        async function fetchSlides() {
            const response = await get_hero_slides();
            if (response.data) {
                console.log(response.data);
                setHeroSlides([response.data.hero_1, response.data.hero_2]);
                setIsAppLoading(false);
            }
        }
        if (!loading) {
            fetchSlides();
        }
    }, [loading]);

    useEffect(() => {
        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    if (isAppLoading) {
        return <Loading />;
    }

    return (
        <div className="app">
            <Navbar />
            <Routes>
                <Route
                    path="/"
                    element={
                        <>
                            <Hero isAdmin={isAdmin} slidesData={heroSlides} setSlides={setHeroSlides} />
                            <About isAdmin={isAdmin} />
                            <Contact isAdmin={isAdmin} />
                        </>
                    }
                />
                <Route
                    path="/products"
                    element={<Products isAdmin={isAdmin} />}
                />
                <Route
                    path="/product/:id"
                    element={<Details isAdmin={isAdmin} />}
                />
                <Route path="/admin" element={<Login />} />
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

function App() {
    return (
        <AuthProvider>
            <ProductProvider>
                <AppContent />
            </ProductProvider>
        </AuthProvider>
    );
}

export default App;
