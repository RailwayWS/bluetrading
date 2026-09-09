import { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Hero from "./components/Hero/hero";
import About from "./components/about/about.jsx";
import Collage from "./components/Collage/collage.jsx";
import Navbar from "./components/Navbar/navbar.jsx";
import Loading from "./components/loading/loading.jsx";
import { useAuth } from "./Contexts/authContext.js";
import { useHomeContent } from "./Contexts/homeContentContext.js";
import { AuthProvider } from "./Contexts/authContextProvider.jsx";
import { ProductProvider } from "./Contexts/productContextProvider.jsx";
import { PopupProvider } from "./Contexts/popupContextProvider.jsx";
import { HomeContentProvider } from "./Contexts/homeContentContextProvider.jsx";
import "./App.css";

// Route-level pages are lazy-loaded — nothing but the home route needs to be
// in the initial bundle.
const Products = lazy(() => import("./pages/Products/products"));
const Details = lazy(() => import("./pages/Details/details"));
const Login = lazy(() => import("./pages/Login/login"));
const AboutPage = lazy(() => import("./pages/About/about"));
const ContactPage = lazy(() => import("./pages/Contact/contact"));

function AppContent() {
    const { isAdmin, logout } = useAuth();
    const { loadingHomeContent } = useHomeContent();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            setIsVisible(window.pageYOffset > 300);
        };
        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleLogout = async () => {
        await logout();
    };

    if (loadingHomeContent) {
        return <Loading />;
    }

    return (
        <div className="app">
            <Navbar />
            <Suspense fallback={<Loading />}>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <>
                                <Hero isAdmin={isAdmin} />
                                <Collage />
                                <About isAdmin={isAdmin} />
                            </>
                        }
                    />
                    <Route path="/about" element={<AboutPage isAdmin={isAdmin} />} />
                    <Route path="/contact" element={<ContactPage isAdmin={isAdmin} />} />
                    <Route path="/products" element={<Products isAdmin={isAdmin} />} />
                    <Route path="/product/:id" element={<Details isAdmin={isAdmin} />} />
                    <Route path="/admin" element={<Login />} />
                </Routes>
            </Suspense>
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
                <PopupProvider>
                    <HomeContentProvider>
                        <AppContent />
                    </HomeContentProvider>
                </PopupProvider>
            </ProductProvider>
        </AuthProvider>
    );
}

export default App;
