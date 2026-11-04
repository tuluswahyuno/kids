import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Klien Supabase (opsional). Bila env belum diisi, aplikasi tetap berjalan
 * penuh secara lokal (offline-first) dan fitur akun disembunyikan.
 * Kunci anon memang publik; keamanan data dijaga oleh RLS (supabase/schema.sql).
 */
let client: SupabaseClient | null | undefined;

export const isCloudConfigured = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  client = isCloudConfigured()
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null;
  return client;
}
