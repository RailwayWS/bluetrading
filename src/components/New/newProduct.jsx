import React, { useState } from "react";
import "./newProuct.css";
import AddProductModal from "./AddProductModal";
import { useProduct } from "../../Contexts/productContext.js";
import { PopupContainer } from "../popups/popups";

export default function NewProduct() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [popups, setPopups] = useState([]);
    const { setCurrentFilters } = useProduct();

    const addPopup = (type, message) => {
        const popupId = Date.now() + Math.random();
        setPopups(prev => [...prev, { id: popupId, type, message }]);
    };

    const removePopup = (id) => {
        setPopups(prev => prev.filter(p => p.id !== id));
    };

    const handleAddProduct = () => {
        setIsModalOpen(true);
    };

    const handleSaveProduct = (productData) => {
        console.log("New Product Event Handled");
        // Force a data refresh by giving currentFilters a new object reference
        setCurrentFilters((prev) => ({ ...prev }));
    };

    return (
        <>
            <PopupContainer popups={popups} removePopup={removePopup} />
            <div
                className="new-product-card"
                title="Add New Product"
                onClick={handleAddProduct}
            >
                <div className="new-product-card__content">
                    <div className="new-product-card__plus-circle">
                        <button className="new-product-card__plus-button">
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
                        </button>
                    </div>
                    <h3 className="new-product-card__text">Add Product</h3>
                </div>
            </div>

            {isModalOpen && (
                <AddProductModal
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveProduct}
                    showPopup={addPopup}
                />
            )}
        </>
    );
}
