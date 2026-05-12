import { ProductContext } from "./productContext";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { get_products_page, get_all_categories, syncMissingCategories, backfillSearchTerms } from "../database/product_queries";
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
    const currentPageRef = useRef(0);  // Page-based pagination for Algolia
    const hasMoreProductsRef = useRef(true);
    const loadingMoreRef = useRef(false);
    const loadingProductsRef = useRef(true);


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
            currentPageRef.current = 0;  // Reset to first page
            hasMoreProductsRef.current = true;

            const fetchedProducts = await get_products_page(0, 3, currentFilters);
            console.log("Fetched products:", fetchedProducts.products);

            setProducts(fetchedProducts.products);
            currentPageRef.current = 1;  // Next page is 1
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
            const newProducts = await get_products_page(currentPageRef.current, pageSize, currentFilters);

            if (!newProducts.products.length) {
                hasMoreProductsRef.current = false;
                setHasMoreProducts(false);
                return newProducts;
            }

            setProducts((prev) => [...prev, ...newProducts.products]);
            currentPageRef.current += 1;  // Increment page

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
