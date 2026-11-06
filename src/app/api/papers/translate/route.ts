import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

// High-reliability Google Translate engine (Free, fast, supports Hindi)
async function translateTextToHindi(text: string): Promise<string> {
  if (!text || !text.trim()) return "";

  // 1. Preserve LaTeX math delimiters so math terms don't get altered
  const mathTokens: string[] = [];
  const placeholder = (idx: number) => `___MATH_TOKEN_${idx}___`;

  let masked = text.replace(
    /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$[^$\n]+\$)/g,
    (match) => {
      mathTokens.push(match);
      return placeholder(mathTokens.length - 1);
    }
  );

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(masked)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Google Translate responded with ${res.status}`);
    }

    const data = await res.json();
    let translated = (data[0] || []).map((part: any) => part[0]).join("");

    // Restore math delimiters
    mathTokens.forEach((token, idx) => {
      const p = placeholder(idx);
      translated = translated.split(p).join(token);
      // Fallback for translation space adjustments
      translated = translated.split(`___गणित_टोकन_${idx}___`).join(token);
      translated = translated.split(`___ MATH_TOKEN_${idx} ___`).join(token);
    });

    return translated.trim();
  } catch (err: any) {
    console.error("Translation error:", err);
    throw err;
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { text, options } = body;

    if (text) {
      const translated = await translateTextToHindi(text);
      return NextResponse.json({ success: true, translated });
    }

    if (options && typeof options === "object") {
      const translatedOptions: Record<string, string> = {};
      for (const [k, v] of Object.entries(options)) {
        if (typeof v === "string" && v.trim()) {
          translatedOptions[k] = await translateTextToHindi(v);
        } else {
          translatedOptions[k] = String(v ?? "");
        }
      }
      return NextResponse.json({ success: true, translatedOptions });
    }

    return NextResponse.json({ error: "Missing text or options to translate" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Translation failed" }, { status: 500 });
  }
}
