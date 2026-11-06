"use client";

import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  Zap,
  Link as LinkIcon,
  Tag,
  Radio,
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Save,
  Compass,
  ExternalLink,
  Target,
  FileText,
  BookOpen,
  ArrowUp,
  ArrowDown,
  FolderPlus,
  Menu,
  Check,
  X,
  AlertCircle
} from "lucide-react";
import NavigationIcon, { AVAILABLE_NAV_ICONS } from "@/components/NavigationIcon";
import { 
  MenuItemConfig, 
  SubMenuItemConfig, 
  NavigationConfig, 
  DEFAULT_NAVIGATION_CONFIG 
} from "@/lib/navigation-store";

export default function AdminNavigationManagerPage() {
  const [items, setItems] = useState<MenuItemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<"menu" | "submenu">("menu");
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string>("");

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formHref, setFormHref] = useState("");
  const [formIcon, setFormIcon] = useState("Link");
  const [formBadge, setFormBadge] = useState("");
  const [formTarget, setFormTarget] = useState<"_self" | "_blank">("_self");
  const [formIsDropdown, setFormIsDropdown] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);

  // Search / Filter
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch navigation config on mount
  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    setLoading(true);
    try {
      const res = await fetch(`/api/navigation?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data: NavigationConfig = await res.json();
        if (data && Array.isArray(data.items)) {
          setItems(data.items);
        } else {
          setItems(DEFAULT_NAVIGATION_CONFIG.items);
        }
      } else {
        setItems(DEFAULT_NAVIGATION_CONFIG.items);
      }
    } catch (err: any) {
      toast.error("Failed to load navigation configuration, using defaults");
      setItems(DEFAULT_NAVIGATION_CONFIG.items);
    } finally {
      setLoading(false);
    }
  }

  // Save changes to server
  async function handleSaveToServer(updatedItems?: MenuItemConfig[]) {
    const payload = updatedItems || items;
    setSaving(true);
    const toastId = toast.loading("Saving navigation changes...");
    try {
      const res = await fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payload }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save");
      }

      setHasUnsavedChanges(false);
      toast.success("Navigation changes saved & published live!", { id: toastId });
    } catch (err: any) {
      toast.error(err?.message || "Failed to save navigation", { id: toastId });
    } finally {
      setSaving(false);
    }
  }

  // Toggle Top-Level Menu Item Active/Inactive
  async function handleToggleMenu(menuId: string) {
    const updated = items.map((m) =>
      m.id === menuId ? { ...m, is_active: !m.is_active } : m
    );
    setItems(updated);
    setHasUnsavedChanges(true);

    // Instant quick sync to API
    try {
      await fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle",
          itemId: menuId,
          isActive: updated.find((m) => m.id === menuId)?.is_active,
        }),
      });
      const activeState = updated.find((m) => m.id === menuId)?.is_active;
      toast.success(activeState ? "Menu item enabled!" : "Menu item disabled (hidden)!");
      setHasUnsavedChanges(false);
    } catch {
      // Keep local state
    }
  }

  // Toggle Sub-Menu Item Active/Inactive
  async function handleToggleSubMenu(menuId: string, subId: string) {
    const updated = items.map((m) => {
      if (m.id === menuId) {
        const subs = (m.sub_items || []).map((s) =>
          s.id === subId ? { ...s, is_active: !s.is_active } : s
        );
        return { ...m, sub_items: subs };
      }
      return m;
    });
    setItems(updated);
    setHasUnsavedChanges(true);

    try {
      const targetSub = updated
        .find((m) => m.id === menuId)
        ?.sub_items?.find((s) => s.id === subId);
      await fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle",
          itemId: menuId,
          subItemId: subId,
          isActive: targetSub?.is_active,
        }),
      });
      toast.success(targetSub?.is_active ? "Sub-menu item enabled!" : "Sub-menu item disabled (hidden)!");
      setHasUnsavedChanges(false);
    } catch {
      // Keep local state
    }
  }

  // Move Menu Item Up / Down
  function handleMoveMenu(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const reordered = [...items];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    // Update sort_order
    const updated = reordered.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    setItems(updated);
    setHasUnsavedChanges(true);
  }

  // Move Sub-Menu Item Up / Down
  function handleMoveSubMenu(menuId: string, subIndex: number, direction: "up" | "down") {
    const targetMenu = items.find((m) => m.id === menuId);
    if (!targetMenu || !targetMenu.sub_items) return;

    const subs = [...targetMenu.sub_items];
    const targetIndex = direction === "up" ? subIndex - 1 : subIndex + 1;
    if (targetIndex < 0 || targetIndex >= subs.length) return;

    const temp = subs[subIndex];
    subs[subIndex] = subs[targetIndex];
    subs[targetIndex] = temp;

    const updatedSubs = subs.map((s, idx) => ({ ...s, sort_order: idx + 1 }));
    const updated = items.map((m) => (m.id === menuId ? { ...m, sub_items: updatedSubs } : m));
    setItems(updated);
    setHasUnsavedChanges(true);
  }

  // Open Modal to Add Top-Level Menu
  function openAddMenuModal() {
    setEditingType("menu");
    setEditingMenuId(null);
    setEditingSubId(null);
    setSelectedParentId("");
    setFormName("");
    setFormHref("");
    setFormIcon("Sparkles");
    setFormBadge("");
    setFormTarget("_self");
    setFormIsDropdown(false);
    setFormIsActive(true);
    setIsModalOpen(true);
  }

  // Open Modal to Add Sub-Menu
  function openAddSubMenuModal(parentId: string) {
    setEditingType("submenu");
    setEditingMenuId(parentId);
    setEditingSubId(null);
    setSelectedParentId(parentId);
    setFormName("");
    setFormHref("");
    setFormIcon("Link");
    setFormBadge("");
    setFormTarget("_self");
    setFormIsDropdown(false);
    setFormIsActive(true);
    setIsModalOpen(true);
  }

  // Open Modal to Edit Top-Level Menu
  function openEditMenuModal(menu: MenuItemConfig) {
    setEditingType("menu");
    setEditingMenuId(menu.id);
    setEditingSubId(null);
    setSelectedParentId("");
    setFormName(menu.name);
    setFormHref(menu.href || "");
    setFormIcon(menu.icon || "Sparkles");
    setFormBadge(menu.badge || "");
    setFormTarget(menu.target || "_self");
    setFormIsDropdown(Boolean(menu.is_dropdown));
    setFormIsActive(menu.is_active);
    setIsModalOpen(true);
  }

  // Open Modal to Edit Sub-Menu Item
  function openEditSubMenuModal(menuId: string, sub: SubMenuItemConfig) {
    setEditingType("submenu");
    setEditingMenuId(menuId);
    setEditingSubId(sub.id);
    setSelectedParentId(menuId);
    setFormName(sub.name);
    setFormHref(sub.href || "");
    setFormIcon(sub.icon || "Link");
    setFormBadge(sub.badge || "");
    setFormTarget(sub.target || "_self");
    setFormIsDropdown(false);
    setFormIsActive(sub.is_active);
    setIsModalOpen(true);
  }

  // Handle Form Submission (Save from Modal)
  function handleSaveFromModal(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Please enter a menu name / label!");
      return;
    }

    if (editingType === "menu") {
      if (editingMenuId) {
        // Edit existing menu
        const updated = items.map((m) => {
          if (m.id === editingMenuId) {
            return {
              ...m,
              name: formName.trim(),
              href: formHref.trim() || undefined,
              icon: formIcon,
              badge: formBadge.trim() || undefined,
              target: formTarget,
              is_dropdown: formIsDropdown,
              is_active: formIsActive,
            };
          }
          return m;
        });
        setItems(updated);
        handleSaveToServer(updated);
      } else {
        // Add new top-level menu
        const newMenu: MenuItemConfig = {
          id: `custom-menu-${Date.now()}`,
          name: formName.trim(),
          href: formHref.trim() || "#",
          icon: formIcon,
          badge: formBadge.trim() || undefined,
          target: formTarget,
          is_dropdown: formIsDropdown,
          is_active: formIsActive,
          is_custom: true,
          sort_order: items.length + 1,
          sub_items: [],
        };
        const updated = [...items, newMenu];
        setItems(updated);
        handleSaveToServer(updated);
      }
    } else {
      // Sub-menu handling
      const parentId = selectedParentId || editingMenuId;
      if (!parentId) {
        toast.error("Please select a parent menu for this sub-menu item!");
        return;
      }

      if (editingSubId && editingMenuId) {
        // Edit existing sub-menu item
        const updated = items.map((m) => {
          if (m.id === editingMenuId) {
            const subs = (m.sub_items || []).map((s) => {
              if (s.id === editingSubId) {
                return {
                  ...s,
                  name: formName.trim(),
                  href: formHref.trim() || "#",
                  icon: formIcon,
                  badge: formBadge.trim() || undefined,
                  target: formTarget,
                  is_active: formIsActive,
                };
              }
              return s;
            });
            return { ...m, sub_items: subs };
          }
          return m;
        });
        setItems(updated);
        handleSaveToServer(updated);
      } else {
        // Add new sub-menu item
        const updated = items.map((m) => {
          if (m.id === parentId) {
            const subs = m.sub_items || [];
            const newSub: SubMenuItemConfig = {
              id: `custom-sub-${Date.now()}`,
              name: formName.trim(),
              href: formHref.trim() || "#",
              icon: formIcon,
              badge: formBadge.trim() || undefined,
              target: formTarget,
              is_active: formIsActive,
              is_custom: true,
              sort_order: subs.length + 1,
            };
            return {
              ...m,
              is_dropdown: true,
              sub_items: [...subs, newSub],
            };
          }
          return m;
        });
        setItems(updated);
        handleSaveToServer(updated);
      }
    }

    setIsModalOpen(false);
  }

  // Delete Custom Item
  async function handleDeleteItem(menuId: string, subId?: string) {
    if (!confirm(subId ? "Delete this sub-menu item?" : "Delete this entire menu item and its sub-menus?")) {
      return;
    }

    let updated: MenuItemConfig[];
    if (subId) {
      updated = items.map((m) => {
        if (m.id === menuId) {
          return {
            ...m,
            sub_items: (m.sub_items || []).filter((s) => s.id !== subId),
          };
        }
        return m;
      });
    } else {
      updated = items.filter((m) => m.id !== menuId);
    }

    setItems(updated);
    handleSaveToServer(updated);
  }

  // Reset to Defaults
  async function handleResetToDefaults() {
    if (!confirm("Are you sure you want to reset all menus and sub-menus to official default settings? All custom items will be restored to defaults.")) {
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Restoring default navigation...");
    try {
      const res = await fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });

      if (!res.ok) throw new Error("Reset failed");

      setItems(DEFAULT_NAVIGATION_CONFIG.items);
      setHasUnsavedChanges(false);
      toast.success("Navigation restored to official defaults!", { id: toastId });
    } catch (err: any) {
      toast.error(err?.message || "Failed to reset navigation", { id: toastId });
    } finally {
      setSaving(false);
    }
  }

  // Stats
  const stats = useMemo(() => {
    const totalMenus = items.length;
    const activeMenus = items.filter((m) => m.is_active).length;
    let totalSubs = 0;
    let activeSubs = 0;
    let customCount = 0;

    items.forEach((m) => {
      if (m.is_custom) customCount++;
      (m.sub_items || []).forEach((s) => {
        totalSubs++;
        if (s.is_active) activeSubs++;
        if (s.is_custom) customCount++;
      });
    });

    return { totalMenus, activeMenus, totalSubs, activeSubs, customCount };
  }, [items]);

  // Filtered Items based on search
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const q = searchTerm.toLowerCase();
    return items.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.href && m.href.toLowerCase().includes(q)) ||
        (m.sub_items || []).some(
          (s) => s.name.toLowerCase().includes(q) || s.href.toLowerCase().includes(q)
        )
    );
  }, [items, searchTerm]);

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO HEADER WITH ACTIONS
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-7 rounded-3xl text-white shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-400/30">
              <Compass className="h-3 w-3 text-amber-300" />
              Navigation Architecture Engine
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-400/30">
              <CheckCircle2 className="h-3 w-3" />
              Live Header & Drawer Sync
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Menu & Sub-Menu Customizer
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Customize top-level header menus and dropdown sub-menus with full flexibility. Toggle items ON/OFF, add custom links with icons & badges, and reorder navigation in real-time.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={openAddMenuModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition-all cursor-pointer hover:scale-[1.02]"
            title="Create a new top-level menu item"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Add Menu Item</span>
          </button>

          <button
            onClick={() => handleSaveToServer()}
            disabled={saving}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg transition-all cursor-pointer hover:scale-[1.02] ${
              hasUnsavedChanges
                ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30 animate-pulse"
                : "bg-slate-800 hover:bg-slate-700 border border-slate-700"
            }`}
            title="Publish navigation changes live to website"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Saving..." : "Save All Changes"}</span>
          </button>

          <button
            onClick={handleResetToDefaults}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3.5 py-2.5 text-xs font-bold text-slate-300 transition-all cursor-pointer"
            title="Reset all navigation menus to official defaults"
          >
            <RotateCcw className="h-4 w-4 text-amber-400" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. METRICS ROW
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Menu className="h-4 w-4 text-blue-600" />
            <span>Top-Level Menus</span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {stats.totalMenus} <span className="text-xs font-semibold text-emerald-600">({stats.activeMenus} Active)</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Layers className="h-4 w-4 text-indigo-600" />
            <span>Sub-Menu Items</span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {stats.totalSubs} <span className="text-xs font-semibold text-indigo-600">({stats.activeSubs} Active)</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Custom Added Items</span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {stats.customCount} <span className="text-xs font-normal text-slate-400">Items</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Live Sync Status</span>
          </div>
          <div className="mt-2 text-sm font-bold text-emerald-700 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Real-time Active</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. LIVE DESKTOP NAVBAR PREVIEW
      ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-blue-600" />
            Live Header Preview (What Candidates See)
          </span>
          <span className="text-[11px] font-semibold text-slate-400">
            Hidden items (greyed out) will NOT appear in the candidate navbar
          </span>
        </div>

        <div className="bg-slate-100/80 p-2.5 rounded-xl border border-slate-200/80 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            {items.map((m) => (
              <div
                key={m.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  m.is_active
                    ? "bg-white text-slate-800 border-slate-200/80 shadow-2xs"
                    : "bg-slate-200/70 text-slate-400 border-dashed border-slate-300 line-through opacity-60"
                }`}
              >
                <NavigationIcon name={m.icon} className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span>{m.name}</span>
                {m.badge && (
                  <span className="text-[9px] bg-amber-400 text-slate-900 px-1 py-0.2 rounded font-black">
                    {m.badge}
                  </span>
                )}
                {m.is_dropdown && <ChevronDown className="h-3 w-3 text-slate-400" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. MENU ITEMS BUILDER TREE
      ───────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Menu Hierarchy & Controls
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Turn any menu or sub-menu ON / OFF instantly, click &quot;+ Sub-Menu&quot; to attach child links, or edit paths & labels.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search menus or links..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none w-48 sm:w-64"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin h-7 w-7 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-xs font-semibold">Loading menu configurations...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
            <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No menu items found</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting defaults or adding a new menu item.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((menu, menuIdx) => {
              const subs = menu.sub_items || [];
              const isFirst = menuIdx === 0;
              const isLast = menuIdx === filteredItems.length - 1;

              return (
                <div
                  key={menu.id}
                  className={`rounded-2xl border transition-all ${
                    menu.is_active
                      ? "border-slate-200 bg-white shadow-2xs hover:border-blue-300"
                      : "border-slate-200/80 bg-slate-50/70 opacity-75"
                  }`}
                >
                  {/* Top-Level Menu Bar */}
                  <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Reorder Buttons */}
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => handleMoveMenu(menuIdx, "up")}
                          disabled={isFirst}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 rounded hover:bg-slate-100 cursor-pointer"
                          title="Move Menu Up"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleMoveMenu(menuIdx, "down")}
                          disabled={isLast}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 rounded hover:bg-slate-100 cursor-pointer"
                          title="Move Menu Down"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Icon & Label */}
                      <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center shrink-0">
                        <NavigationIcon name={menu.icon} className="h-5 w-5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-extrabold text-slate-900">
                            {menu.name}
                          </span>
                          {menu.badge && (
                            <span className="text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.2 rounded-full">
                              {menu.badge}
                            </span>
                          )}
                          {menu.is_custom && (
                            <span className="text-[9px] font-black bg-purple-100 text-purple-800 border border-purple-200 px-1.5 py-0.2 rounded">
                              CUSTOM
                            </span>
                          )}
                          {menu.is_dropdown ? (
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.2 rounded-md">
                              Dropdown ({subs.length} Sub-items)
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.2 rounded-md">
                              Direct Link
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-mono text-[11px] text-blue-700">
                            {menu.href || "(Dropdown Trigger)"}
                          </span>
                          {menu.target === "_blank" && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                              <ExternalLink className="h-2.5 w-2.5" />
                              New Tab
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions & ON/OFF Switch */}
                    <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
                      {/* Active / Inactive Toggle Button */}
                      <button
                        onClick={() => handleToggleMenu(menu.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          menu.is_active
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200"
                        }`}
                        title={menu.is_active ? "Click to turn OFF (Hide from candidate view)" : "Click to turn ON (Show in candidate view)"}
                      >
                        {menu.is_active ? (
                          <>
                            <Eye className="h-3.5 w-3.5 text-emerald-600" />
                            <span>ON (Active)</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3.5 w-3.5 text-slate-400" />
                            <span>OFF (Hidden)</span>
                          </>
                        )}
                      </button>

                      {/* Add Sub-Menu Button */}
                      <button
                        onClick={() => openAddSubMenuModal(menu.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                        title="Add a Sub-Menu item under this menu"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Sub-Menu</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => openEditMenuModal(menu)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Edit Menu"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>

                      {/* Delete Button (Allowed for custom items) */}
                      {menu.is_custom && (
                        <button
                          onClick={() => handleDeleteItem(menu.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Custom Menu"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sub-Menu Items Nested List */}
                  {subs.length > 0 && (
                    <div className="bg-slate-50/80 border-t border-slate-100 p-3 sm:p-4 rounded-b-2xl space-y-2">
                      <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-2 flex items-center justify-between">
                        <span>Sub-Menu Dropdown Items ({subs.length}):</span>
                        <button
                          onClick={() => openAddSubMenuModal(menu.id)}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                        >
                          + Add Sub-Item
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {subs.map((sub, subIdx) => {
                          const isSubFirst = subIdx === 0;
                          const isSubLast = subIdx === subs.length - 1;

                          return (
                            <div
                              key={sub.id}
                              className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl border transition-all ${
                                sub.is_active
                                  ? "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
                                  : "bg-slate-100 border-slate-200/60 opacity-60"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                {/* Sub-Item Reorder */}
                                <div className="flex items-center gap-0.5">
                                  <button
                                    onClick={() => handleMoveSubMenu(menu.id, subIdx, "up")}
                                    disabled={isSubFirst}
                                    className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                                    title="Move Up"
                                  >
                                    <ArrowUp className="h-2.5 w-2.5" />
                                  </button>
                                  <button
                                    onClick={() => handleMoveSubMenu(menu.id, subIdx, "down")}
                                    disabled={isSubLast}
                                    className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                                    title="Move Down"
                                  >
                                    <ArrowDown className="h-2.5 w-2.5" />
                                  </button>
                                </div>

                                <div className="h-7 w-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                                  <NavigationIcon name={sub.icon} className="h-3.5 w-3.5" />
                                </div>

                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-900">
                                      {sub.name}
                                    </span>
                                    {sub.badge && (
                                      <span className="text-[9px] font-black bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-full">
                                        {sub.badge}
                                      </span>
                                    )}
                                    {sub.is_custom && (
                                      <span className="text-[8px] font-black bg-purple-100 text-purple-800 px-1 rounded">
                                        CUSTOM
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-mono block">
                                    {sub.href}
                                  </span>
                                </div>
                              </div>

                              {/* Sub-Item Actions */}
                              <div className="flex items-center gap-1.5">
                                {/* Sub-Item Active Toggle */}
                                <button
                                  onClick={() => handleToggleSubMenu(menu.id, sub.id)}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                    sub.is_active
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                                      : "bg-slate-200 text-slate-500 border-slate-300 hover:bg-slate-300"
                                  }`}
                                  title={sub.is_active ? "Disable Sub-Item" : "Enable Sub-Item"}
                                >
                                  {sub.is_active ? "ON" : "OFF"}
                                </button>

                                <button
                                  onClick={() => openEditSubMenuModal(menu.id, sub)}
                                  className="p-1 text-slate-400 hover:text-blue-600 rounded"
                                  title="Edit Sub-Item"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </button>

                                {sub.is_custom && (
                                  <button
                                    onClick={() => handleDeleteItem(menu.id, sub.id)}
                                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                                    title="Delete Sub-Item"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. MODAL: ADD / EDIT MENU OR SUB-MENU ITEM
      ───────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {editingType === "menu"
                    ? editingMenuId
                      ? "Edit Top-Level Menu"
                      : "Create Top-Level Menu"
                    : editingSubId
                    ? "Edit Sub-Menu Item"
                    : "Create Sub-Menu Item"}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure navigation label, destination link, icon, and visibility.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFromModal} className="space-y-4 text-xs">
              {/* Type Switcher (Top-Level vs Sub-Menu) */}
              {!editingMenuId && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Menu Level Type:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingType("menu")}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        editingType === "menu"
                          ? "border-blue-600 bg-blue-50 text-blue-800 shadow-2xs"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Top-Level Menu
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingType("submenu");
                        if (!selectedParentId && items.length > 0) {
                          setSelectedParentId(items[0].id);
                        }
                      }}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        editingType === "submenu"
                          ? "border-blue-600 bg-blue-50 text-blue-800 shadow-2xs"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Sub-Menu Item (Dropdown)
                    </button>
                  </div>
                </div>
              )}

              {/* If Sub-Menu, Parent Selection */}
              {editingType === "submenu" && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Select Parent Menu *
                  </label>
                  <select
                    value={selectedParentId}
                    onChange={(e) => setSelectedParentId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
                    required
                  >
                    {items.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.is_dropdown ? "Dropdown" : "Menu"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Menu Name / Label */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Menu Display Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Current Affairs 2026, Daily Vocabulary, Telegram Channel"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>

              {/* URL / Path */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Destination URL / Path *
                </label>
                <input
                  type="text"
                  placeholder="e.g. /current-affairs, /papers, or https://t.me/ssczone"
                  value={formHref}
                  onChange={(e) => setFormHref(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-mono text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
                  required={editingType === "submenu" || !formIsDropdown}
                />
              </div>

              {/* Icon Selector Grid */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Select Icon: <span className="font-mono text-blue-600 font-semibold">{formIcon}</span>
                </label>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  {AVAILABLE_NAV_ICONS.map((ic) => {
                    const Comp = ic.component;
                    const isSelected = formIcon === ic.name;
                    return (
                      <button
                        key={ic.name}
                        type="button"
                        onClick={() => setFormIcon(ic.name)}
                        className={`p-2 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-xs scale-105"
                            : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
                        }`}
                        title={ic.label}
                      >
                        <Comp className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Badge & Target */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Badge (Optional):</label>
                  <input
                    type="text"
                    placeholder="e.g. NEW, 2026, LIVE, HOT"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Link Target:</label>
                  <select
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="_self">Same Tab (Internal)</option>
                    <option value="_blank">New Tab (External)</option>
                  </select>
                </div>
              </div>

              {/* Checkboxes: Is Dropdown (Top-level only) & Is Active */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                {editingType === "menu" && (
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formIsDropdown}
                      onChange={(e) => setFormIsDropdown(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="font-bold text-slate-800">
                      Enable Dropdown Container (Allows attaching sub-menu links)
                    </span>
                  </label>
                )}

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="font-bold text-slate-800">
                    Active (Show in Website Navigation)
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  {editingMenuId || editingSubId ? "Update Item" : "Create Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
