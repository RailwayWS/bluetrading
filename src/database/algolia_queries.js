import { algoliasearch } from 'algoliasearch';

const appId = import.meta.env.VITE_ALGOLIA_APP_ID;
const apiKey = import.meta.env.VITE_ALGOLIA_API_KEY;
const indexName = 'blue_damn_products';

if (!appId || !apiKey) {
    console.warn('Algolia credentials not found in .env file');
}

// Initialize Algolia client (v5)
const client = algoliasearch(appId, apiKey);

/**
 * Search products using Algolia (v5)
 * ONLY called when user types a search term
 * Supports full-text search, fuzzy matching, typo tolerance
 * 
 * @param {string} searchTerm - Search query (must not be empty)
 * @param {number} page - Pagination page (0-indexed)
 * @param {number} hitsPerPage - Results per page
 * @returns {Promise<{hits: Array, nbHits: number, nbPages: number, page: number, hasMore: boolean}>}
 */
export async function searchProductsByTerm(
    searchTerm = '',
    page = 0,
    hitsPerPage = 40
) {
    try {
        if (!searchTerm || searchTerm.trim() === '') {
            return {
                hits: [],
                nbHits: 0,
                nbPages: 0,
                page: 0,
                hasMore: false,
            };
        }

        // v5: Use client.search() with index name parameter
        const results = await client.search({
            requests: [
                {
                    indexName,
                    query: searchTerm,
                    page,
                    hitsPerPage,
                }
            ]
        });

        const indexResults = results.results[0];

        return {
            hits: indexResults.hits,
            nbHits: indexResults.nbHits,
            nbPages: indexResults.nbPages,
            page: indexResults.page,
            hasMore: indexResults.page < indexResults.nbPages - 1,
        };
    } catch (error) {
        console.error('Algolia search error:', error);
        return {
            hits: [],
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
    searchProductsByTerm,
};
