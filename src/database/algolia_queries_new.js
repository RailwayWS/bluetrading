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

export default {
    searchProductsByTerm,
};
