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

    // Fetch slug before deleting to purge page cache
    const { data: existing } = await supabaseAdmin
      .from("blogs")
      .select("slug")
      .eq("id", id)
      .maybeSingle();

    const { error } = await supabaseAdmin
      .from("blogs")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Purge caches immediately
    revalidatePath("/blog");
    revalidatePath("/");
    if (existing?.slug) {
      revalidatePath(`/blog/${existing.slug}`);
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete blog" }, { status: 500 });
  }
}
