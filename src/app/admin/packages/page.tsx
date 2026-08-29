"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

export default function PackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [examId, setExamId] = useState<number>(0);
  const [features, setFeatures] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPackages(); loadExams(); }, []);

  async function loadPackages() {
    setLoading(true);
    const { data } = await supabase
      .from("packages")
      .select("*, exams(title), subscriptions(count)")
      .order("price");
    setPackages(data ?? []);
    setLoading(false);
  }

  async function loadExams() {
    const { data } = await supabase.from("exams").select("id, title");
    setExams(data ?? []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title,
      exam_id: examId || null,
      price: parseFloat(price),
      duration_days: parseInt(duration),
      features: features ? features.split("\n").filter(Boolean) : [],
    };
    if (editingId) {
      const { error } = await supabase.from("packages").update(payload).eq("id", editingId);
      if (error) { toast.error(error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("packages").insert(payload);
      if (error) { toast.error(error.message); setSaving(false); return; }
    }
    setShowForm(false); setTitle(""); setPrice(""); setDuration(""); setExamId(0); setFeatures(""); setEditingId(null);
    setSaving(false);
    loadPackages();
    toast.success(editingId ? "Package updated!" : "Package created!");
  }

  function handleEdit(p: any) {
    setTitle(p.title);
    setPrice(p.price.toString());
    setDuration(p.duration_days.toString());
    setExamId(p.exam_id || 0);
    setFeatures(Array.isArray(p.features) ? p.features.join("\n") : "");
    setEditingId(p.id);
    setShowForm(true);
  }

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Delete package "${title}"?`)) return;
    const { error } = await supabase.from("packages").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Package deleted!");
    loadPackages();
  }

  const gradients = [
    "linear-gradient(135deg, #6366f1, #8b5cf6)",
    "linear-gradient(135deg, #06b6d4, #3b82f6)",
    "linear-gradient(135deg, #f59e0b, #ef4444)",
    "linear-gradient(135deg, #10b981, #059669)",
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Packages</h1>
          <p className="page-subtitle">Manage subscription plans & pricing</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setTitle(""); setPrice(""); setDuration(""); setExamId(0); setFeatures(""); }}
          className="a-btn a-btn-primary"
        >
          ➕ Add Package
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="a-card" style={{ marginBottom: "1.5rem", borderColor: "rgba(99,102,241,0.2)" }}>
          <h3 style={{ color: "#fff", fontWeight: 600, marginBottom: "1.25rem" }}>
            {editingId ? "✏️ Edit Package" : "💎 New Package"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label className="a-label">Package Title *</label>
                <input className="a-input" placeholder="e.g. SSC CGL Pro" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div>
                <label className="a-label">Exam (optional)</label>
                <select className="a-input a-select" value={examId} onChange={e => setExamId(Number(e.target.value))}>
                  <option value={0}>All Exams</option>
                  {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title}</option>)}
                </select>
              </div>
              <div>
                <label className="a-label">Price (₹) *</label>
                <input className="a-input" type="number" placeholder="499" value={price} onChange={e => setPrice(e.target.value)} required min="0" />
              </div>
              <div>
                <label className="a-label">Duration (days) *</label>
                <input className="a-input" type="number" placeholder="30" value={duration} onChange={e => setDuration(e.target.value)} required min="1" />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="a-label">Features (one per line)</label>
                <textarea
                  className="a-input"
                  placeholder={"Unlimited practice questions\nFull syllabus access\nDetailed explanations\nProgress tracking"}
                  value={features}
                  onChange={e => setFeatures(e.target.value)}
                  rows={4}
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button type="submit" className="a-btn a-btn-primary" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update Package" : "Create Package"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="a-btn a-btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Packages cards */}
      {loading ? (
        <div className="pkg-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="pkg-skeleton a-card" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="a-card a-empty">
          <span className="a-empty-icon">💎</span>
          No packages yet. Create your first subscription package!
        </div>
      ) : (
        <div className="pkg-grid">
          {packages.map((p, i) => {
            const subsCount = p.subscriptions?.[0]?.count ?? 0;
            return (
              <div key={p.id} className="pkg-card">
                <div className="pkg-card-top" style={{ background: gradients[i % gradients.length] }}>
                  <div className="pkg-exam">{p.exams?.title || "All Exams"}</div>
                  <div className="pkg-price">{formatPrice(p.price)}</div>
                  <div className="pkg-duration">{p.duration_days} days access</div>
                </div>
                <div className="pkg-card-body">
                  <h3 className="pkg-title">{p.title}</h3>
                  {Array.isArray(p.features) && p.features.length > 0 && (
                    <ul className="pkg-features">
                      {p.features.slice(0, 4).map((f: string, fi: number) => (
                        <li key={fi}>✓ {f}</li>
                      ))}
                    </ul>
                  )}
                  <div className="pkg-footer">
                    <span className="a-badge a-badge-green">{subsCount} active subs</span>
                    <div style={{ display: "flex", gap: "0.375rem" }}>
                      <button onClick={() => handleEdit(p)} className="a-btn a-btn-ghost a-btn-sm">Edit</button>
                      <button onClick={() => handleDelete(p.id, p.title)} className="a-btn a-btn-danger a-btn-sm">Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .pkg-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
        }
        .pkg-skeleton { height: 260px; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

        .pkg-card {
          background: #1a1d2e;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 1rem;
          overflow: hidden;
          transition: all 0.2s;
        }
        .pkg-card:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(0,0,0,0.4); border-color: rgba(255,255,255,0.12); }

        .pkg-card-top {
          padding: 1.5rem;
          text-align: center;
        }
        .pkg-exam { font-size: 0.7rem; font-weight: 600; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem; }
        .pkg-price { font-size: 2.25rem; font-weight: 800; color: #fff; line-height: 1; }
        .pkg-duration { font-size: 0.8rem; color: rgba(255,255,255,0.6); margin-top: 0.3rem; }

        .pkg-card-body { padding: 1.25rem; }
        .pkg-title { font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem; }
        .pkg-features { list-style: none; display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem; }
        .pkg-features li { font-size: 0.8rem; color: rgba(255,255,255,0.5); }
        .pkg-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.06); }
      `}</style>
    </div>
  );
}
