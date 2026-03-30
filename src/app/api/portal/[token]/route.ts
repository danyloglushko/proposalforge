import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, proposalViewedEmail, APP_URL } from "@/lib/email";

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
      viewedAt: true,
      signature: {
        select: { signerName: true, signedAt: true },
      },
      payment: {
        select: { status: true, amount: true },
      },
      user: {
        select: { email: true },
      },
    },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  // Record first view and send notification
  if (!proposal.viewedAt) {
    await prisma.proposal.updateMany({
      where: { publicToken: token, viewedAt: null },
      data: { viewedAt: new Date(), status: "VIEWED" },
    });

    // Notify freelancer
    if (proposal.user?.email) {
      const emailData = proposalViewedEmail({
        proposalTitle: proposal.title,
        clientName: proposal.clientName,
        dashboardUrl: `${APP_URL}/dashboard/proposals/${proposal.id}`,
      });
      await sendEmail({ to: proposal.user.email, ...emailData });
    }

    // Send expiring soon reminder if within 2 days of validUntil
    if (proposal.validUntil && proposal.status !== "ACCEPTED" && proposal.status !== "PAID") {
      const msUntilExpiry = new Date(proposal.validUntil).getTime() - Date.now();
      const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
      if (msUntilExpiry > 0 && msUntilExpiry <= twoDaysMs) {
        const { proposalExpiringSoonEmail } = await import("@/lib/email");
        const expiring = proposalExpiringSoonEmail({
          clientName: proposal.clientName,
          proposalTitle: proposal.title,
          validUntil: new Date(proposal.validUntil),
          portalUrl: `${APP_URL}/p/${token}`,
        });
        // Find client email from proposal (clientEmail field via full query)
        const full = await prisma.proposal.findUnique({
          where: { publicToken: token },
          select: { clientEmail: true },
        });
        if (full?.clientEmail) {
          await sendEmail({ to: full.clientEmail, ...expiring });
        }
      }
    }
  }

  // Strip internal user data before returning
  const { user: _user, viewedAt: _viewedAt, ...publicData } = proposal;
  return NextResponse.json(publicData);
}
