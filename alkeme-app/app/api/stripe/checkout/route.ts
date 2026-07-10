import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any
})

export async function POST(request: Request) {
  try {
    const { priceId, userId, userEmail } = await request.json()

    if (!priceId) {
      return NextResponse.json({ error: 'No price selected' }, { status: 400 })
    }
    if (!userId) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: userEmail,
      // This is how we know which user paid — Stripe sends it back in the webhook
      metadata: { userId },
      subscription_data: {
        metadata: { userId }
      },
      success_url: `${siteUrl}/dashboard?subscribed=true`,
      cancel_url: `${siteUrl}/assessment`,
    })

    return NextResponse.json({ url: session.url })

  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}