"use client";

import React, { useState } from "react";
import MathText from "@/components/MathText";

export interface SolutionBlock {
  type: "code" | "step" | "numbered" | "header" | "image" | "text";
  content: string;
  badge?: string;
}

export function parseStructuredSolution(rawText?: string | null): SolutionBlock[] {
  if (!rawText) return [];

  // Normalize line endings
  const normalized = rawText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n");

  const blocks: SolutionBlock[] = [];

  // Regex to extract code fences: ```lang\n...``` or ```...```
  const codeRegex = /```(?:[a-zA-Z0-9_-]*\n)?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeRegex.exec(normalized)) !== null) {
    // Process text before this code block
    const textBefore = normalized.substring(lastIndex, match.index);
    if (textBefore.trim()) {
      parseTextIntoBlocks(textBefore, blocks);
    }

    const codeContent = match[1].trimEnd();
    if (codeContent) {
      blocks.push({
        type: "code",
        content: codeContent,
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // Process remaining text after the last code block
  const remaining = normalized.substring(lastIndex);
  if (remaining.trim()) {
    parseTextIntoBlocks(remaining, blocks);
  }

  return blocks;
}

function parseTextIntoBlocks(text: string, blocks: SolutionBlock[]) {
  // Normalize markdown image syntax so images are on separate lines
  const processed = text
    .replace(/(\[Image:\s*https?:\/\/[^\s\]]+\])/gi, "\n$1\n")
    .replace(/(!\[.*?\]\(https?:\/\/[^\s)]+\))/gi, "\n$1\n");

  const rawLines = processed.split("\n");

  for (const rawLine of rawLines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Skip markdown horizontal rules (--- or ***)
    if (/^[-*_]{3,}$/.test(line)) continue;

    // Check Image
    const imgMatch =
      line.match(/\[Image:\s*(https?:\/\/[^\s\]]+)\]/i) ||
      line.match(/!\[(.*?)\]\((https?:\/\/[^\s)]+)\)/i);
    if (imgMatch) {
      const url = imgMatch[1]?.startsWith("http") ? imgMatch[1] : imgMatch[2];
      blocks.push({ type: "image", content: url });
      continue;
    }

    // Check Headings / Logic tags e.g. "**Pattern:**", "### Pattern", "- **Pattern:**"
    const isBulletHeader = /^[\-\*•]\s+\*\*([^*]+)\*\*[:\s]*(.*)$/.exec(line);
    if (isBulletHeader) {
      const headerTitle = isBulletHeader[1].trim();
      const rest = isBulletHeader[2].trim();
      blocks.push({
        type: "header",
        content: rest ? `**${headerTitle}:** ${rest}` : `**${headerTitle}:**`,
      });
      continue;
    }

    const isDirectHeader = /^(?:\*{1,2}|#{1,4}\s*)?(Pattern|Logic|Direct Coding|Rule|Step-by-step|Decoding|Note|Trick|Formula|Alternate Method)[:\s-]/i.test(line);
    if (isDirectHeader && (line.startsWith("**") || line.startsWith("#") || line.endsWith(":"))) {
      const cleaned = line.replace(/^[\s*#\-•]+/, "").trim();
      blocks.push({ type: "header", content: cleaned.startsWith("**") ? cleaned : `**${cleaned}**` });
      continue;
    }

    // Check Numbered Step: "1. ", "2. ", "Step 1:", "Case 1:", "(i) ", "(1) "
    const numMatch = line.match(/^(?:[\-\*•]\s*)?(\d+|Step\s*\d+|Case\s*\d+|\([0-9a-zA-Z]+\))[\.\):\-]\s+(.*)$/i);
    if (numMatch) {
      const badge = numMatch[1].replace(/Step\s*/i, "S").replace(/Case\s*/i, "C").replace(/[\(\)]/g, "");
      blocks.push({
        type: "numbered",
        badge: badge,
        content: numMatch[2].trim(),
      });
      continue;
    }

    // Check Bullet point: "- ", "* ", "• "
    const bulletMatch = line.match(/^[\-\*•]\s+(.*)$/);
    if (bulletMatch) {
      blocks.push({
        type: "step",
        content: bulletMatch[1].trim(),
      });
      continue;
    }

    // Regular line / sentence
    blocks.push({
      type: "text",
      content: line,
    });
  }
}

function SolutionImage({ src, alt = "Solution figure" }: { src: string; alt?: string }) {
  const [scale, setScale] = useState(1);
  return (
    <div className="my-2.5 overflow-hidden rounded-xl border border-slate-200 bg-white p-2">
      <img
        src={src}
        alt={alt}
        className="max-h-72 w-auto max-w-full rounded-lg object-contain transition-transform"
        style={{ transform: `scale(${scale})` }}
        onClick={() => setScale(scale === 1 ? 1.5 : 1)}
      />
    </div>
  );
}

export default function StructuredSolution({
  text,
  className = "",
}: {
  text?: string | null;
  className?: string;
}) {
  if (!text) return null;
  const blocks = parseStructuredSolution(text);
  if (blocks.length === 0) return null;

  return (
    <div className={`space-y-2 text-xs sm:text-sm text-gray-800 leading-relaxed ${className}`}>
      {blocks.map((block, idx) => {
        if (block.type === "code") {
          return (
            <div
              key={idx}
              className="my-3 rounded-xl border border-slate-700/80 bg-slate-900 p-3.5 sm:p-4 text-emerald-400 font-mono text-xs sm:text-[13px] shadow-sm overflow-x-auto leading-relaxed whitespace-pre select-text tracking-wide"
            >
              {block.content}
            </div>
          );
        }

        if (block.type === "header") {
          return (
            <div key={idx} className="pt-2 first:pt-0 pb-1 flex items-center gap-2 font-bold text-xs sm:text-sm text-blue-900">
              <span className="w-1.5 h-3.5 bg-blue-600 rounded-full shrink-0"></span>
              <MathText text={block.content} />
            </div>
          );
        }

        if (block.type === "numbered") {
          return (
            <div key={idx} className="flex items-start gap-2.5 py-0.5">
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px] shrink-0 mt-0.5 border border-blue-200 shadow-2xs">
                {block.badge}
              </span>
              <div className="flex-1 min-w-0">
                <MathText text={block.content} />
              </div>
            </div>
          );
        }

        if (block.type === "step") {
          return (
            <div key={idx} className="flex items-start gap-2.5 py-0.5">
              <span className="text-blue-500 font-black text-sm shrink-0 leading-tight">•</span>
              <div className="flex-1 min-w-0">
                <MathText text={block.content} />
              </div>
            </div>
          );
        }

        if (block.type === "image") {
          return (
            <div key={idx} className="my-2.5">
              <SolutionImage src={block.content} />
            </div>
          );
        }

        // Regular text
        return (
          <div key={idx} className="py-0.5">
            <MathText text={block.content} />
          </div>
        );
      })}
    </div>
  );
}
