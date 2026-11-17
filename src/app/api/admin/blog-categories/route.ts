import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import {
  getBlogCategoriesAsync,
  saveBlogCategoriesAsync,
  BlogCategory,
} from "@/lib/blog-categories-store";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

// GET /api/admin/blog-categories
export async function GET(req: NextRequest) {
  try {
    const categories = await getBlogCategoriesAsync();
    return NextResponse.json({ success: true, categories });
  } catch (err: any) {
    console.error("GET /api/admin/blog-categories error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load categories" },
      { status: 500 }
    );
  }
}

// POST /api/admin/blog-categories
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { name, icon } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const slug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9\-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const currentList = await getBlogCategoriesAsync();

    // Check if category already exists
    if (
      currentList.some(
        (c) =>
          c.name.toLowerCase() === trimmedName.toLowerCase() ||
          c.slug === slug
      )
    ) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 400 }
      );
    }

    const newCategory: BlogCategory = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: trimmedName,
      slug,
      icon: icon?.trim() || "Tag",
      created_at: new Date().toISOString(),
    };

    const updatedList = [...currentList, newCategory];
    await saveBlogCategoriesAsync(updatedList);

    revalidatePath("/blog");
    revalidatePath("/admin/blogs");

    return NextResponse.json({
      success: true,
      category: newCategory,
      categories: updatedList,
    });
  } catch (err: any) {
    console.error("POST /api/admin/blog-categories error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create category" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/blog-categories
export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const name = searchParams.get("name");

    if (!id && !name) {
      return NextResponse.json(
        { error: "Category ID or name is required" },
        { status: 400 }
      );
    }

    const currentList = await getBlogCategoriesAsync();
    const filtered = currentList.filter((c) => {
      if (id && c.id === id) return false;
      if (name && c.name.toLowerCase() === name.toLowerCase()) return false;
      return true;
    });

    if (filtered.length === currentList.length) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    await saveBlogCategoriesAsync(filtered);

    revalidatePath("/blog");
    revalidatePath("/admin/blogs");

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
      categories: filtered,
    });
  } catch (err: any) {
    console.error("DELETE /api/admin/blog-categories error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}
