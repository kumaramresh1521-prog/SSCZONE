"use client";

import { useEffect, useState } from "react";
import {
  Star,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  X,
  Sparkles,
  Award,
  Eye,
  RefreshCw,
  Quote,
  ShieldCheck,
  User,
  MapPin,
  Flame,
  ArrowUpDown
} from "lucide-react";
import toast from "react-hot-toast";
import { TopperTestimonial, DEFAULT_TESTIMONIALS } from "@/lib/testimonials-types";

const EMPTY_FORM: Partial<TopperTestimonial> = {
  name: "",
  exam: "SSC CGL 2024",
  rank: "AIR ",
  score: "340 / 390",
  photoUrl: "",
  state: "",
  badge: "Verified Topper",
  quote: "",
  rating: 5,
  isActive: true,
  sortOrder: 1,
};

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<TopperTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<TopperTestimonial>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch testimonials
  function fetchTestimonials() {
    setLoading(true);
    fetch("/api/admin/testimonials")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.testimonials) {
          setTestimonials(data.testimonials);
        }
      })
      .catch((e) => {
        console.warn("Error fetching testimonials:", e);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchTestimonials();
  }, []);

  function handleOpenAdd() {
    setFormData({
      ...EMPTY_FORM,
      sortOrder: testimonials.length + 1,
    });
    setIsModalOpen(true);
  }

  function handleOpenEdit(t: TopperTestimonial) {
    setFormData({ ...t });
    setIsModalOpen(true);
  }

  async function handleSave() {
    if (!formData.name?.trim()) {
      toast.error("Please enter student name");
      return;
    }
    if (!formData.quote?.trim()) {
      toast.error("Please write the topper testimonial quote");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          formData.id ? "Testimonial updated! 🌟" : "New Topper added to Hall of Fame! 🏆",
          { style: { borderRadius: "12px", background: "#065f46", color: "#fff" } }
        );
        setIsModalOpen(false);
        fetchTestimonials();
      } else {
        throw new Error(data.error || "Save failed");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to save testimonial");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(t: TopperTestimonial) {
    try {
      const updated = { ...t, isActive: !t.isActive };
      const res = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          updated.isActive ? "Testimonial published live!" : "Testimonial paused from homepage",
          { icon: updated.isActive ? "👁️" : "⏸️" }
        );
        fetchTestimonials();
      }
    } catch {
      toast.error("Failed to toggle status");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this topper testimonial?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/testimonials?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Testimonial deleted");
        fetchTestimonials();
      } else {
        throw new Error(data.error || "Delete failed");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Award className="h-5 w-5" />
            </span>
            <span>Topper Testimonials &amp; Reviews</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Build 10x student trust &amp; platform credibility. Add verified AIR rankers, student photos, scores, and exam reviews for the Homepage.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-2.5 text-xs sm:text-sm font-black text-slate-950 shadow-md active:scale-98 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Topper Review</span>
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-gray-500 uppercase">Total Reviews</div>
          <div className="text-2xl font-black text-gray-900 mt-1">{testimonials.length}</div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-emerald-700 uppercase">Live on Homepage</div>
          <div className="text-2xl font-black text-emerald-800 mt-1">
            {testimonials.filter((t) => t.isActive).length}
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-blue-700 uppercase">Average Rating</div>
          <div className="text-2xl font-black text-blue-800 mt-1 flex items-center gap-1">
            <span>5.0</span>
            <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
          </div>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-purple-700 uppercase">Top Exam</div>
          <div className="text-xl font-black text-purple-900 mt-1 truncate">SSC CGL</div>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-xs">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span>Active Student Wall of Fame</span>
          </h3>
          <span className="text-xs text-gray-500 font-semibold">
            {testimonials.length} Rankers Listed
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-gray-500">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-400" />
            <span>Loading reviews...</span>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-500">
            <Award className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            <p className="font-bold text-gray-700">No topper reviews found</p>
            <button
              onClick={handleOpenAdd}
              className="mt-3 text-amber-600 font-bold hover:underline"
            >
              + Add the first topper review
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/70 transition-colors"
              >
                {/* Left: Avatar & Info */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-amber-300 bg-gray-100 shrink-0 shadow-2xs">
                    {t.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.photoUrl} alt={t.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-700 font-black text-sm">
                        {t.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-extrabold text-gray-900 leading-tight">
                        {t.name}
                      </h4>
                      {t.badge && (
                        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase text-amber-800 border border-amber-300">
                          {t.badge}
                        </span>
                      )}
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                        {t.exam}
                      </span>
                      {t.score && (
                        <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          🎯 {t.score}
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-gray-700 leading-snug">
                      {t.rank} {t.state && <span className="font-normal text-gray-500">• {t.state}</span>}
                    </p>

                    <p className="text-xs text-gray-600 line-clamp-2 italic leading-relaxed pt-0.5">
                      "{t.quote}"
                    </p>

                    <div className="flex items-center gap-1 pt-1">
                      {Array.from({ length: t.rating || 5 }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-500" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleToggleActive(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      t.isActive
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                  >
                    {t.isActive ? "● Live on Site" : "○ Hidden"}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
                    title="Edit Review"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(t.id)}
                    disabled={deletingId === t.id}
                    className="p-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 transition-colors cursor-pointer disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-gray-200 p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  <span>{formData.id ? "Edit Topper Review" : "Add New Topper Review"}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  This testimonial will appear directly in the student reviews section of the homepage.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Aditya Sharma"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-bold text-gray-900 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Exam Name *
                  </label>
                  <input
                    type="text"
                    value={formData.exam || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, exam: e.target.value }))}
                    placeholder="e.g. SSC CGL 2024 or SSC CHSL"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-medium focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    AIR Rank / Post Selected *
                  </label>
                  <input
                    type="text"
                    value={formData.rank || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, rank: e.target.value }))}
                    placeholder="e.g. AIR 14 — Assistant Section Officer (CSS)"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-medium focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Final Score / Marks
                  </label>
                  <input
                    type="text"
                    value={formData.score || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, score: e.target.value }))}
                    placeholder="e.g. 348 / 390"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-medium focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Home Town / State
                  </label>
                  <input
                    type="text"
                    value={formData.state || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                    placeholder="e.g. Jaipur, Rajasthan"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-medium focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Badge Tag
                  </label>
                  <input
                    type="text"
                    value={formData.badge || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
                    placeholder="e.g. AIR 14 (1st Attempt) or Verified Selection"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-medium focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Photo / Avatar URL
                </label>
                <input
                  type="url"
                  value={formData.photoUrl || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, photoUrl: e.target.value }))}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-medium focus:bg-white focus:outline-hidden"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Leave empty to automatically generate a clean initials avatar.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Review / Testimonial Quote *
                </label>
                <textarea
                  rows={4}
                  value={formData.quote || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, quote: e.target.value }))}
                  placeholder="Share how SSCZone helped them clear the exam, e.g. chapter notes, real exam interface, bilingual mock papers..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs font-medium focus:bg-white focus:outline-hidden leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Star Rating (1 - 5)
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                        className="p-1 cursor-pointer"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            (formData.rating || 5) >= star
                              ? "fill-amber-400 text-amber-500"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div>
                    <span className="block text-xs font-bold text-gray-800">Publish Immediately</span>
                    <span className="text-[10px] text-gray-500">Show right away on homepage</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isActive !== false}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                    }
                    className="h-4 w-4 rounded-md border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Live Card Preview Inside Modal */}
            <div className="pt-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Live Card Preview
              </div>
              <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: formData.rating || 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                  ))}
                </div>

                <p className="text-xs text-gray-700 italic leading-relaxed">
                  "{formData.quote || "Your testimonial quote will appear here..."}"
                </p>

                <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
                  <div className="h-9 w-9 rounded-full overflow-hidden border border-amber-300 bg-amber-100 shrink-0 flex items-center justify-center font-black text-amber-800 text-xs">
                    {formData.name ? formData.name.slice(0, 2).toUpperCase() : "AS"}
                  </div>
                  <div>
                    <div className="text-xs font-black text-gray-900">
                      {formData.name || "Student Name"}
                    </div>
                    <div className="text-[11px] text-gray-600">
                      {formData.rank || "AIR Ranker"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-6 py-2.5 text-xs font-black text-slate-950 shadow-md active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
              >
                {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>{saving ? "Saving..." : "Save Testimonial"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
