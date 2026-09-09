import { useState, useEffect } from "react";
import "./about.css";
import AboutImg from "../../assets/AboutImg.webp";
import { useHomeContent } from "../../Contexts/homeContentContext.js";
import { usePopup } from "../../Contexts/popupContext.js";
import { useReveal } from "../../hooks/useReveal.js";

const initialAboutContent = {
    intro: {
        sub_title: "What we do",
        main_title: "Reliable solutions, built to last.",
        body: 'Water is the lifeblood of your operation. We specialize in supplying industry-leading irrigation equipment and heavy-duty dam liners ("damsakke") designed to withstand the toughest conditions.\n\nOur goal is simple: to provide the high-quality infrastructure you need to efficiently store, manage, and distribute your water. As dedicated marketers and distributors, we source only the most dependable products on the market.',
    },
    stats: {
        stat_1: "500+",
        stat_1_name: "Clients Supplied",
        stat_2: "100%",
        stat_2_name: "Quality Focused",
        stat_3: "10",
        stat_3_name: "Years of\nExcellence",
    },
    partners: {
        main_title: "Contracted marketers & distributors For",
        partner_1: "Geo-Line Dam Lining Solutions",
    },
};

const About = ({ isAdmin }) => {
    const { homeContent, updateSections, withDefault } = useHomeContent();
    const { showPopup } = usePopup();
    const { ref, revealClass } = useReveal();

    const [isEditing, setIsEditing] = useState(false);
    const [aboutContent, setAboutContent] = useState(
        withDefault("about_us", initialAboutContent.intro),
    );
    const [stats, setStats] = useState(withDefault("stats", initialAboutContent.stats));
    const [partners, setPartners] = useState(
        withDefault("partners", initialAboutContent.partners),
    );

    // Keep the local editing copy in sync with the shared content, but stop
    // once the admin starts editing so their in-progress changes aren't overwritten.
    useEffect(() => {
        if (isEditing) return;
        setAboutContent(withDefault("about_us", initialAboutContent.intro));
        setStats(withDefault("stats", initialAboutContent.stats));
        setPartners(withDefault("partners", initialAboutContent.partners));
    }, [homeContent, isEditing, withDefault]);

    const handleAboutContentChange = (documentName, field, value) => {
        if (documentName === "about_us") {
            setAboutContent((prev) => ({
                ...prev,
                [field]: value,
            }));
        }

        if (documentName === "stats") {
            setStats((prev) => ({
                ...prev,
                [field]: value,
            }));
        }

        if (documentName === "partners") {
            setPartners((prev) => ({
                ...prev,
                [field]: value,
            }));
        }
    };

    const handleSave = () => {
        const saveContent = async () => {
            const result = await updateSections({
                about_us: aboutContent,
                stats,
                partners,
            });

            if (result.success) {
                showPopup("success", "About section updated successfully!");
            } else {
                showPopup("error", "Failed to update about section.");
            }
        };
        saveContent();
        setIsEditing(false);
    };

    const handleClose = () => {
        setIsEditing(false);
    };

    return (
        <section id="about" className="about">
            <div ref={ref} className={`about__container ${revealClass}`}>
                <div className="about__content">
                    {isAdmin && (
                        <div className="about__admin-controls">
                            {isEditing ? (
                                <>
                                    <button
                                        className="about__admin-btn about__btn-cancel"
                                        onClick={handleClose}
                                    >
                                        Cancel
                                    </button>
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
                    {isEditing ? (
                        <input
                            className="about__editable-field about__label-edit"
                            value={aboutContent.sub_title}
                            onChange={(e) =>
                                handleAboutContentChange(
                                    "about_us",
                                    "sub_title",
                                    e.target.value,
                                )
                            }
                        />
                    ) : (
                        <span className="about__label">
                            {aboutContent.sub_title}
                        </span>
                    )}

                    {isEditing ? (
                        <textarea
                            className="about__editable-field about__heading-edit"
                            value={aboutContent.main_title}
                            onChange={(e) =>
                                handleAboutContentChange(
                                    "about_us",
                                    "main_title",
                                    e.target.value,
                                )
                            }
                            rows={2}
                        />
                    ) : (
                        <h2 className="about__heading">
                            {aboutContent.main_title}
                        </h2>
                    )}

                    {isEditing ? (
                        <textarea
                            className="about__editable-field about__description-edit"
                            value={aboutContent.body}
                            onChange={(e) =>
                                handleAboutContentChange(
                                    "about_us",
                                    "body",
                                    e.target.value,
                                )
                            }
                            rows={8}
                        />
                    ) : (
                        <p className="about__description">
                            {aboutContent.body}
                        </p>
                    )}

                    <div className="about__stats">
                        <div className="about__stat-item">
                            {isEditing ? (
                                <>
                                    <input
                                        className="about__editable-field"
                                        value={stats.stat_1}
                                        onChange={(e) =>
                                            handleAboutContentChange(
                                                "stats",
                                                "stat_1",
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <input
                                        className="about__editable-field"
                                        value={stats.stat_1_name}
                                        onChange={(e) =>
                                            handleAboutContentChange(
                                                "stats",
                                                "stat_1_name",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </>
                            ) : (
                                <>
                                    <h3 className="about__stat-number">
                                        {stats.stat_1}
                                    </h3>
                                    <p className="about__stat-text">
                                        {stats.stat_1_name}
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
                                        value={stats.stat_2}
                                        onChange={(e) =>
                                            handleAboutContentChange(
                                                "stats",
                                                "stat_2",
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <input
                                        className="about__editable-field"
                                        value={stats.stat_2_name}
                                        onChange={(e) =>
                                            handleAboutContentChange(
                                                "stats",
                                                "stat_2_name",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </>
                            ) : (
                                <>
                                    <h3 className="about__stat-number">
                                        {stats.stat_2}
                                    </h3>
                                    <p className="about__stat-text">
                                        {stats.stat_2_name}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="about__visual">
                    <div className="about__image-wrapper">
                        <img
                            src={AboutImg}
                            alt="Modern office workspace"
                            className="about__image"
                            loading="lazy"
                            decoding="async"
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
                                        value={stats.stat_3}
                                        onChange={(e) =>
                                            handleAboutContentChange(
                                                "stats",
                                                "stat_3",
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <textarea
                                        className="about__editable-field"
                                        style={{ textAlign: "center" }}
                                        value={stats.stat_3_name}
                                        onChange={(e) =>
                                            handleAboutContentChange(
                                                "stats",
                                                "stat_3_name",
                                                e.target.value,
                                            )
                                        }
                                        rows={2}
                                    />
                                </div>
                            ) : (
                                <>
                                    <span className="badge-number">
                                        {stats.stat_3}
                                    </span>
                                    <span
                                        className="badge-text"
                                        style={{ whiteSpace: "pre-line" }}
                                    >
                                        {stats.stat_3_name}
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
                                value={partners.main_title}
                                onChange={(e) =>
                                    handleAboutContentChange(
                                        "partners",
                                        "main_title",
                                        e.target.value,
                                    )
                                }
                            />
                            <input
                                className="about__editable-field about__partner-text-edit"
                                value={partners.partner_1}
                                onChange={(e) =>
                                    handleAboutContentChange(
                                        "partners",
                                        "partner_1",
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                    ) : (
                        <>
                            <p className="about__partners-title">
                                {partners.main_title}
                            </p>

                            <p className="about__partners-text">
                                {partners.partner_1}
                            </p>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default About;
