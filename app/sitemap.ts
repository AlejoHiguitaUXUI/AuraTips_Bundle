import type { MetadataRoute } from "next";
import { CLINICAL_PROCEDURES } from "@/lib/clinical-data";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://auratips.io";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/procedimientos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  let slugs = CLINICAL_PROCEDURES.map((p) => ({ slug: p.slug, updated_at: new Date() }));

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("courses")
      .select("slug, updated_at")
      .eq("status", "published");

    if (data && data.length > 0) {
      const map = new Map<string, Date>();
      slugs.forEach((s) => map.set(s.slug, s.updated_at));
      data.forEach((d) => map.set(d.slug, d.updated_at ? new Date(d.updated_at) : new Date()));
      slugs = Array.from(map.entries()).map(([slug, updated_at]) => ({ slug, updated_at }));
    }
  } catch {
    // fallback a los procedimientos clínicos locales
  }

  const procedurePages: MetadataRoute.Sitemap = slugs.map((item) => ({
    url: `${baseUrl}/procedimientos/${item.slug}`,
    lastModified: item.updated_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...procedurePages];
}
