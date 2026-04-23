import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { get_product_by_id } from "../../database/product_queries";
import { useProduct } from "../../Contexts/productContext";
import productsData from "../../data/products.json";
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

function Details() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("description");
    const [product, setProduct] = useState({price : 0});
    const { products, imageUrls } = useProduct();

    useEffect(() => {
        products.find((p) => {p.id === id && setProduct(p)});
    }, [id, products]);

    const relatedProducts = useMemo(() => {
        if (!product) return [];
        return products.filter(
            (p) => p.category === product.category && p.id !== product.id,
        );
    }, [products, product]);

    /* Scroll to top on product change */
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [id]);

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
            {/* Back to Home Button */}
            <div className="details__breadcrumb">
                <div className="details__breadcrumb-inner">
                    <button
                        className="details__breadcrumb-back-btn"
                        onClick={() => navigate("/")}
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
                            style={{ marginRight: "8px" }}
                        >
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Back to Home
                    </button>
                </div>
            </div>

            {/* Product Hero */}
            <section className="details__hero">
                <div className="details__hero-inner">
                    <div className="details__image-col">
                        <div className="details__image-wrap">
                            <img
                                src={imageUrls[product.id]} 
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
                                        <img
                                            src={images[rp.image]}
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
        </div>
    );
}

export default Details;
