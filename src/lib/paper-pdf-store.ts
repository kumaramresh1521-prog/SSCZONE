/**
 * Helper utility for PYQ Paper PDF URLs, Download Permissions & Storage
 */

import { supabase } from "./supabase";
import { resolveAssetUrl } from "./utils";

// Fallback mappings for known previous papers in case DB column is pending migration
export const DEFAULT_PAPER_PDF_MAP: Record<number | string, string> = {
  1: "/papers/ssc-cgl-2025-12-sept-shift-1.pdf",
  "cgl-2025-shift-1": "/papers/ssc-cgl-2025-12-sept-shift-1.pdf",
  4: "/papers/ssc-cgl-2025-12-september-2025-shift-2.pdf",
  "cgl-2025-shift-2": "/papers/ssc-cgl-2025-12-september-2025-shift-2.pdf",
  5: "/papers/ssc-cgl-2025-12-september-2025-shift-3.pdf",
  "cgl-2025-shift-3": "/papers/ssc-cgl-2025-12-september-2025-shift-3.pdf",
};

/**
 * Returns whether candidates are allowed to download the PDF for this paper
 */
export function isPaperDownloadAllowed(paper: { id: number; allow_download?: boolean; test_type?: string }): boolean {
  // 1. Client-side localStorage override (gives instant authoritative control in admin & browser)
  if (typeof window !== "undefined") {
    const disabled = localStorage.getItem(`ssczone_paper_dl_disabled_${paper.id}`);
    if (disabled === "true") return false;
    const enabled = localStorage.getItem(`ssczone_paper_dl_enabled_${paper.id}`);
    if (enabled === "true") return true;
  }

  // 2. Direct DB check on test_type: 'mock' means CBT Mock Test Only (Download Disabled)
  if (paper.test_type === "mock") {
    return false;
  }

  // 3. Direct DB check on allow_download column
  if (typeof paper.allow_download === "boolean") {
    return paper.allow_download;
  }

  return true;
}

/**
 * Toggles download permissions for candidates on this paper
 */
export async function setPaperDownloadAllowed(paperId: number, allowed: boolean): Promise<boolean> {
  // 1. Sync localStorage for immediate zero-lag client response
  if (typeof window !== "undefined") {
    if (allowed) {
      localStorage.removeItem(`ssczone_paper_dl_disabled_${paperId}`);
      localStorage.setItem(`ssczone_paper_dl_enabled_${paperId}`, "true");
    } else {
      localStorage.setItem(`ssczone_paper_dl_disabled_${paperId}`, "true");
      localStorage.removeItem(`ssczone_paper_dl_enabled_${paperId}`);
    }
    window.dispatchEvent(new CustomEvent("ssczone-paper-settings-changed", { detail: { paperId, allowed } }));
  }

  // 2. Call server-side API (uses Service Role to update test_type & disk store)
  try {
    const res = await fetch("/api/admin/papers/toggle-download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paperId, allowDownload: allowed }),
    });
    return res.ok;
  } catch {
    return true;
  }
}

/**
 * Returns whether dynamic translation / bilingual mode during exam is enabled for this paper
 */
export function isPaperTranslatorAllowed(paper?: { id: number; allow_translation?: boolean } | null): boolean {
  if (!paper) return true;

  if (typeof paper.allow_translation === "boolean") {
    return paper.allow_translation;
  }

  if (typeof window !== "undefined") {
    const disabled = localStorage.getItem(`ssczone_paper_translator_disabled_${paper.id}`);
    if (disabled === "true") return false;
    const enabled = localStorage.getItem(`ssczone_paper_translator_enabled_${paper.id}`);
    if (enabled === "true") return true;
  }

  return true; // Default: bilingual / translator enabled
}

/**
 * Toggles translator permission during exam for candidates on this paper
 */
export async function setPaperTranslatorAllowed(paperId: number, allowed: boolean): Promise<boolean> {
  if (typeof window !== "undefined") {
    if (allowed) {
      localStorage.removeItem(`ssczone_paper_translator_disabled_${paperId}`);
      localStorage.setItem(`ssczone_paper_translator_enabled_${paperId}`, "true");
    } else {
      localStorage.setItem(`ssczone_paper_translator_disabled_${paperId}`, "true");
      localStorage.removeItem(`ssczone_paper_translator_enabled_${paperId}`);
    }
    window.dispatchEvent(new CustomEvent("ssczone-paper-settings-changed", { detail: { paperId, allowTranslation: allowed } }));
  }

  try {
    const res = await fetch("/api/papers/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paperId, allowTranslation: allowed }),
    });
    return res.ok;
  } catch {
    return true;
  }
}

/**
 * Returns the best available PDF URL for a given paper record
 */
export function getPaperPdfUrl(paper: { id: number; title?: string; pdf_url?: string }): string | null {
  if (paper.pdf_url && paper.pdf_url.trim() !== "") {
    return resolveAssetUrl(paper.pdf_url.trim());
  }

  // Check client custom override
  if (typeof window !== "undefined") {
    const custom = localStorage.getItem(`ssczone_custom_paper_pdf_${paper.id}`);
    if (custom && custom.trim()) return resolveAssetUrl(custom.trim());
  }
  
  // Check default mapping by ID
  if (DEFAULT_PAPER_PDF_MAP[paper.id]) {
    return resolveAssetUrl(DEFAULT_PAPER_PDF_MAP[paper.id]);
  }

  // Check matching by title keywords
  const t = (paper.title || "").toLowerCase();
  const cglMatch = t.match(/(202\d).*?(?:held on\s+)?(\d{1,2})\s+([a-z]+)\s+(202\d)\s+shift[\s\-]*(\d)/i);
  if (cglMatch) {
    return resolveAssetUrl(`/papers/ssc-cgl-${cglMatch[1]}-${cglMatch[2]}-${cglMatch[3]}-${cglMatch[4]}-shift-${cglMatch[5]}.pdf`);
  }
  if ((t.includes("2025") || t.includes("12 sept")) && t.includes("shift 3")) {
    return resolveAssetUrl("/papers/ssc-cgl-2025-12-september-2025-shift-3.pdf");
  }
  if ((t.includes("2025") || t.includes("12 sept")) && t.includes("shift 2")) {
    return resolveAssetUrl("/papers/ssc-cgl-2025-12-september-2025-shift-2.pdf");
  }
  if (t.includes("cgl") && (t.includes("2025") || t.includes("12 sept"))) {
    return resolveAssetUrl("/papers/ssc-cgl-2025-12-sept-shift-1.pdf");
  }

  return null;
}

/**
 * Sets a custom PDF URL for a paper
 */
export async function setPaperPdfUrl(paperId: number, pdfUrl: string): Promise<boolean> {
  if (typeof window !== "undefined") {
    localStorage.setItem(`ssczone_custom_paper_pdf_${paperId}`, pdfUrl);
    window.dispatchEvent(new CustomEvent("ssczone-paper-settings-changed", { detail: { paperId, pdfUrl } }));
  }

  try {
    const { error } = await supabase
      .from("previous_papers")
      .update({ pdf_url: pdfUrl })
      .eq("id", paperId);

    if (error && !error.message.includes("pdf_url")) {
      console.warn("Could not save pdf_url to DB:", error.message);
    }
    return true;
  } catch {
    return true;
  }
}

/**
 * Uploads a PYQ Paper PDF to Supabase Storage 'papers' bucket and returns its public URL
 */
export async function uploadPaperPdf(file: File, customFileName?: string): Promise<{ url: string | null; error: string | null }> {
  try {
    if (!file || file.type !== "application/pdf") {
      return { url: null, error: "Only PDF files are supported" };
    }

    const cleanName = customFileName || `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const { data, error } = await supabase.storage
      .from("papers")
      .upload(cleanName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      return { url: null, error: error.message };
    }

    const { data: publicData } = supabase.storage
      .from("papers")
      .getPublicUrl(data.path);

    return { url: publicData.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err.message || "Failed to upload PDF" };
  }
}
