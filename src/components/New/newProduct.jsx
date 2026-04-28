import React, { useState } from "react";
import "./newProuct.css";
import AddProductModal from "./AddProductModal";
import {add_product} from "../../database/product_queries"; 
import { add_image} from "../../database/image_queries";

export default function NewProduct() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddProduct = () => {
        setIsModalOpen(true);
    };

    const handleSaveProduct = async (productData) => {
        console.log("New Product Data:", productData);
        const image = productData.image;
        const imageUrl = await add_image(image);
        console.log("Image URL:", imageUrl);
        console.log(productData);
    };

    return (
        <>
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
                />
            )}
        </>
    );
}
