import React from 'react';
import './contact.css';

const Contact = () => {
    return (
        <section id="contact" className="contact">
            <div className="contact__container">
                <div className="contact__header">
                    <span className="contact__label">Get In Touch</span>
                    <h2 className="contact__heading">Ready to upgrade your water infrastructure?</h2>
                    <p className="contact__description">
                        Whether you need a quote on heavy-duty dam liners or advice on your next big irrigation project, our team is ready to help.
                    </p>
                </div>

                <div className="contact__layout">
                    {/* Left Side: Contact Information */}
                    <div className="contact__info">
                        <div className="contact__info-card">
                            <div className="contact__icon">
                                {/* SVG for Phone */}
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                            </div>
                            <div className="contact__details">
                                <h3>Call Us</h3>
                                <p>+27 (0) 21 123 4567</p>
                            </div>
                        </div>

                        <div className="contact__info-card">
                            <div className="contact__icon">
                                {/* SVG for Email */}
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                            </div>
                            <div className="contact__details">
                                <h3>Email Us</h3>
                                <p>sales@yourclientdomain.co.za</p>
                            </div>
                        </div>

                        <div className="contact__info-card">
                            <div className="contact__icon">
                                {/* SVG for Map Pin */}
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                            </div>
                            <div className="contact__details">
                                <h3>Visit Us</h3>
                                <p>123 Agri Park, Industrial Area<br/>Stellenbosch, 7600</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Contact Form */}
                    <div className="contact__form-wrapper">
                        <form className="contact__form" onSubmit={(e) => e.preventDefault()}>
                            <div className="form__row">
                                <div className="form__group">
                                    <label htmlFor="name" className="form__label">Full Name</label>
                                    <input type="text" id="name" className="form__input" placeholder="John Doe" required />
                                </div>
                                <div className="form__group">
                                    <label htmlFor="email" className="form__label">Email Address</label>
                                    <input type="email" id="email" className="form__input" placeholder="john@farm.co.za" required />
                                </div>
                            </div>
                            
                            <div className="form__group">
                                <label htmlFor="subject" className="form__label">Subject</label>
                                <input type="text" id="subject" className="form__input" placeholder="E.g., Quote for 500m Dam Liner" required />
                            </div>

                            <div className="form__group">
                                <label htmlFor="message" className="form__label">Message</label>
                                <textarea id="message" className="form__textarea" placeholder="Tell us about your project requirements..." required></textarea>
                            </div>

                            <button type="submit" className="contact__submit-btn">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;