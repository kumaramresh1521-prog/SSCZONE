import { createBrowserClient } from "@supabase/ssr";

// Singleton pattern - ek hi client instance use karo
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

export function getSupabase() {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(supabaseUrl, supabaseKey);
  }
  return supabaseInstance;
}

// Named export for backward compatibility
export const supabase = getSupabase();
