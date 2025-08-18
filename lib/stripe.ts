import Stripe from 'stripe';
import { currentUserProfile } from './auth';
import { env } from './env';

export const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
}) : null;

const creditValue = 0.005;

export const trackCreditUsage = async ({
  action,
  cost,
}: {
  action: string;
  cost: number;
}) => {
  const profile = await currentUserProfile();
  const credits = Math.ceil(cost / creditValue);

  if (!profile) {
    throw new Error('User profile not found');
  }

  if (!profile.customerId) {
    throw new Error('User customerId not found');
  }

  if (!stripe || !env.STRIPE_CREDITS_METER_NAME) {
    throw new Error('Stripe not configured');
  }

  await stripe.billing.meterEvents.create({
    event_name: env.STRIPE_CREDITS_METER_NAME,
    payload: {
      action,
      value: credits.toString(),
      stripe_customer_id: profile.customerId,
    },
  });
};
