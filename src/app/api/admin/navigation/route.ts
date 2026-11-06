import { NextRequest, NextResponse } from "next/server";
import { 
  getNavigationConfig, 
  saveNavigationConfig 
} from "@/lib/navigation-server";
import {
  DEFAULT_NAVIGATION_CONFIG,
  NavigationConfig,
  MenuItemConfig,
  SubMenuItemConfig
} from "@/lib/navigation-types";
import { requireAdmin } from "@/lib/api-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const config = getNavigationConfig();
  return NextResponse.json(config, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { action, config, items, item, parentId, itemId, subItemId, isActive } = body;

    const currentConfig = getNavigationConfig();

    // 1. Reset to Official Defaults
    if (action === "reset") {
      saveNavigationConfig(DEFAULT_NAVIGATION_CONFIG);
      return NextResponse.json({ success: true, config: DEFAULT_NAVIGATION_CONFIG });
    }

    // 2. Quick Toggle Menu or Sub-Menu Item Active State
    if (action === "toggle") {
      const updatedItems = currentConfig.items.map((m) => {
        if (subItemId && m.id === itemId) {
          // Toggle sub-menu item
          const updatedSubs = (m.sub_items || []).map((s) => {
            if (s.id === subItemId) {
              return { ...s, is_active: isActive !== undefined ? Boolean(isActive) : !s.is_active };
            }
            return s;
          });
          return { ...m, sub_items: updatedSubs };
        } else if (!subItemId && m.id === itemId) {
          // Toggle top-level menu item
          return { ...m, is_active: isActive !== undefined ? Boolean(isActive) : !m.is_active };
        }
        return m;
      });

      const newConfig: NavigationConfig = { ...currentConfig, items: updatedItems };
      saveNavigationConfig(newConfig);
      return NextResponse.json({ success: true, config: newConfig });
    }

    // 3. Add Custom Menu or Sub-Menu Item
    if (action === "add") {
      if (!item || !item.name) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
      }

      const newItemId = item.id || `custom-${Date.now()}`;
      
      if (parentId) {
        // Adding as Sub-Menu item under parent
        const updatedItems = currentConfig.items.map((m) => {
          if (m.id === parentId) {
            const subs = m.sub_items || [];
            const newSub: SubMenuItemConfig = {
              id: newItemId,
              name: item.name.trim(),
              href: item.href || "#",
              icon: item.icon || "Link",
              badge: item.badge?.trim() || "",
              target: item.target || "_self",
              is_active: item.is_active !== undefined ? Boolean(item.is_active) : true,
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

        const newConfig = { ...currentConfig, items: updatedItems };
        saveNavigationConfig(newConfig);
        return NextResponse.json({ success: true, config: newConfig });
      } else {
        // Adding as Top-Level Menu item
        const newMenu: MenuItemConfig = {
          id: newItemId,
          name: item.name.trim(),
          href: item.href || "#",
          icon: item.icon || "Sparkles",
          badge: item.badge?.trim() || "",
          target: item.target || "_self",
          is_active: item.is_active !== undefined ? Boolean(item.is_active) : true,
          is_custom: true,
          is_dropdown: Boolean(item.is_dropdown),
          sort_order: currentConfig.items.length + 1,
          sub_items: [],
        };

        const newConfig = { ...currentConfig, items: [...currentConfig.items, newMenu] };
        saveNavigationConfig(newConfig);
        return NextResponse.json({ success: true, config: newConfig });
      }
    }

    // 4. Delete Custom Item
    if (action === "delete") {
      const updatedItems = currentConfig.items
        .filter((m) => !(m.id === itemId && !subItemId))
        .map((m) => {
          if (m.id === itemId && subItemId) {
            return {
              ...m,
              sub_items: (m.sub_items || []).filter((s) => s.id !== subItemId),
            };
          }
          return m;
        });

      const newConfig = { ...currentConfig, items: updatedItems };
      saveNavigationConfig(newConfig);
      return NextResponse.json({ success: true, config: newConfig });
    }

    // 5. Full Config / Items Save
    const incomingItems = (config && config.items) || items;
    if (Array.isArray(incomingItems)) {
      const newConfig: NavigationConfig = {
        items: incomingItems,
      };
      saveNavigationConfig(newConfig);
      return NextResponse.json({ success: true, config: newConfig });
    }

    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save navigation" }, { status: 500 });
  }
}
