import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { syncPyqToQuestionBank } from "@/lib/question-sync";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Helper to sync local TXT and JSON backups
async function syncLocalBackup(paperId: number) {
  try {
    const { data: paper } = await supabaseAdmin
      .from("previous_papers")
      .select("id, title, year, duration_minutes, exams(title)")
      .eq("id", paperId)
      .single();

    const { data: questions } = await supabaseAdmin
      .from("paper_questions")
      .select("*")
      .eq("paper_id", paperId)
      .order("question_number", { ascending: true });

    if (!paper || !questions) return;

    const slug = (paper.title || `paper_${paperId}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const backupDir = path.join(process.cwd(), "src", "data", "pyq_backup");
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    // Generate formatted TXT
    let txt = `================================================================================\n`;
    txt += `${(paper.title || "SSC ZONE PYQ PAPER").toUpperCase()}\n`;
    txt += `Exam: ${(paper as any).exams?.title || "SSC Examination"} | Year: ${paper.year || 2025}\n`;
    txt += `Total Questions: ${questions.length} | Duration: ${paper.duration_minutes || 60} Minutes\n`;
    txt += `Extracted from Official Answer Key via SSC ZONE (www.ssczone.in)\n`;
    txt += `Last Updated: ${new Date().toLocaleString()}\n`;
    txt += `================================================================================\n\n`;

    questions.forEach((q, idx) => {
      const qNo = q.question_number || idx + 1;
      txt += `Q${qNo}. ${q.question_text}\n`;
      if (q.image_url) txt += `[Question Image: ${q.image_url}]\n`;
      txt += `A) ${q.option_a}${q.option_a_image_url ? ` [Image: ${q.option_a_image_url}]` : ""}\n`;
      txt += `B) ${q.option_b}${q.option_b_image_url ? ` [Image: ${q.option_b_image_url}]` : ""}\n`;
      txt += `C) ${q.option_c}${q.option_c_image_url ? ` [Image: ${q.option_c_image_url}]` : ""}\n`;
      txt += `D) ${q.option_d}${q.option_d_image_url ? ` [Image: ${q.option_d_image_url}]` : ""}\n`;
      txt += `Correct Answer: Option ${q.correct_answer}\n`;
      if (q.explanation && q.explanation.trim()) {
        txt += `Explanation: ${q.explanation.trim()}\n`;
      }
      txt += `--------------------------------------------------------------------------------\n\n`;
    });

    const txtPath = path.join(backupDir, `${slug}.txt`);
    const jsonPath = path.join(backupDir, `${slug}.json`);
    fs.writeFileSync(txtPath, txt, "utf-8");
    fs.writeFileSync(jsonPath, JSON.stringify(questions, null, 2), "utf-8");

    // An optional local-only backup folder; Cloud Run leaves this unset.
    const extDir = process.env.PYQ_BACKUP_DIRECTORY;
    if (extDir && path.isAbsolute(extDir) && fs.existsSync(extDir)) {
      try {
        fs.writeFileSync(path.join(extDir, `${slug}.txt`), txt, "utf-8");
        fs.writeFileSync(path.join(extDir, `${slug}.json`), JSON.stringify(questions, null, 2), "utf-8");
      } catch {}
    }
  } catch (err) {
    console.error("syncLocalBackup error:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Bulk Import (Batch insert/overwrite)
    if (body.bulk && Array.isArray(body.questions)) {
      const { paper_id, questions, overwrite } = body;
      const pid = Number(paper_id);
      if (!pid) {
        return NextResponse.json({ error: "Missing paper_id" }, { status: 400 });
      }

      if (overwrite) {
        const { error: delErr } = await supabaseAdmin
          .from("paper_questions")
          .delete()
          .eq("paper_id", pid);
        if (delErr) {
          return NextResponse.json({ error: delErr.message }, { status: 500 });
        }
      }

      const chunkSize = 50;
      let insertedCount = 0;

      for (let i = 0; i < questions.length; i += chunkSize) {
        const chunk = questions.slice(i, i + chunkSize);
        const { error: insErr } = await supabaseAdmin
          .from("paper_questions")
          .insert(chunk);
        if (insErr) {
          return NextResponse.json({ error: insErr.message }, { status: 500 });
        }
        insertedCount += chunk.length;
      }

      await syncLocalBackup(pid);
      return NextResponse.json({ success: true, count: insertedCount });
    }

    // 2. Single Question (Insert or Update)
    const {
      id,
      paper_id,
      question_number,
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      explanation,
    } = body;

    const pid = Number(paper_id);
    if (!pid || !question_text) {
      return NextResponse.json(
        { error: "Missing required fields (paper_id, question_text)" },
        { status: 400 }
      );
    }

    const payloadWithExp: any = {
      paper_id: pid,
      question_number: Number(question_number) || 1,
      question_text: String(question_text).trim(),
      option_a: String(option_a ?? "").trim(),
      option_b: String(option_b ?? "").trim(),
      option_c: String(option_c ?? "").trim(),
      option_d: String(option_d ?? "").trim(),
      correct_answer: String(correct_answer || "A").trim().toUpperCase(),
      explanation: explanation ? String(explanation).trim() : null,
    };

    const payloadBase: any = {
      paper_id: pid,
      question_number: Number(question_number) || 1,
      question_text: String(question_text).trim(),
      option_a: String(option_a ?? "").trim(),
      option_b: String(option_b ?? "").trim(),
      option_c: String(option_c ?? "").trim(),
      option_d: String(option_d ?? "").trim(),
      correct_answer: String(correct_answer || "A").trim().toUpperCase(),
    };

    let result = null;

    if (id) {
      // UPDATE existing question
      let { data, error } = await supabaseAdmin
        .from("paper_questions")
        .update(payloadWithExp)
        .eq("id", Number(id))
        .select()
        .single();

      if (error && error.message.includes("explanation")) {
        const fallback = await supabaseAdmin
          .from("paper_questions")
          .update(payloadBase)
          .eq("id", Number(id))
          .select()
          .single();
        error = fallback.error;
        data = fallback.data;
      }

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      result = data;

      // ── 2-Way Sync: If this question is mapped in Question Bank, auto-sync changes ──
      await syncPyqToQuestionBank(Number(id), payloadWithExp);
    } else {
      // INSERT new question
      let { data, error } = await supabaseAdmin
        .from("paper_questions")
        .insert(payloadWithExp)
        .select()
        .single();

      if (error && error.message.includes("explanation")) {
        const fallback = await supabaseAdmin
          .from("paper_questions")
          .insert(payloadBase)
          .select()
          .single();
        error = fallback.error;
        data = fallback.data;
      }

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      result = data;

      // ── 2-Way Sync: If this question is mapped in Question Bank, auto-sync changes ──
      await syncPyqToQuestionBank(Number(id), payloadWithExp);
    }

    // Update local TXT/JSON backups
    await syncLocalBackup(pid);

    return NextResponse.json({ success: true, question: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, paper_id } = body;

    if (id) {
      // Fetch paper_id before deleting so we can sync backup
      const { data: q } = await supabaseAdmin
        .from("paper_questions")
        .select("paper_id")
        .eq("id", Number(id))
        .maybeSingle();

      const { error } = await supabaseAdmin
        .from("paper_questions")
        .delete()
        .eq("id", Number(id));

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (q?.paper_id) {
        await syncLocalBackup(q.paper_id);
      }

      return NextResponse.json({ success: true });
    }

    if (paper_id) {
      const { error } = await supabaseAdmin
        .from("paper_questions")
        .delete()
        .eq("paper_id", Number(paper_id));

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      await syncLocalBackup(Number(paper_id));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Missing id or paper_id" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, paper_id, id, question_number, ordered_ids, id_a, id_b } = body;
    const pid = Number(paper_id);
    if (!pid) {
      return NextResponse.json({ error: "Missing paper_id" }, { status: 400 });
    }

    // 1. Single Question Number Update
    if (action === "update_number" && id && question_number !== undefined) {
      const qNum = Number(question_number);
      if (!qNum || qNum < 1) {
        return NextResponse.json({ error: "Invalid question_number" }, { status: 400 });
      }

      const { error } = await supabaseAdmin
        .from("paper_questions")
        .update({ question_number: qNum })
        .eq("id", Number(id))
        .eq("paper_id", pid);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      await syncLocalBackup(pid);
      return NextResponse.json({ success: true, question_number: qNum });
    }

    // 2. Swap Question Numbers between two questions
    if (action === "swap_order" && id_a && id_b) {
      const { data: qList, error: fetchErr } = await supabaseAdmin
        .from("paper_questions")
        .select("id, question_number")
        .in("id", [Number(id_a), Number(id_b)])
        .eq("paper_id", pid);

      if (fetchErr || !qList || qList.length !== 2) {
        return NextResponse.json({ error: "Could not find both questions to swap" }, { status: 400 });
      }

      const qA = qList.find((q) => q.id === Number(id_a));
      const qB = qList.find((q) => q.id === Number(id_b));

      if (!qA || !qB) {
        return NextResponse.json({ error: "Questions not found" }, { status: 400 });
      }

      await supabaseAdmin
        .from("paper_questions")
        .update({ question_number: qB.question_number })
        .eq("id", qA.id);

      await supabaseAdmin
        .from("paper_questions")
        .update({ question_number: qA.question_number })
        .eq("id", qB.id);

      await syncLocalBackup(pid);
      return NextResponse.json({ success: true, swapped: [qA.id, qB.id] });
    }

    // 3. Resequence / Auto-Renumber (1 to N)
    if (action === "resequence") {
      let idsToSequence: number[] = [];

      if (Array.isArray(ordered_ids) && ordered_ids.length > 0) {
        idsToSequence = ordered_ids.map(Number);
      } else {
        const { data: existing, error: getErr } = await supabaseAdmin
          .from("paper_questions")
          .select("id, question_number")
          .eq("paper_id", pid)
          .order("question_number", { ascending: true })
          .order("id", { ascending: true });

        if (getErr || !existing) {
          return NextResponse.json({ error: getErr?.message || "Failed to fetch questions" }, { status: 500 });
        }
        idsToSequence = existing.map((q) => q.id);
      }

      for (let i = 0; i < idsToSequence.length; i++) {
        const targetQNum = i + 1;
        await supabaseAdmin
          .from("paper_questions")
          .update({ question_number: targetQNum })
          .eq("id", idsToSequence[i])
          .eq("paper_id", pid);
      }

      await syncLocalBackup(pid);
      return NextResponse.json({ success: true, count: idsToSequence.length });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
