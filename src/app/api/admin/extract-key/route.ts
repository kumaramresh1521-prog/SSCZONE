import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60 seconds timeout for parallel image and section fetching

interface ExtractedQuestion {
  question_number: number;
  section: string;
  question_text: string;
  image_url: string;
  option_a: string;
  option_a_image_url: string;
  option_b: string;
  option_b_image_url: string;
  option_c: string;
  option_c_image_url: string;
  option_d: string;
  option_d_image_url: string;
  correct_answer: "A" | "B" | "C" | "D";
  candidate_chosen?: "A" | "B" | "C" | "D" | null;
  candidate_status?: "correct" | "wrong" | "unattempted";
  challenge_url?: string;
  explanation?: string;
}

// Math and text cleaning helper
function cleanMathAndEntities(text: string): string {
  if (!text) return "";
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&sup2;/gi, "²")
    .replace(/&sup3;/gi, "³")
    .replace(/&frac12;/gi, "½")
    .replace(/&frac14;/gi, "¼")
    .replace(/&frac34;/gi, "¾")
    .replace(/&plusmn;/gi, "±")
    .replace(/&times;/gi, "×")
    .replace(/&divide;/gi, "÷")
    .replace(/&radic;/gi, "√")
    .replace(/&deg;/gi, "°")
    .replace(/&pi;/gi, "π")
    .replace(/&theta;/gi, "θ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Helper to fetch and convert image to base64 data URL
async function convertImageToBase64(imgUrl: string): Promise<string> {
  if (!imgUrl || !imgUrl.startsWith("http")) return imgUrl;
  try {
    const res = await fetch(imgUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
      }
    });
    if (!res.ok) return imgUrl;
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = res.headers.get("content-type") || "image/jpeg";
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch {
    return imgUrl;
  }
}

// Parse a single question table block from CBExams
function parseCbExamsBlock(t: string, secName: string, fallbackQNum: number, baseUrl: string): ExtractedQuestion {
  const qNumMatch = t.match(/Q\.No:\s*&nbsp;\s*([0-9]+)/i);
  const qNum = qNumMatch ? parseInt(qNumMatch[1], 10) : fallbackQNum;
  const challengeUrl = t.match(/href='(Challenge_Item\.aspx[^']+)'/i)?.[1] || "";
  const rows = [...t.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map(m => m[1]);

  let questionImg = "";
  let questionText = "";
  const options = [
    { text: "", img: "", isCorrect: false },
    { text: "", img: "", isCorrect: false },
    { text: "", img: "", isCorrect: false },
    { text: "", img: "", isCorrect: false }
  ];
  let candidateStatus: "correct" | "wrong" | "unattempted" = "unattempted";
  let chosenOptionIndex: number | null = null;

  // Question row
  const qRow = rows.find(r => r.includes("Q.No:"));
  if (qRow) {
    const qImgs = [...qRow.matchAll(/<img[^>]+src=['"]([^'"]+)['"][^>]*>/gi)];
    if (qImgs.length > 0) {
      questionImg = qImgs[0][1];
      if (!questionImg.startsWith("http")) questionImg = baseUrl + questionImg;
    }
    const rawText = qRow.replace(/<td[^>]*width=['"]?2%['"]?[\s\S]*?<\/td>/gi, "");
    questionText = cleanMathAndEntities(rawText);
  }

  // Option rows
  let optIdx = 0;
  for (const r of rows) {
    if (r.includes("Q.No:") || r.includes("Click Here to Challenge") || r.includes("language-switch")) continue;
    if (
      r.includes("Not Answered") ||
      r.includes("bgcolor='gray'") ||
      r.includes('bgcolor="gray"') ||
      (r.includes("Answered") && r.includes("colspan='3'"))
    ) {
      if (r.includes("Not Answered")) candidateStatus = "unattempted";
      continue;
    }

    const optTd = r.match(/<td[^>]*width=['"]?49%['"][^>]*>([\s\S]*?)<\/td>/i) ||
                  r.match(/<td[^>]*align=['"]?left['"][^>]*>([\s\S]*?)<\/td>/i);
    if (optTd && optIdx < 4) {
      const optHtml = optTd[1];
      const optImgs = [...optHtml.matchAll(/<img[^>]+src=['"]([^'"]+)['"][^>]*>/gi)];
      let optImg = "";
      if (optImgs.length > 0) {
        optImg = optImgs[0][1];
        if (!optImg.startsWith("http")) optImg = baseUrl + optImg;
      }
      const optText = cleanMathAndEntities(optHtml);
      const isYellow = r.toLowerCase().includes("bgcolor='yellow'") || r.toLowerCase().includes('bgcolor="yellow"');
      const isGreen = r.toLowerCase().includes("bgcolor='green'") || r.toLowerCase().includes('bgcolor="green"');
      const isRed = r.toLowerCase().includes("bgcolor='red'") || r.toLowerCase().includes('bgcolor="red"');

      if (isYellow || isGreen) options[optIdx].isCorrect = true;
      if (isGreen) {
        candidateStatus = "correct";
        chosenOptionIndex = optIdx;
      }
      if (isRed) {
        candidateStatus = "wrong";
        chosenOptionIndex = optIdx;
      }

      options[optIdx].text = optText;
      options[optIdx].img = optImg;
      optIdx++;
    }
  }

  const correctIdx = options.findIndex(o => o.isCorrect);
  const correctLetter = (correctIdx >= 0 ? ["A", "B", "C", "D"][correctIdx] : "A") as "A" | "B" | "C" | "D";
  const chosenLetter = chosenOptionIndex !== null ? (["A", "B", "C", "D"][chosenOptionIndex] as "A" | "B" | "C" | "D") : null;

  return {
    question_number: qNum,
    section: secName,
    question_text: questionText,
    image_url: questionImg,
    option_a: options[0].text,
    option_a_image_url: options[0].img,
    option_b: options[1].text,
    option_b_image_url: options[1].img,
    option_c: options[2].text,
    option_c_image_url: options[2].img,
    option_d: options[3].text,
    option_d_image_url: options[3].img,
    correct_answer: correctLetter,
    candidate_chosen: chosenLetter,
    candidate_status: candidateStatus,
    challenge_url: challengeUrl ? (baseUrl + challengeUrl) : ""
  };
}

// Parse DigiALM format
function parseDigiAlmQuestions(html: string, baseUrl: string): ExtractedQuestion[] {
  const questions: ExtractedQuestion[] = [];
  const qPanels = [...html.matchAll(/<div[^>]*class=['"][^'"]*question-pnl[^'"]*['"][\s\S]*?<\/table>\s*<\/div>/gi)].map(m => m[0]);

  qPanels.forEach((panel, idx) => {
    const qNum = idx + 1;
    let section = "General";
    if (idx < 25) section = "General Intelligence & Reasoning";
    else if (idx < 50) section = "General Awareness";
    else if (idx < 75) section = "Quantitative Aptitude";
    else section = "English Comprehension";

    const qTextMatch = panel.match(/<td[^>]*class=['"]bold['"][^>]*>([\s\S]*?)<\/td>/i);
    const qImgs = [...(qTextMatch?.[1] || "").matchAll(/<img[^>]+src=['"]([^'"]+)['"][^>]*>/gi)];
    let questionImg = "";
    if (qImgs.length > 0) {
      questionImg = qImgs[0][1];
      if (!questionImg.startsWith("http")) questionImg = baseUrl + questionImg;
    }
    const questionText = cleanMathAndEntities(qTextMatch?.[1] || "");

    // Options
    const optMatches = [...panel.matchAll(/<td[^>]*class=['"][^'"]*ans-txt[^'"]*['"][^>]*>([\s\S]*?)<\/td>/gi)].map(m => m[1]);
    const options = ["", "", "", ""];
    const optionImgs = ["", "", "", ""];

    optMatches.slice(0, 4).forEach((optHtml, oIdx) => {
      const oImgs = [...optHtml.matchAll(/<img[^>]+src=['"]([^'"]+)['"][^>]*>/gi)];
      if (oImgs.length > 0) {
        let oi = oImgs[0][1];
        if (!oi.startsWith("http")) oi = baseUrl + oi;
        optionImgs[oIdx] = oi;
      }
      options[oIdx] = cleanMathAndEntities(optHtml);
    });

    // Correct option in DigiALM: green check icon
    let correctLetter: "A" | "B" | "C" | "D" = "A";
    const tickMatches = [...panel.matchAll(/<tr[^>]*>[\s\S]*?<td[^>]*>([1-4])\.<\/td>[\s\S]*?tick\.png[\s\S]*?<\/tr>/gi)];
    if (tickMatches.length > 0) {
      const optNum = parseInt(tickMatches[0][1], 10);
      correctLetter = ["A", "B", "C", "D"][optNum - 1] as any || "A";
    }

    // Chosen option
    const chosenMatch = panel.match(/Chosen\s*Option\s*:\s*([1-4]|\-\-)/i);
    let chosenLetter: "A" | "B" | "C" | "D" | null = null;
    let candidateStatus: "correct" | "wrong" | "unattempted" = "unattempted";

    if (chosenMatch && chosenMatch[1] !== "--") {
      const chNum = parseInt(chosenMatch[1], 10);
      chosenLetter = ["A", "B", "C", "D"][chNum - 1] as any || null;
      candidateStatus = chosenLetter === correctLetter ? "correct" : "wrong";
    }

    questions.push({
      question_number: qNum,
      section,
      question_text: questionText,
      image_url: questionImg,
      option_a: options[0],
      option_a_image_url: optionImgs[0],
      option_b: options[1],
      option_b_image_url: optionImgs[1],
      option_c: options[2],
      option_c_image_url: optionImgs[2],
      option_d: options[3],
      option_d_image_url: optionImgs[3],
      correct_answer: correctLetter,
      candidate_chosen: chosenLetter,
      candidate_status: candidateStatus
    });
  });

  return questions;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, htmlContent, embedImages } = body;

    if (!url && !htmlContent) {
      return NextResponse.json({ error: "Please provide either an Answer Key URL or upload an HTML file." }, { status: 400 });
    }

    let baseUrl = "";
    let candidateInfo = {
      candidateName: "Candidate",
      rollNumber: "N/A",
      examName: "SSC Combined Graduate Level Examination",
      testDate: "Official Response Sheet",
      testTime: "",
      venue: "",
      vendor: "Generic",
      totalQuestions: 100
    };

    let allQuestions: ExtractedQuestion[] = [];

    // Case 1: Live URL provided
    if (url) {
      const cleanUrl = url.trim();
      const parsedUrl = new URL(cleanUrl);
      baseUrl = cleanUrl.substring(0, cleanUrl.lastIndexOf("/") + 1);
      const isCbExams = parsedUrl.hostname.includes("cbexams.com");

      const initialRes = await fetch(cleanUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
      });

      if (!initialRes.ok) {
        return NextResponse.json(
          { error: `Government server returned status ${initialRes.status} ${initialRes.statusText}` },
          { status: 400 }
        );
      }

      const initialHtml = await initialRes.text();
      const cookies = initialRes.headers.get("set-cookie") || "";

      if (isCbExams || initialHtml.includes("updHindi")) {
        candidateInfo.vendor = "CBExams";
        const clean = initialHtml.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
        candidateInfo.rollNumber = clean.match(/Roll\s*No\.?\s*:\s*([0-9A-Za-z]+)/i)?.[1]?.trim() || "N/A";
        candidateInfo.candidateName = clean.match(/Candidate\s*Name\s*:\s*([^:]+?)\s*(?:Exam\s*Level|Exam\s*Name|Test\s*Date)/i)?.[1]?.trim() || "Candidate";
        candidateInfo.examName = clean.match(/Exam\s*Level\s*:\s*([^:]+?)\s*(?:Test\s*Date)/i)?.[1]?.trim() || "Combined Graduate Level Examination";
        candidateInfo.testDate = clean.match(/Test\s*Date\s*:\s*([^:]+?)\s*(?:Test\s*Time)/i)?.[1]?.trim() || "";
        candidateInfo.testTime = clean.match(/Test\s*Time[^:]*:\s*(.*?)(?=\s*Centre\s*Name|$)/i)?.[1]?.trim() || "";
        candidateInfo.venue = clean.match(/Centre\s*Name\s*:\s*([^:]+?)\s*(?:Correct\s*Option|Save\s*\/\s*Print)/i)?.[1]?.trim() || "";

        // Parse Section A from initial GET HTML
        const parseSectionFromHtml = (h: string, secName: string, startNum: number) => {
          const qTables = [...h.matchAll(/<table[^>]*style="[^"]*background-color:\s*#e8edf3[^"]*"[\s\S]*?<\/table>/gi)].map(m => m[0]);
          return qTables.map((t, idx) => parseCbExamsBlock(t, secName, startNum + idx, baseUrl));
        };

        const partA = parseSectionFromHtml(initialHtml, "General Intelligence and Reasoning", 1);

        // PostBack tokens
        const vs = initialHtml.match(/id="__VIEWSTATE"\s+value="([^"]+)"/)?.[1] || "";
        const vsg = initialHtml.match(/id="__VIEWSTATEGENERATOR"\s+value="([^"]+)"/)?.[1] || "";
        const ev = initialHtml.match(/id="__EVENTVALIDATION"\s+value="([^"]+)"/)?.[1] || "";

        const fetchPart = async (pKey: string, btnVal: string, secName: string, startNum: number) => {
          try {
            const params = new URLSearchParams();
            params.append("__VIEWSTATE", vs);
            params.append("__VIEWSTATEGENERATOR", vsg);
            params.append("__EVENTVALIDATION", ev);
            params.append(pKey, btnVal);

            const postRes = await fetch(cleanUrl, {
              method: "POST",
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie": cookies
              },
              body: params.toString()
            });

            if (postRes.ok) {
              const html = await postRes.text();
              return parseSectionFromHtml(html, secName, startNum);
            }
          } catch (e) {
            console.error(`Error fetching Part ${pKey}:`, e);
          }
          return [];
        };

        const [partB, partC, partD] = await Promise.all([
          fetchPart("P2", "Click Here for PART-B", "General Awareness", 26),
          fetchPart("P3", "Click Here for PART-C", "Quantitative Aptitude", 51),
          fetchPart("P4", "Click Here for PART-D", "English Comprehension", 76)
        ]);

        allQuestions = [...partA, ...partB, ...partC, ...partD];
      } else {
        // DigiALM
        candidateInfo.vendor = "DigiALM";
        allQuestions = parseDigiAlmQuestions(initialHtml, baseUrl);
      }
    } else if (htmlContent) {
      // Offline HTML upload
      if (htmlContent.includes("updHindi") || htmlContent.includes("CANDIDATE RESPONSE SHEET")) {
        candidateInfo.vendor = "CBExams";
        const clean = htmlContent.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
        candidateInfo.rollNumber = clean.match(/Roll\s*No\.?\s*:\s*([0-9A-Za-z]+)/i)?.[1]?.trim() || "N/A";
        candidateInfo.candidateName = clean.match(/Candidate\s*Name\s*:\s*([^:]+?)\s*(?:Exam\s*Level|Exam\s*Name|Test\s*Date)/i)?.[1]?.trim() || "Candidate";
        candidateInfo.examName = clean.match(/Exam\s*Level\s*:\s*([^:]+?)\s*(?:Test\s*Date)/i)?.[1]?.trim() || "Combined Graduate Level Examination";
        candidateInfo.testDate = clean.match(/Test\s*Date\s*:\s*([^:]+?)\s*(?:Test\s*Time)/i)?.[1]?.trim() || "";
        candidateInfo.testTime = clean.match(/Test\s*Time[^:]*:\s*(.*?)(?=\s*Centre\s*Name|$)/i)?.[1]?.trim() || "";
        candidateInfo.venue = clean.match(/Centre\s*Name\s*:\s*([^:]+?)\s*(?:Correct\s*Option|Save\s*\/\s*Print)/i)?.[1]?.trim() || "";

        const qTables = [...htmlContent.matchAll(/<table[^>]*style="[^"]*background-color:\s*#e8edf3[^"]*"[\s\S]*?<\/table>/gi)].map(m => m[0]);
        allQuestions = qTables.map((t, idx) => {
          let sec = "General Intelligence and Reasoning";
          if (idx >= 25 && idx < 50) sec = "General Awareness";
          else if (idx >= 50 && idx < 75) sec = "Quantitative Aptitude";
          else if (idx >= 75) sec = "English Comprehension";
          return parseCbExamsBlock(t, sec, idx + 1, baseUrl || "https://sscexams.cbexams.com/");
        });
      } else {
        candidateInfo.vendor = "DigiALM";
        allQuestions = parseDigiAlmQuestions(htmlContent, baseUrl || "https://ssc.digialm.com/");
      }
    }

    candidateInfo.totalQuestions = allQuestions.length;

    // Optional: Embed images as permanent offline Base64 data URLs
    if (embedImages && allQuestions.length > 0) {
      // Process in batches of 10 to avoid socket saturation
      const chunkSize = 10;
      for (let i = 0; i < allQuestions.length; i += chunkSize) {
        const chunk = allQuestions.slice(i, i + chunkSize);
        await Promise.all(
          chunk.map(async (q) => {
            if (q.image_url) q.image_url = await convertImageToBase64(q.image_url);
            if (q.option_a_image_url) q.option_a_image_url = await convertImageToBase64(q.option_a_image_url);
            if (q.option_b_image_url) q.option_b_image_url = await convertImageToBase64(q.option_b_image_url);
            if (q.option_c_image_url) q.option_c_image_url = await convertImageToBase64(q.option_c_image_url);
            if (q.option_d_image_url) q.option_d_image_url = await convertImageToBase64(q.option_d_image_url);
          })
        );
      }
    }

    // Stats
    const totalAttempted = allQuestions.filter(q => q.candidate_status === "correct" || q.candidate_status === "wrong").length;
    const totalCorrect = allQuestions.filter(q => q.candidate_status === "correct").length;
    const totalWrong = allQuestions.filter(q => q.candidate_status === "wrong").length;
    const totalUnattempted = allQuestions.filter(q => q.candidate_status === "unattempted").length;

    // Sections summary
    const secMap: Record<string, ExtractedQuestion[]> = {};
    for (const q of allQuestions) {
      if (!secMap[q.section]) secMap[q.section] = [];
      secMap[q.section].push(q);
    }

    return NextResponse.json({
      success: true,
      metadata: {
        ...candidateInfo,
        totalAttempted,
        totalCorrect,
        totalWrong,
        totalUnattempted,
        accuracy: totalAttempted > 0 ? `${((totalCorrect / totalAttempted) * 100).toFixed(1)}%` : "0%"
      },
      sections: Object.keys(secMap).map(name => ({
        name,
        count: secMap[name].length,
        questions: secMap[name]
      })),
      questions: allQuestions
    });
  } catch (err: any) {
    console.error("extract-key API error:", err);
    return NextResponse.json({ error: err.message || "Failed to extract questions." }, { status: 500 });
  }
}
