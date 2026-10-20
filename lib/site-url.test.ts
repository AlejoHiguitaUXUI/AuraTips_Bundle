import { describe, it, expect, afterEach } from "vitest";
import { getSiteUrl } from "./site-url";

describe("getSiteUrl()", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("prioriza NEXT_PUBLIC_SITE_URL eliminando barras finales", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://auratips.site///";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "aura-tips-bundle.vercel.app";
    expect(getSiteUrl()).toBe("https://auratips.site");
  });

  it("usa VERCEL_PROJECT_PRODUCTION_URL con https cuando NEXT_PUBLIC_SITE_URL no está definido", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "aura-tips-bundle.vercel.app";
    expect(getSiteUrl()).toBe("https://aura-tips-bundle.vercel.app");
  });

  it("hace fallback a https://aura-tips-bundle.vercel.app cuando no hay variables de entorno", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.VERCEL_URL;
    expect(getSiteUrl()).toBe("https://aura-tips-bundle.vercel.app");
  });
});
