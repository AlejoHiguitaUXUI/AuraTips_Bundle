import type { MetadataRoute } from "next";
import { CLINICAL_PROCEDURES } from "@/lib/clinical-data";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

const STATIC_BASELINE_DATE = new Date("2026-10-01T00:00:00.000Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: STATIC_BASELINE_DATE,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/procedimientos`,
      lastModified: STATIC_BASELINE_DATE,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  let slugs = CLINICAL_PROCEDURES.map((p) => ({
    slug: p.slug,
    updated_at: STATIC_BASELINE_DATE,
  }));

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("courses")
      .select("slug, title, updated_at")
      .eq("status", "published");

    if (data && data.length > 0) {
      const map = new Map<string, Date>();
      slugs.forEach((s) => map.set(s.slug, s.updated_at));
      data.forEach((d) => {
        const slugLower = (d.slug || "").toLowerCase();
        const titleLower = (d.title || "").toLowerCase();
        if (!slugLower.includes("playwright") && !titleLower.includes("playwright")) {
          map.set(d.slug, d.updated_at ? new Date(d.updated_at) : STATIC_BASELINE_DATE);
        }
      });
      slugs = Array.from(map.entries()).map(([slug, updated_at]) => ({
        slug,
        updated_at,
      }));
    }
  } catch {
    // fallback a los procedimientos clínicos locales
  }

  const procedurePages: MetadataRoute.Sitemap = slugs
    .filter((item) => !item.slug.toLowerCase().includes("playwright"))
    .map((item) => ({
      url: `${baseUrl}/procedimientos?proc=${encodeURIComponent(item.slug)}`,
      lastModified: item.updated_at,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  return [...staticPages, ...procedurePages];
}

