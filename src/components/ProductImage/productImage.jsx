import { useState, useEffect, useRef } from "react";
import { trace } from "firebase/performance";
import { perf } from "../../config/firebase.js";
import { resolveImageUrl } from "../../database/image_queries.js";
import "./productImage.css";

// Shared by the Products grid and the Details page (main image + related
// products) so every product photo on the site is measured the same way.
// `context` just tags which spot on the site the load happened in, so slow
// loads can be traced back to where they're actually felt (Firebase Console
// → Performance → Custom traces → product_image_load).
//
// Pass `imagePath` + `size` (e.g. "200x200") to request a resized variant —
// produced by the Firebase "Resize Images" extension — instead of the
// full-size `src`. Falls back to `src` if no resized variant exists yet.
function ProductImage({ src, imagePath, size, alt, className = "", context = "grid" }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [resolvedSrc, setResolvedSrc] = useState(src ?? null);
    const activeTraceRef = useRef(null);

    useEffect(() => {
        if (!imagePath || !size) {
            setResolvedSrc(src ?? null);
            return undefined;
        }

        let isCancelled = false;
        resolveImageUrl(imagePath, size).then((url) => {
            if (!isCancelled) setResolvedSrc(url || src || null);
        });
        return () => {
            isCancelled = true;
        };
    }, [src, imagePath, size]);

    useEffect(() => {
        setIsLoaded(false);
        if (!resolvedSrc) return undefined;

        const imageTrace = trace(perf, "product_image_load");
        imageTrace.putAttribute("context", context);
        imageTrace.start();
        activeTraceRef.current = imageTrace;

        return () => {
            // Covers the image changing (list re-render) or the component
            // unmounting before load/error ever fired — a trace left running
            // forever would just never show up, so always close it out.
            if (activeTraceRef.current === imageTrace) {
                imageTrace.stop();
                activeTraceRef.current = null;
            }
        };
    }, [resolvedSrc, context]);

    const handleLoad = () => {
        setIsLoaded(true);
        activeTraceRef.current?.stop();
        activeTraceRef.current = null;
    };

    const handleError = () => {
        activeTraceRef.current?.putAttribute("result", "error");
        activeTraceRef.current?.stop();
        activeTraceRef.current = null;
    };

    return (
        <>
            {!isLoaded && <div className="product-image__skeleton" />}
            <img
                src={resolvedSrc}
                alt={alt}
                className={`${className} ${isLoaded ? "product-image--loaded" : "product-image--hidden"}`}
                onLoad={handleLoad}
                onError={handleError}
                loading="lazy"
                decoding="async"
            />
        </>
    );
}

export default ProductImage;
