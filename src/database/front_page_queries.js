import { db } from "./../config/firebase.js";
import {
    doc,
    getDoc,
    setDoc,
} from "firebase/firestore";


async function get_home_page_document(documentId) {

    try {
        const documentRef = doc(db, "home_page", documentId);
        const documentSnapshot = await getDoc(documentRef);

        if (!documentSnapshot.exists()) {
            return null;
        }

    console.log(`Fetched home page document ${documentId}:`, documentSnapshot.data());
        return { id: documentSnapshot.id, data: documentSnapshot.data() };
    } catch (error) {
        console.error(`Error fetching home page document ${documentId}:`, error);
        return null;
    }
}

async function update_home_page_document(documentId, data) {
    try {
        const documentRef = doc(db, "home_page", documentId);
        await setDoc(documentRef, data);
        return { success: true };
    } catch (error) {
        console.error(`Error updating home page document ${documentId}:`, error);
        return { success: false, error: error.message };
    }
}

export async function get_about_us() {
    return get_home_page_document("about_us");
}

export async function update_about_us(data) {

    return update_home_page_document("about_us", data);

}

export async function get_contact() {
    return get_home_page_document("contact");
}

export async function update_contact(data) {
    return update_home_page_document("contact", data);
}

export async function get_partners() {
    return get_home_page_document("partners");
}

export async function update_partners(data) {
    return update_home_page_document("partners", data);
}

export async function get_stats() {
    return get_home_page_document("stats");
}

export async function update_stats(data) {
    return update_home_page_document("stats", data);
}

export async function get_hero_1() {
    return get_home_page_document("hero_1");
}

export async function update_hero_1(data) {
    return update_home_page_document("hero_1", data);
}

export async function get_hero_2() {
    return get_home_page_document("hero_2");
}

export async function update_hero_2(data) {
    return update_home_page_document("hero_2", data);
}

export async function get_hero_slides() {
    return get_home_page_document("hero_slides");
}

export async function update_hero_slides(data) {
    return update_home_page_document("hero_slides", data);
}