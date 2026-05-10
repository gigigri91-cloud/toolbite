import type { NormalizedTool } from "@/lib/tools";
import { getAllTools, getRelatedTools } from "@/lib/tools";

export type ToolCluster = {
  key: string;
  tools: NormalizedTool[];
};

export function buildToolClusters(): ToolCluster[] {
  const all = getAllTools();
  const map = new Map<string, NormalizedTool[]>();

  for (const tool of all) {
    const key = tool.category;
    const list = map.get(key) ?? [];
    list.push(tool);
    map.set(key, list);
  }

  return [...map.entries()].map(([key, tools]) => ({ key, tools }));
}

export function getContextualRecommendations(url: string, limit = 6): NormalizedTool[] {
  const all = getAllTools();
  const current = all.find((tool) => tool.url === url);
  if (!current) return [];

  const firstPass = getRelatedTools(current, limit);
  if (firstPass.length >= limit) return firstPass.slice(0, limit);

  const needed = limit - firstPass.length;
  const fallback = all
    .filter((tool) => tool.url !== current.url && !firstPass.some((item) => item.url === tool.url))
    .slice(0, needed);

  return [...firstPass, ...fallback];
}

export function buildRelatedCategoryLinks(category: string): string[] {
  return ["text-tools", "developer-tools", "image-tools", "seo-tools"]
    .filter((item) => item !== category)
    .map((item) => `/categories/${item}.html`);
}
