import React, { useState, useEffect, useMemo } from "react";
import "./addProductModal.css";
import deleteIcon from "../../assets/symbols/delete(1).png";
import uploadIcon from "../../assets/symbols/upload.png";
import productsData from "../../data/products.json";
import { add_product, edit_product } from "../../database/product_queries";
import { add_image, delete_image } from "../../database/image_queries";
import { add_category } from "../../database/category_queries";
import Popup from "../popups/popups";
import { variable } from "firebase/firestore/pipelines";

export default function AddProductModal({
    onClose,
    onSave,
    productToEdit,
    showPopup,
}) {
    // Prevent background scrolling when modal is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    const isEditMode = !!productToEdit;
    const [newImage, setNewImage] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectType, setSelectType] = useState("Single Product");

    const handleTypeChange = (e) => {
        setSelectType(e.target.value);
    };

    //needed for css
    const handleClose = () => {
        setIsClosing(true);
        // Wait for the CSS animation to finish before actually telling parent to close
        setTimeout(() => {
            onClose();
        }, 250);
    };
    //main fields (if product data exists use it, otherwise default to empty strings)
    const [formData, setFormData] = useState({
        name: productToEdit?.name || "",
        category: productToEdit?.category || "",
        subcategory: productToEdit?.subcategory || "General",
        price: productToEdit?.price || "",
        image: productToEdit?.image || "",
        description: productToEdit?.description || "",
    });

    const [imagePreview, setImagePreview] = useState(null);
    const maxImageSize = 1 * 1024 * 1024; // 1MB

    //additional fields
    const [variants, setVariants] = useState(
        productToEdit?.variants
            ? Object.entries(productToEdit.variants).map(([key, value]) => ({
                  key,
                  value,
              }))
            : [],
    );
    const [features, setFeatures] = useState(productToEdit?.features || []);
    const [additionalInfo, setAdditionalInfo] = useState(
        productToEdit?.additionalInfo
            ? Object.entries(productToEdit.additionalInfo).map(
                  ([key, value]) => ({ key, value }),
              )
            : [],
    );

    // Handle input changes for main form fields
    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === "file") {
            const file = files[0];
            if (file) {
                if (file.size > maxImageSize) {
                    // File exceeds size limit, show error and reset
                    if (showPopup) {
                        showPopup(
                            "error",
                            "Image size exceeds 1MB. Please choose a smaller file.",
                        );
                    }
                    files[0] = null; // Clear the file input
                    setImagePreview(null);
                } else {
                    const imageUrl = URL.createObjectURL(file);
                    setNewImage(true);
                    console.log("Selected image file:", file.name);
                    setFormData((prev) => ({ ...prev, image: file }));
                    setImagePreview(imageUrl);
                }
            } else {
                setImagePreview(null);
            }
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    // NEW VARIANT HANDLERS
    const handleVariantChange = (index, field, value) => {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    };
    const addVariant = () => setVariants([...variants, { key: "", value: "" }]);
    const removeVariant = (index) =>
        setVariants(variants.filter((_, i) => i !== index));

    const handleFeatureChange = (index, value) => {
        const newFeatures = [...features];
        newFeatures[index] = value;
        setFeatures(newFeatures);
    };

    const addFeature = () => {
        setFeatures([...features, ""]);
    };

    const removeFeature = (index) => {
        setFeatures(features.filter((_, i) => i !== index));
    };

    const handleInfoChange = (index, field, value) => {
        const newInfo = [...additionalInfo];
        newInfo[index][field] = value;
        setAdditionalInfo(newInfo);
    };

    const addInfo = () => {
        setAdditionalInfo([...additionalInfo, { key: "", value: "" }]);
    };

    const removeInfo = (index) => {
        setAdditionalInfo(additionalInfo.filter((_, i) => i !== index));
    };

    // get categories and subcategories from products data for dropdowns
    const categories = useMemo(() => {
        const cats = productsData.map((p) => p.category);
        return [...new Set(cats)].filter(Boolean);
    }, []);

    const [isCustomCategory, setIsCustomCategory] = useState(false);
    const [isCustomSubcategory, setIsCustomSubcategory] = useState(false);

    const subcategories = useMemo(() => {
        let filtered = productsData;
        if (formData.category && !isCustomCategory) {
            filtered = productsData.filter(
                (p) => p.category === formData.category,
            );
        }
        const subcats = filtered.map((p) => p.subcategory);
        return [...new Set(subcats)].filter(Boolean);
    }, [formData.category, isCustomCategory]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;
        setIsSubmitting(true);

        // Clean up features and additional info (removes empty entries)
        const cleanedFeatures = features.filter((f) => f.trim() !== "");
        const cleanedInfo = {};
        additionalInfo.forEach((item) => {
            if (item.key.trim() && item.value.trim()) {
                cleanedInfo[item.key.trim()] = item.value.trim();
            }
        });

        const cleanedVariants = {};
        if (selectType === "Product Variants") {
            variants.forEach((item) => {
                if (item.key.trim() && item.value.trim()) {
                    cleanedVariants[item.key.trim()] = item.value.trim();
                }
            });

            // Convert the object values into an array
            const variantPrices = Object.values(cleanedVariants).map(Number);

            // Filter out any NaN
            if (variantPrices.length > 0) {
                const validPrices = variantPrices.filter((n) => !isNaN(n));
                minVariantPrice =
                    validPrices.length > 0 ? Math.min(...validPrices) : 0;
            }
        }

        const updatedProduct = {
            ...formData,
            price:
                selectType === "Single Product"
                    ? Number(formData.price)
                    : minVariantPrice,
            type: selectType,
            variants:
                selectType === "Product Variants" ? cleanedVariants : null,
            features: cleanedFeatures,
            additionalInfo: cleanedInfo,
            imageUrl: isEditMode
                ? productToEdit.imageUrl || productToEdit.image || ""
                : "",
        };

        try {
            // Upload new image if formData.image is a File object
            if (
                formData.image &&
                typeof formData.image === "object" &&
                !isEditMode
            ) {
                const newImage = formData.image;
                const newImageUrl = await add_image(newImage);
                if (newImageUrl) {
                    updatedProduct.image = newImage.name;
                    updatedProduct.imageUrl = newImageUrl;
                }
            }

            if (isEditMode) {
                if (
                    newImage &&
                    formData.image &&
                    typeof formData.image === "object"
                ) {
                    const oldImage = productToEdit.image || "";
                    const newImage = formData.image;
                    const newImageUrl = await add_image(newImage);
                    await add_category(
                        updatedProduct.category,
                        updatedProduct.subcategory,
                    );

                    if (newImageUrl) {
                        updatedProduct.image = newImage.name;
                        updatedProduct.imageUrl = newImageUrl;
                        await delete_image(oldImage);
                    }
                }

                await edit_product(productToEdit.id, updatedProduct);
                if (showPopup)
                    showPopup("success", "Product updated successfully!");
            } else {
                const res = await add_product(updatedProduct);
                await add_category(
                    updatedProduct.category,
                    updatedProduct.subcategory,
                );
                if (res.success) {
                    if (showPopup)
                        showPopup("success", "Product added successfully!");
                } else {
                    if (showPopup)
                        showPopup(
                            "error",
                            res.error || "Failed to add product",
                        );
                    setIsSubmitting(false);
                    return;
                }
            }

            if (onSave) {
                onSave(updatedProduct);
            }
            // Close the modal directly after saving, letting popup survive in parent
            handleClose();
        } catch (err) {
            if (showPopup)
                showPopup("error", err.message || "An error occurred");
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className={`add-modal-overlay ${isClosing ? "closing" : ""}`}
            onClick={handleClose}
        >
            <div
                className="add-modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header-add">
                    <h2>{isEditMode ? "Edit Product" : "Add New Product"}</h2>
                    <button className="modal-close" onClick={handleClose}>
                        &times;
                    </button>
                </div>

                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <label>
                            <input
                                type="radio"
                                name="Type"
                                value="Single Product"
                                checked={selectType === "Single Product"}
                                onChange={handleTypeChange}
                            />{" "}
                            Single Product
                        </label>

                        <label>
                            <input
                                type="radio"
                                name="Type"
                                value="Product Variants"
                                checked={selectType === "Product Variants"}
                                onChange={handleTypeChange}
                            />{" "}
                            Product Variants
                        </label>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Product Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        {selectType === "Single Product" && (
                            <div className="form-group">
                                <label>Price</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Category</label>
                            {isCustomCategory ? (
                                <div className="dynamic-row">
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        placeholder="Add new category"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="btn-remove"
                                        onClick={() => {
                                            setIsCustomCategory(false);
                                            setFormData((prev) => ({
                                                ...prev,
                                                category: "",
                                            }));
                                        }}
                                        title="Cancel new category"
                                    >
                                        <img src={deleteIcon} alt="Cancel" />
                                    </button>
                                </div>
                            ) : (
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={(e) => {
                                        if (e.target.value === "ADD_NEW") {
                                            setIsCustomCategory(true);
                                            setFormData((prev) => ({
                                                ...prev,
                                                category: "",
                                                subcategory: "",
                                            }));
                                        } else {
                                            handleChange(e);
                                        }
                                    }}
                                    required
                                >
                                    <option value="" disabled>
                                        Select a Category...
                                    </option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                    <option value="ADD_NEW">
                                        + Add New Category
                                    </option>
                                </select>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Subcategory (Optional)</label>
                            {isCustomSubcategory ? (
                                <div className="dynamic-row">
                                    <input
                                        type="text"
                                        name="subcategory"
                                        value={formData.subcategory}
                                        onChange={handleChange}
                                        placeholder="Add new subcategory"
                                    />
                                    <button
                                        type="button"
                                        className="btn-remove"
                                        onClick={() => {
                                            setIsCustomSubcategory(false);
                                            setFormData((prev) => ({
                                                ...prev,
                                                subcategory: "",
                                            }));
                                        }}
                                        title="Cancel new subcategory"
                                    >
                                        <img src={deleteIcon} alt="Cancel" />
                                    </button>
                                </div>
                            ) : (
                                <select
                                    name="subcategory"
                                    value={formData.subcategory}
                                    onChange={(e) => {
                                        if (e.target.value === "ADD_NEW") {
                                            setIsCustomSubcategory(true);
                                            setFormData((prev) => ({
                                                ...prev,
                                                subcategory: "",
                                            }));
                                        } else {
                                            handleChange(e);
                                        }
                                    }}
                                >
                                    <option value="">
                                        Select a Subcategory...
                                    </option>
                                    {subcategories.map((subcat) => (
                                        <option key={subcat} value={subcat}>
                                            {subcat}
                                        </option>
                                    ))}
                                    <option value="ADD_NEW">
                                        + Add New Subcategory
                                    </option>
                                </select>
                            )}
                        </div>
                    </div>

                    {selectType === "Product Variants" && (
                        <div className="form-section">
                            <label className="section-label">Variants</label>
                            {variants.map((variant, index) => (
                                <div key={index} className="dynamic-row">
                                    <input
                                        type="text"
                                        value={variant.key}
                                        onChange={(e) =>
                                            handleVariantChange(
                                                index,
                                                "key",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Item size"
                                    />
                                    <input
                                        type="number"
                                        value={variant.value}
                                        onChange={(e) =>
                                            handleVariantChange(
                                                index,
                                                "value",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Item Price"
                                    />
                                    <button
                                        type="button"
                                        className="btn-remove"
                                        onClick={() => removeVariant(index)}
                                    >
                                        <img src={deleteIcon} alt="Delete" />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="btn-add"
                                onClick={addVariant}
                            >
                                + Add Variant
                            </button>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Product Image</label>
                        <div className="image-upload-wrapper">
                            <input
                                type="file"
                                id="imageUpload"
                                name="image"
                                accept="image/*"
                                onChange={handleChange}
                                className="hidden-file-input"
                                required={!isEditMode}
                            />
                            <label
                                htmlFor="imageUpload"
                                className="image-upload-dropzone"
                            >
                                {imagePreview ||
                                (isEditMode && productToEdit?.imageUrl) ? (
                                    <div className="image-preview-container">
                                        <img
                                            src={
                                                imagePreview ||
                                                productToEdit.imageUrl
                                            }
                                            alt="Preview"
                                            className="image-preview"
                                        />
                                        <div className="image-preview-overlay">
                                            <span>Click to change image</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="upload-placeholder">
                                        <img
                                            src={uploadIcon}
                                            alt="Upload"
                                            className="upload-icon"
                                        />
                                        <span>Click to upload image</span>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            required
                        ></textarea>
                    </div>

                    <div className="form-section">
                        <label className="section-label">Features</label>
                        {features.map((feature, index) => (
                            <div key={index} className="dynamic-row">
                                <input
                                    type="text"
                                    value={feature}
                                    onChange={(e) =>
                                        handleFeatureChange(
                                            index,
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Enter a feature"
                                />
                                <button
                                    type="button"
                                    className="btn-remove"
                                    onClick={() => removeFeature(index)}
                                >
                                    <img src={deleteIcon} alt="Delete" />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="btn-add"
                            onClick={addFeature}
                        >
                            + Add Feature
                        </button>
                    </div>

                    <div className="form-section">
                        <label className="section-label">Additional Info</label>
                        {additionalInfo.map((info, index) => (
                            <div key={index} className="dynamic-row">
                                <input
                                    type="text"
                                    value={info.key}
                                    onChange={(e) =>
                                        handleInfoChange(
                                            index,
                                            "key",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Key (e.g. Engine Power)"
                                />
                                <input
                                    type="text"
                                    value={info.value}
                                    onChange={(e) =>
                                        handleInfoChange(
                                            index,
                                            "value",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Value (e.g. 180 HP)"
                                />
                                <button
                                    type="button"
                                    className="btn-remove"
                                    onClick={() => removeInfo(index)}
                                >
                                    <img src={deleteIcon} alt="Delete" />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="btn-add"
                            onClick={addInfo}
                        >
                            + Add Info
                        </button>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={handleClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`btn-submit ${isSubmitting ? "is-submitting" : ""}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <div className="spinner"></div>
                            ) : isEditMode ? (
                                "Update"
                            ) : (
                                "Add Product"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
