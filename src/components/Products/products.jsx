import { useState, useMemo, useEffect, use } from "react";
import { useNavigate } from "react-router-dom";
import jsonData from "../../data/products.json";
import "./products.css";
import NewProduct from "../New/newProduct";
import {get_products} from "../../database/product_queries.js";
import { hydrateProductImageUrls } from "../../database/image_queries";



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
    const [productsData, setProductsData] = useState([]);
    const [imageUrls, setImageUrls] = useState({});
    const [activeCategory, setActiveCategory] = useState("All");
    const [activeSubcategory, setActiveSubcategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState(""); // 1. New search state


    /* Build unique categories & subcategories */
    const categories = useMemo(() => {
        const cats = {};
        productsData.forEach((p) => {
            if (!cats[p.category]) cats[p.category] = new Set();
            cats[p.category].add(p.subcategory);
        });
        return Object.fromEntries(
            Object.entries(cats).map(([k, v]) => [k, [...v]]),
        );
    }, [productsData]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await get_products();
            setProductsData(data);
        }

        fetchData();
    }, []);

    const productsNeedingImageUrls = useMemo(
        () => productsData.filter((product) => !imageUrls[product.id]),
        [productsData, imageUrls],
    );

    useEffect(() => {
        if (!productsNeedingImageUrls.length) {
            return;
        }

        let isCancelled = false;

        hydrateProductImageUrls(
            productsNeedingImageUrls.map((product) => ({
                ...product,
                imagePath: product.imagePath || product.image,
            })),
            (_, updatedProduct) => {
                if (isCancelled || !updatedProduct?.imageUrl) {
                    return;
                }

                setImageUrls((prev) => ({
                    ...prev,
                    [updatedProduct.id]: updatedProduct.imageUrl,
                }));
            },
        );

        return () => {
            isCancelled = true;
        };
    }, [productsNeedingImageUrls]);

    // const populateFirebase = async () => {
    //     jsonData.forEach(async (product) => {
    //         await add_product(product.name, product.price, product.description, product.image, product.category, product.subcategory, product.features, product.additionalInfo);
    //         console.log(`Added product: ${product.name}`);
    //     });
    // }

    /* Filter products */
    const filteredProducts = useMemo(() => {
        return productsData.filter((p) => {
            // Category check
            if (activeCategory !== "All" && p.category !== activeCategory)
                return false;

            // Subcategory check
            if (
                activeSubcategory !== "All" &&
                p.subcategory !== activeSubcategory
            )
                return false;

            // 2. Search Query check (Checks name, category, and subcategory)
            if (searchQuery.trim() !== "") {
                const query = searchQuery.toLowerCase();
                const matchesName = p.name.toLowerCase().includes(query);
                const matchesCategory = p.category
                    .toLowerCase()
                    .includes(query);
                const matchesSubcategory = p.subcategory
                    .toLowerCase()
                    .includes(query);

                if (!matchesName && !matchesCategory && !matchesSubcategory) {
                    return false;
                }
            }

            return true;
        });
    }, [activeCategory, activeSubcategory, searchQuery, productsData]); // 3. Added searchQuery to dependencies

    const handleCategoryClick = (cat) => {
        setActiveCategory(cat);
        setActiveSubcategory("All");
        // Optional: You could clear the search query here by adding setSearchQuery('')
        // if you want category clicks to reset the search bar.
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
                    <p className="products__description">
                        Explore our range of quality agricultural equipment,
                        irrigation systems, and dam solutions.
                    </p>
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
                                        {productsData.length}
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
                                                productsData.filter(
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
                                                imageUrls[product.id] 
                                                // images[product.image]
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
        </section>
    );
}

export default Products;
