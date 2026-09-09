import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import heroSlide1 from "../../assets/hero2.webp";
import "./hero.css";
import { useHomeContent } from "../../Contexts/homeContentContext.js";
import { usePopup } from "../../Contexts/popupContext.js";

const emptySlide = { sub_title: "", main_title: "" };

function Hero({ isAdmin }) {
  const { homeContent, updateSection } = useHomeContent();
  const { showPopup } = usePopup();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [slide, setSlide] = useState(homeContent.hero_1 || emptySlide);

  // Keep the local editing copy in sync with the shared content, but stop
  // once the admin starts editing so their in-progress changes aren't overwritten.
  useEffect(() => {
    if (!isEditing) {
      setSlide(homeContent.hero_1 || emptySlide);
    }
  }, [homeContent.hero_1, isEditing]);

  const handleSlideChange = (field, value) => {
    setSlide((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const result = await updateSection("hero_1", slide);
    if (result.success) {
      showPopup("success", "Hero section updated successfully!");
    } else {
      showPopup("error", "Failed to update hero section.");
    }
    setIsEditing(false);
  };

  const handleClose = () => {
    setSlide(homeContent.hero_1 || emptySlide);
    setIsEditing(false);
  };

  return (
    <section className="hero" id="hero-section">
      <div
        className="hero__slide hero__slide--active"
        style={{ backgroundImage: `url(${heroSlide1})` }}
      />

      <div className="hero__overlay" />

      {isAdmin && (
        <div className="hero__admin-controls">
          {isEditing ? (
            <>
              <button
                className="hero__admin-btn hero__btn-cancel"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                className="hero__admin-btn hero__btn-save"
                onClick={handleSave}
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              className="hero__admin-btn hero__btn-edit"
              onClick={() => setIsEditing(true)}
            >
              Edit Hero Section
            </button>
          )}
        </div>
      )}

      <div className="hero__content">
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
