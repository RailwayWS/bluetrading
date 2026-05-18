import { db } from "./../config/firebase.js";
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    query,
    where,
    limit,
    setDoc,
} from "firebase/firestore";

/**
 * Get all categories from Firebase categories collection
 * @returns {Promise<Object>} {CategoryName: [subcategories], ...}
 */
export async function get_all_categories() {
    try {
        const categoriesRef = collection(db, "categories");
        const snapshot = await getDocs(categoriesRef);
        
        const categories = {};
        snapshot.docs.forEach((doc) => {
            const data = doc.data();
            const categoryName = data.category;
            categories[categoryName] = data.subCategories || [];
        });
        
        return categories;
    } catch (e) {
        console.error("Error fetching categories: ", e);
        return {};
    }
}



export async function check_category(category, subcategory) {
    if (!category) {
        return { success: false, error: "Category is required" };
    }
    try {
        const categoriesRef = collection(db, "categories");
        const productsRef = collection(db, "products");

        const categoryDocQuery = query(
            categoriesRef,
            where("category", "==", category),
            limit(1)
        );
        const categoryDocSnapshot = await getDocs(categoryDocQuery);

        if (categoryDocSnapshot.empty) {
            return {
                success: true,
                removedSubcategory: false,
                removedCategory: false,
                reason: "Category not found in categories collection",
            };
        }

        const categoryDoc = categoryDocSnapshot.docs[0];
        const categoryData = categoryDoc.data();
        const currentSubcategories = Array.isArray(categoryData.subCategories)
            ? categoryData.subCategories
            : [];

        let removedSubcategory = false;

        if (subcategory) {
            const subcategoryProductsQuery = query(
                productsRef,
                where("category", "==", category),
                where("subcategory", "==", subcategory),
                limit(1)
            );
            const subcategoryProductsSnapshot = await getDocs(subcategoryProductsQuery);

            if (subcategoryProductsSnapshot.empty) {
                const updatedSubcategories = currentSubcategories.filter(
                    (sub) => sub !== subcategory
                );

                if (updatedSubcategories.length !== currentSubcategories.length) {
                    await setDoc(categoryDoc.ref, {
                        category,
                        subCategories: updatedSubcategories,
                    }, { merge: true });
                    removedSubcategory = true;
                }
            }
        }

        const categoryProductsQuery = query(
            productsRef,
            where("category", "==", category),
            limit(1)
        );
        const categoryProductsSnapshot = await getDocs(categoryProductsQuery);

        if (categoryProductsSnapshot.empty) {
            await deleteDoc(categoryDoc.ref);
            return {
                success: true,
                removedSubcategory,
                removedCategory: true,
            };
        }

        return {
            success: true,
            removedSubcategory,
            removedCategory: false,
        };
    } catch (e) {
        console.error("Error checking category/subcategory: ", e);
        return { success: false, error: e.message };
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

/**
 * Add a category and optionally a subcategory to the categories collection.
 * If the category exists, the subcategory will be appended if not present.
 * If the category does not exist, a new document will be created.
 *
 * @param {string} category - Category name (required)
 * @param {string?} subcategory - Subcategory name (optional)
 * @returns {Promise<Object>} - { success, addedCategory, addedSubcategory, error }
 */
export async function add_category(category, subcategory = null) {
    if (!category || typeof category !== "string") {
        return { success: false, error: "Category name is required" };
    }

    try {
        const categoriesRef = collection(db, "categories");

        const categoryQuery = query(
            categoriesRef,
            where("category", "==", category),
            limit(1)
        );

        const categorySnapshot = await getDocs(categoryQuery);

        // If category exists, add subcategory if provided and missing
        if (!categorySnapshot.empty) {
            const catDoc = categorySnapshot.docs[0];
            const data = catDoc.data();
            const currentSubcats = Array.isArray(data.subCategories) ? data.subCategories : [];

            let addedSubcategory = false;

            if (subcategory && !currentSubcats.includes(subcategory)) {
                const updated = [...currentSubcats, subcategory].sort();
                await setDoc(catDoc.ref, { category, subCategories: updated }, { merge: true });
                addedSubcategory = true;
            }

            return { success: true, addedCategory: false, addedSubcategory };
        }

        // Category does not exist - create it
        const toCreate = {
            category,
            subCategories: subcategory && typeof subcategory === "string" ? [subcategory] : [],
        };

        await addDoc(categoriesRef, toCreate);

        return { success: true, addedCategory: true, addedSubcategory: !!subcategory };
    } catch (e) {
        console.error("Error adding category/subcategory:", e);
        return { success: false, error: e.message };
    }
}