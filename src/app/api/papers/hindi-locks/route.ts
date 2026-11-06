import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireAdmin } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

const LOCKS_FILE = path.join(process.cwd(), "src", "data", "paper_hindi_locks.json");

function readLocks(): Record<string, number[]> {
  try {
    if (fs.existsSync(LOCKS_FILE)) {
      return JSON.parse(fs.readFileSync(LOCKS_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading paper_hindi_locks.json:", e);
  }
  return {};
}

function writeLocks(data: Record<string, number[]>) {
  try {
    const dir = path.dirname(LOCKS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCKS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing paper_hindi_locks.json:", e);
  }
}

// GET /api/papers/hindi-locks?paperId=1
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const paperId = searchParams.get("paperId");
  if (!paperId) {
    return NextResponse.json({ error: "Missing paperId" }, { status: 400 });
  }

  const allLocks = readLocks();
  const lockedIds = allLocks[String(paperId)] || [];
  return NextResponse.json({ paperId, lockedIds });
}

// POST /api/papers/hindi-locks
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { paperId, questionId, locked, lockedIds } = body;

    if (!paperId) {
      return NextResponse.json({ error: "Missing paperId" }, { status: 400 });
    }

    const allLocks = readLocks();
    const current = new Set(allLocks[String(paperId)] || []);

    if (Array.isArray(lockedIds)) {
      // Bulk update locked IDs
      allLocks[String(paperId)] = Array.from(new Set(lockedIds.map(Number)));
    } else if (questionId !== undefined && locked !== undefined) {
      const qid = Number(questionId);
      if (locked) {
        current.add(qid);
      } else {
        current.delete(qid);
      }
      allLocks[String(paperId)] = Array.from(current);
    }

    writeLocks(allLocks);
    return NextResponse.json({ success: true, lockedIds: allLocks[String(paperId)] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update locks" }, { status: 500 });
  }
}
