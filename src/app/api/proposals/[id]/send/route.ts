import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, proposalSentEmail, APP_URL } from "@/lib/email";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { email, message } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Client email is required" }, { status: 400 });
  }

  const proposal = await prisma.proposal.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const portalUrl = `${APP_URL}/p/${proposal.publicToken}`;

  // Send email to client
  const emailData = proposalSentEmail({
    clientName: proposal.clientName,
    proposalTitle: proposal.title,
    portalUrl,
  });

  const html = message
    ? emailData.html.replace(
        "A proposal has been shared with you.",
        `A proposal has been shared with you.<br/><br/><em style="color:#555">${message}</em>`
      )
    : emailData.html;

  await sendEmail({ to: email, subject: emailData.subject, html });

  // Update proposal: store clientEmail and set sentAt + status SENT
  const updated = await prisma.proposal.update({
    where: { id },
    data: {
      clientEmail: email,
      status: "SENT",
    },
  });

  return NextResponse.json({ ok: true, status: updated.status });
}
