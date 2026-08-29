"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Script from "next/script";
import toast from "react-hot-toast";

declare global {
  interface Window { Razorpay: any; }
}

export default function PricingPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    supabase.from("packages").select("*, exams(title)").eq("is_active", true).then(({ data }) => setPackages(data ?? []));
  }, []);

  async function handlePurchase(pkg: any) {
    if (!user) return router.push("/login");
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) return toast.error("Payments not configured yet. Please try again later.");
    setLoading(pkg.id.toString());

    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id }),
      });
      const order = await res.json();
      if (!order.id) throw new Error(order.error || "Failed to create order");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "SSCZone",
        description: pkg.title,
        order_id: order.id,
        prefill: { email: user.email },
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, packageId: pkg.id }),
          });
          const result = await verifyRes.json();
          if (result.success) {
            toast.success("Payment successful! Subscription activated.");
            router.refresh();
          } else {
            toast.error("Payment verification failed.");
          }
        },
        modal: { ondismiss: () => setLoading(null) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => { toast.error("Payment failed"); setLoading(null); });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message);
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
            <section className="mx-auto max-w-7xl px-4 py-16">
        <h1 className="text-center text-3xl font-bold">Choose Your Plan</h1>
        <p className="mt-2 text-center text-gray-600">Unlock premium topics and full-length tests</p>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {packages.map(pkg => (
            <div key={pkg.id} className="flex flex-col rounded-2xl bg-white p-8 shadow-lg">
              <p className="text-sm text-gray-500">{pkg.exams?.title || "General"}</p>
              <h2 className="mt-2 text-2xl font-bold">{pkg.title}</h2>
              <p className="mt-1 text-gray-600">{pkg.description}</p>
              <p className="mt-6 text-4xl font-bold text-primary">₹{pkg.price}</p>
              <p className="mt-1 text-sm text-gray-500">{pkg.duration_days} days access</p>
              <button onClick={() => handlePurchase(pkg)} disabled={loading === pkg.id.toString()}
                className="mt-8 w-full rounded-lg bg-primary py-3 font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                {loading === pkg.id.toString() ? "Processing..." : "Subscribe Now"}
              </button>
            </div>
          ))}
          {packages.length === 0 && (
            <p className="col-span-full text-center text-gray-500">Plans coming soon. Check back later.</p>
          )}
        </div>
      </section>
    </div>
  );
}
