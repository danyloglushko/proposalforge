import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/stripe";
import { PlanTier } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const proposals = await prisma.proposal.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      signature: { select: { signedAt: true } },
      payment: { select: { status: true, amount: true } },
    },
  });

  return NextResponse.json(proposals);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check proposal limit for free tier
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      planTier: true,
      proposalsThisMonth: true,
      proposalMonthReset: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const plan = PLANS[user.planTier as PlanTier];
  const now = new Date();

  // Reset monthly counter if needed
  const resetDate = new Date(user.proposalMonthReset);
  const shouldReset =
    now.getMonth() !== resetDate.getMonth() ||
    now.getFullYear() !== resetDate.getFullYear();

  let proposalsThisMonth = user.proposalsThisMonth;
  if (shouldReset) {
    proposalsThisMonth = 0;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { proposalsThisMonth: 0, proposalMonthReset: now },
    });
  }

  if (plan.proposalsPerMonth !== -1 && proposalsThisMonth >= plan.proposalsPerMonth) {
    return NextResponse.json(
      {
        error: "Proposal limit reached",
        message: `Your ${plan.name} plan allows ${plan.proposalsPerMonth} proposals/month. Upgrade to continue.`,
      },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { title, clientName, clientEmail, jobBrief, totalAmount, currency, templateId } = body;

  const proposal = await prisma.proposal.create({
    data: {
      userId: session.user.id,
      title,
      clientName,
      clientEmail,
      jobBrief: jobBrief ?? "",
      content: body.content ?? "",
      totalAmount: totalAmount ? parseFloat(totalAmount) : null,
      currency: currency ?? "USD",
      templateId: templateId ?? null,
    },
  });

  // Increment monthly counter
  await prisma.user.update({
    where: { id: session.user.id },
    data: { proposalsThisMonth: { increment: 1 } },
  });

  return NextResponse.json(proposal, { status: 201 });
}
