import { NextRequest, NextResponse } from "next/server";
import { getSubjectNotes } from "@/lib/subject-notes-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const examParam = searchParams.get("exam")?.toLowerCase() || "";
    const subjectParam = searchParams.get("subject")?.toLowerCase() || "";
    const query = searchParams.get("q")?.toLowerCase() || "";

    let notes = getSubjectNotes(true);

    if (examParam && examParam !== "all") {
      notes = notes.filter((n) => n.exam.toLowerCase() === examParam || n.exam === "all");
    }

    if (subjectParam && subjectParam !== "all") {
      notes = notes.filter((n) => n.subject.toLowerCase() === subjectParam);
    }

    if (query) {
      notes = notes.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.topic.toLowerCase().includes(query) ||
          n.description.toLowerCase().includes(query) ||
          (n.hindi_title && n.hindi_title.toLowerCase().includes(query))
      );
    }

    return NextResponse.json({ success: true, notes });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load notes" }, { status: 500 });
  }
}
