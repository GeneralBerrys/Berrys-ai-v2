import { currentUserProfile } from '@/lib/auth';
import { env } from '@/lib/env';
import { parseError } from '@/lib/error/parse';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
const returnUrl = env.VERCEL_PROJECT_PRODUCTION_URL 
  ? `${protocol}://${env.VERCEL_PROJECT_PRODUCTION_URL}`
  : `${protocol}://localhost:3000`;

export const GET = async () => {
  try {
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    const profile = await currentUserProfile();

    if (!profile) {
      throw new Error('User profile not found');
    }

    if (!profile.customerId) {
      throw new Error('User customerId not found');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.customerId,
      return_url: returnUrl,
    });

    return NextResponse.redirect(session.url);
  } catch (error) {
    const message = parseError(error);

    return new Response(message, { status: 500 });
  }
};
