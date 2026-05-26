import React from "react";
import { useState } from "react";
import "./about.css";
import about_img from "../../assets/hero-slide-1.png";

const initialAboutContent = {
    label: "Who we are",
    heading: "Reliable solutions, built to last.",
    description:
        'Water is the lifeblood of your operation. We specialize in supplying industry-leading irrigation equipment and heavy-duty dam liners ("damsakke") designed to withstand the toughest conditions.\n\nOur goal is simple: to provide the high-quality infrastructure you need to efficiently store, manage, and distribute your water. As dedicated marketers and distributors, we source only the most dependable products on the market.',
    stat1Number: "500+",
    stat1Text: "Clients Supplied",
    stat2Number: "100%",
    stat2Text: "Quality Focused",
    badgeNumber: "10",
    badgeText: "Years of\nExcellence",
    partnerTitle: "Contracted marketers & distributors For",
    partnerText: "Geo-Line Dam Lining Solutions",
};

const About = ({ isAdmin }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [aboutContent, setAboutContent] = useState(initialAboutContent);

    const handleAboutContentChange = (field, value) => {
        setAboutContent((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSave = () => {
        // FOR RUBBER
        setIsEditing(false);
    };

    return (
        <section id="about" className="about">
            <div className="about__container">
                <div className="about__content">
                    {isAdmin && (
                        <div className="about__admin-controls">
                            {isEditing ? (
                                <>
                                    <button
                                        className="about__admin-btn about__btn-save"
                                        onClick={handleSave}
                                    >
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="about__admin-btn about__btn-edit"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit About Section
                                </button>
                            )}
                        </div>
                    )}
                    {/* Label */}
                    {isEditing ? (
                        <input
                            className="about__editable-field about__label-edit"
                            value={aboutContent.label}
                            onChange={(e) =>
                                handleAboutContentChange(
                                    "label",
                                    e.target.value,
                                )
                            }
                        />
                    ) : (
                        <span className="about__label">
                            {aboutContent.label}
                        </span>
                    )}

                    {/* Heading */}
                    {isEditing ? (
                        <textarea
                            className="about__editable-field about__heading-edit"
                            value={aboutContent.heading}
                            onChange={(e) =>
                                handleAboutContentChange(
                                    "heading",
                                    e.target.value,
                                )
                            }
                            rows={2}
                        />
                    ) : (
                        <h2 className="about__heading">
                            {aboutContent.heading}
                        </h2>
                    )}

                    {/* Description */}
                    {isEditing ? (
                        <textarea
                            className="about__editable-field about__description-edit"
                            value={aboutContent.description}
                            onChange={(e) =>
                                handleAboutContentChange(
                                    "description",
                                    e.target.value,
                                )
                            }
                            rows={8}
                        />
                    ) : (
                        <p className="about__description">
                            {aboutContent.description}
                        </p>
                    )}

                    {/* Stats */}
                    <div className="about__stats">
                        <div className="about__stat-item">
                            {isEditing ? (
                                <>
                                    <input
                                        className="about__editable-field"
                                        value={aboutContent.stat1Number}
                                        onChange={(e) =>
                                            handleAboutContentChange(
                                                "stat1Number",
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <input
                                        className="about__editable-field"
                                        value={aboutContent.stat1Text}
                                        onChange={(e) =>
                                            handleAboutContentChange(
                                                "stat1Text",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </>
                            ) : (
                                <>
                                    <h3 className="about__stat-number">
                                        {aboutContent.stat1Number}
                                    </h3>
                                    <p className="about__stat-text">
                                        {aboutContent.stat1Text}
                                    </p>
                                </>
                            )}
                        </div>
                        <div className="about__stat-divider"></div>
                        <div className="about__stat-item">
                            {isEditing ? (
                                <>
                                    <input
                                        className="about__editable-field"
                                        value={aboutContent.stat2Number}
                                        onChange={(e) =>
                                            handleAboutContentChange(
                                                "stat2Number",
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <input
                                        className="about__editable-field"
                                        value={aboutContent.stat2Text}
                                        onChange={(e) =>
                                            handleAboutContentChange(
                                                "stat2Text",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </>
                            ) : (
                                <>
                                    <h3 className="about__stat-number">
                                        {aboutContent.stat2Number}
                                    </h3>
                                    <p className="about__stat-text">
                                        {aboutContent.stat2Text}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="about__visual">
                    <div className="about__image-wrapper">
                        <img
                            src={about_img}
                            alt="Modern office workspace"
                            className="about__image"
                        />
                        <div className="about__experience-badge">
                            {isEditing ? (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "4px",
                                    }}
                                >
                                    <input
                                        className="about__editable-field"
                                        style={{ textAlign: "center" }}
                                        value={aboutContent.badgeNumber}
                                        onChange={(e) =>
                                            handleAboutContentChange(
                                                "badgeNumber",
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <textarea
                                        className="about__editable-field"
                                        style={{ textAlign: "center" }}
                                        value={aboutContent.badgeText}
                                        onChange={(e) =>
                                            handleAboutContentChange(
                                                "badgeText",
                                                e.target.value,
                                            )
                                        }
                                        rows={2}
                                    />
                                </div>
                            ) : (
                                <>
                                    <span className="badge-number">
                                        {aboutContent.badgeNumber}
                                    </span>
                                    <span
                                        className="badge-text"
                                        style={{ whiteSpace: "pre-line" }}
                                    >
                                        {aboutContent.badgeText}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="about__partners">
                    {isEditing ? (
                        <div>
                            <input
                                className="about__editable-field about__partner-title-edit"
                                value={aboutContent.partnerTitle}
                                onChange={(e) =>
                                    handleAboutContentChange(
                                        "partnerTitle",
                                        e.target.value,
                                    )
                                }
                            />
                            <input
                                className="about__editable-field about__partner-text-edit"
                                value={aboutContent.partnerText}
                                onChange={(e) =>
                                    handleAboutContentChange(
                                        "partnerText",
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                    ) : (
                        <>
                            <p className="about__partners-title">
                                {aboutContent.partnerTitle}
                            </p>

                            <p className="about__partners-text">
                                {aboutContent.partnerText}
                            </p>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default About;
