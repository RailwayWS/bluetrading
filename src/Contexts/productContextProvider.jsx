import { ProductContext } from "./productContext";
import { useEffect, useState, useMemo } from "react";
import { get_products_page } from "../database/product_queries";
import { resolveImageUrl } from "../database/image_queries";
import { db } from "../config/firebase";
import { doc, setDoc } from "firebase/firestore";

export function ProductProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [imageUrls] = useState({});

    const [loadingProducts, setLoadingProducts] = useState(true);
    const [requestMore, setRequestMore] = useState(false);
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMoreProducts, setHasMoreProducts] = useState(true);


    useEffect(() => {
        async function fetchProducts() {
            const fetchedProducts = await get_products_page(null, 5);
            console.log("Fetched products:", fetchedProducts.products);

            setProducts(fetchedProducts.products);
            setLastVisible(fetchedProducts.lastVisible);
            setHasMoreProducts(fetchedProducts.hasMore);
            setLoadingProducts(false);
            return fetchedProducts.products;
        }

        fetchProducts();
    },[]);

    // normal product loading
    useEffect(() => {
        const fetchAmount = 5;
        console.log("Request more changed:", requestMore);
        if (!requestMore) return;
        if (!products.length) return;
        if (!hasMoreProducts) return;
        
        get_products_page(lastVisible, fetchAmount).then((newProducts) => {
            if (!newProducts.products.length) {
                setHasMoreProducts(false);
                setRequestMore(false);
                return;
            }

            setProducts((prev) => [...prev, ...newProducts.products]);
            setLastVisible(newProducts.lastVisible);

            setHasMoreProducts(newProducts.hasMore);
            setRequestMore(false);
        });


    }, [requestMore, products, lastVisible, hasMoreProducts]);
    

    const docsNeedingImageUrls = useMemo(
        () => {
            if (loadingProducts) return [];
            return products.filter((product) => !product.imageUrl);
        },
        [products, loadingProducts],
    );


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
                imageUrls,
                setRequestMore,
                requestMore,
                hasMoreProducts }}>
			{children}
		</ProductContext.Provider>
	);
}
