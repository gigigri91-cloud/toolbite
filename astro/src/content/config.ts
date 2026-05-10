import { defineCollection, z } from "astro:content";

const tools = defineCollection({
  type: "content",
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    category: z.string()
  })
});

const guides = defineCollection({
  type: "content",
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    description: z.string()
  })
});

const categories = defineCollection({
  type: "content",
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    description: z.string()
  })
});

export const collections = { tools, guides, categories };
