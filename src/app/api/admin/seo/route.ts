import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SEO_FILE_PATH = path.join(process.cwd(), "src", "data", "seo-config.json");

export async function GET() {
  try {
    if (fs.existsSync(SEO_FILE_PATH)) {
      const data = fs.readFileSync(SEO_FILE_PATH, "utf8");
      return NextResponse.json(JSON.parse(data));
    }
  } catch (err: any) {
    console.error("Error reading SEO config:", err);
  }

  // Fallback defaults
  return NextResponse.json({
    siteTitle: "SSCZone — Official SSC Syllabus-Wise MCQ Practice & Test Series Portal",
    titleTemplate: "%s | SSCZone",
    metaDescription: "Prepare for SSC CGL, CHSL, CPO, MTS, GD, Steno & Railways Exams topic-by-topic. Practice high-quality MCQs from standard reference books with instant bilingual solutions.",
    canonicalUrl: "https://ssczone.com",
    author: "SSCZone Editorial Team",
    keywords: ["SSC CGL Practice", "SSC CHSL Test Series", "SSC CPO MCQs", "Previous Year Papers"],
    openGraph: {
      title: "SSCZone — Syllabus-Wise SSC MCQ Practice & Test Series Portal",
      description: "Crack SSC CGL, CHSL, CPO, MTS & Railways Exams with chapter-by-chapter MCQ practice and previous year test series.",
      imageUrl: "https://ssczone.com/icon-512.png",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      site: "@ssczone",
      creator: "@ssczone"
    },
    indexing: {
      index: true,
      follow: true,
      maxSnippet: -1,
      maxImagePreview: "large",
      maxVideoPreview: -1
    },
    verification: {
      google: "",
      bing: "",
      googleAnalyticsId: "",
      adsenseId: ""
    },
    pageOverrides: {},
    updatedAt: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    if (!payload.siteTitle || !payload.metaDescription) {
      return NextResponse.json(
        { error: "Site title and meta description are required." },
        { status: 400 }
      );
    }

    const updatedConfig = {
      ...payload,
      updatedAt: new Date().toISOString()
    };

    const dir = path.dirname(SEO_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(SEO_FILE_PATH, JSON.stringify(updatedConfig, null, 2), "utf8");

    return NextResponse.json({
      success: true,
      message: "SEO configuration published successfully!",
      config: updatedConfig
    });
  } catch (err: any) {
    console.error("Error saving SEO config:", err);
    return NextResponse.json(
      { error: "Failed to save SEO configuration: " + err.message },
      { status: 500 }
    );
  }
}
