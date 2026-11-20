"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Search,
  Sparkles,
  HelpCircle,
  Smartphone,
  Monitor,
  ShieldCheck,
  Tag,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Image as ImageIcon
} from "lucide-react";

export default function QuestionSeoInspector() {
  const [questionIdInput, setQuestionIdInput] = useState("25204");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  async function inspectQuestion(idToFetch?: string) {
    const targetId = (idToFetch || questionIdInput).trim();
    if (!targetId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/question-seo?id=${targetId}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json);
      } else {
        setError(json.error || "Failed to inspect question");
      }
    } catch (err: any) {
      setError(err.message || "Network error loading question SEO");
    } finally {
      setLoading(false);
    }
  }

  // Load default question on mount
  useEffect(() => {
    inspectQuestion("25204");
  }, []);

  function handleCopyUrl() {
    if (!data?.full_url) return;
    navigator.clipboard.writeText(data.full_url);
    setCopiedUrl(true);
    toast.success("Canonical URL copied to clipboard!");
    setTimeout(() => setCopiedUrl(false), 2000);
  }

  function handleCopySchema() {
    if (!data?.json_ld) return;
    navigator.clipboard.writeText(JSON.stringify(data.json_ld, null, 2));
    setCopiedSchema(true);
    toast.success("Schema.org QAPage JSON-LD copied!");
    setTimeout(() => setCopiedSchema(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Search & Inspector Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
        <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-blue-600" />
              <span>Question-Level SEO &amp; Google SERP Engine</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Inspect live keyword-rich URLs (/question/[id]-[slug]), dynamic CTR meta tags, and Schema.org QAPage rich snippet markup.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
            <Sparkles className="h-3 w-3 text-blue-600" />
            Schema QAPage Active
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={questionIdInput}
              onChange={(e) => setQuestionIdInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && inspectQuestion()}
              placeholder="Enter Question ID (e.g. 25204, 25384)..."
              className="w-full rounded-xl border border-gray-300 pl-9 pr-4 py-2 text-xs font-mono font-bold text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={() => inspectQuestion()}
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-bold shadow-xs cursor-pointer transition-all disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Search className="h-3.5 w-3.5" />
            )}
            <span>Inspect SEO</span>
          </button>
        </div>

        {/* Quick Test Samples */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-gray-500">Quick Test Samples:</span>
          {[
            { id: "25204", label: "Q1: Technical Discussion (Comprehension)" },
            { id: "6276", label: "PYQ: SSC Steno 10/12/2024" },
            { id: "24844", label: "Paper Cutting & Folding (Diagram)" },
            { id: "23115", label: "PYQ: SSC MTS 2013" },
            { id: "25384", label: "Q181: Ms. Gervis Mystery" },
          ].map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => {
                setQuestionIdInput(sample.id);
                inspectQuestion(sample.id);
              }}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-gray-700 transition-colors cursor-pointer"
            >
              #{sample.id} — {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Result Cards */}
      {data && data.question && (
        <div className="space-y-6">
          {/* Live SERP Preview Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <span>Google Search SERP Snippet Preview</span>
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  How this question will appear in Google organic search results when searched by students.
                </p>
              </div>

              {/* Device Toggle */}
              <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all cursor-pointer ${
                    previewDevice === "desktop" ? "bg-white text-blue-700 shadow-2xs" : "text-gray-500"
                  }`}
                >
                  <Monitor className="h-3 w-3" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all cursor-pointer ${
                    previewDevice === "mobile" ? "bg-white text-blue-700 shadow-2xs" : "text-gray-500"
                  }`}
                >
                  <Smartphone className="h-3 w-3" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* Google SERP Simulated Box */}
            <div className={`p-4 rounded-xl border border-gray-200 bg-white space-y-1.5 font-sans ${previewDevice === "mobile" ? "max-w-md mx-auto border-dashed shadow-xs" : ""}`}>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-xs">
                  SZ
                </div>
                <div className="text-xs leading-tight overflow-hidden">
                  <div className="text-gray-900 font-bold truncate">SSCZone • Practice Question</div>
                  <div className="text-emerald-700 truncate font-mono text-[11px]">
                    {data.full_url}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-1 items-start">
                <div className="flex-1">
                  <a
                    href={data.canonical_path}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-base font-bold text-[#1a0dab] hover:underline cursor-pointer leading-snug"
                  >
                    {typeof data.metadata?.title === "string"
                      ? data.metadata.title
                      : data.metadata?.title?.absolute || (typeof data.seo?.title === "string" ? data.seo.title : "")}
                  </a>

                  <p className="text-xs text-[#4d5156] leading-relaxed mt-1">
                    {data.metadata?.description}
                  </p>
                </div>

                {data.question.image_url && (
                  <div className="shrink-0 rounded-xl border border-gray-200 bg-gray-50 p-1 shadow-2xs">
                    <img
                      src={data.question.image_url}
                      alt="Google SERP thumbnail"
                      className="h-16 w-20 object-contain rounded-lg bg-white"
                    />
                    <div className="text-[9px] font-bold text-center text-gray-500 mt-0.5">Diagram</div>
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                  <Check className="h-3 w-3 text-emerald-600" />
                  Q&amp;A Rich Snippet Active
                </span>
                {data.question.image_url && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-bold">
                    <ImageIcon className="h-3 w-3 text-amber-600" />
                    Google Image SEO Indexed
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-800 font-bold">
                  <Tag className="h-3 w-3 text-blue-600" />
                  {data.question.topic_title || "Comprehension"}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-800 font-bold">
                  {data.question.exam_tag || "SSC CGL"}
                </span>
              </div>
            </div>
          </div>

          {/* Canonical URL & Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Canonical URL Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Keyword-Rich Canonical URL</span>
                </span>
                <a
                  href={data.canonical_path}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <span>Open Live Page</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-mono text-xs break-all text-gray-800 select-all">
                {data.full_url}
              </div>

              <button
                type="button"
                onClick={handleCopyUrl}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold cursor-pointer transition-colors"
              >
                {copiedUrl ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedUrl ? "Copied!" : "Copy Canonical URL"}</span>
              </button>
            </div>

            {/* Question Context & Official Answer */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span>Question Metadata &amp; Answer Key</span>
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-500 font-bold">Topic:</span>
                  <span className="font-bold text-gray-800">{data.question.topic_title}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-500 font-bold">Official Answer:</span>
                  <span className="px-2 py-0.5 rounded font-black bg-emerald-100 text-emerald-800 uppercase">
                    Option {data.question.correct_answer}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-500 font-bold">Verified Explanation:</span>
                  <span className="font-bold text-emerald-700">✓ {data.question.explanation ? "Detailed text present" : "None"}</span>
                </div>
                {data.question.image_url && (
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-gray-500 font-bold flex items-center gap-1">
                      <ImageIcon className="h-3.5 w-3.5 text-blue-600" />
                      <span>Diagram:</span>
                    </span>
                    <img
                      src={data.question.image_url}
                      alt="Question diagram"
                      className="h-12 w-auto max-w-[120px] rounded border border-gray-200 p-0.5 bg-white object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Schema.org JSON-LD Breakdown */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wide text-gray-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Schema.org JSON-LD (QAPage + Breadcrumbs)</span>
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Injected into the SSR HTML for Google Answer Box, Knowledge Graph, and Rich Snippet badges.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopySchema}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold cursor-pointer transition-colors"
              >
                {copiedSchema ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedSchema ? "Copied!" : "Copy Schema JSON"}</span>
              </button>
            </div>

            <div className="bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed max-h-80">
              <pre>{JSON.stringify(data.json_ld, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
