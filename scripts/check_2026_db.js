const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*"?([^\r\n"]+)/)[1];
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*"?([^\r\n"]+)/)[1];
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(url, key);

async function check() {
  const { data } = await sb.from('previous_papers').select('id, title, year').eq('year', 2026);
  console.log('2026 papers existing:', data?.length || 0);
  if (data && data.length > 0) {
    console.log(data);
  }
}
check();
