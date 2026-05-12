import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { InView } from "react-intersection-observer";
import NewProduct from "../../components/New/newProduct";
import { useProduct } from "../../Contexts/productContext.js";
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
    const isLoadingMoreRef = useRef(false);
    const searchTimeoutRef = useRef(null);
    
    const { 
        products, 
        loadingProducts, 
        loadMoreProducts, 
        hasMoreProducts,
        setCurrentFilters,
        allCategories 
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
            if (!inView || loadingProducts || isLoadingMoreRef.current || !hasMoreProducts) {
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
                                    <span className="products__count">
                                        {products.length}
                                    </span>
                                </button>
                            </li>
                            {Object.entries(categories).map(([cat, subs]) => (
                                <li key={cat}>
                                    <button
                                        className={`products__category-btn ${activeCategory === cat ? "products__category-btn--active" : ""}`}
                                        onClick={() => handleCategoryClick(cat)}
                                    >
                                        {cat}
                                        <span className="products__count">
                                            {
                                                products.filter(
                                                    (p) => p.category === cat,
                                                ).length
                                            }
                                        </span>
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
                                    No products found. Try adjusting your filters.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <InView
                as="div"
                onChange={handleLoadMore}
                threshold={0}
            />
        </section>
    );
}

export default Products;
