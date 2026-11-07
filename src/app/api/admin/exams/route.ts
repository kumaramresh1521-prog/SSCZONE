import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/api-auth";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { data: exams, error } = await supabaseAdmin
      .from("exams")
      .select("*, subjects(id, title, topics(id))")
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ exams: exams || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load exams" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { action } = body;

    // 1. Focus on SSC CGL Only Mode
    if (action === "focus_cgl") {
      // First, set all exams to is_active: false
      const { error: deactivateError } = await supabaseAdmin
        .from("exams")
        .update({ is_active: false })
        .neq("id", 0);

      if (deactivateError) {
        return NextResponse.json({ error: deactivateError.message }, { status: 500 });
      }

      // Then activate SSC CGL as sort_order: 1
      const { data: cglExam, error: findError } = await supabaseAdmin
        .from("exams")
        .select("id")
        .or("slug.eq.ssc-cgl,title.ilike.%cgl%")
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (cglExam) {
        await supabaseAdmin
          .from("exams")
          .update({ is_active: true, sort_order: 1 })
          .eq("id", cglExam.id);
      }

      return NextResponse.json({ 
        success: true, 
        message: "🎯 Focus Mode Activated: Only SSC CGL is now LIVE! All other exams are marked as Upcoming." 
      });
    }

    // 2. Activate All Core SSC Exams
    if (action === "enable_all_core") {
      const coreSlugs = ["ssc-cgl", "ssc-chsl", "ssc-cpo", "ssc-mts", "ssc-gd-constable", "ssc-stenographer", "ssc-selection-post"];
      
      const { error: coreError } = await supabaseAdmin
        .from("exams")
        .update({ is_active: true })
        .or(`slug.in.(${coreSlugs.join(",")}),title.ilike.%cgl%,title.ilike.%chsl%,title.ilike.%cpo%,title.ilike.%mts%,title.ilike.%gd%,title.ilike.%steno%`);

      if (coreError) {
        return NextResponse.json({ error: coreError.message }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: "🟢 All Core SSC Exams (CGL, CHSL, CPO, MTS, GD, Steno) are now LIVE!" 
      });
    }

    // 3. Toggle Single Exam Active State
    if (action === "toggle_active") {
      const { id, isActive } = body;
      if (!id && id !== 0) {
        return NextResponse.json({ error: "Missing exam ID" }, { status: 400 });
      }

      const { error } = await supabaseAdmin
        .from("exams")
        .update({ is_active: Boolean(isActive) })
        .eq("id", id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: isActive ? "🟢 Exam turned ON (Visible to students)" : "⚪ Exam turned OFF (Hidden / Upcoming)" 
      });
    }

    // 4. Set as Primary Exam (sort_order = 1)
    if (action === "set_primary") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "Missing exam ID" }, { status: 400 });

      // First increase all other exams sort order
      const { data: allExams } = await supabaseAdmin.from("exams").select("id, sort_order");
      if (allExams) {
        for (const ex of allExams) {
          if (ex.id !== id && ex.sort_order <= 1) {
            await supabaseAdmin.from("exams").update({ sort_order: (ex.sort_order || 1) + 1 }).eq("id", ex.id);
          }
        }
      }

      const { error } = await supabaseAdmin
        .from("exams")
        .update({ sort_order: 1, is_active: true })
        .eq("id", id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "⭐ Exam set as Primary Focus!" });
    }

    // 5. Save or Update Single Exam
    if (action === "save_exam") {
      const { id, title, description, sort_order } = body;
      if (!title || !title.trim()) {
        return NextResponse.json({ error: "Exam title is required" }, { status: 400 });
      }

      const payload: any = {
        title: title.trim(),
        description: description?.trim() || "",
        slug: slugify(title.trim()),
      };
      if (typeof sort_order === "number") payload.sort_order = sort_order;

      if (id) {
        const { error } = await supabaseAdmin.from("exams").update(payload).eq("id", id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, message: "Exam updated!" });
      } else {
        payload.is_active = false; // New exams start as upcoming by default
        payload.sort_order = 99;
        const { error } = await supabaseAdmin.from("exams").insert(payload);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, message: "Exam created as Upcoming!" });
      }
    }

    // 6. Delete Exam
    if (action === "delete_exam") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "Missing exam ID" }, { status: 400 });

      const { error } = await supabaseAdmin.from("exams").delete().eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, message: "Exam deleted successfully!" });
    }

    // 7. Master Syllabus Cloning across exams
    if (action === "sync_syllabus") {
      const { sourceExamId, targetExamIds } = body;
      if (!sourceExamId || !Array.isArray(targetExamIds) || targetExamIds.length === 0) {
        return NextResponse.json({ error: "Select a valid source and at least one target exam" }, { status: 400 });
      }

      const { data: sourceSubjects, error: subErr } = await supabaseAdmin
        .from("subjects")
        .select("*, topics(*)")
        .eq("exam_id", sourceExamId);

      if (subErr || !sourceSubjects || sourceSubjects.length === 0) {
        return NextResponse.json({ error: "Selected source exam has no subjects to copy." }, { status: 400 });
      }

      let clonedCount = 0;

      for (const targetId of targetExamIds) {
        if (targetId === sourceExamId) continue;

        for (const sub of sourceSubjects) {
          let { data: existingSub } = await supabaseAdmin
            .from("subjects")
            .select("id")
            .eq("exam_id", targetId)
            .eq("title", sub.title)
            .maybeSingle();

          let targetSubId = existingSub?.id;

          if (!targetSubId) {
            const { data: newSub, error: createSubErr } = await supabaseAdmin
              .from("subjects")
              .insert({
                title: sub.title,
                exam_id: targetId,
                slug: `${slugify(sub.title)}-${targetId}-${Date.now().toString().slice(-4)}`,
              })
              .select()
              .single();

            if (!createSubErr && newSub) {
              targetSubId = newSub.id;
            }
          }

          if (targetSubId && sub.topics && sub.topics.length > 0) {
            const { data: existingTopics } = await supabaseAdmin
              .from("topics")
              .select("title")
              .eq("subject_id", targetSubId);

            const existingTitles = new Set(existingTopics?.map((t: any) => t.title) || []);

            const newTopics = sub.topics
              .filter((t: any) => !existingTitles.has(t.title))
              .map((t: any, idx: number) => ({
                title: t.title,
                description: t.description,
                subject_id: targetSubId,
                is_free: t.is_free,
                slug: `${slugify(t.title)}-${targetId}-${idx}-${Date.now().toString().slice(-4)}`,
              }));

            if (newTopics.length > 0) {
              await supabaseAdmin.from("topics").insert(newTopics);
              clonedCount += newTopics.length;
            }
          }
        }
      }

      return NextResponse.json({ 
        success: true, 
        clonedCount,
        message: `🎉 Successfully synced ${clonedCount} topics across selected exams!` 
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Operation failed" }, { status: 500 });
  }
}
