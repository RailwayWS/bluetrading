import React from "react";
import "./newProuct.css";

export default function NewProduct() {
    return (
        <div className="new-product-card" title="Add New Product">
            <div className="new-product-card__content">
                <div className="new-product-card__plus-circle">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="new-product-card__plus-icon"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4.5v15m7.5-7.5h-15"
                        />
                    </svg>
                </div>
                <h3 className="new-product-card__text">Add Product</h3>
            </div>
        </div>
    );
}
