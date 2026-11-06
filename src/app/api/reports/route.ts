import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";

// Helper to check admin for GET and PATCH
async function isUserAdmin(): Promise<boolean> {
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
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const {
      questionId,
      reason,
      description,
      questionText,
      type = "question_issue",
      meta = {},
    } = body;
    const numericQuestionId = questionId ? Number(questionId) : null;

    if (type === "question_issue" && (!numericQuestionId || !Number.isSafeInteger(numericQuestionId))) {
      return NextResponse.json({ error: "questionId is required" }, { status: 400 });
    }
    if (typeof description === "string" && description.length > 2000) {
      return NextResponse.json({ error: "Description is too long" }, { status: 400 });
    }

    const reportPayload = {
      id: Date.now(),
      type,
      question_id: numericQuestionId,
      question_text: typeof questionText === "string" ? questionText.slice(0, 4000) : null,
      reason: typeof reason === "string" ? reason.slice(0, 120) : "Flagged issue",
      description: typeof description === "string" ? description : null,
      user_id: user.id,
      status: "pending",
      created_at: new Date().toISOString(),
      meta,
    };

    // 1. Try dedicated question_reports table
    let inserted = false;
    try {
      const { error: qrError } = await supabaseAdmin
        .from("question_reports")
        .insert({
          question_id: numericQuestionId,
          user_id: user.id,
          reason: typeof reason === "string" ? reason.slice(0, 120) : "other",
          description: typeof description === "string" ? description : null,
          status: "pending",
        });

      if (!qrError) {
        inserted = true;
      }
    } catch {
      // Table doesn't exist yet, proceed to robust fallback
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
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");

  try {
    const reportsList: any[] = [];

    // 1. Check question_reports table
    try {
      const { data: qrData, error: qrErr } = await supabaseAdmin
        .from("question_reports")
        .select("*, question:questions(question_text, topic_id, correct_answer)")
        .order("created_at", { ascending: false });

      if (!qrErr && qrData) {
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
        for (const item of sysData) {
          try {
            const parsed = JSON.parse(item.content);
            reportsList.push({
              id: item.id,
              record_source: "blogs_sys",
              question_id: parsed.question_id,
              user_id: parsed.user_id,
              reason: parsed.reason,
              description: parsed.description,
              status: parsed.status || "pending",
              created_at: item.created_at || parsed.created_at,
              question: {
                question_text: parsed.question_text || item.title,
                correct_answer: parsed.meta?.correct_answer || "N/A",
              },
            });
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

    if (record_source === "blogs_sys") {
      // Fetch existing content and update status
      const { data: blogRow } = await supabaseAdmin.from("blogs").select("content").eq("id", id).single();
      if (blogRow?.content) {
        const parsed = JSON.parse(blogRow.content);
        parsed.status = status;
        await supabaseAdmin
          .from("blogs")
          .update({ content: JSON.stringify(parsed), updated_at: new Date().toISOString() })
          .eq("id", id);
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
