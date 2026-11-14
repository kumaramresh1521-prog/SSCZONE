"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import RichTextEditor from "@/components/RichTextEditor";
import SeoKeywordPanel from "@/components/admin/SeoKeywordPanel";
import {
  Newspaper,
  Edit3,
  Trash2,
  PlusCircle,
  Globe,
  Search,
  Link as LinkIcon,
  Eye,
  Sparkles,
  ExternalLink,
  Copy,
  CheckCircle2,
  Clock,
  Tag,
  FileText,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  X,
  AlertCircle,
  Maximize2,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";

// Pre-configured Blog Post Quick Templates
const POST_TEMPLATES = [
  {
    name: "📢 Official Exam Notification",
    category: "Exam Notification",
    examTag: "SSC CGL",
    focusKeyword: "SSC CGL 2026 Notification",
    title: "SSC CGL 2026 Official Notification Out: Check Vacancy, Eligibility & Dates",
    excerpt: "Staff Selection Commission (SSC) has officially released the recruitment notification for Combined Graduate Level Examination (CGL) 2026. Review eligibility, vacancy, and apply online.",
    content: `<h2>SSC CGL 2026 Notification Overview</h2>
<p>The Staff Selection Commission has released the official recruitment notification for Combined Graduate Level Examination (CGL) 2026. Eligible candidates can apply online through the official portal <strong>ssc.gov.in</strong>.</p>

<div style="background: linear-gradient(to right, #eff6ff, #f0fdf4); border-left: 5px solid #2563eb; padding: 16px 20px; border-radius: 12px; margin: 20px 0;">
  <p style="margin: 0 0 6px 0; font-weight: 800; color: #1e3a8a; font-size: 15px;">📢 IMPORTANT OFFICIAL NOTIFICATION UPDATE</p>
  <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.5;">Staff Selection Commission has updated the recruitment timeline. Candidates are advised to register OTR on <strong>ssc.gov.in</strong> before the deadline.</p>
</div>

<h3>Key Important Dates:</h3>
<ul>
  <li><strong>Online Application Start Date:</strong> To be announced on official portal</li>
  <li><strong>Last Date to Apply:</strong> To be announced</li>
  <li><strong>Tier-1 Computer Based Exam:</strong> Expected soon</li>
  <li><strong>Tier-2 Mains Exam:</strong> To be notified post Tier-1</li>
</ul>

<h3>Eligibility Criteria:</h3>
<ul>
  <li><strong>Educational Qualification:</strong> Bachelor's Degree in any discipline from a recognized University.</li>
  <li><strong>Age Limit:</strong> 18 to 30/32 years (Relaxation applicable as per Govt norms).</li>
</ul>

<h3>Tier-1 Computer Based Exam Pattern:</h3>
<table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
  <thead>
    <tr style="background: #1e293b; color: #ffffff; text-align: left;">
      <th style="padding: 12px 14px; border: 1px solid #334155;">Section</th>
      <th style="padding: 12px 14px; border: 1px solid #334155;">Questions</th>
      <th style="padding: 12px 14px; border: 1px solid #334155;">Max Marks</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background: #ffffff;"><td style="padding: 10px 14px; border: 1px solid #e2e8f0;">1. General Intelligence & Reasoning</td><td style="padding: 10px 14px; border: 1px solid #e2e8f0;">25</td><td style="padding: 10px 14px; border: 1px solid #e2e8f0;">50</td></tr>
    <tr style="background: #f8fafc;"><td style="padding: 10px 14px; border: 1px solid #e2e8f0;">2. General Awareness & Current Affairs</td><td style="padding: 10px 14px; border: 1px solid #e2e8f0;">25</td><td style="padding: 10px 14px; border: 1px solid #e2e8f0;">50</td></tr>
    <tr style="background: #ffffff;"><td style="padding: 10px 14px; border: 1px solid #e2e8f0;">3. Quantitative Aptitude</td><td style="padding: 10px 14px; border: 1px solid #e2e8f0;">25</td><td style="padding: 10px 14px; border: 1px solid #e2e8f0;">50</td></tr>
    <tr style="background: #f8fafc;"><td style="padding: 10px 14px; border: 1px solid #e2e8f0;">4. English Comprehension</td><td style="padding: 10px 14px; border: 1px solid #e2e8f0;">25</td><td style="padding: 10px 14px; border: 1px solid #e2e8f0;">50</td></tr>
  </tbody>
</table>

<div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: #ffffff; padding: 22px 26px; border-radius: 16px; margin: 25px 0; box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.3);">
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <span style="background: rgba(255,255,255,0.2); font-weight: 800; font-size: 11px; padding: 3px 8px; border-radius: 6px; width: fit-content; text-transform: uppercase;">100% Authentic Shift Papers</span>
    <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #ffffff;">Practice Official SSC Shift Papers in Real CBT Exam Mode</h3>
    <p style="margin: 0; font-size: 13px; color: #dbeafe; line-height: 1.4;">Attempt timed tests with instant percentile scorecards, bilingual solutions, and clean PDF downloads on SSCZone.</p>
    <a href="/papers" style="display: inline-block; margin-top: 10px; background: #ffffff; color: #1e3a8a; font-weight: 800; padding: 10px 18px; border-radius: 10px; text-decoration: none; font-size: 13px; width: fit-content;">Attempt CBT Test Now →</a>
  </div>
</div>`
  },
  {
    name: "🔑 Answer Key & Response Sheet",
    category: "Answer Key & Results",
    examTag: "SSC CHSL",
    focusKeyword: "SSC CHSL Tier 1 Answer Key",
    title: "SSC CHSL Tier 1 Official Answer Key & Response Sheet: Direct Download Link",
    excerpt: "Staff Selection Commission has uploaded tentative answer keys and response sheets for SSC CHSL Tier-1. Check safe score calculations and expected cut-off trends.",
    content: `<h2>SSC CHSL Tier 1 Answer Key Released</h2>
<p>The Staff Selection Commission has officially uploaded the tentative answer keys along with candidate response sheets for the Combined Higher Secondary (10+2) Level Tier-1 Examination.</p>

<div style="background: #fffbeb; border: 1px solid #fde68a; border-left: 5px solid #d97706; padding: 16px 20px; border-radius: 12px; margin: 20px 0;">
  <p style="margin: 0 0 6px 0; font-weight: 800; color: #92400e; font-size: 15px;">⚠️ OBJECTION WINDOW GUIDELINES</p>
  <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.5;">Representations in respect of tentative answer keys must be submitted online before the closing date upon payment of ₹100 per question challenged.</p>
</div>

<h3>Steps to Check Answer Key:</h3>
<ol>
  <li>Visit the official candidate login link on <strong>ssc.gov.in</strong>.</li>
  <li>Enter your Roll Number / User ID and Password.</li>
  <li>Download your official question paper with recorded responses.</li>
</ol>`
  },
  {
    name: "💡 Subject Strategy & Topper Tips",
    category: "Preparation Strategy",
    examTag: "SSC Maths",
    focusKeyword: "Score 45+ in SSC Maths",
    title: "How to Score 45+ in SSC Maths (Arithmetic & Advance): Complete Guide",
    excerpt: "Step-by-step preparation strategy, chapter-wise weightage analysis, and speed calculation tricks to score full marks in Quantitative Aptitude.",
    content: `<h2>Comprehensive Maths Preparation Blueprint</h2>
<p>Quantitative Aptitude tests speed, conceptual clarity, and accuracy. Under TCS pattern questions, calculation intensity has increased while standard formula questions remain predictable.</p>

<div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 18px 22px; border-radius: 12px; margin: 20px 0; font-family: monospace;">
  <p style="margin: 0 0 8px 0; font-weight: 800; color: #0f172a; font-size: 14px; font-family: sans-serif;">📐 ESSENTIAL QUANTITATIVE IDENTITIES:</p>
  <p style="margin: 4px 0; font-size: 14px; color: #1e293b;">• If <strong>x + 1/x = k</strong>, then <strong>x² + 1/x² = k² - 2</strong></p>
  <p style="margin: 4px 0; font-size: 14px; color: #1e293b;">• If <strong>x + 1/x = k</strong>, then <strong>x³ + 1/x³ = k³ - 3k</strong></p>
</div>

<h3>1. High-Yield Arithmetic Core:</h3>
<ul>
  <li><strong>Percentage & Fractions:</strong> Memorize fraction to percentage values (1/2 to 1/20).</li>
  <li><strong>Profit, Loss & Discount:</strong> Learn multiplying factors and marked price shortcuts.</li>
  <li><strong>Time & Work:</strong> Efficiency & LCM method.</li>
</ul>

<h3>2. Advance Maths Focus:</h3>
<ul>
  <li><strong>Geometry:</strong> Triangle angle bisector theorem, circumcentre & incentre properties.</li>
  <li><strong>Trigonometry:</strong> Pythagorean triplets and value-putting techniques (θ = 45° or 30°/60°).</li>
  <li><strong>Algebra:</strong> Symmetric polynomial standard identities.</li>
</ul>`
  }
];

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Editor State
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Exam Notification");
  const [examTag, setExamTag] = useState("SSC CGL");
  const [focusKeyword, setFocusKeyword] = useState("SSC CGL 2026 Notification");
  const [secondaryKeywords, setSecondaryKeywords] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Tab within editor: Edit Form vs Live Student Preview
  const [editorTab, setEditorTab] = useState<"edit" | "preview">("edit");
  
  // List Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [seedingDefaults, setSeedingDefaults] = useState(false);

  useEffect(() => {
    loadBlogs();
  }, []);

  async function loadBlogs() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .not("keywords", "ilike", "%system-report%")
        .not("slug", "ilike", "sys-report%")
        .order("created_at", { ascending: false });
        
      if (error) {
        toast.error("Error loading blogs: " + error.message);
      } else {
        const enriched = (data || []).map((b) => {
          let meta: any = {};
          if (b.keywords && typeof b.keywords === "string") {
            try {
              meta = JSON.parse(b.keywords);
            } catch {
              meta = { focus: b.keywords };
            }
          }
          return {
            ...b,
            category: b.category || meta.category || "Exam Notification",
            exam_tag: b.exam_tag || meta.examTag || "SSC CGL",
            focus_keyword: meta.focus || "",
            seo_score: typeof meta.seoScore === "number" ? meta.seoScore : 85,
          };
        });

        setBlogs(enriched);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }

  // 1-Click Seed Official SSC Starter Blogs into Supabase
  async function handleSeedDefaults() {
    if (!confirm("This will seed 5 official SSC starter blog posts into your Supabase database. You can freely edit or delete any of them afterwards. Proceed?")) return;
    setSeedingDefaults(true);
    const toastId = toast.loading("Seeding starter blog posts into Supabase...");
    try {
      const res = await fetch("/api/admin/blogs/seed-defaults", { method: "POST" });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed to seed default blogs");
      toast.success(data.message || "Starter blogs seeded successfully! 🎉", { id: toastId });
      loadBlogs();
    } catch (err: any) {
      toast.error(err.message || "Failed to seed blogs", { id: toastId });
    } finally {
      setSeedingDefaults(false);
    }
  }

  // Auto-generate slug from title
  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setTitle(val);
    if (!editingId) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generatedSlug);
      if (!seoTitle) {
        setSeoTitle(`${val} | SSCZone`);
      }
    }
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setCategory("Exam Notification");
    setExamTag("SSC CGL");
    setFocusKeyword("");
    setSecondaryKeywords("");
    setContent("");
    setExcerpt("");
    setSeoTitle("");
    setImageUrl("");
    setIsPublished(true);
    setEditorTab("edit");
  }

  function applyTemplate(tpl: typeof POST_TEMPLATES[0]) {
    setTitle(tpl.title);
    setCategory(tpl.category);
    setExamTag(tpl.examTag || "SSC CGL");
    setFocusKeyword(tpl.focusKeyword || "");
    setExcerpt(tpl.excerpt);
    setContent(tpl.content);
    const generatedSlug = tpl.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setSlug(generatedSlug);
    setSeoTitle(`${tpl.title} | SSCZone`);
    setSecondaryKeywords("SSC, CGL, CHSL, Notification, Syllabus, Admit Card");
    toast.success(`Template applied: ${tpl.name}! 🚀`);
  }

  function handleEdit(blog: any) {
    setEditingId(blog.id);
    setTitle(blog.title || "");
    setSlug(blog.slug || "");
    
    let meta: any = {};
    if (blog.keywords && typeof blog.keywords === "string") {
      try {
        meta = JSON.parse(blog.keywords);
      } catch {
        meta = { focus: blog.keywords };
      }
    }

    setCategory(blog.category || meta.category || "Exam Notification");
    setExamTag(blog.exam_tag || meta.examTag || "SSC CGL");
    setFocusKeyword(meta.focus || blog.keywords || "");
    setSecondaryKeywords(meta.secondary || "");
    setContent(blog.content || "");
    setExcerpt(blog.excerpt || "");
    setSeoTitle(blog.seo_title || "");
    setImageUrl(blog.image_url || "");
    setIsPublished(blog.is_published ?? true);
    setEditorTab("edit");
    setShowEditor(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this blog post? This cannot be undone.")) return;
    
    try {
      const res = await fetch("/api/admin/blogs/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Blog deleted successfully from Supabase!");
      setBlogs((prev) => prev.filter((b) => b.id !== id));
      loadBlogs();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete blog");
    }
  }

  // 1-Click Quick Publish / Unpublish Toggle from Table
  async function togglePublishStatus(blog: any) {
    const newStatus = !blog.is_published;
    try {
      const res = await fetch("/api/admin/blogs/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...blog,
          is_published: newStatus,
        }),
      });
      if (!res.ok) throw new Error("Status update failed");
      toast.success(newStatus ? "Post is now Live! 🟢" : "Post moved to Drafts 🟡");
      setBlogs((prev) => prev.map((b) => (b.id === blog.id ? { ...b, is_published: newStatus } : b)));
    } catch (err: any) {
      toast.error(err.message || "Failed to update publish status");
    }
  }

  // Direct Image Upload to Supabase Storage
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const toastId = toast.loading("Uploading cover image to Supabase Storage...");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/admin/blogs/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload image");

      setImageUrl(data.url);
      toast.success("Cover image uploaded to Supabase Storage!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image", { id: toastId });
    } finally {
      setUploadingImage(false);
    }
  }

  // Insert Educational Snippet Block into Content
  function handleInsertSnippet(snippetHtml: string) {
    setContent((prev) => (prev ? prev + "\n" + snippetHtml : snippetHtml));
    toast.success("Educational block added to article!");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      toast.error("Article Title and URL Slug are required!");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Saving article to Supabase database...");

    try {
      const res = await fetch("/api/admin/blogs/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          title: title.trim(),
          slug: slug.trim(),
          content,
          excerpt: excerpt.trim() || content.replace(/<[^>]*>?/gm, "").substring(0, 160) + "...",
          seo_title: seoTitle.trim() || `${title.trim()} | SSCZone`,
          focus_keyword: focusKeyword.trim(),
          category,
          exam_tag: examTag,
          image_url: imageUrl.trim() || null,
          is_published: isPublished,
          secondary_keywords: secondaryKeywords,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save blog post");

      toast.success(
        editingId ? "Article updated successfully in Supabase! 🎉" : "New article published to Supabase! 🚀",
        { id: toastId }
      );

      setShowEditor(false);
      resetForm();
      loadBlogs();
    } catch (err: any) {
      toast.error(`Save Failed: ${err.message}`, { id: toastId });
    } finally {
      setSaving(false);
    }
  }

  // Filtered List
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchCategory = selectedCategoryFilter === "All" || b.category === selectedCategoryFilter;
      const matchSearch =
        searchQuery.trim() === "" ||
        b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.focus_keyword?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [blogs, selectedCategoryFilter, searchQuery]);

  // Statistics
  const totalCount = blogs.length;
  const publishedCount = blogs.filter((b) => b.is_published).length;
  const draftCount = totalCount - publishedCount;

  return (
    <div className="space-y-6 text-left antialiased font-sans">
      
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Newspaper className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Blog & Educational Content Studio
              </h1>
              <p className="text-xs text-gray-400">
                Publish exam notifications, syllabus guides, formula notes & articles with Rank-Math style SEO.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleSeedDefaults}
            disabled={seedingDefaults}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-700/60 bg-emerald-950/40 px-3.5 py-2 text-xs font-bold text-emerald-300 hover:text-white hover:bg-emerald-900/60 transition-all cursor-pointer disabled:opacity-50"
            title="Seed 5 official SSC starter blog posts into Supabase"
          >
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>{seedingDefaults ? "Seeding..." : "Seed Starter Blogs"}</span>
          </button>

          <Link
            href="/blog"
            target="_blank"
            className="flex items-center gap-1.5 rounded-xl border border-gray-700 bg-gray-800/80 px-3.5 py-2 text-xs font-bold text-gray-300 hover:text-white hover:border-gray-600 transition-all cursor-pointer"
          >
            <Globe className="h-4 w-4 text-blue-400" />
            <span>View Live Blog</span>
            <ExternalLink className="h-3 w-3 text-gray-400" />
          </Link>

          <button
            onClick={() => {
              resetForm();
              setShowEditor(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-black text-white shadow-lg shadow-blue-950 hover:opacity-90 transition-all cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Write New Article</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Articles</span>
          <p className="text-2xl font-black text-white mt-0.5">{totalCount}</p>
        </div>
        <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-4">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Published & Live</span>
          <p className="text-2xl font-black text-emerald-400 mt-0.5">{publishedCount}</p>
        </div>
        <div className="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-4">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Drafts</span>
          <p className="text-2xl font-black text-amber-400 mt-0.5">{draftCount}</p>
        </div>
        <div className="rounded-2xl border border-blue-900/40 bg-blue-950/20 p-4">
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Database Storage</span>
          <p className="text-2xl font-black text-blue-400 mt-0.5">Supabase Connected</p>
        </div>
      </div>

      {/* --- WRITE / EDIT MODAL & DRAWER --- */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-5xl max-h-[94vh] flex flex-col rounded-3xl border border-gray-700 bg-gray-900 shadow-2xl overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Header */}
            <div className="flex items-center justify-between border-b border-gray-800 p-4 sm:p-5 bg-gray-950">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {editingId ? "Edit Article & SEO" : "Create New Educational Article / Update"}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Connected to Supabase PostgreSQL • Real-Time Rank-Math Keyword Audit
                  </p>
                </div>
              </div>

              {/* Edit vs Preview Toggle Buttons */}
              <div className="flex items-center gap-2">
                <div className="flex rounded-xl bg-gray-800 p-1 border border-gray-700">
                  <button
                    type="button"
                    onClick={() => setEditorTab("edit")}
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                      editorTab === "edit" ? "bg-blue-600 text-white shadow-xs" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Editor & SEO
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab("preview")}
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                      editorTab === "preview" ? "bg-blue-600 text-white shadow-xs" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Live Reader View
                  </button>
                </div>

                <button
                  onClick={() => setShowEditor(false)}
                  className="rounded-xl border border-gray-800 p-2 text-gray-400 hover:bg-gray-800 hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar text-xs">
              
              {/* Quick Template Fillers */}
              {!editingId && editorTab === "edit" && (
                <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-blue-300">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span>1-Click Post Starter Templates:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {POST_TEMPLATES.map((tpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => applyTemplate(tpl)}
                        className="rounded-xl border border-blue-400/30 bg-blue-900/40 hover:bg-blue-600 hover:text-white px-2.5 py-1 text-[11px] font-bold text-blue-200 transition-all cursor-pointer"
                      >
                        {tpl.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* --- EDIT TAB CONTENT --- */}
              {editorTab === "edit" ? (
                <form id="blog-form" onSubmit={handleSave} className="space-y-5">
                  
                  {/* Title & Slug */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block font-bold text-gray-300">
                        Article Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. SSC CGL 2026 Notification Out: Eligibility, Dates & Pattern"
                        value={title}
                        onChange={handleTitleChange}
                        required
                        className="w-full rounded-xl border border-gray-700 bg-gray-800/90 px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-gray-300">
                        Clean URL Slug <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center rounded-xl border border-gray-700 bg-gray-800/90 px-3.5 py-2.5">
                        <span className="text-gray-500 mr-1 select-none font-mono">ssczone.com/blog/</span>
                        <input
                          type="text"
                          placeholder="ssc-cgl-2026-notification"
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          required
                          className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category, Exam Tag & Publish Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block font-bold text-gray-300">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="Exam Notification">📢 Exam Notification</option>
                        <option value="Answer Key & Results">🔑 Answer Key & Results</option>
                        <option value="Preparation Strategy">💡 Preparation Strategy</option>
                        <option value="Current Affairs">📰 Current Affairs</option>
                        <option value="Topper Interviews">🏆 Topper Interviews</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-gray-300">Target Exam</label>
                      <select
                        value={examTag}
                        onChange={(e) => setExamTag(e.target.value)}
                        className="w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="SSC CGL">SSC CGL</option>
                        <option value="SSC CHSL">SSC CHSL</option>
                        <option value="SSC CPO">SSC CPO</option>
                        <option value="SSC MTS">SSC MTS</option>
                        <option value="SSC GD">SSC GD Constable</option>
                        <option value="SSC Maths">SSC Maths (Quantitative)</option>
                        <option value="SSC Reasoning">SSC Reasoning</option>
                        <option value="All SSC Exams">All SSC Exams</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-gray-300">Publication State</label>
                      <div className="flex items-center gap-2 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                          <input
                            type="checkbox"
                            checked={isPublished}
                            onChange={(e) => setIsPublished(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-0"
                          />
                          <span className="font-semibold">{isPublished ? "🟢 Publish Live" : "🟡 Save as Draft"}</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Featured Banner Image Upload (Direct to Supabase Storage) */}
                  <div className="space-y-1">
                    <label className="block font-bold text-gray-300">
                      Cover Banner Image (Crucial for Google Discover & Social Cards)
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        placeholder="Paste image URL or upload directly to Supabase below..."
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="flex-1 rounded-xl border border-gray-700 bg-gray-800/90 px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                      />
                      <label className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border border-blue-500/40 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white px-4 py-2.5 text-xs font-bold transition-all shadow-2xs">
                        <Upload className="h-3.5 w-3.5" />
                        <span>{uploadingImage ? "Uploading..." : "📷 Upload to Supabase"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>
                    {imageUrl && (
                      <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Image Linked: <a href={imageUrl} target="_blank" rel="noreferrer" className="underline">{imageUrl.substring(0, 50)}...</a></span>
                      </p>
                    )}
                  </div>

                  {/* Excerpt / Short Summary */}
                  <div className="space-y-1">
                    <label className="block font-bold text-gray-300">
                      Short Excerpt / Meta Description (120-160 characters for Google snippet)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="A quick 1-2 sentence compelling summary of this post for Google search results..."
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      className="w-full rounded-xl border border-gray-700 bg-gray-800/90 px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Main Rich Content Editor */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-gray-300">
                        Article Content & Education Notes <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] text-gray-500">
                        Supports Formatted Headings, Lists, Tables & Math Equations
                      </span>
                    </div>

                    <div className="rounded-2xl border border-gray-700 bg-gray-800/90 overflow-hidden text-gray-900">
                      <RichTextEditor value={content} onChange={setContent} />
                    </div>
                  </div>

                  {/* ── ADVANCED RANK-MATH STYLE SEO & KEYWORD STUDIO ── */}
                  <SeoKeywordPanel
                    title={title}
                    slug={slug}
                    content={content}
                    excerpt={excerpt}
                    focusKeyword={focusKeyword}
                    onFocusKeywordChange={setFocusKeyword}
                    imageUrl={imageUrl}
                    onInsertSnippet={handleInsertSnippet}
                  />

                </form>
              ) : (
                /* --- LIVE READER VIEW TAB --- */
                <div className="space-y-6 bg-white text-gray-900 p-6 sm:p-8 rounded-3xl shadow-inner text-left">
                  
                  {/* Article Header Preview */}
                  <div className="space-y-3 border-b border-gray-200 pb-5">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-800">
                        {category}
                      </span>
                      <span className="rounded-md bg-gray-100 px-2.5 py-0.5 text-[11px] font-bold text-gray-700">
                        {examTag}
                      </span>
                      {focusKeyword && (
                        <span className="rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold">
                          Focus: {focusKeyword}
                        </span>
                      )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                      {title || "Untitled Article"}
                    </h1>

                    <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                      <span>By SSCZone Editorial Team</span>
                      <span>•</span>
                      <span>Published on {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>

                  {/* Image Preview */}
                  {imageUrl && (
                    <div className="rounded-2xl overflow-hidden border border-gray-200">
                      <img src={imageUrl} alt={title} className="w-full h-auto object-cover max-h-[380px]" />
                    </div>
                  )}

                  {/* Body Content */}
                  <div 
                    className="prose prose-slate max-w-none text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: content || "<p className='text-gray-400 italic'>Content preview will appear here...</p>" }}
                  />
                </div>
              )}

            </div>

            {/* Modal Bottom Footer */}
            <div className="flex items-center justify-between border-t border-gray-800 p-4 sm:p-5 bg-gray-950">
              <button
                type="button"
                onClick={() => setShowEditor(false)}
                className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5 text-xs font-bold text-gray-300 hover:bg-gray-700 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="blog-form"
                disabled={saving || uploadingImage}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-black text-white shadow-lg shadow-blue-950 hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <span>Saving to Supabase...</span>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{editingId ? "Update Article in Supabase" : "Save & Publish to Supabase"}</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SEARCH & CATEGORY FILTER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-gray-800 bg-gray-900/60 p-3">
        
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search articles by title, slug, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-800 bg-gray-900 pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {["All", "Exam Notification", "Answer Key & Results", "Preparation Strategy", "Current Affairs"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategoryFilter === cat
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* ARTICLES DATA TABLE / CARDS */}
      {loading ? (
        <div className="py-16 text-center text-gray-400 text-xs">
          Loading blog updates from database...
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="rounded-3xl border border-gray-800 bg-gray-900/40 p-12 text-center max-w-md mx-auto space-y-3">
          <Newspaper className="h-10 w-10 text-gray-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No articles published yet in Supabase</h3>
          <p className="text-xs text-gray-400">Click &apos;+ Write New Article&apos; or seed the 5 official starter articles into your database.</p>
          <div className="flex items-center justify-center gap-2.5 pt-2 flex-wrap">
            <button
              onClick={() => {
                resetForm();
                setShowEditor(true);
              }}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 cursor-pointer"
            >
              Create Article Now
            </button>
            <button
              onClick={handleSeedDefaults}
              disabled={seedingDefaults}
              className="rounded-xl border border-emerald-700/60 bg-emerald-950/40 px-3.5 py-2 text-xs font-bold text-emerald-300 hover:text-white hover:bg-emerald-900/60 transition-all cursor-pointer disabled:opacity-50"
            >
              {seedingDefaults ? "Seeding..." : "🌱 Seed 5 Starter Blogs"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBlogs.map((blog) => (
            <div
              key={blog.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-gray-800 bg-gray-900/80 p-4 transition-all hover:border-gray-700 hover:bg-gray-900 shadow-xs text-left"
            >
              {/* Left Details */}
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-black shrink-0">
                  <Newspaper className="h-5 w-5" />
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Status Pill */}
                    <button
                      onClick={() => togglePublishStatus(blog)}
                      title="Click to toggle live status"
                      className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        blog.is_published
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {blog.is_published ? "🟢 Live" : "🟡 Draft"}
                    </button>

                    {blog.category && (
                      <span className="rounded-md bg-gray-800 px-2 py-0.5 text-[10px] font-bold text-gray-300">
                        {blog.category}
                      </span>
                    )}

                    {blog.exam_tag && (
                      <span className="rounded-md bg-blue-900/30 text-blue-400 px-1.5 py-0.5 text-[10px] font-bold">
                        {blog.exam_tag}
                      </span>
                    )}

                    {blog.focus_keyword && (
                      <span className="rounded-md bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 px-1.5 py-0.5 text-[10px] font-bold">
                        Target: {blog.focus_keyword}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                    {blog.title}
                  </h3>

                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1 font-mono text-gray-500">
                      /blog/{blog.slug}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(blog.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                
                {/* View Public Link */}
                <Link
                  href={`/blog/${blog.slug}`}
                  target="_blank"
                  className="p-2 rounded-xl border border-gray-800 bg-gray-800/80 text-gray-400 hover:text-white hover:border-gray-700 transition-all cursor-pointer"
                  title="View Public Post"
                >
                  <Eye className="h-4 w-4" />
                </Link>

                {/* Edit Button */}
                <button
                  onClick={() => handleEdit(blog)}
                  className="flex items-center gap-1 rounded-xl bg-blue-600/20 border border-blue-500/30 px-3 py-2 text-xs font-bold text-blue-300 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(blog.id)}
                  className="p-2 rounded-xl border border-rose-900/30 bg-rose-950/20 text-rose-400 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                  title="Delete post"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
