import { notFound } from "next/navigation";
import { getCandidateToolsAsync, CandidateTool } from "@/lib/candidate-tools-store";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ExternalLink } from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getToolSlug(tool: CandidateTool): string {
  // Use tool.id as slug (already slugified on creation)
  return tool.id;
}

/** Robust Markdown & HTML renderer with table, code block, and list support */
function renderMarkdown(md: string): string {
  if (!md) return "";

  // If content is purely or primarily HTML
  const isPureHtml = /^\s*<(!DOCTYPE|html|div|section|table|article|main)/i.test(md);
  if (isPureHtml) {
    return md;
  }

  let html = md;

  // Code blocks (```lang ... ```)
  html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/gm, (_match, _lang, code) => {
    return `<pre class="bg-slate-900 text-slate-100 rounded-2xl p-4 overflow-x-auto text-xs font-mono my-4 border border-slate-800"><code>${code.trim()}</code></pre>`;
  });

  // Markdown tables (| col1 | col2 |)
  html = html.replace(/((?:\|[^\n]+\|\r?\n)+)/g, (tableBlock) => {
    const lines = tableBlock.trim().split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) return tableBlock;

    const parseRow = (line: string) =>
      line
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((cell) => cell.trim());

    // Check if second line is separator (| --- | --- |)
    const isSep = /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/.test(lines[1]);
    const headerRow = parseRow(lines[0]);
    const bodyRows = isSep ? lines.slice(2).map(parseRow) : lines.slice(1).map(parseRow);

    const ths = headerRow.map((h) => `<th class="px-4 py-2.5 bg-slate-100 text-left text-xs font-black text-slate-900 border-b border-slate-200">${h}</th>`).join("");
    const trs = bodyRows
      .map(
        (row) =>
          `<tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">${row
            .map((cell) => `<td class="px-4 py-2 text-xs text-slate-700">${cell}</td>`)
            .join("")}</tr>`
      )
      .join("");

    return `<div class="overflow-x-auto my-4 rounded-xl border border-slate-200 shadow-2xs"><table class="min-w-full divide-y divide-slate-200 text-left text-sm"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></div>`;
  });

  // Headings
  html = html
    .replace(/^### (.+)$/gm, '<h3 class="text-base sm:text-lg font-black text-slate-900 mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg sm:text-xl font-black text-slate-900 mt-8 mb-3 border-b border-slate-200 pb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl sm:text-2xl font-black text-slate-900 mt-6 mb-4">$1</h1>')
    // Bold & Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-black text-slate-900">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic text-slate-700">$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-blue-700 font-mono text-xs px-1.5 py-0.5 rounded border border-slate-200">$1</code>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-blue-500 bg-blue-50/80 pl-4 py-2 italic text-slate-700 rounded-r-xl my-3">$1</blockquote>')
    // Horizontal rule
    .replace(/^---+$/gm, '<hr class="border-slate-200 my-6"/>')
    // Unordered list items
    .replace(/^\s*[-*] (.+)$/gm, '<li class="flex items-start gap-2 text-sm text-slate-700 py-1"><span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0"></span><span>$1</span></li>')
    // Ordered list items
    .replace(/^\s*(\d+)\. (.+)$/gm, '<li class="flex items-start gap-2 text-sm text-slate-700 py-1"><span class="font-bold text-blue-600 shrink-0">$1.</span><span>$2</span></li>')
    // Wrap consecutive <li> in <ul>
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => `<ul class="space-y-1 my-3 pl-1">${match}</ul>`)
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 font-bold underline hover:text-blue-800" target="_blank" rel="noopener">$1</a>')
    // Paragraphs — wrap remaining plain lines
    .replace(/^(?!<[a-z/]).+$/gm, '<p class="text-sm text-slate-700 leading-relaxed my-2.5">$&</p>');

  return html;
}

// ─── Metadata ───────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tools = await getCandidateToolsAsync();
  const tool = tools.find((t) => t.id === slug || slugify(t.title) === slug);

  if (!tool) {
    return { title: "Tool Not Found — SSCZone" };
  }

  return {
    title: `${tool.title} — SSCZone Candidate Tools`,
    description: tool.description,
  };
}

// ─── Page Component ─────────────────────────────────────────────────────────

export default async function ToolkitSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tools = await getCandidateToolsAsync();

  // Find the tool by id or slugified title
  const tool = tools.find(
    (t) => t.id === slug || slugify(t.title) === slug
  );

  // If tool not found OR it has a custom page (hardcoded) → 404
  // (Age calculator, rank predictor etc have hasCustomPage: true)
  if (!tool) return notFound();

  // If tool has a custom hardcoded page, redirect there
  if (tool.hasCustomPage && tool.href && tool.href !== `/toolkit/${slug}`) {
    // This shouldn't be reached normally since custom-page tools link directly
    return notFound();
  }

  const contentHtml = renderMarkdown(tool.content_md || "");
  const hasContent = contentHtml.trim().length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/toolkit"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Toolkit
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-xs text-slate-500 font-semibold truncate">{tool.title}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Tool Header Card */}
        <div className={`rounded-3xl bg-gradient-to-br ${tool.gradient || "from-blue-600 to-indigo-600"} p-8 text-white mb-8 shadow-xl`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              {tool.badge && (
                <span className={`inline-block mb-3 px-3 py-1 rounded-full text-[11px] font-black uppercase ${tool.badgeColor || "bg-white/20 text-white"}`}>
                  {tool.badge}
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl font-black leading-tight mb-3">
                {tool.title}
              </h1>
              <p className="text-sm text-white/85 leading-relaxed max-w-2xl">
                {tool.description}
              </p>
            </div>
          </div>

          {/* Features */}
          {tool.features && tool.features.length > 0 && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {tool.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-white/80 shrink-0" />
                  <span className="text-xs font-semibold text-white/90">{feat}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        {hasContent ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10">
            <div
              className="prose-custom max-w-none"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-base font-black text-slate-700 mb-2">Content Coming Soon</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Admin panel se is tool ka content add karo — Markdown ya plain text mein.
            </p>
            <Link
              href="/admin/tools"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-black hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Admin → Tools CMS
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
