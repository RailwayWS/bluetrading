import { uploadBytes, getDownloadURL, ref, deleteObject } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { storage, db } from "../config/firebase";

// A year is effectively "forever" for a product photo — if it ever changes,
// re-uploading gives it a new filename via the modal's image picker anyway.
const IMAGE_CACHE_CONTROL = "public, max-age=31536000, immutable";

export async function add_image(image) {
    try {
      const storageRef = ref(storage, `products/${image.name}`);
      await uploadBytes(storageRef, image, { cacheControl: IMAGE_CACHE_CONTROL });
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (e) {
        console.error("Error uploading image: ", e);
    }
}

export async function delete_image(imagePath) {
    try {
      const storageRef = ref(storage, `products/${imagePath}`);
      await deleteObject(storageRef);
      return true;
    } catch (e) {
        console.error("Error deleting image: ", e);
        return false;
    }
}

// Matches the naming convention of the Firebase "Resize Images" extension:
// "products/foo.png" + "200x200" -> "products/foo_200x200.png"
function getResizedPath(path, size) {
    const lastDot = path.lastIndexOf(".");
    if (lastDot === -1) return `${path}_${size}`;
    return `${path.slice(0, lastDot)}_${size}${path.slice(lastDot)}`;
}

const urlCache = new Map();
// Path -> in-flight getDownloadURL promise, so two callers resolving the same
// image at once (e.g. two product cards re-rendering together) share one
// Storage request instead of firing a duplicate for each.
const pendingRequests = new Map();

// Pass `size` (e.g. "200x200") to request a resized variant produced by the
// Resize Images extension. Falls back to the original if that variant
// doesn't exist yet — e.g. it hasn't finished processing, or the image was
// uploaded before the extension was installed.
export async function resolveImageUrl(path, size = null) {
    if (!path) return null;

    const cacheKey = size ? `${path}::${size}` : path;
    if (urlCache.has(cacheKey)) return urlCache.get(cacheKey);
    if (pendingRequests.has(cacheKey)) return pendingRequests.get(cacheKey);

    const request = (async () => {
        const normalizedPath = path.includes("/") ? path : `products/${path}`;
        const targetPath = size ? getResizedPath(normalizedPath, size) : normalizedPath;

        try {
            return await getDownloadURL(ref(storage, targetPath));
        } catch (error) {
            if (size && error?.code === "storage/object-not-found") {
                return getDownloadURL(ref(storage, normalizedPath));
            }
            throw error;
        }
    })()
        .then((url) => {
            urlCache.set(cacheKey, url);
            return url;
        })
        .finally(() => {
            pendingRequests.delete(cacheKey);
        });

    pendingRequests.set(cacheKey, request);
    return request;
}

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

// Resolves missing imageUrls for a batch of products (max 6 at a time so a
// long list of legacy products doesn't fire dozens of simultaneous Storage
// requests), persists each one to Firestore so future loads skip this
// entirely, and reports each resolved product back via onItemResolved so the
// caller can update whatever's on screen without a full reload.
export async function hydrateProductImageUrls(products, onItemResolved) {
    const limit = 6;

    await mapLimit(products, limit, async (product, index) => {
        if (product.imageUrl) {
            return product;
        }

        const imageUrl = await resolveImageUrl(product.image);
        if (!imageUrl) return product;

        const updatedProduct = { ...product, imageUrl };

        try {
            await setDoc(doc(db, "products", product.id), { imageUrl }, { merge: true });
        } catch (error) {
            console.error(`Failed to persist image URL for product ${product.id}:`, error);
        }

        onItemResolved?.(index, updatedProduct);
        return updatedProduct;
    });
}
