import type { Metadata } from "next";
import { CreditCard } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — SSCZone",
  description: "Refund and Cancellation policy for SSCZone pass purchases and digital subscription plans.",
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-gray-50/60">
      
      <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white py-12 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <CreditCard className="mx-auto h-10 w-10 text-amber-400 mb-2" />
          <h1 className="text-3xl font-extrabold md:text-4xl">Refund & Cancellation Policy</h1>
          <p className="mt-2 text-xs text-blue-200">Last updated: January 2026</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 md:p-10 shadow-xs space-y-6 text-sm text-gray-700 leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">1. Digital Subscriptions</h2>
            <p>
              SSCZone provides instant digital access to practice questions, solution explanations, and test series. Due to the digital nature of the content, purchases are non-refundable once content access is granted.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">2. Double Deduction / Payment Errors</h2>
            <p>
              In case of double payment deduction due to a technical error during Razorpay checkout, the extra amount will be refunded automatically to your original payment method within 5–7 business days.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">3. Refund Requests</h2>
            <p>
              For payment queries or double charge issues, please contact us at <b>support@ssczone.com</b> with your order ID and payment reference number.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
