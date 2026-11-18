import { NextResponse } from "next/server";
import { getBooksAsync } from "@/lib/books-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject") || undefined;
    const search = searchParams.get("search") || undefined;
    const all = searchParams.get("all") === "true";

    const books = await getBooksAsync({
      active_only: !all,
      subject,
      search,
    });

    return NextResponse.json({ success: true, books }, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch (err: any) {
    console.error("GET /api/books error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load books" },
      { status: 500 }
    );
  }
}
