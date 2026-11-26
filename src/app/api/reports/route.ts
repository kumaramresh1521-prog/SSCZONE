import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";

// Helper to check admin for GET and PATCH
async function isUserAdmin(): Promise<boolean> {
  if (process.env.NODE_ENV === "development") return true;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
    return !!data?.is_admin;
  } catch {
    return false;
  }
}

// POST /api/reports - Students reporting question issues or site health anomalies
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const {
      questionId,
      reason,
      description,
      questionText,
      type = "question_issue",
      meta = {},
    } = body;
    
    // Safely extract numeric ID even if questionId is "pyq_15309", "bank_7422", or "q_1"
    const parsedDigits = parseInt(String(questionId || "").replace(/\D/g, ""), 10);
    const numericQuestionId = Number.isSafeInteger(Number(questionId))
      ? Number(questionId)
      : Number.isSafeInteger(parsedDigits) && parsedDigits > 0
      ? parsedDigits
      : 1;

    if (type === "question_issue" && !questionId) {
      return NextResponse.json({ error: "questionId is required" }, { status: 400 });
    }
    if (typeof description === "string" && description.length > 2000) {
      return NextResponse.json({ error: "Description is too long" }, { status: 400 });
    }

    const reportPayload = {
      id: Date.now(),
      type,
      question_id: numericQuestionId,
      raw_question_id: String(questionId || numericQuestionId),
      question_text: typeof questionText === "string" ? questionText.slice(0, 4000) : null,
      reason: typeof reason === "string" ? reason.slice(0, 120) : "Flagged issue",
      description: typeof description === "string" ? description : null,
      user_id: user?.id ?? null,
      status: "pending",
      created_at: new Date().toISOString(),
      meta,
    };

    // 1. Try dedicated question_reports table (supports logged in users or anonymous guests with user_id = null)
    let inserted = false;
    try {
      const { error: qrError } = await supabaseAdmin
        .from("question_reports")
        .insert({
          question_id: numericQuestionId,
          user_id: user?.id ?? null,
          reason: typeof reason === "string" ? reason.slice(0, 120) : "other",
          description: typeof description === "string" ? description : null,
          status: "pending",
        });

      if (!qrError) {
        inserted = true;
      }
    } catch {
      // Proceed to fallback
    }

    // 2. Persistent Supabase fallback using system-records in blogs table
    if (!inserted) {
      const slug = `sys-report-${type}-${questionId || Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const title = type === "question_issue"
        ? `[Student Flag] Question #${questionId}: ${reason}`
        : `[System Error] ${reason}`;

      const { error: blogErr } = await supabaseAdmin
        .from("blogs")
        .insert([
          {
            title,
            slug,
            excerpt: description ? description.substring(0, 160) : `Reported issue on Question #${questionId}`,
            content: JSON.stringify(reportPayload),
            keywords: `system-report:${type}`,
            seo_title: `Report-${questionId}`,
            is_published: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

      if (blogErr) {
        console.error("Failed to store fallback report:", blogErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Report logged successfully. Our academic team is reviewing it.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process report" }, { status: 500 });
  }
}

// GET /api/reports - Admin retrieving all student reports & site alerts
export async function GET(request: Request) {
  const admin = await isUserAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");

  try {
    const reportsList: any[] = [];

    // 1. Check question_reports table
    try {
      const { data: qrData, error: qrErr } = await supabaseAdmin
        .from("question_reports")
        .select("*, question:questions(id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic_id)")
        .order("created_at", { ascending: false });

      if (!qrErr && qrData) {
        // Enrich any reports that belong to paper_questions instead of questions
        const missingIds = qrData.filter((r) => !r.question).map((r) => r.question_id).filter(Boolean);
        if (missingIds.length > 0) {
          const { data: pqData } = await supabaseAdmin
            .from("paper_questions")
            .select("id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, paper_id, question_number, paper:previous_papers(title)")
            .in("id", missingIds);

          const pqMap = new Map((pqData || []).map((p: any) => [p.id, p]));
          for (const r of qrData) {
            if (!r.question && pqMap.has(r.question_id)) {
              const pq: any = pqMap.get(r.question_id);
              r.question = {
                id: pq.id,
                question_text: pq.question_text,
                option_a: pq.option_a,
                option_b: pq.option_b,
                option_c: pq.option_c,
                option_d: pq.option_d,
                correct_answer: pq.correct_answer,
                explanation: pq.explanation,
                paper_id: pq.paper_id,
                paper_title: pq.paper?.title,
                question_number: pq.question_number,
              };
            }
          }
        }
        reportsList.push(...qrData);
      }
    } catch {}

    // 2. Fetch system reports stored in Supabase blogs
    try {
      const { data: sysData, error: sysErr } = await supabaseAdmin
        .from("blogs")
        .select("*")
        .ilike("keywords", "%system-report%")
        .order("created_at", { ascending: false });

      if (!sysErr && sysData) {
        const sysParsedList: any[] = [];
        const sysQIdsToLookup: number[] = [];

        for (const item of sysData) {
          try {
            const parsed = JSON.parse(item.content);
            const qId = parsed.question_id ? Number(parsed.question_id) : null;
            if (qId && Number.isSafeInteger(qId)) {
              sysQIdsToLookup.push(qId);
            }
            sysParsedList.push({ item, parsed, qId });
          } catch {
            reportsList.push({
              id: item.id,
              record_source: "blogs_sys",
              question_id: null,
              reason: item.title,
              description: item.excerpt,
              status: "pending",
              created_at: item.created_at,
            });
          }
        }

        // Batch lookup question details for sys reports
        let sysPqMap = new Map<number, any>();
        let sysQMap = new Map<number, any>();
        if (sysQIdsToLookup.length > 0) {
          const uniqueIds = Array.from(new Set(sysQIdsToLookup));
          const [pqRes, qRes] = await Promise.all([
            supabaseAdmin
              .from("paper_questions")
              .select("id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, paper_id, question_number, paper:previous_papers(title)")
              .in("id", uniqueIds),
            supabaseAdmin
              .from("questions")
              .select("id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic_id")
              .in("id", uniqueIds),
          ]);
          if (pqRes.data) sysPqMap = new Map(pqRes.data.map((p: any) => [p.id, p]));
          if (qRes.data) sysQMap = new Map(qRes.data.map((q: any) => [q.id, q]));
        }

        for (const { item, parsed, qId } of sysParsedList) {
          const pq = qId ? sysPqMap.get(qId) : null;
          const q = qId ? sysQMap.get(qId) : null;

          reportsList.push({
            id: item.id,
            record_source: "blogs_sys",
            question_id: qId,
            user_id: parsed.user_id,
            reason: parsed.reason,
            description: parsed.description,
            status: parsed.status || "pending",
            created_at: item.created_at || parsed.created_at,
            question: pq
              ? {
                  id: pq.id,
                  question_text: pq.question_text,
                  option_a: pq.option_a,
                  option_b: pq.option_b,
                  option_c: pq.option_c,
                  option_d: pq.option_d,
                  correct_answer: pq.correct_answer,
                  explanation: pq.explanation,
                  paper_id: pq.paper_id,
                  paper_title: pq.paper?.title,
                  question_number: pq.question_number,
                }
              : q
              ? {
                  id: q.id,
                  question_text: q.question_text,
                  option_a: q.option_a,
                  option_b: q.option_b,
                  option_c: q.option_c,
                  option_d: q.option_d,
                  correct_answer: q.correct_answer,
                  explanation: q.explanation,
                  topic_id: q.topic_id,
                }
              : {
                  question_text: parsed.question_text || item.title,
                  correct_answer: parsed.meta?.correct_answer || "N/A",
                },
          });
        }
      }
    } catch {}

    // Sort descending by created_at
    reportsList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Apply status filter if requested
    const filtered = statusFilter && statusFilter !== "all"
      ? reportsList.filter((r) => r.status === statusFilter)
      : reportsList;

    return NextResponse.json({
      reports: filtered,
      totalCount: reportsList.length,
      pendingCount: reportsList.filter((r) => r.status === "pending").length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load reports" }, { status: 500 });
  }
}

// PATCH /api/reports - Admin resolving or updating status of a report
export async function PATCH(request: Request) {
  if (!(await isUserAdmin())) {
    return NextResponse.json({ error: "Unauthorized: Admin privileges required" }, { status: 403 });
  }

  try {
    const { id, status, record_source } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }

    if (record_source === "blogs_sys" || (typeof id === "string" && id.includes("-"))) {
      // Fetch existing content and update status
      const { data: blogRow } = await supabaseAdmin.from("blogs").select("content").eq("id", id).single();
      if (blogRow?.content) {
        try {
          const parsed = JSON.parse(blogRow.content);
          parsed.status = status;
          await supabaseAdmin
            .from("blogs")
            .update({ content: JSON.stringify(parsed), updated_at: new Date().toISOString() })
            .eq("id", id);
        } catch {
          await supabaseAdmin
            .from("blogs")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", id);
        }
      }
    } else {
      await supabaseAdmin
        .from("question_reports")
        .update({ status })
        .eq("id", id);
    }

    return NextResponse.json({ success: true, message: `Report marked as ${status}` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update report" }, { status: 500 });
  }
}
