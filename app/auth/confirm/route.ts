import { createSupabaseServer } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token_hash, type } = await request.json();

    if (!token_hash || !type) {
      return NextResponse.json(
        { error: 'Missing token_hash or type' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
