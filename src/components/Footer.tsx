"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { DEFAULT_FOOTER_CONFIG, FooterConfig } from "@/lib/footer-types";
import { Send, Youtube, MessageCircle, Twitter, Instagram, Mail } from "lucide-react";

export default function Footer() {
  const [config, setConfig] = useState<FooterConfig>(DEFAULT_FOOTER_CONFIG);

  useEffect(() => {
    fetch("/api/footer")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          setConfig(data.config);
        }
      })
      .catch((err) => console.warn("Using default footer configuration:", err));
  }, []);

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "telegram":
        return <Send className="w-4 h-4 text-sky-400" />;
      case "youtube":
        return <Youtube className="w-4 h-4 text-rose-500" />;
      case "whatsapp":
        return <MessageCircle className="w-4 h-4 text-emerald-400" />;
      case "twitter":
        return <Twitter className="w-4 h-4 text-blue-400" />;
      case "instagram":
        return <Instagram className="w-4 h-4 text-pink-400" />;
      default:
        return <Mail className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <footer className="w-full max-w-full overflow-hidden bg-slate-900 border-t border-slate-800 text-slate-400 font-sans pt-12 pb-24 lg:pb-12 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-800">
          
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-3">
            <BrandLogo variant="white" size="lg" />

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {config.brandDescription}
            </p>

            <p className="text-[11px] text-slate-500">
              {config.brandSubText}
            </p>

            {/* Social Media Community Links */}
            {config.socialLinks && config.socialLinks.filter((s) => s.is_active).length > 0 && (
              <div className="pt-2">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Official Channels & Support
                </p>
                <div className="flex flex-wrap gap-2">
                  {config.socialLinks
                    .filter((s) => s.is_active)
                    .map((s) => (
                      <a
                        key={s.id || s.platform}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-xs font-bold text-slate-200 transition-all hover:scale-102"
                        title={s.label}
                      >
                        {getSocialIcon(s.platform)}
                        <span>{s.label}</span>
                      </a>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Columns from Admin Panel */}
          {config.columns &&
            config.columns.map((col) => (
              <div key={col.id}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
                  {col.title}
                </h4>
                <ul className="space-y-2 text-xs font-normal">
                  {col.links &&
                    col.links.map((link, idx) => (
                      <li key={idx}>
                        {link.is_external ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`transition-colors inline-flex items-center gap-1.5 ${
                              link.is_highlight
                                ? "text-blue-400 hover:text-white font-bold"
                                : "hover:text-white"
                            }`}
                          >
                            <span>{link.label}</span>
                            {link.badge && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                {link.badge}
                              </span>
                            )}
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            className={`transition-colors inline-flex items-center gap-1.5 ${
                              link.is_highlight
                                ? "text-blue-400 hover:text-white font-bold"
                                : "hover:text-white"
                            }`}
                          >
                            <span>{link.label}</span>
                            {link.badge && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                {link.badge}
                              </span>
                            )}
                          </Link>
                        )}
                      </li>
                    ))}
                </ul>
              </div>
            ))}

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {config.copyrightText}</p>

          <div className="flex items-center gap-4">
            {config.legalLinks &&
              config.legalLinks.map((legal, idx) => (
                <Link
                  key={idx}
                  href={legal.href}
                  className="hover:text-slate-400 transition-colors"
                >
                  {legal.label}
                </Link>
              ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
