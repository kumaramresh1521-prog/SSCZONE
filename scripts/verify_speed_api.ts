import { GET as getConfig } from "../src/app/api/speed-test/config/route";
import { GET as getQuestions } from "../src/app/api/speed-test/questions/route";
import { NextRequest } from "next/server";

async function runTests() {
  console.log("=== 1. Testing Config Endpoint ===");
  const configRes = await getConfig();
  const configData = await configRes.json();
  console.log("Status:", configRes.status);
  console.log("Stats:", configData.stats);
  console.log("Subjects count:", configData.subjects.length);
  console.log("Topics count:", configData.topics.length);

  console.log("\n=== 2. Testing Random Mode (Default 25 Qs) ===");
  const reqRandom = new NextRequest("http://localhost:3000/api/speed-test/questions?mode=random&count=25&userId=test_user_1");
  const resRandom = await getQuestions(reqRandom);
  const dataRandom = await resRandom.json();
  console.log("Status:", resRandom.status);
  console.log("Count:", dataRandom.count);
  console.log("Meta:", dataRandom.meta);
  if (dataRandom.questions?.length > 0) {
    const q1 = dataRandom.questions[0];
    console.log("Q1 sample:", { id: q1.id, source: q1.source, subject: q1.subject, text: q1.question_text.slice(0, 50) + "..." });
  }

  console.log("\n=== 3. Testing Subject Mode (Quant 25 Qs) ===");
  const reqSubject = new NextRequest("http://localhost:3000/api/speed-test/questions?mode=subject&subject=quant&count=25&userId=test_user_2");
  const resSubject = await getQuestions(reqSubject);
  const dataSubject = await resSubject.json();
  console.log("Status:", resSubject.status);
  console.log("Count:", dataSubject.count);
  console.log("Meta:", dataSubject.meta);
  if (dataSubject.questions?.length > 0) {
    const q1 = dataSubject.questions[0];
    console.log("Quant Q1 sample:", { id: q1.id, source: q1.source, subject: q1.subject, text: q1.question_text.slice(0, 50) + "..." });
  }

  console.log("\n=== 4. Testing Topic Mode (Topic 254: Synonyms) ===");
  const reqTopic = new NextRequest("http://localhost:3000/api/speed-test/questions?mode=topic&topicId=254&count=10");
  const resTopic = await getQuestions(reqTopic);
  const dataTopic = await resTopic.json();
  console.log("Status:", resTopic.status);
  console.log("Count:", dataTopic.count);
  console.log("Meta:", dataTopic.meta);
  if (dataTopic.questions?.length > 0) {
    const q1 = dataTopic.questions[0];
    console.log("Topic Q1 sample:", { id: q1.id, source: q1.source, topic: q1.topic, text: q1.question_text.slice(0, 50) + "..." });
  }
}

runTests().catch(console.error);
