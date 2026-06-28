import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./navbar.css";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleScrollToSection = (e, sectionId) => {
        e.preventDefault();

        if (location.pathname !== "/") {
            navigate("/");

            setTimeout(() => {
                const element = document.getElementById(sectionId);
                if (element) {
                    element.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                }
            }, 150);
        } else {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar__container">
                <Link to="/" className="navbar__logo">
                    BlueTrading
                </Link>

                <ul className="navbar__menu">
                    <li className="navbar__item">
                        <Link to="/" className="navbar__link">
                            Home
                        </Link>
                    </li>
                    <li className="navbar__item">
                        <Link to="/products" className="navbar__link">
                            Products
                        </Link>
                    </li>
                    <li className="navbar__item">
                        <a
                            href="#about"
                            className="navbar__link"
                            onClick={(e) => handleScrollToSection(e, "about")}
                        >
                            About
                        </a>
                    </li>
                    <li className="navbar__item">
                        <a
                            href="#contact"
                            className="navbar__link"
                            onClick={(e) => handleScrollToSection(e, "contact")}
                        >
                            Contact
                        </a>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
