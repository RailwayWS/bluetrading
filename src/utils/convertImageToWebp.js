// Runs in the browser at upload time so every product photo lands in Storage
// as WebP, regardless of what format the admin's camera/phone produced.
const MAX_DIMENSION = 1600;
const QUALITY = 0.82;

export async function convertImageToWebp(file, { maxDimension = MAX_DIMENSION, quality = QUALITY } = {}) {
    const bitmap = await createImageBitmap(file);

    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    // Some browsers can't encode webp — fall back to the original file rather than blocking the upload.
    if (!blob) return file;

    const newName = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], newName, { type: "image/webp" });
}
