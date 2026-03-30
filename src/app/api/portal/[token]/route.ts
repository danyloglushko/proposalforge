import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — used by the client portal page
export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const proposal = await prisma.proposal.findUnique({
    where: { publicToken: token },
    select: {
      id: true,
      title: true,
      clientName: true,
      content: true,
      totalAmount: true,
      currency: true,
      validUntil: true,
      status: true,
      publicToken: true,
      signature: {
        select: { signerName: true, signedAt: true },
      },
      payment: {
        select: { status: true, amount: true },
      },
    },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  // Record view — increment count always, set viewedAt + status on first view
  await prisma.proposal.update({
    where: { publicToken: token },
    data: {
      viewCount: { increment: 1 },
      viewedAt: proposal.status === "DRAFT" || proposal.status === "SENT" ? new Date() : undefined,
      status: proposal.status === "DRAFT" || proposal.status === "SENT" ? "VIEWED" : undefined,
    },
  });

  return NextResponse.json(proposal);
}
