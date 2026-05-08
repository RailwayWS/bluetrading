import React from 'react';
import './about.css';
import about_img from '../../assets/hero-slide-1.png';
import partner_logo from '../../assets/partner.jpg';

const About = () => {
    return (
        <section id="about" className="about">
            <div className="about__container">
                <div className="about__content">
                    <span className="about__label">Who We Are</span>
                    <h2 className="about__heading">
                        Reliable solutions, <br />
                        <span className="about__heading-highlight">built to last.</span>
                    </h2>
                    <p className="about__description">
                        Water is the lifeblood of your operation. We specialize in supplying industry-leading irrigation equipment and heavy-duty dam liners ("damsakke") designed to withstand the toughest conditions. Our goal is simple: to provide the high-quality infrastructure you need to efficiently store, manage, and distribute your water.
                    </p>
                    <p className="about__description">
                        As dedicated marketers and distributors, we source only the most dependable products on the market. Whether you are outfitting a massive agricultural enterprise or securing a local water supply, we connect you with the right tools to ensure your growth never stops.
                    </p>
                    
                    <div className="about__stats">
                        <div className="about__stat-item">
                            <h3 className="about__stat-number">500+</h3>
                            <p className="about__stat-text">Clients Supplied</p>
                        </div>
                        <div className="about__stat-divider"></div>
                        <div className="about__stat-item">
                            <h3 className="about__stat-number">100%</h3>
                            <p className="about__stat-text">Quality Focused</p>
                        </div>
                    </div>
                </div>

                <div className="about__visual">
                    <div className="about__image-wrapper">
                        {/* Placeholder image - replace src with your own modern team or workspace image */}
                        <img 
                            src= {about_img}
                            alt="Modern office workspace" 
                            className="about__image"
                        />
                        <div className="about__experience-badge">
                            <span className="badge-number">10</span>
                            <span className="badge-text">Years of<br/>Excellence</span>
                        </div>
                    </div>
                </div>

                <div className="about__partners">
                    <p className="about__partners-title">Contracted marketers & distributors For</p>
                    <div className="about__partners-logo-wrapper">
                        {/* Replace the src with the actual path to your client's logo */}
                        <img 
                            src={partner_logo}
                            alt="Geo-Line Dam Lining Solutions" 
                            className="about__partners-logo"
                        />
                    </div>
                </div>

            </div>
        </section>
    );
};

export default About;