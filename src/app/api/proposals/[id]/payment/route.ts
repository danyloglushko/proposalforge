import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createProposalPaymentSession, PLANS } from "@/lib/stripe";
import { PaymentType, PlanTier } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const proposal = await prisma.proposal.findFirst({
    where: { id, userId: session.user.id },
    include: { payment: true },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Check if user's plan supports Stripe payments
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { planTier: true },
  });

  const plan = PLANS[user?.planTier as PlanTier ?? "FREE"];
  if (!plan.stripePayments) {
    return NextResponse.json(
      {
        error: "Stripe payment requests require the Pro or Agency plan",
        upgradeRequired: true,
      },
      { status: 403 }
    );
  }

  const { type = "DEPOSIT", depositPercent = 50 } = await req.json();

  if (!proposal.totalAmount) {
    return NextResponse.json(
      { error: "Proposal must have a total amount set before requesting payment" },
      { status: 400 }
    );
  }

  const amount =
    type === PaymentType.DEPOSIT
      ? Math.round((proposal.totalAmount * depositPercent) / 100) * 100
      : Math.round(proposal.totalAmount * 100);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const checkoutSession = await createProposalPaymentSession({
    proposalId: id,
    amount,
    currency: proposal.currency.toLowerCase(),
    description: `${type === PaymentType.DEPOSIT ? `${depositPercent}% deposit` : "Full payment"} — ${proposal.title}`,
    clientEmail: proposal.clientEmail ?? undefined,
    successUrl: `${appUrl}/p/${proposal.publicToken}?payment=success`,
    cancelUrl: `${appUrl}/p/${proposal.publicToken}`,
  });

  // Create or update the payment record
  if (proposal.payment) {
    await prisma.payment.update({
      where: { proposalId: id },
      data: {
        stripeCheckoutSessionId: checkoutSession.id,
        amount: amount / 100,
        type: type as PaymentType,
        status: "PENDING",
      },
    });
  } else {
    await prisma.payment.create({
      data: {
        proposalId: id,
        stripeCheckoutSessionId: checkoutSession.id,
        amount: amount / 100,
        type: type as PaymentType,
        status: "PENDING",
      },
    });
  }

  return NextResponse.json({ url: checkoutSession.url });
}
