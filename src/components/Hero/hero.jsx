import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import heroSlide1 from "../../assets/hero1.webp";
import heroSlide2 from "../../assets/hero2.webp";
import EditHeroModal from "../New/editHeroModal.jsx"; // YES I ADDED MORE MODALS :)  bad janus
import { get_hero_slides, update_hero_slides } from "../../database/front_page_queries.js";
import "./hero.css";

const slide_images = [{ image: heroSlide1 }, { image: heroSlide2 }];

function Hero({ isAdmin, slidesData }) {
    const [slides, setSlides] = useState(slidesData); // FOR RUBBER. INITIAL SLIDES IS HARDCODED (SEE ABOVE). IT WANTS TO LIVE IN DB. DOESNT WISH TO LIVE ON FRONTEND.

    //NO TOUCHY THESE STATES. THEY DO THE SLIDE TRANSITION MAGIC. THEY ARE NOT FOR THE RUBBER MAN
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchSlides() {
            const response = await get_hero_slides();
            if (response.data) {
                console.log(response.data);
                setSlides([response.data.hero_1, response.data.hero_2]);
            }
        }
        if (isAdmin) {
            fetchSlides();
        }
    }, [isModalOpen, isAdmin]);
    
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
        console.log("Saving slides");
        const updateSlides = async () => {
            await update_hero_slides({
                hero_1: updatedSlides[0],
                hero_2: updatedSlides[1],
            });
        };
        updateSlides();
        setSlides(updatedSlides);
        setCurrentSlide(0); // reset to first slide
    };

    return (
        <>
            <section className="hero" id="hero-section">
                {slide_images.map((slide, index) => (
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
                        {slides[currentSlide].sub_title}
                    </span>
                    <h1 className="hero__title">
                        {slides[currentSlide].main_title
                            .split("\n")
                            .map((line, i) => (
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
        </>
    );
}

export default Hero;
