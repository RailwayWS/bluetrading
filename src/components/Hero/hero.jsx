import { useState, useEffect } from 'react'
import heroSlide1 from '../../assets/hero1.webp'
import heroSlide2 from '../../assets/hero2.webp'
import './hero.css'

const slides = [
    {
        image: heroSlide1,
        subtitle: "BEST AGRO COMPANY",
        title: "Quality Agricultural\nFarming Equipment",
    },
    {
        image: heroSlide2,
        subtitle: "TRUSTED FARMING PARTNER",
        title: "Irrigation & Dam\nSolutions",
    },
];

function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

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

    const scrollToProducts = () => {
        const el = document.getElementById("products-section");
        if (el) el.scrollIntoView({ behavior: "smooth" });
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
                <button className="hero__cta" onClick={scrollToProducts}>
                    Discover More
                </button>
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
        </section>
    );
}

export default Hero;
