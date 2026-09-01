const imageModules = import.meta.glob("../assets/images/**/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
});

const normalizedImages = new Map(
  Object.entries(imageModules).map(([path, url]) => [path.replaceAll("\\", "/").toLowerCase(), url]),
);

export const DEFAULT_TRAVEL_IMAGE = normalizedImages.get("../assets/images/destinations/pexels/seoul.jpg")
  || normalizedImages.get("../assets/images/travel_kit.webp")
  || "";

const isDirectImageUrl = (value) => /^(https?:|data:|blob:)/i.test(value) || value.startsWith("/");

export function resolveImageUrl(imagePath, fallback = DEFAULT_TRAVEL_IMAGE) {
  if (!imagePath) return fallback;
  const value = String(imagePath).trim().replaceAll("\\", "/");
  if (isDirectImageUrl(value)) return value;

  const relativePath = value
    .replace(/^\.\.\/assets\/images\//i, "")
    .replace(/^src\/assets\/images\//i, "")
    .replace(/^assets\/images\//i, "")
    .replace(/^img\//i, "");
  return normalizedImages.get(`../assets/images/${relativePath}`.toLowerCase()) || fallback;
}

export function useImageFallback(event, fallback = DEFAULT_TRAVEL_IMAGE) {
  const image = event.currentTarget;
  if (!fallback || image.dataset.fallbackApplied === "true") return;
  image.dataset.fallbackApplied = "true";
  image.src = fallback;
}
