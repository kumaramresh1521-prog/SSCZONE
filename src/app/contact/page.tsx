import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo-store";
import { getStaticPagesConfigAsync, DEFAULT_STATIC_PAGES_CONFIG } from "@/lib/static-pages-store";
import ContactClient from "./ContactClient";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/contact", {
    title: "Contact SSCZone Support — Helpline & Assistance",
    description: "Contact SSCZone customer support team via email, telegram, or inquiry form for exam passes and test series questions.",
    keywords: ["Contact SSCZone", "SSCZone Helpline", "SSCZone Customer Support", "SSC Test Series Support"],
  });
}

export const revalidate = 60; // Auto revalidate on edit

export default async function ContactPage() {
  const fullConfig = await getStaticPagesConfigAsync();
  const config = fullConfig?.contact || DEFAULT_STATIC_PAGES_CONFIG.contact;

  return <ContactClient config={config} />;
}
