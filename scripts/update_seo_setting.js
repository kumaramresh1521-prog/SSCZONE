const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Read .env.local
const envPath = path.join(process.cwd(), ".env.local");
let url = "https://rmobqopitkjobcnyqzru.supabase.co";
let key = "";

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
      url = trimmed.split("=")[1].replace(/["']/g, "").trim();
    } else if (trimmed.startsWith("SUPABASE_SERVICE_ROLE_KEY=")) {
      key = trimmed.split("=")[1].replace(/["']/g, "").trim();
    }
  }
}

if (!key) {
  const dPath = path.join(process.cwd(), "Dockerfile");
  if (fs.existsSync(dPath)) {
    const dContent = fs.readFileSync(dPath, "utf8");
    const m = dContent.match(/ENV SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/);
    if (m) key = m[1];
  }
}

const supabase = createClient(url, key);

async function run() {
  const seoPath = path.join(process.cwd(), "src", "data", "seo-config.json");
  const seoData = JSON.parse(fs.readFileSync(seoPath, "utf8"));

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "seo_config", value: seoData, updated_at: new Date().toISOString() });
  console.log("seo_config upsert:", error ? error.message : "SUCCESS");
}

run();
