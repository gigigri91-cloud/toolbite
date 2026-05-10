export const SITE_URL = "https://toolbite.org";
export const SITE_BRAND = "ToolBite";
export const SITE_LOCALE = "en_US";
export const SITE_TWITTER_HANDLE = "@toolbite";
export const SITE_DEFAULT_OG_IMAGE = "/assets/images/social-preview.jpg";
export const SITE_OG_IMAGE_WIDTH = 1200;
export const SITE_OG_IMAGE_HEIGHT = 630;

const BRAND_TITLE_SUFFIX = ` | ${SITE_BRAND}`;
const TOOL_TITLE_SUFFIX = ` – Free Online Tool${BRAND_TITLE_SUFFIX}`;
const CATEGORY_TITLE_SUFFIX = ` Tools${BRAND_TITLE_SUFFIX}`;
export const HOMEPAGE_TITLE = `${SITE_BRAND} | Free Online Tools for Developers, SEO & Content`;

function endsWithBrandSuffix(title: string): boolean {
  return /\|\s*ToolBite\s*$/i.test(title);
}

/**
 * Format a tool page title following the legacy SEO pattern.
 * Idempotent: if the input already ends with the ToolBite brand suffix, it is
 * returned untouched so authored titles remain authoritative.
 */
export function formatToolPageTitle(name: string): string {
  const clean = String(name || "").trim();
  if (!clean) return SITE_BRAND;
  if (endsWithBrandSuffix(clean)) return clean;
  return `${clean}${TOOL_TITLE_SUFFIX}`;
}

/**
 * Format a category page title. Accepts either a bare label ("Text") or a
 * pre-formatted "Text Tools" string. Idempotent if brand suffix is already
 * present.
 */
export function formatCategoryPageTitle(label: string): string {
  const clean = String(label || "").trim();
  if (!clean) return SITE_BRAND;
  if (endsWithBrandSuffix(clean)) return clean;
  if (/\btools\b/i.test(clean)) return `${clean}${BRAND_TITLE_SUFFIX}`;
  return `${clean}${CATEGORY_TITLE_SUFFIX}`;
}

/**
 * Resolve a relative or absolute URL against the canonical site origin.
 * Used by OG/Twitter components so social scrapers always see absolute URLs.
 */
export function toAbsoluteUrl(value: string): string {
  const trimmed = String(value || "").trim();
  if (!trimmed) return SITE_URL;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return `${SITE_URL}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

export type RobotsDirectives = {
  index: boolean;
  follow: boolean;
  maxSnippet?: number;
  maxImagePreview?: "none" | "standard" | "large";
  maxVideoPreview?: number;
};

export type AdMode = "auto" | "manual" | "off";
export type SchemaType = "WebApplication" | "FAQPage" | "HowTo" | "Article" | "WebPage";

export type PageMetadata = {
  title: string;
  description: string;
  canonicalPath: string;
  canonicalUrl: string;
  keywords: string[];
  robots: RobotsDirectives;
  ogImage: string;
  type: "website" | "article";
  schemaTypes: SchemaType[];
  adMode: AdMode;
  sitemap: boolean;
};

export type MetadataInput = {
  title: string;
  description: string;
  canonicalPath: string;
  keywords?: string[];
  robots?: Partial<RobotsDirectives>;
  ogImage?: string;
  type?: "website" | "article";
  schemaTypes?: SchemaType[];
  adMode?: AdMode;
};

export type ToolMetadataRecord = {
  name: string;
  title: string;
  description?: string;
  desc?: string;
  url: string;
  canonical: string;
  keywords: string[];
  category: string;
  schemaType: SchemaType;
  relatedTools: string[];
  ogImage: string;
  robots: string;
  adMode: AdMode;
};

const DEFAULT_ROBOTS: RobotsDirectives = {
  index: true,
  follow: true,
  maxSnippet: -1,
  maxImagePreview: "large",
  maxVideoPreview: -1
};

export const METADATA_PRESETS = {
  tool: {
    type: "website" as const,
    schemaTypes: ["WebApplication"] as SchemaType[],
    adMode: "auto" as AdMode
  },
  category: {
    type: "website" as const,
    schemaTypes: ["WebPage"] as SchemaType[],
    adMode: "auto" as AdMode
  },
  guide: {
    type: "article" as const,
    schemaTypes: ["HowTo"] as SchemaType[],
    adMode: "auto" as AdMode
  },
  legal: {
    type: "website" as const,
    schemaTypes: ["WebPage"] as SchemaType[],
    adMode: "off" as AdMode
  }
};

export function buildAbsoluteCanonical(pathname: string): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_URL}${normalized}`;
}

export function toRobotsContent(robots: RobotsDirectives): string {
  const base = `${robots.index ? "index" : "noindex"}, ${robots.follow ? "follow" : "nofollow"}`;
  const advanced = [
    robots.maxSnippet !== undefined ? `max-snippet:${robots.maxSnippet}` : null,
    robots.maxImagePreview ? `max-image-preview:${robots.maxImagePreview}` : null,
    robots.maxVideoPreview !== undefined ? `max-video-preview:${robots.maxVideoPreview}` : null
  ].filter(Boolean);
  return [base, ...advanced].join(", ");
}

export function shouldIncludeInSitemap(robots: RobotsDirectives): boolean {
  return robots.index;
}

export function createMetadata(input: MetadataInput): PageMetadata {
  const canonicalUrl = buildAbsoluteCanonical(input.canonicalPath);
  const robots: RobotsDirectives = { ...DEFAULT_ROBOTS, ...(input.robots ?? {}) };
  return {
    title: input.title,
    description: input.description,
    canonicalPath: input.canonicalPath,
    canonicalUrl,
    keywords: input.keywords ?? [],
    robots,
    ogImage: input.ogImage ?? "/assets/images/social-preview.jpg",
    type: input.type ?? "website",
    schemaTypes: input.schemaTypes ?? ["WebPage"],
    adMode: input.adMode ?? "auto",
    sitemap: shouldIncludeInSitemap(robots)
  };
}

export function createToolMetadata(input: Omit<MetadataInput, "type" | "schemaTypes" | "adMode">): PageMetadata {
  return createMetadata({ ...METADATA_PRESETS.tool, ...input });
}

export function createCategoryMetadata(input: Omit<MetadataInput, "type" | "schemaTypes" | "adMode">): PageMetadata {
  return createMetadata({ ...METADATA_PRESETS.category, ...input });
}

export function createGuideMetadata(input: Omit<MetadataInput, "type" | "schemaTypes" | "adMode">): PageMetadata {
  return createMetadata({ ...METADATA_PRESETS.guide, ...input });
}

export function createLegalMetadata(input: Omit<MetadataInput, "type" | "schemaTypes" | "adMode">): PageMetadata {
  return createMetadata({ ...METADATA_PRESETS.legal, ...input });
}

export function validateMetadata(meta: PageMetadata): string[] {
  const issues: string[] = [];
  if (!meta.title?.trim()) issues.push("Missing title");
  if (!meta.description?.trim()) issues.push("Missing description");
  if (!meta.canonicalUrl.startsWith("https://")) issues.push("Canonical must be absolute HTTPS URL");
  if (!meta.canonicalUrl.startsWith(SITE_URL)) issues.push("Canonical must point to toolbite.org");
  if (!meta.schemaTypes.length) issues.push("At least one schema type is required");
  return issues;
}

export function parseRobotsString(value: string): RobotsDirectives {
  const flags = value.toLowerCase();
  return {
    ...DEFAULT_ROBOTS,
    index: flags.includes("noindex") ? false : true,
    follow: flags.includes("nofollow") ? false : true
  };
}

export function createMetadataFromToolRecord(record: ToolMetadataRecord): PageMetadata {
  return createMetadata({
    title: formatToolPageTitle(record.title || record.name),
    description: record.description || record.desc || "",
    canonicalPath: record.url.startsWith("/") ? record.url : `/${record.url}`,
    keywords: record.keywords,
    robots: parseRobotsString(record.robots),
    ogImage: record.ogImage,
    schemaTypes: [record.schemaType],
    adMode: record.adMode,
    type: record.url.startsWith("guides/") ? "article" : "website"
  });
}
