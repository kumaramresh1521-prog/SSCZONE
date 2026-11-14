import { GET as generate100 } from "../src/app/api/admin/daily-quiz/generate-100/route";
import { NextRequest } from "next/server";

async function run() {
  console.log("=== 1. Testing Generate 100 Questions (Mixed 4 Sections) ===");
  const req100 = new NextRequest("http://localhost:3000/api/admin/daily-quiz/generate-100?count=100&subject=mixed");
  const res100 = await generate100(req100);
  const data100 = await res100.json();
  console.log("Total Count:", data100.total_count);
  console.log("Section Distribution:", data100.distribution);
  console.log("Sources:", data100.sources);
  console.log("Answer Distribution:", data100.answer_key_counts);

  console.log("\n=== 2. Testing Generate 25 Questions (English Only) ===");
  const reqEng = new NextRequest("http://localhost:3000/api/admin/daily-quiz/generate-100?count=25&subject=english");
  const resEng = await generate100(reqEng);
  const dataEng = await resEng.json();
  console.log("Total Count:", dataEng.total_count);
  console.log("Section Distribution:", dataEng.distribution);
  console.log("Sources:", dataEng.sources);

  console.log("\n=== 3. Testing Generate 25 Questions (Reasoning Only) ===");
  const reqReas = new NextRequest("http://localhost:3000/api/admin/daily-quiz/generate-100?count=25&subject=reasoning");
  const resReas = await generate100(reqReas);
  const dataReas = await resReas.json();
  console.log("Total Count:", dataReas.total_count);
  console.log("Section Distribution:", dataReas.distribution);
  console.log("Sources:", dataReas.sources);
}

run().catch(console.error);
