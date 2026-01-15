import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Supabase Env Vars Missing in Client!");
    // 返回一个 Dummy Client 防止直接崩溃，但会在控制台报错
    throw new Error("Supabase Configuration Missing");
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
