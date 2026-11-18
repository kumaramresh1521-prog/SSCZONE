import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo-store";
import { getStaticPagesConfigAsync, DEFAULT_STATIC_PAGES_CONFIG } from "@/lib/static-pages-store";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/privacy", {
    title: "Privacy Policy — SSCZone",
    description: "Privacy Policy of SSCZone explaining data collection, account privacy, and user data rights.",
  });
}

export const revalidate = 60; // Auto revalidate on edit

export default async function PrivacyPage() {
  const fullConfig = await getStaticPagesConfigAsync();
  const config = fullConfig?.privacy || DEFAULT_STATIC_PAGES_CONFIG.privacy;

  return (
    <div className="min-h-screen bg-gray-50/60">
      <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white py-12 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-amber-400 mb-2" />
          <h1 className="text-3xl font-extrabold md:text-4xl">
            {config.heading || "Privacy Policy"}
          </h1>
          <p className="mt-2 text-xs text-blue-200">
            Last updated: {config.lastUpdated || "January 2026"}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <div
          className="rounded-3xl border border-gray-200 bg-white p-8 md:p-10 shadow-xs space-y-6 text-sm text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: config.contentHtml }}
        />
      </section>
    </div>
  );
}
