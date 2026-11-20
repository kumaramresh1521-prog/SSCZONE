import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  buildQuestionMetadata,
  getQuestionCanonicalPath,
  getPyqQuestionCanonicalPath,
  generateQuestionJsonLd,
} from "@/lib/question-seo";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function getResolvedTitle(metadata: any): string {
  if (typeof metadata?.title === "string") return metadata.title;
  if (metadata?.title && typeof metadata.title === "object" && typeof metadata.title.absolute === "string") {
    return metadata.title.absolute;
  }
  return "";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");
    const searchParam = searchParams.get("search");

    const supabase = createClient(supabaseUrl, supabaseKey);

    if (idParam) {
      const isExplicitPyq = idParam.toLowerCase().startsWith("pyq-") || idParam.toLowerCase().startsWith("pq-");
      const rawNum = idParam.replace(/^(?:pyq|pq)-/i, "");
      const qId = parseInt(rawNum, 10);

      if (isNaN(qId) || qId <= 0) {
        return NextResponse.json({ success: false, error: "Invalid question ID" }, { status: 400 });
      }

      // If explicit PYQ requested or fallback check
      if (isExplicitPyq) {
        const { data: pq } = await supabase
          .from("paper_questions")
          .select("*, previous_papers(id, title, year, exam_id, exams(id, title, slug))")
          .eq("id", qId)
          .maybeSingle();

        if (pq) {
          const paperTitle = pq.previous_papers?.title || "Official SSC PYQ";
          const canonicalPath = getPyqQuestionCanonicalPath(pq.id, pq.question_text);
          const fullUrl = `https://ssczone.com${canonicalPath}`;
          const metadata = buildQuestionMetadata(pq, fullUrl, undefined, undefined, true, paperTitle);
          const resolvedTitle = getResolvedTitle(metadata);
          const jsonLd = generateQuestionJsonLd(pq, fullUrl, undefined, undefined, true, paperTitle, pq.paper_id);

          return NextResponse.json({
            success: true,
            is_pyq: true,
            canonical_path: canonicalPath,
            full_url: fullUrl,
            metadata: {
              title: resolvedTitle,
              description: metadata.description,
            },
            json_ld: jsonLd,
            question: {
              id: pq.id,
              paper_id: pq.paper_id,
              paper_title: paperTitle,
              question_number: pq.question_number,
              correct_answer: pq.correct_answer,
              question_text: pq.question_text,
              explanation: pq.explanation,
              has_image: false,
            },
            seo: {
              title: resolvedTitle,
              description: metadata.description,
              canonicalPath,
              fullUrl,
              jsonLd,
            },
          });
        }
      }

      // Check standard questions table
      const { data: question } = await supabase
        .from("questions")
        .select("*, topics(id, title, subjects(id, title, exams(id, title)))")
        .eq("id", qId)
        .maybeSingle();

      if (question) {
        const topicTitle = question.topics?.title;
        const examTitle = question.topics?.subjects?.exams?.title;
        const canonicalPath = getQuestionCanonicalPath(question.id, question.question_text);
        const fullUrl = `https://ssczone.com${canonicalPath}`;
        const metadata = buildQuestionMetadata(question, fullUrl, topicTitle, examTitle);
        const resolvedTitle = getResolvedTitle(metadata);
        const jsonLd = generateQuestionJsonLd(question, fullUrl, topicTitle, examTitle);

        return NextResponse.json({
          success: true,
          is_pyq: false,
          canonical_path: canonicalPath,
          full_url: fullUrl,
          metadata: {
            title: resolvedTitle,
            description: metadata.description,
          },
          json_ld: jsonLd,
          question: {
            id: question.id,
            topic_id: question.topic_id,
            topic_title: topicTitle,
            exam_title: examTitle,
            exam_tag: question.exam_tag,
            correct_answer: question.correct_answer,
            question_text: question.question_text,
            explanation: question.explanation,
            image_url: question.image_url,
            option_a_image_url: question.option_a_image_url,
            option_b_image_url: question.option_b_image_url,
            option_c_image_url: question.option_c_image_url,
            option_d_image_url: question.option_d_image_url,
            has_image: !!question.image_url || !!(question.option_a_image_url || question.option_b_image_url || question.option_c_image_url || question.option_d_image_url),
          },
          seo: {
            title: resolvedTitle,
            description: metadata.description,
            canonicalPath,
            fullUrl,
            jsonLd,
          },
        });
      }

      // Smart fallback: check paper_questions if not found in questions
      const { data: fallbackPq } = await supabase
        .from("paper_questions")
        .select("*, previous_papers(id, title, year, exam_id, exams(id, title, slug))")
        .eq("id", qId)
        .maybeSingle();

      if (fallbackPq) {
        const paperTitle = fallbackPq.previous_papers?.title || "Official SSC PYQ";
        const canonicalPath = getPyqQuestionCanonicalPath(fallbackPq.id, fallbackPq.question_text);
        const fullUrl = `https://ssczone.com${canonicalPath}`;
        const metadata = buildQuestionMetadata(fallbackPq, fullUrl, undefined, undefined, true, paperTitle);
        const resolvedTitle = getResolvedTitle(metadata);
        const jsonLd = generateQuestionJsonLd(fallbackPq, fullUrl, undefined, undefined, true, paperTitle, fallbackPq.paper_id);

        return NextResponse.json({
          success: true,
          is_pyq: true,
          canonical_path: canonicalPath,
          full_url: fullUrl,
          metadata: {
            title: resolvedTitle,
            description: metadata.description,
          },
          json_ld: jsonLd,
          question: {
            id: fallbackPq.id,
            paper_id: fallbackPq.paper_id,
            paper_title: paperTitle,
            question_number: fallbackPq.question_number,
            correct_answer: fallbackPq.correct_answer,
            question_text: fallbackPq.question_text,
            explanation: fallbackPq.explanation,
            has_image: false,
          },
          seo: {
            title: resolvedTitle,
            description: metadata.description,
            canonicalPath,
            fullUrl,
            jsonLd,
          },
        });
      }

      return NextResponse.json({ success: false, error: "Question not found" }, { status: 404 });
    }

    if (searchParam) {
      const { data: questions } = await supabase
        .from("questions")
        .select("id, question_text, topic_id, topics(title)")
        .ilike("question_text", `%${searchParam}%`)
        .limit(10);

      const results = (questions || []).map((q: any) => ({
        id: q.id,
        topic_title: q.topics?.title,
        snippet: q.question_text.slice(0, 100),
        canonicalPath: getQuestionCanonicalPath(q.id, q.question_text),
      }));

      return NextResponse.json({ success: true, results });
    }

    return NextResponse.json({ success: false, error: "Please provide ?id= or ?search=" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Internal error" }, { status: 500 });
  }
}
