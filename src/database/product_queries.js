import { db } from "./../config/firebase.js";
import { ref, set} from "firebase/database"; 
import { collection, getDocs, addDoc, query, where, limit } from "firebase/firestore";

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
            return;
        }

        console.log
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
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

export async function edit_product(productId, name, price, description, imageURL, category, subcategory, features, additionalInfo) {
    try {
        const productRef = ref(db, 'products/' + productId);
        await set(productRef, {
            name: name,
            price: price,
            description: description,
            image: imageURL,
            category: category,
            subcategory: subcategory,
            features : features,
            additionalInfo : additionalInfo
        });
        console.log("Document updated with ID: ", productId);
    } catch (e) {
        console.error("Error updating document: ", e);
    }
}

export async function get_products() {
    const productsRef = collection(db, 'products');
    const productSnapshot = await getDocs(productsRef);
    const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return productList;
}