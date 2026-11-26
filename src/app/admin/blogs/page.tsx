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
  Image as ImageIcon,
  BookOpen
} from "lucide-react";
import Link from "next/link";

// Custom Category & Blog Management


export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Editor State
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [examTag, setExamTag] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
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

  // Dynamic Blog Categories State (Connected to Supabase)
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  useEffect(() => {
    loadBlogs();
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const res = await fetch("/api/admin/blog-categories", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }

  async function handleAddCategory(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!newCatName.trim()) {
      toast.error("Please enter a category name");
      return;
    }
    setAddingCategory(true);
    try {
      const res = await fetch("/api/admin/blog-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create category");
      setCategories(data.categories || []);
      setCategory(newCatName.trim());
      setNewCatName("");
      toast.success("Category saved to Supabase! 🎉");
    } catch (err: any) {
      toast.error(err.message || "Failed to add category");
    } finally {
      setAddingCategory(false);
    }
  }

  async function handleDeleteCategory(id: string, name: string) {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/blog-categories?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete category");
      setCategories(data.categories || []);
      if (category === name) setCategory("");
      toast.success("Category removed!");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category");
    }
  }

  async function loadBlogs() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/blogs", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.blogs) {
        setBlogs(data.blogs);
      } else {
        toast.error(data.error || "Failed to load blogs from Supabase");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load blogs");
    } finally {
      setLoading(false);
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
    setCategory(categories[0]?.name || "Biology");
    setExamTag("");
    setFocusKeyword("");
    setSecondaryKeywords("");
    setContent("");
    setExcerpt("");
    setSeoTitle("");
    setImageUrl("");
    setIsPublished(true);
    setEditorTab("edit");
  }

  async function handleEdit(blog: any) {
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

    setCategory(blog.category || meta.category || "");
    setExamTag(blog.exam_tag !== undefined ? (blog.exam_tag ?? "") : (meta.examTag ?? ""));
    setFocusKeyword(blog.focus_keyword || meta.focus || blog.keywords || "");
    setSecondaryKeywords(blog.secondary_keywords || meta.secondary || "");
    setExcerpt(blog.excerpt || "");
    setSeoTitle(blog.seo_title || "");
    setImageUrl(blog.image_url || "");
    setIsPublished(blog.is_published ?? true);
    setEditorTab("edit");
    setShowEditor(true);

    if (blog.content !== undefined) {
      setContent(blog.content || "");
    } else {
      setContent("");
      try {
        const res = await fetch(`/api/admin/blogs?id=${encodeURIComponent(blog.id)}`);
        const data = await res.json();
        if (data.success && data.blog) {
          const loadedContent = data.blog.content || "";
          setContent(loadedContent);
          setBlogs((prev) =>
            prev.map((b) => (b.id === blog.id ? { ...b, content: loadedContent } : b))
          );
        }
      } catch (err) {
        console.error("Failed to load blog content:", err);
      }
    }
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
          id: blog.id,
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

  // Direct Image Upload to Cloudflare R2 Storage
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const toastId = toast.loading("Uploading cover image to Cloudflare R2...");

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
      toast.success("Cover image uploaded to Cloudflare R2!", { id: toastId });
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
      loadCategories();
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
            type="button"
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-blue-700/60 bg-blue-950/40 px-3.5 py-2 text-xs font-bold text-blue-300 hover:text-white hover:bg-blue-900/60 transition-all cursor-pointer"
          >
            <span>🏷️ Categories ({categories.length})</span>
          </button>

          <Link
            href="/admin/chapter-notes"
            className="flex items-center gap-1.5 rounded-xl border border-indigo-700/60 bg-indigo-950/40 px-3.5 py-2 text-xs font-bold text-indigo-300 hover:text-white hover:bg-indigo-900/60 transition-all cursor-pointer"
          >
            <BookOpen className="h-4 w-4 text-indigo-400" />
            <span>Chapter Notes Manager</span>
          </Link>

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
                        placeholder="e.g. Cell: The Unit of Life – Complete Biology Notes"
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
                          placeholder="cell-the-unit-of-life"
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
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-gray-300">Category (श्रेणी)</label>
                        <button
                          type="button"
                          onClick={() => setShowCategoryModal(true)}
                          className="text-[10px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                        >
                          🏷️ Manage All
                        </button>
                      </div>

                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          list="blog-category-suggestions"
                          placeholder="Type or pick any category (e.g. Biology)..."
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="flex-1 rounded-xl border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none font-medium"
                        />
                        <datalist id="blog-category-suggestions">
                          {categories.map((c) => (
                            <option key={c.id} value={c.name} />
                          ))}
                        </datalist>

                        {category.trim() && !categories.some((c) => c.name.toLowerCase() === category.trim().toLowerCase()) && (
                          <button
                            type="button"
                            onClick={() => {
                              setNewCatName(category.trim());
                              handleAddCategory();
                            }}
                            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold whitespace-nowrap cursor-pointer shadow-xs"
                            title="Save this new category to your permanent categories list"
                          >
                            + Save
                          </button>
                        )}

                        {category && (
                          <button
                            type="button"
                            onClick={() => setCategory("")}
                            className="px-2.5 py-1.5 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-xs font-bold"
                            title="Clear category"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Quick chips of existing categories */}
                      {categories.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          <span className="text-[10px] text-gray-400 font-semibold">Quick Pick:</span>
                          {categories.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setCategory(c.name)}
                              className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                                category.toLowerCase() === c.name.toLowerCase()
                                  ? "bg-blue-600 text-white border-blue-500 font-bold shadow-xs"
                                  : "bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-500 hover:text-white"
                              }`}
                            >
                              {c.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-gray-300">Exam Tag</label>
                        {examTag && (
                          <button
                            type="button"
                            onClick={() => setExamTag("")}
                            className="text-[10px] text-rose-400 hover:text-rose-300 font-bold"
                            title="Remove tag from this article"
                          >
                            ✕ Remove Tag
                          </button>
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={examTag}
                          onChange={(e) => setExamTag(e.target.value)}
                          placeholder="e.g. SSC CGL (leave empty for none)"
                          className="flex-1 rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                        />
                        <select
                          value={["SSC CGL", "SSC CHSL", "SSC CPO", "SSC MTS", "SSC GD", "SSC Maths", "SSC Reasoning", "All SSC Exams"].includes(examTag) ? examTag : ""}
                          onChange={(e) => setExamTag(e.target.value)}
                          className="w-32 rounded-xl border border-gray-700 bg-gray-800 px-2 py-2 text-[11px] text-gray-300 focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">Quick Pick...</option>
                          <option value="SSC CGL">SSC CGL</option>
                          <option value="SSC CHSL">SSC CHSL</option>
                          <option value="SSC CPO">SSC CPO</option>
                          <option value="SSC MTS">SSC MTS</option>
                          <option value="SSC GD">SSC GD</option>
                          <option value="SSC Maths">Maths</option>
                          <option value="SSC Reasoning">Reasoning</option>
                          <option value="All SSC Exams">All SSC</option>
                        </select>
                      </div>
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

                  {/* SEO Target Keywords & Tags (Top Quick-Access) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-indigo-300 text-xs">
                          🎯 Primary Focus Keyword <span className="text-rose-400">*</span>
                        </label>
                        <span className="text-[10px] text-gray-400">Main Google search phrase</span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. SSC CGL 2026 Notification or Cell: The Unit of Life"
                        value={focusKeyword}
                        onChange={(e) => setFocusKeyword(e.target.value)}
                        className="w-full rounded-xl border border-gray-700 bg-gray-800/90 px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-indigo-300 text-xs">
                          🏷️ Other / Secondary Keywords &amp; Tags
                        </label>
                        <span className="text-[10px] text-gray-400">Comma-separated</span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. SSC Biology Notes, Cell Organelles, TCS PYQs, Mitosis"
                        value={secondaryKeywords}
                        onChange={(e) => setSecondaryKeywords(e.target.value)}
                        className="w-full rounded-xl border border-gray-700 bg-gray-800/90 px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Featured Banner Image Upload (Direct to Cloudflare R2) */}
                  <div className="space-y-1">
                    <label className="block font-bold text-gray-300">
                      Cover Banner Image (Crucial for Google Discover & Social Cards)
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        placeholder="Paste image URL or upload directly to Cloudflare R2 below..."
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="flex-1 rounded-xl border border-gray-700 bg-gray-800/90 px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                      />
                      <label className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border border-blue-500/40 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white px-4 py-2.5 text-xs font-bold transition-all shadow-2xs">
                        <Upload className="h-3.5 w-3.5" />
                        <span>{uploadingImage ? "Uploading..." : "📷 Upload to Cloudflare R2"}</span>
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
                    secondaryKeywords={secondaryKeywords}
                    onSecondaryKeywordsChange={setSecondaryKeywords}
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

        {/* Dynamic Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategoryFilter("All")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategoryFilter === "All"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            All Articles ({blogs.length})
          </button>
          {categories.map((cat) => {
            const count = blogs.filter((b) => b.category?.toLowerCase() === cat.name.toLowerCase()).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.name)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategoryFilter === cat.name
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setShowCategoryModal(true)}
            className="rounded-xl px-2.5 py-1.5 text-xs font-bold bg-blue-950/60 border border-blue-800/60 text-blue-300 hover:bg-blue-600 hover:text-white transition-all whitespace-nowrap cursor-pointer flex items-center gap-1"
            title="Create a new custom category"
          >
            <span>+ Add Category</span>
          </button>
        </div>

      </div>

      {/* ARTICLES DATA TABLE / CARDS */}
      {loading ? (
        <div className="py-16 text-center text-gray-400 text-xs">
          Loading educational articles from database...
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="rounded-3xl border border-gray-800 bg-gray-900/40 p-12 text-center max-w-md mx-auto space-y-3">
          <Newspaper className="h-10 w-10 text-gray-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No articles found</h3>
          <p className="text-xs text-gray-400">Click &apos;+ Write New Article&apos; to create an educational chapter or article.</p>
          <div className="flex items-center justify-center gap-2.5 pt-2 flex-wrap">
            <button
              onClick={() => {
                resetForm();
                setShowEditor(true);
              }}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 cursor-pointer"
            >
              Write New Article Now
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

      {/* ── Manage Categories Modal (Connected to Supabase) ── */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 text-sm">🏷️</span>
                <div>
                  <h3 className="text-base font-bold text-white">Manage Blog Categories</h3>
                  <p className="text-xs text-gray-400">Created categories are stored in Supabase</p>
                </div>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Create Category Form */}
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter category name (e.g. Biology, Physics, Indian History)..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 rounded-xl border border-gray-700 bg-gray-800 px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={addingCategory}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold whitespace-nowrap disabled:opacity-50 transition-colors cursor-pointer"
              >
                {addingCategory ? "Creating..." : "+ Create Category"}
              </button>
            </form>

            {/* Category List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {categories.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500">
                  No custom categories yet. Add your first category above!
                </div>
              ) : (
                categories.map((c) => {
                  const count = blogs.filter((b) => b.category === c.name).length;
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 rounded-2xl border border-gray-800 bg-gray-800/40"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{c.name}</span>
                          <span className="text-[10px] bg-blue-900/40 border border-blue-800 text-blue-300 px-1.5 py-0.2 rounded-md font-bold">
                            {count} article{count !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500 block font-mono mt-0.5">slug: {c.slug}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(c.id, c.name)}
                        className="text-xs text-rose-400 hover:text-rose-300 font-bold px-2 py-1 rounded-lg hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete category"
                      >
                        ✕ Delete
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 border-t border-gray-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="px-5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
