import { useInView } from "react-intersection-observer";

// Shared scroll-reveal pattern: attach `ref` to a section wrapper and append
// `revealClass` to its className. Fires once, well before the element enters
// the viewport, so content is visible by the time a user actually scrolls to it.
export function useReveal() {
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15, rootMargin: "0px 0px -80px 0px" });
    return { ref, revealClass: `reveal ${inView ? "reveal--visible" : ""}` };
}
