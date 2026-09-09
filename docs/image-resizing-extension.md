# Product image resizing (Firebase "Resize Images" extension)

The Products grid and the Details page's "Related Products" grid request a
200×200 thumbnail for every product photo instead of the full-size original.
That thumbnail comes from Firebase's official **Resize Images** extension,
which isn't installed yet — this doc is the setup guide for when you're
ready to turn it on.

Until it's installed, nothing is broken: the app automatically falls back to
the full-size image everywhere a thumbnail isn't available yet (see
[How the app finds a thumbnail](#how-the-app-finds-a-thumbnail) below).

## Prerequisites

The extension deploys a Cloud Function, so your Firebase project needs to be
on the **Blaze** (pay-as-you-go) plan. The free tier's included Cloud
Functions quota covers this kind of workload for a normal product catalog.

## Installing it

1. Firebase Console → your project → **Extensions** → **Explore extensions** → search **"Resize Images"** (publisher: Firebase).
   Or via the CLI: `firebase ext:install firebase/storage-resize-images --project=<your-project-id>`
2. When configuring it, set:
   | Setting | Value | Why |
   |---|---|---|
   | Cloud Storage bucket | your existing default bucket | Same bucket the app already uploads to |
   | Sizes of resized images | `200x200` | Must match what the app requests. You can add more sizes later (e.g. `800x800` for a future larger variant) without breaking anything — the app just won't use them until the code is updated to ask for them. |
   | Cloud Storage path for resized images | leave blank/default | Keeps resized files in the same folder as the original — the app's lookup assumes this |
   | Image type to convert to | leave blank/default | Keeps the original file extension (`.png`, `.jpg`, etc.) — the app's lookup assumes this too |
   | Delete original file | **No** | The full-size original is still used for the Details page hero image and the zoom lightbox |
3. Save. From this point on, every new image uploaded through "Add Product" / "Edit Product" gets a `_200x200` variant generated automatically a few seconds after upload.

## How the app finds a thumbnail

`resolveImageUrl(path, size)` in `src/database/image_queries.js` builds the
resized filename itself, matching the extension's naming convention:

```
products/dam-liner.png  +  "200x200"  →  products/dam-liner_200x200.png
```

If that resized file doesn't exist (not processed yet, or uploaded before
the extension was installed), it transparently falls back to the original
image — so there's no broken-image risk while the extension is catching up
on older products.

## Backfilling existing product photos

The extension only reacts to *new* uploads — it won't retroactively resize
photos that are already in Storage. If you want existing products to get
thumbnails too, either:

- Re-upload the photo through "Edit Product" for each one (simplest, no extra tooling), or
- Ask for a small one-off script that re-uploads each existing image to itself to re-trigger the extension.

## Verifying it worked

1. Add or edit a product with a new photo.
2. In Firebase Console → Storage → `products/`, you should see the original file plus a second file with `_200x200` before the extension, a few seconds later.
3. On the Products page, that product's thumbnail is now the resized file — check Firebase Console → Performance → Custom traces → `product_image_load` (filter by the `context: grid` attribute) to see load times improve for it.

---

## If this extension is ever deprecated or unsupported

Firebase Extensions occasionally get deprecated or replaced by newer
versions. A few things worth knowing:

- **An already-installed extension keeps running.** Deprecating a listing in
  the Extensions marketplace doesn't shut down instances you've already
  installed — under the hood it's just a normal Cloud Function reacting to
  Storage uploads. It'll keep resizing new images until you remove it or
  Google Cloud stops supporting the underlying runtime it's built on
  (rare, and usually announced with a long lead time).
- **If you do need to replace it**, the only thing that matters to this app
  is preserving the naming convention: a resized file living at
  `products/<original-name>_200x200.<original-extension>` next to the
  original. As long as a replacement produces that, **no app code changes
  are needed** — that's the whole reason `resolveImageUrl` derives the
  resized path instead of reading it from a database field.
- Reasonable replacements, in rough order of effort:
  1. **A newer/renamed Firebase extension** doing the same job — just re-point the same config at it.
  2. **Your own small Cloud Function**, triggered on Storage `onFinalize`, using the `sharp` npm package to resize and write back a `_200x200` file. This is a well-understood, ~30-line function — worth asking for if this ever comes up.
  3. **Client-side resizing before upload** (in `AddProductModal`, using a `<canvas>`), so the browser produces the thumbnail at upload time instead of a server-side function. No Cloud Functions dependency at all, but only affects images uploaded after the change — existing ones still need a backfill.
