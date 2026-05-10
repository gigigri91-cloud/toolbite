import fs from "node:fs";
import path from "node:path";

export type ToolDataEntry = {
  name: string;
  title?: string;
  desc: string;
  description?: string;
  url: string;
  canonical?: string;
  icon?: string;
  tags?: string;
  keywords?: string[];
  category?: string;
  schemaType?: string;
  relatedTools?: string[];
  ogImage?: string;
  robots?: string;
  adMode?: string;
};

export type NormalizedTool = ToolDataEntry & {
  title: string;
  description: string;
  keywords: string[];
  tags: string;
  category: string;
  createdOrder: number;
};

let cache: NormalizedTool[] | null = null;

function decodeHtmlEntities(value: string): string {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function loadRawTools(): ToolDataEntry[] {
  const toolsPath = path.resolve(process.cwd(), "..", "data", "tools.json");
  const content = fs.readFileSync(toolsPath, "utf8");
  const parsed = JSON.parse(content);
  return Array.isArray(parsed) ? parsed : [];
}

export function getAllTools(): NormalizedTool[] {
  if (cache) return cache;
  const list = loadRawTools();
  cache = list.map((entry, index) => ({
    ...entry,
    name: decodeHtmlEntities(entry.name),
    title: decodeHtmlEntities(entry.title || entry.name),
    desc: decodeHtmlEntities(entry.desc || ""),
    description: decodeHtmlEntities(entry.description || entry.desc || ""),
    keywords: Array.isArray(entry.keywords)
      ? entry.keywords.map((item) => decodeHtmlEntities(String(item)))
      : decodeHtmlEntities(String(entry.tags || "")).split(" ").filter(Boolean),
    tags: decodeHtmlEntities(String(entry.tags || "")),
    category: entry.category || inferCategory(entry.url),
    createdOrder: index
  }));
  return cache;
}

function inferCategory(url: string): string {
  if (url.startsWith("guides/")) return "guides";
  return "other";
}

export function getCategoryTools(slug: string): NormalizedTool[] {
  return getAllTools().filter((tool) => tool.category === slug);
}

export function getRecentlyAdded(limit = 6): NormalizedTool[] {
  return getAllTools().slice(-limit).reverse();
}

export function getPopularTools(limit = 6): NormalizedTool[] {
  return [...getAllTools()]
    .sort((a, b) => scoreTool(b) - scoreTool(a))
    .slice(0, limit);
}

export function getTrendingTools(limit = 6): NormalizedTool[] {
  return [...getAllTools()]
    .sort((a, b) => trendScore(b) - trendScore(a))
    .slice(0, limit);
}

function scoreTool(tool: NormalizedTool): number {
  return tool.keywords.length * 2 + (tool.relatedTools?.length || 0) + (tool.tags?.split(" ").length || 0);
}

function trendScore(tool: NormalizedTool): number {
  const recencyBoost = Math.max(0, tool.createdOrder - (getAllTools().length - 12));
  return scoreTool(tool) + recencyBoost;
}

export function getRelatedTools(target: NormalizedTool, limit = 4): NormalizedTool[] {
  return getAllTools()
    .filter((tool) => tool.url !== target.url)
    .map((tool) => ({ tool, score: similarityScore(target, tool) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.tool);
}

export function getCategoryRelatedCategories(slug: string): string[] {
  const categories = ["text-tools", "developer-tools", "image-tools", "seo-tools"];
  return categories.filter((cat) => cat !== slug);
}

function similarityScore(a: NormalizedTool, b: NormalizedTool): number {
  let score = 0;
  if (a.category === b.category) score += 3;
  const keyA = new Set(a.keywords.map((x) => x.toLowerCase()));
  for (const k of b.keywords) {
    if (keyA.has(k.toLowerCase())) score += 1;
  }
  const tagsA = new Set(a.tags.toLowerCase().split(" ").filter(Boolean));
  for (const t of b.tags.toLowerCase().split(" ").filter(Boolean)) {
    if (tagsA.has(t)) score += 0.5;
  }
  return score;
}
