import { useState, useRef } from "react";
import "./editHeroModal.css";

function EditHeroModal({ initialSlides, onClose, onSave }) {
    const [slides, setSlides] = useState([...initialSlides]);
    const [isClosing, setIsClosing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fileInputRefs = useRef([]);

    // NEW FUNCS FOR THE RUBBER TO SHIT ON: handleClose, slideChange, Submit

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 250);
    };

    const handleSlideChange = (index, field, value) => {
        const newSlides = [...slides];
        newSlides[index][field] = value;
        setSlides(newSlides);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // PLEASE REMOVE THIS WHEN DONE
        setTimeout(() => {
            onSave(slides);
            handleClose();
        }, 600);
    };

    return (
        <div className={`add-modal-overlay ${isClosing ? "closing" : ""}`}>
            <div className="add-modal-content">
                <div className="modal-header-add">
                    <h2>Edit Hero Section</h2>
                    <button className="modal-close" onClick={handleClose}>
                        &times;
                    </button>
                </div>

                <form className="modal-form" onSubmit={handleSubmit}>
                    {slides.map((slide, index) => (
                        <div key={slide.id || index} className="form-section">
                            <div className="slide-header">
                                <span className="section-label">
                                    Slide {index + 1}
                                </span>
                            </div>

                            {/* Text Inputs */}
                            <div className="form-group">
                                <label>Subtitle (Top text)</label>
                                <input
                                    type="text"
                                    value={slide.sub_title}
                                    onChange={(e) =>
                                        handleSlideChange(
                                            index,
                                            "sub_title",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g. TRUSTED FARMING PARTNER"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Main Title</label>
                                <textarea
                                    value={slide.main_title}
                                    onChange={(e) =>
                                        handleSlideChange(
                                            index,
                                            "main_title",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g. Irrigation & Dam\nSolutions"
                                    rows="2"
                                    required
                                />
                                <small className="input-hint">
                                    Press Enter to create a line break in the
                                    text.
                                </small>
                            </div>
                        </div>
                    ))}

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={handleClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`btn-submit ${isSubmitting ? "is-submitting" : ""}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="spinner"></div> Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditHeroModal;
