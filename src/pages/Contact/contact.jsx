import { useState, useEffect, Fragment } from "react";
import "./contact.css";
import { useHomeContent } from "../../Contexts/homeContentContext.js";
import { usePopup } from "../../Contexts/popupContext.js";
import { useReveal } from "../../hooks/useReveal.js";
import deleteIcon from "../../assets/symbols/delete(1).png";

const WEB3FORMS_ACCESS_KEY = "15df6873-ac63-4fb0-b961-dc1859129216";

const initialContactContent = {
    top_title: "Get In Touch",
    main_title: "Ready to upgrade your water infrastructure?",
    sub_title:
        "Whether you need a quote on heavy-duty dam liners or advice on your next big irrigation project, our team is ready to help.",
    email: "sales@yourclientdomain.co.za",
    phone_number: "Sales|+27 (0) 21 123 4567",
    location: "123 Agri Park, Industrial Area\nStellenbosch, 7600",
};

// Phone numbers are stored as a single string (one entry per line, as
// "Label|Value") so the schema stays exactly what it was before — these two
// helpers are the only place that format is known about.
function parsePairs(raw) {
    const rows = (raw || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const [first, ...rest] = line.split("|");
            return rest.length > 0
                ? { name: first.trim(), value: rest.join("|").trim() }
                : { name: "", value: first.trim() };
        });
    return rows.length > 0 ? rows : [{ name: "", value: "" }];
}

function serializePairs(rows) {
    return rows
        .map((row) => ({ name: row.name.trim(), value: row.value.trim() }))
        .filter((row) => row.value)
        .map((row) => (row.name ? `${row.name}|${row.value}` : row.value))
        .join("\n");
}

// Emails have no label, just a single string with one address per line.
function parseList(raw) {
    const values = (raw || "").split("\n").map((line) => line.trim()).filter(Boolean);
    return values.length > 0 ? values : [""];
}

function serializeList(values) {
    return values.map((v) => v.trim()).filter(Boolean).join("\n");
}

function Contact({ isAdmin }) {
    const { homeContent, updateSection } = useHomeContent();
    const { showPopup } = usePopup();
    const { ref, revealClass } = useReveal();

    const [contactContent, setContactContent] = useState({
        ...initialContactContent,
        ...homeContent.contact,
    });
    const [phoneRows, setPhoneRows] = useState(() => parsePairs(contactContent.phone_number));
    const [emailRows, setEmailRows] = useState(() => parseList(contactContent.email));
    const [isEditing, setIsEditing] = useState(false);
    const [formResult, setFormResult] = useState("");

    // Keep the local editing copy in sync with the shared content, but stop
    // once the admin starts editing so their in-progress changes aren't overwritten.
    useEffect(() => {
        if (isEditing) return;
        setContactContent({ ...initialContactContent, ...homeContent.contact });
    }, [homeContent.contact, isEditing]);

    const handleContactContentChange = (field, value) => {
        setContactContent((prev) => ({ ...prev, [field]: value }));
    };

    const startEditing = () => {
        setPhoneRows(parsePairs(contactContent.phone_number));
        setEmailRows(parseList(contactContent.email));
        setIsEditing(true);
    };

    // Shared row editor logic for the phone-number pairs.
    const handleRowChange = (index, field, value) => {
        setPhoneRows((prev) =>
            prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
        );
    };

    const addRow = () => setPhoneRows((prev) => [...prev, { name: "", value: "" }]);
    const removeRow = (index) =>
        setPhoneRows((prev) => prev.filter((_, i) => i !== index));

    // Shared handlers for the plain email list.
    const handleEmailChange = (index, value) => {
        setEmailRows((prev) => prev.map((v, i) => (i === index ? value : v)));
    };

    const addEmailRow = () => setEmailRows((prev) => [...prev, ""]);
    const removeEmailRow = (index) =>
        setEmailRows((prev) => prev.filter((_, i) => i !== index));

    const handleSave = () => {
        const saveContent = async () => {
            const cleaned = {
                ...contactContent,
                phone_number: serializePairs(phoneRows),
                email: serializeList(emailRows),
            };

            const result = await updateSection("contact", cleaned);
            if (result.success) {
                setContactContent(cleaned);
                showPopup("success", "Contact section updated successfully!");
            } else {
                showPopup("error", "Failed to update contact section: " + result.error);
            }
        };

        saveContent();
        setIsEditing(false);
    };

    const handleClose = () => {
        setIsEditing(false);
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        setFormResult("Sending...");

        const formData = new FormData(event.target);
        formData.append("access_key", WEB3FORMS_ACCESS_KEY);

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();

            if (data.success) {
                setFormResult("Form Submitted Successfully!");
                event.target.reset();
                setTimeout(() => setFormResult(""), 5000);
            } else {
                console.error("Form error:", data);
                setFormResult("Error sending message. Please try again.");
            }
        } catch (error) {
            console.error("Submission failed:", error);
            setFormResult("Error sending message. Please try again.");
        }
    };

    // Read-only view: a two-column grid keeps every value's left edge aligned
    // regardless of how long each label is.
    const renderPairs = (raw) => {
        const rows = parsePairs(raw).filter((row) => row.value);
        if (rows.length === 0) return null;

        return (
            <div className="contact__pair-list">
                {rows.map((row, index) => (
                    <Fragment key={index}>
                        <span className="contact__pair-name">{row.name}</span>
                        <span className="contact__pair-value">{row.value}</span>
                    </Fragment>
                ))}
            </div>
        );
    };

    const renderPhoneEditor = () => (
        <div className="contact__list-edit">
            {phoneRows.map((row, index) => (
                <div className="contact__list-row" key={index}>
                    <input
                        className="contact__editable-field contact__pair-input-name"
                        value={row.name}
                        placeholder="Label"
                        onChange={(e) => handleRowChange(index, "name", e.target.value)}
                    />
                    <input
                        className="contact__editable-field contact__pair-input-value"
                        value={row.value}
                        placeholder="Phone Number"
                        onChange={(e) => handleRowChange(index, "value", e.target.value)}
                    />
                    {phoneRows.length > 1 && (
                        <button
                            type="button"
                            className="contact__list-remove"
                            onClick={() => removeRow(index)}
                            aria-label="Remove"
                        >
                            <img src={deleteIcon} alt="" />
                        </button>
                    )}
                </div>
            ))}
            <button type="button" className="contact__list-add" onClick={addRow}>
                + Add Entry
            </button>
        </div>
    );

    const renderEmailList = (raw) => {
        const values = parseList(raw).filter((v) => v.trim());
        if (values.length === 0) return null;
        return values.map((value, index) => <p key={index}>{value}</p>);
    };

    const renderEmailEditor = () => (
        <div className="contact__list-edit">
            {emailRows.map((value, index) => (
                <div className="contact__list-row" key={index}>
                    <input
                        className="contact__editable-field"
                        value={value}
                        placeholder="Email"
                        onChange={(e) => handleEmailChange(index, e.target.value)}
                    />
                    {emailRows.length > 1 && (
                        <button
                            type="button"
                            className="contact__list-remove"
                            onClick={() => removeEmailRow(index)}
                            aria-label="Remove"
                        >
                            <img src={deleteIcon} alt="" />
                        </button>
                    )}
                </div>
            ))}
            <button type="button" className="contact__list-add" onClick={addEmailRow}>
                + Add Entry
            </button>
        </div>
    );

    return (
        <section id="contact" className="contact">
            <div ref={ref} className={`contact__container ${revealClass}`}>
                {isAdmin && (
                    <div className="contact__admin-controls">
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
                                className="contact__admin-btn contact__btn-edit"
                                onClick={startEditing}
                            >
                                Edit Contact Section
                            </button>
                        )}
                    </div>
                )}

                <div className="contact__header">
                    {isEditing ? (
                        <input
                            className="contact__editable-field contact__label-edit"
                            value={contactContent.top_title}
                            onChange={(e) =>
                                handleContactContentChange("top_title", e.target.value)
                            }
                        />
                    ) : (
                        <span className="contact__label">{contactContent.top_title}</span>
                    )}
                    {isEditing ? (
                        <textarea
                            className="contact__editable-field contact__heading-edit"
                            value={contactContent.main_title}
                            onChange={(e) =>
                                handleContactContentChange("main_title", e.target.value)
                            }
                            rows={2}
                        />
                    ) : (
                        <h2 className="contact__heading">{contactContent.main_title}</h2>
                    )}
                    {isEditing ? (
                        <textarea
                            className="contact__editable-field contact__description-edit"
                            value={contactContent.sub_title}
                            onChange={(e) =>
                                handleContactContentChange("sub_title", e.target.value)
                            }
                            rows={4}
                        />
                    ) : (
                        <p className="contact__description">{contactContent.sub_title}</p>
                    )}
                </div>

                <div className="contact__layout">
                    <div className="contact__info">
                        <div className="contact__info-card">
                            <div className="contact__icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                            </div>
                            <div className="contact__details">
                                <h3>Call Us</h3>
                                {isEditing
                                    ? renderPhoneEditor()
                                    : renderPairs(contactContent.phone_number)}
                            </div>
                        </div>

                        <div className="contact__info-card">
                            <div className="contact__icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                            </div>
                            <div className="contact__details">
                                <h3>Email Us</h3>
                                {isEditing
                                    ? renderEmailEditor()
                                    : renderEmailList(contactContent.email)}
                            </div>
                        </div>

                        <div className="contact__info-card">
                            <div className="contact__icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                            </div>
                            <div className="contact__details">
                                <h3>Visit Us</h3>
                                {isEditing ? (
                                    <textarea
                                        className="contact__editable-field"
                                        value={contactContent.location}
                                        onChange={(e) =>
                                            handleContactContentChange("location", e.target.value)
                                        }
                                        rows={2}
                                    />
                                ) : (
                                    <p className="contact__address-text">
                                        {contactContent.location}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="contact__form-wrapper">
                        <form className="contact__form" onSubmit={onSubmit}>
                            <div className="form__row">
                                {/* Web3Forms honeypot — bots fill it in, humans never see it */}
                                <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} />
                                <div className="form__group">
                                    <label htmlFor="name" className="form__label">Full Name</label>
                                    <input type="text" id="name" name="name" className="form__input" placeholder="John Doe" required />
                                </div>
                                <div className="form__group">
                                    <label htmlFor="email" className="form__label">Email Address (optional)</label>
                                    <input type="email" id="email" name="email" className="form__input" placeholder="john@farm.co.za" />
                                </div>
                            </div>

                            <div className="form__row">
                                <div className="form__group">
                                    <label htmlFor="phone" className="form__label">Phone Number</label>
                                    <input type="tel" id="phone" name="phone" className="form__input" placeholder="+27 82 123 4567" />
                                </div>
                                <div className="form__group">
                                    <label htmlFor="subject" className="form__label">Subject</label>
                                    <input type="text" id="subject" name="subject" className="form__input" placeholder="E.g., Quote for 500m Dam Liner" required />
                                </div>
                            </div>

                            <div className="form__group">
                                <label htmlFor="message" className="form__label">Message</label>
                                <textarea id="message" name="message" className="form__textarea" placeholder="Tell us about your project requirements..." required></textarea>
                            </div>

                            <button type="submit" className="contact__submit-btn" disabled={formResult === "Sending..."}>
                                {formResult === "Sending..." ? "Sending..." : "Send Message"}
                            </button>

                            {formResult && formResult !== "Sending..." && (
                                <div
                                    className={`contact__form-result ${formResult.includes("Error") ? "contact__form-result--error" : "contact__form-result--success"}`}
                                >
                                    {formResult}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Contact;
