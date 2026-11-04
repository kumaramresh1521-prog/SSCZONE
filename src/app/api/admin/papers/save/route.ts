import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const SETTINGS_FILE = path.join(process.cwd(), "src", "data", "paper_settings.json");

function updatePaperSetting(paperId: number, allowDownload: boolean) {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    let current: Record<string, any> = {};
    if (fs.existsSync(SETTINGS_FILE)) {
      current = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
    }
    current[String(paperId)] = { allow_download: allowDownload };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(current, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing paper_settings.json:", e);
  }
}

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
      updatePaperSetting(id, isAllowed);
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
      if (resultData?.id) {
        updatePaperSetting(resultData.id, isAllowed);
      }
    }

    return NextResponse.json({ success: true, paper: resultData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save paper" }, { status: 500 });
  }
}
