import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { translateToHindi, isTranslatableOption } from "@/lib/translator";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { text, options } = body;

    let translated = "";
    if (text && typeof text === "string") {
      translated = await translateToHindi(text);
    }

    let translatedOptions: Record<string, string> | undefined = undefined;
    if (options && typeof options === "object") {
      translatedOptions = {};
      for (const [k, v] of Object.entries(options)) {
        const valStr = typeof v === "string" ? v.trim() : String(v ?? "");
        // Only translate options that are descriptive sentences (e.g. "Neither conclusion I nor II follows")
        // NEVER machine-translate reasoning letter codes, mixed-case ciphers, images, formulas, or numbers
        if (isTranslatableOption(valStr)) {
          translatedOptions[k] = await translateToHindi(valStr);
        } else {
          translatedOptions[k] = valStr;
        }
      }
    }

    if (!text && !options) {
      return NextResponse.json({ error: "Missing text or options to translate" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      translated,
      translatedOptions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Translation failed" }, { status: 500 });
  }
}
