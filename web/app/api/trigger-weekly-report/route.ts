import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { inngest } from '@/inngest/client';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Trigger Inngest Event
    await inngest.send({
      name: "report/generate.weekly",
      data: {
        userId: user.id,
        dateStr: new Date().toISOString()
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Weekly report generation triggered",
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

