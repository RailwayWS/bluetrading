import algoliasearch from 'algoliasearch';

const appId = import.meta.env.VITE_ALGOLIA_APP_ID;
const apiKey = import.meta.env.VITE_ALGOLIA_API_KEY;

if (!appId || !apiKey) {
    console.warn('Algolia credentials not found in .env file');
}

// Initialize Algolia client
const algoliaClient = algoliasearch(appId, apiKey);

// Get the products index
export const productsIndex = algoliaClient.initIndex('products');

/**
 * Search products using Algolia
 * Supports full-text search, fuzzy matching, typo tolerance
 * 
 * @param {string} searchTerm - Search query
 * @param {Object} filters - Filter options {category, subcategory}
 * @param {number} page - Pagination page (0-indexed)
 * @param {number} hitsPerPage - Results per page
 * @returns {Promise<{hits: Array, nbHits: number, nbPages: number, page: number}>}
 */
export async function searchProducts(
    searchTerm = '',
    filters = {},
    page = 0,
    hitsPerPage = 40
) {
    try {
        // Build filter string for Algolia
        let filterString = '';
        if (filters.category && filters.category !== 'All') {
            filterString += `category:"${filters.category}"`;
        }
        if (filters.subcategory && filters.subcategory !== 'All') {
            if (filterString) filterString += ' AND ';
            filterString += `subcategory:"${filters.subcategory}"`;
        }

        const searchParams = {
            page,
            hitsPerPage,
            ...(filterString && { filters: filterString }),
        };

        const results = await productsIndex.search(searchTerm, searchParams);

        return {
            products: results.hits,
            nbHits: results.nbHits,
            nbPages: results.nbPages,
            page: results.page,
            hasMore: results.page < results.nbPages - 1,
        };
    } catch (error) {
        console.error('Algolia search error:', error);
        return {
            products: [],
            nbHits: 0,
            nbPages: 0,
            page: 0,
            hasMore: false,
        };
    }
}

/**
 * Get faceted categories and subcategories for filters
 * @returns {Promise<Object>} {category: [values], subcategory: [values]}
 */
export async function getAlgoliaFacets() {
    try {
        const results = await productsIndex.search('', {
            facets: ['category', 'subcategory'],
            hitsPerPage: 0,
        });

        return {
            categories: results.facets?.category || {},
            subcategories: results.facets?.subcategory || {},
        };
    } catch (error) {
        console.error('Error fetching Algolia facets:', error);
        return {
            categories: {},
            subcategories: {},
        };
    }
}

/**
 * Get all categories grouped by subcategories
 * @returns {Promise<Object>} {Electronics: [Phones, Tablets], ...}
 */
export async function getAllCategoriesFromAlgolia() {
    try {
        const results = await productsIndex.search('', {
            facets: ['category'],
            facetFilters: [],
            hitsPerPage: 0,
        });

        // Get all unique categories
        const categorySet = new Set(Object.keys(results.facets?.category || {}));
        
        // For each category, get its subcategories
        const result = {};
        for (const category of categorySet) {
            const subcatResults = await productsIndex.search('', {
                facets: ['subcategory'],
                filters: `category:"${category}"`,
                hitsPerPage: 0,
            });
            result[category] = Object.keys(subcatResults.facets?.subcategory || {}).sort();
        }

        return result;
    } catch (error) {
        console.error('Error fetching categories from Algolia:', error);
        return {};
    }
}

/**
 * Sync a product to Algolia index
 * Use when adding or updating products
 * 
 * @param {Object} product - Product object with id field
 * @returns {Promise<Object>} Operation result
 */
export async function syncProductToAlgolia(product) {
    try {
        if (!product.id) {
            throw new Error('Product must have an id field');
        }

        const algoliaProduct = {
            objectID: product.id,
            ...product,
        };

        await productsIndex.saveObject(algoliaProduct);
        console.log(`Product "${product.name}" synced to Algolia`);

        return { success: true, id: product.id };
    } catch (error) {
        console.error('Error syncing product to Algolia:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Sync multiple products to Algolia
 * Useful for bulk operations
 * 
 * @param {Array} products - Array of product objects
 * @returns {Promise<Object>} Operation result
 */
export async function syncProductsToAlgolia(products) {
    try {
        const algoliaProducts = products.map((product) => ({
            objectID: product.id,
            ...product,
        }));

        const results = await productsIndex.saveObjects(algoliaProducts);
        console.log(`${results.length} products synced to Algolia`);

        return { success: true, count: results.length };
    } catch (error) {
        console.error('Error bulk syncing products to Algolia:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Remove a product from Algolia index
 * Use when deleting products
 * 
 * @param {string} productId - Product ID to delete
 * @returns {Promise<Object>} Operation result
 */
export async function removeProductFromAlgolia(productId) {
    try {
        await productsIndex.deleteObject(productId);
        console.log(`Product ${productId} removed from Algolia`);

        return { success: true, id: productId };
    } catch (error) {
        console.error('Error removing product from Algolia:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Clear entire Algolia index (use with caution!)
 * @returns {Promise<Object>} Operation result
 */
export async function clearAlgoliaIndex() {
    try {
        await productsIndex.clearObjects();
        console.log('Algolia index cleared');
        return { success: true };
    } catch (error) {
        console.error('Error clearing Algolia index:', error);
        return { success: false, error: error.message };
    }
}

export default {
    searchProducts,
    getAlgoliaFacets,
    getAllCategoriesFromAlgolia,
    syncProductToAlgolia,
    syncProductsToAlgolia,
    removeProductFromAlgolia,
    clearAlgoliaIndex,
};
