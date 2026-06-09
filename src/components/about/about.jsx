import React from "react";
import { useState, useEffect } from "react";
import "./about.css";
import about_img from "../../assets/hero-slide-1.png";
import {
    get_about_us,
    update_about_us,
    get_stats,
    update_stats,
    get_partners,
    update_partners,
} from "../../database/front_page_queries";

import AboutImg from "../../assets/AboutImg.png";
import { useAuth } from "../../Contexts/authContext.js";

const initialAboutContent = {
    intro: {
        sub_title: "Who we are",
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
    const [isEditing, setIsEditing] = useState(false);
    const [aboutContent, setAboutContent] = useState(initialAboutContent.intro);
    const [stats, setStats] = useState(initialAboutContent.stats);
    const [partners, setPartners] = useState(initialAboutContent.partners);

    const { loading } = useAuth();

    useEffect(() => {
        const fetchAboutContent = async () => {
            const result_about = await get_about_us();
            const result_stats = await get_stats();
            const result_partners = await get_partners();

            if (result_about) {
                console.log("Fetched about content:", result_about.data);
                setAboutContent(result_about.data);
            }
            if (result_stats) {
                console.log("Fetched stats:", result_stats.data);
                setStats(result_stats.data);
            }
            if (result_partners) {
                console.log("Fetched partners:", result_partners.data);
                setPartners(result_partners.data);
            }
        };
        if (!loading) {
            fetchAboutContent();
        }
        
    }, [loading]);

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
            const [aboutResult, statsResult, partnersResult] =
                await Promise.all([
                    update_about_us(aboutContent),
                    update_stats(stats),
                    update_partners(partners),
                ]);

            if (
                aboutResult.success &&
                statsResult.success &&
                partnersResult.success
            ) {
                alert("About section updated successfully!");
            } else {
                alert("Failed to update about section");
            }
        };
        saveContent();
        setIsEditing(false);
    };

    const handleClose = async () => {
        setIsEditing(false);
        const fetchAboutContent = async () => {
            const result_about = await get_about_us();
            const result_stats = await get_stats();
            const result_partners = await get_partners();

            if (result_about) {
                console.log("Fetched about content:", result_about.data);
                setAboutContent(result_about.data);
            }
            if (result_stats) {
                console.log("Fetched stats:", result_stats.data);
                setStats(result_stats.data);
            }
            if (result_partners) {
                console.log("Fetched partners:", result_partners.data);
                setPartners(result_partners.data);
            }
        };
        fetchAboutContent();
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
                    {/* Label */}
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

                    {/* Heading */}
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

                    {/* Description */}
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

                    {/* Stats */}
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
