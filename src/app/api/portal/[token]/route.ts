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

  // Record view
  await prisma.proposal.updateMany({
    where: { publicToken: token, viewedAt: null },
    data: { viewedAt: new Date(), status: "VIEWED" },
  });

  return NextResponse.json(proposal);
}
