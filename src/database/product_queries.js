import { db } from "./../config/firebase.js";
import {
    doc,
    collection,
    getDocs,
    getDoc,
    addDoc,
    query,
    where,
    limit,
    orderBy,
    startAfter,
    setDoc,
} from "firebase/firestore";


export async function add_product(name, price, description, imageURL, category, subcategory, features, additionalInfo) {
    try {     
        const productsRef = collection(db, "products");
        const existingProductQuery = query(
            productsRef,
            where("name", "==", name),
            limit(1)
        );
        const existingProductSnapshot = await getDocs(existingProductQuery);

        if (!existingProductSnapshot.empty) {
            console.error("A product with this name already exists.");
            return { success: false, error: "Product with this name already exists" };
        }

        const docRef = await addDoc(collection(db, "products"), {
            name: name,
            price: price,
            description: description,
            image: imageURL,
            category: category,
            subcategory: subcategory,
            features : features,
            additionalInfo : additionalInfo
        });
        console.log("Document added with ID: ", docRef.id);
        return { success: true, id: docRef.id };
    } catch (e) {
        console.error("Error adding document: ", e);
        return { success: false, error: e.message };
    }
}

export async function edit_product(productId, name, price, description, imageURL, category, subcategory, features, additionalInfo) {
    try {
        const productRef = doc(db, "products", productId);
        await setDoc(productRef, {
            name: name,
            price: price,
            description: description,
            image: imageURL,
            category: category,
            subcategory: subcategory,
            features : features,
            additionalInfo : additionalInfo
        }, { merge: true });
        console.log("Document updated with ID: ", productId);
    } catch (e) {
        console.error("Error updating document: ", e);
    }
}

export async function add_product_image_Url(productId, imageURL) {
    try{
        const productRef = doc(db, "products", productId);
        await setDoc(productRef, {
            imageUrl: imageURL
        }, { merge: true });
        console.log("Image URL updated for product ID: ", productId);
    } catch (e) {
        console.error("Error updating image URL: ", e);
    }
}

export async function get_products() {
    const productsRef = collection(db, 'products');
    const productSnapshot = await getDocs(productsRef);
    const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return productList;
}

export async function get_products_page(lastVisible = null, pageSize = 40) {
    const productsRef = collection(db, "products");
    const pageQuery = lastVisible
        ? query(
            productsRef,
            orderBy("name"),
            startAfter(lastVisible),
            limit(pageSize),
        )
        : query(productsRef, orderBy("name"), limit(pageSize));

    const snapshot = await getDocs(pageQuery);
    const products = snapshot.docs.map((productDoc) => ({
        id: productDoc.id,
        ...productDoc.data(),
    }));

    return {
        products,
        lastVisible: snapshot.docs[snapshot.docs.length - 1] ?? null,
        hasMore: snapshot.docs.length === pageSize,
    };
}

export async function get_products_by_subcategory_page(
    subcategory,
    lastVisible = null,
    pageSize = 20,
) {
    const productsRef = collection(db, "products");
    const pageQuery = lastVisible
        ? query(
            productsRef,
            where("subcategory", "==", subcategory),
            orderBy("name"),
            startAfter(lastVisible),
            limit(pageSize),
        )
        : query(
            productsRef,
            where("subcategory", "==", subcategory),
            orderBy("name"),
            limit(pageSize),
        );

    const snapshot = await getDocs(pageQuery);
    const products = snapshot.docs.map((productDoc) => ({
        id: productDoc.id,
        ...productDoc.data(),
    }));

    return {
        products,
        lastVisible: snapshot.docs[snapshot.docs.length - 1] ?? null,
        hasMore: snapshot.docs.length === pageSize,
    };
}

export async function get_product_by_id(productId) {
    const productDoc = doc(db, "products", productId);
    const productSnapshot = await getDoc(productDoc);   
    console.log(productSnapshot.data()); 
    return {id: productSnapshot.id, ...productSnapshot.data()};
}