import { useState, useEffect, useCallback } from "react";
import { HomeContentContext } from "./homeContentContext.js";
import { useAuth } from "./authContext.js";
import {
    get_home_content,
    update_home_content_sections,
} from "../database/front_page_queries.js";

// Structural defaults only — every consumer merges its own placeholder copy
// on top of these, this just guarantees `homeContent.<section>` is never
// undefined before the real content has loaded.
const emptyHomeContent = {
    hero_1: {},
    hero_2: {},
    about_us: {},
    stats: {},
    partners: {},
    contact: {},
    about_page: {},
};

export function HomeContentProvider({ children }) {
    const [homeContent, setHomeContent] = useState(emptyHomeContent);
    const [loadingHomeContent, setLoadingHomeContent] = useState(true);
    const { loadingAuth } = useAuth();

    useEffect(() => {
        const fetchContent = async () => {
            const result = await get_home_content();
            if (result) {
                setHomeContent((prev) => ({ ...prev, ...result.data }));
            }
            setLoadingHomeContent(false);
        };
        if (!loadingAuth) {
            fetchContent();
        }
    }, [loadingAuth]);

    // Saves one or more sections ({ contact: {...} }) to the shared document
    // and applies the same update to local state on success.
    const updateSections = useCallback(async (sections) => {
        const result = await update_home_content_sections(sections);
        if (result.success) {
            setHomeContent((prev) => ({ ...prev, ...sections }));
        }
        return result;
    }, []);

    const updateSection = useCallback(
        (section, data) => updateSections({ [section]: data }),
        [updateSections],
    );

    // A section that has never been saved comes back as {} (see
    // emptyHomeContent above) — this tells a consumer whether to show that
    // section's real content or its own placeholder copy.
    const withDefault = useCallback(
        (section, fallback) => {
            const value = homeContent[section];
            return value && Object.keys(value).length > 0 ? value : fallback;
        },
        [homeContent],
    );

    return (
        <HomeContentContext.Provider
            value={{ homeContent, loadingHomeContent, updateSection, updateSections, withDefault }}
        >
            {children}
        </HomeContentContext.Provider>
    );
}
