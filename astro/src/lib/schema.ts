import { SITE_URL } from "@/lib/seo";

export type JsonLdObject = Record<string, unknown>;

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "ToolBite",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search.html?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "ToolBite",
    url: SITE_URL,
    logo: `${SITE_URL}/assets/images/toolbite-logo.png`
  };
}

export function buildWebApplicationSchema(input: {
  name: string;
  url: string;
  description: string;
  category?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${input.url}#webapp`,
    name: input.name,
    url: input.url,
    description: input.description,
    applicationCategory: input.category ?? "UtilityApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    },
    browserRequirements: "Requires JavaScript and a modern browser"
  };
}

export function buildFaqSchema(items: Array<{ question: string; answer: string }>, pageUrl?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(pageUrl ? { "@id": `${pageUrl}#faq` } : {}),
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}

export function buildBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  const finalUrl = items[items.length - 1]?.url;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    ...(finalUrl ? { "@id": `${finalUrl}#breadcrumbs` } : {}),
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function buildHowToSchema(input: {
  name: string;
  description: string;
  steps: string[];
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${input.url}#howto`,
    name: input.name,
    description: input.description,
    url: input.url,
    step: input.steps.map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text
    }))
  };
}

export function dedupeSchemasByType(schemas: JsonLdObject[]): JsonLdObject[] {
  const seen = new Set<string>();
  const out: JsonLdObject[] = [];
  for (const schema of schemas) {
    const type = String(schema["@type"] ?? "");
    const id = String(schema["@id"] ?? "");
    const key = id || type;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(schema);
  }
  return out;
}

export function findDuplicatedSchemaTypes(schemas: JsonLdObject[]): string[] {
  const count = new Map<string, number>();
  for (const schema of schemas) {
    const type = String(schema["@type"] ?? "");
    if (!type) continue;
    count.set(type, (count.get(type) ?? 0) + 1);
  }
  return [...count.entries()].filter(([, value]) => value > 1).map(([type]) => type);
}
