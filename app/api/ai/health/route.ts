import { NextResponse } from 'next/server';
import { replicateImage } from '@/providers/replicate';

export async function GET() {
  try {
    // If the provider constructed, we're wired. We don't call any external API.
    const ok = !!replicateImage;
    return NextResponse.json({ ok });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
