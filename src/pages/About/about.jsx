import { useState, useEffect } from "react";
import "./about.css";
import whoWeAreImg from "../../assets/hero-slide-2.webp";
import { useHomeContent } from "../../Contexts/homeContentContext.js";
import { usePopup } from "../../Contexts/popupContext.js";
import { useReveal } from "../../hooks/useReveal.js";

const initialContent = {
    sub_title: "Who We Are",
    main_title: "A trusted name in agricultural infrastructure.",
    body: "Blue Trading was founded to give Southern African farmers direct access to reliable, industry-leading irrigation and water storage equipment.\n\nWe work closely with manufacturers and distributors we trust, so every product we supply is built to perform in the field, season after season.",
};

function AboutPage({ isAdmin }) {
    const { updateSection, withDefault } = useHomeContent();
    const { showPopup } = usePopup();
    const { ref, revealClass } = useReveal();

    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(withDefault("about_page", initialContent));

    // Keep the local editing copy in sync with the shared content, but stop
    // once the admin starts editing so their in-progress changes aren't overwritten.
    useEffect(() => {
        if (isEditing) return;
        setContent(withDefault("about_page", initialContent));
    }, [isEditing, withDefault]);

    const handleChange = (field, value) => {
        setContent((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        const result = await updateSection("about_page", content);
        if (result.success) {
            showPopup("success", "About page updated successfully!");
        } else {
            showPopup("error", "Failed to update About page.");
        }
        setIsEditing(false);
    };

    const handleClose = () => {
        setIsEditing(false);
    };

    return (
        <section id="who-we-are" className="who-we-are">
            <div ref={ref} className={`who-we-are__container ${revealClass}`}>
                <div className="who-we-are__content">
                    {isAdmin && (
                        <div className="who-we-are__admin-controls">
                            {isEditing ? (
                                <>
                                    <button
                                        className="who-we-are__admin-btn who-we-are__btn-cancel"
                                        onClick={handleClose}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="who-we-are__admin-btn who-we-are__btn-save"
                                        onClick={handleSave}
                                    >
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="who-we-are__admin-btn who-we-are__btn-edit"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit About Page
                                </button>
                            )}
                        </div>
                    )}

                    {isEditing ? (
                        <input
                            className="who-we-are__editable-field who-we-are__label-edit"
                            value={content.sub_title}
                            onChange={(e) => handleChange("sub_title", e.target.value)}
                        />
                    ) : (
                        <span className="who-we-are__label">{content.sub_title}</span>
                    )}

                    {isEditing ? (
                        <textarea
                            className="who-we-are__editable-field who-we-are__heading-edit"
                            value={content.main_title}
                            onChange={(e) => handleChange("main_title", e.target.value)}
                            rows={2}
                        />
                    ) : (
                        <h1 className="who-we-are__heading">{content.main_title}</h1>
                    )}

                    {isEditing ? (
                        <textarea
                            className="who-we-are__editable-field who-we-are__body-edit"
                            value={content.body}
                            onChange={(e) => handleChange("body", e.target.value)}
                            rows={8}
                        />
                    ) : (
                        <p className="who-we-are__body">{content.body}</p>
                    )}
                </div>

                <div className="who-we-are__visual">
                    <div className="who-we-are__image-wrapper">
                        <img
                            src={whoWeAreImg}
                            alt="Blue Trading team at work"
                            className="who-we-are__image"
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AboutPage;
