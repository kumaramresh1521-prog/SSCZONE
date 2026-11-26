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
  if (!trimmed || /(?<!\\)[#@%&]/.test(trimmed) || /[\u0900-\u097F]/.test(trimmed)) return false;
  if (/\\(?:[A-Za-z]+|[%$#&_{}])/.test(trimmed)) return true;
  if (/\b(?:where|then|means|if|and|or|is|are|the|of|to|for)\b/i.test(trimmed)) return false;
  return /^[0-9A-Za-z\s+\-*/=^()[\]{}.,<>|:;!?]+$/.test(trimmed);
}

function renderImageTag(src: string, alt: string): string {
  const cleanAlt = (alt || "Figure").trim() || "Figure";
  const resolvedSrc = escapeHtml(resolveAssetUrl(src));
  if (/^inline\b/i.test(cleanAlt)) {
    return (
      '<span class="inline-block max-w-full align-middle mx-1">' +
      `<img src="${resolvedSrc}" alt="${cleanAlt}" data-img-role="inline" loading="eager" decoding="async" class="inline-block max-w-full w-auto h-auto rounded bg-white px-0.5 py-0.5 align-middle" style="max-height: 32px; max-width: min(100%, 320px); object-fit: contain; vertical-align: middle;" />` +
      "</span>"
    );
  }
  if (/^option\b/i.test(cleanAlt)) {
    return (
      '<span class="inline-block max-w-full align-middle">' +
      `<img src="${resolvedSrc}" alt="${cleanAlt}" data-img-role="option" loading="eager" decoding="async" class="inline-block max-w-full w-auto h-auto rounded-md bg-white p-0.5 align-middle" style="max-height: 84px; max-width: min(100%, 460px); object-fit: contain;" />` +
      "</span>"
    );
  }
  return (
    '<span class="my-1.5 block max-w-full overflow-x-auto align-middle">' +
    `<img src="${resolvedSrc}" alt="${cleanAlt}" data-img-role="figure" loading="eager" decoding="async" class="block max-w-full w-auto h-auto rounded-lg border border-slate-200/80 bg-white p-1" style="max-height: 360px; max-width: min(100%, 980px); object-fit: contain;" />` +
    "</span>"
  );
}

function renderMarkdownTable(block: string): string {
  // Normalize any inline collapsed rows `| |` into newlines
  const normalizedBlock = block.replace(/\|\s*\|/g, "|\n|");
  const rawLines = normalizedBlock.trim().split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (rawLines.length < 2) return block;

  const rows = rawLines.map((line) => {
    const stripped = line.replace(/^\|/, "").replace(/\|$/, "");
    return stripped.split("|").map((c) => c.trim());
  });

  let headerRow: string[] | null = null;
  let bodyRows: string[][] = rows;

  if (rows.length >= 2 && rows[1].every((c) => /^:?-+:?$/.test(c.trim()))) {
    headerRow = rows[0];
    bodyRows = rows.slice(2);
  }

  // Detect Coding-Decoding letter/number matrix (e.g. columns 0-4 or 1-7)
  const isCodingMatrix =
    Boolean(headerRow &&
    headerRow.length >= 3 &&
    headerRow.slice(1).every((h) => /^\d+$/.test(h.replace(/\*\*/g, "").trim())));

  // Detect SSC Rows/Columns relational table (e.g. Header has Row, Column I, II, III...)
  const isRowsColumnsTable =
    Boolean(headerRow &&
    headerRow.some((h) => /^(?:Row|Columns?|[IVXLCDM]+)$/i.test(h.replace(/\*\*/g, "").trim())));

  // Detect Data-only number matrix (no header row, or pure numbers / ? grid like 3x3, 4x3)
  const isDataGrid =
    bodyRows.length >= 2 &&
    bodyRows.every((r) => r.length === bodyRows[0].length && r.length >= 2 && r.length <= 8) &&
    bodyRows.flat().every((c) => c.replace(/\*\*/g, "").trim().length <= 12);

  if (isCodingMatrix) {
    let html = '<span class="my-2.5 block max-w-full overflow-x-auto"><table class="inline-table border-collapse rounded-xl border border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-900 text-center text-xs sm:text-sm shadow-2xs overflow-hidden">';
    if (headerRow && headerRow.length > 0) {
      html += '<thead class="border-b border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/60 font-black text-blue-900 dark:text-blue-200"><tr>';
      headerRow.forEach((h, hIdx) => {
        const val = escapeHtml(h.replace(/\*\*/g, "").trim());
        const bg = hIdx === 0 ? "bg-blue-100/70 dark:bg-blue-900/50 text-blue-800" : "bg-blue-50 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200";
        html += `<th class="border-r border-blue-200 dark:border-blue-900 w-9 sm:w-11 h-8 sm:h-9 text-center p-1 font-black ${bg} last:border-r-0">${val}</th>`;
      });
      html += '</tr></thead>';
    }
    html += '<tbody class="divide-y divide-blue-100 dark:divide-blue-950">';
    bodyRows.forEach((r, idx) => {
      const rowBg = idx % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-blue-50/20 dark:bg-slate-800/30";
      html += `<tr class="${rowBg}">`;
      r.forEach((c, cIdx) => {
        const val = escapeHtml(c.replace(/\*\*/g, "").trim());
        if (cIdx === 0) {
          html += `<td class="border-r border-blue-200 dark:border-blue-900 w-9 sm:w-11 h-8 sm:h-9 text-center font-black bg-blue-50/80 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 p-1">${val}</td>`;
        } else {
          html += `<td class="border-r border-blue-100 dark:border-blue-900/60 w-9 sm:w-11 h-8 sm:h-9 text-center font-extrabold text-slate-800 dark:text-slate-100 p-1 last:border-r-0 tracking-wider">${val}</td>`;
        }
      });
      html += '</tr>';
    });
    html += '</tbody></table></span>';
    return html;
  }

  if (isRowsColumnsTable || (isDataGrid && !headerRow)) {
    let html = '<span class="my-3 block max-w-full overflow-x-auto"><table class="inline-table border-collapse rounded-xl border border-blue-300 dark:border-blue-800 bg-white dark:bg-slate-900 text-center text-xs sm:text-sm shadow-xs overflow-hidden">';
    if (headerRow && headerRow.length > 0) {
      html += '<thead class="border-b-2 border-blue-300 dark:border-blue-800 bg-blue-100/80 dark:bg-blue-950 font-black text-blue-950 dark:text-blue-100"><tr>';
      headerRow.forEach((h, hIdx) => {
        const val = escapeHtml(h.replace(/\*\*/g, "").trim());
        const bg = hIdx === 0 ? "bg-blue-200/70 dark:bg-blue-900/70 text-blue-900 dark:text-blue-200" : "bg-blue-100/70 dark:bg-blue-950/80 text-blue-950 dark:text-blue-100";
        html += `<th class="border-r border-blue-200 dark:border-blue-800/80 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-center font-black ${bg} last:border-r-0">${val}</th>`;
      });
      html += '</tr></thead>';
    }
    html += '<tbody class="divide-y divide-blue-100 dark:divide-blue-950/80">';
    bodyRows.forEach((r, idx) => {
      const rowBg = idx % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-blue-50/30 dark:bg-slate-800/40";
      html += `<tr class="${rowBg}">`;
      r.forEach((c, cIdx) => {
        const val = escapeHtml(c.replace(/\*\*/g, "").trim());
        const isHeaderCell = headerRow ? cIdx === 0 : false;
        const cellClass = isHeaderCell
          ? "border-r border-blue-200 dark:border-blue-800/80 px-2.5 sm:px-3.5 py-1.5 sm:py-2 font-black bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200"
          : "border-r border-blue-100 dark:border-blue-900/40 px-2.5 sm:px-3.5 py-1.5 sm:py-2 font-bold text-slate-800 dark:text-slate-100 last:border-r-0";
        html += `<td class="${cellClass}">${val}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table></span>';
    return html;
  }

  let html = '<span class="my-3 block max-w-full overflow-x-auto"><table class="w-full max-w-2xl border-collapse rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-left text-xs sm:text-sm shadow-xs">';
  if (headerRow && headerRow.length > 0) {
    html += '<thead class="border-b border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100"><tr>';
    headerRow.forEach((h) => {
      html += `<th class="border-r border-slate-300 dark:border-slate-700 px-3 py-2 last:border-r-0">${escapeHtml(h)}</th>`;
    });
    html += '</tr></thead>';
  }
  html += '<tbody class="divide-y divide-slate-200 dark:divide-slate-800">';
  bodyRows.forEach((r, idx) => {
    const rowBg = idx % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/70 dark:bg-slate-800/40";
    html += `<tr class="${rowBg}">`;
    r.forEach((c) => {
      html += `<td class="border-r border-slate-200 dark:border-slate-800 px-3 py-2 text-slate-800 dark:text-slate-200 align-top last:border-r-0">${escapeHtml(c)}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table></span>';
  return html;
}

// Convert common pasted math notation into safe, readable HTML. Full TeX remains supported
// through $...$, \(...\), \[...\], and $$...$$ delimiters below.
function formatRawMathText(plainText: string): string {
  if (!plainText) return "";

  // PRE-0: Strip LaTeX environments (arrays, matrices, cases) — before escapeHtml mangles them
  let preProcessed = plainText;
  preProcessed = preProcessed.replace(/\\begin\{[^}]+\}[\s\S]*?\\end\{[^}]+\}/g, '');
  // LaTeX spacing commands → real spaces BEFORE anything else
  preProcessed = preProcessed.replace(/\\quad\b/g, '  ');
  preProcessed = preProcessed.replace(/\\qquad\b/g, '    ');
  preProcessed = preProcessed.replace(/\\[,;:]/g, ' ');
  preProcessed = preProcessed.replace(/\\!/g, '');
  // Ellipsis
  preProcessed = preProcessed.replace(/\\(?:ldots|cdots|dots)\b/g, '…');
  // LaTeX row breaks
  preProcessed = preProcessed.replace(/\\hline\b/g, '');
  preProcessed = preProcessed.replace(/\\\\\s*(?=\S)/g, '  ');
  preProcessed = preProcessed.replace(/\\\\\s*$/gm, '');
  // Greek letters
  preProcessed = preProcessed.replace(/\\theta\b/g, 'θ').replace(/\\alpha\b/g, 'α').replace(/\\beta\b/g, 'β');
  preProcessed = preProcessed.replace(/\\gamma\b/g, 'γ').replace(/\\delta\b/g, 'δ').replace(/\\Delta\b/g, 'Δ');
  preProcessed = preProcessed.replace(/\\epsilon\b/g, 'ε').replace(/\\lambda\b/g, 'λ').replace(/\\sigma\b/g, 'σ');
  preProcessed = preProcessed.replace(/\\omega\b/g, 'ω').replace(/\\Omega\b/g, 'Ω').replace(/\\mu\b/g, 'μ');
  preProcessed = preProcessed.replace(/\\nu\b/g, 'ν').replace(/\\phi\b/g, 'φ').replace(/\\Phi\b/g, 'Φ');
  preProcessed = preProcessed.replace(/\\pi\b/g, 'π').replace(/\\Pi\b/g, 'Π').replace(/\\rho\b/g, 'ρ');
  preProcessed = preProcessed.replace(/\\tau\b/g, 'τ').replace(/\\xi\b/g, 'ξ').replace(/\\eta\b/g, 'η');
  preProcessed = preProcessed.replace(/\\kappa\b/g, 'κ').replace(/\\zeta\b/g, 'ζ').replace(/\\psi\b/g, 'ψ');
  preProcessed = preProcessed.replace(/\\chi\b/g, 'χ');
  // Trig & math functions
  preProcessed = preProcessed.replace(/\\sin\b/g, 'sin').replace(/\\cos\b/g, 'cos').replace(/\\tan\b/g, 'tan');
  preProcessed = preProcessed.replace(/\\cot\b/g, 'cot').replace(/\\sec\b/g, 'sec').replace(/\\(?:csc|cosec)\b/g, 'cosec');
  preProcessed = preProcessed.replace(/\\log\b/g, 'log').replace(/\\ln\b/g, 'ln').replace(/\\exp\b/g, 'exp');
  preProcessed = preProcessed.replace(/\\lim\b/g, 'lim').replace(/\\max\b/g, 'max').replace(/\\min\b/g, 'min');
  preProcessed = preProcessed.replace(/\\gcd\b/g, 'gcd').replace(/\\lcm\b/g, 'lcm').replace(/\\mod\b/g, 'mod');
  // Operators / symbols
  preProcessed = preProcessed.replace(/\\times/g, '×').replace(/\\div/g, '÷').replace(/\\pm\b/g, '±');
  preProcessed = preProcessed.replace(/\\leq?\b/g, '≤').replace(/\\geq?\b/g, '≥').replace(/\\neq\b/g, '≠');
  preProcessed = preProcessed.replace(/\\ne\b/g, '≠').replace(/\\approx\b/g, '≈').replace(/\\infty\b/g, '∞');
  preProcessed = preProcessed.replace(/\\cdot\b/g, '·').replace(/\\angle\b/g, '∠').replace(/\\triangle\b/g, '△');
  preProcessed = preProcessed.replace(/\\perp\b/g, '⊥').replace(/\\parallel\b/g, '∥').replace(/\\sim\b/g, '∼');
  preProcessed = preProcessed.replace(/\\cong\b/g, '≅').replace(/\\propto\b/g, '∝');
  preProcessed = preProcessed.replace(/\\rightarrow\b|\\to\b/g, '→').replace(/\\leftarrow\b/g, '←');
  preProcessed = preProcessed.replace(/\\Rightarrow\b/g, '⇒').replace(/\\Leftrightarrow\b/g, '⟺');
  preProcessed = preProcessed.replace(/\\in\b/g, '∈').replace(/\\notin\b/g, '∉');
  preProcessed = preProcessed.replace(/\\cup\b/g, '∪').replace(/\\cap\b/g, '∩').replace(/\\emptyset\b/g, '∅');
  preProcessed = preProcessed.replace(/\\forall\b/g, '∀').replace(/\\exists\b/g, '∃');
  preProcessed = preProcessed.replace(/\\partial\b/g, '∂');
  preProcessed = preProcessed.replace(/\\sum\b/g, 'Σ').replace(/\\prod\b/g, 'Π').replace(/\\int\b/g, '∫');
  // Degree
  preProcessed = preProcessed.replace(/\^\\circ|\^\{\\circ\}|\\circ\b|\\degree\b/g, '°');
  // Formatting wrappers — unwrap content
  preProcessed = preProcessed.replace(/\\(?:text|mathrm|mathbf|mathit|mathcal|operatorname|displaystyle)\{([^}]+)\}/g, '$1');
  preProcessed = preProcessed.replace(/\\(?:overline|underline|widehat|widetilde|hat|vec|tilde|bar|dot|ddot)\{([^}]+)\}/g, '$1');
  preProcessed = preProcessed.replace(/\\left\s*([(\[{|<])/g, '$1');
  preProcessed = preProcessed.replace(/\\right\s*([)\]}|>])/g, '$1');
  preProcessed = preProcessed.replace(/\\%/g, '%').replace(/\\\$/g, '$');
  // Strip remaining unknown \commands ONLY (preserve \frac, \dfrac, \tfrac, \sqrt so step 3/7 converts them cleanly!)
  preProcessed = preProcessed.replace(/\\(?!(?:d?frac|tfrac|sqrt)\b)[a-zA-Z]+\b/g, '');

  // 0. Extract and pre-render any Markdown tables
  // Un-collapse any single-line collapsed pipe tables: e.g. `| 22 | 44 | 36 | | 16 | 28 | 24 |`
  preProcessed = preProcessed.replace(/\|\s*\|/g, '|\n|');
  const tablePlaceholders: string[] = [];
  const tableRegex = /(?:^[ \t]*\|[^\n]+\|[ \t]*(?:\r?\n|$)){2,}/gm;
  let textWithoutTables = preProcessed.replace(tableRegex, (block) => {
    const renderedTable = renderMarkdownTable(block);
    const key = `___MD_TABLE_${tablePlaceholders.length}___`;
    tablePlaceholders.push(renderedTable);
    return `\n\n${key}\n\n`;
  });

  // Clean whitespace: trim ends and collapse excessive blank lines
  let clean = textWithoutTables.trim();

  // 1. Intelligent newline normalization:
  // PDF extracts contain artificial hard wraps at 70-80 chars inside normal sentences.
  // Converting every single \n to a block element causes sentences on mobile to be torn
  // into separate disjointed blocks with excessive vertical gaps.
  // We preserve intentional newlines (lists like 1., a., (i), P., Q., R., S., bullets, statements, analogies, notes, rows)
  // while joining accidental mid-sentence PDF wraps with a clean single space.
  const intentionalBreakRegex = /\n(?=(?:\d+[\.\)]\s+|(?:[a-zA-Z]|[sS][1-6]|\d+)[\.\:\)]\s+|\([a-zA-Z0-9ivxIVX]+\)\s*|\[[a-zA-Z0-9ivxIVX]+\]\s*|[ivxIVX]+[\.\)]\s+|[-•*]\s+|(?:Statements?|Conclusions?|Assertions?|Reasons?|Premises?|अभिकथन|कारण|कथन|निष्कर्ष)\b|\(?(?:NOTE|Note)\s*[:\-]|[A-Z0-9\s]{2,}:[^:]+::|\(?\s*\d+\s*,\s*\d+\s*,\s*(?:\?|\d+)|\d+\s*[-–]\s*\d+\s*[-–]\s*\d+|(?:First|Second|Third|Fourth)\s+row\b|Row\s+\d+\b|["“\']?[A-Z]\s*[+\-×÷x*]\s*[A-Z]|MAL_[A-Z0-9_]+|\b(?:Passage|Directions?)\b|!\[|<img|___MD_TABLE_))/i;

  const rawParagraphs = clean.split(/\r?\n\s*\r?\n/);
  const normalizedParagraphs = rawParagraphs.map((para) => {
    const trimmedPara = para.trim();
    if (!trimmedPara) return "";

    const breaks: string[] = [];
    const withPlaceholders = trimmedPara.replace(new RegExp(intentionalBreakRegex.source, "gi"), () => {
      breaks.push("");
      return `___INTENTIONAL_BRK_${breaks.length - 1}___`;
    });

    let joined = withPlaceholders.replace(/\s*\r?\n\s*/g, " ");
    let escaped = escapeHtml(joined);

    breaks.forEach((_, idx) => {
      escaped = escaped.replace(`___INTENTIONAL_BRK_${idx}___`, '<br />');
    });

    return escaped;
  }).filter(Boolean);

  let formatted = normalizedParagraphs.join('<span class="block mt-2"></span>');

  // 2. Normalize the minus copied from PDFs and convert unicode superscripts.
  formatted = formatted.replace(/[−–—]/g, "-");
  const superscriptMap: Record<string, string> = {
    "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
    "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
    "⁺": "+", "⁻": "-", "⁼": "=", "⁽": "(", "⁾": ")",
    "ⁿ": "n", "ˣ": "x", "ʸ": "y"
  };
  formatted = formatted.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿˣʸ]/g, (match) => `<sup>${superscriptMap[match] || match}</sup>`);

  // 3. Roots copied as √, ∛, \sqrt{...}, \sqrt[3]{...}, sqrt(...), or cbrt(...).
  formatted = formatted.replace(/\\sqrt\s*\[3\]\s*\{([^{}\n]+)\}/gi, (_match, value) => radical("∛", value));
  formatted = formatted.replace(/\\sqrt\s*\{([^{}\n]+)\}/gi, (_match, value) => radical("√", value));
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
  // Only convert explicit LaTeX / TeX notation or math symbol, NOT regular English prose
  formatted = formatted.replace(/\\therefore\b/g, '∴');
  formatted = formatted.replace(/\\because\b/g, '∵');

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

  // 10. Restore pre-rendered Markdown tables
  tablePlaceholders.forEach((tblHtml, idx) => {
    const key = `___MD_TABLE_${idx}___`;
    formatted = formatted.replace(key, tblHtml);
  });

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
    !text.includes("|") &&
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
