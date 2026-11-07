"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  CreditCard,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Layers3,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  Users,
  Wrench,
  CircleHelp,
  Flag,
  Newspaper,
  DollarSign,
  LayoutTemplate,
  GraduationCap,
  Network,
  Globe,
  Folder,
  Compass,
  Zap,
  ShieldAlert,
  Keyboard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

type MenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const menuItems: MenuItem[] = [
  { label: "Dashboard", href: "/admin", icon: BarChart3 },
  { label: "SEO & Meta Engine", href: "/admin/seo", icon: Globe },
  { label: "Menu & Navigation", href: "/admin/navigation", icon: Compass },
  { label: "Homepage CMS", href: "/admin/homepage", icon: LayoutTemplate },
  { label: "Admin Tools", href: "/admin/tools", icon: Wrench },
  { label: "Guest Session Gate", href: "/admin/session-gate", icon: ShieldAlert },
  { label: "System & Integrations", href: "/admin/integrations", icon: Network },
  { label: "Ads & Monetization", href: "/admin/ads", icon: DollarSign },
  { label: "Ticker", href: "/admin/ticker", icon: Radio },
  { label: "Exams", href: "/admin/exams", icon: BookOpen },
  { label: "Subjects", href: "/admin/subjects", icon: Layers3 },
  { label: "Topics", href: "/admin/topics", icon: FileText },
  { label: "Subject Notes", href: "/admin/notes", icon: GraduationCap },
  { label: "Typing Tests", href: "/admin/typing", icon: Keyboard },
  { label: "Questions", href: "/admin/questions", icon: CircleHelp },
  { label: "Daily Free Quiz", href: "/admin/daily-quiz", icon: Zap },
  { label: "Flagged Reports", href: "/admin/reports", icon: Flag },
  { label: "Blogs", href: "/admin/blogs", icon: Newspaper },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Packages", href: "/admin/packages", icon: CreditCard },
  { label: "PYQ Folders & Papers", href: "/admin/papers", icon: Folder },
  { label: "PDF & Key Extractor", href: "/admin/pdf-extractor", icon: FileSpreadsheet },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState("Admin");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      const name = data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "Admin";
      setAdminName(name);
    });
  }, []);

  const currentItem = useMemo(
    () => menuItems.find((item) => item.href !== "/admin" && pathname.startsWith(item.href)),
    [pathname]
  );

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const ToggleIcon = sidebarOpen ? PanelLeftClose : PanelLeftOpen;

  return (
    <div className="admin-root" suppressHydrationWarning>
      {/* Mobile Drawer Overlay Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : "collapsed"}`} suppressHydrationWarning>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            SZ
          </div>
          {sidebarOpen && (
            <div className="sidebar-brand">
              <div className="sidebar-logo-text">SSCZone</div>
              <div className="sidebar-logo-sub">Admin Panel</div>
            </div>
          )}
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((value) => !value)}
            aria-label="Toggle sidebar"
          >
            <ToggleIcon className="h-4 w-4" />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">
            {sidebarOpen ? "Menu" : ""}
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth < 768) {
                    setSidebarOpen(false);
                  }
                }}
                className={`sidebar-link ${isActive(item.href) ? "active" : ""}`}
                title={sidebarOpen ? undefined : item.label}
              >
                <span className="sidebar-link-icon">
                  <Icon className="h-4 w-4" />
                </span>
                {sidebarOpen && <span className="sidebar-link-label">{item.label}</span>}
                {isActive(item.href) && <span className="sidebar-link-active-bar" />}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{adminName.charAt(0).toUpperCase()}</div>
            {sidebarOpen && (
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{adminName}</div>
                <div className="sidebar-user-role">Administrator</div>
              </div>
            )}
          </div>
          <div className="sidebar-footer-actions">
            <Link href="/" className="sidebar-action-btn" title="View Site">
              <ExternalLink className="h-4 w-4" />
            </Link>
            <button onClick={handleLogout} className="sidebar-action-btn logout" title="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10"
              aria-label="Toggle Navigation"
            >
              <ToggleIcon className="h-5 w-5 text-blue-400" />
            </button>

            <div className="topbar-breadcrumb">
              <Link href="/admin" className="topbar-bread-home">
                Dashboard
              </Link>
              {pathname !== "/admin" && (
                <>
                  <span className="topbar-bread-sep">/</span>
                  <span className="topbar-bread-current">{currentItem?.label || "Admin"}</span>
                </>
              )}
            </div>
          </div>

          <div className="topbar-right">
            <Link href="/" className="topbar-site-btn">
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">View Site</span>
            </Link>
          </div>
        </div>

        <div className="admin-content">{children}</div>
      </main>

      <AdminStyles />
    </div>
  );
}

function AdminStyles() {
  return (
    <style>{`
      *, *::before, *::after { box-sizing: border-box; }

      .admin-root {
        display: flex;
        min-height: 100vh;
        background: #0f1117;
        color: #e2e8f0;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .admin-sidebar {
        display: flex;
        flex-direction: column;
        background: #11151d;
        border-right: 1px solid rgba(255,255,255,0.08);
        transition: transform 0.25s ease, width 0.25s ease;
        flex-shrink: 0;
        position: sticky;
        top: 0;
        height: 100vh;
        overflow: hidden;
        z-index: 50;
      }
      .admin-sidebar.open { width: 248px; }
      .admin-sidebar.collapsed { width: 72px; }

      @media (max-width: 767px) {
        .admin-sidebar {
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          width: 260px !important;
          transform: translateX(-100%);
          box-shadow: 4px 0 25px rgba(0,0,0,0.5);
        }
        .admin-sidebar.open {
          transform: translateX(0);
        }
        .admin-sidebar.collapsed {
          transform: translateX(-100%);
        }
      }

      .sidebar-logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        min-height: 72px;
        padding: 1rem;
        border-bottom: 1px solid rgba(255,255,255,0.08);
      }
      .sidebar-logo-icon {
        width: 38px;
        height: 38px;
        flex-shrink: 0;
        border: 1px solid rgba(59,130,246,0.35);
        background: #172033;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #93c5fd;
      }
      .sidebar-brand { min-width: 0; }
      .sidebar-logo-text { font-size: 1rem; font-weight: 750; color: #fff; line-height: 1.2; }
      .sidebar-logo-sub { font-size: 0.68rem; color: rgba(255,255,255,0.42); text-transform: uppercase; }
      .sidebar-toggle {
        margin-left: auto;
        width: 30px;
        height: 30px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.04);
        color: rgba(255,255,255,0.55);
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .sidebar-toggle:hover { color: #fff; background: rgba(255,255,255,0.08); }

      .sidebar-nav {
        flex: 1;
        padding: 0.75rem 0.625rem;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .sidebar-nav-label {
        min-height: 1.25rem;
        padding: 0.35rem 0.55rem;
        font-size: 0.68rem;
        font-weight: 700;
        color: rgba(255,255,255,0.28);
        text-transform: uppercase;
      }

      .sidebar-link {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        min-height: 42px;
        padding: 0.625rem 0.75rem;
        border-radius: 10px;
        color: rgba(226,232,240,0.66);
        font-size: 0.875rem;
        font-weight: 650;
        text-decoration: none;
        overflow: hidden;
        transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease;
      }
      .sidebar-link:hover { color: #fff; background: rgba(255,255,255,0.055); }
      .sidebar-link.active {
        color: #fff;
        background: rgba(59,130,246,0.14);
        border: 1px solid rgba(96,165,250,0.18);
      }
      .sidebar-link-icon {
        width: 20px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .sidebar-link-label { flex: 1; min-width: 0; }
      .sidebar-link-active-bar {
        position: absolute;
        right: 0;
        top: 22%;
        bottom: 22%;
        width: 3px;
        border-radius: 999px 0 0 999px;
        background: #60a5fa;
      }

      .sidebar-footer {
        padding: 0.75rem;
        border-top: 1px solid rgba(255,255,255,0.08);
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
      }
      .sidebar-user {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        min-width: 0;
        padding: 0.25rem;
      }
      .sidebar-avatar {
        width: 36px;
        height: 36px;
        flex-shrink: 0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #1d283a;
        border: 1px solid rgba(255,255,255,0.1);
        color: #bfdbfe;
        font-size: 0.875rem;
        font-weight: 800;
      }
      .sidebar-user-info { min-width: 0; }
      .sidebar-user-name {
        color: #fff;
        font-size: 0.82rem;
        font-weight: 700;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .sidebar-user-role { color: rgba(255,255,255,0.36); font-size: 0.7rem; }
      .sidebar-footer-actions { display: flex; gap: 0.5rem; }
      .sidebar-action-btn {
        flex: 1;
        min-height: 34px;
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.04);
        color: rgba(255,255,255,0.55);
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .sidebar-action-btn:hover { color: #fff; background: rgba(255,255,255,0.08); }
      .sidebar-action-btn.logout:hover {
        color: #fecaca;
        background: rgba(239,68,68,0.1);
        border-color: rgba(248,113,113,0.2);
      }

      .admin-main { flex: 1; display: flex; min-width: 0; flex-direction: column; }
      .admin-topbar {
        position: sticky;
        top: 0;
        z-index: 50;
        min-height: 64px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.875rem 2rem;
        background: rgba(17,21,29,0.96);
        border-bottom: 1px solid rgba(255,255,255,0.08);
        backdrop-filter: blur(12px);
      }
      .topbar-breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; min-width: 0; }
      .topbar-bread-home { color: rgba(226,232,240,0.55); text-decoration: none; transition: color 0.15s ease; }
      .topbar-bread-home:hover { color: #fff; }
      .topbar-bread-sep { color: rgba(226,232,240,0.3); }
      .topbar-bread-current { color: #fff; font-weight: 700; }
      .topbar-right { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
      .topbar-time { font-size: 0.8rem; color: rgba(226,232,240,0.45); }
      .topbar-site-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        min-height: 36px;
        padding: 0.45rem 0.75rem;
        border-radius: 8px;
        background: rgba(255,255,255,0.045);
        border: 1px solid rgba(255,255,255,0.1);
        color: #dbeafe;
        font-size: 0.82rem;
        font-weight: 700;
        text-decoration: none;
        transition: all 0.15s ease;
      }
      .topbar-site-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }

      .admin-content {
        flex: 1;
        padding: 1.5rem;
        overflow-y: auto;
      }

      .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }
      .page-title { font-size: 1.5rem; font-weight: 800; color: #fff; }
      .page-subtitle { font-size: 0.82rem; color: rgba(226,232,240,0.48); margin-top: 0.25rem; }

      .a-card, .a-stat-card {
        background: #151922;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        padding: 1.25rem;
        box-shadow: 0 1px 2px rgba(0,0,0,0.15);
      }
      .a-card-sm { padding: 1rem; }
      .a-stat-card { position: relative; overflow: hidden; transition: transform 0.15s ease, border-color 0.15s ease; }
      .a-stat-card:hover { transform: translateY(-1px); border-color: rgba(255,255,255,0.16); }
      .a-stat-card::before { display: none; }

      .a-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        min-height: 36px;
        padding: 0.5rem 0.9rem;
        border-radius: 8px;
        border: 1px solid transparent;
        font-size: 0.8125rem;
        font-weight: 750;
        line-height: 1;
        cursor: pointer;
        text-decoration: none;
        transition: all 0.15s ease;
      }
      .a-btn:disabled { opacity: 0.55; cursor: not-allowed; }
      .a-btn-primary {
        background: #fbbf24;
        color: #111827;
        border-color: rgba(251,191,36,0.35);
      }
      .a-btn-primary:hover:not(:disabled) { background: #fcd34d; }
      .a-btn-ghost {
        background: rgba(255,255,255,0.045);
        color: rgba(226,232,240,0.76);
        border-color: rgba(255,255,255,0.1);
      }
      .a-btn-ghost:hover:not(:disabled) { background: rgba(255,255,255,0.08); color: #fff; }
      .a-btn-danger {
        background: rgba(239,68,68,0.1);
        color: #fca5a5;
        border-color: rgba(248,113,113,0.22);
      }
      .a-btn-danger:hover:not(:disabled) { background: rgba(239,68,68,0.16); }
      .a-btn-success {
        background: rgba(16,185,129,0.12);
        color: #6ee7b7;
        border-color: rgba(52,211,153,0.25);
      }
      .a-btn-success:hover:not(:disabled) { background: rgba(16,185,129,0.18); }
      .a-btn-sm { min-height: 30px; padding: 0.35rem 0.65rem; font-size: 0.75rem; }

      .a-input {
        width: 100%;
        padding: 0.625rem 0.8rem;
        background: rgba(255,255,255,0.045);
        border: 1px solid rgba(255,255,255,0.11);
        border-radius: 9px;
        color: #fff;
        font-size: 0.875rem;
        outline: none;
        transition: all 0.15s ease;
      }
      .a-input::placeholder { color: rgba(226,232,240,0.32); }
      .a-input:focus {
        border-color: rgba(96,165,250,0.65);
        box-shadow: 0 0 0 3px rgba(59,130,246,0.14);
        background: rgba(255,255,255,0.06);
      }
      .a-input option, .a-select option {
        background-color: #151922 !important;
        color: #ffffff !important;
      }
      .a-input optgroup, .a-select optgroup {
        background-color: #0f1117 !important;
        color: #fbbf24 !important;
        font-weight: 800 !important;
      }

      /* Universal Visibility Overrides: Prevent white text on white backgrounds */
      .admin-root .bg-white,
      .admin-root .bg-gray-50,
      .admin-root .bg-gray-100,
      .admin-root .bg-slate-50,
      .admin-root .bg-slate-100 {
        color: #0f172a;
      }

      .admin-root .bg-white label,
      .admin-root .bg-gray-50 label,
      .admin-root .bg-slate-50 label {
        color: #1e293b;
      }

      .admin-root .bg-white input,
      .admin-root .bg-white textarea,
      .admin-root .bg-white select,
      .admin-root .bg-gray-50 input,
      .admin-root .bg-gray-50 textarea,
      .admin-root .bg-gray-50 select,
      .admin-root input.bg-white,
      .admin-root textarea.bg-white,
      .admin-root select.bg-white,
      .admin-root input.bg-gray-50,
      .admin-root textarea.bg-gray-50,
      .admin-root select.bg-gray-50 {
        color: #0f172a !important;
      }

      .admin-root select.bg-white option,
      .admin-root .bg-white select option {
        background-color: #ffffff !important;
        color: #0f172a !important;
      }

      .admin-root .bg-white input::placeholder,
      .admin-root .bg-white textarea::placeholder,
      .admin-root input.bg-white::placeholder,
      .admin-root textarea.bg-white::placeholder,
      .admin-root input.bg-gray-50::placeholder,
      .admin-root textarea.bg-gray-50::placeholder {
        color: #64748b !important;
      }

      /* Quill RichTextEditor Visibility Overrides for Blog & CMS */
      .ql-toolbar.ql-snow {
        background: #f8fafc !important;
        border-color: #cbd5e1 !important;
      }
      .ql-toolbar.ql-snow .ql-stroke {
        stroke: #1e293b !important;
      }
      .ql-toolbar.ql-snow .ql-fill {
        fill: #1e293b !important;
      }
      .ql-toolbar.ql-snow .ql-picker-label {
        color: #1e293b !important;
      }
      .ql-container.ql-snow {
        background: #ffffff !important;
        color: #0f172a !important;
      }
      .ql-editor,
      .ql-editor * {
        color: #0f172a !important;
      }
      .ql-editor.ql-blank::before {
        color: #94a3b8 !important;
      }

      /* Dark Background Header Contrast Overrides */
      .admin-main > .admin-content > div > div > h1.text-gray-900,
      .admin-main > .admin-content h1.text-gray-900,
      .admin-main > .admin-content h2.text-gray-900 {
        color: #ffffff !important;
      }
      .admin-main > .admin-content p.text-gray-500 {
        color: #94a3b8 !important;
      }

      .a-label {
        display: block;
        margin-bottom: 0.4rem;
        font-size: 0.74rem;
        font-weight: 750;
        color: rgba(226,232,240,0.58);
        text-transform: uppercase;
      }

      .a-table { width: 100%; border-collapse: collapse; }
      .a-table th {
        padding: 0.78rem 1rem;
        border-bottom: 1px solid rgba(255,255,255,0.08);
        color: rgba(226,232,240,0.44);
        font-size: 0.72rem;
        font-weight: 800;
        text-align: left;
        text-transform: uppercase;
      }
      .a-table td {
        padding: 0.875rem 1rem;
        border-bottom: 1px solid rgba(255,255,255,0.055);
        color: rgba(226,232,240,0.72);
        font-size: 0.8125rem;
      }
      .a-table tr:hover td { background: rgba(255,255,255,0.03); color: #fff; }
      .a-table tr:last-child td { border-bottom: none; }

      .a-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        min-height: 22px;
        padding: 0.2rem 0.6rem;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.05);
        color: rgba(226,232,240,0.74);
        font-size: 0.7rem;
        font-weight: 750;
      }
      .a-badge-green { background: rgba(16,185,129,0.13); color: #6ee7b7; border-color: rgba(52,211,153,0.22); }
      .a-badge-yellow { background: rgba(245,158,11,0.13); color: #fcd34d; border-color: rgba(245,158,11,0.24); }
      .a-badge-red { background: rgba(239,68,68,0.13); color: #fca5a5; border-color: rgba(248,113,113,0.24); }
      .a-badge-blue { background: rgba(59,130,246,0.13); color: #93c5fd; border-color: rgba(96,165,250,0.24); }

      .a-divider { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 1.25rem 0; }
      .a-empty { text-align: center; padding: 2.5rem; color: rgba(226,232,240,0.38); font-size: 0.875rem; }
      .a-empty-icon { font-size: 2.25rem; display: block; margin-bottom: 0.5rem; }

      .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(148,163,184,0.35) transparent; }
      .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.35); border-radius: 999px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }

      @media (max-width: 900px) {
        .admin-sidebar.open { width: 214px; }
        .admin-content { padding: 1rem; }
        .admin-topbar { padding: 0.75rem 1rem; }
        .topbar-time { display: none; }
      }

      @media (max-width: 640px) {
        .admin-root { display: block; }
        .admin-sidebar {
          position: relative;
          width: 100% !important;
          height: auto;
          border-right: none;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .admin-sidebar.collapsed .sidebar-nav,
        .admin-sidebar.collapsed .sidebar-footer {
          display: none;
        }
        .sidebar-nav {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          max-height: 280px;
        }
        .sidebar-nav-label { display: none; }
        .admin-topbar { position: relative; }
        .topbar-site-btn { padding-inline: 0.65rem; }
      }
    `}</style>
  );
}
