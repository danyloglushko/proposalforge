import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "ProposalForge <noreply@proposalforge.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "");
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    if (!process.env.RESEND_API_KEY) return;
    await getResend().emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("[email] failed to send:", err);
  }
}

// ─── Email templates ──────────────────────────────────────────────────────────

export function proposalSentEmail({
  clientName,
  proposalTitle,
  portalUrl,
}: {
  clientName: string;
  proposalTitle: string;
  portalUrl: string;
}) {
  return {
    subject: `Proposal ready for you: ${proposalTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;color:#111">
        <h1 style="font-size:22px;margin-bottom:8px">Your proposal is ready</h1>
        <p style="color:#555">Hi ${clientName},</p>
        <p style="color:#555">A proposal has been shared with you. Click the button below to review and accept it.</p>
        <a href="${portalUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">Review Proposal</a>
        <p style="color:#888;font-size:13px">Or copy this link: ${portalUrl}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="color:#aaa;font-size:12px">Sent via ProposalForge</p>
      </div>`,
  };
}

export function proposalViewedEmail({
  proposalTitle,
  clientName,
  dashboardUrl,
}: {
  proposalTitle: string;
  clientName: string;
  dashboardUrl: string;
}) {
  return {
    subject: `${clientName} viewed your proposal`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;color:#111">
        <h1 style="font-size:22px;margin-bottom:8px">Proposal viewed</h1>
        <p style="color:#555"><strong>${clientName}</strong> just opened your proposal <em>${proposalTitle}</em>.</p>
        <a href="${dashboardUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">View in Dashboard</a>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="color:#aaa;font-size:12px">ProposalForge</p>
      </div>`,
  };
}

export function proposalSignedEmail({
  proposalTitle,
  signerName,
  dashboardUrl,
}: {
  to?: string;
  proposalTitle: string;
  signerName: string;
  dashboardUrl: string;
}) {
  return {
    subject: `Proposal accepted: ${proposalTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;color:#111">
        <h1 style="font-size:22px;margin-bottom:8px">Proposal accepted</h1>
        <p style="color:#555"><strong>${signerName}</strong> has accepted the proposal <em>${proposalTitle}</em>.</p>
        <a href="${dashboardUrl}" style="display:inline-block;background:#059669;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">View in Dashboard</a>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="color:#aaa;font-size:12px">ProposalForge</p>
      </div>`,
  };
}

export function paymentReceivedEmail({
  proposalTitle,
  amount,
  currency,
  dashboardUrl,
}: {
  to?: string;
  proposalTitle: string;
  amount: number;
  currency: string;
  dashboardUrl: string;
}) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);

  return {
    subject: `Payment received: ${formatted} for ${proposalTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;color:#111">
        <h1 style="font-size:22px;margin-bottom:8px">Payment received</h1>
        <p style="color:#555">You received a payment of <strong>${formatted}</strong> for <em>${proposalTitle}</em>.</p>
        <a href="${dashboardUrl}" style="display:inline-block;background:#059669;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">View in Dashboard</a>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="color:#aaa;font-size:12px">ProposalForge</p>
      </div>`,
  };
}

export function proposalExpiringSoonEmail({
  clientName,
  proposalTitle,
  validUntil,
  portalUrl,
}: {
  clientName: string;
  proposalTitle: string;
  validUntil: Date;
  portalUrl: string;
}) {
  const dateStr = validUntil.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return {
    subject: `Reminder: proposal expires ${dateStr}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;color:#111">
        <h1 style="font-size:22px;margin-bottom:8px">Proposal expiring soon</h1>
        <p style="color:#555">Hi ${clientName},</p>
        <p style="color:#555">The proposal <em>${proposalTitle}</em> expires on <strong>${dateStr}</strong>. Please review and accept it before then.</p>
        <a href="${portalUrl}" style="display:inline-block;background:#d97706;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">Review Proposal</a>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="color:#aaa;font-size:12px">ProposalForge</p>
      </div>`,
  };
}

export { APP_URL };
