import { MetadataRoute } from "next";
import { getPublishedSeoConfig } from "@/lib/seo-store";

export default function robots(): MetadataRoute.Robots {
  const seo = getPublishedSeoConfig();
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
        disallow: ["/admin/", "/dashboard/settings", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
