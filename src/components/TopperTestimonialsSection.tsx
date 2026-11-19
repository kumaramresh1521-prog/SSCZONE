"use client";

import { useEffect, useState } from "react";
import {
  Star,
  Quote,
  CheckCircle2,
  Trophy,
  Award,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { TopperTestimonial, DEFAULT_TESTIMONIALS } from "@/lib/testimonials-types";

interface TopperTestimonialsSectionProps {
  initialTestimonials?: TopperTestimonial[];
}

export default function TopperTestimonialsSection({
  initialTestimonials = DEFAULT_TESTIMONIALS,
}: TopperTestimonialsSectionProps) {
  const [testimonials, setTestimonials] = useState<TopperTestimonial[]>(initialTestimonials);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/testimonials")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.testimonials) && data.testimonials.length > 0) {
          setTestimonials(data.testimonials);
        }
      })
      .catch(() => {
        // Fallback to initial testimonials
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 px-4 max-w-6xl mx-auto w-full">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-2.5">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-700 border border-amber-300/60 shadow-2xs">
          <Trophy className="h-3.5 w-3.5 text-amber-600 fill-amber-500" />
          <span>Hall of Fame • SSC Toppers</span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          Trusted by Top AIR Rankers &amp; Selected Officers
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Read genuine reviews from aspirants who used SSCZone's bilingual TCS previous year questions and CBT practice interface to secure their dream Central Government positions.
        </p>
      </div>

      {/* Testimonials Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 sm:gap-6">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs hover:border-amber-300 hover:shadow-lg transition-all duration-300"
          >
            {/* Top Stars & Badge */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-500 transition-transform group-hover:scale-110"
                    />
                  ))}
                </div>

                {t.badge && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-900 border border-amber-300/80">
                    <Sparkles className="h-2.5 w-2.5 text-amber-600" />
                    <span>{t.badge}</span>
                  </span>
                )}
              </div>

              {/* Quote */}
              <div className="relative">
                <Quote className="absolute -top-2 -left-1 h-6 w-6 text-amber-400/20 -z-10" />
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  "{t.quote}"
                </p>
              </div>
            </div>

            {/* Bottom Topper Bio */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-amber-300 bg-amber-100 shrink-0 shadow-2xs">
                  {t.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.photoUrl}
                      alt={t.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-amber-100 text-amber-900 font-black text-sm">
                      {t.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-slate-900 truncate">
                      {t.name}
                    </h3>
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  </div>
                  <p className="text-xs font-bold text-blue-700 truncate">
                    {t.rank}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {t.exam} {t.state && <span>• {t.state}</span>}
                  </p>
                </div>
              </div>

              {t.score && (
                <div className="shrink-0 text-right">
                  <span className="inline-block rounded-xl bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-black text-emerald-800">
                    {t.score}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA Banner */}
      <div className="mt-10 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 border border-amber-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-black shadow-xs">
            🏆
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black text-slate-900">
              Are you preparing for SSC CGL or CHSL 2026?
            </div>
            <div className="text-[11px] sm:text-xs text-slate-600">
              Join 50,000+ serious aspirants practicing daily with real TCS shift papers.
            </div>
          </div>
        </div>

        <Link
          href="/papers?exam=cgl"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-black text-white shadow-xs transition-colors shrink-0"
        >
          <span>Practice Topper PYQs</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
