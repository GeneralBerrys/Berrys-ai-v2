import { getCredits } from '@/app/actions/credits/get';
import { profile } from '@/schema';
import { eq } from 'drizzle-orm';
import { database } from './database';
import { env } from './env';
import { createSupabaseServer } from './supabase/server';

export const currentUser = async () => {
  const client = await createSupabaseServer();
  const {
    data: { user },
  } = await client.auth.getUser();

  return user;
};

export const currentUserProfile = async () => {
  const user = await currentUser();

  if (!user) {
    throw new Error('User not found');
  }

  if (!database) {
    throw new Error('Database not initialized');
  }

  try {
    // Query existing profile
    const userProfiles = await database
      .select()
      .from(profile)
      .where(eq(profile.id, user.id));
    let userProfile = userProfiles.at(0);

    // If no profile exists, create one
    if (!userProfile && user.email) {
      try {
        const response = await database
          .insert(profile)
          .values({ id: user.id })
          .returning();

        if (!response.length) {
          throw new Error('Failed to create user profile');
        }

        userProfile = response[0];
        console.log(`[profile] Created new profile for user: ${user.id}`);
      } catch (insertError: any) {
        console.error('[profile] Failed to create profile', {
          userId: user.id,
          message: insertError?.message,
          cause: insertError?.cause?.message ?? null,
          stack: insertError?.stack,
        });
        throw insertError;
      }
    }

    return userProfile;
  } catch (e: any) {
    console.error('[profile] Query failed', {
      userId: user.id,
      message: e?.message,
      cause: e?.cause?.message ?? null,
      stack: e?.stack,
      name: e?.name,
      code: e?.code,
    });
    throw e;
  }
};

export const getSubscribedUser = async () => {
  const user = await currentUser();

  if (!user) {
    throw new Error('Create an account to use AI features.');
  }

  const profile = await currentUserProfile();

  if (!profile) {
    throw new Error('User profile not found');
  }

  if (!profile.subscriptionId) {
    throw new Error('Claim your free AI credits to use this feature.');
  }

  const credits = await getCredits();

  if ('error' in credits) {
    throw new Error(credits.error);
  }

  if (
    env.STRIPE_HOBBY_PRODUCT_ID &&
    profile.productId === env.STRIPE_HOBBY_PRODUCT_ID &&
    credits.credits <= 0
  ) {
    throw new Error(
      'Sorry, you have no credits remaining! Please upgrade for more credits.'
    );
  }

  return user;
};
