/** WOW terminal palette — category accents (slug → hex). */
export const CATEGORY_COLORS: Record<string, string> = {
  "developer-tools": "#4d9fff",
  "text-tools": "#a855f7",
  "image-tools": "#2dd4bf",
  "seo-tools": "#f5a623"
};

/** Per-tool top border / hero accent (slug from `tools/{slug}.html`). */
export const TOOL_COLORS: Record<string, string> = {
  "json-formatter": "#4d9fff",
  "jwt-decoder": "#818cf8",
  "uuid-generator": "#a855f7",
  "base64-encoder": "#22d3ee",
  "hash-generator": "#2dd4bf",
  "password-generator": "#f5a623",
  "url-encoder": "#facc15",
  "qr-generator": "#ec4899",
  "csv-to-json": "#f87171",
  "word-counter": "#4ade80",
  "find-replace": "#4d9fff",
  "case-converter": "#a855f7",
  "lorem-ipsum": "#2dd4bf",
  "text-to-slug": "#f5a623",
  "image-compressor": "#ec4899",
  "color-palette-generator": "#22d3ee",
  "read-time-calculator": "#facc15",
  "sort-text-lines": "#4ade80",
  "remove-duplicate-lines": "#818cf8",
  "remove-extra-spaces": "#f87171"
};

const DEFAULT_TOOL = "#4d9fff";
const DEFAULT_CATEGORY = "#4d9fff";

export function toolSlugFromUrl(url: string): string {
  return String(url || "")
    .replace(/^tools\//, "")
    .replace(/\.html$/i, "")
    .trim();
}

export function getToolAccentFromUrl(url: string): string {
  const slug = toolSlugFromUrl(url);
  return TOOL_COLORS[slug] ?? DEFAULT_TOOL;
}

export function getToolAccentFromSlug(slug: string): string {
  return TOOL_COLORS[slug] ?? DEFAULT_TOOL;
}

export function getCategoryAccent(slug: string): string {
  return CATEGORY_COLORS[slug] ?? DEFAULT_CATEGORY;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "").trim();
  if (h.length !== 6) return { r: 77, g: 159, b: 255 };
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16)
  };
}
