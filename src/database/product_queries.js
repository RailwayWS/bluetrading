import { db } from "./../config/firebase.js";
import {
    doc,
    collection,
    getDocs,
    getDoc,
    addDoc,
    query,
    where,
    limit,
    orderBy,
    startAfter,
    setDoc,
} from "firebase/firestore";
import { syncProductToAlgolia, removeProductFromAlgolia } from "./algolia_queries.js";

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
        .split(/\s+/)  // Split by whitespace
        .filter((word) => word.length > 0);  // Remove empty strings
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
            image: product.imageURL,
            category: product.category,
            subcategory: product.subcategory,
            features : product.features,
            additionalInfo : product.additionalInfo,
            imageUrl : product.imageURL,
            searchTerms: searchTerms  // ← Keep for backup, but Algolia handles search
        });
        
        // Sync to Algolia
        const productToSync = {
            id: docRef.id,
            name: product.name,
            price: product.price,
            description: product.description,
            image: product.imageURL,
            category: product.category,
            subcategory: product.subcategory,
            features: product.features,
            additionalInfo: product.additionalInfo,
            imageUrl: product.imageURL,
            searchTerms: searchTerms,
        };
        
        await syncProductToAlgolia(productToSync);
        
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
            image: product.imageURL,
            category: product.category,
            subcategory: product.subcategory,
            features : product.features,
            additionalInfo : product.additionalInfo,
            searchTerms: searchTerms  // ← Auto-updated on edit
        }, { merge: true });
        
        // Sync to Algolia
        const productToSync = {
            id: productId,
            name: product.name,
            price: product.price,
            description: product.description,
            image: product.imageURL,
            category: product.category,
            subcategory: product.subcategory,
            features: product.features,
            additionalInfo: product.additionalInfo,
            searchTerms: searchTerms,
        };
        
        await syncProductToAlgolia(productToSync);
        
        console.log("Document updated with ID: ", productId);
    } catch (e) {
        console.error("Error updating document: ", e);
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

/**
 * Fetch products with Algolia search
 * Supports filtering by category, subcategory, and full-text search
 * Uses Algolia for efficient, fast search with typo tolerance and fuzzy matching
 * 
 * @param {number|null} page - Page number (0-indexed) - null means first page
 * @param {number} pageSize - Results per page
 * @param {Object} filters - Filter options {category, subcategory, searchTerm}
 * @returns {Promise<{products, hasMore, nbHits, lastVisible}>}
 */
export async function get_products_page(page = 0, pageSize = 40, filters = {}) {
    const { searchProducts } = await import("./algolia_queries.js");
    
    try {
        const results = await searchProducts(
            filters.searchTerm || "",
            {
                category: filters.category || "All",
                subcategory: filters.subcategory || "All",
            },
            page,
            pageSize
        );

        return {
            products: results.products,
            lastVisible: null,  // Algolia uses page-based pagination, not cursor
            hasMore: results.hasMore,
            nbHits: results.nbHits,
            currentPage: results.page,
        };
    } catch (error) {
        console.error("Error fetching products from Algolia:", error);
        return {
            products: [],
            lastVisible: null,
            hasMore: false,
            nbHits: 0,
            currentPage: 0,
        };
    }
}

/**
 * Backfills search terms for all existing products without them
 * Call this once during initial setup or when needed to populate existing products
 * @returns {Promise<{updated: number, error: string | null}>}
 */
export async function backfillSearchTerms() {
    try {
        console.log("Starting search terms backfill...");
        const productsRef = collection(db, "products");
        const snapshot = await getDocs(productsRef);
        
        let updated = 0;
        const updates = [];

        snapshot.docs.forEach((productDoc) => {
            const data = productDoc.data();
            
            // Skip if already has searchTerms
            if (data.searchTerms && Array.isArray(data.searchTerms) && data.searchTerms.length > 0) {
                return;
            }

            const searchTerms = generateSearchTerms(data.name);
            updates.push(
                setDoc(productDoc.ref, { searchTerms }, { merge: true })
            );
            updated++;
        });

        // Execute all updates in parallel
        if (updates.length > 0) {
            await Promise.all(updates);
            console.log(`Search terms backfill complete! Updated ${updated} products.`);
        } else {
            console.log("No products needed search terms backfill.");
        }

        return { updated, error: null };
    } catch (e) {
        console.error("Error backfilling search terms: ", e);
        return { updated: 0, error: e.message };
    }
}

export async function get_all_categories() {
    try {
        const { getAllCategoriesFromAlgolia } = await import("./algolia_queries.js");
        const categories = await getAllCategoriesFromAlgolia();
        return categories;
    } catch (e) {
        console.error("Error fetching categories from Algolia: ", e);
        return {};
    }
}

export async function syncMissingCategories() {
    try {
        // Fetch all categories from categories collection
        const categoriesRef = collection(db, "categories");
        const categoriesSnapshot = await getDocs(categoriesRef);
        
        const dbCategories = {};
        categoriesSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            const categoryName = data.category;
            const subCategoriesSet = new Set(data.subCategories || []);
            dbCategories[categoryName] = subCategoriesSet;
        });

        // Fetch all products and extract unique category/subcategory pairs
        const productsRef = collection(db, "products");
        const productsSnapshot = await getDocs(productsRef);
        
        const productCategories = {};
        productsSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            const category = data.category || "Uncategorized";
            const subcategory = data.subcategory || "General";
            
            if (!productCategories[category]) {
                productCategories[category] = new Set();
            }
            productCategories[category].add(subcategory);
        });

        // Find missing categories and subcategories
        const missingCategories = {};
        Object.entries(productCategories).forEach(([category, subCategories]) => {
            if (!dbCategories[category]) {
                // Entire category is missing
                missingCategories[category] = Array.from(subCategories);
            } else {
                // Check for missing subcategories
                const missingSubcats = Array.from(subCategories).filter(
                    (sub) => !dbCategories[category].has(sub)
                );
                
                if (missingSubcats.length > 0) {
                    missingCategories[category] = missingSubcats;
                }
            }
        });

        // Add missing categories to database
        if (Object.keys(missingCategories).length > 0) {
            for (const [category, newSubcategories] of Object.entries(missingCategories)) {
                const existingDoc = categoriesSnapshot.docs.find(
                    (doc) => doc.data().category === category
                );

                if (existingDoc) {
                    // Category exists, add missing subcategories
                    const currentSubcats = new Set(existingDoc.data().subCategories || []);
                    newSubcategories.forEach((sub) => currentSubcats.add(sub));
                    
                    await setDoc(existingDoc.ref, {
                        category,
                        subCategories: Array.from(currentSubcats).sort(),
                    });
                    console.log(`Updated category "${category}" with missing subcategories`);
                } else {
                    // New category, add it
                    await addDoc(categoriesRef, {
                        category,
                        subCategories: newSubcategories.sort(),
                    });
                    console.log(`Added new category "${category}" to database`);
                }
            }
            
            console.log("Category sync complete");
            return { synced: true, missing: missingCategories };
        }
        
        console.log("No missing categories found");
        return { synced: false, missing: {} };
    } catch (e) {
        console.error("Error syncing categories: ", e);
        return { synced: false, error: e.message };
    }
}

export async function get_product_by_id(productId) {
    const productDoc = doc(db, "products", productId);
    const productSnapshot = await getDoc(productDoc);   
    console.log(productSnapshot.data()); 
    return {id: productSnapshot.id, ...productSnapshot.data()};
}