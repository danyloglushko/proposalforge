"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProposalDocument from "@/components/ProposalDocument";
import type { ProposalStructure } from "@/types/proposal";

const CATEGORIES = [
  "DEVELOPMENT",
  "DESIGN",
  "MARKETING",
  "CONSULTING",
  "COPYWRITING",
  "SEO",
  "VIDEO",
  "PHOTOGRAPHY",
  "GENERAL",
];

export default function NewProposalPage() {
  const router = useRouter();
  const [step, setStep] = useState<"brief" | "preview">("brief");
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [jobBrief, setJobBrief] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [totalAmount, setTotalAmount] = useState("");
  const [proposal, setProposal] = useState<ProposalStructure | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!jobBrief.trim() || jobBrief.length < 20) {
      setError("Please provide a job brief of at least 20 characters.");
      return;
    }
    setError(null);
    setGenerating(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobBrief, clientName, templateCategory: category }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Generation failed");
        return;
      }

      setProposal(data.proposal as ProposalStructure);
      setStep("preview");
    } catch {
      setError("Failed to generate proposal. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!title || !clientName || !proposal) {
      setError("Title, client name, and proposal content are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          clientName,
          clientEmail,
          jobBrief,
          content: proposal,
          totalAmount: totalAmount ? parseFloat(totalAmount) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? data.error ?? "Failed to save");
        return;
      }

      const saved = await res.json();
      router.push(`/dashboard/proposals/${saved.id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <a href="/dashboard" className="text-xl font-bold text-indigo-600">
          ProposalForge
        </a>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600">New Proposal</span>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center gap-2 text-sm">
          <div
            className={`flex items-center gap-1.5 ${
              step === "brief" ? "text-indigo-600 font-medium" : "text-gray-400"
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === "preview" ? "bg-green-500 text-white" : "bg-indigo-600 text-white"
              }`}
            >
              {step === "preview" ? "✓" : "1"}
            </span>
            Project Brief
          </div>
          <span className="text-gray-300 mx-1">—</span>
          <div
            className={`flex items-center gap-1.5 ${
              step === "preview" ? "text-indigo-600 font-medium" : "text-gray-400"
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === "preview" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              2
            </span>
            Preview &amp; Save
          </div>
        </div>

        {/* Step 1: Brief */}
        {step === "brief" && (
          <form
            onSubmit={handleGenerate}
            className="bg-white rounded-xl border shadow-sm p-8 space-y-5"
          >
            <h1 className="text-xl font-semibold text-gray-900">Create a Proposal</h1>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proposal Title *
                </label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. E-commerce Website Build"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0) + c.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name *
                </label>
                <input
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Acme Inc."
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Email
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@acme.com"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Brief *{" "}
                <span className="text-gray-400 font-normal">
                  — paste the job description or describe what&apos;s needed
                </span>
              </label>
              <textarea
                required
                minLength={20}
                rows={6}
                value={jobBrief}
                onChange={(e) => setJobBrief(e.target.value)}
                placeholder="e.g. We need a full-stack developer to build a customer portal for our SaaS app..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                {jobBrief.length} chars — more detail = better proposal
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Value (USD)
              </label>
              <input
                type="number"
                min={0}
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="5000"
                className="w-48 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {generating ? "Generating proposal…" : "Generate Proposal with AI →"}
            </button>
          </form>
        )}

        {/* Step 2: Preview */}
        {step === "preview" && proposal && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Preview</h1>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  AI-generated — review before saving
                </span>
              </div>
              <ProposalDocument proposal={proposal} />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("brief")}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                ← Regenerate
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {saving ? "Saving…" : "Save Proposal"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
