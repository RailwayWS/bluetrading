import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import heroSlide1 from "../../assets/hero1.webp";
import heroSlide2 from "../../assets/hero2.webp";
import EditHeroModal from "../New/editHeroModal.jsx"; // YES I ADDED MORE MODALS :)
import "./hero.css";

const initialSlides = [
    {
        image: heroSlide2,
        subtitle: "TRUSTED FARMING PARTNER",
        title: "Irrigation & Dam\nSolutions",
    },
    {
        image: heroSlide1,
        subtitle: "BEST AGRICULTURAL EQUIPMENT",
        title: "Quality Agricultural\nFarming Equipment",
    },
];

function Hero({ isAdmin }) {
    const [slides, setSlides] = useState(initialSlides); // FOR RUBBER. INITIAL SLIDES IS HARDCODED (SEE ABOVE). IT WANTS TO LIVE IN DB. DOESNT WISH TO LIVE ON FRONTEND.

    //NO TOUCHY THESE STATES. THEY DO THE SLIDE TRANSITION MAGIC. THEY ARE NOT FOR THE RUBBER MAN
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentSlide((prev) => (prev + 1) % slides.length);
                setIsTransitioning(false);
            }, 800);
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    const handleSaveSlides = (updatedSlides) => {
        // FOR THE RUBBER MAN
        setSlides(updatedSlides);
        setCurrentSlide(0); // reset to first slide
    };

    return (
        <section className="hero" id="hero-section">
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`hero__slide ${index === currentSlide ? "hero__slide--active" : ""} ${isTransitioning && index === currentSlide ? "hero__slide--exiting" : ""}`}
                    style={{ backgroundImage: `url(${slide.image})` }}
                />
            ))}

            <div className="hero__overlay" />

            <div
                className={`hero__content ${isTransitioning ? "hero__content--fading" : ""}`}
            >
                <span className="hero__subtitle">
                    {slides[currentSlide].subtitle}
                </span>
                <h1 className="hero__title">
                    {slides[currentSlide].title.split("\n").map((line, i) => (
                        <span key={i}>
                            {line}
                            {i === 0 && <br />}
                        </span>
                    ))}
                </h1>
                <button
                    className="hero__cta"
                    onClick={() => navigate("/products")}
                >
                    View Products
                </button>
                {isAdmin && (
                    <button
                        className="hero__admin-edit-btn"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Edit Hero Section
                    </button>
                )}
            </div>

            <div className="hero__indicators">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className={`hero__indicator ${index === currentSlide ? "hero__indicator--active" : ""}`}
                        onClick={() => {
                            setIsTransitioning(true);
                            setTimeout(() => {
                                setCurrentSlide(index);
                                setIsTransitioning(false);
                            }, 400);
                        }}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
            {isModalOpen && (
                <EditHeroModal
                    initialSlides={slides}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveSlides}
                />
            )}
        </section>
    );
}

export default Hero;
