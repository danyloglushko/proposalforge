import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, getPlanByPriceId } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";
import { sendEmail, paymentReceivedEmail, APP_URL } from "@/lib/email";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  // Idempotency: skip already-processed events
  const existing = await prisma.billingEvent.findUnique({
    where: { stripeEventId: event.id },
  });
  if (existing) {
    return NextResponse.json({ received: true });
  }

  // Log the event
  await prisma.billingEvent.create({
    data: {
      stripeEventId: event.id,
      type: event.type,
      payload: JSON.parse(JSON.stringify(event)),
    },
  });

  try {
    switch (event.type) {
      // ─── Subscription lifecycle ──────────────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription") {
          await handleSubscriptionCheckoutCompleted(session);
        } else if (session.mode === "payment") {
          await handleProposalPaymentCompleted(session);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        // Unhandled event type — logged above, no action needed
        break;
    }
  } catch (err) {
    console.error(`Error processing webhook ${event.type}:`, err);
    return new NextResponse("Internal webhook processing error", { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

async function handleSubscriptionCheckoutCompleted(
  session: Stripe.Checkout.Session
) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const item = subscription.items.data[0];
  const priceId = item.price.id;
  const planTier = getPlanByPriceId(priceId) ?? "SOLO";
  const periodEnd = new Date(item.current_period_end * 1000);

  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      stripeCurrentPeriodEnd: periodEnd,
      planTier,
    },
  });
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId =
    invoice.parent?.type === "subscription_details"
      ? (invoice.parent.subscription_details?.subscription as string | undefined)
      : undefined;
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const item = subscription.items.data[0];
  const priceId = item.price.id;
  const planTier = getPlanByPriceId(priceId) ?? "SOLO";
  const periodEnd = new Date(item.current_period_end * 1000);

  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      stripePriceId: priceId,
      stripeCurrentPeriodEnd: periodEnd,
      planTier,
    },
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const item = subscription.items.data[0];
  const priceId = item.price.id;
  const planTier = getPlanByPriceId(priceId) ?? "SOLO";
  const periodEnd = new Date(item.current_period_end * 1000);

  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      stripePriceId: priceId,
      stripeCurrentPeriodEnd: periodEnd,
      planTier,
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
      planTier: "FREE",
    },
  });
}

async function handleProposalPaymentCompleted(
  session: Stripe.Checkout.Session
) {
  const proposalId = session.metadata?.proposalId;
  if (!proposalId) return;

  const paymentIntentId = session.payment_intent as string;

  await prisma.payment.updateMany({
    where: { proposalId },
    data: {
      stripePaymentIntentId: paymentIntentId,
      stripeCheckoutSessionId: session.id,
      status: PaymentStatus.PAID,
      paidAt: new Date(),
    },
  });

  const proposal = await prisma.proposal.update({
    where: { id: proposalId },
    data: { status: "PAID" },
    include: {
      user: { select: { email: true } },
      payment: { select: { amount: true, currency: true } },
    },
  });

  // Notify freelancer
  if (proposal.user?.email && proposal.payment) {
    const emailData = paymentReceivedEmail({
      to: proposal.user.email,
      proposalTitle: proposal.title,
      amount: proposal.payment.amount,
      currency: proposal.payment.currency,
      dashboardUrl: `${APP_URL}/dashboard/proposals/${proposalId}`,
    });
    await sendEmail({ to: proposal.user.email, ...emailData });
  }
}
