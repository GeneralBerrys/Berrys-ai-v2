import Stripe from 'stripe'
import { isDev } from '@/lib/isDev'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-05-28.basil' })

export async function POST() {
  if (isDev) {
    return NextResponse.json({
      id: 'test_session_123',
      url: 'http://localhost:3000/thank-you?dev=true'
    })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/thank-you`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancelled`,
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }]
  })

  return NextResponse.json({ id: session.id, url: session.url })
}
