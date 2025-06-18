import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { 
      packageType, 
      agencyName, 
      agencyEmail, 
      agentCount 
    } = await request.json()

    // Validate required fields
    if (!packageType || !agencyName || !agencyEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get price IDs based on package type
    const priceIds = packageType === 'premium' ? {
      setup: process.env.STRIPE_PREMIUM_SETUP_PRICE_ID!,
      monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!
    } : {
      setup: process.env.STRIPE_ESSENTIAL_SETUP_PRICE_ID!,
      monthly: process.env.STRIPE_ESSENTIAL_MONTHLY_PRICE_ID!
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: agencyEmail,
      name: agencyName,
      metadata: {
        package_type: packageType,
        agent_count: agentCount?.toString() || '0',
        platform: 'veltrex'
      }
    })

    // Create checkout session with both setup fee and subscription
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        // Setup fee (one-time)
        {
          price: priceIds.setup,
          quantity: 1,
        },
        // Monthly subscription
        {
          price: priceIds.monthly,
          quantity: 1,
        }
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        agency_name: agencyName,
        package_type: packageType,
        agent_count: agentCount?.toString() || '0'
      },
      subscription_data: {
        metadata: {
          agency_name: agencyName,
          package_type: packageType,
          agent_count: agentCount?.toString() || '0'
        }
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true
      }
    })

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}