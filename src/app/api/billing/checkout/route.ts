import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe, createCheckoutSession, createStripeCustomer, PLANS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { PlanTier } from "@prisma/client";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tier } = (await req.json()) as { tier: PlanTier };
  const plan = PLANS[tier];

  if (!plan || tier === "FREE" || !plan.priceId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, stripeCustomerId: true, name: true, email: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Create Stripe customer if not already present
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await createStripeCustomer(
      user.email!,
      user.name ?? undefined
    );
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const checkoutSession = await createCheckoutSession({
    stripeCustomerId: customerId,
    priceId: plan.priceId,
    successUrl: `${appUrl}/dashboard?upgraded=true`,
    cancelUrl: `${appUrl}/pricing`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
