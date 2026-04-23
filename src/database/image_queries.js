import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../config/firebase";

async function mapLimit(items, limit, asyncMapper) {
    const results = new Array(items.length);
    let nextIndex = 0;

    async function worker() {
        while (nextIndex < items.length) {
            const current = nextIndex++;
            try {
                results[current] = await asyncMapper(items[current], current);
            } catch (err) {
                console.error(`Error processing item at index ${current}:`, err);
                results[current] = null; // fail soft
            }
        }
    }

    const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
    await Promise.all(workers);
    return results;
}

const urlCache = new Map();

async function resolveImageUrl(path) {
    if (!path) return null;
    if (urlCache.has(path)) return urlCache.get(path);

    const normalizedPath = path.includes("/") ? path : `products/${path}`;
    const url = await getDownloadURL(ref(storage, normalizedPath));
    urlCache.set(path, url);
    return url;
}

// products: [{ id, name, imagePath, ... }]
export async function hydrateProductImageUrls(products, onItemResolved) {
    const limit = 6;

    await mapLimit(products, limit, async (product, index) => {
        if (product.imageUrl && product.imageUrl !== "/fallback-image.png") {
            return product; // already has resolved URL, skip
        }
        const imageUrl = await resolveImageUrl(product.imagePath);

        // push incremental update to UI
        onItemResolved?.(index, {
        ...product,
        imageUrl: imageUrl || "/fallback-image.png",
        });
    });
}