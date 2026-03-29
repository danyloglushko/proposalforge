"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";

interface Proposal {
  id: string;
  title: string;
  clientName: string;
  content: string;
  totalAmount: number | null;
  currency: string;
  validUntil: string | null;
  status: string;
  signature: { signerName: string; signedAt: string } | null;
  payment: { status: string; amount: number } | null;
  publicToken: string;
}

export default function ClientPortalPage() {
  const { token } = useParams() as { token: string };
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get("payment") === "success";

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    fetch(`/api/portal/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setProposal(data);
      })
      .catch(() => setError("Failed to load proposal"))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSign(e: React.FormEvent) {
    e.preventDefault();
    if (!proposal) return;
    setSigning(true);
    try {
      const res = await fetch(`/api/proposals/${proposal.id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signerName,
          signerEmail,
          publicToken: token,
        }),
      });
      if (res.ok) {
        setSigned(true);
        setProposal((p) =>
          p
            ? {
                ...p,
                status: "ACCEPTED",
                signature: { signerName, signedAt: new Date().toISOString() },
              }
            : p
        );
      } else {
        const data = await res.json();
        setError(data.error ?? "Failed to sign");
      }
    } finally {
      setSigning(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">{error ?? "Proposal not found"}</p>
      </div>
    );
  }

  const isSigned = !!proposal.signature || signed;
  const isPaid = proposal.payment?.status === "PAID";
  const isDeclined = proposal.status === "DECLINED";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-indigo-600">ProposalForge</span>
        {proposal.status && (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isSigned || isPaid
                ? "bg-green-100 text-green-700"
                : isDeclined
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {isPaid ? "Paid" : isSigned ? "Accepted" : isDeclined ? "Declined" : "Awaiting Review"}
          </span>
        )}
      </div>

      <div id="top" className="max-w-3xl mx-auto px-6 pb-32 pt-12 space-y-8">
        {paymentSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
            Payment received — thank you!
          </div>
        )}

        {/* Proposal content */}
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{proposal.title}</h1>
          <p className="text-gray-500 text-sm">Prepared for {proposal.clientName}</p>
          {proposal.validUntil && (
            <p className="text-xs text-amber-600 font-medium mt-1 mb-4">
              Valid until {new Date(proposal.validUntil).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          )}

          {proposal.totalAmount && (
            <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-indigo-600 font-medium">Total Investment</p>
              <p className="text-2xl font-bold text-indigo-900">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: proposal.currency,
                }).format(proposal.totalAmount)}
              </p>
            </div>
          )}

          <div className="prose prose-gray max-w-none">
            <ReactMarkdown>{proposal.content}</ReactMarkdown>
          </div>
        </div>

        {/* E-signature block */}
        {!isSigned && !isDeclined && (
          <div id="accept-proposal" className="bg-white rounded-xl shadow-sm border p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Accept This Proposal
            </h2>
            <form onSubmit={handleSign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="jane@company.com"
                />
              </div>
              <p className="text-xs text-gray-500">
                By clicking &ldquo;Accept Proposal&rdquo; you confirm acceptance of the
                terms outlined above. This constitutes a legally binding agreement.
              </p>
              <button
                type="submit"
                disabled={signing}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {signing ? "Processing..." : "Accept Proposal"}
              </button>
            </form>
          </div>
        )}

        {isSigned && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-green-900">Proposal Accepted</h3>
            <p className="text-sm text-green-700">
              Signed by <strong>{proposal.signature?.signerName}</strong> on{" "}
              {proposal.signature?.signedAt
                ? new Date(proposal.signature.signedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                : "today"}
            </p>
            <p className="text-xs text-green-600">A copy of this agreement has been recorded.</p>
          </div>
        )}
      </div>

      {/* Sticky Accept CTA */}
      {!isSigned && !isDeclined && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t shadow-lg px-6 py-4 flex items-center justify-between z-10">
          <div>
            {proposal.totalAmount && (
              <p className="text-sm font-semibold text-gray-900">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: proposal.currency }).format(proposal.totalAmount)}
              </p>
            )}
            <p className="text-xs text-gray-500">Scroll to review, then accept below</p>
          </div>
          <a href="#accept-proposal" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
            Accept Proposal
          </a>
        </div>
      )}
    </div>
  );
}
