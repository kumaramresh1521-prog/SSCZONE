import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const { count } = await supabaseAdmin.from("exams").select("*", { count: "exact", head: true });
    return NextResponse.json({ status: "ok", db: true, exams: count ?? 0, timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ status: "error", db: false }, { status: 500 });
  }
}
