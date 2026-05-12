/**
 * Helper utility for managing product search terms
 * Provides easy-to-use functions for backfilling and managing search terms
 */
import {getDocs, collection, setDoc} from "firebase/firestore";
import { db } from "../config/firebase";

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

/**
 * Backfills search terms for all existing products
 * Call this once during initialization
 * @returns {Promise<Object>}
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
            
            if (data.searchTerms && Array.isArray(data.searchTerms) && data.searchTerms.length > 0) {
                return;
            }

            const searchTerms = generateSearchTerms(data.name);
            updates.push(
                setDoc(productDoc.ref, { searchTerms }, { merge: true })
            );
            updated++;
        });

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

/**
 * Run search terms backfill for existing products
 * Safe to run multiple times - only updates products without searchTerms
 * 
 * Usage in browser console:
 * import { runSearchTermsBackfill } from './database/searchTermsHelper.js'
 * await runSearchTermsBackfill()
 */
export async function runSearchTermsBackfill() {
    console.log("🔄 Running search terms backfill...");
    const result = await backfillSearchTerms();
    
    if (result.error) {
        console.error("❌ Backfill failed:", result.error);
        return result;
    }
    
    console.log(`✅ Backfill complete! Updated ${result.updated} products with search terms.`);
    return result;
}

/**
 * Expose helper for manual testing in browser console
 * window.searchTermsHelper.backfill()
 */
export const searchTermsHelper = {
    backfill: runSearchTermsBackfill,
};

// Auto-attach to window for easy console access (development only)
if (typeof window !== "undefined") {
    window.searchTermsHelper = searchTermsHelper;
    console.log("🔍 Search Terms Helper available! Run: window.searchTermsHelper.backfill()");
}
