import { algoliasearch } from 'algoliasearch';

const appId = import.meta.env.VITE_ALGOLIA_APP_ID;
const apiKey = import.meta.env.VITE_ALGOLIA_API_KEY;
const indexName = 'blue_damn_products';

if (!appId || !apiKey) {
    console.warn('Algolia credentials not found in .env file');
}

const client = algoliasearch(appId, apiKey);

/**
 * Search products using Algolia
 * ONLY used when user types a search term
 * Returns products matching the search with full-text, fuzzy, typo tolerance
 * 
 * @param {string} searchTerm - Search query
 * @param {number} page - Page number (0-indexed)
 * @param {number} hitsPerPage - Results per page
 * @returns {Promise<Object>} { hits, nbHits, nbPages, page, hasMore }
 */
export async function searchProductsByTerm(
    searchTerm = '',
    page = 0,
    hitsPerPage = 40
) {
    try {
        if (!searchTerm || searchTerm.trim() === '') {
            return { hits: [], nbHits: 0, nbPages: 0, page: 0, hasMore: false };
        }

        const results = await client.search({
            requests: [{
                indexName,
                query: searchTerm,
                page,
                hitsPerPage,
            }]
        });

        const result = results.results[0];
        return {
            hits: result.hits,
            nbHits: result.nbHits,
            nbPages: result.nbPages,
            page: result.page,
            hasMore: result.page < result.nbPages - 1,
        };
    } catch (error) {
        console.error('Algolia search error:', error);
        return { hits: [], nbHits: 0, nbPages: 0, page: 0, hasMore: false };
    }
}

export default { searchProductsByTerm };
