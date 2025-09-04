import Stripe from 'stripe'
import { isDev } from '@/lib/isDev'
import { NextResponse } from 'next/server'

export async function POST() {
  if (isDev) {
    return NextResponse.json({
      id: 'test_session_123',
      url: 'http://localhost:3000/thank-you?dev=true'
    })
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2025-05-28.basil' })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_APP_URL is not set' }, { status: 500 })
  }

  const priceId = process.env.STRIPE_PRICE_ID
  if (!priceId) {
    return NextResponse.json({ error: 'STRIPE_PRICE_ID is not set' }, { status: 500 })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    success_url: `${appUrl}/thank-you`,
    cancel_url: `${appUrl}/cancelled`,
    line_items: [{ price: priceId, quantity: 1 }]
  })

  return NextResponse.json({ id: session.id, url: session.url })
}
