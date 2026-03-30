import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const proposal = await prisma.proposal.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const copy = await prisma.proposal.create({
    data: {
      userId: session.user.id,
      title: `${proposal.title} (copy)`,
      clientName: proposal.clientName,
      clientEmail: proposal.clientEmail,
      jobBrief: proposal.jobBrief,
      content: proposal.content,
      totalAmount: proposal.totalAmount,
      currency: proposal.currency,
      validUntil: proposal.validUntil,
      status: "DRAFT",
    },
  });

  return NextResponse.json({ id: copy.id }, { status: 201 });
}
