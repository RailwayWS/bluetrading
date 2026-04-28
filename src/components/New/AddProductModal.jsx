import React, { useState, useEffect, useMemo } from "react";
import "./addProductModal.css";
import deleteIcon from "../../assets/symbols/delete(1).png";
import uploadIcon from "../../assets/symbols/upload.png";
import productsData from "../../data/products.json";

export default function AddProductModal({ onClose, onSave }) {
    // Prevent background scrolling when modal is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    //main fields
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        subcategory: "",
        price: "",
        image: "",
        description: "",
    });

    const [imagePreview, setImagePreview] = useState(null);
    const maxImageSize = 1 * 1024 * 1024; // 1MB
    //additional fields
    const [features, setFeatures] = useState([]);
    const [additionalInfo, setAdditionalInfo] = useState([]);

    // Handle input changes for main form fields
    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === "file") {
            const file = files[0];
            if (file) {
                if (file.size > maxImageSize) {
                    // File exceeds size limit, show error and reset
                    alert("Image size exceeds 1MB. Please choose a smaller file.");
                    setImagePreview(null);
                } else {

                    const imageUrl = URL.createObjectURL(file);
                    
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

    const handleSubmit = (e) => {
        e.preventDefault();

        // Clean up features and additional info (removes empty entries)
        const cleanedFeatures = features.filter((f) => f.trim() !== "");
        const cleanedInfo = {};
        additionalInfo.forEach((item) => {
            if (item.key.trim() && item.value.trim()) {
                cleanedInfo[item.key.trim()] = item.value.trim();
            }
        });

        const newProduct = {
            ...formData,
            price: Number(formData.price),
            features: cleanedFeatures,
            additionalInfo: cleanedInfo,
        };

        if (onSave) {
            onSave(newProduct);
        }
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add New Product</h2>
                    <button className="modal-close" onClick={onClose}>
                        &times;
                    </button>
                </div>

                <form className="modal-form" onSubmit={handleSubmit}>
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
                                required
                            />
                            <label
                                htmlFor="imageUpload"
                                className="image-upload-dropzone"
                            >
                                {imagePreview ? (
                                    <div className="image-preview-container">
                                        <img
                                            src={imagePreview}
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
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit">
                            Save Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
