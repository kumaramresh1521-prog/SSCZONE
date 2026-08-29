"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import RichTextEditor from "@/components/RichTextEditor";
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
  Maximize2
} from "lucide-react";
import Link from "next/link";

// Pre-configured Blog Post Quick Templates
const POST_TEMPLATES = [
  {
    name: "📢 Official Exam Notification",
    category: "Exam Notification",
    title: "SSC CGL 2026 Official Notification Out: Check Vacancy, Eligibility & Dates",
    excerpt: "Staff Selection Commission (SSC) has officially released the recruitment notification for Combined Graduate Level Examination (CGL) 2026.",
    content: `<h2>SSC CGL 2026 Notification Overview</h2>
<p>The Staff Selection Commission has released the official recruitment notification for Combined Graduate Level Examination (CGL) 2026. Eligible candidates can apply online through the official portal.</p>

<h3>Key Important Dates:</h3>
<ul>
  <li><strong>Online Application Start Date:</strong> To be announced</li>
  <li><strong>Last Date to Apply:</strong> To be announced</li>
  <li><strong>Tier-1 Computer Based Exam:</strong> Expected soon</li>
  <li><strong>Tier-2 Mains Exam:</strong> To be notified</li>
</ul>

<h3>Eligibility Criteria:</h3>
<ul>
  <li><strong>Educational Qualification:</strong> Bachelor's Degree in any discipline from a recognized University.</li>
  <li><strong>Age Limit:</strong> 18 to 30/32 years (Relaxation applicable as per Govt norms).</li>
</ul>

<h3>How to Apply:</h3>
<ol>
  <li>Visit the official SSC website (ssc.gov.in).</li>
  <li>Complete the One Time Registration (OTR) if not already done.</li>
  <li>Fill in the application details and upload latest photograph & signature.</li>
  <li>Pay the required application fee and submit the form.</li>
</ol>`
  },
  {
    name: "🔑 Answer Key & Response Sheet",
    category: "Answer Key & Results",
    title: "SSC CHSL Tier 1 Official Answer Key & Response Sheet Released",
    excerpt: "SSC has released the tentative answer keys along with candidates' response sheets for CHSL Tier-1 Examination.",
    content: `<h2>SSC CHSL Tier 1 Answer Key Released</h2>
<p>The Staff Selection Commission has uploaded the tentative Answer Keys along with candidates' Response Sheets for the Combined Higher Secondary (10+2) Level Examination (Tier-1).</p>

<h3>Steps to Check Answer Key:</h3>
<ol>
  <li>Click on the official response sheet login link.</li>
  <li>Enter your <strong>Roll Number (User ID)</strong> and <strong>Password</strong> (as per admission certificate).</li>
  <li>Download your question paper and response sheet.</li>
  <li>Submit representations/objections if any question or option has an error (₹100 per question challenged).</li>
</ol>

<h3>Important Objection Window:</h3>
<p>Representations in respect of the tentative Answer Keys must be submitted online before the closing date. Late objections will not be entertained under any circumstances.</p>`
  },
  {
    name: "💡 Subject Strategy & Topper Tips",
    category: "Preparation Strategy",
    title: "How to Score 45+ in SSC Maths (Arithmetic & Advance): Complete Guide",
    excerpt: "Step-by-step preparation strategy and chapter-wise weightage analysis to score full marks in SSC Quantitative Aptitude.",
    content: `<h2>Comprehensive Maths Preparation Blueprint</h2>
<p>Quantitative Aptitude is often the most scoring yet time-consuming section in SSC CGL, CHSL, and CPO exams. Follow this 3-tier strategy to boost your speed and accuracy.</p>

<h3>1. High-Yield Arithmetic Core:</h3>
<ul>
  <li><strong>Percentage & Ratio:</strong> Master fraction-to-percentage values (1/2 to 1/20).</li>
  <li><strong>Profit, Loss & Discount:</strong> Learn the multiplying factor and marked price concepts.</li>
  <li><strong>Time & Work:</strong> Unitary efficiency method.</li>
</ul>

<h3>2. Advance Maths (40% Weightage):</h3>
<ul>
  <li><strong>Geometry:</strong> Triangle centres, cyclic quadrilaterals, and tangent theorems.</li>
  <li><strong>Trigonometry:</strong> Pythagorean triplets and value putting tricks.</li>
  <li><strong>Algebra:</strong> Symmetric polynomial standard identities.</li>
</ul>

<h3>3. Daily Practice Routine:</h3>
<p>Solve 50-70 TCS previous year MCQs daily under a 45-minute timer. Never calculate on scratch paper what you can solve mentally.</p>`
  },
  {
    name: "📰 Monthly Current Affairs Capsule",
    category: "Current Affairs",
    title: "Monthly Current Affairs Capsule: Top 100 Most Expected TCS MCQs",
    excerpt: "High-frequency current affairs round-up covering Sports, Awards, Appointments, Government Schemes, and Summits.",
    content: `<h2>Top Monthly Current Affairs Highlights</h2>
<p>Here is the curated monthly digest of high-yield events and appointments asked in recent TCS pattern competitive examinations.</p>

<h3>Key National Appointments & Schemes:</h3>
<ul>
  <li>Major Cabinet & Constitutional Appointments.</li>
  <li>New Welfare Schemes & State Initiatives launched.</li>
</ul>

<h3>Sports & Major Awards:</h3>
<ul>
  <li>Grand Slam Winners & Cricket Tournament Highlights.</li>
  <li>National Film Awards & Literary Honours.</li>
</ul>

<h3>Science, Tech & Defence Exercises:</h3>
<ul>
  <li>ISRO Launch Missions & Satellite payloads.</li>
  <li>Joint Bilateral Military Exercises between India and Partner Nations.</li>
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
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [keywords, setKeywords] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Tab within editor: Edit Form vs Live Student Preview
  const [editorTab, setEditorTab] = useState<"edit" | "preview">("edit");
  
  // List Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");

  useEffect(() => {
    loadBlogs();
  }, []);

  async function loadBlogs() {
    setLoading(true);
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      if (error.code === '42P01') {
        toast.error("Blogs table not found in database! Please check Supabase schema.");
      } else {
        toast.error(error.message);
      }
    } else {
      setBlogs(data || []);
    }
    setLoading(false);
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
    }
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setCategory("Exam Notification");
    setExamTag("SSC CGL");
    setContent("");
    setExcerpt("");
    setSeoTitle("");
    setKeywords("");
    setImageUrl("");
    setIsPublished(true);
    setIsFeatured(false);
    setEditorTab("edit");
  }

  function applyTemplate(tpl: typeof POST_TEMPLATES[0]) {
    setTitle(tpl.title);
    setCategory(tpl.category);
    setExcerpt(tpl.excerpt);
    setContent(tpl.content);
    const generatedSlug = tpl.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setSlug(generatedSlug);
    setSeoTitle(`${tpl.title} | SSCZone`);
    setKeywords("SSC, CGL, CHSL, Notification, Syllabus, Admit Card");
    toast.success(`Template applied: ${tpl.name}! 🚀`);
  }

  function handleEdit(blog: any) {
    setEditingId(blog.id);
    setTitle(blog.title || "");
    setSlug(blog.slug || "");
    setCategory(blog.category || "Exam Notification");
    setExamTag(blog.exam_tag || "SSC CGL");
    setContent(blog.content || "");
    setExcerpt(blog.excerpt || "");
    setSeoTitle(blog.seo_title || "");
    setKeywords(blog.keywords || "");
    setImageUrl(blog.image_url || "");
    setIsPublished(blog.is_published ?? true);
    setIsFeatured(blog.is_featured ?? false);
    setEditorTab("edit");
    setShowEditor(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this blog post? This cannot be undone.")) return;
    
    const { error } = await supabase.from("blogs").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Blog deleted successfully!");
      loadBlogs();
    }
  }

  // 1-Click Quick Publish / Unpublish Toggle from Table
  async function togglePublishStatus(blog: any) {
    const newStatus = !blog.is_published;
    const { error } = await supabase
      .from("blogs")
      .update({ is_published: newStatus })
      .eq("id", blog.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(newStatus ? "Post is now Live! 🟢" : "Post moved to Drafts 🟡");
      setBlogs((prev) => prev.map((b) => (b.id === blog.id ? { ...b, is_published: newStatus } : b)));
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      toast.error("Title and URL Slug are required!");
      return;
    }

    setSaving(true);
    const payload: any = {
      title: title.trim(),
      slug: slug.trim(),
      content,
      excerpt: excerpt.trim() || content.replace(/<[^>]*>?/gm, '').substring(0, 160) + "...",
      seo_title: seoTitle.trim() || title.trim(),
      keywords: keywords.trim(),
      image_url: imageUrl.trim() || null,
      is_published: isPublished,
      updated_at: new Date().toISOString()
    };

    // Include category & exam_tag if present
    if (category) payload.category = category;
    if (examTag) payload.exam_tag = examTag;
    if (isFeatured !== undefined) payload.is_featured = isFeatured;

    let response;
    if (editingId) {
      response = await supabase.from("blogs").update(payload).eq("id", editingId);
    } else {
      response = await supabase.from("blogs").insert([payload]);
    }

    if (response.error) {
      toast.error(`Save Failed: ${response.error.message}`);
    } else {
      toast.success(editingId ? "Blog updated successfully! 🎉" : "New blog created and published! 🚀");
      setShowEditor(false);
      resetForm();
      loadBlogs();
    }
    setSaving(false);
  }

  // Filtered List
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchCategory = selectedCategoryFilter === "All" || b.category === selectedCategoryFilter;
      const matchSearch =
        searchQuery.trim() === "" ||
        b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category?.toLowerCase().includes(searchQuery.toLowerCase());

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
              <h1 className="text-xl sm:text-2xl font-black text-white">Blog & Exam Updates Portal</h1>
              <p className="text-xs text-gray-400">
                Publish exam notifications, admit cards, answer keys, study strategies & topper articles.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/blog"
            target="_blank"
            className="flex items-center gap-1.5 rounded-xl border border-gray-700 bg-gray-800/80 px-3.5 py-2 text-xs font-bold text-gray-300 hover:text-white hover:border-gray-600 transition-all"
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
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Categories</span>
          <p className="text-2xl font-black text-blue-400 mt-0.5">5 Categories</p>
        </div>
      </div>

      {/* --- WRITE / EDIT MODAL & DRAWER --- */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-gray-700 bg-gray-900 shadow-2xl overflow-hidden text-left"
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
                    {editingId ? "Edit Blog Article" : "Create New Blog / Exam Update"}
                  </h3>
                  <p className="text-xs text-gray-400">Rich Markdown & HTML Editor with Live Student Preview</p>
                </div>
              </div>

              {/* Edit vs Preview Toggle Buttons */}
              <div className="flex items-center gap-2">
                <div className="flex rounded-xl bg-gray-800 p-1 border border-gray-700">
                  <button
                    type="button"
                    onClick={() => setEditorTab("edit")}
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                      editorTab === "edit" ? "bg-blue-600 text-white shadow-xs" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Edit Form
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab("preview")}
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                      editorTab === "preview" ? "bg-blue-600 text-white shadow-xs" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Live Preview
                  </button>
                </div>

                <button
                  onClick={() => setShowEditor(false)}
                  className="rounded-xl border border-gray-800 p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar text-xs">
              
              {/* Quick Template Fillers (Only shown when creating new) */}
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
                <form id="blog-form" onSubmit={handleSave} className="space-y-4">
                  
                  {/* Title & Slug */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block font-bold text-gray-300">
                        Article Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. SSC CGL 2026 Notification Out: Complete Guide"
                        value={title}
                        onChange={handleTitleChange}
                        required
                        className="w-full rounded-xl border border-gray-700 bg-gray-800/90 px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-gray-300">
                        URL Slug <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center rounded-xl border border-gray-700 bg-gray-800/90 px-3 py-2">
                        <span className="text-gray-500 mr-1 select-none">/blog/</span>
                        <input
                          type="text"
                          placeholder="ssc-cgl-2026-notification"
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          required
                          className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
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
                        className="w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="Exam Notification">📢 Exam Notification</option>
                        <option value="Answer Key & Results">🔑 Answer Key & Results</option>
                        <option value="Preparation Strategy">💡 Preparation Strategy</option>
                        <option value="Current Affairs">📰 Current Affairs</option>
                        <option value="Topper Interviews">🏆 Topper Interviews</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-gray-300">Target Exam Tag</label>
                      <select
                        value={examTag}
                        onChange={(e) => setExamTag(e.target.value)}
                        className="w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="SSC CGL">SSC CGL</option>
                        <option value="SSC CHSL">SSC CHSL</option>
                        <option value="SSC CPO">SSC CPO</option>
                        <option value="SSC MTS">SSC MTS</option>
                        <option value="SSC GD">SSC GD</option>
                        <option value="All SSC Exams">All SSC Exams</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-gray-300">Publication State</label>
                      <div className="flex items-center gap-2 pt-1.5">
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

                  {/* Featured Image URL */}
                  <div className="space-y-1">
                    <label className="block font-bold text-gray-300">Cover Banner Image URL (Optional)</label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/... or /images/blog-banner.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full rounded-xl border border-gray-700 bg-gray-800/90 px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Excerpt / Short Summary */}
                  <div className="space-y-1">
                    <label className="block font-bold text-gray-300">
                      Short Excerpt (Displayed on blog cards & Google snippets)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="A quick 1-2 sentence summary of this post..."
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      className="w-full rounded-xl border border-gray-700 bg-gray-800/90 px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Main Rich Content Editor */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-gray-300">
                        Article Content (Rich Text / HTML) <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] text-gray-500">Supports Headings, Lists, Tables & Links</span>
                    </div>

                    <div className="rounded-2xl border border-gray-700 bg-gray-800/90 overflow-hidden text-gray-900">
                      <RichTextEditor value={content} onChange={setContent} />
                    </div>
                  </div>

                  {/* SEO Meta Box */}
                  <div className="rounded-2xl border border-gray-800 bg-gray-950 p-4 space-y-3">
                    <h4 className="font-bold text-gray-300 flex items-center gap-1.5">
                      <Search className="h-4 w-4 text-blue-400" />
                      <span>SEO & Search Engine Optimization</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-gray-400 font-semibold mb-1">SEO Meta Title</label>
                        <input
                          type="text"
                          placeholder={title || "SEO Page Title"}
                          value={seoTitle}
                          onChange={(e) => setSeoTitle(e.target.value)}
                          className="w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 font-semibold mb-1">SEO Keywords (Comma Separated)</label>
                        <input
                          type="text"
                          placeholder="SSC CGL 2026, Notification, Answer key, Syllabus"
                          value={keywords}
                          onChange={(e) => setKeywords(e.target.value)}
                          className="w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                </form>
              ) : (
                /* --- LIVE PREVIEW TAB --- */
                <div className="space-y-6 bg-white text-gray-900 p-6 rounded-2xl shadow-inner text-left">
                  
                  {/* Article Header Preview */}
                  <div className="space-y-2 border-b border-gray-200 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800">
                        {category}
                      </span>
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-700">
                        {examTag}
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                      {title || "Untitled Article Preview"}
                    </h1>

                    <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                      <span>By SSCZone Editorial Team</span>
                      <span>•</span>
                      <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      <span>•</span>
                      <span>4 min read</span>
                    </div>
                  </div>

                  {/* Cover Image Preview */}
                  {imageUrl && (
                    <div className="rounded-2xl overflow-hidden shadow-md max-h-[350px]">
                      <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Rendered HTML Content */}
                  <div 
                    className="prose prose-blue max-w-none text-xs sm:text-sm text-gray-800 leading-relaxed space-y-3"
                    dangerouslySetInnerHTML={{ __html: content || "<p>No content written yet...</p>" }}
                  />

                </div>
              )}

            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between border-t border-gray-800 p-4 bg-gray-950">
              <button
                type="button"
                onClick={() => setShowEditor(false)}
                className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5 text-xs font-bold text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="blog-form"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-black text-white shadow-lg shadow-blue-950 hover:opacity-90 transition-all cursor-pointer"
              >
                {saving ? (
                  <span>Saving Article...</span>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{editingId ? "Update Article" : "Save & Publish Post"}</span>
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
          <h3 className="text-sm font-bold text-white">No articles found</h3>
          <p className="text-xs text-gray-400">Click the "+ Write New Article" button to publish your first post!</p>
          <button
            onClick={() => {
              resetForm();
              setShowEditor(true);
            }}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500"
          >
            Create Article Now
          </button>
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
                      {new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                  className="p-2 rounded-xl border border-gray-800 bg-gray-800/80 text-gray-400 hover:text-white hover:border-gray-700 transition-all"
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
