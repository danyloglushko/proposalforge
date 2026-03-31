import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, proposalSignedEmail, APP_URL } from "@/lib/email";

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
    include: {
      signature: true,
      user: {
        select: {
          email: true,
          profile: { select: { emailNotifications: true } },
        },
      },
    },
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

  // Send signed notification to freelancer (gated by emailNotifications setting)
  const emailNotifications = proposal.user?.profile?.emailNotifications ?? true;
  if (emailNotifications && proposal.user?.email) {
    const emailData = proposalSignedEmail({
      proposalTitle: proposal.title,
      signerName,
      dashboardUrl: `${APP_URL}/dashboard/proposals/${id}`,
    });
    await sendEmail({ to: proposal.user.email, ...emailData });
  }

  // Send confirmation to signer
  await sendEmail({
    to: signerEmail,
    subject: `You accepted: ${proposal.title}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;color:#111"><h1 style="font-size:22px">Proposal accepted</h1><p>Hi ${signerName},</p><p>You have successfully accepted the proposal <strong>${proposal.title}</strong>. A copy of this agreement has been recorded.</p><hr style="border:none;border-top:1px solid #eee;margin:24px 0"/><p style="color:#aaa;font-size:12px">ProposalForge</p></div>`,
  });

  return NextResponse.json(signature, { status: 201 });
}
