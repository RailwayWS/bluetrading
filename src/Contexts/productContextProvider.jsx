import { ProductContext } from "./productContext";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { get_products_page, delete_product, edit_product, get_product_by_id} from "../database/product_queries";
import { add_category, check_category, get_all_categories} from "../database/category_queries.js";
import { backfillSearchTerms } from "../database/searchTermsHelper";
import { hydrateProductImageUrls, delete_image } from "../database/image_queries";
import { useAuth } from "./authContext";

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

    const { loadingAuth } = useAuth();

    useEffect(() => {
        if (loadingAuth) return; // Wait for auth to finish loading before initializing categories

        async function initializeCategories() {
            try {
                // Run once on app startup to backfill any missing search terms
                // mostly pointless, but might as well

                await backfillSearchTerms();
                // Then sync categories
                // await syncMissingCategories();
            } catch (e) {
                console.error("Error during initialization: ", e);
            }
            
            const categories = await get_all_categories();
            setAllCategories(categories);
        }
        initializeCategories();
    }, [loadingAuth]);

    useEffect(() => {
        if (loadingAuth) return;

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
    }, [currentFilters, loadingAuth]);

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
    
    // List of products that still need their image URL resolved
    const docsNeedingImageUrls = useMemo(
        () => {
            if (loadingProducts) return [];
            return products.filter((product) => !product.imageUrl);
        },
        [products, loadingProducts],
    );

    // Resolves + persists image URLs for products that don't have one yet
    // (max 6 Storage requests at a time), and reflects each one in local
    // state as it resolves so the card updates without needing a reload.
    useEffect(() => {
        if (!docsNeedingImageUrls.length) {
            return;
        }

        let isCancelled = false;

        hydrateProductImageUrls(docsNeedingImageUrls, (_, updatedProduct) => {
            if (isCancelled) return;
            setProducts((prev) =>
                prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
            );
        });

        return () => {
            isCancelled = true;
        };
    }, [docsNeedingImageUrls]);

    async function removeProduct(productId) {
        try {
            // Remove from local state
            const product = products.find((p) => p.id === productId);
            
            const imagePath = product.image;
            delete_image(imagePath); // Remove from Storage
            delete_product(productId); // Remove from Firestore

            const category = product.category;
            const subcategory = product.subcategory;

            // Check if category needs to be removed
            check_category(product.category, product.subcategory).then((result) => {
                if (result.removedCategory) {
                    setAllCategories((prev) => {
                        const updated = { ...prev };
                        delete updated[category];
                        return updated;
                    });
                } else if (result.removedSubcategory) {
                    setAllCategories((prev) => {
                        const updated = { ...prev };
                        if (updated[category]) {
                            updated[category] = updated[category].filter(sub => sub !== subcategory);
                        }   
                        return updated;
                    });
                }
            });

            setProducts((prev) => prev.filter((product) => product.id !== productId));
            console.log(`Product ${productId} removed successfully`);
        } catch (error) {
            console.error(`Failed to remove product ${productId}:`, error);
            throw error;
        }
    };

    async function editProduct(productId, updatedData) {
        const oldProduct = await get_product_by_id(productId);

        edit_product(productId, updatedData).then(() => {
            
            // If category or subcategory changed, we may need to update allCategories
            // Purely removes old category/ subcategory
            if (updatedData.category && (updatedData.category !== oldProduct.category || updatedData.subcategory !== oldProduct.subcategory)) {
                console.log("Category changed, checking if we need to update allCategories...");
                // If category changed, we may need to update allCategories
                check_category(oldProduct.category, oldProduct.subcategory).then((result) => {
                    if (result.removedCategory) {
                    setAllCategories((prev) => {
                        const updated = { ...prev };
                        delete updated[oldProduct.category];
                        return updated;
                    });
                    } else if (result.removedSubcategory) {
                        console.log("Subcategory removed, updating allCategories...");
                        setAllCategories((prev) => {
                            const updated = { ...prev };
                            if (updated[oldProduct.category]) {
                                updated[oldProduct.category] = updated[oldProduct.category].filter(sub => sub !== oldProduct.subcategory);
                            }   
                            return updated;
                        });
                    }
                });
            }

            if (!allCategories[updatedData.category].includes(updatedData.subcategory)) {
                console.log(`Subcategory ${updatedData.subcategory} not found in allCategories for category ${allCategories[updatedData.category]}, adding it...`);

                add_category(updatedData.category, updatedData.subcategory).then(() => {
                    setAllCategories((prev) => ({
                        ...prev,
                        [updatedData.category]: [...(prev[updatedData.category] || []), updatedData.subcategory],
                    }));
                });
            }
            console.log(`Product ${productId} edited successfully`);
        }).catch((error) => {
            console.error(`Failed to edit product ${productId}:`, error);
            throw error;
        });
    }
        

    // Sync states with database for categories when a new product is added.. and whatnot
    function checkNewProduct(newProduct) {
        if (!(newProduct.category in allCategories)) {
            setAllCategories((prev) => ({
                ...prev,
                [newProduct.category]: newProduct.subcategory ? [newProduct.subcategory] : [],
            }));
        } else if (newProduct.subcategory && !allCategories[newProduct.category].includes(newProduct.subcategory)) {
            setAllCategories((prev) => ({
                ...prev,
                [newProduct.category]: [...prev[newProduct.category], newProduct.subcategory],
            }));
        }

        return;
    }

    return (
        <ProductContext.Provider value={{ 
                products,
                loadingProducts,
                loadMoreProducts,
                hasMoreProducts,
                currentFilters,
                setCurrentFilters,
                allCategories,
                setAllCategories,
                removeProduct,
                editProduct,
                checkNewProduct }}>
			{children}
		</ProductContext.Provider>
	);
}
