import { MetadataRoute } from "next";
import { getPublishedSeoConfigAsync } from "@/lib/seo-store";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getPublishedSeoConfigAsync();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || seo.canonicalUrl || "https://ssczone.com";
  const shouldIndex = seo.indexing?.index ?? true;

  if (!shouldIndex) {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: ["/"],
        },
      ],
      sitemap: `${baseUrl}/sitemap.xml`,
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/settings", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
