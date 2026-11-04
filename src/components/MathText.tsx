import React, { memo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

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

// Convert common pasted math notation into safe, readable HTML. Full TeX remains supported
// through $...$, \(...\), \[...\], and $$...$$ delimiters below.
function formatRawMathText(plainText: string): string {
  let formatted = escapeHtml(plainText);

  // 1. Convert newlines to clean line breaks
  formatted = formatted.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  formatted = formatted.replace(/\n\n+/g, '<div class="my-2.5"></div>');
  formatted = formatted.replace(/\n/g, '<br class="my-1" />');

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

  // 4. Plain numeric/simple algebra fractions such as 3/4, -x/y, and 7/(x+1).
  formatted = formatted.replace(
    /(^|[^A-Za-z0-9_/:])(-?\d+|[A-Za-z])\s*\/\s*\(([^()\n]+)\)/g,
    (_match, prefix, numerator, denominator) => prefix + fraction(numerator, denominator)
  );
  formatted = formatted.replace(
    /(^|[^A-Za-z0-9_/:])(-?\d+|[A-Za-z])\s*\/\s*(-?\d+|[A-Za-z])(?![A-Za-z0-9_/])/g,
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
  formatted = formatted.replace(/!\[(.*?)\]\(([^\s)]+)\)/gi, '<div class="my-2"><img src="$2" alt="$1" class="max-w-full rounded-xl border border-gray-200" style="max-height: 280px; object-fit: contain;" /></div>');
  formatted = formatted.replace(/\[Image:\s*([^\s\]]+)\]/gi, '<div class="my-2"><img src="$1" alt="Figure" class="max-w-full rounded-xl border border-gray-200" style="max-height: 280px; object-fit: contain;" /></div>');

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

  // Split by KaTeX delimiters: $$, single $, \( \), \[ \]
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
      } else if (part.startsWith("$") && part.endsWith("$") && part.length > 2 && !part.startsWith("$$")) {
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
  if (!text) return null;
  const html = renderMath(text);
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
});

export default MathText;
