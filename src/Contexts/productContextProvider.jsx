import { ProductContext } from "./productContext";
import { useEffect, useState, useCallback, useMemo } from "react";
import { get_products } from "../database/product_queries";
import { hydrateProductImageUrls } from "../database/image_queries";



export function ProductProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [imageUrls, setImageUrls] = useState({});

    const productsNeedingImageUrls = useMemo(
            () => {
                if (loadingProducts) return [];
                return products.filter((product) => !imageUrls[product.id]);
            },
            [products, imageUrls, loadingProducts],
    );
    
    useEffect(() => {
        async function fetchProducts() {
            const fetchedProducts = await get_products();
            setProducts(fetchedProducts);
            setLoadingProducts(false);
            return fetchedProducts;
        }

        fetchProducts();
    },[]);

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

    

	return (
		<ProductContext.Provider value={{ products, loadingProducts, imageUrls }}>
			{children}
		</ProductContext.Provider>
	);
}
