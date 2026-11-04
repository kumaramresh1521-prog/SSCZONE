import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import MainLayoutWrapper from "@/components/MainLayoutWrapper";
import { getPublishedSeoConfig } from "@/lib/seo-store";

export const viewport: Viewport = {
  themeColor: "#1e40af",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const seo = getPublishedSeoConfig();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || seo.canonicalUrl || "https://ssczone.com";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: seo.siteTitle,
      template: seo.titleTemplate || "%s | SSCZone",
    },
    description: seo.metaDescription,
    keywords: seo.keywords,
    authors: [{ name: seo.author }],
    creator: seo.author,
    publisher: "SSCZone",
    manifest: "/manifest.json",
    icons: {
      icon: [
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
      ],
      apple: [{ url: "/icon-192.png" }]
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: baseUrl,
      title: seo.openGraph?.title || seo.siteTitle,
      description: seo.openGraph?.description || seo.metaDescription,
      siteName: "SSCZone",
      images: [
        {
          url: seo.openGraph?.imageUrl || "/icon-512.png",
          width: 1200,
          height: 630,
          alt: seo.siteTitle,
        }
      ]
    },
    twitter: {
      card: (seo.twitter?.card as any) || "summary_large_image",
      title: seo.openGraph?.title || seo.siteTitle,
      description: seo.openGraph?.description || seo.metaDescription,
      site: seo.twitter?.site || "@ssczone",
      creator: seo.twitter?.creator || "@ssczone",
      images: [seo.openGraph?.imageUrl || "/icon-512.png"]
    },
    robots: {
      index: seo.indexing?.index ?? true,
      follow: seo.indexing?.follow ?? true,
      googleBot: {
        index: seo.indexing?.index ?? true,
        follow: seo.indexing?.follow ?? true,
        "max-video-preview": seo.indexing?.maxVideoPreview ?? -1,
        "max-image-preview": (seo.indexing?.maxImagePreview as any) || "large",
        "max-snippet": seo.indexing?.maxSnippet ?? -1,
      },
    },
    verification: {
      google: seo.verification?.google || undefined,
    }
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const seo = getPublishedSeoConfig();
  const adsenseId = seo.verification?.adsenseId || process.env.NEXT_PUBLIC_ADSENSE_ID;
  const googleAnalyticsId = seo.verification?.googleAnalyticsId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": "https://ssczone.com/#organization",
        "name": "SSCZone",
        "url": seo.canonicalUrl || "https://ssczone.com",
        "logo": "https://ssczone.com/icon-512.png",
        "description": seo.metaDescription || "India's #1 Syllabus-Wise SSC Exam Practice & Test Series Portal for SSC CGL, CHSL, CPO, MTS & Railways.",
        "sameAs": ["https://t.me/ssczone"]
      },
      {
        "@type": "WebSite",
        "@id": "https://ssczone.com/#website",
        "url": seo.canonicalUrl || "https://ssczone.com",
        "name": "SSCZone",
        "publisher": { "@id": "https://ssczone.com/#organization" },
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${seo.canonicalUrl || "https://ssczone.com"}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <html lang="en" className={`${plusJakartaSans.variable} scroll-smooth`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {adsenseId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        {googleAnalyticsId && (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${googleAnalyticsId}');`}
            </Script>
          </>
        )}
      </head>
      <body className="min-h-screen w-full max-w-full overflow-x-clip bg-slate-50 text-slate-900 antialiased font-sans selection:bg-blue-600 selection:text-white">
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <MainLayoutWrapper>{children}</MainLayoutWrapper>
      </body>
    </html>
  );
}
