import { createClient } from "@supabase/supabase-js";

const DEFAULT_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rmobqopitkjobcnyqzru.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SERVICE_KEY;

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
