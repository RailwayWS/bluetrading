/**
 * Helper utility for managing product search terms
 * Provides easy-to-use functions for backfilling and managing search terms
 */

import { backfillSearchTerms } from "./product_queries";

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
