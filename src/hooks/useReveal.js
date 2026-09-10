import { useEffect, useRef } from "react";
import "../styles/motion.scss";

// Visible by default; only hide observed content when motion is available.
export function useReveal(selector) {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!root || media.matches || !("IntersectionObserver" in window)) return;
    const targets = selector ? [...root.querySelectorAll(selector)] : [root];
    const reveal = (target) => {
      target.dataset.reveal = "visible";
      observer.unobserve(target);
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) reveal(entry.target); });
    }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });
    targets.forEach((target) => {
      target.dataset.reveal = "pending";
      observer.observe(target);
    });
    const showAll = () => { if (media.matches) targets.forEach(reveal); };
    const showFocused = (event) => targets.forEach((target) => {
      if (target.contains(event.target)) reveal(target);
    });
    media.addEventListener("change", showAll);
    root.addEventListener("focusin", showFocused);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", showAll);
      root.removeEventListener("focusin", showFocused);
      targets.forEach((target) => delete target.dataset.reveal);
    };
  }, [selector]);
  return ref;
}
