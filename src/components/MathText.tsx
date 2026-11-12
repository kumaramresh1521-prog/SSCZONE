import React, { memo, useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { resolveAssetUrl } from "@/lib/utils";

// High-speed In-Memory Cache for KaTeX and Math Formatting (Prevents repeated parsing across renders)
const mathRenderCache = new Map<string, string>();
const MAX_CACHE_SIZE = 8000;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function fraction(numerator: string, denominator: string) {
  return '<span class="ssc-math-fraction"><span>' + numerator + "</span><span>" + denominator + "</span></span>";
}

function radical(symbol: string, value: string) {
  return '<span class="ssc-math-radical"><span class="ssc-math-radical-symbol">' + symbol + '</span><span class="ssc-math-radicand">' + value + "</span></span>";
}

function isTeXInlineMath(value: string) {
  const trimmed = value.trim();
  if (!trimmed || /[#@%&]/.test(trimmed) || /[\u0900-\u097F]/.test(trimmed)) return false;
  if (/\\[A-Za-z]+/.test(trimmed)) return true;
  if (/\b(?:where|then|means|if|and|or|is|are|the|of|to|for)\b/i.test(trimmed)) return false;
  return /^[0-9A-Za-z\s+\-*/=^()[\]{}.,<>|:;!?]+$/.test(trimmed);
}

function renderImageTag(src: string, alt: string): string {
  const cleanAlt = (alt || "Figure").trim() || "Figure";
  const resolvedSrc = escapeHtml(resolveAssetUrl(src));
  if (/^inline\b/i.test(cleanAlt)) {
    return (
      '<span class="inline-block max-w-full overflow-x-auto align-middle">' +
      `<img src="${resolvedSrc}" alt="${cleanAlt}" data-img-role="inline" loading="eager" decoding="async" class="inline-block max-w-full w-auto h-auto rounded bg-white px-1 py-0.5 align-middle" style="max-height: 76px; max-width: min(100%, 660px);" />` +
      "</span>"
    );
  }
  if (/^option\b/i.test(cleanAlt)) {
    return (
      '<span class="inline-block max-w-full align-middle">' +
      `<img src="${resolvedSrc}" alt="${cleanAlt}" data-img-role="option" loading="eager" decoding="async" class="inline-block max-w-full w-auto h-auto rounded-md bg-white p-0.5 align-middle" style="max-height: 84px; max-width: min(100%, 460px);" />` +
      "</span>"
    );
  }
  return (
    '<span class="my-1.5 block max-w-full overflow-x-auto align-middle">' +
    `<img src="${resolvedSrc}" alt="${cleanAlt}" data-img-role="figure" loading="eager" decoding="async" class="block max-w-full w-auto h-auto rounded-lg border border-slate-200/80 bg-white p-1" style="max-height: 360px; max-width: min(100%, 980px);" />` +
    "</span>"
  );
}

// Convert common pasted math notation into safe, readable HTML. Full TeX remains supported
// through $...$, \(...\), \[...\], and $$...$$ delimiters below.
function formatRawMathText(plainText: string): string {
  if (!plainText) return "";
  // Clean whitespace: trim ends and collapse excessive blank lines
  let clean = plainText.trim();
  clean = clean.replace(/(\r?\n\s*){2,}/g, "\n\n");

  let formatted = escapeHtml(clean);

  // 1. Convert newlines to clean line breaks (inline-safe for span rendering)
  formatted = formatted.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  formatted = formatted.replace(/\n\n+/g, '<span class="block my-1.5"></span>');
  formatted = formatted.replace(/\n/g, '<span class="block my-0.5"></span>');

  // 2. Normalize the minus copied from PDFs and convert unicode superscripts.
  formatted = formatted.replace(/[−–—]/g, "-");
  const superscriptMap: Record<string, string> = {
    "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
    "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
    "⁺": "+", "⁻": "-", "⁼": "=", "⁽": "(", "⁾": ")",
    "ⁿ": "n", "ˣ": "x", "ʸ": "y"
  };
  formatted = formatted.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿˣʸ]/g, (match) => `<sup>${superscriptMap[match] || match}</sup>`);

  // 3. Roots copied as √, ∛, sqrt(...), or cbrt(...).
  formatted = formatted.replace(/(?:√|sqrt)\s*\(([^()\n]+)\)/gi, (_match, value) => radical("√", value));
  formatted = formatted.replace(/(?:∛|cbrt)\s*\(([^()\n]+)\)/gi, (_match, value) => radical("∛", value));
  formatted = formatted.replace(/√\s*([A-Za-z0-9]+)/g, (_match, value) => radical("√", value));
  formatted = formatted.replace(/∛\s*([A-Za-z0-9]+)/g, (_match, value) => radical("∛", value));

  // 4. Plain numeric fractions such as 3/4, -5/8, or bracketed algebraic terms (x)/(y).
  // IMPORTANT: NEVER match single letters across words like and/or, Energy / ऊर्जा, True/False, or dates.
  formatted = formatted.replace(
    /(^|[^A-Za-z0-9_/:])(-?\d+)\s*\/\s*\(([^()\n]+)\)/g,
    (_match, prefix, numerator, denominator) => prefix + fraction(numerator, denominator)
  );
  formatted = formatted.replace(
    /(^|[^A-Za-z0-9_/:])(-?\d+)\s*\/\s*(\d+)(?![A-Za-z0-9_/])/g,
    (_match, prefix, numerator, denominator) => prefix + fraction(numerator, denominator)
  );

  // 5. Caret notation supports spaces, bracketed bases, long exponents, and negative powers.
  formatted = formatted.replace(
    /(\([^()<>\n]+\)|\[[^\[\]<>\n]+\]|\{[^{}<>\n]+\}|[A-Za-z0-9]+)\s*\^\s*(\{([^{}<>\n]+)\}|\(([^()<>\n]+)\)|[+-]?\d+|[A-Za-z])(?![A-Za-z0-9])/g,
    (_match, base, exponent, bracedExponent, parenthesizedExponent) => {
      const cleanExponent = bracedExponent || parenthesizedExponent || exponent;
      return base + "<sup>" + cleanExponent + "</sup>";
    }
  );

  // 6. Convert multiplication asterisks only when they sit between math terms.
  formatted = formatted.replace(/([0-9A-Za-z)]|<\/sup>)\s*\*\s*(?=[0-9A-Za-z(])/g, "$1 × ");

  // 7. Convert raw LaTex fractions pasted without math delimiters.
  formatted = formatted.replace(/\\(?:d?frac|tfrac)\{([^{}\n]+)\}\{([^{}\n]+)\}/g, (_match, numerator, denominator) => fraction(numerator, denominator));

  // 8. Convert math arrows & symbol notations.
  formatted = formatted.replace(/=&gt;|==&gt;|->|-->/g, ' ➔ ');
  formatted = formatted.replace(/\b(?:therefore|Therefore)\b/g, '∴');
  formatted = formatted.replace(/\b(?:because|Because)\b/g, '∵');

  // 9. Convert image tags/markdown: ![alt](url) or [Image: url] or raw image URLs (supports both relative /path and http(s)://)
  formatted = formatted.replace(
    /!\[(.*?)\]\(([^\s)]+)\)/gi,
    (_match, alt, src) => renderImageTag(src, alt)
  );
  formatted = formatted.replace(
    /\[Image:\s*([^\s\]]+)\]/gi,
    (_match, src) => renderImageTag(src, "Figure")
  );
  formatted = formatted.replace(
    /&lt;img\s+[^&]*?src=(?:&quot;|&#039;|")([^"'\s&]+)(?:&quot;|&#039;|")[^&]*?&gt;/gi,
    (_match, src) => renderImageTag(src, "Figure")
  );
  formatted = formatted.replace(
    /&lt;u&gt;([\s\S]*?)&lt;\/u&gt;/gi,
    '<u class="underline decoration-2 underline-offset-4 font-semibold">$1</u>'
  );

  return formatted;
}

function renderMath(text: string): string {
  // Check cache first for 0ms instantaneous response
  const cached = mathRenderCache.get(text);
  if (cached !== undefined) return cached;

  // Ultra-fast path: If text is pure plain text without any math or formatting tokens
  if (
    !text.includes("$") &&
    !text.includes("\\") &&
    !text.includes("^") &&
    !text.includes("/") &&
    !text.includes("√") &&
    !text.includes("∛") &&
    !text.includes("![") &&
    !text.includes("[Image:") &&
    !text.includes("<img") &&
    !text.includes("<u>") &&
    !text.includes("\n") &&
    !/[⁰¹²³⁴⁵⁶⁷⁸⁹−–—]/.test(text)
  ) {
    const escaped = escapeHtml(text);
    if (mathRenderCache.size >= MAX_CACHE_SIZE) {
      mathRenderCache.clear();
    }
    mathRenderCache.set(text, escaped);
    return escaped;
  }

  // Single dollar signs are also common reasoning operators in PYQ content, so only
  // accept a pair when its contents look like an actual TeX/math expression.
  const delimiterRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$(?!\s)(?:\\.|[^\$\\])+?(?<!\s)\$)/g;
  const parts = text.split(delimiterRegex);

  const html = parts
    .map((part) => {
      if (!part) return "";

      let math = "";
      let displayMode = false;

      if (part.startsWith("$$") && part.endsWith("$$") && part.length > 4) {
        math = part.slice(2, -2);
        displayMode = true;
      } else if (part.startsWith("\\[") && part.endsWith("\\]") && part.length > 4) {
        math = part.slice(2, -2);
        displayMode = true;
      } else if (part.startsWith("\\(") && part.endsWith("\\)") && part.length > 4) {
        math = part.slice(2, -2);
      } else if (
        part.startsWith("$") &&
        part.endsWith("$") &&
        part.length > 2 &&
        !part.startsWith("$$") &&
        isTeXInlineMath(part.slice(1, -1))
      ) {
        math = part.slice(1, -1);
      }

      if (math) {
        try {
          return katex.renderToString(math.trim(), {
            throwOnError: false,
            displayMode,
          });
        } catch {
          return formatRawMathText(part);
        }
      }

      return formatRawMathText(part);
    })
    .join("");

  if (mathRenderCache.size >= MAX_CACHE_SIZE) {
    mathRenderCache.clear();
  }
  mathRenderCache.set(text, html);
  return html;
}

const MathText = memo(function MathText({ text, className = "" }: { text?: string | null; className?: string }) {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const html = text ? renderMath(text) : "";

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const imgs = root.querySelectorAll<HTMLImageElement>("img[data-img-role]");
    const adjust = (img: HTMLImageElement) => {
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      if (!nw || !nh) return;
      const role = img.getAttribute("data-img-role");
      // Fit wide single-line sentence/equation PNGs inside container when legible (>=12px tall),
      // and only fall back to horizontal scroll on narrow screens that would crush text below 12px.
      if ((role === "figure" || role === "inline") && nh <= 48 && nw > 400) {
        const availW = img.parentElement?.clientWidth || root.clientWidth || 0;
        const projectedH = availW > 0 && nw > availW ? (nh * availW) / nw : nh;
        if (projectedH < 12) {
          img.style.maxWidth = "none";
        }
      }
    };
    const handlers: Array<[HTMLImageElement, () => void]> = [];
    imgs.forEach((img) => {
      if (img.complete) {
        adjust(img);
      } else {
        const onLoad = () => adjust(img);
        img.addEventListener("load", onLoad, { once: true });
        handlers.push([img, onLoad]);
      }
    });
    return () => {
      handlers.forEach(([img, fn]) => img.removeEventListener("load", fn));
    };
  }, [html]);

  if (!text) return null;
  return <span ref={containerRef} className={className} dangerouslySetInnerHTML={{ __html: html }} />;
});

export default MathText;
