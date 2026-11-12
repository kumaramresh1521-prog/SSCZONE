export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(price);
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Resolves relative PYQ images (/images/pyq/...) and paper PDFs (/papers/...)
 * to the Cloudflare R2 CDN public base URL when NEXT_PUBLIC_R2_PUBLIC_URL is set.
 * Falls back cleanly to the local relative path when unset.
 */
export function resolveAssetUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed || /^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:")) {
    return trimmed;
  }
  const base = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "").trim().replace(/\/+$/, "");
  if (base && (trimmed.startsWith("/images/pyq/") || trimmed.startsWith("/papers/"))) {
    return `${base}${trimmed}`;
  }
  return trimmed;
}
