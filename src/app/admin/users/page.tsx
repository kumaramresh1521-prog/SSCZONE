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

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*, subscriptions(status, expires_at, packages(title))")
      .order("created_at", { ascending: false });
    setUsers(data ?? []);
    setLoading(false);
  }

  async function toggleAdmin(id: string, current: boolean) {
    const { error } = await supabase.from("profiles").update({ is_admin: !current }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Admin ${!current ? "granted" : "revoked"}`);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_admin: !current } : u));
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
                        <button
                          onClick={() => toggleAdmin(u.id, u.is_admin)}
                          className={`a-btn a-btn-sm ${u.is_admin ? "a-btn-danger" : "a-btn-ghost"}`}
                          title={u.is_admin ? "Revoke admin" : "Grant admin"}
                        >
                          {u.is_admin ? "Revoke Admin" : "Make Admin"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
