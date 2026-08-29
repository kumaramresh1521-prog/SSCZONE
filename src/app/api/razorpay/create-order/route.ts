import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const { packageId } = await req.json();

    const { data: pkg } = await supabaseAdmin.from("packages").select("*").eq("id", packageId).eq("is_active", true).single();
    if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet: Array<{ name: string; value: string; options?: any }>) => {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const totalAmount = Math.round(Number(pkg.price) * 100);
    const receipt = `rcpt_${user.id.slice(0, 8)}_${Date.now().toString(36)}`;

    const basicAuth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: `Basic ${basicAuth}`, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: totalAmount, currency: "INR", receipt }),
    });

    const order = await res.json();
    if (!order.id) throw new Error(order.error?.description || "Razorpay error");

    await supabaseAdmin.from("subscriptions").insert({
      user_id: user.id,
      package_id: pkg.id,
      razorpay_order_id: order.id,
      amount: pkg.price,
      status: "pending",
    });

    return NextResponse.json({ id: order.id, amount: order.amount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
