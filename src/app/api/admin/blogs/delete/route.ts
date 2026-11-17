import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing blog ID" }, { status: 400 });
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    // Fetch slug before deleting to purge page cache
    let fetchQuery = supabaseAdmin.from("blogs").select("slug");
    fetchQuery = isUuid ? fetchQuery.eq("id", id) : fetchQuery.eq("slug", id);
    const { data: existing } = await fetchQuery.maybeSingle();

    let deleteQuery = supabaseAdmin.from("blogs").delete();
    deleteQuery = isUuid ? deleteQuery.eq("id", id) : deleteQuery.eq("slug", id);
    const { error } = await deleteQuery;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Purge caches immediately
    revalidatePath("/blog");
    revalidatePath("/blog/notes");
    revalidatePath("/");
    if (existing?.slug) {
      revalidatePath(`/blog/${existing.slug}`);
      revalidatePath(`/blog/notes/${existing.slug}`);
    }

    try {
      const { invalidateChapterNotesCache } = await import("@/lib/chapter-notes-store");
      invalidateChapterNotesCache(existing?.slug);
    } catch {}

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete blog" }, { status: 500 });
  }
}
