import { Prisma } from "@prisma/client";
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

  const body = await req.json();
  const { title, clientName, clientEmail, jobBrief, totalAmount, currency, templateId } = body;

  try {
    const proposal = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.findUnique({
        where: { id: session.user.id },
        select: {
          planTier: true,
          proposalsThisMonth: true,
          proposalMonthReset: true,
        },
      });

      if (!user) throw Object.assign(new Error("User not found"), { status: 404 });

      const plan = PLANS[user.planTier as PlanTier];
      const now = new Date();

      // Reset monthly counter if the calendar month has changed
      const resetDate = new Date(user.proposalMonthReset);
      const shouldReset =
        now.getUTCMonth() !== resetDate.getUTCMonth() ||
        now.getUTCFullYear() !== resetDate.getUTCFullYear();

      let proposalsThisMonth = user.proposalsThisMonth;
      if (shouldReset) {
        proposalsThisMonth = 0;
        await tx.user.update({
          where: { id: session.user.id },
          data: { proposalsThisMonth: 0, proposalMonthReset: now },
        });
      }

      if (plan.proposalsPerMonth !== -1 && proposalsThisMonth >= plan.proposalsPerMonth) {
        throw Object.assign(
          new Error(
            `Your ${plan.name} plan allows ${plan.proposalsPerMonth} proposals/month. Upgrade to continue.`
          ),
          { status: 403, code: "LIMIT_REACHED" }
        );
      }

      // Create proposal and increment counter atomically
      const [newProposal] = await Promise.all([
        tx.proposal.create({
          data: {
            userId: session.user.id,
            title,
            clientName,
            clientEmail: clientEmail ?? null,
            jobBrief: jobBrief ?? "",
            content: body.content ?? "",
            totalAmount: totalAmount ? parseFloat(totalAmount) : null,
            currency: currency ?? "USD",
            templateId: templateId ?? null,
          },
        }),
        tx.user.update({
          where: { id: session.user.id },
          data: { proposalsThisMonth: { increment: 1 } },
        }),
      ]);

      return newProposal;
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (err: unknown) {
    const e = err as Error & { status?: number; code?: string };
    if (e.status === 404) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (e.code === "LIMIT_REACHED")
      return NextResponse.json(
        { error: "Proposal limit reached", message: e.message },
        { status: 403 }
      );
    throw err;
  }
}
