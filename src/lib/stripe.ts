import Stripe from "stripe";
import { PlanTier } from "@prisma/client";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-03-25.dahlia",
      typescript: true,
    });
  }
  return _stripe;
}

// Keep backward-compatible named export for places that import `stripe` directly
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// ─── Plan definitions ─────────────────────────────────────────────────────────

export const PLANS: Record<
  PlanTier,
  {
    name: string;
    price: number; // USD per month
    priceId: string | null; // Stripe price ID (null = free)
    proposalsPerMonth: number; // -1 = unlimited
    features: string[];
    stripePayments: boolean;
    portalBranding: boolean;
    seats: number;
  }
> = {
  FREE: {
    name: "Free",
    price: 0,
    priceId: null,
    proposalsPerMonth: 3,
    features: ["3 proposals/month", "AI generation", "Client portal", "E-signature"],
    stripePayments: false,
    portalBranding: false,
    seats: 1,
  },
  SOLO: {
    name: "Solo",
    price: 39,
    priceId: process.env.STRIPE_SOLO_PRICE_ID ?? null,
    proposalsPerMonth: -1,
    features: [
      "Unlimited proposals",
      "AI generation",
      "Client portal",
      "E-signature",
      "1 user",
    ],
    stripePayments: false,
    portalBranding: false,
    seats: 1,
  },
  PRO: {
    name: "Pro",
    price: 79,
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
    proposalsPerMonth: -1,
    features: [
      "Everything in Solo",
      "Stripe payment requests",
      "Portal branding",
      "Analytics",
    ],
    stripePayments: true,
    portalBranding: true,
    seats: 1,
  },
  AGENCY: {
    name: "Agency",
    price: 149,
    priceId: process.env.STRIPE_AGENCY_PRICE_ID ?? null,
    proposalsPerMonth: -1,
    features: [
      "Everything in Pro",
      "5 seats",
      "White-label client portal",
      "Priority support",
    ],
    stripePayments: true,
    portalBranding: true,
    seats: 5,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getPlanByPriceId(priceId: string): PlanTier | null {
  for (const [tier, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) return tier as PlanTier;
  }
  return null;
}

export async function createStripeCustomer(email: string, name?: string) {
  return stripe.customers.create({ email, name });
}

/**
 * Create a Stripe Checkout session for subscription upgrade.
 */
export async function createCheckoutSession({
  stripeCustomerId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  stripeCustomerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  return stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: 14,
    },
  });
}

/**
 * Create a Stripe Billing Portal session for subscription management.
 */
export async function createBillingPortalSession({
  stripeCustomerId,
  returnUrl,
}: {
  stripeCustomerId: string;
  returnUrl: string;
}) {
  return stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });
}

/**
 * Create a one-time payment checkout for proposal deposit/full payment.
 */
export async function createProposalPaymentSession({
  proposalId,
  amount,
  currency = "usd",
  description,
  clientEmail,
  successUrl,
  cancelUrl,
  metadata,
}: {
  proposalId: string;
  amount: number; // in cents
  currency?: string;
  description: string;
  clientEmail?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  return stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: clientEmail,
    line_items: [
      {
        price_data: {
          currency,
          unit_amount: amount,
          product_data: {
            name: description,
          },
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      proposalId,
      ...metadata,
    },
  });
}
