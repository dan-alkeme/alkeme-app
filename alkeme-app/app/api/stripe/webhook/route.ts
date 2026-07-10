import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any
})

// Admin client — can update any profile (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle successful checkout
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    const customerId = session.customer as string

    if (userId) {
      // Determine plan from the amount or line items
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
      const priceId = lineItems.data[0]?.price?.id
      const plan = priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_QUARTERLY
        ? 'quarterly' : 'monthly'

      await supabaseAdmin
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_plan: plan,
          stripe_customer_id: customerId
        })
        .eq('id', userId)

      console.log(`✅ User ${userId} is now an active subscriber (${plan})`)
    }
  }

  // Handle subscription cancellation
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const userId = subscription.metadata?.userId

    if (userId) {
      await supabaseAdmin
        .from('profiles')
        .update({ subscription_status: 'free', subscription_plan: null })
        .eq('id', userId)

      console.log(`User ${userId} subscription cancelled`)
    }
  }

  return NextResponse.json({ received: true })
}