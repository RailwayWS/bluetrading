import { useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { InView } from "react-intersection-observer";
import NewProduct from "../New/newProduct";
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

function Products({ isAdmin }) {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState("All");
    const [activeSubcategory, setActiveSubcategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const isLoadingMoreRef = useRef(false);
    const { products, loadingProducts, loadMoreProducts, hasMoreProducts } = useProduct();

    const matchesFilters = useCallback(
        (product) => {
            if (activeCategory !== "All" && product.category !== activeCategory) {
                return false;
            }

            if (
                activeSubcategory !== "All" &&
                product.subcategory !== activeSubcategory
            ) {
                return false;
            }

            if (searchQuery.trim() !== "") {
                const query = searchQuery.toLowerCase();
                const matchesName = product.name.toLowerCase().includes(query);
                const matchesCategory = product.category.toLowerCase().includes(query);
                const matchesSubcategory = product.subcategory.toLowerCase().includes(query);

                return matchesName || matchesCategory || matchesSubcategory;
            }

            return true;
        },
        [activeCategory, activeSubcategory, searchQuery],
    );

    /* Build unique categories & subcategories */
    const categories = useMemo(() => {
        const cats = {};
        if (!products.length) return cats;
        products.forEach((p) => {
            if (!cats[p.category]) cats[p.category] = new Set();
            cats[p.category].add(p.subcategory);
        });
        return Object.fromEntries(
            Object.entries(cats).map(([k, v]) => [k, [...v]]),
        );

    }, [products]);

    const filteredProducts = useMemo(() => {
        if (loadingProducts) {
            return [];
        }

        return products.filter(matchesFilters);
    }, [products, loadingProducts, matchesFilters]);

    const ensureMinimumFilteredGrowth = useCallback(
        async (inView) => {
            const minimumNewProducts = 4;
            const pageSize = 4;
            const maxRequests = 8;

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
                let matchedGrowth = 0;
                let attempts = 0;
                let moreProductsAvailable = hasMoreProducts;

                while (
                    moreProductsAvailable &&
                    matchedGrowth < minimumNewProducts &&
                    attempts < maxRequests
                ) {
                    const batch = await loadMoreProducts(pageSize);

                    if (!batch.products.length) {
                        break;
                    }

                    matchedGrowth += batch.products.filter(matchesFilters).length;
                    moreProductsAvailable = batch.hasMore;
                    attempts += 1;
                }
            } finally {
                isLoadingMoreRef.current = false;
            }
        },
        [hasMoreProducts, loadMoreProducts, loadingProducts, matchesFilters],
    );

    const handleCategoryClick = (cat) => {
        setActiveCategory(cat);
        setActiveSubcategory("All");
    };

    const formatPrice = (price) => {
        return (
            "R " + price.toLocaleString("en-ZA", { minimumFractionDigits: 2 })
        );
    };

    return (        
        
        <section className="products" id="products-section">
            <div className="products__container">
                <div className="products__header">
                    <span className="products__label">Our Products</span>
                    <h2 className="products__heading">Browse Our Equipment</h2>
                    
                        {loadingProducts? 
                            <p className="products__description">
                            "Loading products..." 
                            </p>
                            : 
                            <p className="products__description">
                                Explore our range of quality agricultural equipment,
                                irrigation systems, and dam solutions.                        
                            </p>
                        }
                        
                    
                </div>

                {/* USED TO POPULATE DB, ik this is kinda stupid but it works... */}
                {/* <button onClick={populateFirebase}>Populate Firebase with JSON Data</button> */}

                {/* 4. The Search Bar */}
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
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <div className="product-card" key={product.id}>
                                    <div className="product-card__image-wrap">
                                        <img
                                            src={
                                                product.imageUrl
                                            }
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
                                            {formatPrice(product.price)}
                                        </p>
                                        <button
                                            className="product-card__btn"
                                            onClick={() =>
                                                navigate(
                                                    `/product/${product.id}`,
                                                )
                                            }
                                        >
                                            More Detail
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            /* Fallback message if search yields no results */
                            <div className="products__no-results">
                                <p>
                                    No products found matching "{searchQuery}".
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <InView as="div" onChange={ensureMinimumFilteredGrowth} threshold={0} />
        </section>
    );
}

export default Products;
