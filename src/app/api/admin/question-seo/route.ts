import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildQuestionMetadata, getQuestionCanonicalPath, generateQuestionJsonLd } from "@/lib/question-seo";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");
    const searchParam = searchParams.get("search");

    const supabase = createClient(supabaseUrl, supabaseKey);

    if (idParam) {
      const qId = parseInt(idParam, 10);
      if (isNaN(qId) || qId <= 0) {
        return NextResponse.json({ success: false, error: "Invalid question ID" }, { status: 400 });
      }

      const { data: question, error } = await supabase
        .from("questions")
        .select("*, topics(id, title, subjects(id, title, exams(id, title)))")
        .eq("id", qId)
        .maybeSingle();

      if (error || !question) {
        return NextResponse.json({ success: false, error: "Question not found" }, { status: 404 });
      }

      const topicTitle = question.topics?.title;
      const examTitle = question.topics?.subjects?.exams?.title;
      const canonicalPath = getQuestionCanonicalPath(question.id, question.question_text);
      const fullUrl = `https://ssczone.com${canonicalPath}`;
      const metadata = buildQuestionMetadata(question, fullUrl, topicTitle, examTitle);
      const jsonLd = generateQuestionJsonLd(question, fullUrl, topicTitle, examTitle);

      return NextResponse.json({
        success: true,
        canonical_path: canonicalPath,
        full_url: fullUrl,
        metadata: {
          title: metadata.title,
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
          title: metadata.title,
          description: metadata.description,
          canonicalPath,
          fullUrl,
          jsonLd,
        },
      });
    }

    if (searchParam) {
      const { data: questions, error } = await supabase
        .from("questions")
        .select("id, question_text, topic_id, topics(title)")
        .ilike("question_text", `%${searchParam}%`)
        .limit(10);

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

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
