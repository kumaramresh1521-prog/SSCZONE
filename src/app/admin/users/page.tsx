"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "admin" | "subscribed">("all");
  const [loading, setLoading] = useState(true);

  // Admin Password Reset Modal State
  const [resetModalUser, setResetModalUser] = useState<any | null>(null);
  const [resetAction, setResetAction] = useState<"link" | "direct">("link");
  const [generatedLink, setGeneratedLink] = useState("");
  const [newDirectPassword, setNewDirectPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  async function handleGenerateLink(user: any) {
    setResetLoading(true);
    try {
      const res = await fetch("/api/admin/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, action: "generate_link" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate link");
      setGeneratedLink(data.actionLink || "");
      toast.success("Direct password recovery link generated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate recovery link");
    } finally {
      setResetLoading(false);
    }
  }

  async function handleSetDirectPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetModalUser) return;
    setResetLoading(true);
    try {
      const res = await fetch("/api/admin/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: resetModalUser.id,
          email: resetModalUser.email,
          action: "set_password",
          newPassword: newDirectPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");
      toast.success(`Password set directly for ${resetModalUser.email}! 🔒`);
      setResetModalUser(null);
      setNewDirectPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to set password");
    } finally {
      setResetLoading(false);
    }
  }

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const json = await res.json();
        setUsers(json.users ?? []);
        setLoading(false);
        return;
      }
    } catch {}
    const { data } = await supabase
      .from("profiles")
      .select("*, subscriptions(status, expires_at, packages(title))")
      .order("created_at", { ascending: false });
    setUsers(data ?? []);
    setLoading(false);
  }

  async function toggleAdmin(u: any) {
    const nextAdmin = !u.is_admin;
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: u.id,
        is_admin: nextAdmin,
        email: u.email,
        full_name: u.full_name,
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error || "Failed to update admin status");
      return;
    }
    toast.success(`Admin ${nextAdmin ? "granted" : "revoked"}`);
    setUsers((prev) => prev.map((row) => (row.id === u.id ? { ...row, is_admin: nextAdmin } : row)));
  }

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const activeSub = u.subscriptions?.find((s: any) => s.status === "active" && new Date(s.expires_at) > new Date());
    const matchFilter =
      filter === "all" ? true :
      filter === "admin" ? u.is_admin :
      filter === "subscribed" ? !!activeSub : true;
    return matchSearch && matchFilter;
  });

  function getActiveSub(u: any) {
    return u.subscriptions?.find((s: any) => s.status === "active" && new Date(s.expires_at) > new Date());
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{users.length} total registered users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="users-filters">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            className="a-input search-input"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {(["all", "admin", "subscribed"] as const).map(f => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All Users" : f === "admin" ? "Admins" : "Subscribed"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="a-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="a-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Subscription</th>
                <th>Joined</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j}><div className="skeleton-line" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="a-empty">
                    <span className="a-empty-icon">👥</span>
                    No users found
                  </td>
                </tr>
              ) : (
                filtered.map(u => {
                  const activeSub = getActiveSub(u);
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                          <div className="user-avatar-sm">
                            {(u.full_name || u.email || "?").charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, color: "#fff" }}>{u.full_name || "—"}</span>
                        </div>
                      </td>
                      <td style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>{u.email}</td>
                      <td>
                        {activeSub ? (
                          <div>
                            <span className="a-badge a-badge-green">● {activeSub.packages?.title || "Active"}</span>
                            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", marginTop: "0.2rem" }}>
                              Until {formatDate(activeSub.expires_at)}
                            </div>
                          </div>
                        ) : (
                          <span className="a-badge a-badge-red">Free</span>
                        )}
                      </td>
                      <td style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>
                        {formatDate(u.created_at)}
                      </td>
                      <td>
                        {u.is_admin
                          ? <span className="a-badge a-badge-blue">Admin</span>
                          : <span className="a-badge" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>User</span>
                        }
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                          <button
                            onClick={() => toggleAdmin(u.id, u.is_admin)}
                            className={`a-btn a-btn-sm ${u.is_admin ? "a-btn-danger" : "a-btn-ghost"}`}
                            title={u.is_admin ? "Revoke admin" : "Grant admin"}
                          >
                            {u.is_admin ? "Revoke Admin" : "Make Admin"}
                          </button>
                          <button
                            onClick={() => {
                              setResetModalUser(u);
                              setGeneratedLink("");
                              setNewDirectPassword("");
                              handleGenerateLink(u);
                            }}
                            className="a-btn a-btn-sm a-btn-ghost"
                            style={{ color: "#fbbf24", borderColor: "rgba(251,191,36,0.3)" }}
                            title="Reset Password or Generate Direct Recovery Link"
                          >
                            🔑 Reset Pwd
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Password Reset Modal */}
      {resetModalUser && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(4px)",
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem"
        }}>
          <div style={{
            background: "#0f172a",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "1rem",
            maxWidth: 520,
            width: "100%",
            padding: "1.5rem",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
            color: "#fff"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ fontWeight: 800, fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#fbbf24" }}>
                <span>🔑</span>
                <span>Password Reset: {resetModalUser.email}</span>
              </div>
              <button
                onClick={() => setResetModalUser(null)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            {/* Mode Tabs */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              <button
                type="button"
                onClick={() => setResetAction("link")}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  border: resetAction === "link" ? "1.5px solid #fbbf24" : "1px solid rgba(255,255,255,0.1)",
                  background: resetAction === "link" ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.03)",
                  color: resetAction === "link" ? "#fbbf24" : "#94a3b8",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  cursor: "pointer"
                }}
              >
                🔗 Direct Reset Link
              </button>
              <button
                type="button"
                onClick={() => setResetAction("direct")}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  border: resetAction === "direct" ? "1.5px solid #60a5fa" : "1px solid rgba(255,255,255,0.1)",
                  background: resetAction === "direct" ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.03)",
                  color: resetAction === "direct" ? "#93c5fd" : "#94a3b8",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  cursor: "pointer"
                }}
              >
                ✍️ Set Password Directly
              </button>
            </div>

            {/* Mode 1: Direct Link */}
            {resetAction === "link" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <p style={{ fontSize: "0.78rem", color: "rgba(226,232,240,0.7)", lineHeight: 1.5 }}>
                  This creates an instant, valid recovery link directly bypassing email deliverability, rate limits, and localhost redirects. Send this link directly to the student on WhatsApp / Telegram / Support chat:
                </p>
                {resetLoading ? (
                  <div style={{ padding: "1rem", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>
                    Generating recovery link...
                  </div>
                ) : generatedLink ? (
                  <div style={{ marginBottom: "1rem" }}>
                    <div style={{
                      background: "rgba(0,0,0,0.4)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "0.5rem",
                      padding: "0.75rem",
                      fontSize: "0.75rem",
                      fontFamily: "monospace",
                      wordBreak: "break-all",
                      color: "#fbbf24",
                      maxHeight: 120,
                      overflowY: "auto",
                      marginBottom: "0.5rem"
                    }}>
                      {generatedLink}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedLink);
                        toast.success("Link copied to clipboard! 📋");
                      }}
                      className="a-btn a-btn-success"
                      style={{ width: "100%", justifyContent: "center", fontSize: "0.8rem" }}
                    >
                      📋 Copy Reset Link to Clipboard
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleGenerateLink(resetModalUser)}
                    className="a-btn a-btn-primary"
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    Generate Link Now
                  </button>
                )}
              </div>
            ) : (
              /* Mode 2: Set Password Directly */
              <form onSubmit={handleSetDirectPassword} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <p style={{ fontSize: "0.78rem", color: "rgba(226,232,240,0.7)", marginBottom: "0.75rem", lineHeight: 1.5 }}>
                  Instantly set a new password for <strong>{resetModalUser.email}</strong>. The user can immediately log in with this new password without needing any email verification:
                </p>
                <div style={{ marginBottom: "0.75rem" }}>
                  <label style={{ display: "block", fontSize: "0.72rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.3rem" }}>
                    New Password (min 6 characters)
                  </label>
                  <input
                    type="text"
                    required
                    minLength={6}
                    placeholder="e.g. Student2026@"
                    value={newDirectPassword}
                    onChange={(e) => setNewDirectPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.55rem 0.75rem",
                      borderRadius: "0.5rem",
                      border: "1px solid rgba(255,255,255,0.15)",
                      background: "rgba(0,0,0,0.3)",
                      color: "#fff",
                      fontSize: "0.82rem",
                      outline: "none"
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading || newDirectPassword.length < 6}
                  className="a-btn a-btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {resetLoading ? "Updating Password..." : "🔒 Update Password Immediately"}
                </button>
              </form>
            )}

            <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setResetModalUser(null)}
                className="a-btn a-btn-ghost a-btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .users-filters {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }
        .search-wrapper { position: relative; flex: 1; min-width: 220px; }
        .search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); font-size: 0.875rem; }
        .search-input { padding-left: 2.25rem; }

        .filter-tabs { display: flex; gap: 0.375rem; }
        .filter-tab {
          padding: 0.4rem 0.875rem;
          border-radius: 0.5rem;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.4);
          transition: all 0.15s;
        }
        .filter-tab:hover { color: #fff; background: rgba(255,255,255,0.08); }
        .filter-tab.active { background: rgba(99,102,241,0.2); border-color: rgba(99,102,241,0.4); color: #818cf8; }

        .user-avatar-sm {
          width: 32px; height: 32px; flex-shrink: 0;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 700; color: #fff;
        }
        .skeleton-line {
          height: 14px; border-radius: 4px;
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer { to { background-position: -200% 0; } }
      `}</style>
    </div>
  );
}
