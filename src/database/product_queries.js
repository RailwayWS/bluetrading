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

        const docRef = await addDoc(collection(db, "products"), {
            name: product.name,
            price: product.price,
            description: product.description,
            image: product.imageURL,
            category: product.category,
            subcategory: product.subcategory,
            features : product.features,
            additionalInfo : product.additionalInfo,
            imageUrl : product.imageURL
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
        await setDoc(productRef, {
            name: product.name,
            price: product.price,
            description: product.description,
            image: product.imageURL,
            category: product.category,
            subcategory: product.subcategory,
            features : product.features,
            additionalInfo : product.additionalInfo
        }, { merge: true });
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

export async function get_products_page(lastVisible = null, pageSize = 40, filters = {}) {
    const productsRef = collection(db, "products");
    
    const whereClauses = [];
    if (filters.category && filters.category !== "All") {
        whereClauses.push(where("category", "==", filters.category));
    }
    if (filters.subcategory && filters.subcategory !== "All") {
        whereClauses.push(where("subcategory", "==", filters.subcategory));
    }
    if (filters.searchTerm && filters.searchTerm.trim() !== "") {
        const searchTerm = filters.searchTerm.toLowerCase();
        whereClauses.push(
            where("name", ">=", searchTerm),
            where("name", "<=", searchTerm + "\uf8ff")
        );
    }

    const pageQuery = lastVisible
        ? query(
            productsRef,
            ...whereClauses,
            orderBy("name"),
            startAfter(lastVisible),
            limit(pageSize),
        )
        : query(
            productsRef,
            ...whereClauses,
            orderBy("name"),
            limit(pageSize),
        );

    const snapshot = await getDocs(pageQuery);
    const products = snapshot.docs.map((productDoc) => ({
        id: productDoc.id,
        ...productDoc.data(),
    }));

    return {
        products,
        lastVisible: snapshot.docs[snapshot.docs.length - 1] ?? null,
        hasMore: snapshot.docs.length === pageSize,
    };
}

export async function get_all_categories() {
    try {
        const categoriesRef = collection(db, "categories");
        const snapshot = await getDocs(categoriesRef);
        
        const result = {};
        snapshot.docs.forEach((doc) => {
            const data = doc.data();
            const categoryName = data.category;
            const subCategories = data.subCategories || [];
            
            if (categoryName) {
                result[categoryName] = subCategories;
            }
        });
        
        return result;
    } catch (e) {
        console.error("Error fetching categories: ", e);
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