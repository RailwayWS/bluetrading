import { ProductContext } from "./productContext";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { get_products_page, get_all_categories, syncMissingCategories } from "../database/product_queries";
import { backfillSearchTerms } from "../database/searchTermsHelper";
import { resolveImageUrl } from "../database/image_queries";
import { db } from "../config/firebase";
import { doc, setDoc } from "firebase/firestore";

export function ProductProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [currentFilters, setCurrentFilters] = useState({
        category: "All",
        subcategory: "All",
        searchTerm: "",
    });
    const [allCategories, setAllCategories] = useState({});

    const [loadingProducts, setLoadingProducts] = useState(true);
    const [hasMoreProducts, setHasMoreProducts] = useState(true);
    const lastVisibleRef = useRef(null);  // Firestore cursor for pagination
    const hasMoreProductsRef = useRef(true);
    const loadingMoreRef = useRef(false);
    const loadingProductsRef = useRef(true);
    const amountToLoad = 6;

    useEffect(() => {
        async function initializeCategories() {
            try {
                // Run once on app startup to backfill any missing search terms
                await backfillSearchTerms();
                
                // Then sync categories
                await syncMissingCategories();
            } catch (e) {
                console.error("Error during initialization: ", e);
            }
            
            const categories = await get_all_categories();
            setAllCategories(categories);
        }
        initializeCategories();
    }, []);

    useEffect(() => {
        async function fetchProducts() {
            setLoadingProducts(true);
            loadingProductsRef.current = true;
            setProducts([]);
            lastVisibleRef.current = null;  // Reset cursor on filter change
            hasMoreProductsRef.current = true;

            const fetchedProducts = await get_products_page(amountToLoad, currentFilters, null);
            console.log("Fetched products:", fetchedProducts.products);

            setProducts(fetchedProducts.products);
            lastVisibleRef.current = fetchedProducts.lastVisible;  // Store cursor
            setHasMoreProducts(fetchedProducts.hasMore);
            hasMoreProductsRef.current = fetchedProducts.hasMore;
            setLoadingProducts(false);
            loadingProductsRef.current = false;
            return fetchedProducts.products;
        }

        fetchProducts();
    }, [currentFilters]);

    const loadMoreProducts = useCallback(async (pageSize = 1) => {
        if (
            loadingMoreRef.current ||
            loadingProductsRef.current ||
            !hasMoreProductsRef.current
        ) {
            return {
                products: [],
                lastVisible: null,
                hasMore: hasMoreProductsRef.current,
            };
        }

        loadingMoreRef.current = true;

        try {
            // Pass lastVisibleRef.current to continue from where we left off
            const newProducts = await get_products_page(pageSize, currentFilters, lastVisibleRef.current);

            if (!newProducts.products.length) {
                hasMoreProductsRef.current = false;
                setHasMoreProducts(false);
                return newProducts;
            }

            setProducts((prev) => [...prev, ...newProducts.products]);
            lastVisibleRef.current = newProducts.lastVisible;  // Update cursor

            setHasMoreProducts(newProducts.hasMore);
            hasMoreProductsRef.current = newProducts.hasMore;

            return newProducts;
        } finally {
            loadingMoreRef.current = false;
        }
    }, [currentFilters]);
    
    // List of products that still needs their image URL resolved
    const docsNeedingImageUrls = useMemo(
        () => {
            if (loadingProducts) return [];
            return products.filter((product) => !product.imageUrl);
        },
        [products, loadingProducts],
    );

    // Finds and sets the image URL for products that don't have it yet.
    useEffect(() => {
        if (!docsNeedingImageUrls.length) {
            return;
        }

        let isCancelled = false;

        docsNeedingImageUrls.forEach((product) => {
            resolveImageUrl(product.image)
                .then(async (url) => {
                    console.log(`Resolved image URL for product ${product.id}: ${url}`);

                    if (isCancelled || !url) {
                        return;
                    }

                    const productRef = doc(db, "products", product.id);
                    await setDoc(productRef, {
                        imageUrl: url,
                    }, { merge: true });
                })
                .catch((error) => {
                    console.error(`Failed to update product ${product.id} with image URL`, error);
                });
        });

        return () => {
            isCancelled = true;
        };
    }, [docsNeedingImageUrls]);


    

    return (
        <ProductContext.Provider value={{ 
                products,
                loadingProducts,
                loadMoreProducts,
                hasMoreProducts,
                currentFilters,
                setCurrentFilters,
                allCategories }}>
			{children}
		</ProductContext.Provider>
	);
}
