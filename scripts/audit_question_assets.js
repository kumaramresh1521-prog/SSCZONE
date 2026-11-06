const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const env = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*"?([^\r\n"]+)/)?.[1];
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*"?([^\r\n"]+)/)?.[1];

if (!url || !key) throw new Error("Supabase credentials are missing from .env.local");

const supabase = createClient(url, key, { auth: { persistSession: false } });
const fields = ["question_text", "option_a", "option_b", "option_c", "option_d"];
const imagePattern = /!\[[^\]]*\]\(([^\s)]+)\)|<img[^>]+src=["']([^"']+)["']/gi;

function imageSources(text) {
  const sources = [];
  for (const match of String(text || "").matchAll(imagePattern)) {
    sources.push(match[1] || match[2]);
  }
  return sources;
}

async function fetchAllQuestions() {
  const rows = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("paper_questions")
      .select("id,paper_id,question_number,question_text,option_a,option_b,option_c,option_d")
      .range(from, from + pageSize - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < pageSize) return rows;
  }
}

async function main() {
  const questions = await fetchAllQuestions();
  const references = [];
  const missing = [];

  for (const question of questions) {
    for (const field of fields) {
      for (const source of imageSources(question[field])) {
        references.push(source);
        if (source.startsWith("/")) {
          const localPath = path.join(process.cwd(), "public", source.replace(/^\/+/, ""));
          if (!fs.existsSync(localPath)) {
            missing.push({
              id: question.id,
              paper_id: question.paper_id,
              question_number: question.question_number,
              field,
              source,
            });
          }
        }
      }
    }
  }

  const report = {
    checked_at: new Date().toISOString(),
    questions_checked: questions.length,
    image_references: references.length,
    local_image_references: references.filter((source) => source.startsWith("/")).length,
    remote_image_references: references.filter((source) => /^https?:\/\//.test(source)).length,
    missing_local_images: missing,
  };

  fs.writeFileSync(
    path.join(process.cwd(), "tmp", "question-image-audit.json"),
    JSON.stringify(report, null, 2),
    "utf8"
  );
  console.log(`Checked ${report.questions_checked} questions and ${report.image_references} image references.`);
  console.log(`Missing local images: ${missing.length}`);
  missing.slice(0, 50).forEach((item) => console.log(JSON.stringify(item)));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
