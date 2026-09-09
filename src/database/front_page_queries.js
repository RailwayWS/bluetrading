import { db } from "./../config/firebase.js";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Every editable piece of home-page content (hero, about, stats, partners,
// contact, the "Who We Are" page) lives in one document so it can be fetched
// and saved as a single JSON object instead of one Firestore round trip per section.
const HOME_CONTENT_DOC = "content";

// Doc IDs content used to live under before everything moved into one
// document — kept only so existing Firestore data isn't stranded.
const LEGACY_DOC_IDS = {
    hero_slides: "hero_slides",
    about_us: "about_us",
    stats: "stats",
    partners: "partners",
    contact: "contact",
    about_page: "about_page",
};

async function get_home_page_document(documentId) {
    try {
        const documentRef = doc(db, "home_page", documentId);
        const documentSnapshot = await getDoc(documentRef);

        if (!documentSnapshot.exists()) {
            return null;
        }

        return { id: documentSnapshot.id, data: documentSnapshot.data() };
    } catch (error) {
        console.error(
            `Error fetching home page document ${documentId}:`,
            error,
        );
        return null;
    }
}

// One-time fallback for a project that hasn't been migrated to the combined
// document yet: read the old per-section documents and merge them into the
// same shape get_home_content() returns. Once anything is saved, it's
// written to the combined document and this path is never needed again.
async function get_legacy_home_content() {
    const [heroSlides, aboutUs, stats, partners, contact, aboutPage] =
        await Promise.all([
            get_home_page_document(LEGACY_DOC_IDS.hero_slides),
            get_home_page_document(LEGACY_DOC_IDS.about_us),
            get_home_page_document(LEGACY_DOC_IDS.stats),
            get_home_page_document(LEGACY_DOC_IDS.partners),
            get_home_page_document(LEGACY_DOC_IDS.contact),
            get_home_page_document(LEGACY_DOC_IDS.about_page),
        ]);

    const data = {};
    if (heroSlides) {
        data.hero_1 = heroSlides.data.hero_1;
        data.hero_2 = heroSlides.data.hero_2;
    }
    if (aboutUs) data.about_us = aboutUs.data;
    if (stats) data.stats = stats.data;
    if (partners) data.partners = partners.data;
    if (contact) data.contact = contact.data;
    if (aboutPage) data.about_page = aboutPage.data;

    return Object.keys(data).length > 0 ? { id: HOME_CONTENT_DOC, data } : null;
}

export async function get_home_content() {
    const combined = await get_home_page_document(HOME_CONTENT_DOC);
    if (combined) return combined;
    return get_legacy_home_content();
}

// Merges one or more top-level sections ({ contact: {...} } or
// { about_us: {...}, stats: {...}, partners: {...} }) into the combined
// document without touching any other section.
export async function update_home_content_sections(sections) {
    try {
        const documentRef = doc(db, "home_page", HOME_CONTENT_DOC);
        await setDoc(documentRef, sections, { merge: true });
        return { success: true };
    } catch (error) {
        console.error("Error updating home content:", error);
        return { success: false, error: error.message };
    }
}

export async function update_home_content_section(section, data) {
    return update_home_content_sections({ [section]: data });
}
