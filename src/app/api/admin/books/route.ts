import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getBooks, getBookById, saveBook, deleteBook, BookItem } from "@/lib/books-store";

export async function GET() {
  try {
    const books = getBooks({ active_only: false });
    return NextResponse.json({ success: true, books });
  } catch (err: any) {
    console.error("GET /api/admin/books error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load books" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title) {
      return NextResponse.json(
        { success: false, error: "Book title is required" },
        { status: 400 }
      );
    }

    const saved = saveBook(body);

    try {
      revalidatePath("/books");
      revalidatePath("/admin/books");
    } catch {}

    return NextResponse.json({ success: true, book: saved });
  } catch (err: any) {
    console.error("POST /api/admin/books error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to save book" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Book ID is required" },
        { status: 400 }
      );
    }

    const ok = deleteBook(id);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Book not found" },
        { status: 404 }
      );
    }

    try {
      revalidatePath("/books");
      revalidatePath("/admin/books");
    } catch {}

    return NextResponse.json({ success: true, message: "Book deleted successfully" });
  } catch (err: any) {
    console.error("DELETE /api/admin/books error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to delete book" },
      { status: 500 }
    );
  }
}
