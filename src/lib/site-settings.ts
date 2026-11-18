import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rmobqopitkjobcnyqzru.supabase.co";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "dummy-key-for-build-time";

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// In-memory memory cache with TTL to serve fast reads without hammering DB
const memoryCache: Map<string, { value: any; timestamp: number }> = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

/**
 * Fetch a persistent setting from Supabase site_settings table.
 * Falls back to in-memory cache or default/local file if DB is unreachable.
 */
export async function getSiteSettingAsync<T>(key: string, fallback: T): Promise<T> {
  const cached = memoryCache.get(key);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.value as T;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (!error && data?.value !== undefined && data?.value !== null) {
      memoryCache.set(key, { value: data.value, timestamp: now });
      return data.value as T;
    }
  } catch (err) {
    console.warn(`[site_settings] Could not read '${key}' from Supabase:`, err);
  }

  if (cached) {
    return cached.value as T;
  }
  return fallback;
}

/**
 * Save a persistent setting to Supabase site_settings table.
 * Immediately invalidates & updates in-memory cache.
 */
export async function saveSiteSettingAsync<T>(key: string, value: T): Promise<boolean> {
  // Update in-memory cache immediately
  memoryCache.set(key, { value, timestamp: Date.now() });

  try {
    const { error } = await supabaseAdmin.from("site_settings").upsert(
      {
        key,
        value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

    if (error) {
      console.error(`[site_settings] Failed to save '${key}' to Supabase:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[site_settings] Exception saving '${key}' to Supabase:`, err);
    return false;
  }
}

/**
 * Fast synchronous reader from in-memory cache (useful for sync callers).
 */
export function getSiteSettingCached<T>(key: string, fallback: T): T {
  const cached = memoryCache.get(key);
  if (cached) {
    return cached.value as T;
  }
  return fallback;
}

/**
 * Seed or prime in-memory cache synchronously.
 */
export function primeSiteSettingCache<T>(key: string, value: T): void {
  if (!memoryCache.has(key)) {
    memoryCache.set(key, { value, timestamp: Date.now() });
  }
}
