import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, exam_id, year, total_questions, duration_minutes, pdf_url, allow_download } = body;

    if (!title || !exam_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isAllowed = Boolean(allow_download);

    const basePayload: any = {
      title: title.trim(),
      exam_id: Number(exam_id),
      year: parseInt(year) || 2025,
      total_questions: parseInt(total_questions) || 100,
      duration_minutes: parseInt(duration_minutes) || 60,
      test_type: isAllowed ? "pyq" : "mock"
    };

    let resultData = null;

    if (id) {
      // Update existing paper
      const updatePayload = pdf_url ? { ...basePayload, pdf_url } : basePayload;
      
      let { data, error } = await supabaseAdmin
        .from("previous_papers")
        .update({ ...updatePayload, allow_download: isAllowed })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        // Fallback without allow_download column if schema not yet migrated
        const res = await supabaseAdmin
          .from("previous_papers")
          .update(basePayload)
          .eq("id", id)
          .select()
          .single();
        if (res.error) throw res.error;
        data = res.data;
      }

      resultData = data;
    } else {
      // Insert new paper
      const insertPayload = pdf_url ? { ...basePayload, pdf_url } : basePayload;
      
      let { data, error } = await supabaseAdmin
        .from("previous_papers")
        .insert({ ...insertPayload, allow_download: isAllowed })
        .select()
        .single();

      if (error) {
        const res = await supabaseAdmin
          .from("previous_papers")
          .insert(basePayload)
          .select()
          .single();
        if (res.error) throw res.error;
        data = res.data;
      }

      resultData = data;
    }

    return NextResponse.json({ success: true, paper: resultData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save paper" }, { status: 500 });
  }
}
