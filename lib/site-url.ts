/**
 * Resuelve la URL base canónica del sitio de forma consistente para:
 * - metadataBase (OpenGraph, Twitter Cards, canonical URLs)
 * - robots.txt y sitemap.xml
 * - JSON-LD Structured Data (Schema.org)
 *
 * Orden de prioridad:
 * 1. NEXT_PUBLIC_SITE_URL (dominio personalizado p.ej. https://auratips.site o https://auratips.auramed.com.co)
 * 2. VERCEL_PROJECT_PRODUCTION_URL (dominio de producción asignado automáticamente por Vercel)
 * 3. VERCEL_URL (URL de despliegue en Vercel)
 * 4. Fallback por defecto en Vercel: https://aura-tips-bundle.vercel.app
 */
export function getSiteUrl(): string {
  const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicitUrl) {
    return explicitUrl.replace(/\/+$/, "");
  }

  const vercelProdUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProdUrl) {
    const withProtocol = vercelProdUrl.startsWith("http")
      ? vercelProdUrl
      : `https://${vercelProdUrl}`;
    return withProtocol.replace(/\/+$/, "");
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    const withProtocol = vercelUrl.startsWith("http")
      ? vercelUrl
      : `https://${vercelUrl}`;
    return withProtocol.replace(/\/+$/, "");
  }

  return "https://aura-tips-bundle.vercel.app";
}
