import { db } from "./../config/firebase.js";
import {
    doc,
    collection,
    getDocs,
    getDoc,
    addDoc,
    deleteDoc,
    query,
    where,
    limit,
    orderBy,
    startAfter,
    setDoc,
} from "firebase/firestore";
import { searchProductsByTerm } from "./algolia_queries_minimal.js";

/**
 * Generates search terms array from a product name
 * Splits name into individual words and converts to lowercase
 * @param {string} name - Product name
 * @returns {string[]} Array of lowercase words
 */
export function generateSearchTerms(name) {
    if (!name || typeof name !== "string") return [];
    
    return name
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 0);
}

export async function add_product(product) {
    try {     
        const productsRef = collection(db, "products");
        const existingProductQuery = query(
            productsRef,
            where("name", "==", product.name),
            limit(1)
        );
        const existingProductSnapshot = await getDocs(existingProductQuery);

        if (!existingProductSnapshot.empty) {
            console.error("A product with this name already exists.");
            return { success: false, error: "Product with this name already exists" };
        }

        const searchTerms = generateSearchTerms(product.name);

        const docRef = await addDoc(collection(db, "products"), {
            name: product.name,
            price: product.price,
            description: product.description,
            image: product.image || product.imageUrl || "",
            imageUrl : product.imageUrl,
            category: product.category,
            subcategory: product.subcategory,
            features : product.features,
            additionalInfo : product.additionalInfo,
            variants: product.variants || null,
            type: product.type || product.variants ? "variants" : "single",
            searchTerms: searchTerms
        });
        
        console.log("Document added with ID: ", docRef.id);
        return { success: true, id: docRef.id };
    } catch (e) {
        console.error("Error adding document: ", e);
        return { success: false, error: e.message };
    }
}

export async function edit_product(productId, product) {
    try {
        const productRef = doc(db, "products", productId);
        const searchTerms = generateSearchTerms(product.name);
        
        await setDoc(productRef, {
            name: product.name,
            price: product.price,
            description: product.description,
            image: product.image || product.imageUrl || "",
            imageUrl: product.imageUrl,
            category: product.category,
            subcategory: product.subcategory,
            features : product.features,
            additionalInfo : product.additionalInfo,
            variants: product.variants || null,
            type: product.type || product.variants ? "variants" : "single",
            searchTerms: searchTerms
        }, { merge: true });
        
        console.log("Document updated with ID: ", productId);
    } catch (e) {
        console.error("Error updating document: ", e);
    }
}

export async function delete_product(productId) {
    try {
        const productRef = doc(db, "products", productId);
        await deleteDoc(productRef);
        console.log("Document deleted with ID: ", productId);
        return { success: true };
    } catch (e) {
        console.error("Error deleting document: ", e);
        return { success: false, error: e.message };
    }
}

export async function add_product_image_Url(productId, imageURL) {
    try{
        const productRef = doc(db, "products", productId);
        await setDoc(productRef, {
            imageUrl: imageURL
        }, { merge: true });
        console.log("Image URL updated for product ID: ", productId);
    } catch (e) {
        console.error("Error updating image URL: ", e);
    }
}

export async function get_products() {
    const productsRef = collection(db, 'products');
    const productSnapshot = await getDocs(productsRef);
    const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return productList;
}

export async function get_products_category(category, loadLimit = 10, excludeProductId = null) {
    if (!category) {
        return [];
    }

    const productsRef = collection(db, 'products');

    const constraints = [where('category', '==', category)];
    if (excludeProductId) {
        constraints.push(where('__name__', '!=', excludeProductId));
    }
    constraints.push(orderBy('name'));
    constraints.push(limit(loadLimit));
    
    const q = query(productsRef, ...constraints);

    const productSnapshot = await getDocs(q);
    const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return productList;
}


/**
 * Fetch products with filtering by category/subcategory using cursor-based pagination
 * Uses Firebase when no search term provided (with lastVisible cursor)
 * Uses Algolia only when searchTerm is provided
 * 
 * @param {number} pageSize - Results per page
 * @param {Object} filters - {category, subcategory, searchTerm}
 * @param {Object} lastVisible - Firestore document snapshot of last product (for pagination)
 * @returns {Promise<Object>} {products, lastVisible, hasMore}
 */
export async function get_products_page(pageSize = 40, filters = {}, lastVisible = null) {
    try {
        const { searchTerm } = filters;
        
        // If user typed a search term, use Algolia (page-based pagination)
        if (searchTerm && searchTerm.trim() !== '') {
            
            const page = lastVisible ? lastVisible.algoliaPage : 0;
            const results = await searchProductsByTerm(searchTerm, page, pageSize);
            
            results.hits.forEach(product => {
                product.id = product.objectID; // Map Algolia's objectID to id for consistency
            });

            return {
                products: results.hits,
                lastVisible: results.hasMore ? { algoliaPage: page + 1 } : null,
                hasMore: results.hasMore,
                nbHits: results.nbHits,
                currentPage: results.page,
            };
        }
        
        // Otherwise use Firebase for filtering by category/subcategory (cursor-based pagination)
        const productsRef = collection(db, 'products');
        let q;
        
        const constraints = [];
        
        if (filters.category && filters.category !== 'All') {
            constraints.push(where('category', '==', filters.category));
        }
        
        if (filters.subcategory && filters.subcategory !== 'All') {
            constraints.push(where('subcategory', '==', filters.subcategory));
        }
        
        constraints.push(orderBy('name'));
        
        // If we have a lastVisible cursor, continue from there
        if (lastVisible) {
            constraints.push(startAfter(lastVisible));
        }
        
        // Fetch one extra to check if there are more products
        constraints.push(limit(pageSize + 1));
        
        q = query(productsRef, ...constraints);
        
        const snapshot = await getDocs(q);
        
        // Get only the products we need (pageSize results)
        const productDocs = snapshot.docs.slice(0, pageSize);
        const products = productDocs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Determine if there are more products
        const hasMore = snapshot.docs.length > pageSize;
        
        // Save the last document as cursor for next page
        const newLastVisible = hasMore && productDocs.length > 0 
            ? productDocs[productDocs.length - 1]  // Return the actual Firestore doc snapshot
            : null;
        
        return {
            products,
            lastVisible: newLastVisible,
            hasMore: hasMore,
        };
    } catch (error) {
        console.error("Error fetching products:", error);
        return {
            products: [],
            lastVisible: null,
            hasMore: false,
        };
    }
}



export async function get_product_by_id(productId) {
    const productDoc = doc(db, "products", productId);
    const productSnapshot = await getDoc(productDoc);   
    console.log(productSnapshot.data()); 
    return {id: productSnapshot.id, ...productSnapshot.data()};
}