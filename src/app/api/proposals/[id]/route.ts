import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
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
    include: {
      signature: true,
      payment: true,
      template: { select: { name: true, category: true } },
    },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(proposal);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const proposal = await prisma.proposal.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const allowed = [
    "title",
    "clientName",
    "clientEmail",
    "content",
    "totalAmount",
    "currency",
    "validUntil",
    "status",
  ];

  const updateData: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updateData[key] = body[key];
  }

  // Mark as sent and set sentAt if status changed to SENT
  if (body.status === "SENT" && proposal.status === "DRAFT") {
    updateData.status = "SENT";
  }

  const updated = await prisma.proposal.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
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

  await prisma.proposal.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}
