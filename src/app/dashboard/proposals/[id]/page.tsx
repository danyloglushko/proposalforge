"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProposalDocument from "@/components/ProposalDocument";
import type { ProposalStructure } from "@/types/proposal";

interface Proposal {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string | null;
  content: ProposalStructure;
  status: string;
  totalAmount: number | null;
  currency: string;
  publicToken: string;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
  signature: { signerName: string; signerEmail: string; signedAt: string } | null;
  payment: { status: string; amount: number; type: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SENT: "bg-blue-100 text-blue-700",
  VIEWED: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-green-100 text-green-700",
  PAID: "bg-emerald-100 text-emerald-700",
  DECLINED: "bg-red-100 text-red-700",
};

export default function ProposalDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [requestingPayment, setRequestingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendEmail, setSendEmail] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/proposals/${id}`)
      .then((r) => r.json())
      .then(setProposal)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleMarkSent() {
    const res = await fetch(`/api/proposals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "SENT" }),
    });
    if (res.ok) setProposal((p) => p ? { ...p, status: "SENT" } : p);
  }

  async function handleCopyLink() {
    if (!proposal) return;
    const url = `${window.location.origin}/p/${proposal.publicToken}`;
    await navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  }

  async function handleDuplicate() {
    setDuplicating(true);
    const res = await fetch(`/api/proposals/${id}/duplicate`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      router.push(`/dashboard/proposals/${data.id}`);
    }
    setDuplicating(false);
  }

  async function handleSendToClient(e: React.FormEvent) {
    e.preventDefault();
    if (!proposal) return;
    setSending(true);
    setSendError(null);
    const res = await fetch(`/api/proposals/${id}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: sendEmail, message: sendMessage }),
    });
    const data = await res.json();
    if (res.ok) {
      setProposal((p) => p ? { ...p, status: data.status, sentAt: new Date().toISOString(), clientEmail: sendEmail } : p);
      setShowSendModal(false);
      setSendEmail("");
      setSendMessage("");
    } else {
      setSendError(data.error ?? "Failed to send");
    }
    setSending(false);
  }

  async function handleRequestPayment(type: "DEPOSIT" | "FULL") {
    setRequestingPayment(true);
    setPaymentError(null);
    const res = await fetch(`/api/proposals/${id}/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, depositPercent: 50 }),
    });
    const data = await res.json();
    if (res.ok && data.url) {
      window.location.href = data.url;
    } else {
      setPaymentError(data.error ?? "Failed to create payment link");
      setRequestingPayment(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Proposal not found.</p>
      </div>
    );
  }

  const portalUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/p/${proposal.publicToken}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Send to Client Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Send to Client</h2>
            <form onSubmit={handleSendToClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Email *
                </label>
                <input
                  type="email"
                  required
                  value={sendEmail}
                  onChange={(e) => setSendEmail(e.target.value)}
                  placeholder="client@company.com"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Message (optional)
                </label>
                <textarea
                  rows={3}
                  value={sendMessage}
                  onChange={(e) => setSendMessage(e.target.value)}
                  placeholder="Hi, please review the attached proposal..."
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              {sendError && (
                <p className="text-sm text-red-600">{sendError}</p>
              )}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  {sending ? "Sending…" : "Send Proposal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <nav className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
          ProposalForge
        </Link>
        <span className="text-gray-300">/</span>
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 text-sm">
          Dashboard
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600 text-sm">{proposal.title}</span>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{proposal.title}</h1>
            <p className="text-gray-500 mt-1">
              {proposal.clientName}
              {proposal.clientEmail && ` · ${proposal.clientEmail}`}
            </p>
          </div>
          <span
            className={`mt-1 px-3 py-1 rounded-full text-sm font-medium ${
              STATUS_COLORS[proposal.status] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {proposal.status}
          </span>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap gap-3">
          {(proposal.status === "DRAFT" || proposal.status === "SENT") && (
            <button
              onClick={() => {
                setSendEmail(proposal.clientEmail ?? "");
                setShowSendModal(true);
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              {proposal.sentAt ? "Resend to Client" : "Send to Client"}
            </button>
          )}
          {proposal.status === "DRAFT" && (
            <button
              onClick={handleMarkSent}
              className="border border-indigo-300 text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition"
            >
              Mark as Sent
            </button>
          )}
          <button
            onClick={handleCopyLink}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            {copySuccess ? "Copied!" : "Copy Client Link"}
          </button>
          <a
            href={portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            Preview ↗
          </a>
          <a
            href={`/api/proposals/${id}/export`}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            Download DOCX
          </a>
          <button
            onClick={handleDuplicate}
            disabled={duplicating}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition"
          >
            {duplicating ? "Duplicating…" : "Duplicate"}
          </button>
          {["ACCEPTED"].includes(proposal.status) && !proposal.payment && (
            <>
              <button
                onClick={() => handleRequestPayment("DEPOSIT")}
                disabled={requestingPayment}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                Request 50% Deposit
              </button>
              <button
                onClick={() => handleRequestPayment("FULL")}
                disabled={requestingPayment}
                className="border border-emerald-600 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-50 disabled:opacity-50 transition"
              >
                Request Full Payment
              </button>
            </>
          )}
        </div>

        {paymentError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {paymentError}
            {paymentError.includes("Pro") && (
              <Link href="/pricing" className="ml-2 underline font-medium">
                Upgrade plan →
              </Link>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {/* Proposal content */}
          <div className="col-span-2 bg-white rounded-xl border shadow-sm p-8">
            <ProposalDocument proposal={proposal.content} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Details */}
            <div className="bg-white rounded-xl border shadow-sm p-5 space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm">Details</h3>
              <div className="text-sm space-y-2 text-gray-600">
                {proposal.totalAmount && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Value</p>
                    <p className="font-medium text-gray-900">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: proposal.currency,
                      }).format(proposal.totalAmount)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Created</p>
                  <p>{new Date(proposal.createdAt).toLocaleDateString()}</p>
                </div>
                {proposal.sentAt && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Sent</p>
                    <p>{new Date(proposal.sentAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Signature */}
            {proposal.signature && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-1">
                <h3 className="font-semibold text-green-900 text-sm">✓ Signed</h3>
                <p className="text-sm text-green-800">{proposal.signature.signerName}</p>
                <p className="text-xs text-green-600">{proposal.signature.signerEmail}</p>
                <p className="text-xs text-green-600">
                  {new Date(proposal.signature.signedAt).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Payment */}
            {proposal.payment && (
              <div
                className={`rounded-xl border p-5 space-y-1 ${
                  proposal.payment.status === "PAID"
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <h3
                  className={`font-semibold text-sm ${
                    proposal.payment.status === "PAID"
                      ? "text-emerald-900"
                      : "text-yellow-900"
                  }`}
                >
                  {proposal.payment.status === "PAID" ? "✓ Paid" : "⏳ Payment Pending"}
                </h3>
                <p
                  className={`text-sm ${
                    proposal.payment.status === "PAID"
                      ? "text-emerald-800"
                      : "text-yellow-800"
                  }`}
                >
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: proposal.currency,
                  }).format(proposal.payment.amount)}{" "}
                  ({proposal.payment.type.toLowerCase()})
                </p>
              </div>
            )}

            {/* Client link */}
            <div className="bg-white rounded-xl border shadow-sm p-5 space-y-2">
              <h3 className="font-semibold text-gray-900 text-sm">Client Portal Link</h3>
              <p className="text-xs text-gray-500 break-all">{portalUrl}</p>
              <button
                onClick={handleCopyLink}
                className="w-full text-center text-sm text-indigo-600 hover:underline"
              >
                {copySuccess ? "Copied!" : "Copy link"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
