import type { Metadata } from "next";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions — SSCZone",
  description: "Terms and Conditions governing the use of SSCZone website, mobile application, and subscription passes.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50/60">
      
      <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white py-12 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <FileText className="mx-auto h-10 w-10 text-amber-400 mb-2" />
          <h1 className="text-3xl font-extrabold md:text-4xl">Terms & Conditions</h1>
          <p className="mt-2 text-xs text-blue-200">Last updated: January 2026</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 md:p-10 shadow-xs space-y-6 text-sm text-gray-700 leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">1. Terms of Use</h2>
            <p>
              By accessing or using <b>SSCZone</b>, you agree to comply with and be bound by these Terms and Conditions.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">2. Intellectual Property</h2>
            <p>
              All questions, solution explanations, UI designs, graphics, and software code on SSCZone are the intellectual property of SSCZone Education Technologies.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">3. Subscription & Pass Access</h2>
            <p>
              Subscriptions (e.g. 1 Year Pass) grant access to premium test series and practice modules for the specified duration. Passes are non-transferable.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">4. User Accounts</h2>
            <p>
              Users are responsible for maintaining confidentiality of account credentials. Account sharing or unauthorized data scraping is strictly prohibited.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
