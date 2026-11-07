import { NextRequest, NextResponse } from "next/server";
import {
  getServerTypingPassages,
  saveServerTypingPassage,
  deleteServerTypingPassage,
  resetServerTypingPassages,
} from "@/lib/server-typing-store";
import { TypingPassage } from "@/lib/typing-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const examParam = searchParams.get("exam")?.toLowerCase();

    let passages = getServerTypingPassages();
    if (examParam && examParam !== "all") {
      passages = passages.filter((p) => p.examType.toLowerCase() === examParam);
    }

    return NextResponse.json(
      {
        success: true,
        count: passages.length,
        passages,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "reset") {
      const resetList = resetServerTypingPassages();
      return NextResponse.json({
        success: true,
        passages: resetList,
        message: "Passages reset to default library.",
      });
    }

    const { title, content, examType, examName, timeMinutes, targetWPM, targetKeyDepressions } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: "Title and content are required." },
        { status: 400 }
      );
    }

    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const computedDepressions = targetKeyDepressions || wordCount * 5;

    const savedPassage = saveServerTypingPassage({
      id: body.id,
      title: title.trim(),
      content: content.trim(),
      examType: examType || "cgl",
      examName:
        examName ||
        (examType === "cgl"
          ? "SSC CGL DEST"
          : examType === "chsl-en"
          ? "SSC CHSL English"
          : examType === "chsl-hi"
          ? "SSC CHSL Hindi"
          : examType === "deo"
          ? "SSC DEO High Speed"
          : "Custom Practice"),
      timeMinutes: Number(timeMinutes) || 15,
      targetWPM:
        Number(targetWPM) ||
        (examType === "deo" ? 50 : examType === "chsl-en" ? 35 : examType === "chsl-hi" ? 30 : 27),
      targetKeyDepressions: Number(computedDepressions),
      wordCount,
      difficulty: body.difficulty || "Medium",
      isDefault: Boolean(body.isDefault),
    });

    return NextResponse.json({
      success: true,
      passage: savedPassage,
      message: "Typing passage saved successfully.",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "ID required." }, { status: 400 });
    }

    const deleted = deleteServerTypingPassage(id);
    return NextResponse.json({ success: deleted, message: "Passage deleted." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
