import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import heroSlide1 from "../../assets/hero2.webp";
import {
  get_hero_slides,
  update_hero_slides,
} from "../../database/front_page_queries.js";
import "./hero.css";
import { useAuth } from "../../Contexts/authContext.js";

function Hero({ isAdmin, slidesData }) {
  const [slide, setSlide] = useState(
    slidesData[0] || { sub_title: "", main_title: "" },
  );
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const { loading } = useAuth();

  useEffect(() => {
    async function fetchSlide() {
      const response = await get_hero_slides();
      if (response) {
        setSlide(response.data.hero_1);
      }
    }
    if (!loading) {
      fetchSlide();
    }
  }, [loading]);

  const handleSlideChange = (field, value) => {
    setSlide((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    const updatedSlide = async () => {
      const result = await update_hero_slides({ hero_1: slide });

      if (result.success || result.success === undefined) {
        alert("Hero section updated successfully!");
      } else {
        alert("Failed to update hero section.");
      }
    };

    updatedSlide();
    setIsEditing(false);
  };

  const handleClose = async () => {
    setIsEditing(false);
    const response = await get_hero_slides();
    if (response) {
      setSlide(response.data.hero_1);
    }
  };

  return (
    <section className="hero" id="hero-section">
      <div
        className="hero__slide hero__slide--active"
        style={{ backgroundImage: `url(${heroSlide1})` }}
      />

      <div className="hero__overlay" />

      {/* Admin Controls */}
      {isAdmin && (
        <div className="hero__admin-controls">
          {isEditing ? (
            <>
              <button
                className="contact__admin-btn contact__btn-cancel"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                className="contact__admin-btn contact__btn-save"
                onClick={handleSave}
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              className="contact__admin-btn hero__btn-edit"
              onClick={() => setIsEditing(true)}
            >
              Edit Hero Section
            </button>
          )}
        </div>
      )}

      <div className="hero__content">
        {/* Subtitle */}
        {isEditing ? (
          <input
            className="contact__editable-field hero__subtitle-edit"
            value={slide.sub_title}
            onChange={(e) => handleSlideChange("sub_title", e.target.value)}
            placeholder="e.g. TRUSTED FARMING PARTNER"
          />
        ) : (
          <span className="hero__subtitle">{slide.sub_title}</span>
        )}

        {/* Main Title */}
        {isEditing ? (
          <>
            <textarea
              className="contact__editable-field hero__title-edit"
              value={slide.main_title}
              onChange={(e) => handleSlideChange("main_title", e.target.value)}
              rows={3}
              placeholder="e.g. Irrigation & Dam\nSolutions"
            />
            <small
              style={{
                color: "rgba(255,255,255,0.7)",
                display: "block",
                marginTop: "-20px",
                marginBottom: "30px",
                letterSpacing: "1px",
              }}
            >
              Press Enter to create a line break in the text.
            </small>
          </>
        ) : (
          <h1 className="hero__title">
            {slide.main_title.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i === 0 && <br />}
              </span>
            ))}
          </h1>
        )}

        <button className="hero__cta" onClick={() => navigate("/products")}>
          View Products
        </button>
      </div>
    </section>
  );
}

export default Hero;
