export interface SupabasePublicConfig {
  url: string;
  anonKey: string;
}

export function hasSupabaseConfig(): boolean {
  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      publicKey,
  );
}

export function getSupabaseConfig(): SupabasePublicConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase public configuration is unavailable.");
  }

  return { url, anonKey };
}
