import { NextResponse } from "next/server";
import { getSessionGateConfigAsync, saveSessionGateConfigAsync } from "@/lib/session-gate-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const config = await getSessionGateConfigAsync();
    return NextResponse.json({
      success: true,
      config,
    }, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load config" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const updated = await saveSessionGateConfigAsync({
      is_enabled: Boolean(payload.is_enabled),
      session_limit_minutes: Number(payload.session_limit_minutes) || 15,
      block_test_attempts: Boolean(payload.block_test_attempts),
      show_modal_popup: Boolean(payload.show_modal_popup),
      modal_title: payload.modal_title || "⏰ Guest Session Limit Reached",
      modal_message:
        payload.modal_message ||
        "Aapka 15-minute free guest preview complete ho chuka hai. Agla test attempt karne aur scorecards save karne ke liye kripya Free Login ya Sign Up karein.",
      exempt_logged_in: payload.exempt_logged_in !== false,
    });

    return NextResponse.json({
      success: true,
      message: "Guest session gatekeeper settings saved successfully!",
      config: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save config" },
      { status: 500 }
    );
  }
}
