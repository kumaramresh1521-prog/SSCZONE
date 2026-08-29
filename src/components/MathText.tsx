import katex from "katex";
import "katex/dist/katex.min.css";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Convert raw mathematical notation (powers like 2^6, x^2, unicode superscripts, line breaks) into beautiful HTML
function formatRawMathText(plainText: string): string {
  let formatted = escapeHtml(plainText);

  // 1. Convert newlines to clean line breaks
  formatted = formatted.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  formatted = formatted.replace(/\n\n+/g, '<div class="my-2.5"></div>');
  formatted = formatted.replace(/\n/g, '<br class="my-1" />');

  // 2. Convert unicode superscripts to <sup> tags
  const superscriptMap: Record<string, string> = {
    "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
    "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
    "⁺": "+", "⁻": "-", "⁼": "=", "⁽": "(", "⁾": ")",
    "ⁿ": "n", "ˣ": "x", "ʸ": "y"
  };
  formatted = formatted.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿˣʸ]/g, (match) => `<sup>${superscriptMap[match] || match}</sup>`);

  // 3. Convert parenthesized base powers like (x+y)^2 or (17)^3 or (x-y)^2
  formatted = formatted.replace(/\(([^)]+)\)\^(\d+|[a-zA-Z]+|\{[^}]+\})/g, '($1)<sup>$2</sup>');

  // 4. Convert variable/number caret powers like 2^6, 17^3, x^2, y^36, 14400 = 2^6 * 3^2
  formatted = formatted.replace(/\b([a-zA-Z0-9]+)\^([0-9a-zA-Z]+)\b/g, '$1<sup>$2</sup>');
  formatted = formatted.replace(/\b([a-zA-Z0-9]+)\^\{([^}]+)\}/g, '$1<sup>$2</sup>');

  // 5. Convert multiplication asterisk between math terms to multiplication sign (e.g. 2^6 * 3^2 -> 2^6 × 3^2)
  formatted = formatted.replace(/(\d+|<sup>[^<]+<\/sup>)\s*\*\s*(\d+|<sup>[^<]+<\/sup>|[a-zA-Z])/g, '$1 × $2');

  // 6. Convert math arrows & symbol notations
  formatted = formatted.replace(/=&gt;|==&gt;|->|-->/g, ' ➔ ');
  formatted = formatted.replace(/\b(?:therefore|Therefore)\b/g, '∴');
  formatted = formatted.replace(/\b(?:because|Because)\b/g, '∵');

  // 8. Convert image tags/markdown: ![alt](url) or [Image: url] or raw image URLs
  formatted = formatted.replace(/!\[(.*?)\]\((https?:\/\/[^\s)]+)\)/gi, '<div class="my-2"><img src="$2" alt="$1" class="max-w-full rounded-xl border border-gray-200" style="max-height: 280px; object-fit: contain;" /></div>');
  formatted = formatted.replace(/\[Image:\s*(https?:\/\/[^\s\]]+)\]/gi, '<div class="my-2"><img src="$1" alt="Explanation Figure" class="max-w-full rounded-xl border border-gray-200" style="max-height: 280px; object-fit: contain;" /></div>');

  return formatted;
}

export default function MathText({ text, className = "" }: { text?: string | null; className?: string }) {
  if (!text) return null;

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

  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
