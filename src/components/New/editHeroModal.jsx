import { useState, useRef } from "react";
import "./editHeroModal.css";

function EditHeroModal({ initialSlides, onClose, onSave }) {
    const [slides, setSlides] = useState([...initialSlides]);
    const [isClosing, setIsClosing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fileInputRefs = useRef([]);

    // NEW FUNCS FOR THE RUBBER TO SHIT ON: handleClose, slideChange, ImageUpload, Submit

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

    const handleImageUpload = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            handleSlideChange(index, "image", imageUrl);
        }
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

                            {/* Image Upload Dropzone */}
                            <div className="form-group">
                                <label>Background Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden-file-input"
                                    ref={(el) =>
                                        (fileInputRefs.current[index] = el)
                                    }
                                    onChange={(e) =>
                                        handleImageUpload(index, e)
                                    }
                                />
                                <div
                                    className="image-upload-dropzone"
                                    onClick={() =>
                                        fileInputRefs.current[index].click()
                                    }
                                >
                                    {slide.image ? (
                                        <div className="image-preview-container">
                                            <img
                                                src={slide.image}
                                                alt={`Slide ${index + 1}`}
                                                className="image-preview"
                                            />
                                            <div className="image-preview-overlay">
                                                <span>
                                                    Click to change image
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="upload-placeholder">
                                            <span>+ Click to upload image</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Text Inputs */}
                            <div className="form-group">
                                <label>Subtitle (Top text)</label>
                                <input
                                    type="text"
                                    value={slide.subtitle}
                                    onChange={(e) =>
                                        handleSlideChange(
                                            index,
                                            "subtitle",
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
                                    value={slide.title}
                                    onChange={(e) =>
                                        handleSlideChange(
                                            index,
                                            "title",
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
