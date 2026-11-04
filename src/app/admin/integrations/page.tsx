"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Cloud,
  CloudCog,
  CreditCard,
  ExternalLink,
  Image,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

type ServiceState = { configured: boolean; healthy?: boolean };

type SystemStatus = {
  checkedAt: string;
  services: {
    supabase: ServiceState;
    razorpay: ServiceState;
    cloudinary: ServiceState;
    adsense: ServiceState;
    googleAnalytics: ServiceState;
    cloudRun: ServiceState;
  };
};

const cards = [
  { id: "supabase", title: "Supabase", note: "Database & authentication", icon: ShieldCheck, href: "https://supabase.com/dashboard" },
  { id: "razorpay", title: "Razorpay", note: "Payments", icon: CreditCard, href: "https://dashboard.razorpay.com" },
  { id: "cloudinary", title: "Cloudinary", note: "Question images", icon: Image, href: "https://console.cloudinary.com" },
  { id: "adsense", title: "Google AdSense", note: "Advertising", icon: Activity, href: "https://adsense.google.com" },
  { id: "googleAnalytics", title: "Google Analytics", note: "Traffic & conversions", icon: BarChart3, href: "https://analytics.google.com" },
  { id: "cloudRun", title: "Google Cloud Run", note: "Hosting", icon: Cloud, href: "https://console.cloud.google.com/run" },
] as const;

export default function IntegrationsPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/system-status", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Status check failed");
      setStatus(payload);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "System status could not be loaded");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const connectedCount = status
    ? cards.filter((card) => status.services[card.id].configured && status.services[card.id].healthy !== false).length
    : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 text-slate-100">
      <section className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase text-sky-300">Operations</p>
          <h1 className="mt-1 text-2xl font-bold text-white">System & Integrations</h1>
          <p className="mt-2 text-sm text-slate-400">Connected services, payment readiness, and deployment health.</p>
        </div>
        <button
          type="button"
          onClick={() => void loadStatus()}
          disabled={loading}
          className="a-btn a-btn-ghost self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh status
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Summary label="Connected" value={`${connectedCount} / ${cards.length}`} icon={CheckCircle2} tone="text-emerald-300" />
        <Summary label="Needs setup" value={status ? String(cards.length - connectedCount) : "--"} icon={TriangleAlert} tone="text-amber-300" />
        <Summary
          label="Last check"
          value={status ? new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(new Date(status.checkedAt)) : "Checking"}
          icon={Activity}
          tone="text-sky-300"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {cards.map((card) => {
          const service = status?.services[card.id];
          const isHealthy = Boolean(service?.configured && service.healthy !== false);
          const Icon = card.icon;

          return (
            <article key={card.id} className="a-card flex items-center gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${isHealthy ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300" : "border-amber-400/25 bg-amber-400/10 text-amber-300"}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-white">{card.title}</h2>
                <p className="mt-0.5 text-sm text-slate-400">{card.note}</p>
                <div className={`mt-2 inline-flex items-center gap-1.5 text-xs font-semibold ${isHealthy ? "text-emerald-300" : "text-amber-300"}`}>
                  <span className={`h-2 w-2 rounded-full ${isHealthy ? "bg-emerald-400" : "bg-amber-400"}`} />
                  {loading ? "Checking" : isHealthy ? "Connected" : "Setup required"}
                </div>
              </div>
              <Link href={card.href} target="_blank" rel="noreferrer" className="a-btn a-btn-ghost a-btn-sm" title={`Open ${card.title}`}>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </article>
          );
        })}
      </section>

      <section className="a-card border-sky-400/15 bg-sky-400/[0.04]">
        <div className="flex items-start gap-3">
          <CloudCog className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />
          <div>
            <h2 className="font-bold text-white">Google Analytics is ready</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">Add the Measurement ID as <code className="rounded bg-white/5 px-1.5 py-0.5 text-slate-300">NEXT_PUBLIC_GA_MEASUREMENT_ID</code> in Cloud Run, then redeploy once.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Summary({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof Activity; tone: string }) {
  return (
    <div className="a-stat-card flex items-center gap-3">
      <Icon className={`h-5 w-5 ${tone}`} />
      <div>
        <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
        <p className="mt-1 text-lg font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
