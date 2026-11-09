"use client";

import React, { useId } from "react";
import Link from "next/link";

export interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "white" | "badge";
  showIcon?: boolean;
  showTagline?: boolean;
  taglineText?: string;
  href?: string | null;
  className?: string;
}

export default function BrandLogo({
  size = "md",
  variant = "default",
  showIcon = true,
  showTagline = false,
  taglineText = "Govt Exam Prep",
  href = "/",
  className = "",
}: BrandLogoProps) {
  const uniqueId = useId().replace(/:/g, "");
  const gradId = `sz-bg-${uniqueId}`;
  const goldId = `sz-gold-${uniqueId}`;

  // Dimensions based on size prop
  const iconSizeClasses = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
    xl: "h-14 w-14",
  }[size];

  const textSizes = {
    sm: "text-lg",
    md: "text-xl md:text-2xl",
    lg: "text-2xl md:text-3xl",
    xl: "text-3xl md:text-4xl",
  }[size];

  const sscColor = variant === "white" ? "text-blue-400" : "text-blue-700";
  const zoneColor = variant === "white" ? "text-white" : "text-slate-900";
  const dotColor = variant === "white" ? "text-amber-400" : "text-amber-500";
  const tagColor = variant === "white" ? "text-slate-400" : "text-slate-500";

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {showIcon && (
        <div className={`shrink-0 ${iconSizeClasses} transition-transform duration-200 group-hover:scale-105 drop-shadow-xs`}>
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E3A8A" />
                <stop offset="100%" stopColor="#2563EB" />
              </linearGradient>
              <linearGradient id={goldId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            {/* Squircle base */}
            <rect width="100" height="100" rx="24" fill={`url(#${gradId})`} />
            <rect width="98" height="98" x="1" y="1" rx="23" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
            
            {/* Monogram Initial Text: S (White) + Z (Gold) */}
            <g fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontWeight="900" fontSize="45" letterSpacing="-1">
              <text x="31" y="66" fill="#FFFFFF" textAnchor="middle">S</text>
              <text x="69" y="66" fill={`url(#${goldId})`} textAnchor="middle">Z</text>
            </g>
            
            {/* Achievement Sparkle Star Accent */}
            <polygon points="77,16 80,24 88,27 80,30 77,38 74,30 66,27 74,24" fill={`url(#${goldId})`} />
            <circle cx="77" cy="27" r="1.5" fill="#FFFFFF" />
          </svg>
        </div>
      )}

      {/* Typography Wordmark */}
      <div className="flex flex-col text-left justify-center">
        {variant === "badge" ? (
          <div className={`flex items-center gap-1.5 font-black tracking-tight ${textSizes} leading-none`}>
            <span className={sscColor}>SSC</span>
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-[0.55em] px-2 py-0.5 rounded-lg tracking-wider uppercase font-black shadow-xs">
              ZONE
            </span>
          </div>
        ) : (
          <div className={`flex items-center font-black tracking-tight ${textSizes} leading-none`}>
            <span className={sscColor}>SSC</span>
            <span className={`${zoneColor} ml-1`}>ZONE</span>
            <span className={`${dotColor} font-black ml-0.5`}>.</span>
          </div>
        )}

        {showTagline && (
          <span className={`text-[9px] font-extrabold uppercase tracking-widest mt-1 ${tagColor}`}>
            {taglineText}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group inline-flex items-center focus:outline-hidden">
        {content}
      </Link>
    );
  }

  return content;
}
