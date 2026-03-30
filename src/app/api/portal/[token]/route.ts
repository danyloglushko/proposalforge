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
      clientEmail: true,
      content: true,
      totalAmount: true,
      currency: true,
      validUntil: true,
      status: true,
      publicToken: true,
      viewedAt: true,
      viewCount: true,
      signature: {
        select: { signerName: true, signedAt: true },
      },
      payment: {
        select: { status: true, amount: true },
      },
      user: {
        select: {
          email: true,
          planTier: true,
          profile: {
            select: {
              emailNotifications: true,
              hidePoweredBy: true,
              logoUrl: true,
            },
          },
        },
      },
    },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  const userPlan = proposal.user?.planTier ?? "FREE";
  const isPro = userPlan === "PRO" || userPlan === "AGENCY";
  const emailNotifications = proposal.user?.profile?.emailNotifications ?? true;
  const isFirstView = !proposal.viewedAt;

  // Always increment view count and track timestamp
  const updateData: Record<string, unknown> = {
    viewCount: { increment: 1 },
    lastViewedAt: new Date(),
  };
  if (isFirstView) {
    updateData.viewedAt = new Date();
    updateData.status = "VIEWED";
  }

  await prisma.$transaction([
    prisma.proposal.update({
      where: { publicToken: token },
      data: updateData,
    }),
    prisma.proposalView.create({
      data: { proposalId: proposal.id },
    }),
  ]);

  // Send view email notification
  if (emailNotifications && proposal.user?.email) {
    // Free tier: only first view; Pro tier: every view
    const shouldNotify = isPro || isFirstView;
    if (shouldNotify) {
      const emailData = proposalViewedEmail({
        proposalTitle: proposal.title,
        clientName: proposal.clientName,
        dashboardUrl: `${APP_URL}/dashboard/proposals/${proposal.id}`,
      });
      await sendEmail({ to: proposal.user.email, ...emailData });
    }
  }

  // Send expiring soon reminder on first view if within 2 days of validUntil
  if (isFirstView && proposal.validUntil && proposal.status !== "ACCEPTED" && proposal.status !== "PAID") {
    const msUntilExpiry = new Date(proposal.validUntil).getTime() - Date.now();
    const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
    if (msUntilExpiry > 0 && msUntilExpiry <= twoDaysMs) {
      const { proposalExpiringSoonEmail } = await import("@/lib/email");
      if (proposal.clientEmail) {
        const expiring = proposalExpiringSoonEmail({
          clientName: proposal.clientName,
          proposalTitle: proposal.title,
          validUntil: new Date(proposal.validUntil),
          portalUrl: `${APP_URL}/p/${token}`,
        });
        await sendEmail({ to: proposal.clientEmail, ...expiring });
      }
    }
  }

  // Build branding info for the portal
  const branding = {
    logoUrl: proposal.user?.profile?.logoUrl ?? null,
    hidePoweredBy: isPro && (proposal.user?.profile?.hidePoweredBy ?? false),
  };

  // Return only public-safe fields
  return NextResponse.json({
    id: proposal.id,
    title: proposal.title,
    clientName: proposal.clientName,
    content: proposal.content,
    totalAmount: proposal.totalAmount,
    currency: proposal.currency,
    validUntil: proposal.validUntil,
    status: proposal.status,
    publicToken: proposal.publicToken,
    signature: proposal.signature,
    payment: proposal.payment,
    branding,
  });
}
