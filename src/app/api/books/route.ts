import { NextResponse } from "next/server";
import { getBooks } from "@/lib/books-store";

export const revalidate = 60; // 1-minute ISR

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject") || undefined;
    const search = searchParams.get("search") || undefined;
    const all = searchParams.get("all") === "true";

    const books = getBooks({
      active_only: !all,
      subject,
      search,
    });

    return NextResponse.json({ success: true, books });
  } catch (err: any) {
    console.error("GET /api/books error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load books" },
      { status: 500 }
    );
  }
}
