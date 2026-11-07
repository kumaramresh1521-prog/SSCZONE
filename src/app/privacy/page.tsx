import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo-store";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/privacy", {
    title: "Privacy Policy — SSCZone",
    description: "Privacy Policy of SSCZone explaining data collection, account privacy, and user data rights.",
  });
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50/60">
      
      <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white py-12 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-amber-400 mb-2" />
          <h1 className="text-3xl font-extrabold md:text-4xl">Privacy Policy</h1>
          <p className="mt-2 text-xs text-blue-200">Last updated: January 2026</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 md:p-10 shadow-xs space-y-6 text-sm text-gray-700 leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">1. Introduction</h2>
            <p>
              Welcome to <b>SSCZone</b> ("we", "our", "us"). We value your trust and are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <b>ssczone.com</b> or use our mobile application.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><b>Personal Identification:</b> Name, email address, phone number when creating an account or subscribing to a package.</li>
              <li><b>Payment Information:</b> Payment details processed securely via Razorpay payment gateway (we do not store credit card numbers on our servers).</li>
              <li><b>Usage & Progress Data:</b> Test attempt scores, question bookmarks, topic accuracy, and learning performance.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">3. How We Use Your Data</h2>
            <p>
              We use the collected information to manage user accounts, deliver test series, track study progress, process payments, and improve platform features.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">4. Data Security</h2>
            <p>
              Your data is encrypted and stored securely using industry-standard protocols via Supabase PostgreSQL infrastructure and SSL encryption.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">5. Contact Information</h2>
            <p>
              If you have any questions or requests regarding your data, please email us at <b>support@ssczone.com</b>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
