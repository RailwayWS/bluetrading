import { ProductContext } from "./productContext";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { get_products_page } from "../database/product_queries";
import { resolveImageUrl } from "../database/image_queries";
import { db } from "../config/firebase";
import { doc, setDoc } from "firebase/firestore";

export function ProductProvider({ children }) {
    const [products, setProducts] = useState([]);

    const [loadingProducts, setLoadingProducts] = useState(true);
    const [hasMoreProducts, setHasMoreProducts] = useState(true);
    const lastVisibleRef = useRef(null);
    const hasMoreProductsRef = useRef(true);
    const loadingMoreRef = useRef(false);
    const loadingProductsRef = useRef(true);


    useEffect(() => {
        async function fetchProducts() {
            const fetchedProducts = await get_products_page(null, 3);
            console.log("Fetched products:", fetchedProducts.products);

            setProducts(fetchedProducts.products);
            lastVisibleRef.current = fetchedProducts.lastVisible;
            setHasMoreProducts(fetchedProducts.hasMore);
            hasMoreProductsRef.current = fetchedProducts.hasMore;
            setLoadingProducts(false);
            loadingProductsRef.current = false;
            return fetchedProducts.products;
        }

        fetchProducts();
    },[]);

    const loadMoreProducts = useCallback(async (pageSize = 1) => {
        if (
            loadingMoreRef.current ||
            loadingProductsRef.current ||
            !hasMoreProductsRef.current
        ) {
            return {
                products: [],
                lastVisible: lastVisibleRef.current,
                hasMore: hasMoreProductsRef.current,
            };
        }

        loadingMoreRef.current = true;

        try {
            const newProducts = await get_products_page(lastVisibleRef.current, pageSize);

            if (!newProducts.products.length) {
                hasMoreProductsRef.current = false;
                setHasMoreProducts(false);
                return newProducts;
            }

            setProducts((prev) => [...prev, ...newProducts.products]);
            lastVisibleRef.current = newProducts.lastVisible;

            setHasMoreProducts(newProducts.hasMore);
            hasMoreProductsRef.current = newProducts.hasMore;

            return newProducts;
        } finally {
            loadingMoreRef.current = false;
        }
    }, []);
    
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
        <ProductContext.Provider value={{ products,
                loadingProducts,
        loadMoreProducts,
                hasMoreProducts }}>
			{children}
		</ProductContext.Provider>
	);
}
