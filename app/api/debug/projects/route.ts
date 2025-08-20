import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, error: 'no-user' }, { status: 401 });

    const { data, error } = await supabase
      .from('projects')
      .select('id, name')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return NextResponse.json({ ok: true, projects: data ?? [] });
  } catch (e: any) {
    console.error('[debug/projects]', e);
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
