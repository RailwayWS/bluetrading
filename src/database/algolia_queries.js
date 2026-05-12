import { algoliasearch } from 'algoliasearch';

const appId = import.meta.env.VITE_ALGOLIA_APP_ID;
const apiKey = import.meta.env.VITE_ALGOLIA_API_KEY;
const indexName = 'blue_damn_products';

if (!appId || !apiKey) {
    console.warn('Algolia credentials not found in .env file');
}

// Initialize Algolia client (v5)
const client = algoliasearch(appId, apiKey);

// In v5, call search/index methods directly on client with indexName parameter
// OR use client.getIndex() which returns the index interface
const getIndex = () => {
    // v5 provides these methods on client directly for quick access
    return client;
};

/**
 * Search products using Algolia (v5)
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
        // Build filter string for Algolia v5
        let filterString = '';
        if (filters.category && filters.category !== 'All') {
            filterString += `category:"${filters.category}"`;
        }
        if (filters.subcategory && filters.subcategory !== 'All') {
            if (filterString) filterString += ' AND ';
            filterString += `subcategory:"${filters.subcategory}"`;
        }

        const searchParams = {
            indexName,
            searchableAttributes: ['name', 'description', 'category', 'subcategory'],
            page,
            hitsPerPage,
            ...(filterString && { filters: filterString }),
        };

        // v5: Use client.search() with index name parameter
        const results = await client.search({
            requests: [
                {
                    indexName,
                    query: searchTerm,
                    page,
                    hitsPerPage,
                    ...(filterString && { filters: filterString }),
                }
            ]
        });

        const indexResults = results.results[0];

        return {
            products: indexResults.hits,
            nbHits: indexResults.nbHits,
            nbPages: indexResults.nbPages,
            page: indexResults.page,
            hasMore: indexResults.page < indexResults.nbPages - 1,
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
 * Get faceted categories and subcategories for filters (v5)
 * @returns {Promise<Object>} {category: [values], subcategory: [values]}
 */
export async function getAlgoliaFacets() {
    try {
        // v5: Use client.search() with facets parameter
        const results = await client.search({
            requests: [
                {
                    indexName,
                    query: '',
                    facets: ['category', 'subcategory'],
                    hitsPerPage: 0,
                }
            ]
        });

        const indexResults = results.results[0];

        return {
            categories: indexResults.facets?.category || {},
            subcategories: indexResults.facets?.subcategory || {},
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
 * Get all categories grouped by subcategories (v5)
 * @returns {Promise<Object>} {Electronics: [Phones, Tablets], ...}
 */
export async function getAllCategoriesFromAlgolia() {
    try {
        // v5: Use client.search() to get categories
        const results = await client.search({
            requests: [
                {
                    indexName,
                    query: '',
                    facets: ['category'],
                    hitsPerPage: 0,
                }
            ]
        });

        const indexResults = results.results[0];
        const categorySet = new Set(Object.keys(indexResults.facets?.category || {}));
        
        // For each category, get its subcategories
        const result = {};
        for (const category of categorySet) {
            const subcatResults = await client.search({
                requests: [
                    {
                        indexName,
                        query: '',
                        facets: ['subcategory'],
                        filters: `category:"${category}"`,
                        hitsPerPage: 0,
                    }
                ]
            });
            result[category] = Object.keys(subcatResults.results[0].facets?.subcategory || {}).sort();
        }

        return result;
    } catch (error) {
        console.error('Error fetching categories from Algolia:', error);
        return {};
    }
}

/**
 * Sync a product to Algolia index (v5)
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

        // v5: Use client.saveObject() with index name
        await client.saveObject({
            indexName,
            body: algoliaProduct,
        });
        console.log(`Product "${product.name}" synced to Algolia`);

        return { success: true, id: product.id };
    } catch (error) {
        console.error('Error syncing product to Algolia:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Sync multiple products to Algolia (v5)
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

        // v5: Use client.saveObjects() with index name
        const results = await client.saveObjects({
            indexName,
            bodies: algoliaProducts,
        });
        console.log(`${results.objectIDs?.length || algoliaProducts.length} products synced to Algolia`);

        return { success: true, count: results.objectIDs?.length || algoliaProducts.length };
    } catch (error) {
        console.error('Error bulk syncing products to Algolia:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Remove a product from Algolia index (v5)
 * Use when deleting products
 * 
 * @param {string} productId - Product ID to delete
 * @returns {Promise<Object>} Operation result
 */
export async function removeProductFromAlgolia(productId) {
    try {
        // v5: Use client.deleteObject() with index name
        await client.deleteObject({
            indexName,
            objectID: productId,
        });
        console.log(`Product ${productId} removed from Algolia`);

        return { success: true, id: productId };
    } catch (error) {
        console.error('Error removing product from Algolia:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Remove multiple products from Algolia (v5)
 * 
 * @param {Array<string>} productIds - Array of product IDs to delete
 * @returns {Promise<Object>} Operation result
 */
export async function removeProductsFromAlgolia(productIds) {
    try {
        // v5: Use client.deleteObjects() with index name
        await client.deleteObjects({
            indexName,
            objectIDs: productIds,
        });
        console.log(`${productIds.length} products removed from Algolia`);

        return { success: true, count: productIds.length };
    } catch (error) {
        console.error('Error removing products from Algolia:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Clear entire Algolia index (use with caution!) (v5)
 * @returns {Promise<Object>} Operation result
 */
export async function clearAlgoliaIndex() {
    try {
        // v5: Use client.clearObjects() with index name
        await client.clearObjects({
            indexName,
        });
        console.log('Algolia index cleared');
        return { success: true };
    } catch (error) {
        console.error('Error clearing Algolia index:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get the Algolia index name (v5)
 * @returns {string} Index name
 */
export function getAlgoliaIndexName() {
    return indexName;
}

/**
 * Get the Algolia client instance for direct access (v5)
 * Use for multi-index operations
 * 
 * @returns {Object} Algolia client instance
 */
export function getAlgoliaClient() {
    return client;
}

export default {
    searchProducts,
    getAlgoliaFacets,
    getAllCategoriesFromAlgolia,
    syncProductToAlgolia,
    syncProductsToAlgolia,
    removeProductFromAlgolia,
    removeProductsFromAlgolia,
    clearAlgoliaIndex,
    getAlgoliaIndexName,
    getAlgoliaClient,
};
