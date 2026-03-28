import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — no auth required (client portal)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { signerName, signerEmail, publicToken } = await req.json();

  if (!signerName || !signerEmail || !publicToken) {
    return NextResponse.json(
      { error: "signerName, signerEmail, and publicToken are required" },
      { status: 400 }
    );
  }

  // Verify public token matches
  const proposal = await prisma.proposal.findFirst({
    where: { id, publicToken },
    include: { signature: true },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found or invalid token" }, { status: 404 });
  }

  if (proposal.status === "DECLINED") {
    return NextResponse.json({ error: "Proposal has been declined" }, { status: 409 });
  }

  if (proposal.signature) {
    return NextResponse.json({ error: "Already signed" }, { status: 409 });
  }

  const ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const userAgent = req.headers.get("user-agent") ?? "unknown";

  // Create signature and update proposal status
  const [signature] = await prisma.$transaction([
    prisma.signature.create({
      data: {
        proposalId: id,
        signerName,
        signerEmail,
        ipAddress,
        userAgent,
      },
    }),
    prisma.proposal.update({
      where: { id },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    }),
  ]);

  return NextResponse.json(signature, { status: 201 });
}
