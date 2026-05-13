import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    get_product_by_id,
    get_products_category,
} from "../../database/product_queries";
import { useProduct } from "../../Contexts/productContext";
import AddProductModal from "../../components/New/AddProductModal";
import { PopupContainer } from "../../components/popups/popups";
import "./details.css";

/* Dynamically import all product images */
const imageModules = import.meta.glob("../../assets/products/*.png", {
    eager: true,
});
const images = {};
for (const path in imageModules) {
    const filename = path.split("/").pop();
    images[filename] = imageModules[path].default;
}

// wrapper component that handles its own image loading state
const ProductImage = ({ src, alt, className }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <>
            {/* The Skeleton Placeholder */}
            {!isLoaded && <div className="skeleton skeleton-img"></div>}

            {/* The Actual Image */}
            <img
                src={src}
                alt={alt}
                className={`${className} ${isLoaded ? "img-loaded" : "img-hidden"}`}
                onLoad={() => setIsLoaded(true)}
                loading="lazy"
                decoding="async"
            />
        </>
    );
};

function Details({ isAdmin }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("description");
    const [product, setProduct] = useState({ price: 0 });
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [popups, setPopups] = useState([]);
    const { products, loadingProducts, setCurrentFilters } = useProduct();

    const addPopup = (type, message) => {
        const popupId = Date.now() + Math.random();
        setPopups((prev) => [...prev, { id: popupId, type, message }]);
    };

    const removePopup = (id) => {
        setPopups((prev) => prev.filter((p) => p.id !== id));
    };

    useEffect(() => {
        if (loadingProducts) return;
        const foundProduct = products.find((p) => String(p.id) === String(id));

        //note: if product contains objectID -> came from algolia search -> doesnt have all the fields -> fetch from firebase
        // id product contains id but not objectID -> came from normal fetch -> has all fields -> use it directly
        if (foundProduct && !foundProduct.objectID) {
            setProduct(foundProduct);
        } else if (!loadingProducts || !foundProduct) {
            // If products is not found, search it directly from the database
            get_product_by_id(id).then((dbProduct) => {
                if (dbProduct) {
                    setProduct(dbProduct);
                } else {
                    console.error("Product not found in database either");
                }
            });
        }
    }, [id, loadingProducts, products]);

    useEffect(() => {
        if (!product) {
            setRelatedProducts([]);
            return;
        }

        const minRelated = 5;
        const filtered = products.filter(
            (p) => p.category === product.category && p.id !== product.id,
        );

        console.log(filtered.length);

        if (filtered.length >= minRelated) {
            setRelatedProducts(filtered);
        } else {
            // Fetch more from database
            get_products_category(product.category, 10, product.id).then(
                (fetchedRelated) => {
                    setRelatedProducts(fetchedRelated);
                },
            );
        }
    }, [products, product]);

    /* Scroll to top on product change */
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [id]);

    /* Open edit modal if navigated here via the Edit button */
    useEffect(() => {
        // Wait until the product is fully loaded from the database
        if (location.state?.openEditModal && isAdmin && product?.id === id && !product?.objectID) {
            setIsEditing(true);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, location.pathname, isAdmin, navigate, product, id]);

    if (!product) {
        return (
            <div className="details__not-found">
                <h2>Product not found</h2>
                <button
                    className="details__back-btn"
                    onClick={() => navigate("/")}
                >
                    ← Back to Products
                </button>
            </div>
        );
    }

    const formatPrice = (price) => {
        return (
            "R " + price.toLocaleString("en-ZA", { minimumFractionDigits: 2 })
        );
    };

    return (
        <div className="details">
            <PopupContainer popups={popups} removePopup={removePopup} />

            {/* Product Hero */}
            <section className="details__hero">
                <div className="details__hero-inner">
                    <div className="details__image-col">
                        <div className="details__image-wrap">
                            <ProductImage
                                src={product.imageUrl}
                                alt={product.name}
                                className="details__image"
                            />
                        </div>
                    </div>

                    <div className="details__info-col">
                        <span className="details__category-label">
                            {product.category} &middot; {product.subcategory}
                        </span>
                        <h1 className="details__name">{product.name}</h1>
                        <p className="details__price">
                            {formatPrice(product.price)}
                        </p>

                        <p className="details__description">
                            {product.description}
                        </p>

                        <div className="details__buttons">
                            <button
                                className="details__call-btn"
                                onClick={() =>
                                    (window.location.href = "tel:+27000000000")
                                }
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                                Call Us
                            </button>

                            {isAdmin && (
                                <button
                                    className="details__edit-btn"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                    Edit Product
                                </button>
                            )}
                        </div>

                        <div className="details__meta">
                            <div className="details__meta-item">
                                <span className="details__meta-label">
                                    Category:
                                </span>
                                <span className="details__meta-value">
                                    {product.category}
                                </span>
                            </div>
                            <div className="details__meta-item">
                                <span className="details__meta-label">
                                    Subcategory:
                                </span>
                                <span className="details__meta-value">
                                    {product.subcategory}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tabs Section */}
            <section className="details__tabs-section">
                <div className="details__tabs-inner">
                    <div className="details__tabs">
                        <button
                            className={`details__tab ${activeTab === "description" ? "details__tab--active" : ""}`}
                            onClick={() => setActiveTab("description")}
                        >
                            Description
                        </button>
                        <button
                            className={`details__tab ${activeTab === "additional" ? "details__tab--active" : ""}`}
                            onClick={() => setActiveTab("additional")}
                        >
                            Additional Information
                        </button>
                    </div>

                    <div className="details__tab-content">
                        {activeTab === "description" && (
                            <div className="details__tab-panel">
                                <p className="details__tab-text">
                                    {product.description}
                                </p>
                                {product.features && (
                                    <ul className="details__features">
                                        {product.features.map((f, i) => (
                                            <li
                                                key={i}
                                                className="details__feature"
                                            >
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="var(--color-primary)"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        {activeTab === "additional" && (
                            <div className="details__tab-panel">
                                <table className="details__spec-table">
                                    <tbody>
                                        {Object.entries(
                                            product.additionalInfo,
                                        ).map(([key, value]) => (
                                            <tr key={key}>
                                                <td className="details__spec-key">
                                                    {key}
                                                </td>
                                                <td className="details__spec-value">
                                                    {value}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <section className="details__related">
                    <div className="details__related-inner">
                        <h2 className="details__related-title">
                            Related Products
                        </h2>
                        <div className="details__related-grid">
                            {relatedProducts.map((rp) => (
                                <div
                                    className="product-card product-card--related"
                                    key={rp.id}
                                    onClick={() =>
                                        navigate(`/product/${rp.id}`)
                                    }
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) =>
                                        e.key === "Enter" &&
                                        navigate(`/product/${rp.id}`)
                                    }
                                >
                                    <div className="product-card__image-wrap">
                                        <ProductImage
                                            src={rp.imageUrl}
                                            alt={rp.name}
                                            className="product-card__image"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="product-card__body">
                                        <span className="product-card__category">
                                            {rp.category}, {rp.subcategory}
                                        </span>
                                        <h3 className="product-card__name">
                                            {rp.name}
                                        </h3>
                                        <p className="product-card__price">
                                            {formatPrice(rp.price)}
                                        </p>
                                        <button
                                            className="product-card__btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/product/${rp.id}`);
                                            }}
                                        >
                                            More Detail
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {isEditing && (
                <AddProductModal
                    productToEdit={product}
                    onClose={() => setIsEditing(false)}
                    onSave={(updatedProduct) => {
                        setProduct({ ...updatedProduct, id: product.id });
                        setCurrentFilters((prev) => ({ ...prev }));
                    }}
                    showPopup={addPopup}
                />
            )}
        </div>
    );
}

export default Details;
