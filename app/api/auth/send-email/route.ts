import { env } from '@/lib/env';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import crypto from 'crypto';

// Import email templates
import { MagicLinkEmailTemplate } from '@/emails/magic-link';
import { VerifyEmailTemplate } from '@/emails/verify-email';
import { ResetPasswordTemplate } from '@/emails/reset-password';

const resend = new Resend(env.RESEND_TOKEN);

type EmailPayload = {
  type: 'magic_link' | 'signup' | 'recovery';
  email: string;
  url: string;
};

function verifyHmacSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    // Check required environment variables
    if (!env.SUPABASE_AUTH_HOOK_SECRET || !env.RESEND_TOKEN || !env.RESEND_EMAIL) {
      return NextResponse.json(
        { error: 'Email service not configured. Please set SUPABASE_AUTH_HOOK_SECRET, RESEND_TOKEN, and RESEND_EMAIL.' },
        { status: 500 }
      );
    }

    // Read raw body
    const payload = await req.text();
    
    // Get signature header
    const signature = req.headers.get('x-supabase-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature header' },
        { status: 401 }
      );
    }

    // Verify HMAC signature
    const isValid = verifyHmacSignature(payload, signature, env.SUPABASE_AUTH_HOOK_SECRET);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse JSON payload
    let emailData: EmailPayload;
    try {
      emailData = JSON.parse(payload);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!emailData.type || !emailData.email || !emailData.url) {
      return NextResponse.json(
        { error: 'Missing required fields: type, email, url' },
        { status: 400 }
      );
    }

    // Determine email template and subject based on type
    let emailTemplate: React.ReactElement;
    let subject: string;

    switch (emailData.type) {
      case 'magic_link':
        emailTemplate = <MagicLinkEmailTemplate url={emailData.url} appName="Berrys" />;
        subject = 'Your magic link to login to Berrys';
        break;
      case 'signup':
        emailTemplate = <VerifyEmailTemplate url={emailData.url} />;
        subject = 'Confirm your email address for Berrys';
        break;
      case 'recovery':
        emailTemplate = <ResetPasswordTemplate url={emailData.url} />;
        subject = 'Reset your password for Berrys';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    // Send email via Resend
    const { error } = await resend.emails.send({
      from: env.RESEND_EMAIL,
      to: [emailData.email],
      subject,
      react: emailTemplate,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Email webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
