import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { InView } from "react-intersection-observer";
import NewProduct from "../../components/New/newProduct";
import { useProduct } from "../../Contexts/productContext.js";
import Confirmation from "../../components/popups/confirmation.jsx";
import "./products.css";

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

function Products({ isAdmin }) {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState("All");
    const [activeSubcategory, setActiveSubcategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [openMenuId, setOpenMenuId] = useState(null);
    const [productToDelete, setProductToDelete] = useState(null); // STATE FOR RUBBER
    const isLoadingMoreRef = useRef(false);
    const searchTimeoutRef = useRef(null);

    const {
        products,
        loadingProducts,
        loadMoreProducts,
        hasMoreProducts,
        setCurrentFilters,
        allCategories,
        removeProduct
    } = useProduct();

    // Debounce search input (500ms)
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    // Update filters when debounced search changes
    useEffect(() => {
        setCurrentFilters({
            category: activeCategory,
            subcategory: activeSubcategory,
            searchTerm: debouncedSearch,
        });
    }, [activeCategory, activeSubcategory, debouncedSearch, setCurrentFilters]);

    // Close menu when clicking outside
    useEffect(() => {
        const closeMenu = () => setOpenMenuId(null);
        document.addEventListener("click", closeMenu);
        return () => document.removeEventListener("click", closeMenu);
    }, []);

    const handleMenuToggle = (e, productId) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === productId ? null : productId);
    };

    const handleCategoryClick = (cat) => {
        setActiveCategory(cat);
        setActiveSubcategory("All");
    };

    const formatPrice = (price) => {
        return (
            "R " + price.toLocaleString("en-ZA", { minimumFractionDigits: 2 })
        );
    };

    // Build categories from context (or empty if loading)
    const categories = useMemo(() => {
        return allCategories || {};
    }, [allCategories]);

    const handleLoadMore = useCallback(
        async (inView) => {
            if (
                !inView ||
                loadingProducts ||
                isLoadingMoreRef.current ||
                !hasMoreProducts
            ) {
                return;
            }

            isLoadingMoreRef.current = true;

            try {
                await loadMoreProducts(4);
            } finally {
                isLoadingMoreRef.current = false;
            }
        },
        [hasMoreProducts, loadMoreProducts, loadingProducts],
    );

    const HandleDelete = () => {
        if (productToDelete) {
            removeProduct(productToDelete.id);
            setProductToDelete(null);
        }
        console.log("Deleted");
    };

    return (
        <section className="products" id="products-section">
            <div className="products__container">
                <div className="products__header">
                    <span className="products__label">Our Products</span>
                    <h2 className="products__heading">Browse Our Equipment</h2>

                    <p className="products__description">
                        Explore our range of quality agricultural equipment,
                        irrigation systems, and dam solutions.
                    </p>
                </div>

                {/* USED TO POPULATE DB, ik this is kinda stupid but it works... */}
                {/* <button onClick={populateFirebase}>Populate Firebase with JSON Data</button> */}

                <div className="products__search-wrapper">
                    <input
                        type="text"
                        className="products__search-input"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="products__layout">
                    {/* Sidebar */}
                    <aside className="products__sidebar">
                        <h3 className="products__sidebar-title">Categories</h3>
                        <ul className="products__category-list">
                            <li>
                                <button
                                    className={`products__category-btn ${activeCategory === "All" ? "products__category-btn--active" : ""}`}
                                    onClick={() => handleCategoryClick("All")}
                                >
                                    All Products
                                </button>
                            </li>
                            {Object.entries(categories).map(([cat, subs]) => (
                                <li key={cat}>
                                    <button
                                        className={`products__category-btn ${activeCategory === cat ? "products__category-btn--active" : ""}`}
                                        onClick={() => handleCategoryClick(cat)}
                                    >
                                        {cat}
                                    </button>
                                    <div
                                        className={`products__subcategory-wrapper ${activeCategory === cat ? "active" : ""}`}
                                    >
                                        <ul className="products__subcategory-list">
                                            {subs.map((sub) => (
                                                <li key={sub}>
                                                    <button
                                                        className={`products__subcategory-btn ${activeSubcategory === sub ? "products__subcategory-btn--active" : ""}`}
                                                        onClick={() =>
                                                            setActiveSubcategory(
                                                                sub,
                                                            )
                                                        }
                                                    >
                                                        {sub}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </aside>

                    {/* Product Grid */}
                    <div className="products__grid">
                        {isAdmin && <NewProduct />}
                        {products.length > 0 ? (
                            products.map((product) => (
                                <div className="product-card" key={product.id}>
                                    {isAdmin && (
                                        <div className="product-card__menu-container">
                                            <button
                                                className="product-card__menu-btn"
                                                onClick={(e) =>
                                                    handleMenuToggle(
                                                        e,
                                                        product.id,
                                                    )
                                                }
                                                aria-label="Product options"
                                            >
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    width="22"
                                                    height="22"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <circle
                                                        cx="12"
                                                        cy="5"
                                                        r="1.5"
                                                    ></circle>
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="1.5"
                                                    ></circle>
                                                    <circle
                                                        cx="12"
                                                        cy="19"
                                                        r="1.5"
                                                    ></circle>
                                                </svg>
                                            </button>

                                            <div
                                                className={`product-card__dropdown ${openMenuId === product.id ? "is-open" : ""}`}
                                            >
                                                <button
                                                    className="product-card__dropdown-item edit"
                                                    // navigate to details edit
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenuId(null);
                                                        // Pass state so details.jsx knows to open the modal
                                                        navigate(
                                                            `/product/${product.id}`,
                                                            {
                                                                state: {
                                                                    openEditModal: true,
                                                                },
                                                            },
                                                        );
                                                    }}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="product-card__dropdown-item delete"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenuId(null);
                                                        setProductToDelete(
                                                            product,
                                                        );
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <div className="product-card__image-wrap">
                                        <ProductImage
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="product-card__image"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </div>
                                    <div className="product-card__body">
                                        <span className="product-card__category">
                                            {product.category},{" "}
                                            {product.subcategory}
                                        </span>
                                        <h3 className="product-card__name">
                                            {product.name}
                                        </h3>
                                        <p className="product-card__price">
                                            {formatPrice(product.price || 0)}
                                        </p>
                                        <div className="button-wrapper">
                                            <button
                                                className="product-card__btn"
                                                onClick={() =>
                                                    navigate(
                                                        `/product/${product.id || product.objectID}`,
                                                    )
                                                }
                                            >
                                                More Detail
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            /* Fallback message if search yields no results */
                            <div className="products__no-results">
                                <p>
                                    No products found. Try adjusting your
                                    filters.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <InView as="div" onChange={handleLoadMore} threshold={0} />

            {/* Confirmation Modal for Deletion */}
            <Confirmation
                isOpen={!!productToDelete}
                onClose={() => setProductToDelete(null)}
                onConfirm={() => {
                    HandleDelete(productToDelete.id);
                    setProductToDelete(null);
                }}
                itemName={productToDelete?.name}
            />
        </section>
    );
}

export default Products;
