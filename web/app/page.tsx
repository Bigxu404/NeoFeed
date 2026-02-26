import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string }>;
}) {
  const { verified } = await searchParams;
  const suffix = verified === 'true' ? '?verified=true' : '';

  try {
    const supabase = await createClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError) {
      redirect('/landing' + suffix);
    }

    if (session) {
      redirect('/dashboard' + suffix);
    }

    redirect('/landing' + suffix);
  } catch {
    redirect('/landing' + suffix);
  }
}
