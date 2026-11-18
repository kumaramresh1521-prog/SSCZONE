const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Read .env.local
const envPath = path.join(process.cwd(), ".env.local");
let url = "https://vvdrtfwhffbbyiicjtrw.supabase.co";
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
  // Read Dockerfile for fallback
  const dPath = path.join(process.cwd(), "Dockerfile");
  if (fs.existsSync(dPath)) {
    const dContent = fs.readFileSync(dPath, "utf8");
    const m = dContent.match(/ENV SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/);
    if (m) key = m[1];
  }
}

console.log("Supabase URL:", url);
console.log("Using key prefix:", key ? key.substring(0, 15) + "..." : "NONE");

const supabase = createClient(url, key);

async function run() {
  const footerPath = path.join(process.cwd(), "src", "data", "footer-config.json");
  const footerData = JSON.parse(fs.readFileSync(footerPath, "utf8"));

  const { error: err1 } = await supabase
    .from("site_settings")
    .upsert({ key: "footer_config", value: footerData, updated_at: new Date().toISOString() });
  console.log("Footer config upsert:", err1 ? err1.message : "SUCCESS");
}

run();
