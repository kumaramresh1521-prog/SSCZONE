import { NextResponse } from "next/server";

interface QuestionResult {
  qNum: number;
  section: string;
  status: "correct" | "wrong" | "unattempted";
  chosenOption?: number | null;
  correctOption?: number | null;
  marksGained: number;
}

interface SectionResult {
  name: string;
  total: number;
  correct: number;
  wrong: number;
  unattempted: number;
  positiveMarks: number;
  negativeMarks: number;
  netScore: number;
  accuracy: string;
  questions: QuestionResult[];
}

interface CandidateInfo {
  rollNumber: string;
  candidateName: string;
  examName: string;
  testDate: string;
  testTime: string;
  venue: string;
  vendor: "CBExams" | "DigiALM" | "Generic";
}

// Helper to parse questions from CBExams table markup
function parseCbExamsQuestions(html: string, sectionName: string, positiveMarks: number, negativeMarks: number): SectionResult {
  const tables = [...html.matchAll(/<table[^>]*style="[^"]*background-color:\s*#e8edf3[^"]*"[\s\S]*?<\/table>/gi)].map(m => m[0]);
  const questions: QuestionResult[] = [];

  for (let i = 0; i < tables.length; i++) {
    const t = tables[i];
    const qNum = parseInt(t.match(/Q\.No:\s*&nbsp;\s*([0-9]+)/i)?.[1] || `${i + 1}`, 10);
    const bgMatches = [...t.matchAll(/bgcolor=['"]([^'"]+)['"]/gi)].map(m => m[1].toLowerCase());

    let status: "correct" | "wrong" | "unattempted" = "unattempted";
    let marks = 0;

    if (bgMatches.includes("green")) {
      status = "correct";
      marks = positiveMarks;
    } else if (bgMatches.includes("red")) {
      status = "wrong";
      marks = -negativeMarks;
    } else if (bgMatches.includes("gray")) {
      status = "unattempted";
      marks = 0;
    } else if (bgMatches.includes("yellow")) {
      // If only yellow appears and no green/red, it wasn't answered
      status = "unattempted";
      marks = 0;
    }

    questions.push({
      qNum,
      section: sectionName,
      status,
      marksGained: marks
    });
  }

  const correct = questions.filter(q => q.status === "correct").length;
  const wrong = questions.filter(q => q.status === "wrong").length;
  const unattempted = questions.filter(q => q.status === "unattempted").length;
  const total = questions.length;
  const attempted = correct + wrong;
  const accuracy = attempted > 0 ? ((correct / attempted) * 100).toFixed(1) + "%" : "0.0%";

  const pos = parseFloat((correct * positiveMarks).toFixed(2));
  const neg = parseFloat((wrong * negativeMarks).toFixed(2));
  const net = parseFloat((pos - neg).toFixed(2));

  return {
    name: sectionName,
    total,
    correct,
    wrong,
    unattempted,
    positiveMarks: pos,
    negativeMarks: neg,
    netScore: net,
    accuracy,
    questions
  };
}

// Helper to parse DigiALM HTML format
function parseDigiAlmHtml(html: string, positiveMarks: number, negativeMarks: number): { candidate: CandidateInfo; sections: SectionResult[] } {
  // Extract Candidate Details from main info table
  const roll = html.match(/Roll\s*Number\s*[:\s]*([0-9A-Za-z]+)/i)?.[1]?.trim() || "";
  const name = html.match(/Candidate\s*Name\s*[:\s]*([^<\n\r]+)/i)?.[1]?.trim() || "";
  const venue = html.match(/Venue\s*Name\s*[:\s]*([^<\n\r]+)/i)?.[1]?.trim() || "";
  const exam = html.match(/Subject\s*[:\s]*([^<\n\r]+)/i)?.[1]?.trim() || "SSC Examination";
  const testDate = html.match(/Exam\s*Date\s*[:\s]*([^<\n\r]+)/i)?.[1]?.trim() || "";
  const testTime = html.match(/Exam\s*Time\s*[:\s]*([^<\n\r]+)/i)?.[1]?.trim() || "";

  // Split into sections if available
  const sectionBlocks = html.split(/(?:class="section-lbl"|class="section-title")/i);
  const sections: SectionResult[] = [];

  // If no sections found, treat as one block
  const blocksToProcess = sectionBlocks.length > 1 ? sectionBlocks.slice(1) : [html];

  blocksToProcess.forEach((block, idx) => {
    const secTitleMatch = block.match(/<span[^>]*>([^<]+)<\/span>/i)?.[1]?.trim() || `Section ${idx + 1}`;
    const questionPanels = block.split(/class="question-pnl"/i).slice(1);
    const questions: QuestionResult[] = [];

    questionPanels.forEach((qp, qidx) => {
      // Find chosen option
      const chosenMatch = qp.match(/Chosen\s*Option\s*:\s*([0-9]+|--)/i)?.[1]?.trim();
      const chosenOpt = chosenMatch && chosenMatch !== "--" ? parseInt(chosenMatch, 10) : null;

      // Find right answer option (usually marked with rightAns or tick image)
      const isCorrectChosen = qp.includes("rightAns") && chosenOpt !== null;
      let status: "correct" | "wrong" | "unattempted" = "unattempted";
      let marks = 0;

      if (!chosenOpt) {
        status = "unattempted";
        marks = 0;
      } else if (isCorrectChosen) {
        status = "correct";
        marks = positiveMarks;
      } else {
        status = "wrong";
        marks = -negativeMarks;
      }

      questions.push({
        qNum: qidx + 1,
        section: secTitleMatch,
        status,
        chosenOption: chosenOpt,
        marksGained: marks
      });
    });

    const correct = questions.filter(q => q.status === "correct").length;
    const wrong = questions.filter(q => q.status === "wrong").length;
    const unattempted = questions.filter(q => q.status === "unattempted").length;
    const attempted = correct + wrong;
    const accuracy = attempted > 0 ? ((correct / attempted) * 100).toFixed(1) + "%" : "0.0%";
    const pos = parseFloat((correct * positiveMarks).toFixed(2));
    const neg = parseFloat((wrong * negativeMarks).toFixed(2));
    const net = parseFloat((pos - neg).toFixed(2));

    sections.push({
      name: secTitleMatch,
      total: questions.length,
      correct,
      wrong,
      unattempted,
      positiveMarks: pos,
      negativeMarks: neg,
      netScore: net,
      accuracy,
      questions
    });
  });

  return {
    candidate: {
      rollNumber: roll,
      candidateName: name,
      examName: exam,
      testDate,
      testTime,
      venue,
      vendor: "DigiALM"
    },
    sections
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, rawHtml, examType = "cgl-tier1", category = "UR" } = body;

    if (!url && !rawHtml) {
      return NextResponse.json(
        { error: "Please provide either an official answer key URL or paste the HTML response sheet code." },
        { status: 400 }
      );
    }

    // Set marking scheme based on exam type
    const isTier2 = examType === "cgl-tier2";
    const isCpo = examType === "cpo-tier1";
    const positiveMarks = isTier2 ? 3.0 : isCpo ? 1.0 : 2.0;
    const negativeMarks = isTier2 ? 1.0 : isCpo ? 0.25 : 0.5;
    const maxMarks = isTier2 ? 390 : 200;

    let targetHtml = rawHtml || "";
    let candidateInfo: CandidateInfo = {
      rollNumber: "N/A",
      candidateName: "Candidate",
      examName: "SSC Examination",
      testDate: "",
      testTime: "",
      venue: "",
      vendor: "Generic"
    };
    let sections: SectionResult[] = [];

    // Case 1: URL provided
    if (url) {
      const cleanUrl = url.trim();
      const parsedUrl = new URL(cleanUrl);
      const isCbExams = parsedUrl.hostname.includes("cbexams.com");
      const isDigiAlm = parsedUrl.hostname.includes("digialm.com");

      // Fetch initial response
      const initialRes = await fetch(cleanUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
      });

      if (!initialRes.ok) {
        return NextResponse.json(
          { error: `Could not fetch answer key. Government server responded with status: ${initialRes.status} ${initialRes.statusText}` },
          { status: 400 }
        );
      }

      const initialHtml = await initialRes.text();
      const cookies = initialRes.headers.get("set-cookie") || "";

      // Check if it's CBExams format (like sscexams.cbexams.com)
      if (isCbExams || initialHtml.includes("CANDIDATE RESPONSE SHEET/GRIEVANCE SYSTEM") || initialHtml.includes("updHindi")) {
        candidateInfo.vendor = "CBExams";

        // Clean candidate details from Table 1
        const clean = initialHtml.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
        candidateInfo.rollNumber = clean.match(/Roll\s*No\.?\s*:\s*([0-9A-Za-z]+)/i)?.[1]?.trim() || "N/A";
        candidateInfo.candidateName = clean.match(/Candidate\s*Name\s*:\s*([^:]+?)\s*(?:Exam\s*Level|Exam\s*Name|Test\s*Date)/i)?.[1]?.trim() || "Candidate";
        candidateInfo.examName = clean.match(/Exam\s*Level\s*:\s*([^:]+?)\s*(?:Test\s*Date)/i)?.[1]?.trim() || "Combined Graduate Level Examination";
        candidateInfo.testDate = clean.match(/Test\s*Date\s*:\s*([^:]+?)\s*(?:Test\s*Time)/i)?.[1]?.trim() || "";
        candidateInfo.testTime = clean.match(/Test\s*Time[^:]*:\s*(.*?)(?=\s*Centre\s*Name|$)/i)?.[1]?.trim() || "";
        candidateInfo.venue = clean.match(/Centre\s*Name\s*:\s*([^:]+?)\s*(?:Correct\s*Option|Save\s*\/\s*Print)/i)?.[1]?.trim() || "";

        // Parse Part A from initial GET HTML
        const partA = parseCbExamsQuestions(initialHtml, "General Intelligence & Reasoning", positiveMarks, negativeMarks);

        // Extract ASP.NET ViewState tokens for PostBacks
        const vs = initialHtml.match(/id="__VIEWSTATE"\s+value="([^"]+)"/)?.[1] || "";
        const vsg = initialHtml.match(/id="__VIEWSTATEGENERATOR"\s+value="([^"]+)"/)?.[1] || "";
        const ev = initialHtml.match(/id="__EVENTVALIDATION"\s+value="([^"]+)"/)?.[1] || "";

        // Helper to POST fetch remaining parts
        const fetchPart = async (pKey: string, btnValue: string, secName: string) => {
          try {
            const params = new URLSearchParams();
            params.append("__VIEWSTATE", vs);
            params.append("__VIEWSTATEGENERATOR", vsg);
            params.append("__EVENTVALIDATION", ev);
            params.append(pKey, btnValue);

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
              const partHtml = await postRes.text();
              return parseCbExamsQuestions(partHtml, secName, positiveMarks, negativeMarks);
            }
          } catch (e) {
            console.error(`Error fetching CBExams part ${pKey}:`, e);
          }
          return null;
        };

        // Fetch Part B, C, D in parallel for maximum speed
        const [partB, partC, partD] = await Promise.all([
          fetchPart("P2", "Click Here for PART-B", "General Awareness"),
          fetchPart("P3", "Click Here for PART-C", "Quantitative Aptitude"),
          fetchPart("P4", "Click Here for PART-D", "English Comprehension")
        ]);

        sections = [partA];
        if (partB) sections.push(partB);
        if (partC) sections.push(partC);
        if (partD) sections.push(partD);

      } else {
        // Fallback to DigiALM parser
        const parsed = parseDigiAlmHtml(initialHtml, positiveMarks, negativeMarks);
        candidateInfo = parsed.candidate;
        sections = parsed.sections;
      }
    } else if (rawHtml) {
      // Parse raw HTML supplied by candidate
      if (rawHtml.includes("CANDIDATE RESPONSE SHEET/GRIEVANCE SYSTEM") || rawHtml.includes("updHindi")) {
        candidateInfo.vendor = "CBExams";
        const clean = rawHtml.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
        candidateInfo.rollNumber = clean.match(/Roll\s*No\.?\s*:\s*([0-9A-Za-z]+)/i)?.[1]?.trim() || "N/A";
        candidateInfo.candidateName = clean.match(/Candidate\s*Name\s*:\s*([^:]+?)\s*(?:Exam\s*Level|Exam\s*Name|Test\s*Date)/i)?.[1]?.trim() || "Candidate";
        candidateInfo.examName = clean.match(/Exam\s*Level\s*:\s*([^:]+?)\s*(?:Test\s*Date)/i)?.[1]?.trim() || "Combined Graduate Level Examination";
        candidateInfo.testDate = clean.match(/Test\s*Date\s*:\s*([^:]+?)\s*(?:Test\s*Time)/i)?.[1]?.trim() || "";
        candidateInfo.testTime = clean.match(/Test\s*Time[^:]*:\s*(.*?)(?=\s*Centre\s*Name|$)/i)?.[1]?.trim() || "";
        candidateInfo.venue = clean.match(/Centre\s*Name\s*:\s*([^:]+?)\s*(?:Correct\s*Option|Save\s*\/\s*Print)/i)?.[1]?.trim() || "";

        sections = [parseCbExamsQuestions(rawHtml, "Section Responses", positiveMarks, negativeMarks)];
      } else {
        const parsed = parseDigiAlmHtml(rawHtml, positiveMarks, negativeMarks);
        candidateInfo = parsed.candidate;
        sections = parsed.sections;
      }
    }

    if (sections.length === 0 || sections.every(s => s.total === 0)) {
      return NextResponse.json(
        { error: "Could not find valid question items in the response sheet. Please check the URL or paste the complete HTML source code." },
        { status: 422 }
      );
    }

    // Calculate Global Totals
    const totalQuestions = sections.reduce((acc, s) => acc + s.total, 0);
    const totalCorrect = sections.reduce((acc, s) => acc + s.correct, 0);
    const totalWrong = sections.reduce((acc, s) => acc + s.wrong, 0);
    const totalUnattempted = sections.reduce((acc, s) => acc + s.unattempted, 0);
    const totalAttempted = totalCorrect + totalWrong;
    const grossPositive = parseFloat((totalCorrect * positiveMarks).toFixed(2));
    const grossNegative = parseFloat((totalWrong * negativeMarks).toFixed(2));
    const rawScore = Math.max(0, parseFloat((grossPositive - grossNegative).toFixed(2)));
    const overallAccuracy = totalAttempted > 0 ? parseFloat(((totalCorrect / totalAttempted) * 100).toFixed(2)) : 0;

    // Calculate 3 Shift Scenarios for transparent student view
    const mult = isTier2 ? 1.8 : 1.0;
    const easyBonus = parseFloat((2.4 * mult).toFixed(2));
    const moderateBonus = parseFloat((7.6 * mult).toFixed(2));
    const hardBonus = parseFloat((14.2 * mult).toFixed(2));

    let shiftRating: "Hard" | "Moderate" | "Easy" = "Moderate";
    let normalizationBonus = moderateBonus;

    // Use test time/date or default shift heuristic
    if (candidateInfo.testTime?.includes("Shift-2") || candidateInfo.testTime?.includes("Shift 2") || candidateInfo.testDate?.includes("27 Oct")) {
      shiftRating = "Hard";
      normalizationBonus = hardBonus;
    } else if (candidateInfo.testTime?.includes("Shift-1") || candidateInfo.testTime?.includes("Shift 1")) {
      shiftRating = "Moderate";
      normalizationBonus = moderateBonus;
    } else {
      shiftRating = "Easy";
      normalizationBonus = easyBonus;
    }

    const scenarios = {
      easy: {
        rating: "Easy" as const,
        bonus: easyBonus,
        score: Math.min(maxMarks, parseFloat((rawScore + easyBonus).toFixed(2)))
      },
      moderate: {
        rating: "Moderate" as const,
        bonus: moderateBonus,
        score: Math.min(maxMarks, parseFloat((rawScore + moderateBonus).toFixed(2)))
      },
      hard: {
        rating: "Hard" as const,
        bonus: hardBonus,
        score: Math.min(maxMarks, parseFloat((rawScore + hardBonus).toFixed(2)))
      }
    };

    const normalizedScore = Math.min(maxMarks, parseFloat((rawScore + normalizationBonus).toFixed(2)));

    // Rank Bracket & Selection Chances Prediction
    const scorePct = (normalizedScore / maxMarks) * 100;
    let rankBracket = "15,000 - 35,000+";
    let percentile = "82.5%";
    let safePostStatus = "🟡 Borderline Qualifying Chance";
    let postBadge = "Need Higher Score in Next Tier";

    if (scorePct >= 78) {
      rankBracket = "Top 1 - 950";
      percentile = "99.4%";
      safePostStatus = "🔥 Extremely Safe for Top 4600 GP Inspector / ASO (CSS / MEA)";
      postBadge = "Top Rank Confirmed";
    } else if (scorePct >= 68) {
      rankBracket = "951 - 4,800";
      percentile = "96.8%";
      safePostStatus = "🟢 Safe for 4200 / 2800 GP Posts (Auditor / Accountant / Sub-Inspector)";
      postBadge = "High Selection Probability";
    } else if (scorePct >= 58) {
      rankBracket = "4,801 - 16,500";
      percentile = "91.2%";
      safePostStatus = "🟢 Safe for 2400 GP Posts (Tax Assistant / Postal Assistant / UDC)";
      postBadge = "Tier 1 Cutoff Clearance Safe";
    } else if (scorePct >= 48) {
      rankBracket = "16,501 - 38,000";
      percentile = "84.0%";
      safePostStatus = "🟡 Borderline Tier 1 Cutoff Range depending on final normalization";
      postBadge = "Borderline Cutoff";
    } else {
      rankBracket = "38,000+";
      percentile = "68.5%";
      safePostStatus = "🔴 Below Expected Cutoff Bracket for General/OBC Candidates";
      postBadge = "Difficult Clearance";
    }

    // Category Rank Estimate
    const catMultiplier = category === "UR" ? 0.45 : category === "OBC" ? 0.28 : category === "EWS" ? 0.12 : 0.10;
    let categoryRankBracket = "";
    if (rankBracket.includes("+")) {
      const minVal = Math.round((parseInt(rankBracket.replace(/[^0-9]/g, ""), 10) || 30000) * catMultiplier);
      categoryRankBracket = `${category} Rank: ~${minVal.toLocaleString()}+`;
    } else {
      const parts = rankBracket.split("-");
      const minVal = Math.max(1, Math.round((parseInt(parts[0]?.replace(/[^0-9]/g, "") || "1", 10)) * catMultiplier));
      const maxVal = Math.round((parseInt(parts[1]?.replace(/[^0-9]/g, "") || "1000", 10)) * catMultiplier);
      categoryRankBracket = `${category} Rank: ~${minVal.toLocaleString()} - ${maxVal.toLocaleString()}`;
    }

    return NextResponse.json({
      success: true,
      candidate: candidateInfo,
      summary: {
        totalQuestions,
        totalAttempted,
        totalCorrect,
        totalWrong,
        totalUnattempted,
        grossPositive,
        grossNegative,
        rawScore,
        maxMarks,
        accuracy: `${overallAccuracy}%`,
        shiftRating,
        normalizationBonus: parseFloat(normalizationBonus.toFixed(2)),
        normalizedScore,
        scenarios,
        rankBracket,
        percentile,
        categoryRankBracket,
        safePostStatus,
        postBadge
      },
      sections
    });

  } catch (error: any) {
    console.error("Answer key parsing error:", error);
    return NextResponse.json(
      { error: "Failed to parse answer key: " + (error?.message || "Internal server error") },
      { status: 500 }
    );
  }
}
